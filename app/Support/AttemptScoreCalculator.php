<?php

namespace App\Support;

use App\Models\ExamAttempt;
use App\Models\QuizAttempt;

final class AttemptScoreCalculator
{
    /**
     * @return array{earned: float, max: float, percent: float}
     */
    public static function forQuizAttempt(QuizAttempt $attempt): array
    {
        $attempt->loadMissing(['answers.question']);

        $max = 0.0;
        $earned = 0.0;

        foreach ($attempt->answers as $ans) {
            $q = $ans->question;
            if (! $q) {
                continue;
            }
            $max += (float) $q->points;
            if ($q->question_type === 'essay') {
                $earned += (float) ($ans->points_awarded ?? 0);
            } elseif ($ans->is_correct) {
                $earned += (float) $q->points;
            }
        }

        $percent = $max > 0 ? round(($earned / $max) * 100, 2) : 0.0;

        return [
            'earned' => round($earned, 2),
            'max' => round($max, 2),
            'percent' => $percent,
        ];
    }

    /**
     * @return array{earned: float, max: float, percent: float}
     */
    public static function forExamAttempt(ExamAttempt $attempt): array
    {
        $attempt->loadMissing(['answers.question']);

        $max = 0.0;
        $earned = 0.0;

        foreach ($attempt->answers as $ans) {
            $q = $ans->question;
            if (! $q) {
                continue;
            }
            $max += (float) $q->points;
            if ($q->question_type === 'essay') {
                $earned += (float) ($ans->points_awarded ?? 0);
            } elseif ($ans->is_correct) {
                $earned += (float) $q->points;
            }
        }

        $percent = $max > 0 ? round(($earned / $max) * 100, 2) : 0.0;

        return [
            'earned' => round($earned, 2),
            'max' => round($max, 2),
            'percent' => $percent,
        ];
    }
}
