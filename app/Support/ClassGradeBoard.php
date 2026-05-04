<?php

namespace App\Support;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\GradeActivityWeight;
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
        string $academicYearKey
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

        $weightRows = collect();
        $sumWeights = 0.0;
        if ($subjectId) {
            $weightRows = GradeActivityWeight::query()
                ->where('class_id', $classId)
                ->where('subject_id', $subjectId)
                ->where('academic_year', $academicYearKey)
                ->get();
            $sumWeights = round((float) $weightRows->sum('weight'), 2);
        }

        $useWeighted = $subjectId && $weightRows->isNotEmpty()
            && abs($sumWeights - 100.0) < 0.02;

        $rows = [];
        foreach ($students as $student) {
            $sid = $student->id;

            $taskPcts = collect($tasksInScope)->map(function ($task) use ($sid, $taskPct) {
                return $taskPct[$sid][$task->id] ?? null;
            })->filter(fn ($v) => $v !== null);

            $taskAvg = $taskPcts->isEmpty()
                ? 0
                : round((float) $taskPcts->avg(), 1);

            $quizBests = collect($quizzesInScope)->map(function ($qz) use ($sid, $quizBest) {
                $k = $sid.'_'.$qz->id;

                return $quizBest[$k] ?? null;
            })->filter(fn ($v) => $v !== null);

            $quizAvg = $quizBests->isEmpty()
                ? 0
                : round((float) $quizBests->avg(), 1);

            $examBests = collect($examsInScope)->map(function ($ex) use ($sid, $examBest) {
                $k = $sid.'_'.$ex->id;

                return $examBest[$k] ?? null;
            })->filter(fn ($v) => $v !== null);

            $examAvg = $examBests->isEmpty()
                ? 0
                : round((float) $examBests->avg(), 1);

            if ($useWeighted) {
                $numerator = 0.0;
                foreach ($weightRows as $wr) {
                    $score = match ($wr->activity_type) {
                        'task' => (float) ($taskPct[$sid][$wr->activity_id] ?? 0),
                        'quiz' => (float) ($quizBest[$sid.'_'.$wr->activity_id] ?? 0),
                        'exam' => (float) ($examBest[$sid.'_'.$wr->activity_id] ?? 0),
                        default => 0.0,
                    };
                    $numerator += ((float) $wr->weight) * $score;
                }
                $overallAvg = round($numerator / 100.0, 1);
            } else {
                $overallParts = collect();
                if ($taskPcts->isNotEmpty()) {
                    $overallParts->push($taskAvg);
                }
                if ($quizBests->isNotEmpty()) {
                    $overallParts->push($quizAvg);
                }
                if ($examBests->isNotEmpty()) {
                    $overallParts->push($examAvg);
                }
                $overallAvg = $overallParts->isEmpty()
                    ? 0
                    : round((float) $overallParts->avg(), 1);
            }

            $detail = self::buildStudentDetail(
                $sid,
                $tasksInScope,
                $quizzesInScope,
                $examsInScope,
                $taskPct,
                $quizBest,
                $examBest,
                $weightRows,
                $useWeighted
            );

            $rows[] = [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'student_email' => $student->email ?? '',
                'student_nis' => $student->nis ?? null,
                'task_avg' => $taskAvg,
                'quiz_avg' => $quizAvg,
                'exam_avg' => $examAvg,
                'overall_avg' => $overallAvg,
                'is_passed' => $overallAvg >= $passingScore,
                'detail' => $detail,
                'uses_weighted_formula' => $useWeighted,
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
        int $subjectId,
        ?array $allowedClassSubjectIds
    ): array {
        return [
            'tasks' => self::scopedTasks($classId, $subjectId, $allowedClassSubjectIds),
            'quizzes' => self::scopedQuizzes($classId, $subjectId, $allowedClassSubjectIds),
            'exams' => self::scopedExams($classId, $subjectId, $allowedClassSubjectIds),
        ];
    }

    /**
     * @param  Collection<int, GradeActivityWeight>  $weightRows
     */
    private static function buildStudentDetail(
        int $studentId,
        Collection $tasksInScope,
        Collection $quizzesInScope,
        Collection $examsInScope,
        array $taskPct,
        array $quizBest,
        array $examBest,
        Collection $weightRows,
        bool $useWeighted
    ): array {
        $byKey = [];
        foreach ($weightRows as $wr) {
            $byKey[$wr->activity_type.':'.$wr->activity_id] = (float) $wr->weight;
        }

        $tasks = $tasksInScope->map(function ($task) use ($studentId, $taskPct, $byKey, $useWeighted) {
            $score = $taskPct[$studentId][$task->id] ?? null;
            $w = $byKey['task:'.$task->id] ?? null;
            $contrib = ($useWeighted && $w !== null)
                ? round($w * (float) ($score ?? 0) / 100, 2)
                : null;

            return [
                'type' => 'task',
                'id' => $task->id,
                'title' => $task->title,
                'weight' => $w,
                'score' => $score !== null ? round((float) $score, 1) : null,
                'contribution' => $contrib,
            ];
        })->values()->all();

        $quizzes = $quizzesInScope->map(function ($qz) use ($studentId, $quizBest, $byKey, $useWeighted) {
            $k = $studentId.'_'.$qz->id;
            $score = array_key_exists($k, $quizBest) ? (float) $quizBest[$k] : null;
            $w = $byKey['quiz:'.$qz->id] ?? null;
            $contrib = ($useWeighted && $w !== null)
                ? round($w * (float) ($score ?? 0) / 100, 2)
                : null;

            return [
                'type' => 'quiz',
                'id' => $qz->id,
                'title' => $qz->title,
                'weight' => $w,
                'score' => $score !== null ? round($score, 1) : null,
                'score_note' => 'Nilai tertinggi dari percobaan',
                'contribution' => $contrib,
            ];
        })->values()->all();

        $exams = $examsInScope->map(function ($ex) use ($studentId, $examBest, $byKey, $useWeighted) {
            $k = $studentId.'_'.$ex->id;
            $score = array_key_exists($k, $examBest) ? (float) $examBest[$k] : null;
            $w = $byKey['exam:'.$ex->id] ?? null;
            $contrib = ($useWeighted && $w !== null)
                ? round($w * (float) ($score ?? 0) / 100, 2)
                : null;

            return [
                'type' => 'exam',
                'id' => $ex->id,
                'title' => $ex->title,
                'weight' => $w,
                'score' => $score !== null ? round($score, 1) : null,
                'score_note' => 'Nilai tertinggi dari percobaan',
                'contribution' => $contrib,
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
