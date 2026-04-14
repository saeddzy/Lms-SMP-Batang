<?php

namespace App\Models;

use App\Models\Material;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'code', // e.g., "MTK", "IPA", "IPS"
        'teacher_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the class subjects for this subject.
     */
    public function classSubjects(): HasMany
    {
        return $this->hasMany(ClassSubject::class, 'subject_id');
    }

    /**
     * Get the classes through class subjects.
     */
    public function classes(): HasManyThrough
    {
        return $this->hasManyThrough(SchoolClass::class, ClassSubject::class, 'subject_id', 'id', 'id', 'class_id');
    }

    /**
     * Get the teacher that owns this subject.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the tasks for this subject through class subjects.
     */
    public function tasks(): HasManyThrough
    {
        return $this->hasManyThrough(Task::class, ClassSubject::class, 'subject_id', 'class_subject_id', 'id', 'id');
    }

    /**
     * Get the quizzes for this subject through class subjects.
     */
    public function quizzes(): HasManyThrough
    {
        return $this->hasManyThrough(Quiz::class, ClassSubject::class, 'subject_id', 'class_subject_id', 'id', 'id');
    }

    /**
     * Get the exams for this subject through class subjects.
     */
    public function exams(): HasManyThrough
    {
        return $this->hasManyThrough(Exam::class, ClassSubject::class, 'subject_id', 'class_subject_id', 'id', 'id');
    }

    /**
     * Get the materials for this subject through class subjects.
     */
    public function materials(): HasManyThrough
    {
        return $this->hasManyThrough(Material::class, ClassSubject::class, 'subject_id', 'class_subject_id', 'id', 'id');
    }

    /**
     * Get the grade components for this subject.
     */
    public function gradeComponents(): HasMany
    {
        return $this->hasMany(GradeComponent::class, 'subject_id');
    }

    /**
     * Scope a query to only include active subjects.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by code.
     */
    public function scopeByCode($query, $code)
    {
        return $query->where('code', $code);
    }
}