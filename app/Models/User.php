<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

   public function getUserPermissions()
    {
        return $this->getAllPermissions()->mapWithKeys(fn($permission) => [$permission->name => true]);
    }

    // LMS Relationships

    /**
     * Get the classes taught by this teacher.
     */
    public function taughtClasses(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'teacher_id');
    }

    /**
     * Get the class subjects taught by this teacher.
     */
    public function taughtClassSubjects(): HasMany
    {
        return $this->hasMany(ClassSubject::class, 'teacher_id');
    }

    /**
     * Get the subjects taught by this teacher.
     */
    public function taughtSubjects()
    {
        return $this->hasManyThrough(Subject::class, ClassSubject::class, 'teacher_id', 'id', 'id', 'subject_id');
    }

    /**
     * Get the student enrollments for this student.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class, 'student_id');
    }

    /**
     * Get the classes this student is enrolled in.
     */
    public function enrolledClasses()
    {
        return $this->hasManyThrough(SchoolClass::class, StudentEnrollment::class, 'student_id', 'id', 'id', 'class_id');
    }

    /**
     * Get the materials uploaded by this user.
     */
    public function uploadedMaterials(): HasMany
    {
        return $this->hasMany(Material::class, 'uploaded_by');
    }

    /**
     * Get the tasks created by this user.
     */
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    /**
     * Get the quizzes created by this user.
     */
    public function createdQuizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'created_by');
    }

    /**
     * Get the exams created by this user.
     */
    public function createdExams(): HasMany
    {
        return $this->hasMany(Exam::class, 'created_by');
    }

    /**
     * Get the task submissions by this student.
     */
    public function taskSubmissions(): HasMany
    {
        return $this->hasMany(StudentSubmission::class, 'student_id');
    }

    /**
     * Get the quiz answers by this student.
     */
    public function quizAnswers(): HasMany
    {
        return $this->hasMany(StudentQuizAnswer::class, 'student_id');
    }

    /**
     * Get the exam scores for this student.
     */
    public function examScores(): HasMany
    {
        return $this->hasMany(ExamScore::class, 'student_id');
    }

    /**
     * Get the final grades for this student.
     */
    public function finalGrades(): HasMany
    {
        return $this->hasMany(FinalGrade::class, 'student_id');
    }

    /**
     * Get the grades calculated by this teacher.
     */
    public function calculatedGrades(): HasMany
    {
        return $this->hasMany(FinalGrade::class, 'calculated_by');
    }

    /**
     * Get the exam scores graded by this teacher.
     */
    public function gradedExamScores(): HasMany
    {
        return $this->hasMany(ExamScore::class, 'scored_by');
    }

    /**
     * Get the submissions graded by this teacher.
     */
    public function gradedSubmissions(): HasMany
    {
        return $this->hasMany(StudentSubmission::class, 'graded_by');
    }

    // Helper methods

    /**
     * Check if user is a teacher.
     */
    public function isTeacher(): bool
    {
        return $this->hasRole('guru');
    }

    /**
     * Check if user is a student.
     */
    public function isStudent(): bool
    {
        return $this->hasRole('siswa');
    }

    /**
     * Check if user is an admin.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }
}

