<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\ClassSubject;
use App\Models\User;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptAnswer;
use App\Models\ExamQuestion;
use App\Support\AttemptScoreCalculator;
use App\Support\AttemptStatusHelper;
use App\Helpers\ExamTimeHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\DB;
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

        $query = Exam::with(['subject', 'schoolClass', 'teacher'])
            ->withCount([
                'questions',
                'attempts as participants_count' => function ($q) {
                    $q->select(DB::raw('COUNT(DISTINCT student_id)'));
                },
            ]);

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

        // Filter by exam creator/teacher (admin use-case)
        if ($request->filled('teacher_id')) {
            $query->where('created_by', (int) $request->teacher_id);
        }

        // Filter by teacher (for teachers, only show their exams)
        if (auth()->user()->hasRole('guru')) {
            $query->whereHas('classSubject', function($q) {
                $q->forTeacher(auth()->user());
            });
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where(function ($typeQuery) use ($request) {
                $typeQuery->where('type', $request->type)
                    ->orWhere('exam_type', $request->type);
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'active':
                    $query->where('is_active', true)
                        ->where('is_cancelled', false)
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
                    $query->where(function ($inactiveQuery) {
                        $inactiveQuery->where('is_active', false)
                            ->orWhere('is_cancelled', true);
                    });
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

        $exams = $query->latest()->paginate(15)->withQueryString();
        $exams->getCollection()->transform(function (Exam $exam) {
            $status = 'inactive';

            if (!$exam->is_active || $exam->is_cancelled) {
                $status = 'inactive';
            } elseif ($exam->start_time && now()->lt($exam->start_time)) {
                $status = 'upcoming';
            } elseif ($exam->end_time && now()->gte($exam->end_time)) {
                $status = 'expired';
            } elseif ($exam->start_time && $exam->end_time) {
                $status = 'active';
            }

            return array_merge($exam->toArray(), [
                'status' => $status,
                'duration' => $exam->duration_minutes ?? $exam->duration,
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

        return Inertia::render('Exams/Index', [
            'exams' => $exams,
            'subjects' => $subjects,
            'classes' => $classes,
            'teachers' => $teachers,
            'filters' => $request->only(['subject_id', 'class_id', 'teacher_id', 'search', 'type', 'status'])
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
            'classSubjectsMap' => $this->buildClassSubjectsMap($classes),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('exams create');

        try {
            // Log debugging
            \Log::info('Exam store attempt', [
                'user_id' => auth()->id(),
                'user_role' => auth()->user()->role ?? 'unknown',
                'user_permissions' => method_exists(auth()->user(), 'permissions') ? auth()->user()->permissions : [],
                'request_data' => $request->all(),
                'request_method' => $request->method(),
            ]);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'subject_id' => 'required|exists:subjects,id',
                'class_id' => 'required|exists:school_classes,id',
                'type' => 'required|in:midterm,final,quiz,practice',
                'scheduled_date' => 'required|date',
                'duration' => 'required|integer|min:1',
                'max_attempts' => 'nullable|integer|min:1|max:10',
                'passing_score' => 'nullable|numeric|min:0|max:100',
                'instructions' => 'nullable|string',
                'rules' => 'nullable|string',
                'supervision_required' => 'boolean',
                'allow_review' => 'boolean',
                'start_time' => 'required',
                'end_time' => 'required',
                'status' => 'nullable|string',
            ]);

        \Log::info('Validation passed', [
            'validated_data' => $validated,
            'user_id' => auth()->id(),
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

        // Combine date and time using Carbon
        $startDateTime = \Carbon\Carbon::parse($validated['scheduled_date'] . ' ' . $validated['start_time']);
        $endDateTime = \Carbon\Carbon::parse($validated['scheduled_date'] . ' ' . $validated['end_time']);

        // Debug log untuk memastikan data masuk DB dengan benar
        \Log::info('Exam datetime debug', [
            'scheduled_date' => $validated['scheduled_date'],
            'start_time_input' => $validated['start_time'],
            'end_time_input' => $validated['end_time'],
            'start_datetime' => $startDateTime,
            'end_datetime' => $endDateTime,
            'duration' => $validated['duration'],
        ]);

        // Create exam record
        $exam = Exam::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'exam_type' => $examType,
            'scheduled_date' => $startDateTime,
            'start_time' => $startDateTime,
            'end_time' => $endDateTime,
            'duration' => $validated['duration'],
            'duration_minutes' => $validated['duration'],
            'max_attempts' => $validated['max_attempts'] ?? 1,
            'passing_marks' => $validated['passing_score'] ?? 0,
            'total_marks' => 100,
            'requires_supervision' => $request->boolean('supervision_required'),
            'allow_review' => $request->boolean('allow_review'),
            'created_by' => auth()->id(),
            'is_active' => true,
        ]);

        \Log::info('Exam created successfully', [
            'exam_id' => $exam->id,
            'exam_title' => $exam->title,
            'redirect_to' => 'exams.show',
        ]);

        return redirect()->route('exams.show', $exam)
            ->with('success', 'Ujian berhasil dibuat. Sekarang tambahkan soal-soal.');

        } catch (\Exception $e) {
            \Log::error('Exam creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'request_data' => $request->all(),
            ]);

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data ujian: ' . $e->getMessage()]);
        }
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
            'questions',
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
            $attempts = AttemptStatusHelper::annotateExamAttempts($attempts);
        } else {
            $attempts = $exam->attempts()
                ->where('student_id', auth()->id())
                ->with('student')
                ->get();
            $attempts = AttemptStatusHelper::annotateExamAttempts($attempts);
        }

        $attempts = $attempts->map(function ($att) {
            $violations = is_array($att->attempt_data['violations'] ?? null)
                ? $att->attempt_data['violations']
                : [];

            $att->setAttribute('violations_count', count($violations));
            $att->setAttribute(
                'violations_preview',
                collect($violations)
                    ->pluck('type')
                    ->filter()
                    ->take(-3)
                    ->implode(', ')
            );

            return $att;
        });

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

        // Format date and time for HTML inputs
        $examData = $exam->toArray();
        
        // Handle scheduled_date formatting
        if ($exam->scheduled_date) {
            // Try different date formats
            $date = \DateTime::createFromFormat('Y-m-d', $exam->scheduled_date);
            if (!$date) {
                $date = \DateTime::createFromFormat('Y-m-d H:i:s', $exam->scheduled_date);
            }
            if (!$date) {
                $date = \DateTime::createFromFormat('Y-m-d\TH:i:s', $exam->scheduled_date);
            }
            if ($date) {
                $examData['scheduled_date'] = $date->format('Y-m-d');
            } else {
                $examData['scheduled_date'] = null;
            }
        } else {
            $examData['scheduled_date'] = null;
        }
        
        // Handle time formatting
        $examData['start_time'] = $exam->start_time ? date('H:i', strtotime($exam->start_time)) : null;
        $examData['end_time'] = $exam->end_time ? date('H:i', strtotime($exam->end_time)) : null;
        $examData['passing_score'] = $exam->passing_marks;
        $examData['type'] = match ($exam->exam_type) {
            'mid_term' => 'midterm',
            'final' => 'final',
            'quiz' => 'quiz',
            'practice' => 'practice',
            default => 'quiz',
        };
        $examData['supervision_required'] = (bool) $exam->requires_supervision;

        return Inertia::render('Exams/Edit', [
            'exam' => $examData,
            'subjects' => $subjects,
            'classes' => $classes,
            'classSubjectsMap' => $this->buildClassSubjectsMap($classes),
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
            'duration' => 'required|integer|min:1',
            'max_attempts' => 'nullable|integer|min:1|max:10',
            'passing_score' => 'nullable|numeric|min:0|max:100',
            'instructions' => 'nullable|string',
            'rules' => 'nullable|string',
            'supervision_required' => 'boolean',
            'allow_review' => 'boolean',
            'start_time' => 'required',
            'end_time' => 'required',
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

        // Combine date and time using Carbon (same as store method)
        $startDateTime = \Carbon\Carbon::parse($validated['scheduled_date'] . ' ' . $validated['start_time']);
        $endDateTime = \Carbon\Carbon::parse($validated['scheduled_date'] . ' ' . $validated['end_time']);

        // Debug log untuk memastikan data masuk DB dengan benar
        \Log::info('Exam update datetime debug', [
            'scheduled_date' => $validated['scheduled_date'],
            'start_time_input' => $validated['start_time'],
            'end_time_input' => $validated['end_time'],
            'start_datetime' => $startDateTime,
            'end_datetime' => $endDateTime,
            'duration' => $validated['duration'],
        ]);

        $exam->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'rules' => $validated['rules'] ?? null,
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'exam_type' => $examType,
            'scheduled_date' => $startDateTime,
            'start_time' => $startDateTime,
            'end_time' => $endDateTime,
            'duration' => $validated['duration'],
            'duration_minutes' => $validated['duration'],
            'max_attempts' => $validated['max_attempts'] ?? $exam->max_attempts ?? 1,
            'passing_marks' => $validated['passing_score'] ?? 0,
            'requires_supervision' => $request->boolean('supervision_required'),
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

        // Check timing - use the actual start_time and end_time fields
        $examStartTime = $exam->start_time;
        $examEndTime = $exam->end_time;

        if (now() < $examStartTime) {
            return back()->with('error', 'Ujian belum dimulai. Dimulai pada: ' . $examStartTime->format('d M Y H:i'));
        }

        if (now() > $examEndTime) {
            return back()->with('error', 'Ujian sudah berakhir pada: ' . $examEndTime->format('d M Y H:i'));
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
            return redirect()->route('exams.attempt.take', [$exam, $unfinishedAttempt]);
        }

        // Create new attempt
        $attempt = $exam->attempts()->create([
            'student_id' => auth()->id(),
            'started_at' => now(),
        ]);

        return redirect()->route('exams.attempt.take', [$exam, $attempt]);
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

        // Check if attempt is expired using ExamTimeHelper
        if (ExamTimeHelper::isExpired($attempt)) {
            ExamTimeHelper::updateExpiredAttempt($attempt);
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
        $hasEssay = $exam->questions->contains(fn ($q) => $q->question_type === 'essay');
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
                : ($totals['percent'] >= $threshold),
        ]);

        return response()->json([
            'success' => true,
            'score' => $totals['percent'],
            'passed' => $pendingManualGrading
                ? null
                : ($totals['percent'] >= $threshold),
            'correct_answers' => $correctCount,
            'total_questions' => $totalQuestions,
            'earned_points' => $totals['earned'],
            'max_points' => $totals['max'],
            'pending_manual_grading' => $pendingManualGrading,
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
        $totals = AttemptScoreCalculator::forExamAttempt($attempt->load('answers.question'));
        $threshold = (float) ($exam->passing_marks ?? 60);
        $attempt->update([
            'attempt_status' => 'finished',
            'score' => $totals['percent'],
            'passed' => $totals['percent'] >= $threshold,
        ]);

        return back()->with('success', 'Nilai esai berhasil disimpan; nilai akhir percobaan diperbarui.');
    }

    /**
     * Aktif / nonaktif ujian (guru pengampu / admin).
     */
    public function toggleStatus(Exam $exam)
    {
        Gate::authorize('update', $exam);

        $exam->update(['is_active' => ! $exam->is_active]);

        $status = $exam->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Ujian berhasil {$status}.");
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
            'scheduled_date' => 'required|date',
            'duration' => 'required|integer|min:1',
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

        try {
            \Log::info('Store question attempt', [
                'exam_id' => $exam->id,
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            $data = $this->prepareExamQuestionData($request);
            
            \Log::info('Question data prepared', [
                'data' => $data,
                'exam_id' => $exam->id,
            ]);

            $order = (int) ($exam->questions()->max('order') ?? 0) + 1;
            $question = $exam->questions()->create(array_merge($data, ['order' => $order]));
            
            \Log::info('Question created', [
                'question_id' => $question->id,
                'exam_id' => $exam->id,
                'order' => $order,
            ]);

            $exam->update(['total_questions' => $exam->questions()->count()]);
            
            \Log::info('Exam total_questions updated', [
                'exam_id' => $exam->id,
                'total_questions' => $exam->questions()->count(),
            ]);

            return back()->with('success', 'Soal berhasil ditambahkan.');
        } catch (\Exception $e) {
            \Log::error('Store question failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'exam_id' => $exam->id,
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menambahkan soal: ' . $e->getMessage()]);
        }
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
}
