<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Support\Facades\Storage;

class Material extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::saving(function (Material $material): void {
            if ($material->class_subject_id && ! $material->class_id) {
                $classId = ClassSubject::query()
                    ->whereKey($material->class_subject_id)
                    ->value('class_id');
                if ($classId) {
                    $material->class_id = $classId;
                }
            }
        });
    }

    protected $fillable = [
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'material_type',
        'class_id',
        'class_subject_id',
        'uploaded_by',
        'is_active',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'file_public_url',
        'youtube_embed_url',
        'is_remote_url',
        'type_label',
    ];

    /**
     * Get the class that owns this material.
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the class subject that owns this material.
     */
    public function classSubject(): BelongsTo
    {
        return $this->belongsTo(ClassSubject::class, 'class_subject_id');
    }

    /**
     * Get the user who uploaded this material.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Get the teacher who owns this material through class subject.
     */
    public function teacher(): HasOneThrough
    {
        return $this->hasOneThrough(User::class, ClassSubject::class, 'id', 'id', 'class_subject_id', 'teacher_id');
    }

    /**
     * Get the subject that owns this material through class subject.
     */
    public function subject(): HasOneThrough
    {
        return $this->hasOneThrough(Subject::class, ClassSubject::class, 'id', 'id', 'class_subject_id', 'subject_id');
    }

    /**
     * @deprecated Gunakan file_public_url (mendukung path storage dan URL eksternal).
     */
    public function getFileUrlAttribute(): ?string
    {
        return $this->getFilePublicUrlAttribute();
    }

    /**
     * URL untuk akses file (storage) atau tautan eksternal (video URL).
     */
    public function getFilePublicUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        if (str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://')) {
            return $this->file_path;
        }

        // Route relatif: iframe <video>/pratinjau memakai host yang sama dengan halaman (cookie sesi tetap terkirim).
        // URL absolut dari APP_URL yang salah sering memicu 403 karena permintaan tanpa autentikasi.
        if ($this->exists && $this->getKey()) {
            return route('materials.file', [
                'material' => $this->getKey(),
                'v' => $this->updated_at?->timestamp ?? time(),
            ], false);
        }

        return Storage::disk('public')->url($this->file_path);
    }

    public function getIsRemoteUrlAttribute(): bool
    {
        if (!$this->file_path) {
            return false;
        }

        return str_starts_with($this->file_path, 'http://') || str_starts_with($this->file_path, 'https://');
    }

    /**
     * URL embed YouTube jika file_path berisi URL YouTube.
     */
    public function getYoutubeEmbedUrlAttribute(): ?string
    {
        if ($this->material_type !== 'video' || !$this->file_path) {
            return null;
        }
        $path = $this->file_path;
        if (!str_starts_with($path, 'http://') && !str_starts_with($path, 'https://')) {
            return null;
        }
        if (preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/', $path, $m)) {
            return 'https://www.youtube.com/embed/' . $m[1];
        }

        return null;
    }

    /**
     * Label tipe untuk tampilan (PDF / Video / file).
     */
    public function getTypeLabelAttribute(): string
    {
        if ($this->material_type === 'video') {
            return 'Video';
        }
        if ($this->material_type === 'pdf') {
            $name = strtolower((string) $this->file_name);
            $mime = strtolower((string) $this->mime_type);

            if ($mime === 'application/pdf' || str_ends_with($name, '.pdf')) {
                return 'PDF';
            }
            if (str_contains($mime, 'presentation') || str_ends_with($name, '.ppt') || str_ends_with($name, '.pptx')) {
                return 'PPT';
            }
            if (str_contains($mime, 'word') || str_ends_with($name, '.doc') || str_ends_with($name, '.docx')) {
                return 'DOC';
            }
            if (str_contains($mime, 'excel') || str_contains($mime, 'spreadsheetml') || str_ends_with($name, '.xls') || str_ends_with($name, '.xlsx') || str_ends_with($name, '.csv')) {
                return 'XLS';
            }

            return 'Dokumen';
        }
        if ($this->mime_type) {
            return strtoupper(explode('/', $this->mime_type)[1] ?? $this->mime_type);
        }

        return 'Berkas';
    }

    /**
     * Get the file size in human readable format.
     */
    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Scope a query to only include active materials.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by class.
     */
    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope a query to filter by class subject.
     */
    public function scopeByClassSubject($query, $classSubjectId)
    {
        return $query->where('class_subject_id', $classSubjectId);
    }

    /**
     * Scope a query to filter by uploader.
     */
    public function scopeByUploader($query, $userId)
    {
        return $query->where('uploaded_by', $userId);
    }
}