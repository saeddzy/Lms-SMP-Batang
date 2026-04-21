<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamAttempt extends Model
{
    protected $fillable = [
        'exam_id',
        'student_id',
        'started_at',
        'finished_at',
        'attempt_end_time',
        'score',
        'passed',
        'attempt_status',
        'attempt_number',
        'total_correct',
        'total_questions',
        'attempt_data',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'attempt_end_time' => 'datetime',
        'score' => 'decimal:2',
        'passed' => 'boolean',
        'attempt_data' => 'array',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ExamAttemptAnswer::class, 'exam_attempt_id');
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('student_id', $userId);
    }

    public function scopeFinished($query)
    {
        return $query->where('attempt_status', 'finished');
    }

    public function scopeInProgress($query)
    {
        return $query->where('attempt_status', 'in_progress');
    }

    // Helper methods
    public function isFinished(): bool
    {
        return $this->attempt_status === 'finished';
    }

    public function isInProgress(): bool
    {
        return $this->attempt_status === 'in_progress';
    }

    public function getPassedAttribute(): bool
    {
        if (!$this->exam) {
            return false;
        }

        return $this->score >= $this->exam->passing_marks;
    }

    public function getDurationMinutesAttribute(): ?int
    {
        if (!$this->started_at || !$this->finished_at) {
            return null;
        }

        return $this->started_at->diffInMinutes($this->finished_at);
    }

    public function calculateScore(): void
    {
        $totalQuestions = $this->exam ? $this->exam->questions()->count() : 0;
        $correctAnswers = $this->answers()->where('is_correct', true)->count();

        $this->total_questions = $totalQuestions;
        $this->total_correct = $correctAnswers;
        
        if ($totalQuestions > 0) {
            $this->score = round(($correctAnswers / $totalQuestions) * 100, 2);
        } else {
            $this->score = 0;
        }

        $this->passed = $this->score >= ($this->exam->passing_marks ?? 70);
        $this->save();
    }
}
