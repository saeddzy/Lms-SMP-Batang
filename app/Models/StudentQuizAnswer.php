<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentQuizAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'quiz_id',
        'question_id',
        'student_id',
        'answer', // student's answer
        'is_correct',
        'points_earned',
        'answered_at',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_earned' => 'decimal:2',
        'answered_at' => 'datetime',
    ];

    /**
     * Get the quiz that owns this answer.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    /**
     * Get the question that owns this answer.
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(QuizQuestion::class, 'question_id');
    }

    /**
     * Get the student that owns this answer.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Scope a query to filter by quiz.
     */
    public function scopeByQuiz($query, $quizId)
    {
        return $query->where('quiz_id', $quizId);
    }

    /**
     * Scope a query to filter by question.
     */
    public function scopeByQuestion($query, $questionId)
    {
        return $query->where('question_id', $questionId);
    }

    /**
     * Scope a query to filter by student.
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope a query to get correct answers.
     */
    public function scopeCorrect($query)
    {
        return $query->where('is_correct', true);
    }
}