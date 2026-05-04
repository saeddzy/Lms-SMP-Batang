<?php

namespace App\Http\Controllers;

use App\Models\ClassSubject;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Task;
use App\Models\TaskSubmission;
use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class TaskController extends Controller
{
    /** Ukuran maks. lampiran tugas (MB dikonversi ke KB untuk Laravel `max`). */
    private const TASK_FILE_MAX_KB = 20480; // 20 MB

    /**
     * Normalisasi path relatif ke disk `public` dan variasi umum data lama (URL penuh, prefix ekstra).
     *
     * @return list<string>
     */
    private function submissionFilePathCandidates(?string $raw): array
    {
        if ($raw === null || $raw === '') {
            return [];
        }

        $s = trim((string) $raw);
        $s = str_replace("\0", '', $s);
        // Path kadang tersimpan ter-encode (URL / double-encoded)
        $s = rawurldecode($s);
        $s = trim($s);

        if (preg_match('#^https?://#i', $s)) {
            $path = parse_url($s, PHP_URL_PATH);
            $s = is_string($path) ? rawurldecode($path) : '';
        }

        $s = str_replace('\\', '/', $s);
        $s = ltrim($s, '/');

        foreach (['storage/app/public/', 'public/storage/', 'public/', 'app/public/'] as $pfx) {
            while (str_starts_with($s, $pfx)) {
                $s = substr($s, strlen($pfx));
            }
        }
        while (str_starts_with($s, 'storage/')) {
            $s = substr($s, 6);
        }

        if ($s === '') {
            return [];
        }

        $base = basename($s);
        $candidates = [$s];
        if ($base !== '' && $base !== $s && ! str_contains($s, 'task-submissions')) {
            $candidates[] = 'task-submissions/'.$base;
        }

        return array_values(array_unique(array_filter($candidates)));
    }

    /**
     * Cek file di disk public — Flysystem "exists" kadang beda dengan file_exists di Windows/path Unicode.
     */
    private function publicDiskPathExists(FilesystemAdapter $disk, string $relative): ?string
    {
        $relative = str_replace('\\', '/', $relative);
        if ($relative === '') {
            return null;
        }

        try {
            if ($disk->exists($relative)) {
                return $disk->path($relative);
            }
        } catch (\Throwable) {
            // lanjut ke fallback
        }

        try {
            $absolute = $disk->path($relative);
            if (is_file($absolute) && is_readable($absolute)) {
                return $absolute;
            }
        } catch (\Throwable) {
            return null;
        }

        return null;
    }

    /**
     * Jika file_path di DB terpotong atau mismatch tipis, cari satu berkas di task-submissions yang cocok dengan awalan nama.
     */
    private function guessPublicSubmissionFileByPrefix(string $rawPath): ?string
    {
        $s = str_replace('\\', '/', trim($rawPath));
        $s = ltrim($s, '/');
        foreach (['storage/app/public/', 'public/storage/', 'public/', 'app/public/'] as $pfx) {
            while (str_starts_with($s, $pfx)) {
                $s = substr($s, strlen($pfx));
            }
        }
        while (str_starts_with($s, 'storage/')) {
            $s = substr($s, 6);
        }
        if (! str_starts_with($s, 'task-submissions/')) {
            return null;
        }
        $leaf = basename($s);
        if ($leaf === '' || strlen($leaf) < 6) {
            return null;
        }
        $dir = storage_path('app/public/task-submissions');
        if (! is_dir($dir)) {
            return null;
        }
        $pattern = $dir.DIRECTORY_SEPARATOR.$leaf.'*';
        $matches = glob($pattern);
        if ($matches !== false && count($matches) === 1 && is_file($matches[0])) {
            return $matches[0];
        }

        return null;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('tasks index');

        $query = Task::with([
            'subject',
            'schoolClass' => fn ($q) => $q->withCount('students'),
            'teacher',
            'classSubject',
        ])->withCount('submissions');

        if (auth()->user()->hasRole('siswa')) {
            $query->whereHas('schoolClass.enrollments', function ($q) {
                $q->where('student_id', auth()->id());
            });
        }

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->whereHas('classSubject', function ($q) use ($request) {
                $q->where('subject_id', $request->subject_id);
            });
        }

        // Filter by class
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filter by task creator/teacher (admin use-case)
        if ($request->filled('teacher_id')) {
            $query->where('created_by', (int) $request->teacher_id);
        }

        // Filter by teacher (for teachers, only show their tasks)
        if (auth()->user()->hasRole('guru')) {
            $query->whereHas('classSubject', function ($q) {
                $q->forTeacher(auth()->user());
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            switch ($request->status) {
                case 'active':
                    $query->where('is_active', true)
                        ->where('due_date', '>', now());
                    break;
                case 'overdue':
                    $query->where('due_date', '<', now());
                    break;
                case 'inactive':
                    $query->where('is_active', false);
                    break;
            }
        }

        // Search by title or description
        if ($request->filled('search')) {
            $search = trim((string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('subject', function ($subjectQuery) use ($search) {
                        $subjectQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('code', 'like', "%{$search}%");
                    })
                    ->orWhereHas('schoolClass', function ($classQuery) use ($search) {
                        $classQuery->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $tasks = $query->latest()->paginate(15)->withQueryString();
        $tasks->getCollection()->transform(function (Task $task) {
            $status = 'inactive';
            if ($task->is_active) {
                $status = ($task->due_date && now()->gt($task->due_date))
                    ? 'overdue'
                    : 'active';
            }

            return array_merge($task->toArray(), [
                'status' => $status,
                'participants_count' => (int) ($task->schoolClass->students_count ?? 0),
            ]);
        });

        if (auth()->user()->hasRole('guru')) {
            $subjects = Subject::whereHas('classSubjects', function ($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            $classes = SchoolClass::whereHas('classSubjects', function ($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->distinct()->get();
        } elseif (auth()->user()->hasRole('siswa')) {
            $classes = auth()->user()->enrolledClasses()->with('classSubjects')->where('is_active', true)->get();
            $subjectIds = $classes->flatMap(fn ($c) => $c->classSubjects->pluck('subject_id'))->unique()->filter();
            $subjects = $subjectIds->isEmpty()
                ? collect()
                : Subject::whereIn('id', $subjectIds)->where('is_active', true)->get();
        } else {
            $subjects = Subject::where('is_active', true)->get();
            $classes = SchoolClass::where('is_active', true)->get();
        }

        $teachers = User::role('guru')
            ->select('id', 'name', 'email', 'nis', 'nip')
            ->orderBy('name')
            ->get();

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'subjects' => $subjects,
            'classes' => $classes,
            'teachers' => $teachers,
            'filters' => $request->only(['subject_id', 'class_id', 'teacher_id', 'search', 'status']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Gate::authorize('tasks create');

        // Teachers can only access subjects and classes they teach
        if (auth()->user()->hasRole('guru')) {
            $subjects = Subject::whereHas('classSubjects', function ($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            $classes = SchoolClass::whereHas('classSubjects', function ($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->distinct()->get();
        } else {
            // Admin can see all subjects and classes
            $subjects = Subject::where('is_active', true)->get();
            $classes = SchoolClass::where('is_active', true)->get();
        }

        $selectedClassId = null;
        $selectedSubjectId = null;

        if ($request->filled('class_subject_id')) {
            $classSubject = ClassSubject::with('schoolClass', 'subject')->find($request->class_subject_id);
            if ($classSubject) {
                $selectedClassId = $classSubject->class_id;
                $selectedSubjectId = $classSubject->subject_id;
            }
        } else {
            $selectedClassId = $request->class_id;
            $selectedSubjectId = $request->subject_id;
        }

        return Inertia::render('Tasks/Create', [
            'subjects' => $subjects,
            'classes' => $classes,
            'selectedClassId' => $selectedClassId,
            'selectedSubjectId' => $selectedSubjectId,
            'classSubjectsMap' => $this->buildClassSubjectsMap($classes),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('tasks create');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'due_date' => 'required|date|after_or_equal:now',
            'max_score' => 'nullable|numeric|min:0|max:100',
            'instructions' => 'nullable|string',
            'file_path' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        // Find the class_subject based on class_id and subject_id
        $classSubject = ClassSubject::where('class_id', $validated['class_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (! $classSubject) {
            return back()->withErrors(['subject_id' => 'Mata pelajaran tidak ditemukan untuk kelas ini.']);
        }

        $this->authorizeClassSubjectSlotTeacher($classSubject);

        $task = Task::create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'instructions' => $validated['instructions'] ?? null,
            'due_date' => $validated['due_date'],
            'max_score' => $validated['max_score'] ?? 100,
            'file_path' => $validated['file_path'] ?? null,
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'created_by' => auth()->id(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('tasks.index')
            ->with('success', 'Tugas berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Task $task)
    {
        Gate::authorize('view', $task);

        $with = ['subject', 'creator', 'teacher'];

        if (auth()->user()->can('tasks view_submissions')) {
            $with[] = 'schoolClass.students';
        } else {
            $with[] = 'schoolClass';
        }

        $task->load($with);
        $task->loadMissing('classSubject');

        // Load submissions for teachers and admins
        if (auth()->user()->can('tasks view_submissions')) {
            $submissions = $task->submissions()
                ->with(['student', 'grader'])
                ->orderBy('submitted_at', 'desc')
                ->get();
        } else {
            // For students, only show their own submission
            $submissions = $task->submissions()
                ->where('student_id', auth()->id())
                ->with(['student', 'grader'])
                ->get();
        }

        $studentIds = $task->relationLoaded('schoolClass') && $task->schoolClass?->relationLoaded('students')
            ? $task->schoolClass->students->pluck('id')
            : collect();

        $stats = [
            'total_students' => $studentIds->count(),
            'submitted_count' => $submissions->whereNotNull('submitted_at')->count(),
            'graded_count' => $submissions->whereNotNull('score')->count(),
            'avg_score' => round((float) ($submissions->whereNotNull('score')->avg('score') ?? 0), 1),
        ];

        $cs = $task->classSubject;
        $canManageTask = auth()->user()->hasRole('admin')
            || ($cs && $cs->isAssignedSlotTeacher(auth()->user()));

        return Inertia::render('Tasks/Show', [
            'task' => $task,
            'submissions' => $submissions ?? [],
            'stats' => $stats,
            'canManageTask' => $canManageTask,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Task $task)
    {
        Gate::authorize('update', $task);

        // Teachers can only edit tasks for subjects they teach
        if (auth()->user()->hasRole('guru')) {
            $subjects = Subject::whereHas('classSubjects', function ($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            $classes = SchoolClass::whereHas('classSubjects', function ($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->distinct()->get();
        } else {
            $subjects = Subject::where('is_active', true)->get();
            $classes = SchoolClass::where('is_active', true)->get();
        }

        $task->loadMissing('classSubject');

        $taskPayload = array_merge($task->toArray(), [
            'subject_id' => $task->classSubject?->subject_id,
        ]);

        return Inertia::render('Tasks/Edit', [
            'task' => $taskPayload,
            'subjects' => $subjects,
            'classes' => $classes,
            'classSubjectsMap' => $this->buildClassSubjectsMap($classes),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Task $task)
    {
        Gate::authorize('update', $task);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'due_date' => 'required|date',
            'max_score' => 'nullable|numeric|min:0|max:100',
            'instructions' => 'nullable|string',
            'file_path' => 'nullable|string|max:500',
            'is_active' => 'boolean',
        ]);

        $classSubject = ClassSubject::where('class_id', $validated['class_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (! $classSubject) {
            return back()->withErrors(['subject_id' => 'Mata pelajaran tidak ditemukan untuk kelas ini.']);
        }

        $this->authorizeClassSubjectSlotTeacher($classSubject);

        $task->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'instructions' => $validated['instructions'] ?? null,
            'due_date' => $validated['due_date'],
            'max_score' => $validated['max_score'] ?? 100,
            'file_path' => $validated['file_path'] ?? null,
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('tasks.index')
            ->with('success', 'Tugas berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Task $task)
    {
        Gate::authorize('delete', $task);

        $task->delete();

        return redirect()->route('tasks.index')
            ->with('success', 'Tugas berhasil dihapus.');
    }

    /**
     * Form pengumpulan tugas (siswa).
     */
    public function submitPage(Task $task)
    {
        Gate::authorize('view', $task);

        if (! auth()->user()->hasRole('siswa')) {
            abort(403, 'Hanya siswa yang dapat mengumpulkan tugas.');
        }

        if (! $task->schoolClass->students()->where('users.id', auth()->id())->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas ini.');
        }

        $task->load([
            'subject',
            'schoolClass',
            'submissions' => function ($q) {
                $q->where('student_id', auth()->id());
            },
        ]);

        $submission = $task->submissions->first();

        return Inertia::render('Student/TaskSubmit', [
            'task' => $task,
            'submission' => $submission,
        ]);
    }

    /**
     * Submit a task (for students)
     */
    public function submit(Request $request, Task $task)
    {
        // Check if user is a student and enrolled in the class
        if (! auth()->user()->hasRole('siswa')) {
            abort(403, 'Hanya siswa yang dapat mengumpulkan tugas.');
        }

        if (! $task->schoolClass->students()->where('users.id', auth()->id())->exists()) {
            abort(403, 'Anda tidak terdaftar di kelas ini.');
        }

        // Check if task is still active and not overdue
        if (! $task->is_active || $task->due_date < now()) {
            return back()->with('error', 'Tugas sudah tidak dapat dikumpulkan.');
        }

        $validated = $request->validate([
            'content' => 'nullable|string|max:50000',
            'remove_file' => 'sometimes|boolean',
            'youtube_url' => [
                'nullable',
                'string',
                'max:500',
                'regex:/^https?:\/\/(www\.)?(youtube\.com\/|youtu\.be\/).+/i',
            ],
            'file' => [
                'nullable',
                'file',
                'max:'.self::TASK_FILE_MAX_KB,
                'mimes:pdf,ppt,pptx,jpg,jpeg,png,gif,webp,xls,xlsx',
            ],
        ]);

        $existingSubmission = $task->submissions()->where('student_id', auth()->id())->first();
        $removeFile = $request->boolean('remove_file');
        $hasNewFile = $request->hasFile('file');

        $hadStoredFile = $existingSubmission
            && $existingSubmission->file_path
            && ! str_starts_with((string) $existingSubmission->file_path, 'http');

        $willStillHaveFileAfter = $hasNewFile || ($hadStoredFile && ! $removeFile);

        $hasText = isset($validated['content']) && trim((string) $validated['content']) !== '';
        $hasYoutube = ! empty($validated['youtube_url'] ?? null);

        if (! $hasText && ! $hasYoutube && ! $willStillHaveFileAfter) {
            throw ValidationException::withMessages([
                'content' => 'Isi teks jawaban, unggah berkas, atau tautan video YouTube (minimal salah satu).',
            ]);
        }

        $data = [
            'content' => $hasText ? $validated['content'] : null,
            'youtube_url' => $hasYoutube ? $validated['youtube_url'] : null,
            'submitted_at' => now(),
            'status' => 'submitted',
        ];

        if ($hasNewFile) {
            if ($existingSubmission?->file_path
                && ! str_starts_with((string) $existingSubmission->file_path, 'http')) {
                Storage::disk('public')->delete($existingSubmission->file_path);
            }
            $file = $request->file('file');
            $data['file_path'] = $file->store('task-submissions', 'public');
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();
        } elseif ($removeFile && $hadStoredFile) {
            Storage::disk('public')->delete($existingSubmission->file_path);
            $data['file_path'] = null;
            $data['file_name'] = null;
            $data['file_size'] = null;
            $data['mime_type'] = null;
        }

        if ($existingSubmission) {
            $existingSubmission->update($data);
            $message = 'Tugas berhasil diperbarui.';
        } else {
            $data['student_id'] = auth()->id();
            $task->submissions()->create($data);
            $message = 'Tugas berhasil dikumpulkan.';
        }

        return redirect()->route('student.tasks')->with('success', $message);
    }

    /**
     * Unduh / buka lampiran pengumpulan (otentikasi; menggantikan file publik mentah yang bisa 403).
     */
    public function downloadSubmissionFile(Task $task, TaskSubmission $submission)
    {
        if ((int) $submission->task_id !== (int) $task->id) {
            abort(404);
        }

        $user = auth()->user();
        $submission->loadMissing('task.classSubject');
        $task = $submission->task;

        if ($user->hasRole('admin') && $user->can('tasks view')) {
            // ok
        } elseif ($user->hasRole('siswa')) {
            if ((int) $submission->student_id !== (int) $user->id) {
                abort(403);
            }
            if (! $user->enrolledClasses()->where('school_classes.id', $task->class_id)->exists()) {
                abort(403);
            }
        } elseif ($user->hasRole('guru')) {
            Gate::authorize('view', $task);
        } else {
            abort(403);
        }

        $rawPath = $submission->file_path;
        if (! $rawPath) {
            abort(404);
        }

        $disk = Storage::disk('public');
        $downloadName = $submission->file_name ?: 'lampiran';

        foreach ($this->submissionFilePathCandidates($rawPath) as $rel) {
            $absolute = $this->publicDiskPathExists($disk, $rel);
            if ($absolute !== null) {
                $response = new BinaryFileResponse($absolute);
                $response->setContentDisposition('inline', $downloadName);

                return $response;
            }
        }

        $guessed = $this->guessPublicSubmissionFileByPrefix((string) $rawPath);
        if ($guessed !== null) {
            $response = new BinaryFileResponse($guessed);
            $response->setContentDisposition('inline', $downloadName);

            return $response;
        }

        abort(404);
    }

    /**
     * Grade a task submission (for teachers)
     */
    public function gradeSubmission(Request $request, Task $task, TaskSubmission $submission)
    {
        Gate::authorize('tasks grade');

        if ((int) $submission->task_id !== (int) $task->id) {
            abort(404);
        }

        $submission->task->loadMissing('classSubject.subject');
        Gate::authorize('view', $task);

        $validated = $request->validate([
            'score' => 'required|numeric|min:0|max:'.$submission->task->max_score,
            'feedback' => 'nullable|string|max:1000',
        ]);

        $validated['graded_at'] = now();
        $validated['graded_by'] = auth()->id();

        $submission->update($validated);

        return back()->with('success', 'Penilaian berhasil disimpan.');
    }

    /**
     * Toggle task status (active/inactive)
     */
    public function toggleStatus(Task $task)
    {
        Gate::authorize('tasks edit', $task);

        $task->update(['is_active' => ! $task->is_active]);

        $status = $task->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Tugas berhasil {$status}.");
    }

    private function buildClassSubjectsMap($classes): array
    {
        $classIds = collect($classes)->pluck('id')->filter()->values();
        if ($classIds->isEmpty()) {
            return [];
        }

        return ClassSubject::query()
            ->with('subject:id,name,is_active')
            ->whereIn('class_id', $classIds)
            ->where('is_active', true)
            ->get(['id', 'class_id', 'subject_id'])
            ->groupBy('class_id')
            ->map(function ($rows) {
                return $rows
                    ->map(fn ($row) => [
                        'id' => $row->subject_id,
                        'name' => $row->subject?->name,
                    ])
                    ->filter(fn ($subject) => ! empty($subject['id']) && ! empty($subject['name']))
                    ->values()
                    ->all();
            })
            ->toArray();
    }
}
