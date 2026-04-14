<?php

namespace App\Http\Controllers;

use App\Models\SchoolClass;
use App\Models\User;
use App\Models\Subject;
use App\Models\ClassSubject;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', SchoolClass::class);

        $query = SchoolClass::with(['teacher', 'classSubjects.subject', 'classSubjects.subject.teacher', 'classSubjects.teacher', 'enrollments'])
            ->withCount(['enrollments as student_count', 'classSubjects as class_subjects_count']);

        // Filter by academic year
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        // Filter by teacher (for admin)
        if ($request->filled('teacher_id') && auth()->user()->hasRole('admin')) {
            $query->where('teacher_id', $request->teacher_id);
        }

        // Siswa: hanya kelas yang diikuti
        if (auth()->user()->hasRole('siswa')) {
            $query->whereHas('enrollments', function ($q) {
                $q->where('student_id', auth()->id());
            });
        } elseif (!auth()->user()->hasRole('admin')) {
            $user = auth()->user();
            $query->whereHas('classSubjects', function ($q) use ($user) {
                $q->forTeacher($user);
            });
        }

        $classes = $query->paginate(10)->withQueryString();

        $teachers = auth()->user()->hasRole('admin')
            ? User::role('guru')->select('id', 'name')->get()
            : collect();

        $academicYears = SchoolClass::distinct('academic_year')
            ->orderBy('academic_year', 'desc')
            ->pluck('academic_year');

        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'teachers' => $teachers,
            'academicYears' => $academicYears,
            'filters' => $request->only(['academic_year', 'teacher_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', SchoolClass::class);

        $subjects = Subject::where('is_active', true)->get();
        $students = User::role('siswa')->select('id', 'name', 'email')->get();
        $teachers = auth()->user()->hasRole('admin')
            ? User::role('guru')->select('id', 'name', 'email')->orderBy('name')->get()
            : collect();

        return Inertia::render('Classes/Create', [
            'subjects' => $subjects,
            'students' => $students,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', SchoolClass::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'academic_year' => 'required|string|max:20',
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'exists:subjects,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id',
            'is_active' => 'boolean',
            'teacher_id' => 'required|exists:users,id',
        ]);

        $homeroomTeacherId = (int) $validated['teacher_id'];

        $homeroom = User::find($homeroomTeacherId);
        if (!$homeroom || (!$homeroom->hasRole('guru') && !$homeroom->hasRole('admin'))) {
            return back()
                ->withErrors(['teacher_id' => 'Pilih akun dengan peran guru atau admin.'])
                ->withInput();
        }

        $schoolClass = SchoolClass::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'academic_year' => $validated['academic_year'],
            'teacher_id' => $homeroomTeacherId,
            'is_active' => $validated['is_active'] ?? false,
        ]);

        foreach ($validated['subject_ids'] as $subjectId) {
            ClassSubject::create([
                'class_id' => $schoolClass->id,
                'subject_id' => $subjectId,
                'teacher_id' => $homeroomTeacherId,
                'is_active' => true,
            ]);
        }

        if (!empty($validated['student_ids'])) {
            foreach ($validated['student_ids'] as $studentId) {
                StudentEnrollment::create([
                    'student_id' => $studentId,
                    'class_id' => $schoolClass->id,
                    'enrolled_at' => now(),
                    'status' => 'active',
                ]);
            }
        }

        return redirect()->route('classes.index')
            ->with('message', 'Kelas berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(SchoolClass $class): Response
    {
        Gate::authorize('view', $class);

        $class->load([
            'teacher',
            'classSubjects.subject.teacher',
            'classSubjects.teacher',
            'students',
            'enrollments.student',
            'materials' => function($query) {
                $query->latest()->take(5);
            },
            'tasks' => function($query) {
                $query->latest()->take(5);
            },
            'quizzes' => function($query) {
                $query->latest()->take(5);
            },
            'exams' => function($query) {
                $query->latest()->take(5);
            }
        ]);

        $class->loadCount(['enrollments as student_count']);

        $showTeacherOnlySubjects = false;
        if (auth()->user()->hasRole('guru')) {
            $guru = auth()->user();
            $class->loadMissing('classSubjects.subject');
            $filteredSubjects = $class->classSubjects->filter(function ($classSubject) use ($guru) {
                return $classSubject->isTaughtBy($guru);
            })->values();
            $class->setRelation('classSubjects', $filteredSubjects);
            $showTeacherOnlySubjects = true;
        }

        return Inertia::render('Classes/Show', [
            'schoolClass' => $class,
            'showTeacherOnlySubjects' => $showTeacherOnlySubjects,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(SchoolClass $class): Response
    {
        Gate::authorize('update', $class);

        $class->load(['subjects', 'students', 'classSubjects.subject', 'classSubjects.teacher']);

        $subjects = Subject::where('is_active', true)->get();
        $students = User::role('siswa')->select('id', 'name', 'email')->get();
        $teachers = User::role('guru')->select('id', 'name', 'email')->get();

        return Inertia::render('Classes/Edit', [
            'schoolClass' => $class,
            'subjects' => $subjects,
            'students' => $students,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SchoolClass $class): RedirectResponse
    {
        Gate::authorize('update', $class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'academic_year' => 'required|string|max:20',
            'subject_ids' => 'required|array|min:1',
            'subject_ids.*' => 'exists:subjects,id',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'exists:users,id',
            'is_active' => 'boolean',
        ]);

        $subjectTeacherId = (int) ($class->teacher_id ?? auth()->id());

        $class->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'academic_year' => $validated['academic_year'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        $currentSubjectIds = $class->classSubjects()->pluck('subject_id')->toArray();
        $newSubjectIds = $validated['subject_ids'];

        $subjectsToAdd = array_diff($newSubjectIds, $currentSubjectIds);
        $subjectsToRemove = array_diff($currentSubjectIds, $newSubjectIds);

        if (!empty($subjectsToRemove)) {
            ClassSubject::where('class_id', $class->id)
                ->whereIn('subject_id', $subjectsToRemove)
                ->delete();
        }

        foreach ($subjectsToAdd as $subjectId) {
            ClassSubject::create([
                'class_id' => $class->id,
                'subject_id' => $subjectId,
                'teacher_id' => $subjectTeacherId,
                'is_active' => true,
            ]);
        }

        $classSubjects = $class->classSubjects()->get();
        foreach ($classSubjects as $classSubject) {
            $fieldName = "class_subject_teacher_{$classSubject->id}";
            if ($request->has($fieldName)) {
                $teacherId = $request->input($fieldName);
                if (!empty($teacherId)) {
                    $teacherId = (int) $teacherId;
                    $teacher = User::find($teacherId);
                    if ($teacher && ($teacher->hasRole('guru') || $teacher->hasRole('admin'))) {
                        $classSubject->update(['teacher_id' => $teacherId]);
                    }
                }
            }
        }

        $currentStudentIds = $class->enrollments()->pluck('student_id')->toArray();
        $newStudentIds = $validated['student_ids'] ?? [];

        $studentsToAdd = array_diff($newStudentIds, $currentStudentIds);
        $studentsToRemove = array_diff($currentStudentIds, $newStudentIds);

        foreach ($studentsToAdd as $studentId) {
            StudentEnrollment::create([
                'student_id' => $studentId,
                'class_id' => $class->id,
                'enrolled_at' => now(),
                'status' => 'active',
            ]);
        }

        if (!empty($studentsToRemove)) {
            StudentEnrollment::where('class_id', $class->id)
                ->whereIn('student_id', $studentsToRemove)
                ->delete();
        }

        return redirect()->route('classes.index')
            ->with('message', 'Kelas berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SchoolClass $class): RedirectResponse
    {
        Gate::authorize('delete', $class);

        $class->delete();

        return redirect()->route('classes.index')
            ->with('message', 'Kelas berhasil dihapus.');
    }

    /**
     * Enroll students to a class.
     */
    public function enrollStudents(Request $request, SchoolClass $class): RedirectResponse
    {
        Gate::authorize('manageStudents', $class);

        $validated = $request->validate([
            'student_ids' => 'required|array',
            'student_ids.*' => 'exists:users,id',
        ]);

        $enrolledCount = 0;
        foreach ($validated['student_ids'] as $studentId) {
            // Check if student is not already enrolled
            $existingEnrollment = StudentEnrollment::where('student_id', $studentId)
                ->where('class_id', $class->id)
                ->first();

            if (!$existingEnrollment) {
                StudentEnrollment::create([
                    'student_id' => $studentId,
                    'class_id' => $class->id,
                    'enrolled_at' => now(),
                    'status' => 'active',
                ]);
                $enrolledCount++;
            }
        }

        return redirect()->back()
            ->with('message', "{$enrolledCount} siswa berhasil didaftarkan ke kelas.");
    }

    /**
     * Remove student from class.
     */
    public function removeStudent(Request $request, SchoolClass $class, User $student): RedirectResponse
    {
        Gate::authorize('manageStudents', $class);

        $enrollment = StudentEnrollment::where('student_id', $student->id)
            ->where('class_id', $class->id)
            ->first();

        if ($enrollment) {
            $enrollment->delete();
            return redirect()->back()
                ->with('message', 'Siswa berhasil dikeluarkan dari kelas.');
        }

        return redirect()->back()
            ->with('error', 'Siswa tidak terdaftar di kelas ini.');
    }

    /**
     * Alihkan status publikasi kelas (aktif / tidak aktif) — untuk admin.
     */
    public function toggleActive(SchoolClass $class): RedirectResponse
    {
        Gate::authorize('update', $class);

        $class->update(['is_active' => ! $class->is_active]);

        $msg = $class->is_active
            ? 'Kelas dipublikasikan (aktif).'
            : 'Kelas tidak dipublikasikan (dinonaktifkan).';

        return redirect()->back()->with('message', $msg);
    }
}
