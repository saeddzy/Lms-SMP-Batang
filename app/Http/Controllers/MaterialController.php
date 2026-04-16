<?php

namespace App\Http\Controllers;

use App\Models\Material;
use App\Models\Subject;
use App\Models\SchoolClass;
use App\Models\ClassSubject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MaterialController extends Controller
{
    /**
     * Layani berkas materi dari storage (pratinjau/unduh) tanpa mengandalkan symlink public/storage.
     */
    public function serveFile(Request $request, Material $material)
    {
        Gate::authorize('view', $material);

        if (!$material->file_path) {
            abort(404);
        }

        if (str_starts_with($material->file_path, 'http://')
            || str_starts_with($material->file_path, 'https://')) {
            return redirect()->away($material->file_path);
        }

        $path = Storage::disk('public')->path($material->file_path);
        if (!is_file($path)) {
            abort(404);
        }

        $download = $request->boolean('download');
        $filename = $material->file_name ?: basename($material->file_path);

        return response()->file($path, [
            'Content-Disposition' => ($download ? 'attachment' : 'inline').'; filename="'.$filename.'"',
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('materials index');

        $query = Material::with([
            'subject',
            'schoolClass',
            'classSubject.schoolClass',
            'teacher',
            'classSubject',
            'uploader',
        ]);

        if (auth()->user()->hasRole('siswa')) {
            $query->whereHas('schoolClass.enrollments', function ($q) {
                $q->where('student_id', auth()->id());
            });
        }

        // Filter by subject
        if ($request->filled('subject_id')) {
            $query->whereHas('classSubject', function($q) use ($request) {
                $q->where('subject_id', $request->subject_id);
            });
        }

        // Filter by class
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }

        // Filter by teacher (for teachers, only show their materials)
        if (auth()->user()->hasRole('guru')) {
            $query->whereHas('classSubject', function($q) {
                $q->forTeacher(auth()->user());
            });
        }

        // Search by title or description
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->boolean('status'));
        }

        $materials = $query->latest()->paginate(15);

        if (auth()->user()->hasRole('guru')) {
            $subjects = Subject::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            $classes = SchoolClass::whereHas('classSubjects', function($q) {
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

        return Inertia::render('Materials/Index', [
            'materials' => $materials,
            'subjects' => $subjects,
            'classes' => $classes,
            'filters' => $request->only(['subject_id', 'class_id', 'search', 'type', 'status'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        Gate::authorize('materials create');

        // Teachers can only access subjects and classes they teach
        if (auth()->user()->hasRole('guru')) {
            // Get only subjects where the teacher is assigned
            $subjects = Subject::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            // Get only classes where the teacher teaches
            $classes = SchoolClass::whereHas('classSubjects', function($q) {
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

        return Inertia::render('Materials/Create', [
            'subjects' => $subjects,
            'classes' => $classes,
            'selectedClassId' => $selectedClassId,
            'selectedSubjectId' => $selectedSubjectId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('materials create');

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material_type' => 'required|in:pdf,video',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'file' => 'nullable|file|mimes:pdf,mp4,avi,mov,wmv|max:524288', // 512MB max
            'video_url' => 'nullable|url|max:500',
            'is_active' => 'boolean',
        ]);

        // Find the class_subject based on class_id and subject_id
        $classSubject = ClassSubject::where('class_id', $validated['class_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (!$classSubject) {
            return back()->withErrors(['subject_id' => 'Mata pelajaran tidak ditemukan untuk kelas ini.']);
        }

        if ($validated['material_type'] === 'pdf' && !$request->hasFile('file')) {
            return back()->withErrors(['file' => 'File PDF wajib diunggah.']);
        }

        if ($validated['material_type'] === 'video' && !$request->hasFile('file') && empty($validated['video_url'])) {
            return back()->withErrors(['file' => 'Unggah file video atau isi URL video.']);
        }

        $materialData = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'material_type' => $validated['material_type'],
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'uploaded_by' => auth()->id(),
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filePath = $file->store('materials', 'public');
            $materialData['file_path'] = $filePath;
            $materialData['file_name'] = $file->getClientOriginalName();
            $materialData['file_size'] = $file->getSize();
            $materialData['mime_type'] = $file->getMimeType();
        } elseif ($validated['material_type'] === 'video' && !empty($validated['video_url'])) {
            $materialData['file_path'] = $validated['video_url'];
            $materialData['file_name'] = 'Tautan video';
            $materialData['file_size'] = null;
            $materialData['mime_type'] = 'application/x-url';
        }

        $material = Material::create($materialData);

        return redirect()->route('materials.index')
            ->with('success', 'Materi berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Material $material)
    {
        Gate::authorize('view', $material);

        $material->load([
            'subject',
            'schoolClass',
            'classSubject.schoolClass',
            'teacher',
            'uploader',
            'classSubject',
        ]);

        $cs = $material->classSubject;
        $canManageMaterial = auth()->user()->hasRole('admin')
            || ($cs && $cs->isAssignedSlotTeacher(auth()->user()));

        return Inertia::render('Materials/Show', [
            'material' => $material,
            'canManageMaterial' => $canManageMaterial,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Material $material)
    {
        Gate::authorize('update', $material);

        // Teachers can only edit materials for subjects they teach
        if (auth()->user()->hasRole('guru')) {
            $subjects = Subject::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->get();

            $classes = SchoolClass::whereHas('classSubjects', function($q) {
                $q->forTeacher(auth()->user());
            })->where('is_active', true)->distinct()->get();
        } else {
            $subjects = Subject::where('is_active', true)->get();
            $classes = SchoolClass::where('is_active', true)->get();
        }

        $material->loadMissing('classSubject');

        $materialPayload = array_merge($material->toArray(), [
            'subject_id' => $material->classSubject?->subject_id,
        ]);

        return Inertia::render('Materials/Edit', [
            'material' => $materialPayload,
            'subjects' => $subjects,
            'classes' => $classes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Material $material)
    {
        Gate::authorize('update', $material);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'material_type' => 'required|in:pdf,video',
            'subject_id' => 'required|exists:subjects,id',
            'class_id' => 'required|exists:school_classes,id',
            'file' => 'nullable|file|mimes:pdf,mp4,avi,mov,wmv|max:524288',
            'video_url' => 'nullable|url|max:500',
            'is_active' => 'boolean',
        ]);

        $classSubject = ClassSubject::where('class_id', $validated['class_id'])
            ->where('subject_id', $validated['subject_id'])
            ->first();

        if (!$classSubject) {
            return back()->withErrors(['subject_id' => 'Mata pelajaran tidak ditemukan untuk kelas ini.']);
        }

        $this->authorizeClassSubjectSlotTeacher($classSubject);

        if ($validated['material_type'] === 'pdf' && !$request->hasFile('file') && !$material->file_path) {
            return back()->withErrors(['file' => 'File PDF wajib diunggah.']);
        }

        $wasLocal = $material->file_path
            && !str_starts_with($material->file_path, 'http://')
            && !str_starts_with($material->file_path, 'https://');

        $materialData = [
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'material_type' => $validated['material_type'],
            'class_id' => $validated['class_id'],
            'class_subject_id' => $classSubject->id,
            'is_active' => $request->boolean('is_active', true),
        ];

        if ($request->hasFile('file')) {
            if ($wasLocal) {
                Storage::disk('public')->delete($material->file_path);
            }
            $file = $request->file('file');
            $filePath = $file->store('materials', 'public');
            $materialData['file_path'] = $filePath;
            $materialData['file_name'] = $file->getClientOriginalName();
            $materialData['file_size'] = $file->getSize();
            $materialData['mime_type'] = $file->getMimeType();
        } elseif ($validated['material_type'] === 'video' && !empty($validated['video_url'])) {
            if ($wasLocal) {
                Storage::disk('public')->delete($material->file_path);
            }
            $materialData['file_path'] = $validated['video_url'];
            $materialData['file_name'] = 'Tautan video';
            $materialData['file_size'] = null;
            $materialData['mime_type'] = 'application/x-url';
        }

        $material->update($materialData);

        return redirect()->route('materials.show', $material)
            ->with('success', 'Materi berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Material $material)
    {
        Gate::authorize('delete', $material);

        if ($material->file_path
            && !str_starts_with($material->file_path, 'http://')
            && !str_starts_with($material->file_path, 'https://')) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return redirect()->route('materials.index')
            ->with('success', 'Materi berhasil dihapus.');
    }

    /**
     * Toggle material status (active/inactive)
     */
    public function toggleStatus(Material $material)
    {
        Gate::authorize('update', $material);

        $material->update(['is_active' => !$material->is_active]);

        $status = $material->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Materi berhasil {$status}.");
    }

    /**
     * Duplicate a material
     */
    public function duplicate(Material $material)
    {
        Gate::authorize('materials create');

        $newMaterial = $material->replicate();
        $newMaterial->title = $material->title . ' (Copy)';
        $newMaterial->uploaded_by = auth()->id();
        $newMaterial->is_active = false;
        $newMaterial->save();

        return redirect()->route('materials.edit', $newMaterial)
            ->with('success', 'Materi berhasil diduplikat. Silakan edit judul dan konten.');
    }
}
