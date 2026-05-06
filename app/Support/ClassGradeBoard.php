<?php

namespace App\Support;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\SchoolClass;
use App\Models\Task;
use App\Models\TaskSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Schema;

/**
 * Rekap nilai per siswa untuk satu kelas + filter mapel (Manajemen Nilai).
 */
final class ClassGradeBoard
{
    /**
     * @param  list<int>|null  $allowedClassSubjectIds
     * @return list<array<string, mixed>>
     */
    public static function build(
        Request $request,
        SchoolClass $class,
        ?int $subjectId,
        ?array $allowedClassSubjectIds,
    ): array {
        $classId = $class->id;
        $performanceFilter = (string) $request->input('performance', '');
        $scoreRangeFilter = (string) $request->input('score_range', '');
        $sort = (string) $request->input('sort', 'score_desc');
        $passingScore = 75.0;

        $studentsQuery = $class->students();
        if ($request->filled('search')) {
            $search = trim((string) $request->search);
            $studentsQuery->where(function ($q) use ($search) {
                $q->where('users.name', 'like', '%'.$search.'%')
                    ->orWhere('users.email', 'like', '%'.$search.'%');
            });
        }

        $studentColumns = ['users.id', 'users.name', 'users.email'];
        if (Schema::hasColumn('users', 'nis')) {
            $studentColumns[] = 'users.nis';
        }

        $students = $studentsQuery->orderBy('name')->get($studentColumns);
        if ($students->isEmpty()) {
            return [];
        }

        $studentIds = $students->pluck('id')->all();

        $scopeActivity = function ($q) use ($classId, $subjectId, $allowedClassSubjectIds) {
            $q->where('class_id', $classId);
            if ($subjectId) {
                $q->whereHas('classSubject', fn ($cs) => $cs->where('subject_id', $subjectId));
            }
            if ($allowedClassSubjectIds !== null) {
                if ($allowedClassSubjectIds === []) {
                    $q->whereRaw('1 = 0');
                } else {
                    $q->whereIn('class_subject_id', $allowedClassSubjectIds);
                }
            }
        };

        $tasksInScope = self::scopedTasks($classId, $subjectId, $allowedClassSubjectIds);
        $quizzesInScope = self::scopedQuizzes($classId, $subjectId, $allowedClassSubjectIds);
        $examsInScope = self::scopedExams($classId, $subjectId, $allowedClassSubjectIds);

        $taskSubs = TaskSubmission::query()
            ->whereIn('student_id', $studentIds)
            ->whereNotNull('score')
            ->whereHas('task', $scopeActivity)
            ->with('task')
            ->get();

        $quizAttempts = QuizAttempt::query()
            ->whereIn('student_id', $studentIds)
            ->whereNotNull('score')
            ->whereHas('quiz', $scopeActivity)
            ->get();

        $examAttempts = ExamAttempt::query()
            ->whereIn('student_id', $studentIds)
            ->whereNotNull('score')
            ->whereHas('exam', $scopeActivity)
            ->get();

        /** @var array<int, array<int, float|null>> $taskPct */
        $taskPct = [];
        foreach ($taskSubs as $sub) {
            $tid = $sub->task_id;
            $sid = $sub->student_id;
            $t = $sub->task;
            if (! $t || ! $t->max_score || (float) $t->max_score <= 0) {
                continue;
            }
            $taskPct[$sid][$tid] = ((float) $sub->score / (float) $t->max_score) * 100;
        }

        /** @var array<string, float> $quizBest key studentId_quizId */
        $quizBest = [];
        foreach ($quizAttempts as $att) {
            $k = $att->student_id.'_'.$att->quiz_id;
            $sc = (float) $att->score;
            $quizBest[$k] = max($quizBest[$k] ?? 0, $sc);
        }

        /** @var array<string, float> $examBest */
        $examBest = [];
        foreach ($examAttempts as $att) {
            $k = $att->student_id.'_'.$att->exam_id;
            $sc = (float) $att->score;
            $examBest[$k] = max($examBest[$k] ?? 0, $sc);
        }

        $rows = [];
        foreach ($students as $student) {
            $sid = $student->id;

            $taskPcts = collect($tasksInScope)->map(function ($task) use ($sid, $taskPct) {
                return $taskPct[$sid][$task->id] ?? null;
            })->filter(fn ($v) => $v !== null);

            $hasTaskScores = $taskPcts->isNotEmpty();
            $taskAvg = $hasTaskScores
                ? (float) $taskPcts->avg()
                : 0.0;

            $quizBests = collect($quizzesInScope)->map(function ($qz) use ($sid, $quizBest) {
                $k = $sid.'_'.$qz->id;

                return $quizBest[$k] ?? null;
            })->filter(fn ($v) => $v !== null);

            $hasQuizScores = $quizBests->isNotEmpty();
            $quizAvg = $hasQuizScores
                ? (float) $quizBests->avg()
                : 0.0;

            $examBests = collect($examsInScope)->map(function ($ex) use ($sid, $examBest) {
                $k = $sid.'_'.$ex->id;

                return $examBest[$k] ?? null;
            })->filter(fn ($v) => $v !== null);

            $hasExamScores = $examBests->isNotEmpty();
            $examAvg = $hasExamScores
                ? (float) $examBests->avg()
                : 0.0;

            $taskAvgRounded = round($taskAvg, 2);
            $quizAvgRounded = round($quizAvg, 2);
            $examAvgRounded = round($examAvg, 2);

            $overallAvg = self::computeRphFinalFromAverages(
                $taskAvg,
                $hasTaskScores,
                $quizAvg,
                $hasQuizScores,
                $examAvg,
                $hasExamScores,
            );

            $rphDisplay = self::computeRphDisplayOnly($taskAvg, $hasTaskScores, $quizAvg, $hasQuizScores);

            $detail = self::buildStudentDetail(
                $sid,
                $tasksInScope,
                $quizzesInScope,
                $examsInScope,
                $taskPct,
                $quizBest,
                $examBest,
            );

            $rows[] = [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'student_email' => $student->email ?? '',
                'student_nis' => $student->nis ?? null,
                'task_avg' => $taskAvgRounded,
                'quiz_avg' => $quizAvgRounded,
                'exam_avg' => $examAvgRounded,
                'rph' => $rphDisplay,
                'overall_avg' => $overallAvg,
                'is_passed' => $overallAvg >= $passingScore,
                'detail' => $detail,
            ];
        }

        if ($performanceFilter === 'passed') {
            $rows = array_values(array_filter(
                $rows,
                fn (array $row) => (bool) ($row['is_passed'] ?? false)
            ));
        } elseif ($performanceFilter === 'not_passed') {
            $rows = array_values(array_filter(
                $rows,
                fn (array $row) => ! (bool) ($row['is_passed'] ?? false)
            ));
        }

        $rows = array_values(array_filter($rows, function (array $row) use ($scoreRangeFilter): bool {
            $score = (float) ($row['overall_avg'] ?? 0);

            return match ($scoreRangeFilter) {
                '90_100' => $score >= 90 && $score <= 100,
                '80_89' => $score >= 80 && $score < 90,
                '70_79' => $score >= 70 && $score < 80,
                'lt_70' => $score < 70,
                default => true,
            };
        }));

        usort($rows, function (array $a, array $b) use ($sort): int {
            $nameA = mb_strtolower((string) ($a['student_name'] ?? ''));
            $nameB = mb_strtolower((string) ($b['student_name'] ?? ''));
            $scoreA = (float) ($a['overall_avg'] ?? 0);
            $scoreB = (float) ($b['overall_avg'] ?? 0);

            return match ($sort) {
                'name_asc' => $nameA <=> $nameB,
                'name_desc' => $nameB <=> $nameA,
                'score_asc' => $scoreA <=> $scoreB,
                default => $scoreB <=> $scoreA,
            };
        });

        return $rows;
    }

