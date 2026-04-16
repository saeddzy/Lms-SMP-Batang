<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'instructions',
        'due_date',
        'max_score',
        'class_id',
        'class_subject_id',
        'created_by',
        'is_active',
    ];

    protected $casts = [
        'due_date' => 'datetime',
        'max_score' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the class that owns this task.
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the class subject that owns this task.
     */
    public function classSubject(): BelongsTo
    {
        return $this->belongsTo(ClassSubject::class, 'class_subject_id');
    }

    /**
     * Get the user who created this task.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the teacher who owns this task through class subject.
     */
    public function teacher(): BelongsTo
    {
        return $this->hasOneThrough(User::class, ClassSubject::class, 'id', 'id', 'class_subject_id', 'teacher_id');
    }

    /**
     * Get the student submissions for this task.
     */
    public function submissions(): HasMany
    {
        return $this->hasMany(StudentSubmission::class, 'task_id');
    }

    /**
     * Check if the task is overdue.
     */
    public function getIsOverdueAttribute(): bool
    {
        return now()->isAfter($this->due_date);
    }

    /**
     * Get the status of the task (active, overdue, completed).
     */
    public function getStatusAttribute(): string
    {
        if ($this->is_overdue) {
            return 'overdue';
        }

        return $this->is_active ? 'active' : 'inactive';
    }

    /**
     * Scope a query to only include active tasks.
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
     * Scope a query to filter by creator.
     */
    public function scopeByCreator($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Scope a query to get overdue tasks.
     */
    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', now());
    }

    /**
     * Scope a query to get tasks due soon (within next 7 days).
     */
    public function scopeDueSoon($query)
    {
        return $query->whereBetween('due_date', [now(), now()->addDays(7)]);
    }
}