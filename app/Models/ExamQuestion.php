<?php

namespace App\Models;

use App\Models\Concerns\MatchesStudentQuizAnswers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamQuestion extends Model
{
    use HasFactory;
    use MatchesStudentQuizAnswers;

    protected $fillable = [
        'exam_id',
        'question_text',
        'question_type',
        'options',
        'correct_answer',
        'points',
        'order',
        'explanation',
    ];

    protected $casts = [
        'options' => 'array',
        'points' => 'decimal:2',
        'order' => 'integer',
    ];

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }
}