    /**
     * @param  list<int>|null  $allowedClassSubjectIds
     * @return array{tasks: Collection<int, Task>, quizzes: Collection<int, Quiz>, exams: Collection<int, Exam>}
     */
    public static function catalog(
        int $classId,
        ?int $subjectId,
        ?array $allowedClassSubjectIds
    ): array {
        return [
            'tasks' => self::scopedTasks($classId, $subjectId, $allowedClassSubjectIds),
            'quizzes' => self::scopedQuizzes($classId, $subjectId, $allowedClassSubjectIds),
            'exams' => self::scopedExams($classId, $subjectId, $allowedClassSubjectIds),
        ];
    }

    /**
     * RPH = rata-rata dari rerata tugas dan rerata kuis yang ada (hanya komponen ber-nilai).
     * Nilai akhir = ((RPH × 2) + rerata ujian) ÷ 3 jika ujian ada; jika tidak, sesuai data tersedia.
     * Pembulatan 2 desimal pada nilai akhir (dan komponen dipakai presisi penuh lalu dibulatkan di akhir).
     */
    public static function computeRphFinalFromAverages(
        float $taskAvg,
        bool $hasTaskScores,
        float $quizAvg,
        bool $hasQuizScores,
        float $examAvg,
        bool $hasExamScores,
    ): float {
        $rphParts = [];
        if ($hasTaskScores) {
            $rphParts[] = $taskAvg;
        }
        if ($hasQuizScores) {
            $rphParts[] = $quizAvg;
        }

        if ($rphParts === []) {
            $rph = null;
        } else {
            $rph = array_sum($rphParts) / count($rphParts);
        }

        if ($rph !== null && $hasExamScores) {
            return round((2 * $rph + $examAvg) / 3, 2);
        }
        if ($rph !== null) {
            return round($rph, 2);
        }
        if ($hasExamScores) {
            return round($examAvg, 2);
        }

        return 0.0;
    }

