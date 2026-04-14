<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAttemptAnswer extends Model
{
    protected $fillable = [
        'exam_attempt_id',
        'question_id',
        'answer',
        'is_correct',
        'points_awarded',
        'teacher_feedback',
        'graded_at',
        'graded_by',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_awarded' => 'decimal:2',
        'graded_at' => 'datetime',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(ExamAttempt::class, 'exam_attempt_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(ExamQuestion::class, 'question_id');
    }

    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }
}
