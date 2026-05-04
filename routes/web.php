<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\ExamAttemptController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StudentDashboardController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TeacherDashboardController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/contact', function () {
    return Inertia::render('Contact', [
        'canLogin' => Route::has('login'),
    ]);
})->name('contact');

Route::get('/fitur', function () {
    return Inertia::render('Features', [
        'canLogin' => Route::has('login'),
    ]);
})->name('features');

Route::get('/dashboard', function () {
    $user = auth()->user();

    if ($user?->hasRole('admin')) {
        return redirect()->route('admin.dashboard');
    }

    if ($user?->hasRole('guru')) {
        return redirect()->route('teacher.dashboard');
    }

    if ($user?->hasRole('siswa')) {
        return redirect()->route('student.dashboard');
    }

    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // permissions route
    Route::resource('/permissions', PermissionController::class);
    // roles route
    Route::resource('roles', RoleController::class)->except('show');
    // users route
    Route::resource('/users', UserController::class);
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // LMS Routes
    // Classes
    Route::resource('classes', ClassController::class);
    Route::post('classes/{class}/enroll-students', [ClassController::class, 'enrollStudents'])->name('classes.enroll-students');
    Route::post('classes/{class}/promote-students', [ClassController::class, 'promoteStudents'])->name('classes.promote-students');
    Route::delete('classes/{class}/remove-student/{student}', [ClassController::class, 'removeStudent'])->name('classes.remove-student');
    Route::patch('classes/{class}/toggle-active', [ClassController::class, 'toggleActive'])->name('classes.toggle-active');

    // Subjects
    Route::resource('subjects', SubjectController::class);

    // Materials — file harus sebelum resource agar /materials/{id}/file tidak tertangkap sebagai {material}
    Route::get('materials/{material}/file', [MaterialController::class, 'serveFile'])->name('materials.file');
    Route::resource('materials', MaterialController::class);
    Route::patch('materials/{material}/toggle-status', [MaterialController::class, 'toggleStatus'])->name('materials.toggle-status');
    Route::post('materials/{material}/duplicate', [MaterialController::class, 'duplicate'])->name('materials.duplicate');

    // Tasks — rute submit sebelum resource agar {task} tidak tertangkap sebagai "submit"
    Route::get('tasks/{task}/submit', [TaskController::class, 'submitPage'])->name('tasks.submit-page');
    Route::post('tasks/{task}/submit', [TaskController::class, 'submit'])->name('tasks.submit');
    Route::get('tasks/{task}/submissions/{submission}/file', [TaskController::class, 'downloadSubmissionFile'])->name('tasks.submission.file');
    Route::post('tasks/{task}/grade/{submission}', [TaskController::class, 'gradeSubmission'])->name('tasks.grade-submission');
    Route::patch('tasks/{task}/toggle-status', [TaskController::class, 'toggleStatus'])->name('tasks.toggle-status');
    Route::resource('tasks', TaskController::class);

    // Quizzes
    Route::post('quizzes/{quiz}/questions', [QuizController::class, 'storeQuestion'])->name('quizzes.questions.store');
    Route::post('quizzes/{quiz}/questions/batch', [QuizController::class, 'storeQuestionsBatch'])->name('quizzes.questions.store-batch');
    Route::put('quizzes/{quiz}/questions/{question}', [QuizController::class, 'updateQuestion'])->name('quizzes.questions.update');
    Route::delete('quizzes/{quiz}/questions/{question}', [QuizController::class, 'destroyQuestion'])->name('quizzes.questions.destroy');
    Route::get('quizzes/{quiz}/attempts/{attempt}/manual-grade', [QuizController::class, 'manualGradeAttempt'])->name('quizzes.manual-grade');
    Route::post('quizzes/{quiz}/attempts/{attempt}/manual-grade', [QuizController::class, 'saveManualGradeAttempt'])->name('quizzes.manual-grade.save');
    Route::resource('quizzes', QuizController::class);
    Route::get('quizzes/{quiz}/attempt/{attempt}', [QuizController::class, 'attempt'])->name('quizzes.attempt');
    Route::post('quizzes/{quiz}/start-attempt', [QuizController::class, 'startAttempt'])->name('quizzes.start-attempt');
    Route::post('quizzes/{quiz}/attempts/{attempt}/submit', [QuizController::class, 'submitAttempt'])->name('quizzes.submit-attempt');
    Route::patch('quizzes/{quiz}/toggle-status', [QuizController::class, 'toggleStatus'])->name('quizzes.toggle-status');

    // Exams
    Route::post('exams/{exam}/questions', [ExamController::class, 'storeQuestion'])->name('exams.questions.store');
    Route::put('exams/{exam}/questions/{question}', [ExamController::class, 'updateQuestion'])->name('exams.questions.update');
    Route::delete('exams/{exam}/questions/{question}', [ExamController::class, 'destroyQuestion'])->name('exams.questions.destroy');
    Route::get('exams/{exam}/attempts/{attempt}/manual-grade', [ExamController::class, 'manualGradeAttempt'])->name('exams.manual-grade');
    Route::post('exams/{exam}/attempts/{attempt}/manual-grade', [ExamController::class, 'saveManualGradeAttempt'])->name('exams.manual-grade.save');
    Route::resource('exams', ExamController::class);
    Route::post('exams/{exam}/start-attempt', [ExamController::class, 'startAttempt'])->name('exams.start-attempt');
    Route::post('exams/{exam}/attempt/{attempt}/submit', [ExamAttemptController::class, 'submit'])->name('exams.attempt.submit');
    Route::patch('exams/{exam}/toggle-status', [ExamController::class, 'toggleStatus'])->name('exams.toggle-status');
    Route::patch('exams/{exam}/cancel', [ExamController::class, 'cancel'])->name('exams.cancel');
    Route::patch('exams/{exam}/reschedule', [ExamController::class, 'reschedule'])->name('exams.reschedule');

    // Exam Attempt Routes
    Route::post('exams/{exam}/start', [ExamAttemptController::class, 'start'])->name('exams.attempt.start');
    Route::get('exams/{exam}/attempt/{attempt}', [ExamAttemptController::class, 'take'])->name('exams.attempt.take');
    Route::post('exams/{exam}/attempt/{attempt}/save-answer', [ExamAttemptController::class, 'saveAnswer'])->name('exams.attempt.save-answer');
    Route::post('exams/{exam}/attempt/{attempt}/violation', [ExamAttemptController::class, 'violation'])->name('exams.attempt.violation');
    Route::get('exams/{exam}/attempt/{attempt}/result', [ExamAttemptController::class, 'result'])->name('exams.attempt.result');
    Route::get('exams/{exam}/results', [ExamAttemptController::class, 'results'])->name('exams.results');

    // Grades
    Route::resource('grades', GradeController::class);
    Route::get('grades/export/excel', [GradeController::class, 'exportExcel'])->name('grades.export.excel');
    Route::get('grades/class/{class}/report', [GradeController::class, 'classReport'])->name('grades.class-report');
    Route::get('grades/students/{student}/report', [GradeController::class, 'studentReport'])->name('grades.student-report');
    Route::get('grades/students-by-class/{class}', [GradeController::class, 'getStudentsByClass'])->name('grades.students-by-class');
    Route::post('grades/bulk-create', [GradeController::class, 'bulkCreate'])->name('grades.bulk-create');
    Route::post('grades/activity-weights', [GradeController::class, 'saveActivityWeights'])->name('grades.activity-weights');

    // Dashboard Routes
    Route::get('/student/dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');
    Route::get('/student/classes', [StudentDashboardController::class, 'myClasses'])->name('student.classes');
    Route::get('/student/grades', [StudentDashboardController::class, 'grades'])->name('student.grades');
    Route::get('/student/enrollment-history', [StudentDashboardController::class, 'enrollmentHistory'])->name('student.enrollment-history');
    Route::get('/student/tasks', [StudentDashboardController::class, 'tasks'])->name('student.tasks');
    Route::get('/student/quizzes', [StudentDashboardController::class, 'quizzes'])->name('student.quizzes');
    Route::get('/student/exams', [StudentDashboardController::class, 'exams'])->name('student.exams');
    Route::get('/student/exams-available', [StudentDashboardController::class, 'examsAvailable'])->name('student.exams-available');

    Route::get('/teacher/dashboard', [TeacherDashboardController::class, 'index'])->name('teacher.dashboard');
    Route::get('/teacher/class/{class}/detail', [TeacherDashboardController::class, 'classDetail'])->name('teacher.class-detail');
    Route::get('/teacher/tasks/{task}/grade', [TeacherDashboardController::class, 'gradeTask'])->name('teacher.grade-task');

    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('/admin/reports', [AdminDashboardController::class, 'reports'])->name('admin.reports');
});

require __DIR__.'/auth.php';
