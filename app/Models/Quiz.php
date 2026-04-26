<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'instructions',
        'time_limit', // in minutes
        'total_questions',
        'max_attempts',
        'max_score',
        'passing_score',
        'start_time',
        'end_time',
        'class_id',
        'class_subject_id',
        'created_by',
        'is_active',
        'is_randomized', // randomize question order
        'show_results', // show results after completion
    ];

    protected $casts = [
        'time_limit' => 'integer',
        'total_questions' => 'integer',
        'max_attempts' => 'integer',
        'max_score' => 'decimal:2',
        'passing_score' => 'decimal:2',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'is_active' => 'boolean',
        'is_randomized' => 'boolean',
        'show_results' => 'boolean',
    ];

    /**
     * Get the class that owns this quiz.
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the class subject that owns this quiz.
     */
    public function classSubject(): BelongsTo
    {
        return $this->belongsTo(ClassSubject::class, 'class_subject_id');
    }

    /**
     * Get the subject for this quiz through class subject (for eager loads like quiz.subject).
     */
    public function subject()
    {
        return $this->hasOneThrough(Subject::class, ClassSubject::class, 'id', 'id', 'class_subject_id', 'subject_id');
    }

    /**
     * Get the user who created this quiz.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the teacher who owns this quiz through class subject.
     */
    public function teacher(): HasOneThrough
    {
        return $this->hasOneThrough(User::class, ClassSubject::class, 'id', 'id', 'class_subject_id', 'teacher_id');
    }

    /**
     * Get the quiz questions for this quiz.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class, 'quiz_id');
    }

    /**
     * Student attempts (for scores, teacher review, withCount).
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class, 'quiz_id');
    }

    /**
     * Get the student quiz answers for this quiz.
     */
    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentQuizAnswer::class, 'quiz_id');
    }

    /**
     * Check if the quiz is currently available.
     */
    public function getIsAvailableAttribute(): bool
    {
        $now = now();

        if ($this->start_time && $now->isBefore($this->start_time)) {
            return false;
        }

        if ($this->end_time && $now->isAfter($this->end_time)) {
            return false;
        }

        return $this->is_active;
    }

    /**
     * Check if the quiz is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        return $this->end_time && now()->isAfter($this->end_time);
    }

    /**
     * Get the status of the quiz.
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'inactive';
        }

        if ($this->is_overdue) {
            return 'ended';
        }

        if ($this->start_time && now()->isBefore($this->start_time)) {
            return 'scheduled';
        }

        return 'active';
    }

    /**
     * Scope a query to only include active quizzes.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include available quizzes.
     */
    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('start_time')
                          ->orWhere('start_time', '<=', now());
                    })
                    ->where(function ($q) {
                        $q->whereNull('end_time')
                          ->orWhere('end_time', '>=', now());
                    });
    }

    /**
     * Scope a query to filter by class.
     */
    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope a query to filter by class subject.
     */
    public function scopeByClassSubject($query, $classSubjectId)
    {
        return $query->where('class_subject_id', $classSubjectId);
    }

    /**
     * Scope a query to filter by creator.
     */
    public function scopeByCreator($query, $userId)
    {
        return $query->where('created_by', $userId);
    }
}