<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'instructions',
        'exam_date',
        'scheduled_date',
        'start_time',
        'end_time',
        'duration', // in minutes
        'duration_minutes',
        'max_attempts',
        'total_marks',
        'passing_marks',
        'class_id',
        'class_subject_id',
        'created_by',
        'is_active',
        'exam_type', // mid_term, final, quiz, etc.
    ];

    protected $casts = [
        'exam_date' => 'date',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'duration' => 'integer',
        'max_attempts' => 'integer',
        'total_marks' => 'decimal:2',
        'passing_marks' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the class that owns this exam.
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the class subject that owns this exam.
     */
    public function classSubject(): BelongsTo
    {
        return $this->belongsTo(ClassSubject::class, 'class_subject_id');
    }

    /**
     * Get the subject for this exam through class subject (for eager loads like exam.subject).
     */
    public function subject()
    {
        return $this->hasOneThrough(Subject::class, ClassSubject::class, 'id', 'id', 'class_subject_id', 'subject_id');
    }

    /**
     * Get the user who created this exam.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the teacher who owns this exam through class subject.
     */
    public function teacher(): HasOneThrough
    {
        return $this->hasOneThrough(User::class, ClassSubject::class, 'id', 'id', 'class_subject_id', 'teacher_id');
    }

    /**
     * Get the questions for this exam.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(ExamQuestion::class, 'exam_id')->orderBy('order');
    }

    /**
     * Get the exam scores for this exam.
     */
    public function examScores(): HasMany
    {
        return $this->hasMany(ExamScore::class, 'exam_id');
    }

    /**
     * Student attempts (online attempts with scores; for teacher views, withCount).
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class, 'exam_id');
    }

    /**
     * Check if the exam is currently ongoing.
     */
    public function getIsOngoingAttribute(): bool
    {
        $now = now();

        if (!$this->start_time || !$this->end_time) {
            return false;
        }

        return $now->isBetween($this->start_time, $this->end_time);
    }

    /**
     * Check if the exam is upcoming.
     */
    public function getIsUpcomingAttribute(): bool
    {
        return $this->start_time && now()->isBefore($this->start_time);
    }

    /**
     * Check if the exam is completed.
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->end_time && now()->isAfter($this->end_time);
    }

    /**
     * Get the status of the exam.
     */
    public function getStatusAttribute(): string
    {
        if (!$this->is_active) {
            return 'inactive';
        }

        if ($this->is_completed) {
            return 'completed';
        }

        if ($this->is_ongoing) {
            return 'ongoing';
        }

        if ($this->is_upcoming) {
            return 'upcoming';
        }

        return 'scheduled';
    }

    /**
     * Get the formatted exam schedule.
     */
    public function getScheduleAttribute(): string
    {
        if ($this->exam_date && $this->start_time && $this->end_time) {
            return $this->exam_date->format('d/m/Y') . ' ' .
                   $this->start_time->format('H:i') . ' - ' .
                   $this->end_time->format('H:i');
        }

        return 'Not scheduled';
    }

    /**
     * Scope a query to only include active exams.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
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

    /**
     * Scope a query to get upcoming exams.
     */
    public function scopeUpcoming($query)
    {
        return $query->where('start_time', '>', now());
    }

    /**
     * Scope a query to get ongoing exams.
     */
    public function scopeOngoing($query)
    {
        return $query->where('start_time', '<=', now())
                    ->where('end_time', '>=', now());
    }
}