    /**
     * Nilai RPH saja (untuk tampilan), atau null jika tidak ada tugas maupun kuis ber-nilai.
     */
    public static function computeRphDisplayOnly(
        float $taskAvg,
        bool $hasTaskScores,
        float $quizAvg,
        bool $hasQuizScores,
    ): ?float {
        $rphParts = [];
        if ($hasTaskScores) {
            $rphParts[] = $taskAvg;
        }
        if ($hasQuizScores) {
            $rphParts[] = $quizAvg;
        }
        if ($rphParts === []) {
            return null;
        }

        return round(array_sum($rphParts) / count($rphParts), 2);
    }

    /**
     * Rekap RPH + nilai akhir untuk satu siswa pada satu kelas & mapel (sinkron dengan scope manajemen nilai).
     *
     * @return array{
     *   task_avg: float,
     *   quiz_avg: float,
     *   exam_avg: float,
     *   rph: ?float,
     *   overall_avg: float,
     *   formula_note: string,
     *   has_task_scores: bool,
     *   has_quiz_scores: bool,
     *   has_exam_scores: bool,
     * }|null
     */
    public static function studentSubjectRphBreakdown(int $studentId, int $classId, int $subjectId): ?array
    {
        $tasks = self::scopedTasks($classId, $subjectId, null);
        $quizzes = self::scopedQuizzes($classId, $subjectId, null);
        $exams = self::scopedExams($classId, $subjectId, null);

        $taskIds = $tasks->pluck('id')->all();
        $quizIds = $quizzes->pluck('id')->all();
        $examIds = $exams->pluck('id')->all();

        if ($taskIds === [] && $quizIds === [] && $examIds === []) {
            return null;
        }

        $taskSubs = TaskSubmission::query()
            ->where('student_id', $studentId)
            ->whereNotNull('score')
            ->whereIn('task_id', $taskIds)
            ->with('task')
            ->get();

        $taskPcts = [];
        foreach ($taskSubs as $sub) {
            $t = $sub->task;
            if (! $t || ! $t->max_score || (float) $t->max_score <= 0) {
                continue;
            }
            $taskPcts[] = ((float) $sub->score / (float) $t->max_score) * 100;
        }

        $quizAttempts = QuizAttempt::query()
            ->where('student_id', $studentId)
            ->whereNotNull('score')
            ->whereIn('quiz_id', $quizIds)
            ->get();

        $quizBestByQ = [];
        foreach ($quizAttempts as $att) {
            $qid = $att->quiz_id;
            $quizBestByQ[$qid] = max($quizBestByQ[$qid] ?? 0, (float) $att->score);
        }
        $quizVals = [];
        foreach ($quizIds as $qid) {
            if (array_key_exists($qid, $quizBestByQ)) {
                $quizVals[] = $quizBestByQ[$qid];
            }
        }

        $examAttempts = ExamAttempt::query()
            ->where('student_id', $studentId)
            ->whereNotNull('score')
            ->whereIn('exam_id', $examIds)
            ->get();

        $examBestByE = [];
        foreach ($examAttempts as $att) {
            $eid = $att->exam_id;
            $examBestByE[$eid] = max($examBestByE[$eid] ?? 0, (float) $att->score);
        }
        $examVals = [];
        foreach ($examIds as $eid) {
            if (array_key_exists($eid, $examBestByE)) {
                $examVals[] = $examBestByE[$eid];
            }
        }

        $hasTask = $taskPcts !== [];
        $taskAvg = $hasTask ? (float) (array_sum($taskPcts) / count($taskPcts)) : 0.0;

        $hasQuiz = $quizVals !== [];
        $quizAvg = $hasQuiz ? (float) (array_sum($quizVals) / count($quizVals)) : 0.0;

        $hasExam = $examVals !== [];
        $examAvg = $hasExam ? (float) (array_sum($examVals) / count($examVals)) : 0.0;

        if (! $hasTask && ! $hasQuiz && ! $hasExam) {
            return null;
        }

        $overall = self::computeRphFinalFromAverages($taskAvg, $hasTask, $quizAvg, $hasQuiz, $examAvg, $hasExam);
        $rph = self::computeRphDisplayOnly($taskAvg, $hasTask, $quizAvg, $hasQuiz);

        $formulaNote = 'RPH = rata-rata (rerata tugas + rerata kuis) dari komponen yang ada; nilai akhir = ((2×RPH)+rerata ujian)÷3 bila ada ujian.';

        return [
            'task_avg' => round($taskAvg, 2),
            'quiz_avg' => round($quizAvg, 2),
            'exam_avg' => round($examAvg, 2),
            'rph' => $rph,
            'overall_avg' => $overall,
            'formula_note' => $formulaNote,
            'has_task_scores' => $hasTask,
            'has_quiz_scores' => $hasQuiz,
            'has_exam_scores' => $hasExam,
        ];
    }

