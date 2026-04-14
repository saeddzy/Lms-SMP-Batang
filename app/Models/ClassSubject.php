<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassSubject extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_id',
        'subject_id',
        'teacher_id',
        'schedule', // JSON field for class schedule
        'is_active',
    ];

    protected $casts = [
        'schedule' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the class that owns this class subject.
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the subject that owns this class subject.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * Get the teacher that owns this class subject.
     */
    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    /**
     * Get the materials for this class subject.
     */
    public function materials()
    {
        return $this->hasMany(Material::class, 'class_subject_id');
    }

    /**
     * Get the tasks for this class subject.
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'class_subject_id');
    }

    /**
     * Get the quizzes for this class subject.
     */
    public function quizzes()
    {
        return $this->hasMany(Quiz::class, 'class_subject_id');
    }

    /**
     * Get the exams for this class subject.
     */
    public function exams()
    {
        return $this->hasMany(Exam::class, 'class_subject_id');
    }

    /**
     * Scope a query to only include active class subjects.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by teacher.
     */
    public function scopeByTeacher($query, $teacherId)
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Guru pengajar untuk slot kelas–mapel ini:
     * terdaftar di class_subjects.teacher_id, atau sebagai guru mapel di master subjects.teacher_id.
     */
    public function scopeForTeacher($query, User $user)
    {
        return $query->where(function ($q) use ($user) {
            $q->where('teacher_id', $user->id)
                ->orWhereHas('subject', fn ($s) => $s->where('teacher_id', $user->id));
        });
    }

    public function isTaughtBy(User $user): bool
    {
        if ((int) $this->teacher_id === (int) $user->id) {
            return true;
        }

        $this->loadMissing('subject');

        return $this->subject
            && $this->subject->teacher_id !== null
            && (int) $this->subject->teacher_id === (int) $user->id;
    }
}