<?php

namespace App\Http\Controllers;

use App\Models\ClassSubject;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use App\Models\Material;
use App\Models\Task;
use App\Models\Quiz;
use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Subject::class);

        $query = Subject::query();

        if (!$request->user()->hasRole('admin')) {
            if ($request->user()->hasRole('siswa')) {
                $query->whereHas('classSubjects.schoolClass.enrollments', function ($q) use ($request) {
                    $q->where('student_id', $request->user()->id);
                });
            } elseif ($request->user()->hasRole('guru')) {
                $u = $request->user();
                $query->where(function ($q) use ($u) {
                    $q->where('teacher_id', $u->id)
                        ->orWhereHas('classSubjects', fn ($cs) => $cs->forTeacher($u))
                        ->orWhereHas('classSubjects.schoolClass', fn ($sc) => $sc->where('teacher_id', $u->id));
                });
            }
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name or code
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $subjects = $query
            ->with(['classSubjects.teacher', 'teacher'])
            ->withCount(['classSubjects as classes_count'])
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Subjects/Index', [
            'subjects' => $subjects,
            'filters' => $request->only(['is_active', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', Subject::class);

        $teachers = User::role('guru')->select('id', 'name', 'email', 'nis', 'nip')->get();

        return Inertia::render('Subjects/Create', [
            'teachers' => $teachers,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Gate::authorize('create', Subject::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'code' => 'required|string|max:10|unique:subjects,code',
            'teacher_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ]);

        Subject::create($validated);

        return redirect()->route('subjects.index')
            ->with('message', 'Mata pelajaran berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Subject $subject): Response
    {
        Gate::authorize('view', $subject);

        $classContext = null;
        $classSubject = null;

        // For teachers, require class context (either class_subject_id or class_id)
        if (auth()->user()->hasRole('guru')) {
            if (!$request->filled('class_subject_id') && !$request->filled('class_id')) {
                abort(403, 'Teachers must access subjects within a class context.');
            }
        }

        if ($request->filled('class_subject_id')) {
            $classSubject = ClassSubject::where('id', $request->class_subject_id)
                ->where('subject_id', $subject->id)
                ->with(['schoolClass', 'subject'])
                ->first();

            if ($classSubject && auth()->user()->hasRole('guru')) {
                if (! $classSubject->isVisibleToTeacher(auth()->user())) {
                    abort(403, 'Anda tidak memiliki akses ke mata pelajaran ini di kelas tersebut.');
                }
            }

            if (!$classSubject) {
                abort(403, 'Unauthorized to view this subject in this class.');
            }
        } elseif ($request->filled('class_id')) {
            $classContext = SchoolClass::find($request->class_id);
            if ($classContext) {
                $classSubject = ClassSubject::where('class_id', $classContext->id)
                    ->where('subject_id', $subject->id)
                    ->with(['schoolClass', 'subject'])
                    ->first();

                if ($classSubject && auth()->user()->hasRole('guru')) {
                    if (! $classSubject->isVisibleToTeacher(auth()->user())) {
                        abort(403, 'Anda tidak memiliki akses ke mata pelajaran ini di kelas tersebut.');
                    }
                }
            }
        }

        $subject->load([
            'gradeComponents' => function ($query) {
                $query->orderBy('weight', 'desc');
            },
            'classSubjects' => function ($query) {
                $query->with([
                    'subject',
                    'schoolClass' => function ($q) {
                        $q->with('teacher')->withCount('enrollments as students_count');
                    },
                    'teacher',
                ]);
            },
            'teacher',
        ]);

        $csId = $classSubject?->id;

        if ($csId) {
            $subject->setRelation(
                'materials',
                Material::where('class_subject_id', $csId)->latest()->limit(50)->get()
            );
            $subject->setRelation(
                'tasks',
                Task::where('class_subject_id', $csId)->latest()->limit(50)->get()
            );
            $subject->setRelation(
                'quizzes',
                Quiz::where('class_subject_id', $csId)->latest()->limit(50)->get()
            );
            $subject->setRelation(
                'exams',
                Exam::where('class_subject_id', $csId)->latest()->limit(50)->get()
            );
            $stats = [
                'materials_count' => Material::where('class_subject_id', $csId)->count(),
                'tasks_count' => Task::where('class_subject_id', $csId)->count(),
                'quizzes_count' => Quiz::where('class_subject_id', $csId)->count(),
                'exams_count' => Exam::where('class_subject_id', $csId)->count(),
            ];
        } else {
            $subject->load([
                'materials' => function ($query) {
                    $query->latest()->limit(50);
                },
                'tasks' => function ($query) {
                    $query->latest()->limit(50);
                },
                'quizzes' => function ($query) {
                    $query->latest()->limit(50);
                },
                'exams' => function ($query) {
                    $query->latest()->limit(50);
                },
            ]);
            $stats = [
                'materials_count' => $subject->materials()->count(),
                'tasks_count' => $subject->tasks()->count(),
                'quizzes_count' => $subject->quizzes()->count(),
                'exams_count' => $subject->exams()->count(),
            ];
        }

        if (auth()->user()->hasRole('guru')) {
            $guru = auth()->user();
            $subject->setRelation(
                'classSubjects',
                $subject->classSubjects->filter(function ($cs) use ($guru) {
                    return $cs->isVisibleToTeacher($guru);
                })->values()
            );
        }

        $user = $request->user();
        $canManageLearning = $user->hasRole('admin')
            || ($classSubject && $classSubject->isAssignedSlotTeacher($user));

        return Inertia::render('Subjects/Show', [
            'subject' => $subject,
            'classContext' => $classContext,
            'classSubject' => $classSubject,
            'stats' => $stats,
            'canManageLearning' => $canManageLearning,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request, Subject $subject): Response
    {
        Gate::authorize('update', $subject);
        if (auth()->user()->hasRole('guru')) {
            if (!$request->filled('class_subject_id') && !$request->filled('class_id')) {
                abort(403, 'Teachers must access subjects within a class context.');
            }
        }
        $teachers = User::role('guru')->select('id', 'name', 'email', 'nis', 'nip')->get();

        return Inertia::render('Subjects/Edit', [
            'subject' => $subject,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subject $subject): RedirectResponse
    {
        Gate::authorize('update', $subject);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'code' => 'required|string|max:10|unique:subjects,code,' . $subject->id,
            'teacher_id' => 'nullable|exists:users,id',
            'is_active' => 'boolean',
        ]);

        $subject->update($validated);

        return redirect()->route('subjects.index')
            ->with('message', 'Mata pelajaran berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject): RedirectResponse
    {
        Gate::authorize('delete', $subject);

        $subject->delete();

        return redirect()->route('subjects.index')
            ->with('message', 'Mata pelajaran berhasil dihapus.');
    }
}