    private static function buildStudentDetail(
        int $studentId,
        Collection $tasksInScope,
        Collection $quizzesInScope,
        Collection $examsInScope,
        array $taskPct,
        array $quizBest,
        array $examBest,
    ): array {
        $tasks = $tasksInScope->map(function ($task) use ($studentId, $taskPct) {
            $score = $taskPct[$studentId][$task->id] ?? null;

            return [
                'type' => 'task',
                'id' => $task->id,
                'title' => $task->title,
                'weight' => null,
                'score' => $score !== null ? round((float) $score, 1) : null,
                'contribution' => null,
            ];
        })->values()->all();

        $quizzes = $quizzesInScope->map(function ($qz) use ($studentId, $quizBest) {
            $k = $studentId.'_'.$qz->id;
            $score = array_key_exists($k, $quizBest) ? (float) $quizBest[$k] : null;

            return [
                'type' => 'quiz',
                'id' => $qz->id,
                'title' => $qz->title,
                'weight' => null,
                'score' => $score !== null ? round($score, 1) : null,
                'score_note' => 'Nilai tertinggi dari percobaan',
                'contribution' => null,
            ];
        })->values()->all();

        $exams = $examsInScope->map(function ($ex) use ($studentId, $examBest) {
            $k = $studentId.'_'.$ex->id;
            $score = array_key_exists($k, $examBest) ? (float) $examBest[$k] : null;

            return [
                'type' => 'exam',
                'id' => $ex->id,
                'title' => $ex->title,
                'weight' => null,
                'score' => $score !== null ? round($score, 1) : null,
                'score_note' => 'Nilai tertinggi dari percobaan',
                'contribution' => null,
            ];
        })->values()->all();

        return [
            'tasks' => $tasks,
            'quizzes' => $quizzes,
            'exams' => $exams,
        ];
    }

    /**
     * @param  list<int>|null  $allowedClassSubjectIds
     * @return Collection<int, Task>
     */
    private static function scopedTasks(
        int $classId,
        ?int $subjectId,
        ?array $allowedClassSubjectIds
    ): Collection {
        return Task::query()
            ->where('class_id', $classId)
            ->when($subjectId, fn ($q) => $q->whereHas(
                'classSubject',
                fn ($cs) => $cs->where('subject_id', $subjectId)
            ))
            ->when($allowedClassSubjectIds !== null, function ($q) use ($allowedClassSubjectIds) {
                if ($allowedClassSubjectIds === []) {
                    $q->whereRaw('1 = 0');
                } else {
                    $q->whereIn('class_subject_id', $allowedClassSubjectIds);
                }
            })
            ->orderBy('title')
            ->get();
    }

    /**
     * @param  list<int>|null  $allowedClassSubjectIds
     * @return Collection<int, Quiz>
     */
    private static function scopedQuizzes(
        int $classId,
        ?int $subjectId,
        ?array $allowedClassSubjectIds
    ): Collection {
        return Quiz::query()
            ->where('class_id', $classId)
            ->when($subjectId, fn ($q) => $q->whereHas(
                'classSubject',
                fn ($cs) => $cs->where('subject_id', $subjectId)
            ))
            ->when($allowedClassSubjectIds !== null, function ($q) use ($allowedClassSubjectIds) {
                if ($allowedClassSubjectIds === []) {
                    $q->whereRaw('1 = 0');
                } else {
                    $q->whereIn('class_subject_id', $allowedClassSubjectIds);
                }
            })
            ->orderBy('title')
            ->get();
    }

    /**
     * @param  list<int>|null  $allowedClassSubjectIds
     * @return Collection<int, Exam>
     */
    private static function scopedExams(
        int $classId,
        ?int $subjectId,
        ?array $allowedClassSubjectIds
    ): Collection {
        return Exam::query()
            ->where('class_id', $classId)
            ->when($subjectId, fn ($q) => $q->whereHas(
                'classSubject',
                fn ($cs) => $cs->where('subject_id', $subjectId)
            ))
            ->when($allowedClassSubjectIds !== null, function ($q) use ($allowedClassSubjectIds) {
                if ($allowedClassSubjectIds === []) {
                    $q->whereRaw('1 = 0');
                } else {
                    $q->whereIn('class_subject_id', $allowedClassSubjectIds);
                }
            })
            ->orderBy('title')
            ->get();
    }
}
