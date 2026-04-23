<?php

namespace App\Http\Controllers;

use App\Models\ExamAttempt;
use App\Models\FinalGrade;
use App\Models\QuizAttempt;
use App\Models\SchoolClass;
use App\Models\StudentEnrollment;
use App\Models\Subject;
use App\Models\Task;
use App\Models\Quiz;
use App\Models\Exam;
use App\Models\GradeComponent;
use App\Models\TaskSubmission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class GradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('grades index');

        /** @var User $user */
        $user = auth()->user();

        $classes = $this->gradesIndexClassesForUser($user);

        $selectedClassId = $request->filled('class_id') ? (int) $request->class_id : null;
        $selectedSubjectId = $request->filled('subject_id') ? (int) $request->subject_id : null;

        $classBoard = [];
        $subjectsForClass = [];

        if ($selectedClassId) {
            $class = SchoolClass::query()
                ->where('is_active', true)
                ->whereKey($selectedClassId)
                ->first();

            if (! $class) {
                abort(404);
            }

            if (! $this->teacherCanViewClassGrades($user, $class)) {
                abort(403, 'Anda tidak memiliki akses ke nilai kelas ini.');
            }

            // Guru: hanya mapel yang diampu (slot / guru mapel). Admin: semua mapel di kelas.
            $allowedClassSubjectIds = null;
            if ($user->hasRole('guru')) {
                if ($selectedSubjectId) {
                    $taughtSubjectIds = $class->classSubjects()
                        ->forTeacher($user)
                        ->pluck('subject_id')
                        ->unique()
                        ->all();
                    if (! in_array($selectedSubjectId, $taughtSubjectIds, true)) {
                        abort(403, 'Anda tidak mengampu mapel ini di kelas ini.');
                    }
                }

                $allowedClassSubjectIds = $class->classSubjects()
                    ->forTeacher($user)
                    ->pluck('id')
                    ->all();

                $subjectsForClass = $class->classSubjects()
                    ->forTeacher($user)
                    ->with('subject')
                    ->get()
                    ->pluck('subject')
                    ->filter()
                    ->unique('id')
                    ->values()
                    ->all();
            } else {
                $subjectsForClass = $class->classSubjects()
                    ->with('subject')
                    ->get()
                    ->pluck('subject')
                    ->filter()
                    ->unique('id')
                    ->values()
                    ->all();
            }

            $classBoard = $this->buildClassBoard($request, $class, $selectedSubjectId, $allowedClassSubjectIds);
        }

        return Inertia::render('Grades/Index', [
            'classBoard' => $classBoard,
            'classes' => $classes,
            'subjectsForClass' => $subjectsForClass,
            'selectedClassId' => $selectedClassId,
            'selectedSubjectId' => $selectedSubjectId ?: null,
            'filters' => $request->only(['class_id', 'subject_id', 'search']),
        ]);
    }

    /**
     * Kelas yang boleh muncul di filter Manajemen Nilai (admin: semua; guru: wali atau pengampu mapel).
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, SchoolClass>
     */
    private function gradesIndexClassesForUser(User $user)
    {
        if ($user->hasRole('admin')) {
            return SchoolClass::query()
                ->where('is_active', true)
                ->orderByRaw("CAST(SUBSTRING_INDEX(name, ' ', 1) AS UNSIGNED) ASC")
                ->orderByRaw("TRIM(SUBSTRING(name, LENGTH(SUBSTRING_INDEX(name, ' ', 1)) + 1)) ASC")
                ->orderBy('name')
                ->get();
        }

        if ($user->hasRole('guru')) {
            return SchoolClass::query()
                ->where('is_active', true)
                ->where(function ($q) use ($user) {
                    $q->where('teacher_id', $user->id)
                        ->orWhereHas('classSubjects', fn ($cs) => $cs->forTeacher($user));
                })
                ->orderByRaw("CAST(SUBSTRING_INDEX(name, ' ', 1) AS UNSIGNED) ASC")
                ->orderByRaw("TRIM(SUBSTRING(name, LENGTH(SUBSTRING_INDEX(name, ' ', 1)) + 1)) ASC")
                ->orderBy('name')
                ->get();
        }

        return SchoolClass::query()->whereRaw('1 = 0')->get();
    }

    private function teacherCanViewClassGrades(User $user, SchoolClass $class): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('guru')) {
            if ((int) $class->teacher_id === (int) $user->id) {
                return true;
            }

            return $class->classSubjects()->forTeacher($user)->exists();
        }

        return false;
    }

    /**
     * Rekap per siswa: rata-rata % tugas, kuis, ujian (opsional filter mapel).
     *
     * @param  list<int>|null  $allowedClassSubjectIds  null = admin (semua slot kelas); array = batasi ke slot mapel guru
     * @return list<array<string, mixed>>
     */
    private function buildClassBoard(Request $request, SchoolClass $class, ?int $subjectId, ?array $allowedClassSubjectIds = null): array
    {
        $classId = $class->id;

        $studentsQuery = $class->students();
        if ($request->filled('search')) {
            $search = trim((string) $request->search);
            $studentsQuery->where(function ($q) use ($search) {
                $q->where('users.name', 'like', '%'.$search.'%')
                    ->orWhere('users.email', 'like', '%'.$search.'%');
            });
        }

        $students = $studentsQuery->orderBy('name')->get(['users.id', 'users.name', 'users.email']);
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

        $taskByStudent = $taskSubs->groupBy('student_id');
        $quizByStudent = $quizAttempts->groupBy('student_id');
        $examByStudent = $examAttempts->groupBy('student_id');

        $rows = [];
        foreach ($students as $student) {
            $sid = $student->id;

            $taskPcts = collect($taskByStudent->get($sid, collect()))->map(function (TaskSubmission $sub) {
                $t = $sub->task;
                if (! $t || ! $t->max_score || (float) $t->max_score <= 0) {
                    return null;
                }

                return ((float) $sub->score / (float) $t->max_score) * 100;
            })->filter(fn ($v) => $v !== null);

            $taskAvg = $taskPcts->isEmpty() ? 0 : round((float) $taskPcts->avg(), 1);

            $quizScores = collect($quizByStudent->get($sid, collect()))->pluck('score');
            $quizAvg = $quizScores->isEmpty() ? 0 : round((float) $quizScores->avg(), 1);

            $examScores = collect($examByStudent->get($sid, collect()))->pluck('score');
            $examAvg = $examScores->isEmpty() ? 0 : round((float) $examScores->avg(), 1);

            $overallParts = collect();
            if ($taskPcts->isNotEmpty()) {
                $overallParts->push($taskAvg);
            }
            if ($quizScores->isNotEmpty()) {
                $overallParts->push($quizAvg);
            }
            if ($examScores->isNotEmpty()) {
                $overallParts->push($examAvg);
            }
            $overallAvg = $overallParts->isEmpty() ? 0 : round((float) $overallParts->avg(), 1);

            $rows[] = [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'student_email' => $student->email ?? '',
                'task_avg' => $taskAvg,
                'quiz_avg' => $quizAvg,
                'exam_avg' => $examAvg,
                'overall_avg' => $overallAvg,
            ];
        }

        return $rows;
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Gate::authorize('grades create');

        $classes = SchoolClass::where('is_active', true)->get();
        $subjects = Subject::where('is_active', true)->get();
        $components = GradeComponent::where('is_active', true)->get();
        $tasks = Task::where('is_active', true)->get();
        $quizzes = Quiz::where('is_active', true)->get();
        $exams = Exam::where('is_active', true)->get();

        // Pre-select class if provided
        $selectedClass = null;
        $students = collect();

        if ($request->filled('class_id')) {
            $selectedClass = SchoolClass::find($request->class_id);
            $students = $selectedClass?->students ?? collect();
        }

        return Inertia::render('Grades/Create', [
            'classes' => $classes,
            'subjects' => $subjects,
            'components' => $components,
            'students' => $students,
            'tasks' => $tasks,
            'quizzes' => $quizzes,
            'exams' => $exams,
            'selectedClass' => $selectedClass,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('grades create');

        $validated = $request->validate([
            'student_id' => 'required|exists:users,id',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'component_id' => 'required|exists:grade_components,id',
            'score' => 'required|numeric|min:0|max:100',
            'academic_year' => 'required|string|max:9',
            'remarks' => 'nullable|string|max:500',
        ]);

        $validated['calculated_by'] = auth()->id();
        $validated['calculated_at'] = now();

        // Get enrollment for this student and class
        $enrollment = StudentEnrollment::where('student_id', $validated['student_id'])
            ->where('class_id', $validated['class_id'])
            ->first();

        if (!$enrollment) {
            return back()->withErrors([
                'student_id' => 'Siswa tidak terdaftar di kelas ini.'
            ])->withInput();
        }

        $validated['enrollment_id'] = $enrollment->id;

        // Check if grade already exists for this student, subject, component, and period
        $existingGrade = FinalGrade::where('student_id', $validated['student_id'])
            ->where('subject_id', $validated['subject_id'])
            ->where('component_id', $validated['component_id'])
            ->where('academic_year', $validated['academic_year'])
            ->first();

        if ($existingGrade) {
            return back()->withErrors([
                'component_id' => 'Nilai untuk komponen ini sudah ada untuk siswa tersebut pada periode yang sama.'
            ])->withInput();
        }

        // Calculate weighted score
        $component = GradeComponent::find($validated['component_id']);
        $validated['weighted_score'] = ($validated['score'] * $component->weight) / 100;

        FinalGrade::create($validated);

        return redirect()->route('grades.index')
            ->with('success', 'Nilai berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(FinalGrade $grade)
    {
        Gate::authorize('grades view', $grade);

        $grade->load(['student', 'subject', 'schoolClass', 'calculator', 'component']);

        return Inertia::render('Grades/Show', [
            'grade' => $grade,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(FinalGrade $grade)
    {
        Gate::authorize('grades edit', $grade);

        $classes = SchoolClass::where('is_active', true)->get();
        $subjects = Subject::where('is_active', true)->get();
        $components = GradeComponent::where('is_active', true)->get();
        $tasks = Task::where('is_active', true)->get();
        $quizzes = Quiz::where('is_active', true)->get();
        $exams = Exam::where('is_active', true)->get();

        $students = SchoolClass::find($grade->class_id)?->students ?? collect();

        return Inertia::render('Grades/Edit', [
            'grade' => $grade,
            'classes' => $classes,
            'subjects' => $subjects,
            'components' => $components,
            'students' => $students,
            'tasks' => $tasks,
            'quizzes' => $quizzes,
            'exams' => $exams,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FinalGrade $grade)
    {
        Gate::authorize('grades edit', $grade);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'remarks' => 'nullable|string|max:500',
        ]);

        // Recalculate weighted score if score changed
        if (isset($validated['score'])) {
            $component = $grade->component;
            $validated['weighted_score'] = ($validated['score'] * $component->weight) / 100;
        }

        $validated['calculated_by'] = auth()->id();
        $validated['calculated_at'] = now();

        $grade->update($validated);

        return redirect()->route('grades.index')
            ->with('success', 'Nilai berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FinalGrade $grade)
    {
        Gate::authorize('grades delete', $grade);

        $grade->delete();

        return redirect()->route('grades.index')
            ->with('success', 'Nilai berhasil dihapus.');
    }

    /**
     * Get students for a specific class (AJAX endpoint)
     */
    public function getStudentsByClass(SchoolClass $class)
    {
        Gate::authorize('grades create');

        $students = $class->students()->select('users.id', 'users.name')->get();

        return response()->json($students);
    }

    /**
     * Bulk create grades for a class
     */
    public function bulkCreate(Request $request)
    {
        Gate::authorize('grades create');

        $validated = $request->validate([
            'class_id' => 'required|exists:school_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'component_id' => 'required|exists:grade_components,id',
            'academic_year' => 'required|string|max:9',
            'grades' => 'required|array',
            'grades.*.student_id' => 'required|exists:users,id',
            'grades.*.score' => 'required|numeric|min:0|max:100',
            'grades.*.remarks' => 'nullable|string|max:500',
        ]);

        $created = 0;
        $errors = [];

        $component = GradeComponent::find($validated['component_id']);

        foreach ($validated['grades'] as $gradeData) {
            try {
                // Get enrollment for this student and class
                $enrollment = StudentEnrollment::where('student_id', $gradeData['student_id'])
                    ->where('class_id', $validated['class_id'])
                    ->first();

                if (!$enrollment) {
                    $errors[] = "Siswa ID {$gradeData['student_id']} tidak terdaftar di kelas ini";
                    continue;
                }

                // Check if grade already exists
                $existingGrade = FinalGrade::where('student_id', $gradeData['student_id'])
                    ->where('subject_id', $validated['subject_id'])
                    ->where('component_id', $validated['component_id'])
                    ->where('academic_year', $validated['academic_year'])
                    ->first();

                if ($existingGrade) {
                    $errors[] = "Nilai untuk siswa ID {$gradeData['student_id']} sudah ada";
                    continue;
                }

                FinalGrade::create([
                    'enrollment_id' => $enrollment->id,
                    'student_id' => $gradeData['student_id'],
                    'subject_id' => $validated['subject_id'],
                    'class_id' => $validated['class_id'],
                    'component_id' => $validated['component_id'],
                    'score' => $gradeData['score'],
                    'weighted_score' => ($gradeData['score'] * $component->weight) / 100,
                    'academic_year' => $validated['academic_year'],
                    'remarks' => $gradeData['remarks'] ?? null,
                    'calculated_by' => auth()->id(),
                    'calculated_at' => now(),
                ]);

                $created++;
            } catch (\Exception $e) {
                $errors[] = "Error untuk siswa ID {$gradeData['student_id']}: " . $e->getMessage();
            }
        }

        $message = "Berhasil menambahkan {$created} nilai.";
        if (!empty($errors)) {
            $message .= " Errors: " . implode(', ', $errors);
        }

        return redirect()->route('grades.index')
            ->with('success', $message);
    }

    /**
     * Show grade report for a student
     */
    public function studentReport(Request $request, $studentId)
    {
        Gate::authorize('grades view');

        $query = FinalGrade::where('student_id', $studentId)
            ->with(['subject', 'component', 'calculator']);

        // Filter by academic year
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        $grades = $query->get();

        // Calculate final grades per subject
        $subjectGrades = $grades->groupBy('subject_id')->map(function ($subjectGrades) {
            $totalWeightedScore = 0;
            $totalWeight = 0;

            foreach ($subjectGrades as $grade) {
                $weight = $grade->component->weight / 100;
                $weightedScore = $grade->score * $weight;
                $totalWeightedScore += $weightedScore;
                $totalWeight += $weight;
            }

            $finalScore = $totalWeight > 0 ? $totalWeightedScore / $totalWeight : 0;

            return [
                'subject' => $subjectGrades->first()->subject,
                'grades' => $subjectGrades,
                'final_score' => round($finalScore, 2),
                'grade_letter' => $this->getGradeLetter($finalScore),
            ];
        });

        $student = \App\Models\User::find($studentId);

        return Inertia::render('Grades/StudentReport', [
            'student' => $student,
            'subjectGrades' => $subjectGrades,
            'filters' => $request->only(['academic_year'])
        ]);
    }

    /**
     * Show grade report for a class
     */
    public function classReport(Request $request, SchoolClass $class)
    {
        Gate::authorize('grades view');

        $query = FinalGrade::where('class_id', $class->id)
            ->with(['student', 'subject', 'component']);

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by academic year
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        $grades = $query->get();

        // Group by student and subject
        $studentReports = $grades->groupBy(['student_id', 'subject_id'])->map(function ($studentSubjectGrades) {
            $totalWeightedScore = 0;
            $totalWeight = 0;

            foreach ($studentSubjectGrades as $grade) {
                $weight = $grade->component->weight / 100;
                $weightedScore = $grade->score * $weight;
                $totalWeightedScore += $weightedScore;
                $totalWeight += $weight;
            }

            $finalScore = $totalWeight > 0 ? $totalWeightedScore / $totalWeight : 0;

            $firstGrade = $studentSubjectGrades->first();

            return [
                'student' => $firstGrade->student,
                'subject' => $firstGrade->subject,
                'grades' => $studentSubjectGrades,
                'final_score' => round($finalScore, 2),
                'grade_letter' => $this->getGradeLetter($finalScore),
            ];
        })->groupBy('student.id');

        $subjects = $class->subjects;

        return Inertia::render('Grades/ClassReport', [
            'class' => $class,
            'studentReports' => $studentReports,
            'subjects' => $subjects,
            'filters' => $request->only(['subject_id', 'academic_year'])
        ]);
    }

    private function getGradeLetter($score)
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'E';
    }
}
