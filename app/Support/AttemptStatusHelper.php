<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

final class AttemptStatusHelper
{
    /**
     * Tambahkan attempt_status & awaiting_manual_grading pada koleksi QuizAttempt.
     *
     * @param  Collection<int, \App\Models\QuizAttempt>  $attempts
     * @return Collection<int, \App\Models\QuizAttempt>
     */
    public static function annotateQuizAttempts(Collection $attempts): Collection
    {
        if ($attempts->isEmpty()) {
            return $attempts;
        }

        $ids = $attempts->pluck('id')->all();
        $pendingIds = DB::table('quiz_attempt_answers as a')
            ->join('quiz_questions as q', 'a.question_id', '=', 'q.id')
            ->whereIn('a.quiz_attempt_id', $ids)
            ->where('q.question_type', 'essay')
            ->whereNull('a.points_awarded')
            ->distinct()
            ->pluck('a.quiz_attempt_id')
            ->all();

        $pendingSet = array_flip($pendingIds);

        return $attempts->map(function ($att) use ($pendingSet) {
            $menunggu = (bool) ($att->finished_at && isset($pendingSet[$att->id]));
            $att->setAttribute('awaiting_manual_grading', $menunggu);
            $att->setAttribute('essay_grading_pending', $menunggu);
            $status = ! $att->finished_at
                ? 'berlangsung'
                : ($menunggu ? 'menunggu_penilaian' : 'selesai');
            $att->setAttribute('attempt_status', $status);

            return $att;
        });
    }

    /**
     * @param  Collection<int, \App\Models\ExamAttempt>  $attempts
     * @return Collection<int, \App\Models\ExamAttempt>
     */
    public static function annotateExamAttempts(Collection $attempts): Collection
    {
        if ($attempts->isEmpty()) {
            return $attempts;
        }

        $ids = $attempts->pluck('id')->all();
        $pendingIds = DB::table('exam_attempt_answers as a')
            ->join('exam_questions as q', 'a.question_id', '=', 'q.id')
            ->whereIn('a.exam_attempt_id', $ids)
            ->where('q.question_type', 'essay')
            ->whereNull('a.points_awarded')
            ->distinct()
            ->pluck('a.exam_attempt_id')
            ->all();

        $pendingSet = array_flip($pendingIds);

        return $attempts->map(function ($att) use ($pendingSet) {
            $menunggu = (bool) ($att->finished_at && isset($pendingSet[$att->id]));
            $att->setAttribute('awaiting_manual_grading', $menunggu);
            $att->setAttribute('essay_grading_pending', $menunggu);
            $status = ! $att->finished_at
                ? 'berlangsung'
                : ($menunggu ? 'menunggu_penilaian' : 'selesai');
            $att->setAttribute('attempt_status', $status);

            return $att;
        });
    }
}
