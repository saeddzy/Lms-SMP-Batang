<?php

namespace App\Providers;

use App\Models\ClassSubject;
use App\Models\Exam;
use App\Models\Material;
use App\Models\Quiz;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Task;
use App\Models\FinalGrade;
use App\Models\User;
use App\Policies\ClassSubjectPolicy;
use App\Policies\ExamPolicy;
use App\Policies\MaterialPolicy;
use App\Policies\QuizPolicy;
use App\Policies\SchoolClassPolicy;
use App\Policies\SubjectPolicy;
use App\Policies\GradePolicy;
use App\Policies\TaskPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        ClassSubject::class => ClassSubjectPolicy::class,
        Exam::class => ExamPolicy::class,
        Material::class => MaterialPolicy::class,
        Quiz::class => QuizPolicy::class,
        SchoolClass::class => SchoolClassPolicy::class,
        Subject::class => SubjectPolicy::class,
        Task::class => TaskPolicy::class,
        FinalGrade::class => GradePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();

        // Additional gates can be defined here
    }
}
