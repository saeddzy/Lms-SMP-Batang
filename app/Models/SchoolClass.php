<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class SchoolClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'academic_year',
        'teacher_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the teacher that owns the class.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the students enrolled in this class.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(StudentEnrollment::class, 'class_id');
    }

    /**
     * Get the students through enrollments.
     */
    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, StudentEnrollment::class, 'class_id', 'id', 'id', 'student_id');
    }

    /**
     * Get the class subjects for this class.
     */
    public function classSubjects(): HasMany
    {
        return $this->hasMany(ClassSubject::class, 'class_id');
    }

    /**
     * Get the subjects through class subjects.
     */
    public function subjects(): HasManyThrough
    {
        return $this->hasManyThrough(Subject::class, ClassSubject::class, 'class_id', 'id', 'id', 'subject_id');
    }

    /**
     * Get the materials for this class.
     */
    public function materials(): HasMany
    {
        return $this->hasMany(Material::class, 'class_id');
    }

    /**
     * Get the tasks for this class.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'class_id');
    }

    /**
     * Get the quizzes for this class.
     */
    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class, 'class_id');
    }

    /**
     * Get the exams for this class.
     */
    public function exams(): HasMany
    {
        return $this->hasMany(Exam::class, 'class_id');
    }

    /**
     * Get the final grades for this class.
     */
    public function finalGrades(): HasMany
    {
        return $this->hasMany(FinalGrade::class, 'class_id');
    }

    /**
     * Scope a query to only include active classes.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by academic year.
     */
    public function scopeByAcademicYear($query, $year)
    {
        return $query->where('academic_year', $year);
    }
}