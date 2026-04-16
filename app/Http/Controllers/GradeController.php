<?php

namespace App\Http\Controllers;

use App\Models\FinalGrade;
use App\Models\StudentEnrollment;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Task;
use App\Models\Quiz;
use App\Models\Exam;
use App\Models\GradeComponent;
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

        $query = FinalGrade::with(['student', 'subject', 'schoolClass', 'calculator', 'component']);

        // Filter by class
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        // Filter by student
        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        // Filter by teacher (for teachers, only show grades for their subjects/classes)
        if (auth()->user()->hasRole('guru')) {
            $query->whereHas('schoolClass', function($q) {
                $q->where('teacher_id', auth()->id());
            });
        }

        // Filter by academic year
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        // Filter by semester
        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        // Filter by grade component
        if ($request->filled('component_id')) {
            $query->where('grade_component_id', $request->component_id);
        }

        // Search by student name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $grades = $query->latest()->paginate(15);

        $classes = SchoolClass::where('is_active', true)->get();
        $subjects = Subject::where('is_active', true)->get();
        $components = GradeComponent::where('is_active', true)->get();

        return Inertia::render('Grades/Index', [
            'grades' => $grades,
            'classes' => $classes,
            'subjects' => $subjects,
            'components' => $components,
            'filters' => $request->only(['class_id', 'subject_id', 'student_id', 'academic_year', 'semester', 'component_id', 'search'])
        ]);
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
