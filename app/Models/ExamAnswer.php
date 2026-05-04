<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAnswer extends Model
{
    protected $fillable = [
        'exam_attempt_id',
        'question_id',
        'answer',
        'selected_options',
        'is_correct',
        'points_earned',
        'time_spent_seconds',
    ];

    protected $casts = [
        'selected_options' => 'array',
        'is_correct' => 'boolean',
    ];

    public function examAttempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }

    // Helper methods
    public function markAsCorrect(): void
    {
        $this->is_correct = true;
        $this->points_earned = $this->question->points ?? 1;
        $this->save();
    }

    public function markAsIncorrect(): void
    {
        $this->is_correct = false;
        $this->points_earned = 0;
        $this->save();
    }
}
