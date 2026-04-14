<?php

namespace App\Http\Controllers;

use App\Models\FinalGrade;
use App\Models\StudentEnrollment;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Task;
use App\Models\Quiz;
use App\Models\Exam;
use App\Models\TaskSubmission;
use App\Models\QuizAttempt;
use App\Models\ExamAttempt;
use App\Models\GradeComponent;
use App\Models\ClassSubject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Inertia\Inertia;

class GradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', FinalGrade::class);
        $query = $this->gradeIndexQuery($request);

        $grades = $query->latest()->paginate(15);

        $user = auth()->user();
        if ($user->hasRole('siswa')) {
            $classes = $user->enrolledClasses()->with('classSubjects')->where('is_active', true)->get();
            $subjectIds = $classes->flatMap(fn ($c) => $c->classSubjects->pluck('subject_id'))->unique()->filter();
            $subjects = $subjectIds->isEmpty()
                ? collect()
                : Subject::whereIn('id', $subjectIds)->where('is_active', true)->get();
        } elseif ($user->hasRole('guru')) {
            $classes = SchoolClass::where('is_active', true)
                ->whereHas('classSubjects', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $subjects = Subject::where('is_active', true)
                ->whereHas('classSubjects', fn ($cs) => $cs->forTeacher($user))
                ->get();
        } else {
            $classes = SchoolClass::where('is_active', true)->get();
            $subjects = Subject::where('is_active', true)->get();
        }
        $components = GradeComponent::where('is_active', true)->get();
        $selectedClassId = $request->input('class_id');
        if (! $selectedClassId && $classes->count() > 0) {
            $selectedClassId = (string) $classes->first()->id;
        }

        $selectedSubjectId = $this->resolveClassBoardSubjectId(
            $selectedClassId ? (int) $selectedClassId : null,
            $request->input('subject_id'),
            $user
        );

        $subjectsForClass = collect();
        if ($selectedClassId) {
            $csQuery = ClassSubject::query()
                ->where('class_id', (int) $selectedClassId)
                ->where('is_active', true);
            if ($user->hasRole('guru')) {
                $csQuery->forTeacher($user);
            }
            $ids = $csQuery->pluck('subject_id')->unique()->filter();
            $subjectsForClass = $ids->isEmpty()
                ? collect()
                : Subject::whereIn('id', $ids)->where('is_active', true)->orderBy('name')->get();
        }

        $classBoard = [];
        if ($selectedClassId) {
            $classBoard = $this->buildClassBoard(
                (int) $selectedClassId,
                $user,
                (string) ($request->input('search') ?? ''),
                $selectedSubjectId
            );
        }

        return Inertia::render('Grades/Index', [
            'grades' => $grades,
            'classes' => $classes,
            'subjects' => $subjects,
            'subjectsForClass' => $subjectsForClass,
            'components' => $components,
            'classBoard' => $classBoard,
            'selectedClassId' => $selectedClassId,
            'selectedSubjectId' => $selectedSubjectId,
            'filters' => $request->only(['class_id', 'subject_id', 'student_id', 'academic_year', 'semester', 'component_id', 'search'])
        ]);
    }

    /**
     * Download filtered grade data as Excel-compatible CSV.
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        Gate::authorize('viewAny', FinalGrade::class);

        $classId = (int) ($request->input('class_id') ?? 0);
        $class = $classId > 0 ? SchoolClass::find($classId) : null;
        $filename = $class
            ? ('rekap_nilai_' . str($class->name)->slug('_') . '_' . now()->format('Ymd_His') . '.csv')
            : ('manajemen_nilai_' . now()->format('Ymd_His') . '.csv');
        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename={$filename}",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        if ($classId > 0) {
            $subjectId = $this->resolveClassBoardSubjectId(
                $classId,
                $request->input('subject_id'),
                auth()->user()
            );
            $subjectName = $subjectId ? Subject::find($subjectId)?->name : null;

            $board = $this->buildClassBoard(
                $classId,
                auth()->user(),
                (string) ($request->input('search') ?? ''),
                $subjectId
            );

            return response()->streamDownload(function () use ($board, $class, $subjectName) {
                $out = fopen('php://output', 'w');
                fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM

                $header = [
                    'Kelas',
                    'Siswa',
                    'Email',
                    'Rata-rata Tugas',
                    'Rata-rata Kuis',
                    'Rata-rata Ujian',
                    'Rata-rata Akhir',
                ];
                if ($subjectName) {
                    array_splice($header, 3, 0, ['Mata pelajaran']);
                }
                fputcsv($out, $header);

                foreach ($board as $row) {
                    $line = [
                        $class?->name ?? '-',
                        $row['student_name'] ?? '-',
                        $row['student_email'] ?? '-',
                    ];
                    if ($subjectName) {
                        array_splice($line, 3, 0, [$subjectName]);
                    }
                    $line = array_merge($line, [
                        (string) (($row['task_avg'] ?? 0) . '%'),
                        (string) (($row['quiz_avg'] ?? 0) . '%'),
                        (string) (($row['exam_avg'] ?? 0) . '%'),
                        (string) (($row['overall_avg'] ?? 0) . '%'),
                    ]);
                    fputcsv($out, $line);
                }
                fclose($out);
            }, $filename, $headers);
        }

        $rows = $this->gradeIndexQuery($request)->latest()->get();
        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM

            fputcsv($out, [
                'Siswa',
                'NIS/Email',
                'Kelas',
                'Mata Pelajaran',
                'Komponen',
                'Nilai',
                'Nilai Bobot',
                'Tahun Ajaran',
                'Semester',
                'Tanggal Hitung',
                'Catatan',
            ]);

            foreach ($rows as $grade) {
                fputcsv($out, [
                    $grade->student?->name ?? '-',
                    $grade->student?->email ?? '-',
                    $grade->schoolClass?->name ?? '-',
                    $grade->subject?->name ?? '-',
                    $grade->component?->name ?? '-',
                    (string) $grade->score,
                    (string) ($grade->weighted_score ?? '-'),
                    $grade->academic_year ?? '-',
                    (string) ($grade->semester ?? '-'),
                    optional($grade->calculated_at)->format('Y-m-d H:i:s') ?? '-',
                    $grade->remarks ?? '',
                ]);
            }
            fclose($out);
        }, $filename, $headers);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Gate::authorize('create', FinalGrade::class);

        $user = auth()->user();
        if ($user->hasRole('guru')) {
            $classes = SchoolClass::where('is_active', true)
                ->whereHas('classSubjects', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $subjects = Subject::where('is_active', true)
                ->whereHas('classSubjects', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $tasks = Task::where('is_active', true)
                ->whereHas('classSubject', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $quizzes = Quiz::where('is_active', true)
                ->whereHas('classSubject', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $exams = Exam::where('is_active', true)
                ->whereHas('classSubject', fn ($cs) => $cs->forTeacher($user))
                ->get();
        } else {
            $classes = SchoolClass::where('is_active', true)->get();
            $subjects = Subject::where('is_active', true)->get();
            $tasks = Task::where('is_active', true)->get();
            $quizzes = Quiz::where('is_active', true)->get();
            $exams = Exam::where('is_active', true)->get();
        }
        $components = GradeComponent::where('is_active', true)->get();

        // Pre-select class if provided
        $selectedClass = null;
        $students = collect();

        if ($request->filled('class_id')) {
            $selectedClass = SchoolClass::find($request->class_id);
            if ($selectedClass && $user->hasRole('guru')) {
                Gate::authorize('view', $selectedClass);
            }
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
        Gate::authorize('create', FinalGrade::class);

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
        Gate::authorize('view', $grade);

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
        Gate::authorize('update', $grade);

        $user = auth()->user();
        if ($user->hasRole('guru')) {
            $classes = SchoolClass::where('is_active', true)
                ->whereHas('classSubjects', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $subjects = Subject::where('is_active', true)
                ->whereHas('classSubjects', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $tasks = Task::where('is_active', true)
                ->whereHas('classSubject', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $quizzes = Quiz::where('is_active', true)
                ->whereHas('classSubject', fn ($cs) => $cs->forTeacher($user))
                ->get();
            $exams = Exam::where('is_active', true)
                ->whereHas('classSubject', fn ($cs) => $cs->forTeacher($user))
                ->get();
        } else {
            $classes = SchoolClass::where('is_active', true)->get();
            $subjects = Subject::where('is_active', true)->get();
            $tasks = Task::where('is_active', true)->get();
            $quizzes = Quiz::where('is_active', true)->get();
            $exams = Exam::where('is_active', true)->get();
        }
        $components = GradeComponent::where('is_active', true)->get();

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
        Gate::authorize('update', $grade);

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
        Gate::authorize('delete', $grade);

        $grade->delete();

        return redirect()->route('grades.index')
            ->with('success', 'Nilai berhasil dihapus.');
    }

    /**
     * Get students for a specific class (AJAX endpoint)
     */
    public function getStudentsByClass(SchoolClass $class)
    {
        Gate::authorize('create', FinalGrade::class);

        $students = $class->students()->select('users.id', 'users.name')->get();

        return response()->json($students);
    }

    /**
     * Bulk create grades for a class
     */
    public function bulkCreate(Request $request)
    {
        Gate::authorize('create', FinalGrade::class);

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
        $viewer = auth()->user();
        $studentId = (int) $studentId;

        if ($viewer->hasRole('siswa')) {
            abort_unless($studentId === (int) $viewer->id, 403);
        } elseif ($viewer->hasRole('guru')) {
            abort_unless($viewer->can('grades view_all'), 403);
            $student = User::role('siswa')->findOrFail($studentId);
            $hasAccess = $student->enrolledClasses()
                ->where(function ($q) use ($viewer) {
                    $q->where('school_classes.teacher_id', $viewer->id)
                        ->orWhereHas('classSubjects', fn ($cs) => $cs->forTeacher($viewer));
                })->exists();
            abort_unless($hasAccess, 403);
        } else {
            Gate::authorize('grades view_all');
        }

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

        $student = User::find($studentId);

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
        Gate::authorize('view', $class);

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

    /**
     * Pastikan subject_id valid untuk kelas + peran (guru hanya mapel yang diampu).
     */
    private function resolveClassBoardSubjectId(?int $classId, mixed $subjectIdInput, User $user): ?int
    {
        if (! $classId || $subjectIdInput === null || $subjectIdInput === '') {
            return null;
        }
        $sid = (int) $subjectIdInput;
        if ($sid <= 0) {
            return null;
        }
        $q = ClassSubject::query()
            ->where('class_id', $classId)
            ->where('subject_id', $sid)
            ->where('is_active', true);
        if ($user->hasRole('guru')) {
            $q->forTeacher($user);
        }

        return $q->exists() ? $sid : null;
    }

    private function gradeIndexQuery(Request $request)
    {
        $query = FinalGrade::with(['student', 'subject', 'schoolClass', 'calculator', 'component']);

        if (auth()->user()->hasRole('siswa')) {
            $query->where('student_id', auth()->id());
        }

        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if (auth()->user()->hasRole('guru')) {
            $user = auth()->user();
            $query->where(function ($q) use ($user) {
                $q->whereHas('schoolClass', fn ($c) => $c->where('teacher_id', $user->id))
                    ->orWhereHas('schoolClass.classSubjects', function ($cs) use ($user) {
                        $cs->whereColumn('class_subjects.subject_id', 'final_grades.subject_id')
                            ->forTeacher($user);
                    });
            });
        }

        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }
        if ($request->filled('component_id')) {
            $query->where('component_id', $request->component_id);
        }
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * Rekap nilai per siswa dalam satu kelas (tugas, kuis, ujian).
     *
     * @return array<int, array<string, mixed>>
     */
    private function buildClassBoard(int $classId, User $viewer, string $search = '', ?int $subjectId = null): array
    {
        $class = SchoolClass::with(['students' => function ($q) use ($search) {
            if ($search !== '') {
                $q->where('name', 'like', "%{$search}%");
            }
            $q->orderBy('name');
        }])->find($classId);
        if (! $class) {
            return [];
        }

        if ($viewer->hasRole('guru')) {
            $allowed = $viewer->id === $class->teacher_id
                || $class->classSubjects()->forTeacher($viewer)->exists();
            if (! $allowed) {
                return [];
            }
        }

        return $class->students->map(function ($student) use ($classId, $subjectId) {
            $taskAvg = (float) (TaskSubmission::query()
                ->where('student_id', $student->id)
                ->whereNotNull('score')
                ->whereHas('task', function ($q) use ($classId, $subjectId) {
                    $q->where('class_id', $classId);
                    if ($subjectId) {
                        $q->whereHas('classSubject', fn ($cs) => $cs->where('subject_id', $subjectId));
                    }
                })
                ->avg('score') ?? 0);
            $quizAvg = (float) (QuizAttempt::query()
                ->where('student_id', $student->id)
                ->whereNotNull('score')
                ->whereHas('quiz', function ($q) use ($classId, $subjectId) {
                    $q->where('class_id', $classId);
                    if ($subjectId) {
                        $q->whereHas('classSubject', fn ($cs) => $cs->where('subject_id', $subjectId));
                    }
                })
                ->avg('score') ?? 0);
            $examAvg = (float) (ExamAttempt::query()
                ->where('student_id', $student->id)
                ->whereNotNull('score')
                ->whereHas('exam', function ($q) use ($classId, $subjectId) {
                    $q->where('class_id', $classId);
                    if ($subjectId) {
                        $q->whereHas('classSubject', fn ($cs) => $cs->where('subject_id', $subjectId));
                    }
                })
                ->avg('score') ?? 0);

            $parts = collect([$taskAvg, $quizAvg, $examAvg])->filter(fn ($v) => $v > 0);
            $overall = $parts->count() > 0 ? (float) $parts->avg() : 0.0;

            return [
                'student_id' => $student->id,
                'student_name' => $student->name,
                'student_email' => $student->email,
                'task_avg' => round($taskAvg, 1),
                'quiz_avg' => round($quizAvg, 1),
                'exam_avg' => round($examAvg, 1),
                'overall_avg' => round($overall, 1),
            ];
        })->values()->all();
    }
}
