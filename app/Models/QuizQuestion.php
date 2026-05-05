<?php

namespace App\Models;

use App\Models\Concerns\GradesMatchingAnswers;
use App\Models\Concerns\GradesMultipleCheckboxAnswers;
use App\Models\Concerns\MatchesStudentQuizAnswers;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuizQuestion extends Model
{
    use GradesMatchingAnswers;
    use GradesMultipleCheckboxAnswers;
    use HasFactory;
    use MatchesStudentQuizAnswers;

    protected $fillable = [
        'quiz_id',
        'question_text',
        'question_type', // multiple_choice, true_false, short_answer
        'options', // JSON array of options for multiple choice
        'correct_answer', // for multiple choice: option index, for true_false: 'true'/'false', for short_answer: the answer text
        'points',
        'order',
        'explanation', // explanation for the correct answer
    ];

    protected $casts = [
        'options' => 'array',
        'points' => 'decimal:2',
        'order' => 'integer',
    ];

    /**
     * Get the quiz that owns this question.
     */
    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    /**
     * Get the student answers for this question.
     */
    public function studentAnswers(): HasMany
    {
        return $this->hasMany(StudentQuizAnswer::class, 'question_id');
    }

    /**
     * @deprecated Gunakan isStudentAnswerCorrect()
     */
    public function isCorrectAnswer(string $answer): bool
    {
        return $this->isStudentAnswerCorrect($answer);
    }

    /**
     * Get the options as a formatted array.
     */
    public function getFormattedOptionsAttribute(): array
    {
        if ($this->question_type === 'matching') {
            return [];
        }

        if ($this->question_type === 'multiple_checkbox') {
            return collect($this->multipleCheckboxOptions())
                ->values()
                ->map(fn ($opt, $idx) => [
                    'id' => $idx,
                    'text' => $opt['text'],
                    'letter' => chr(65 + $idx),
                    'is_correct' => (bool) ($opt['is_correct'] ?? false),
                ])
                ->all();
        }

        if (! $this->options) {
            return [];
        }

        $formatted = [];
        foreach ($this->options as $index => $option) {
            $formatted[] = [
                'id' => $index,
                'text' => $option,
                'letter' => chr(65 + $index), // A, B, C, D...
            ];
        }

        return $formatted;
    }

    /**
     * Scope a query to filter by quiz.
     */
    public function scopeByQuiz($query, $quizId)
    {
        return $query->where('quiz_id', $quizId);
    }

    /**
     * Scope a query to order by question order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('order');
    }
}
