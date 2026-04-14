<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Subject;
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

class AdminDashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request)
    {
        // System overview statistics
        $systemStats = $this->getSystemStats();

        // User statistics
        $userStats = $this->getUserStats();

        // Content statistics
        $contentStats = $this->getContentStats();

        // Academic performance overview
        $academicStats = $this->getAcademicStats();

        // Recent system activities
        $recentActivities = $this->getRecentActivities();

        // System alerts and notifications
        $systemAlerts = $this->getSystemAlerts();

        return Inertia::render('Dashboard/AdminDashboard', [
            'systemStats' => $systemStats,
            'userStats' => $userStats,
            'contentStats' => $contentStats,
            'academicStats' => $academicStats,
            'recentActivities' => $recentActivities,
            'systemAlerts' => $systemAlerts,
        ]);
    }

    /**
     * Get overall system statistics
     */
    private function getSystemStats()
    {
        return [
            'total_users' => User::count(),
            'total_classes' => SchoolClass::count(),
            'total_subjects' => Subject::count(),
            'active_classes' => SchoolClass::where('is_active', true)->count(),
            'total_materials' => Material::count(),
            'total_tasks' => Task::count(),
            'total_quizzes' => Quiz::count(),
            'total_exams' => Exam::count(),
            'total_grades' => FinalGrade::count(),
        ];
    }

    /**
     * Get user statistics by role
     */
    private function getUserStats()
    {
        $totalUsers = User::count();
        $adminUsers = User::role('admin')->count();
        $teacherUsers = User::role('guru')->count();
        $studentUsers = User::role('siswa')->count();

        // Recent user registrations (last 30 days)
        $recentRegistrations = User::where('created_at', '>=', now()->subDays(30))->count();

        // Active users (users who logged in within last 7 days)
        $activeUsers = User::where('last_login_at', '>=', now()->subDays(7))->count();

        return [
            'total' => $totalUsers,
            'admins' => $adminUsers,
            'teachers' => $teacherUsers,
            'students' => $studentUsers,
            'recent_registrations' => $recentRegistrations,
            'active_users' => $activeUsers,
            'distribution' => [
                'admins_percentage' => $totalUsers > 0 ? round(($adminUsers / $totalUsers) * 100, 1) : 0,
                'teachers_percentage' => $totalUsers > 0 ? round(($teacherUsers / $totalUsers) * 100, 1) : 0,
                'students_percentage' => $totalUsers > 0 ? round(($studentUsers / $totalUsers) * 100, 1) : 0,
            ]
        ];
    }

    /**
     * Get content creation statistics
     */
    private function getContentStats()
    {
        // Content created in last 30 days
        $recentMaterials = Material::where('created_at', '>=', now()->subDays(30))->count();
        $recentTasks = Task::where('created_at', '>=', now()->subDays(30))->count();
        $recentQuizzes = Quiz::where('created_at', '>=', now()->subDays(30))->count();
        $recentExams = Exam::where('created_at', '>=', now()->subDays(30))->count();

        // Most active teachers (by content creation)
        $mostActiveTeachers = User::role('guru')
            ->withCount(['materials', 'tasks', 'quizzes', 'exams'])
            ->orderByRaw('materials_count + tasks_count + quizzes_count + exams_count DESC')
            ->take(5)
            ->get()
            ->map(function ($teacher) {
                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'materials_count' => $teacher->materials_count,
                    'tasks_count' => $teacher->tasks_count,
                    'quizzes_count' => $teacher->quizzes_count,
                    'exams_count' => $teacher->exams_count,
                    'total_content' => $teacher->materials_count + $teacher->tasks_count + $teacher->quizzes_count + $teacher->exams_count,
                ];
            });

        return [
            'recent_content' => [
                'materials' => $recentMaterials,
                'tasks' => $recentTasks,
                'quizzes' => $recentQuizzes,
                'exams' => $recentExams,
                'total' => $recentMaterials + $recentTasks + $recentQuizzes + $recentExams,
            ],
            'most_active_teachers' => $mostActiveTeachers,
        ];
    }

    /**
     * Get academic performance statistics
     */
    private function getAcademicStats()
    {
        // Overall average grade
        $overallAverage = FinalGrade::avg('score') ?? 0;

        // Grade distribution
        $gradeDistribution = FinalGrade::selectRaw('
                CASE
                    WHEN score >= 90 THEN "A"
                    WHEN score >= 80 THEN "B"
                    WHEN score >= 70 THEN "C"
                    WHEN score >= 60 THEN "D"
                    ELSE "E"
                END as grade_letter,
                COUNT(*) as count
            ')
            ->groupBy('grade_letter')
            ->get()
            ->pluck('count', 'grade_letter')
            ->toArray();

        // Task completion rate
        $totalTasks = Task::count();
        $completedTasks = TaskSubmission::distinct('task_id')->count('task_id');
        $taskCompletionRate = $totalTasks > 0 ? round(($completedTasks / $totalTasks) * 100, 1) : 0;

        // Quiz pass rate
        $totalQuizAttempts = QuizAttempt::count();
        $passedQuizAttempts = QuizAttempt::where('passed', true)->count();
        $quizPassRate = $totalQuizAttempts > 0 ? round(($passedQuizAttempts / $totalQuizAttempts) * 100, 1) : 0;

        // Exam pass rate
        $totalExamAttempts = ExamAttempt::count();
        $passedExamAttempts = ExamAttempt::where('passed', true)->count();
        $examPassRate = $totalExamAttempts > 0 ? round(($passedExamAttempts / $totalExamAttempts) * 100, 1) : 0;

        // Top performing classes
        $topClasses = SchoolClass::with('teacher')
            ->select('school_classes.*')
            ->selectRaw('AVG(final_grades.score) as avg_grade')
            ->leftJoin('final_grades', 'school_classes.id', '=', 'final_grades.class_id')
            ->groupBy('school_classes.id')
            ->orderByRaw('AVG(final_grades.score) DESC')
            ->take(5)
            ->get()
            ->map(function ($class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'teacher' => $class->teacher?->name,
                    'average_grade' => round($class->avg_grade ?? 0, 1),
                ];
            });

        return [
            'overall_average' => round($overallAverage, 1),
            'grade_distribution' => $gradeDistribution,
            'completion_rates' => [
                'tasks' => $taskCompletionRate,
                'quizzes' => $quizPassRate,
                'exams' => $examPassRate,
            ],
            'top_classes' => $topClasses,
        ];
    }

    /**
     * Get recent system activities
     */
    private function getRecentActivities()
    {
        $activities = collect();

        // Recent user registrations
        $recentUsers = User::latest()->take(5)->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'type' => 'user_registration',
                'title' => 'User baru terdaftar: ' . $user->name,
                'date' => $user->created_at,
                'details' => 'Role: ' . ($user->roles->first()?->name ?? 'No role'),
            ];
        });

        // Recent content creation
        $recentMaterials = Material::with(['teacher', 'subject'])->latest()->take(3)->get()->map(function ($material) {
            return [
                'id' => $material->id,
                'type' => 'content_created',
                'title' => 'Materi baru: ' . $material->title,
                'date' => $material->created_at,
                'details' => 'Oleh: ' . $material->teacher->name . ' - ' . $material->subject->name,
            ];
        });

        $recentTasks = Task::with(['teacher', 'subject'])->latest()->take(3)->get()->map(function ($task) {
            return [
                'id' => $task->id,
                'type' => 'content_created',
                'title' => 'Tugas baru: ' . $task->title,
                'date' => $task->created_at,
                'details' => 'Oleh: ' . $task->teacher->name . ' - ' . $task->subject->name,
            ];
        });

        // Recent grades
        $recentGrades = FinalGrade::with(['student', 'calculator', 'subject'])->latest('calculated_at')->take(3)->get()->map(function ($grade) {
            return [
                'id' => $grade->id,
                'type' => 'grade_given',
                'title' => 'Nilai diberikan: ' . $grade->student->name,
                'date' => $grade->calculated_at,
                'details' => $grade->subject->name . ' - ' . $grade->score,
            ];
        });

        $activities = $recentUsers->concat($recentMaterials)->concat($recentTasks)->concat($recentGrades)
            ->sortByDesc('date')
            ->take(10);

        return $activities;
    }

    /**
     * Get system alerts and notifications
     */
    private function getSystemAlerts()
    {
        $alerts = [];

        // Check for overdue tasks
        $overdueTasks = Task::where('due_date', '<', now())
            ->where('is_active', true)
            ->count();
        if ($overdueTasks > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Tugas Melewati Deadline',
                'message' => "Ada {$overdueTasks} tugas yang sudah melewati deadline.",
                'action_url' => route('tasks.index', ['status' => 'overdue']),
            ];
        }

        // Check for ungraded submissions
        $ungradedSubmissions = TaskSubmission::whereNull('score')->count();
        if ($ungradedSubmissions > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Pengumpulan Tugas Belum Dinilai',
                'message' => "Ada {$ungradedSubmissions} pengumpulan tugas yang belum dinilai.",
                'action_url' => route('admin.ungraded-submissions'),
            ];
        }

        // Check for upcoming exams
        $upcomingExams = Exam::where('scheduled_date', '>', now())
            ->where('scheduled_date', '<=', now()->addDays(1))
            ->where('is_cancelled', false)
            ->count();
        if ($upcomingExams > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Ujian Mendatang',
                'message' => "Ada {$upcomingExams} ujian yang akan dilaksanakan dalam 24 jam ke depan.",
                'action_url' => route('exams.index'),
            ];
        }

        // Check for low-performing classes
        $lowPerformingClasses = SchoolClass::select('school_classes.*')
            ->selectRaw('AVG(final_grades.score) as avg_grade')
            ->leftJoin('final_grades', 'school_classes.id', '=', 'final_grades.class_id')
            ->groupBy('school_classes.id')
            ->havingRaw('AVG(final_grades.score) < 60')
            ->count();
        if ($lowPerformingClasses > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Kelas dengan Performa Rendah',
                'message' => "Ada {$lowPerformingClasses} kelas dengan rata-rata nilai di bawah 60.",
                'action_url' => route('admin.class-performance'),
            ];
        }

        return $alerts;
    }

    /**
     * Show system reports
     */
    public function reports(Request $request)
    {
        $reportType = $request->get('type', 'overview');
        $startDate = $request->get('start_date', now()->subDays(30)->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->format('Y-m-d'));

        $reports = [];

        switch ($reportType) {
            case 'user_activity':
                $reports = $this->getUserActivityReport($startDate, $endDate);
                break;
            case 'academic_performance':
                $reports = $this->getAcademicPerformanceReport($startDate, $endDate);
                break;
            case 'content_usage':
                $reports = $this->getContentUsageReport($startDate, $endDate);
                break;
            default:
                $reports = $this->getOverviewReport($startDate, $endDate);
        }

        return Inertia::render('AdminDashboard/Reports', [
            'reports' => $reports,
            'reportType' => $reportType,
            'dateRange' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
        ]);
    }

    /**
     * Get overview report
     */
    private function getOverviewReport($startDate, $endDate)
    {
        return [
            'user_registrations' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
            'content_created' => Material::whereBetween('created_at', [$startDate, $endDate])->count() +
                                Task::whereBetween('created_at', [$startDate, $endDate])->count() +
                                Quiz::whereBetween('created_at', [$startDate, $endDate])->count() +
                                Exam::whereBetween('created_at', [$startDate, $endDate])->count(),
            'grades_given' => FinalGrade::whereBetween('calculated_at', [$startDate, $endDate])->count(),
            'task_submissions' => TaskSubmission::whereBetween('submitted_at', [$startDate, $endDate])->count(),
            'quiz_attempts' => QuizAttempt::whereBetween('started_at', [$startDate, $endDate])->count(),
            'exam_attempts' => ExamAttempt::whereBetween('started_at', [$startDate, $endDate])->count(),
        ];
    }

    /**
     * Get user activity report
     */
    private function getUserActivityReport($startDate, $endDate)
    {
        return [
            'daily_active_users' => User::whereBetween('last_login_at', [$startDate, $endDate])
                ->selectRaw('DATE(last_login_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'new_registrations' => User::whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'role_distribution' => [
                'admins' => User::role('admin')->count(),
                'teachers' => User::role('guru')->count(),
                'students' => User::role('siswa')->count(),
            ],
        ];
    }

    /**
     * Get academic performance report
     */
    private function getAcademicPerformanceReport($startDate, $endDate)
    {
        return [
            'average_grades_by_subject' => FinalGrade::whereBetween('calculated_at', [$startDate, $endDate])
                ->with('subject')
                ->selectRaw('subject_id, AVG(score) as avg_score')
                ->groupBy('subject_id')
                ->get()
                ->map(function ($grade) {
                    return [
                        'subject' => $grade->subject->name,
                        'average_score' => round($grade->avg_score, 1),
                    ];
                }),
            'grade_distribution' => FinalGrade::whereBetween('calculated_at', [$startDate, $endDate])
                ->selectRaw('
                    CASE
                        WHEN score >= 90 THEN "A"
                        WHEN score >= 80 THEN "B"
                        WHEN score >= 70 THEN "C"
                        WHEN score >= 60 THEN "D"
                        ELSE "E"
                    END as grade, COUNT(*) as count
                ')
                ->groupBy('grade')
                ->get(),
            'completion_rates' => [
                'tasks' => $this->calculateCompletionRate(Task::class, TaskSubmission::class, 'task_id', $startDate, $endDate),
                'quizzes' => $this->calculateCompletionRate(Quiz::class, QuizAttempt::class, 'quiz_id', $startDate, $endDate),
                'exams' => $this->calculateCompletionRate(Exam::class, ExamAttempt::class, 'exam_id', $startDate, $endDate),
            ],
        ];
    }

    /**
     * Get content usage report
     */
    private function getContentUsageReport($startDate, $endDate)
    {
        return [
            'most_viewed_materials' => Material::withCount(['views' => function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }])
                ->orderBy('views_count', 'desc')
                ->take(10)
                ->get(),
            'task_completion_trends' => TaskSubmission::whereBetween('submitted_at', [$startDate, $endDate])
                ->selectRaw('DATE(submitted_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'quiz_attempt_trends' => QuizAttempt::whereBetween('started_at', [$startDate, $endDate])
                ->selectRaw('DATE(started_at) as date, COUNT(*) as count')
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
        ];
    }

    /**
     * Calculate completion rate for assessments
     */
    private function calculateCompletionRate($modelClass, $attemptClass, $foreignKey, $startDate, $endDate)
    {
        $totalItems = $modelClass::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedItems = $attemptClass::whereBetween('created_at', [$startDate, $endDate])
            ->distinct($foreignKey)
            ->count($foreignKey);

        return $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 1) : 0;
    }
}
