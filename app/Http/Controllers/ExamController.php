<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\ClassSubject;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswer;
use App\Models\ExamQuestion;
use App\Support\AttemptScoreCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Carbon\Carbon;

class ExamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('exams index');

        $query = Exam::with(['subject', 'schoolClass', 'teacher']);

        if (auth()->user()->hasRole('siswa')) {
            $query->whereHas('schoolClass.enrollments', function ($q) {
                $q->where('student_id', auth()->id());
            });
        }

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by class
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filter by teacher (for teachers, only show their exams)
        if (auth()->user()->hasRole('guru')) {
            $query->whereHas('classSubject', function($q) {
                $q->forTeacher(auth()->user());
            });
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'scheduled':
                    $query->where('scheduled_date', '>', now());
                    break;
                case 'ongoing':
                    $query->where('scheduled_date', '<=', now())
                          ->whereRaw('DATE_ADD(scheduled_date, INTERVAL duration_minutes MINUTE) > ?', [now()]);
                    break;
                case 'completed':
                    $query->whereRaw('DATE_ADD(scheduled_date, INTERVAL duration_minutes MINUTE) <= ?', [now()]);
                    break;
                case 'cancelled':
                    $query->where('is_cancelled', true);
                    break;
            }
        }

        // Search by title or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $exams = $query->latest()->paginate(15);

        if (auth()->user()->hasRole('guru')) {
            $subjects = Subject::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            $classes = SchoolClass::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->distinct()->get();
        } elseif (auth()->user()->hasRole('siswa')) {
            $classes = auth()->user()->enrolledClasses()->with('classSubjects')->where('is_active', true)->get();
            $subjectIds = $classes->flatMap(fn ($c) => $c->classSubjects->pluck('subject_id'))->unique()->filter();
            $subjects = $subjectIds->isEmpty()
                ? collect()
                : Subject::whereIn('id', $subjectIds)->where('is_active', true)->get();
        } else {
            $subjects = Subject::where('is_active', true)->get();
            $classes = SchoolClass::where('is_active', true)->get();
        }

        return Inertia::render('Exams/Index', [
            'exams' => $exams,
            'subjects' => $subjects,
            'classes' => $classes,
            'filters' => $request->only(['subject_id', 'class_id', 'search', 'type', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Gate::authorize('exams create');

        // Teachers can only access subjects and classes they teach
        if (auth()->user()->hasRole('guru')) {
            // Get only subjects where the teacher is assigned
            $subjects = Subject::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            // Get only classes where the teacher teaches
            $classes = SchoolClass::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->distinct()->get();
        } else {
            // Admin can see all subjects and classes
            $subjects = Subject::where('is_active', true)->get();
            $classes = SchoolClass::where('is_active', true)->get();
        }

        $selectedClassId = null;
        $selectedSubjectId = null;

        if ($request->filled('class_subject_id')) {
            $classSubject = ClassSubject::with('schoolClass', 'subject')->find($request->class_subject_id);
            if ($classSubject) {
                $selectedClassId = $classSubject->class_id;
                $selectedSubjectId = $classSubject->subject_id;
            }
        } else {
            $selectedClassId = $request->class_id;
            $selectedSubjectId = $request->subject_id;
        }

        return Inertia::render('Exams/Create', [
            'subjects' => $subjects,
            'classes' => $classes,
            'selectedClassId' => $selectedClassId,
            'selectedSubjectId' => $selectedSubjectId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('exams create');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'type' => 'required|in:midterm,final,quiz,practice',
            'scheduled_date' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:30|max:240',
            'total_questions' => 'required|integer|min:1|max:100',
            'passing_score' => 'required|numeric|min:0|max:100',
            'instructions' => 'nullable|string',
            'rules' => 'nullable|string',
            'requires_supervision' => 'boolean',
            'allow_review' => 'boolean',
            'max_attempts' => 'required|integer|min:1|max:3',
        ]);

        // Find the class_subject based on class_id and subject_id
        $classSubject = ClassSubject::where('class_id', $validated['class_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (!$classSubject) {
            return back()->withErrors(['subject_id' => 'Mata pelajaran tidak ditemukan untuk kelas ini.']);
        }

        $this->authorizeClassSubjectSlotTeacher($classSubject);

        $examType = match ($validated['type']) {
            'midterm' => 'mid_term',
            'final' => 'final',
            'quiz' => 'quiz',
            'practice' => 'practice',
            default => 'quiz',
        };

        $exam = Exam::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'rules' => $validated['rules'] ?? null,
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'exam_type' => $examType,
            'scheduled_date' => $validated['scheduled_date'],
            'duration_minutes' => $validated['duration_minutes'],
            'total_questions' => $validated['total_questions'],
            'passing_marks' => $validated['passing_score'],
            'total_marks' => 100,
            'max_attempts' => $validated['max_attempts'],
            'requires_supervision' => $request->boolean('requires_supervision'),
            'allow_review' => $request->boolean('allow_review'),
            'created_by' => auth()->id(),
            'is_active' => true,
        ]);

        return redirect()->route('exams.show', $exam)
            ->with('success', 'Ujian berhasil dibuat. Sekarang tambahkan soal-soal.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Exam $exam)
    {
        Gate::authorize('view', $exam);

        $load = [
            'subject',
            'schoolClass',
            'teacher',
            'creator',
            'questions' => fn ($q) => $q->orderBy('order'),
        ];
        if (auth()->user()->can('exams view') && !auth()->user()->hasRole('siswa')) {
            $load[] = 'schoolClass.students';
        }
        $exam->load($load);
        $exam->loadMissing('classSubject');

        // Load attempts for teachers and admins
        if (auth()->user()->can('exams view') && !auth()->user()->hasRole('siswa')) {
            $attempts = $exam->attempts()
                ->with(['student', 'answers.question'])
                ->orderBy('started_at', 'desc')
                ->get();
            $hasEssay = $exam->questions->contains(fn ($q) => $q->question_type === 'essay');
            $attempts = $attempts->map(function ($a) use ($hasEssay) {
                $pending = $hasEssay
                    && $a->finished_at
                    && $a->answers->contains(
                        fn ($ans) => $ans->question?->question_type === 'essay'
                            && $ans->points_awarded === null
                    );

                return array_merge($a->toArray(), [
                    'essay_grading_pending' => (bool) $pending,
                ]);
            });
        } else {
            // For students, only show their own attempts
            $attempts = $exam->attempts()
                ->where('student_id', auth()->id())
                ->with('student')
                ->get();
        }

        $cs = $exam->classSubject;
        $canManageExam = auth()->user()->hasRole('admin')
            || ($cs && $cs->isAssignedSlotTeacher(auth()->user()));

        return Inertia::render('Exams/Show', [
            'exam' => $exam,
            'attempts' => $attempts ?? [],
            'canManageExam' => $canManageExam,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Exam $exam)
    {
        Gate::authorize('update', $exam);

        // Teachers can only edit exams for subjects they teach
        if (auth()->user()->hasRole('guru')) {
            $subjects = Subject::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            $classes = SchoolClass::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->distinct()->get();
        } else {
            $subjects = Subject::where('is_active', true)->get();
            $classes = SchoolClass::where('is_active', true)->get();
        }

        return Inertia::render('Exams/Edit', [
            'exam' => $exam,
            'subjects' => $subjects,
            'classes' => $classes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Exam $exam)
    {
        Gate::authorize('update', $exam);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'type' => 'required|in:midterm,final,quiz,practice',
            'scheduled_date' => 'required|date',
            'duration_minutes' => 'required|integer|min:30|max:240',
            'total_questions' => 'required|integer|min:1|max:100',
            'passing_score' => 'required|numeric|min:0|max:100',
            'instructions' => 'nullable|string',
            'rules' => 'nullable|string',
            'requires_supervision' => 'boolean',
            'allow_review' => 'boolean',
            'max_attempts' => 'required|integer|min:1|max:3',
        ]);

        $classSubject = ClassSubject::where('class_id', $validated['class_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (! $classSubject) {
            return back()->withErrors(['subject_id' => 'Mata pelajaran tidak ditemukan untuk kelas ini.']);
        }

        $this->authorizeClassSubjectSlotTeacher($classSubject);

        $examType = match ($validated['type']) {
            'midterm' => 'mid_term',
            'final' => 'final',
            'quiz' => 'quiz',
            'practice' => 'practice',
            default => 'quiz',
        };

        $exam->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'rules' => $validated['rules'] ?? null,
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'exam_type' => $examType,
            'scheduled_date' => $validated['scheduled_date'],
            'duration_minutes' => $validated['duration_minutes'],
            'total_questions' => $validated['total_questions'],
            'passing_marks' => $validated['passing_score'],
            'max_attempts' => $validated['max_attempts'],
            'requires_supervision' => $request->boolean('requires_supervision'),
            'allow_review' => $request->boolean('allow_review'),
        ]);

        return redirect()->route('exams.index')
            ->with('success', 'Ujian berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exam $exam)
    {
        Gate::authorize('delete', $exam);

        $exam->delete();

        return redirect()->route('exams.index')
            ->with('success', 'Ujian berhasil dihapus.');
    }

    /**
     * Start an exam attempt (for students)
     */
    public function startAttempt(Exam $exam)
    {
        // Check if user is a student and enrolled in the class
        if (!auth()->user()->hasRole('siswa')) {
            abort(403, 'Hanya siswa yang dapat mengikuti ujian.');
        }

        if (!$exam->schoolClass->students()->where('users.id', auth()->id())->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas ini.');
        }

        // Check if exam is cancelled
        if ($exam->is_cancelled) {
            return back()->with('error', 'Ujian telah dibatalkan.');
        }

        if (! $exam->scheduled_date || ! $exam->duration_minutes) {
            return back()->with('error', 'Jadwal ujian belum lengkap.');
        }

        // Check timing
        $examEndTime = $exam->scheduled_date->copy()->addMinutes((int) $exam->duration_minutes);

        if (now() < $exam->scheduled_date) {
            return back()->with('error', 'Ujian belum dimulai.');
        }

        if (now() > $examEndTime) {
            return back()->with('error', 'Ujian sudah berakhir.');
        }

        // Check attempt limit
        $attemptCount = $exam->attempts()->where('student_id', auth()->id())->count();
        if ($attemptCount >= $exam->max_attempts) {
            return back()->with('error', 'Anda sudah mencapai batas percobaan.');
        }

        // Check if there's an unfinished attempt
        $unfinishedAttempt = $exam->attempts()
            ->where('student_id', auth()->id())
            ->whereNull('finished_at')
            ->first();

        if ($unfinishedAttempt) {
            return redirect()->route('exams.attempt', [$exam, $unfinishedAttempt]);
        }

        // Create new attempt
        $attempt = $exam->attempts()->create([
            'student_id' => auth()->id(),
            'started_at' => now(),
        ]);

        return redirect()->route('exams.attempt', [$exam, $attempt]);
    }

    /**
     * Show exam attempt page
     */
    public function attempt(Exam $exam, ExamAttempt $attempt)
    {
        // Verify ownership
        if ($attempt->student_id !== auth()->id() || $attempt->exam_id !== $exam->id) {
            abort(403);
        }

        // Check if attempt is still valid
        if ($attempt->finished_at) {
            return redirect()->route('exams.show', $exam)
                ->with('error', 'Percobaan ujian sudah selesai.');
        }

        if (! $exam->scheduled_date || ! $exam->duration_minutes) {
            return redirect()->route('exams.show', $exam)
                ->with('error', 'Jadwal ujian belum lengkap.');
        }

        // Check time limit
        $examEndTime = $exam->scheduled_date->copy()->addMinutes((int) $exam->duration_minutes);
        if (now() > $examEndTime) {
            $attempt->update(['finished_at' => now()]);
            return redirect()->route('exams.show', $exam)
                ->with('error', 'Waktu pengerjaan ujian sudah habis.');
        }

        $exam->load(['questions' => function ($query) {
            $query->orderBy('order');
        }]);

        return Inertia::render('Exams/Attempt', [
            'exam' => $exam,
            'attempt' => $attempt,
            'timeRemaining' => max(0, (int) now()->diffInSeconds($examEndTime)),
        ]);
    }

    /**
     * Submit exam answers
     */
    public function submitAttempt(Request $request, Exam $exam, ExamAttempt $attempt)
    {
        // Verify ownership
        if ($attempt->student_id !== auth()->id() || $attempt->exam_id !== $exam->id) {
            abort(403);
        }

        if ($attempt->finished_at) {
            return response()->json(['error' => 'Percobaan sudah selesai.'], 400);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'nullable|string',
        ]);

        $exam->loadMissing(['questions' => function ($query) {
            $query->orderBy('order');
        }]);

        $attempt->answers()->delete();

        $correctCount = 0;

        foreach ($exam->questions as $question) {
            $studentAnswer = $validated['answers'][$question->id] ?? null;

            if ($question->question_type === 'essay') {
                $attempt->answers()->create([
                    'question_id' => $question->id,
                    'answer' => $studentAnswer,
                    'is_correct' => false,
                    'points_awarded' => null,
                ]);

                continue;
            }

            $isCorrect = $question->isStudentAnswerCorrect($studentAnswer);
            if ($isCorrect) {
                $correctCount++;
            }

            $attempt->answers()->create([
                'question_id' => $question->id,
                'answer' => $studentAnswer,
                'is_correct' => $isCorrect,
            ]);
        }

        $attempt->refresh();
        $attempt->load('answers.question');
        $totals = AttemptScoreCalculator::forExamAttempt($attempt);
        $totalQuestions = $exam->questions->count();
        $threshold = (float) ($exam->passing_marks ?? 60);
        $passed = $totals['percent'] >= $threshold;

        $attempt->update([
            'finished_at' => now(),
            'score' => $totals['percent'],
            'passed' => $passed,
        ]);

        return response()->json([
            'success' => true,
            'score' => $totals['percent'],
            'passed' => $passed,
            'correct_answers' => $correctCount,
            'total_questions' => $totalQuestions,
            'earned_points' => $totals['earned'],
            'max_points' => $totals['max'],
        ]);
    }

    /**
     * Penilaian manual esai — halaman guru.
     */
    public function manualGradeAttempt(Exam $exam, ExamAttempt $attempt)
    {
        Gate::authorize('exams grade');

        $exam->loadMissing('classSubject.subject');
        if (! auth()->user()->hasRole('guru')
            || ! $exam->classSubject
            || ! $exam->classSubject->isTaughtBy(auth()->user())) {
            abort(403);
        }

        if ($attempt->exam_id !== $exam->id) {
            abort(404);
        }

        if (! $attempt->finished_at) {
            return redirect()->route('exams.show', $exam)
                ->with('error', 'Percobaan belum selesai.');
        }

        $essayAnswers = $attempt->answers()
            ->whereHas('question', fn ($q) => $q->where('question_type', 'essay'))
            ->with('question')
            ->orderBy('question_id')
            ->get();

        if ($essayAnswers->isEmpty()) {
            return redirect()->route('exams.show', $exam)
                ->with('error', 'Tidak ada soal esai pada ujian ini.');
        }

        return Inertia::render('Exams/ManualGradeAttempt', [
            'exam' => $exam->load('subject'),
            'attempt' => $attempt->load('student'),
            'essayAnswers' => $essayAnswers,
        ]);
    }

    /**
     * Simpan nilai esai.
     */
    public function saveManualGradeAttempt(Request $request, Exam $exam, ExamAttempt $attempt)
    {
        Gate::authorize('exams grade');

        $exam->loadMissing('classSubject.subject');
        if (! auth()->user()->hasRole('guru')
            || ! $exam->classSubject
            || ! $exam->classSubject->isTaughtBy(auth()->user())) {
            abort(403);
        }

        if ($attempt->exam_id !== $exam->id) {
            abort(404);
        }

        $validated = $request->validate([
            'grades' => 'required|array|min:1',
            'grades.*.answer_id' => 'required|integer|exists:exam_attempt_answers,id',
            'grades.*.points_awarded' => 'required|numeric|min:0',
            'grades.*.teacher_feedback' => 'nullable|string|max:2000',
        ]);

        foreach ($validated['grades'] as $index => $row) {
            $ans = ExamAttemptAnswer::query()
                ->where('id', $row['answer_id'])
                ->where('exam_attempt_id', $attempt->id)
                ->firstOrFail();

            $ans->load('question');
            if ($ans->question->question_type !== 'essay') {
                continue;
            }

            $max = (float) $ans->question->points;
            if ((float) $row['points_awarded'] > $max) {
                throw ValidationException::withMessages([
                    "grades.{$index}.points_awarded" => "Maksimal {$max} poin untuk soal ini.",
                ]);
            }

            $ans->update([
                'points_awarded' => $row['points_awarded'],
                'teacher_feedback' => $row['teacher_feedback'] ?? null,
                'graded_at' => now(),
                'graded_by' => auth()->id(),
            ]);
        }

        $attempt->refresh();
        $totals = AttemptScoreCalculator::forExamAttempt($attempt->load('answers.question'));
        $threshold = (float) ($exam->passing_marks ?? 60);
        $attempt->update([
            'score' => $totals['percent'],
            'passed' => $totals['percent'] >= $threshold,
        ]);

        return back()->with('success', 'Nilai esai berhasil disimpan; nilai akhir percobaan diperbarui.');
    }

    /**
     * Cancel an exam
     */
    public function cancel(Exam $exam)
    {
        Gate::authorize('update', $exam);

        $exam->update(['is_cancelled' => true]);

        return back()->with('success', 'Ujian berhasil dibatalkan.');
    }

    /**
     * Reschedule an exam
     */
    public function reschedule(Request $request, Exam $exam)
    {
        Gate::authorize('update', $exam);

        $validated = $request->validate([
            'scheduled_date' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:30|max:240',
        ]);

        $exam->update($validated);

        return back()->with('success', 'Ujian berhasil dijadwalkan ulang.');
    }

    /**
     * Tambah soal ujian.
     */
    public function storeQuestion(Request $request, Exam $exam)
    {
        Gate::authorize('update', $exam);

        $data = $this->prepareExamQuestionData($request);
        $order = (int) ($exam->questions()->max('order') ?? 0) + 1;
        $exam->questions()->create(array_merge($data, ['order' => $order]));
        $exam->update(['total_questions' => $exam->questions()->count()]);

        return back()->with('success', 'Soal berhasil ditambahkan.');
    }

    /**
     * Ubah soal ujian.
     */
    public function updateQuestion(Request $request, Exam $exam, ExamQuestion $question)
    {
        Gate::authorize('update', $exam);

        if ($question->exam_id !== $exam->id) {
            abort(404);
        }

        $data = $this->prepareExamQuestionData($request);
        if ($request->filled('order')) {
            $data['order'] = (int) $request->input('order');
        }
        $question->update($data);
        $exam->update(['total_questions' => $exam->questions()->count()]);

        return back()->with('success', 'Soal berhasil diperbarui.');
    }

    /**
     * Hapus soal ujian.
     */
    public function destroyQuestion(Exam $exam, ExamQuestion $question)
    {
        Gate::authorize('update', $exam);

        if ($question->exam_id !== $exam->id) {
            abort(404);
        }

        $question->delete();
        $exam->update(['total_questions' => $exam->questions()->count()]);

        return back()->with('success', 'Soal berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function prepareExamQuestionData(Request $request): array
    {
        $this->normalizeQuestionRequestPayload($request);

        $validated = $request->validate([
            'question_text' => 'required|string',
            'question_type' => 'required|in:multiple_choice,true_false,short_answer,essay',
            'options' => 'nullable|array',
            'options.*' => 'nullable|string',
            'correct_answer' => 'nullable|string|max:10000',
            'points' => 'nullable|numeric|min:0|max:1000',
            'explanation' => 'nullable|string',
        ]);

        $type = $validated['question_type'];
        $options = null;

        if ($type === 'multiple_choice') {
            $opts = array_values(array_filter(
                $validated['options'] ?? [],
                fn ($x) => $x !== null && trim((string) $x) !== ''
            ));
            if (count($opts) < 2) {
                throw ValidationException::withMessages([
                    'options' => 'Minimal dua opsi untuk soal pilihan ganda.',
                ]);
            }
            if (! isset($validated['correct_answer']) || $validated['correct_answer'] === '') {
                throw ValidationException::withMessages([
                    'correct_answer' => 'Pilih jawaban benar untuk pilihan ganda.',
                ]);
            }
            $ca = (string) $validated['correct_answer'];
            if (!ctype_digit($ca) || (int) $ca < 0 || (int) $ca >= count($opts)) {
                throw ValidationException::withMessages([
                    'correct_answer' => 'Jawaban benar harus memilih salah satu opsi (indeks 0, 1, …).',
                ]);
            }
            $options = $opts;
        } elseif ($type === 'true_false') {
            if (! isset($validated['correct_answer']) || $validated['correct_answer'] === '') {
                throw ValidationException::withMessages([
                    'correct_answer' => 'Tentukan jawaban benar (benar/salah).',
                ]);
            }
            $ca = strtolower(trim((string) $validated['correct_answer']));
            if (!in_array($ca, ['true', 'false'], true)) {
                throw ValidationException::withMessages([
                    'correct_answer' => 'Untuk benar/salah, isi jawaban benar dengan true atau false.',
                ]);
            }
            $validated['correct_answer'] = $ca;
        } elseif ($type === 'short_answer') {
            if (! isset($validated['correct_answer']) || trim((string) $validated['correct_answer']) === '') {
                throw ValidationException::withMessages([
                    'correct_answer' => 'Isi minimal satu kunci jawaban (satu baris per variasi yang benar).',
                ]);
            }
            $lines = preg_split('/\r\n|\r|\n/', (string) $validated['correct_answer']) ?: [];
            $lines = array_values(array_filter(array_map('trim', $lines), fn ($l) => $l !== ''));
            if (count($lines) === 0) {
                throw ValidationException::withMessages([
                    'correct_answer' => 'Isi minimal satu kunci jawaban (satu baris per variasi yang benar).',
                ]);
            }
            $validated['correct_answer'] = implode("\n", $lines);
        } else {
            $ca = isset($validated['correct_answer']) ? trim((string) $validated['correct_answer']) : '';
            $validated['correct_answer'] = $ca === '' ? null : $ca;
        }

        return [
            'question_text' => $validated['question_text'],
            'question_type' => $type,
            'options' => $options,
            'correct_answer' => $validated['correct_answer'],
            'points' => $validated['points'] ?? 1,
            'explanation' => $validated['explanation'] ?? null,
        ];
    }

    /**
     * Pastikan correct_answer lolos rule `string` jika klien mengirim angka (JSON).
     */
    private function normalizeQuestionRequestPayload(Request $request): void
    {
        if (! $request->has('correct_answer')) {
            return;
        }
        $ca = $request->input('correct_answer');
        if ($ca !== null && ! is_string($ca) && is_scalar($ca)) {
            $request->merge(['correct_answer' => (string) $ca]);
        }
    }
}
