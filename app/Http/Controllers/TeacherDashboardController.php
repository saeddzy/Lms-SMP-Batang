<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\Task;
use App\Models\Quiz;
use App\Models\Exam;
use App\Models\Material;
use App\Models\FinalGrade;
use App\Models\TaskSubmission;
use App\Models\QuizAttempt;
use App\Models\ExamAttempt;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Carbon\Carbon;

class TeacherDashboardController extends Controller
{
    /**
     * Display the teacher dashboard.
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Kelas di mana guru mengajar (class_subjects), bukan hanya sebagai wali
        $taughtClasses = SchoolClass::whereHas('classSubjects', function ($q) use ($user) {
            $q->forTeacher($user);
        })
            ->with(['teacher', 'classSubjects.subject', 'classSubjects.teacher', 'classSubjects.subject.teacher', 'students'])
            ->distinct()
            ->get();

        // Get recent activities
        $recentActivities = $this->getRecentActivities($user);

        // Get class statistics
        $classStats = $this->getClassStats($user);

        // Get pending grading tasks
        $pendingGradings = $this->getPendingGradings($user);

        // Get upcoming schedules
        $upcomingSchedules = $this->getUpcomingSchedules($user);

        // Get teaching statistics
        $teachingStats = $this->getTeachingStats($user);

        return Inertia::render('Dashboard/TeacherDashboard', [
            'taughtClasses' => $taughtClasses,
            'recentActivities' => $recentActivities,
            'classStats' => $classStats,
            'pendingGradings' => $pendingGradings,
            'upcomingSchedules' => $upcomingSchedules,
            'teachingStats' => $teachingStats,
        ]);
    }

    /**
     * Get recent activities for the teacher
     */
    private function getRecentActivities($user)
    {
        $activities = collect();

        // Recent task submissions that need grading
        $taskSubmissions = TaskSubmission::whereHas('task', function ($query) use ($user) {
                $query->whereHas('classSubject', function ($q) use ($user) {
                    $q->forTeacher($user);
                });
            })
            ->with(['task.subject', 'task.schoolClass', 'student'])
            ->latest('submitted_at')
            ->take(5)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'type' => 'task_submission',
                    'title' => 'Tugas dikumpulkan: ' . $submission->task->title,
                    'student' => $submission->student->name,
                    'subject' => $submission->task->subject->name,
                    'class' => $submission->task->schoolClass->name,
                    'date' => $submission->submitted_at,
                    'status' => $submission->score ? 'Sudah dinilai' : 'Perlu dinilai',
                    'action_url' => route('tasks.show', $submission->task),
                ];
            });

        // Recent quiz attempts
        $quizAttempts = QuizAttempt::whereHas('quiz', function ($query) use ($user) {
                $query->whereHas('classSubject', function ($q) use ($user) {
                    $q->forTeacher($user);
                });
            })
            ->with(['quiz.subject', 'quiz.schoolClass', 'student'])
            ->latest('finished_at')
            ->take(5)
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->id,
                    'type' => 'quiz_attempt',
                    'title' => 'Kuis dikerjakan: ' . $attempt->quiz->title,
                    'student' => $attempt->student->name,
                    'subject' => $attempt->quiz->subject->name,
                    'class' => $attempt->quiz->schoolClass->name,
                    'date' => $attempt->finished_at,
                    'score' => $attempt->score,
                    'passed' => $attempt->passed,
                ];
            });

        // Recent exam attempts
        $examAttempts = ExamAttempt::whereHas('exam', function ($query) use ($user) {
                $query->whereHas('classSubject', function ($q) use ($user) {
                    $q->forTeacher($user);
                });
            })
            ->with(['exam.subject', 'exam.schoolClass', 'student'])
            ->latest('finished_at')
            ->take(5)
            ->get()
            ->map(function ($attempt) {
                return [
                    'id' => $attempt->id,
                    'type' => 'exam_attempt',
                    'title' => 'Ujian dikerjakan: ' . $attempt->exam->title,
                    'student' => $attempt->student->name,
                    'subject' => $attempt->exam->subject->name,
                    'class' => $attempt->exam->schoolClass->name,
                    'date' => $attempt->finished_at,
                    'score' => $attempt->score,
                    'passed' => $attempt->passed,
                ];
            });

        // Recent materials created
        $materials = Material::where('teacher_id', $user->id)
            ->with(['subject', 'schoolClass'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($material) {
                return [
                    'id' => $material->id,
                    'type' => 'material_created',
                    'title' => 'Materi dibuat: ' . $material->title,
                    'subject' => $material->subject->name,
                    'class' => $material->schoolClass->name,
                    'date' => $material->created_at,
                ];
            });

        // Combine and sort by date
        $activities = $taskSubmissions->concat($quizAttempts)->concat($examAttempts)->concat($materials)
            ->sortByDesc('date')
            ->take(10);

        return $activities;
    }

    /**
     * Get class statistics for the teacher
     */
    private function getClassStats($user)
    {
        $classes = SchoolClass::whereHas('classSubjects', function ($q) use ($user) {
            $q->forTeacher($user);
        })
            ->with('students')
            ->distinct()
            ->get();

        return $classes->map(function ($class) {
            $studentCount = $class->students->count();

            // Task completion rate
            $totalTasks = Task::where('class_id', $class->id)->count();
            $completedTasks = TaskSubmission::whereHas('task', function ($query) use ($class) {
                $query->where('class_id', $class->id);
            })->distinct('student_id')->count('student_id');
            $taskCompletionRate = $studentCount > 0 ? round(($completedTasks / $studentCount) * 100, 1) : 0;

            // Average class grade
            $averageGrade = FinalGrade::where('class_id', $class->id)->avg('score') ?? 0;

            return [
                'id' => $class->id,
                'name' => $class->name,
                'student_count' => $studentCount,
                'task_completion_rate' => $taskCompletionRate,
                'average_grade' => round($averageGrade, 1),
                'total_tasks' => $totalTasks,
            ];
        });
    }

    /**
     * Get pending grading tasks for the teacher
     */
    private function getPendingGradings($user)
    {
        // Ungraded task submissions
        $ungradedTasks = TaskSubmission::whereHas('task', function ($query) use ($user) {
                $query->whereHas('classSubject', function ($q) use ($user) {
                    $q->forTeacher($user);
                });
            })
            ->whereNull('score')
            ->with(['task.subject', 'task.schoolClass', 'student'])
            ->latest('submitted_at')
            ->take(10)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'type' => 'task',
                    'title' => $submission->task->title,
                    'student' => $submission->student->name,
                    'subject' => $submission->task->subject->name,
                    'class' => $submission->task->schoolClass->name,
                    'submitted_at' => $submission->submitted_at,
                    'action_url' => route('tasks.show', $submission->task),
                ];
            });

        return $ungradedTasks;
    }

    /**
     * Get upcoming schedules for the teacher
     */
    private function getUpcomingSchedules($user)
    {
        $schedules = collect();

        // Upcoming quizzes
        $upcomingQuizzes = Quiz::whereHas('classSubject', function ($q) use ($user) {
                $q->forTeacher($user);
            })
            ->where('is_active', true)
            ->where('start_time', '>', now())
            ->where('start_time', '<=', now()->addDays(7))
            ->with(['subject', 'schoolClass'])
            ->orderBy('start_time')
            ->take(5)
            ->get()
            ->map(function ($quiz) {
                return [
                    'id' => $quiz->id,
                    'type' => 'quiz',
                    'title' => $quiz->title,
                    'subject' => $quiz->subject->name,
                    'class' => $quiz->schoolClass->name,
                    'scheduled_time' => $quiz->start_time,
                    'duration_minutes' => $quiz->duration_minutes,
                ];
            });

        // Upcoming exams
        $upcomingExams = Exam::whereHas('classSubject', function ($q) use ($user) {
                $q->forTeacher($user);
            })
            ->where('is_cancelled', false)
            ->where('scheduled_date', '>', now())
            ->where('scheduled_date', '<=', now()->addDays(7))
            ->with(['subject', 'schoolClass'])
            ->orderBy('scheduled_date')
            ->take(5)
            ->get()
            ->map(function ($exam) {
                return [
                    'id' => $exam->id,
                    'type' => 'exam',
                    'title' => $exam->title,
                    'subject' => $exam->subject->name,
                    'class' => $exam->schoolClass->name,
                    'exam_type' => $exam->type,
                    'scheduled_time' => $exam->scheduled_date,
                    'duration_minutes' => $exam->duration_minutes,
                ];
            });

        // Upcoming task deadlines
        $upcomingDeadlines = Task::whereHas('classSubject', function ($q) use ($user) {
                $q->forTeacher($user);
            })
            ->where('is_active', true)
            ->where('due_date', '>', now())
            ->where('due_date', '<=', now()->addDays(7))
            ->with(['subject', 'schoolClass'])
            ->orderBy('due_date')
            ->take(5)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'type' => 'task_deadline',
                    'title' => 'Deadline tugas: ' . $task->title,
                    'subject' => $task->subject->name,
                    'class' => $task->schoolClass->name,
                    'scheduled_time' => $task->due_date,
                ];
            });

        $schedules = $upcomingQuizzes->concat($upcomingExams)->concat($upcomingDeadlines)
            ->sortBy('scheduled_time')
            ->take(10);

        return $schedules;
    }

    /**
     * Get teaching statistics for the teacher
     */
    private function getTeachingStats($user)
    {
        // Content creation stats
        $materialsCount = Material::where('teacher_id', $user->id)->count();
        $tasksCount = Task::whereHas('classSubject', function ($q) use ($user) {
            $q->forTeacher($user);
        })->count();
        $quizzesCount = Quiz::whereHas('classSubject', function ($q) use ($user) {
            $q->forTeacher($user);
        })->count();
        $examsCount = Exam::whereHas('classSubject', function ($q) use ($user) {
            $q->forTeacher($user);
        })->count();

        // Student engagement stats
        $totalStudents = SchoolClass::whereHas('classSubjects', function ($q) use ($user) {
            $q->forTeacher($user);
        })
            ->with('students')
            ->distinct()
            ->get()
            ->pluck('students')
            ->flatten()
            ->unique('id')
            ->count();

        // Grading stats
        $gradedTasks = TaskSubmission::whereHas('task', function ($query) use ($user) {
            $query->whereHas('classSubject', function ($q) use ($user) {
                $q->forTeacher($user);
            });
        })->whereNotNull('score')->count();

        $totalSubmissions = TaskSubmission::whereHas('task', function ($query) use ($user) {
            $query->whereHas('classSubject', function ($q) use ($user) {
                $q->forTeacher($user);
            });
        })->count();

        $gradingCompletionRate = $totalSubmissions > 0 ? round(($gradedTasks / $totalSubmissions) * 100, 1) : 0;

        $averageClassGrade = FinalGrade::whereHas('schoolClass.classSubjects', function ($query) use ($user) {
            $query->where('teacher_id', $user->id)
                ->whereColumn('class_subjects.subject_id', 'final_grades.subject_id');
        })->avg('score') ?? 0;

        return [
            'content_created' => [
                'materials' => $materialsCount,
                'tasks' => $tasksCount,
                'quizzes' => $quizzesCount,
                'exams' => $examsCount,
                'total' => $materialsCount + $tasksCount + $quizzesCount + $examsCount,
            ],
            'students' => $totalStudents,
            'grading' => [
                'completed' => $gradedTasks,
                'total' => $totalSubmissions,
                'completion_rate' => $gradingCompletionRate,
            ],
            'average_class_grade' => round($averageClassGrade, 1),
        ];
    }

    /**
     * Show detailed class management view
     */
    public function classDetail(SchoolClass $class)
    {
        Gate::authorize('view', $class);

        $class->load(['students', 'subject']);

        // Get class performance data
        $performanceData = $this->getClassPerformanceData($class);

        // Get recent submissions
        $recentSubmissions = TaskSubmission::whereHas('task', function ($query) use ($class) {
                $query->where('class_id', $class->id);
            })
            ->with(['task', 'student'])
            ->latest('submitted_at')
            ->take(10)
            ->get();

        return Inertia::render('TeacherDashboard/ClassDetail', [
            'class' => $class,
            'performanceData' => $performanceData,
            'recentSubmissions' => $recentSubmissions,
        ]);
    }

    /**
     * Get performance data for a specific class
     */
    private function getClassPerformanceData($class)
    {
        // Student grades overview
        $studentGrades = FinalGrade::where('class_id', $class->id)
            ->with('student')
            ->selectRaw('student_id, AVG(score) as avg_score')
            ->groupBy('student_id')
            ->get()
            ->map(function ($grade) {
                return [
                    'student' => $grade->student->name,
                    'average_score' => round($grade->avg_score, 1),
                ];
            })
            ->sortByDesc('average_score');

        // Task completion rates
        $tasks = Task::where('class_id', $class->id)->with('submissions')->get();
        $taskCompletionData = $tasks->map(function ($task) {
            $totalStudents = $task->schoolClass->students->count();
            $submissionsCount = $task->submissions->count();
            $completionRate = $totalStudents > 0 ? round(($submissionsCount / $totalStudents) * 100, 1) : 0;

            return [
                'task' => $task->title,
                'completion_rate' => $completionRate,
                'submitted' => $submissionsCount,
                'total' => $totalStudents,
            ];
        });

        // Quiz performance
        $quizzes = Quiz::where('class_id', $class->id)->with('attempts')->get();
        $quizPerformanceData = $quizzes->map(function ($quiz) {
            $attempts = $quiz->attempts;
            $averageScore = $attempts->avg('score') ?? 0;
            $passRate = $attempts->count() > 0 ? round(($attempts->where('passed', true)->count() / $attempts->count()) * 100, 1) : 0;

            return [
                'quiz' => $quiz->title,
                'average_score' => round($averageScore, 1),
                'pass_rate' => $passRate,
                'attempts' => $attempts->count(),
            ];
        });

        return [
            'student_grades' => $studentGrades,
            'task_completion' => $taskCompletionData,
            'quiz_performance' => $quizPerformanceData,
        ];
    }

    /**
     * Show grading interface for a specific task
     */
    public function gradeTask(Task $task)
    {
        $task->loadMissing('classSubject.subject');
        if (!$task->classSubject || !$task->classSubject->isTaughtBy(auth()->user())) {
            abort(403);
        }

        $task->load(['schoolClass.students', 'subject', 'submissions.student']);

        $submissions = $task->submissions()->with('student')->get();

        return Inertia::render('TeacherDashboard/GradeTask', [
            'task' => $task,
            'submissions' => $submissions,
        ]);
    }
}
