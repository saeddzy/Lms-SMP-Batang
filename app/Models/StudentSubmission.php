<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class StudentSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'student_id',
        'submitted_at',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'content', // text submission content
        'score',
        'feedback',
        'graded_by',
        'graded_at',
        'status', // submitted, late, graded
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'file_size' => 'integer',
        'score' => 'decimal:2',
        'graded_at' => 'datetime',
    ];

    /**
     * Get the task that owns this submission.
     */
    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    /**
     * Get the student that owns this submission.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the user who graded this submission.
     */
    public function grader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'graded_by');
    }

    /**
     * Get the full URL for the submission file.
     */
    public function getFileUrlAttribute(): ?string
    {
        return $this->file_path ? Storage::url($this->file_path) : null;
    }

    /**
     * Get the file size in human readable format.
     */
    public function getFileSizeHumanAttribute(): ?string
    {
        if (!$this->file_size) {
            return null;
        }

        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * Check if the submission is late.
     */
    public function getIsLateAttribute(): bool
    {
        if (!$this->submitted_at || !$this->task) {
            return false;
        }

        return $this->submitted_at->isAfter($this->task->due_date);
    }

    /**
     * Get the score percentage.
     */
    public function getScorePercentageAttribute(): ?float
    {
        if (!$this->score || !$this->task || !$this->task->max_score) {
            return null;
        }

        return round(($this->score / $this->task->max_score) * 100, 2);
    }

    /**
     * Scope a query to only include submitted submissions.
     */
    public function scopeSubmitted($query)
    {
        return $query->whereNotNull('submitted_at');
    }

    /**
     * Scope a query to only include graded submissions.
     */
    public function scopeGraded($query)
    {
        return $query->whereNotNull('graded_at');
    }

    /**
     * Scope a query to filter by task.
     */
    public function scopeByTask($query, $taskId)
    {
        return $query->where('task_id', $taskId);
    }

    /**
     * Scope a query to filter by student.
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope a query to get late submissions.
     */
    public function scopeLate($query)
    {
        return $query->join('tasks', 'student_submissions.task_id', '=', 'tasks.id')
                    ->whereColumn('student_submissions.submitted_at', '>', 'tasks.due_date')
                    ->select('student_submissions.*');
    }
}