<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Quiz;
use App\Models\Exam;
use App\Models\Material;
use App\Models\FinalGrade;
use App\Models\TaskSubmission;
use App\Models\QuizAttempt;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class StudentDashboardController extends Controller
{
    /**
     * Display the student dashboard.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Get student's enrolled classes
        $enrolledClasses = $user->enrolledClasses()->with('teacher')->get();

        // Get recent activities
        $recentActivities = $this->getRecentActivities($user);

        // Get upcoming tasks, quizzes, and exams
        $upcomingTasks = $this->getUpcomingTasks($user);
        $upcomingQuizzes = $this->getUpcomingQuizzes($user);
        $upcomingExams = $this->getUpcomingExams($user);

        // Get recent grades
        $recentGrades = $this->getRecentGrades($user);

        // Get learning progress statistics
        $learningStats = $this->getLearningStats($user);

        // Get recent materials
        $recentMaterials = $this->getRecentMaterials($user);

        return Inertia::render('Dashboard/StudentDashboard', [
            'enrolledClasses' => $enrolledClasses,
            'recentActivities' => $recentActivities,
            'upcomingTasks' => $upcomingTasks,
            'upcomingQuizzes' => $upcomingQuizzes,
            'upcomingExams' => $upcomingExams,
            'recentGrades' => $recentGrades,
            'learningStats' => $learningStats,
            'recentMaterials' => $recentMaterials,
        ]);
    }

    /**
     * Daftar kelas yang diikuti siswa (menu Kelas Anda).
     */
    public function myClasses(Request $request)
    {
        abort_unless(auth()->user()->can('student classes'), 403);

        $classes = auth()->user()
            ->enrolledClasses()
            ->with(['teacher'])
            ->withCount([
                'enrollments as student_count' => fn ($q) => $q->where('status', 'active'),
                'classSubjects as class_subjects_count',
            ])
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Student/Classes', [
            'classes' => $classes,
        ]);
    }

    /**
     * Get recent activities for the student
     */
    private function getRecentActivities($user)
    {
        $activities = collect();

        // Recent task submissions
        $taskSubmissions = TaskSubmission::where('student_id', $user->id)
            ->with(['task.subject', 'task.schoolClass'])
            ->latest('submitted_at')
            ->take(5)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'type' => 'task_submission',
                    'title' => 'Mengumpulkan tugas: ' . $submission->task->title,
                    'subject' => $submission->task->subject->name,
                    'class' => $submission->task->schoolClass->name,
                    'date' => $submission->submitted_at,
                    'status' => $submission->score ? 'Dinilai' : 'Menunggu penilaian',
                    'score' => $submission->score,
                ];
            });

        // Recent quiz attempts
        $quizAttempts = QuizAttempt::where('student_id', $user->id)
            ->with(['quiz.subject', 'quiz.schoolClass'])
            ->latest('finished_at')
            ->take(5)
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->id,
                    'type' => 'quiz_attempt',
                    'title' => 'Mengerjakan kuis: ' . $attempt->quiz->title,
                    'subject' => $attempt->quiz->subject->name,
                    'class' => $attempt->quiz->schoolClass->name,
                    'date' => $attempt->finished_at,
                    'status' => $attempt->passed ? 'Lulus' : 'Tidak lulus',
                    'score' => $attempt->score,
                ];
            });

        // Recent exam attempts
        $examAttempts = ExamAttempt::where('student_id', $user->id)
            ->with(['exam.subject', 'exam.schoolClass'])
            ->latest('finished_at')
            ->take(5)
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->id,
                    'type' => 'exam_attempt',
                    'title' => 'Mengikuti ujian: ' . $attempt->exam->title,
                    'subject' => $attempt->exam->subject->name,
                    'class' => $attempt->exam->schoolClass->name,
                    'date' => $attempt->finished_at,
                    'status' => $attempt->passed ? 'Lulus' : 'Tidak lulus',
                    'score' => $attempt->score,
                ];
            });

        // Combine and sort by date
        $activities = $taskSubmissions->concat($quizAttempts)->concat($examAttempts)
            ->sortByDesc('date')
            ->take(10);

        return $activities;
    }

    /**
     * Get upcoming tasks for the student
     */
    private function getUpcomingTasks($user)
    {
        return Task::whereHas('schoolClass.students', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->where('is_active', true)
            ->where('due_date', '>', now())
            ->where('due_date', '<=', now()->addDays(7))
            ->with(['subject', 'schoolClass', 'teacher'])
            ->orderBy('due_date')
            ->take(5)
            ->get()
            ->map(function ($task) {
                // Check if student has submitted
                $submitted = TaskSubmission::where('task_id', $task->id)
                    ->where('student_id', auth()->id())
                    ->exists();

                return [
                    'id' => $task->id,
                    'title' => $task->title,
                    'subject' => $task->subject->name,
                    'class' => $task->schoolClass->name,
                    'due_date' => $task->due_date,
                    'submitted' => $submitted,
                    'days_left' => now()->diffInDays($task->due_date),
                ];
            });
    }

    /**
     * Get upcoming / currently open quizzes for the student dashboard agenda.
     * Termasuk kuis yang sedang dalam jendela waktu (bukan hanya yang mulainya di masa depan).
     */
    private function getUpcomingQuizzes($user)
    {
        return Quiz::whereHas('schoolClass.enrollments', function ($query) use ($user) {
            $query->where('student_id', $user->id)->where('status', 'active');
        })
            ->where('is_active', true)
            ->where(function ($q) {
                $q->where(function ($q2) {
                    $q2->where('start_time', '>', now())
                        ->where('start_time', '<=', now()->addDays(7));
                })->orWhere(function ($q2) {
                    $q2->where('start_time', '<=', now())
                        ->where('end_time', '>=', now());
                });
            })
            ->with(['subject', 'schoolClass', 'teacher'])
            ->orderBy('start_time')
            ->take(8)
            ->get()
            ->map(function ($quiz) {
                $now = now();
                $isOpen = $quiz->start_time
                    && $quiz->end_time
                    && $now->between($quiz->start_time, $quiz->end_time);

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'subject' => $quiz->subject?->name ?? '—',
                    'class' => $quiz->schoolClass?->name ?? '—',
                    'start_time' => $quiz->start_time,
                    'end_time' => $quiz->end_time,
                    'duration_minutes' => $quiz->time_limit,
                    'days_left' => $quiz->start_time ? now()->diffInDays($quiz->start_time, false) : null,
                    'is_open' => $isOpen,
                ];
            });
    }

    /**
     * Kuis aktif di kelas siswa — untuk halaman "Kuis Saya" (bukan hanya riwayat percobaan).
     *
     * @return array<int, array<string, mixed>>
     */
    private function availableQuizzesForStudent($user): array
    {
        $quizzes = Quiz::query()
            ->whereHas('schoolClass.enrollments', function ($q) use ($user) {
                $q->where('student_id', $user->id)->where('status', 'active');
            })
            ->where('is_active', true)
            ->with(['subject', 'schoolClass', 'teacher'])
            ->withCount('questions')
            ->get();

        $now = now();
        $items = $quizzes->map(function (Quiz $quiz) use ($user, $now) {
            $st = $quiz->start_time;
            $en = $quiz->end_time;
            if (! $st || ! $en) {
                $window = 'jadwal_tidak_lengkap';
            } elseif ($now->lt($st)) {
                $window = 'belum_mulai';
            } elseif ($now->gt($en)) {
                $window = 'berakhir';
            } else {
                $window = 'buka';
            }

            $unfinished = QuizAttempt::query()
                ->where('quiz_id', $quiz->id)
                ->where('student_id', $user->id)
                ->whereNull('finished_at')
                ->first();

            $attemptsUsed = QuizAttempt::query()
                ->where('quiz_id', $quiz->id)
                ->where('student_id', $user->id)
                ->whereNotNull('finished_at')
                ->count();

            $maxAttempts = max(1, (int) $quiz->max_attempts);
            $hasQuestions = $quiz->questions_count > 0;

            return [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'subject' => $quiz->subject?->name ?? '—',
                'class' => $quiz->schoolClass?->name ?? '—',
                'start_time' => $quiz->start_time,
                'end_time' => $quiz->end_time,
                'time_limit' => $quiz->time_limit,
                'passing_score' => $quiz->passing_score,
                'questions_count' => $quiz->questions_count,
                'max_attempts' => $quiz->max_attempts,
                'window' => $window,
                'has_questions' => $hasQuestions,
                'attempts_used' => $attemptsUsed,
                'unfinished_attempt_id' => $unfinished?->id,
                'can_try' => $hasQuestions
                    && $window === 'buka'
                    && ($unfinished !== null || $attemptsUsed < $maxAttempts),
            ];
        });

        $prio = ['buka' => 0, 'belum_mulai' => 1, 'berakhir' => 2, 'jadwal_tidak_lengkap' => 3];

        return $items->sort(function ($a, $b) use ($prio) {
            $da = $prio[$a['window']] ?? 99;
            $db = $prio[$b['window']] ?? 99;
            if ($da !== $db) {
                return $da <=> $db;
            }

            return strcmp(
                (string) ($a['start_time'] ?? ''),
                (string) ($b['start_time'] ?? '')
            );
        })->values()->all();
    }

    /**
     * Get upcoming exams for the student
     */
    private function getUpcomingExams($user)
    {
        return Exam::whereHas('schoolClass.students', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->where('is_cancelled', false)
            ->where('scheduled_date', '>', now())
            ->where('scheduled_date', '<=', now()->addDays(7))
            ->with(['subject', 'schoolClass', 'teacher'])
            ->orderBy('scheduled_date')
            ->take(5)
            ->get()
            ->map(function ($exam) {
                return [
                    'id' => $exam->id,
                    'title' => $exam->title,
                    'subject' => $exam->subject->name,
                    'class' => $exam->schoolClass->name,
                    'type' => $exam->exam_type,
                    'scheduled_date' => $exam->scheduled_date,
                    'duration_minutes' => $exam->duration_minutes,
                    'days_left' => $exam->scheduled_date
                        ? now()->diffInDays($exam->scheduled_date)
                        : null,
                ];
            });
    }

    /**
     * Get recent grades for the student
     */
    private function getRecentGrades($user)
    {
        return FinalGrade::where('student_id', $user->id)
            ->with(['subject', 'component', 'calculator'])
            ->latest('calculated_at')
            ->take(10)
            ->get()
            ->map(function ($grade) {
                return [
                    'id' => $grade->id,
                    'subject' => $grade->subject->name,
                    'component' => $grade->component?->name,
                    'score' => $grade->score,
                    'remarks' => $grade->remarks,
                    'academic_year' => $grade->academic_year,
                    'calculated_at' => $grade->calculated_at,
                    'calculator' => $grade->calculator?->name,
                ];
            });
    }

    /**
     * Get learning statistics for the student
     */
    private function getLearningStats($user)
    {
        // Task completion stats
        $totalTasks = Task::whereHas('schoolClass.students', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })->count();

        $completedTasks = TaskSubmission::where('student_id', $user->id)
            ->whereNotNull('submitted_at')
            ->count();

        // Quiz stats
        $totalQuizzes = Quiz::whereHas('schoolClass.students', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })->count();

        $completedQuizzes = QuizAttempt::where('student_id', $user->id)
            ->whereNotNull('finished_at')
            ->count();

        $passedQuizzes = QuizAttempt::where('student_id', $user->id)
            ->where('passed', true)
            ->count();

        // Exam stats
        $totalExams = Exam::whereHas('schoolClass.students', function ($query) use ($user) {
            $query->where('users.id', $user->id);
        })->count();

        $completedExams = ExamAttempt::where('student_id', $user->id)
            ->whereNotNull('finished_at')
            ->count();

        $passedExams = ExamAttempt::where('student_id', $user->id)
            ->where('passed', true)
            ->count();

        // Average grades
        $averageGrade = FinalGrade::where('student_id', $user->id)->avg('score') ?? 0;

        return [
            'tasks' => [
                'total' => $totalTasks,
                'completed' => $completedTasks,
                'completion_rate' => $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0,
            ],
            'quizzes' => [
                'total' => $totalQuizzes,
                'completed' => $completedQuizzes,
                'passed' => $passedQuizzes,
                'pass_rate' => $completedQuizzes > 0 ? round(($passedQuizzes / $completedQuizzes) * 100, 1) : 0,
            ],
            'exams' => [
                'total' => $totalExams,
                'completed' => $completedExams,
                'passed' => $passedExams,
                'pass_rate' => $completedExams > 0 ? round(($passedExams / $completedExams) * 100, 1) : 0,
            ],
            'average_grade' => round($averageGrade, 1),
        ];
    }

    /**
     * Get recent materials for the student
     */
    private function getRecentMaterials($user)
    {
        return Material::whereHas('schoolClass.students', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->where('is_active', true)
            ->with(['subject', 'schoolClass', 'teacher'])
            ->latest()
            ->take(10)
            ->get()
            ->map(function ($material) {
                return [
                    'id' => $material->id,
                    'title' => $material->title,
                    'type' => $material->type,
                    'subject' => $material->subject->name,
                    'class' => $material->schoolClass->name,
                    'teacher' => $material->teacher->name,
                    'created_at' => $material->created_at,
                ];
            });
    }

    /**
     * Show detailed grade report for the student
     */
    public function grades(Request $request)
    {
        $user = auth()->user();

        $query = FinalGrade::where('student_id', $user->id)
            ->with(['subject', 'schoolClass', 'component']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('subject', function ($subjectQuery) use ($search) {
                    $subjectQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhereHas('component', function ($componentQuery) use ($search) {
                    $componentQuery->where('name', 'like', "%{$search}%");
                })
                ->orWhere('remarks', 'like', "%{$search}%");
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

        $grades = $query->orderBy('created_at', 'desc')->paginate(15);

        // Calculate statistics
        $allGrades = FinalGrade::where('student_id', $user->id)->get();
        $averageGrade = $allGrades->count() > 0 ? $allGrades->avg('score') : 0;

        $stats = [
            'totalGrades' => $allGrades->count(),
            'averageGrade' => round($averageGrade, 1),
            'highestGrade' => $allGrades->max('score') ?? 0,
            'lowestGrade' => $allGrades->min('score') ?? 0,
        ];

        // Get available subjects and classes for filters
        $subjects = $user->enrolledClasses->pluck('subjects')->flatten()->unique('id');
        $classes = $user->enrolledClasses;

        // Transform grades data for the view
        $transformedGrades = $grades->getCollection()->map(function ($grade) {
            return [
                'id' => $grade->id,
                'student_id' => $grade->student_id,
                'subject' => $grade->subject,
                'class' => $grade->schoolClass,
                'assessment_type' => $grade->component ? $grade->component->name : 'Final Grade',
                'assessment' => [
                    'title' => $grade->component ? $grade->component->name : 'Nilai Akhir',
                    'description' => $grade->remarks,
                ],
                'score' => $grade->score,
                'status' => 'published',
                'feedback' => $grade->remarks,
                'created_at' => $grade->created_at,
            ];
        });

        $grades->setCollection($transformedGrades);

        return Inertia::render('Student/Grades', [
            'grades' => $grades,
            'stats' => $stats,
            'subjects' => $subjects,
            'classes' => $classes,
            'filters' => $request->only(['search', 'subject_id', 'class_id'])
        ]);
    }

    /**
     * Daftar tugas di kelas siswa (dengan pengumpulan jika ada).
     */
    public function tasks(Request $request)
    {
        $user = auth()->user();

        $query = Task::query()
            ->whereHas('schoolClass.enrollments', function ($q) use ($user) {
                $q->where('student_id', $user->id)->where('status', 'active');
            })
            ->where('is_active', true)
            ->with([
                'subject',
                'schoolClass',
                'submissions' => function ($q) use ($user) {
                    $q->where('student_id', $user->id);
                },
            ])
            ->latest('due_date');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                    ->orWhere('description', 'like', "%{$s}%");
            });
        }

        $tasks = $query->paginate(15)->withQueryString();

        return Inertia::render('Student/Tasks', [
            'tasks' => $tasks,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show student's quiz attempts
     */
    public function quizzes()
    {
        $user = auth()->user();
        $studentId = $user->id;

        $summary = [
            'total_attempts' => QuizAttempt::where('student_id', $studentId)->count(),
            'passed' => QuizAttempt::where('student_id', $studentId)->where('passed', true)->count(),
            'avg_score' => round(
                (float) (QuizAttempt::where('student_id', $studentId)->whereNotNull('score')->avg('score') ?? 0),
                1
            ),
        ];

        $attempts = QuizAttempt::where('student_id', $studentId)
            ->with(['quiz.subject', 'quiz.schoolClass', 'quiz.teacher'])
            ->latest('finished_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Student/Quizzes', [
            'attempts' => $attempts,
            'summary' => $summary,
            'availableQuizzes' => $this->availableQuizzesForStudent($user),
            'filters' => [],
        ]);
    }

    /**
     * Show student's exam attempts
     */
    public function exams()
    {
        $user = auth()->user();
        $studentId = $user->id;

        $summary = [
            'total_attempts' => ExamAttempt::where('student_id', $studentId)->count(),
            'passed' => ExamAttempt::where('student_id', $studentId)->where('passed', true)->count(),
            'avg_score' => round(
                (float) (ExamAttempt::where('student_id', $studentId)->whereNotNull('score')->avg('score') ?? 0),
                1
            ),
        ];

        $attempts = ExamAttempt::where('student_id', $studentId)
            ->with(['exam.subject', 'exam.schoolClass', 'exam.teacher'])
            ->latest('finished_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Student/Exams', [
            'attempts' => $attempts,
            'summary' => $summary,
            'filters' => [],
        ]);
    }

    /**
     * Riwayat kelas (setelah naik kelas / pindah — tidak bisa akses lagi ke kelas lama).
     * Sertakan nilai (FinalGrade) per kelas agar siswa melihat rekap di kelas tersebut.
     */
    public function enrollmentHistory()
    {
        abort_unless(auth()->user()->hasRole('siswa'), 403);

        $studentId = auth()->id();

        $enrollments = auth()->user()
            ->enrollmentHistory()
            ->with('schoolClass.teacher')
            ->get();

        $history = $enrollments->map(function ($enrollment) use ($studentId) {
            $finalGrades = FinalGrade::query()
                ->where('student_id', $studentId)
                ->where('class_id', $enrollment->class_id)
                ->with(['subject', 'component'])
                ->orderBy('subject_id')
                ->orderBy('component_id')
                ->get();

            $taskScores = TaskSubmission::query()
                ->where('student_id', $studentId)
                ->whereNotNull('score')
                ->whereHas('task', fn ($q) => $q->where('class_id', $enrollment->class_id))
                ->with('task.subject')
                ->latest('graded_at')
                ->get()
                ->map(fn ($x) => [
                    'id' => 'task-'.$x->id,
                    'type' => 'Tugas',
                    'title' => $x->task?->title ?? 'Tugas',
                    'subject' => $x->task?->subject?->name ?? '—',
                    'score' => $x->score,
                    'assessed_at' => $x->graded_at ?? $x->submitted_at,
                ]);

            $quizScores = QuizAttempt::query()
                ->where('student_id', $studentId)
                ->whereNotNull('score')
                ->whereHas('quiz', fn ($q) => $q->where('class_id', $enrollment->class_id))
                ->with('quiz.subject')
                ->latest('finished_at')
                ->get()
                ->map(fn ($x) => [
                    'id' => 'quiz-'.$x->id,
                    'type' => 'Kuis',
                    'title' => $x->quiz?->title ?? 'Kuis',
                    'subject' => $x->quiz?->subject?->name ?? '—',
                    'score' => $x->score,
                    'assessed_at' => $x->finished_at,
                ]);

            $examScores = ExamAttempt::query()
                ->where('student_id', $studentId)
                ->whereNotNull('score')
                ->whereHas('exam', fn ($q) => $q->where('class_id', $enrollment->class_id))
                ->with('exam.subject')
                ->latest('finished_at')
                ->get()
                ->map(fn ($x) => [
                    'id' => 'exam-'.$x->id,
                    'type' => 'Ujian',
                    'title' => $x->exam?->title ?? 'Ujian',
                    'subject' => $x->exam?->subject?->name ?? '—',
                    'score' => $x->score,
                    'assessed_at' => $x->finished_at,
                ]);

            $activityScores = $taskScores
                ->concat($quizScores)
                ->concat($examScores)
                ->sortByDesc('assessed_at')
                ->values();

            $combinedScores = collect($finalGrades->pluck('score'))
                ->concat($activityScores->pluck('score'))
                ->filter(fn ($v) => $v !== null);

            return [
                'enrollment_id' => $enrollment->id,
                'left_at' => $enrollment->left_at,
                'notes' => $enrollment->notes,
                'school_class' => $enrollment->schoolClass,
                'final_grades' => $finalGrades,
                'activity_scores' => $activityScores,
                'grades_average' => $combinedScores->isEmpty()
                    ? null
                    : round((float) $combinedScores->avg(), 1),
            ];
        });

        return Inertia::render('Student/EnrollmentHistory', [
            'history' => $history,
        ]);
    }

    /**
     * Convert numeric score to letter grade
     */
    private function getGradeLetter($score)
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'E';
    }
}
