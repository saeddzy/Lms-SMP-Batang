<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\ClassSubject;
use App\Models\User;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\QuizQuestion;
use App\Support\AttemptScoreCalculator;
use App\Support\AttemptStatusHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Carbon\Carbon;

class QuizController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('quizzes index');

        $query = Quiz::with([
            'subject',
            'schoolClass' => fn ($q) => $q->withCount('students'),
            'teacher',
            'classSubject',
        ])->withCount(['questions', 'attempts']);

        if (auth()->user()->hasRole('siswa')) {
            $query->whereHas('schoolClass.enrollments', function ($q) {
                $q->where('student_id', auth()->id());
            });
        }

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->whereHas('classSubject', function($q) use ($request) {
                $q->where('subject_id', $request->subject_id);
            });
        }

        // Filter by class
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filter by quiz creator/teacher (admin use-case)
        if ($request->filled('teacher_id')) {
            $query->where('created_by', (int) $request->teacher_id);
        }

        // Filter by teacher (for teachers, only show their quizzes)
        if (auth()->user()->hasRole('guru')) {
            $query->whereHas('classSubject', function($q) {
                $q->forTeacher(auth()->user());
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'active':
                    $query->where('is_active', true)
                          ->where('start_time', '<=', now())
                          ->where('end_time', '>', now());
                    break;
                case 'upcoming':
                    $query->where('start_time', '>', now());
                    break;
                case 'expired':
                    $query->where('end_time', '<', now());
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
            }
        }

        // Search by title or description
        if ($request->filled('search')) {
            $search = trim((string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('subject', function ($subjectQuery) use ($search) {
                      $subjectQuery->where('name', 'like', "%{$search}%")
                          ->orWhere('code', 'like', "%{$search}%");
                  })
                  ->orWhereHas('schoolClass', function ($classQuery) use ($search) {
                      $classQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $quizzes = $query->latest()->paginate(15)->withQueryString();
        $quizzes->getCollection()->transform(function (Quiz $quiz) {
            $status = 'inactive';
            if ($quiz->is_active) {
                if ($quiz->start_time && now()->lt($quiz->start_time)) {
                    $status = 'upcoming';
                } elseif ($quiz->end_time && now()->gt($quiz->end_time)) {
                    $status = 'expired';
                } else {
                    $status = 'active';
                }
            }

            return array_merge($quiz->toArray(), [
                'status' => $status,
                'duration' => $quiz->time_limit,
                'participants_count' => (int) ($quiz->schoolClass->students_count ?? 0),
            ]);
        });

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

        $teachers = User::role('guru')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return Inertia::render('Quizzes/Index', [
            'quizzes' => $quizzes,
            'subjects' => $subjects,
            'classes' => $classes,
            'teachers' => $teachers,
            'filters' => $request->only(['subject_id', 'class_id', 'teacher_id', 'search', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Gate::authorize('quizzes create');

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

        return Inertia::render('Quizzes/Create', [
            'subjects' => $subjects,
            'classes' => $classes,
            'selectedClassId' => $selectedClassId,
            'selectedSubjectId' => $selectedSubjectId,
            'classSubjectsMap' => $this->buildClassSubjectsMap($classes),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('quizzes create');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'time_limit' => 'required|integer|min:5|max:180',
            'total_questions' => 'nullable|integer|min:0',
            'max_attempts' => 'required|integer|min:1|max:10',
            'passing_score' => 'required|numeric|min:0|max:100',
            'instructions' => 'nullable|string',
            'is_active' => 'boolean',
            'is_randomized' => 'boolean',
            'show_results' => 'boolean',
        ]);

        // Find the class_subject based on class_id and subject_id
        $classSubject = ClassSubject::where('class_id', $validated['class_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (!$classSubject) {
            return back()->withErrors(['subject_id' => 'Mata pelajaran tidak ditemukan untuk kelas ini.']);
        }

        $this->authorizeClassSubjectSlotTeacher($classSubject);

        $quiz = Quiz::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'time_limit' => $validated['time_limit'],
            'total_questions' => $validated['total_questions'] ?? 0,
            'max_score' => 100,
            'passing_score' => $validated['passing_score'],
            'max_attempts' => $validated['max_attempts'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'created_by' => auth()->id(),
            'is_active' => $request->boolean('is_active', true),
            'is_randomized' => $request->boolean('is_randomized', false),
            'show_results' => $request->boolean('show_results', true),
        ]);

        return redirect()->route('quizzes.show', $quiz)
            ->with('success', 'Kuis berhasil dibuat. Sekarang tambahkan soal-soal.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Quiz $quiz)
    {
        Gate::authorize('view', $quiz);
        $isStudent = auth()->user()->hasRole('siswa');

        $load = [
            'subject',
            'schoolClass',
            'teacher',
            'creator',
            'questions' => fn ($q) => $q->orderBy('order'),
        ];
        if (auth()->user()->can('quizzes view_results') && !$isStudent) {
            $load[] = 'schoolClass.students';
        }
        $quiz->load($load);
        $quiz->loadMissing('classSubject');

        // Load attempts for teachers and admins
        if (auth()->user()->can('quizzes view_results') && !$isStudent) {
            $attempts = $quiz->attempts()
                ->with(['student', 'answers.question'])
                ->orderBy('started_at', 'desc')
                ->get();
            $attempts = AttemptStatusHelper::annotateQuizAttempts($attempts);
        } else {
            $attempts = $quiz->attempts()
                ->where('student_id', auth()->id())
                ->with('student')
                ->get();
            $attempts = AttemptStatusHelper::annotateQuizAttempts($attempts);
        }

        $cs = $quiz->classSubject;
        $canManageQuiz = auth()->user()->hasRole('admin')
            || ($cs && $cs->isAssignedSlotTeacher(auth()->user()));

        return Inertia::render($isStudent ? 'Student/QuizDetail' : 'Quizzes/Show', [
            'quiz' => $quiz,
            'attempts' => $attempts ?? [],
            'canManageQuiz' => $canManageQuiz,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        // Teachers can only edit quizzes for subjects they teach
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

        $quiz->loadMissing('classSubject');

        $quizPayload = array_merge($quiz->toArray(), [
            'subject_id' => $quiz->classSubject?->subject_id,
        ]);

        return Inertia::render('Quizzes/Edit', [
            'quiz' => $quizPayload,
            'subjects' => $subjects,
            'classes' => $classes,
            'classSubjectsMap' => $this->buildClassSubjectsMap($classes),
        ]);
    }

    private function buildClassSubjectsMap($classes): array
    {
        $classIds = collect($classes)->pluck('id')->filter()->values();
        if ($classIds->isEmpty()) {
            return [];
        }

        return ClassSubject::query()
            ->with('subject:id,name,is_active')
            ->whereIn('class_id', $classIds)
            ->where('is_active', true)
            ->get(['id', 'class_id', 'subject_id'])
            ->groupBy('class_id')
            ->map(function ($rows) {
                return $rows
                    ->map(fn ($row) => [
                        'id' => $row->subject_id,
                        'name' => $row->subject?->name,
                    ])
                    ->filter(fn ($subject) => !empty($subject['id']) && !empty($subject['name']))
                    ->values()
                    ->all();
            })
            ->toArray();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'time_limit' => 'required|integer|min:5|max:180',
            'total_questions' => 'nullable|integer|min:0',
            'max_attempts' => 'required|integer|min:1|max:10',
            'passing_score' => 'required|numeric|min:0|max:100',
            'instructions' => 'nullable|string',
            'is_active' => 'boolean',
            'is_randomized' => 'boolean',
            'show_results' => 'boolean',
        ]);

        $classSubject = ClassSubject::where('class_id', $validated['class_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (!$classSubject) {
            return back()->withErrors(['subject_id' => 'Mata pelajaran tidak ditemukan untuk kelas ini.']);
        }

        $this->authorizeClassSubjectSlotTeacher($classSubject);

        $quiz->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'time_limit' => $validated['time_limit'],
            'total_questions' => $validated['total_questions'] ?? 0,
            'passing_score' => $validated['passing_score'],
            'max_attempts' => $validated['max_attempts'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'],
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'is_active' => $request->boolean('is_active', true),
            'is_randomized' => $request->boolean('is_randomized', false),
            'show_results' => $request->boolean('show_results', true),
        ]);

        return redirect()->route('quizzes.index')
            ->with('success', 'Kuis berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Quiz $quiz)
    {
        Gate::authorize('delete', $quiz);

        $quiz->delete();

        return redirect()->route('quizzes.index')
            ->with('success', 'Kuis berhasil dihapus.');
    }

    /**
     * Start a quiz attempt (for students)
     */
    public function startAttempt(Quiz $quiz)
    {
        // Check if user is a student and enrolled in the class
        if (!auth()->user()->hasRole('siswa')) {
            abort(403, 'Hanya siswa yang dapat mengerjakan kuis.');
        }

        if (!$quiz->schoolClass->students()->where('users.id', auth()->id())->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas ini.');
        }

        // Check if quiz is active and within time limits
        if (!$quiz->is_active) {
            return back()->with('error', 'Kuis tidak aktif.');
        }

        if (now() < $quiz->start_time) {
            return back()->with('error', 'Kuis belum dimulai.');
        }

        if (now() > $quiz->end_time) {
            return back()->with('error', 'Kuis sudah berakhir.');
        }

        // Check attempt limit
        $attemptCount = $quiz->attempts()->where('student_id', auth()->id())->count();
        if ($attemptCount >= $quiz->max_attempts) {
            return back()->with('error', 'Anda sudah mencapai batas percobaan.');
        }

        // Check if there's an unfinished attempt
        $unfinishedAttempt = $quiz->attempts()
            ->where('student_id', auth()->id())
            ->whereNull('finished_at')
            ->first();

        if ($unfinishedAttempt) {
            return redirect()->route('quizzes.attempt', [$quiz, $unfinishedAttempt]);
        }

        // Create new attempt
        $attempt = $quiz->attempts()->create([
            'student_id' => auth()->id(),
            'started_at' => now(),
        ]);

        return redirect()->route('quizzes.attempt', [$quiz, $attempt]);
    }

    /**
     * Show quiz attempt page
     */
    public function attempt(Quiz $quiz, QuizAttempt $attempt)
    {
        // Verify ownership
        if ($attempt->student_id !== auth()->id() || $attempt->quiz_id !== $quiz->id) {
            abort(403);
        }

        // Check if attempt is still valid
        if ($attempt->finished_at) {
            return redirect()->route('quizzes.show', $quiz)
                ->with('error', 'Percobaan kuis sudah selesai.');
        }

        // Check time limit
        $timeLimit = $attempt->started_at->copy()->addMinutes((int) ($quiz->time_limit ?? 60));
        if (now() > $timeLimit) {
            $attempt->update(['finished_at' => now()]);
            return redirect()->route('quizzes.show', $quiz)
                ->with('error', 'Waktu pengerjaan kuis sudah habis.');
        }

        $quiz->load(['questions' => function ($query) {
            $query->orderBy('order');
        }]);

        return Inertia::render('Quizzes/Attempt', [
            'quiz' => $quiz,
            'attempt' => $attempt,
            'timeRemaining' => max(0, (int) now()->diffInSeconds($timeLimit)),
        ]);
    }

    /**
     * Submit quiz answers
     */
    public function submitAttempt(Request $request, Quiz $quiz, QuizAttempt $attempt)
    {
        // Verify ownership
        if ($attempt->student_id !== auth()->id() || $attempt->quiz_id !== $quiz->id) {
            abort(403);
        }

        if ($attempt->finished_at) {
            return response()->json(['error' => 'Percobaan sudah selesai.'], 400);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'nullable|string',
        ]);

        $quiz->loadMissing('questions');

        $attempt->answers()->delete();

        $correctCount = 0;

        foreach ($quiz->questions as $question) {
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
        $totals = AttemptScoreCalculator::forQuizAttempt($attempt);
        $totalQuestions = $quiz->questions->count();
        $hasEssay = $quiz->questions->contains(fn ($q) => $q->question_type === 'essay');
        $pendingManualGrading = $hasEssay
            && $attempt->answers->contains(
                fn ($ans) => $ans->question?->question_type === 'essay'
                    && $ans->points_awarded === null
            );

        $attempt->update([
            'finished_at' => now(),
            'score' => $totals['percent'],
            'passed' => $pendingManualGrading
                ? null
                : ($totals['percent'] >= (float) $quiz->passing_score),
        ]);

        return response()->json([
            'success' => true,
            'score' => $totals['percent'],
            'passed' => $pendingManualGrading
                ? null
                : ($totals['percent'] >= (float) $quiz->passing_score),
            'correct_answers' => $correctCount,
            'total_questions' => $totalQuestions,
            'earned_points' => $totals['earned'],
            'max_points' => $totals['max'],
            'pending_manual_grading' => $pendingManualGrading,
        ]);
    }

    /**
     * Halaman penilaian manual soal esai (guru).
     */
    public function manualGradeAttempt(Quiz $quiz, QuizAttempt $attempt)
    {
        Gate::authorize('quizzes grade');

        $quiz->loadMissing('classSubject.subject');
        if (! auth()->user()->hasRole('guru')
            || ! $quiz->classSubject
            || ! $quiz->classSubject->isTaughtBy(auth()->user())) {
            abort(403);
        }

        if ($attempt->quiz_id !== $quiz->id) {
            abort(404);
        }

        if (! $attempt->finished_at) {
            return redirect()->route('quizzes.show', $quiz)
                ->with('error', 'Percobaan belum selesai.');
        }

        $essayAnswers = $attempt->answers()
            ->whereHas('question', fn ($q) => $q->where('question_type', 'essay'))
            ->with('question')
            ->orderBy('question_id')
            ->get();

        if ($essayAnswers->isEmpty()) {
            return redirect()->route('quizzes.show', $quiz)
                ->with('error', 'Tidak ada soal esai pada kuis ini.');
        }

        return Inertia::render('Quizzes/ManualGradeAttempt', [
            'quiz' => $quiz->load('subject'),
            'attempt' => $attempt->load('student'),
            'essayAnswers' => $essayAnswers,
        ]);
    }

    /**
     * Simpan nilai esai per jawaban.
     */
    public function saveManualGradeAttempt(Request $request, Quiz $quiz, QuizAttempt $attempt)
    {
        Gate::authorize('quizzes grade');

        $quiz->loadMissing('classSubject.subject');
        if (! auth()->user()->hasRole('guru')
            || ! $quiz->classSubject
            || ! $quiz->classSubject->isTaughtBy(auth()->user())) {
            abort(403);
        }

        if ($attempt->quiz_id !== $quiz->id) {
            abort(404);
        }

        $validated = $request->validate([
            'grades' => 'required|array|min:1',
            'grades.*.answer_id' => 'required|integer|exists:quiz_attempt_answers,id',
            'grades.*.points_awarded' => 'required|numeric|min:0',
            'grades.*.teacher_feedback' => 'nullable|string|max:2000',
        ]);

        foreach ($validated['grades'] as $index => $row) {
            $ans = QuizAttemptAnswer::query()
                ->where('id', $row['answer_id'])
                ->where('quiz_attempt_id', $attempt->id)
                ->firstOrFail();

            $ans->load('question');
            if ($ans->question->question_type !== 'essay') {
                continue;
            }

            $max = (float) $ans->question->points;
            $pointsAwarded = (float) $row['points_awarded'];
            if (abs($max - $pointsAwarded) < 0.011) {
                $pointsAwarded = $max;
            }
            if (abs($pointsAwarded) < 0.011) {
                $pointsAwarded = 0.0;
            }
            $pointsAwarded = round($pointsAwarded, 2);

            if ($pointsAwarded > $max) {
                throw ValidationException::withMessages([
                    "grades.{$index}.points_awarded" => "Maksimal {$max} poin untuk soal ini.",
                ]);
            }

            $ans->update([
                'points_awarded' => $pointsAwarded,
                'teacher_feedback' => $row['teacher_feedback'] ?? null,
                'graded_at' => now(),
                'graded_by' => auth()->id(),
            ]);
        }

        $attempt->refresh();
        $totals = AttemptScoreCalculator::forQuizAttempt($attempt->load('answers.question'));
        $attempt->update([
            'attempt_status' => 'finished',
            'score' => $totals['percent'],
            'passed' => $totals['percent'] >= (float) $quiz->passing_score,
        ]);

        return back()->with('success', 'Nilai esai berhasil disimpan; nilai akhir percobaan diperbarui.');
    }

    /**
     * Toggle quiz status (active/inactive)
     */
    public function toggleStatus(Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        $quiz->update(['is_active' => !$quiz->is_active]);

        $status = $quiz->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Kuis berhasil {$status}.");
    }

    /**
     * Tambah soal kuis.
     */
    public function storeQuestion(Request $request, Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        $data = $this->prepareQuizQuestionData($request);
        $this->assertQuizPointsBudget($quiz, (float) $data['points']);
        $order = (int) ($quiz->questions()->max('order') ?? 0) + 1;
        $quiz->questions()->create(array_merge($data, ['order' => $order]));

        return back()->with('success', 'Soal berhasil ditambahkan.');
    }

    /**
     * Tambah banyak soal kuis sekaligus (wizard berurutan).
     */
    public function storeQuestionsBatch(Request $request, Quiz $quiz)
    {
        Gate::authorize('update', $quiz);

        $validated = $request->validate([
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.question_type' => ['required', 'in:multiple_choice,true_false,short_answer,essay'],
            'questions.*.options' => ['nullable', 'array'],
            'questions.*.options.*' => ['nullable', 'string'],
            'questions.*.correct_answer' => ['nullable', 'string', 'max:10000'],
            'questions.*.points' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'questions.*.explanation' => ['nullable', 'string'],
        ]);

        $nextOrder = (int) ($quiz->questions()->max('order') ?? 0) + 1;

        foreach ($validated['questions'] as $row) {
            $itemRequest = new Request($row);
            $data = $this->prepareQuizQuestionData($itemRequest);
            $this->assertQuizPointsBudget($quiz, (float) $data['points']);
            $quiz->questions()->create(array_merge($data, ['order' => $nextOrder]));
            $nextOrder++;
            $quiz->refresh();
        }

        return back()->with('success', 'Semua soal berhasil disimpan.');
    }

    /**
     * Ubah soal kuis.
     */
    public function updateQuestion(Request $request, Quiz $quiz, QuizQuestion $question)
    {
        Gate::authorize('update', $quiz);

        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $data = $this->prepareQuizQuestionData($request);
        $this->assertQuizPointsBudget($quiz, (float) $data['points'], $question);
        if ($request->filled('order')) {
            $data['order'] = (int) $request->input('order');
        }
        $question->update($data);

        return back()->with('success', 'Soal berhasil diperbarui.');
    }

    /**
     * Hapus soal kuis.
     */
    public function destroyQuestion(Quiz $quiz, QuizQuestion $question)
    {
        Gate::authorize('update', $quiz);

        if ($question->quiz_id !== $quiz->id) {
            abort(404);
        }

        $question->delete();

        return back()->with('success', 'Soal berhasil dihapus.');
    }

    /**
     * @return array<string, mixed>
     */
    private function prepareQuizQuestionData(Request $request): array
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
            // essay: opsional rubrik / catatan di correct_answer (boleh kosong)
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

    private function assertQuizPointsBudget(Quiz $quiz, float $incomingPoints, ?QuizQuestion $current = null): void
    {
        $used = (float) $quiz->questions()->sum('points');
        if ($current) {
            $used -= (float) $current->points;
        }
        $next = $used + $incomingPoints;
        if ($next > 100.0) {
            throw ValidationException::withMessages([
                'points' => 'Total poin seluruh soal kuis maksimal 100. Kurangi poin soal ini atau soal lain.',
            ]);
        }
    }
}
