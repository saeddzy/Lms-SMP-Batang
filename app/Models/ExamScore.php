<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'enrollment_id', // links to student enrollment
        'student_id', // redundant but useful for queries
        'marks_obtained',
        'percentage',
        'grade', // A, B, C, D, E, F
        'remarks',
        'scored_by',
        'scored_at',
        'is_absent',
    ];

    protected $casts = [
        'marks_obtained' => 'decimal:2',
        'percentage' => 'decimal:2',
        'scored_at' => 'datetime',
        'is_absent' => 'boolean',
    ];

    /**
     * Get the exam that owns this score.
     */
    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class, 'exam_id');
    }

    /**
     * Get the student enrollment that owns this score.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(StudentEnrollment::class, 'enrollment_id');
    }

    /**
     * Get the student that owns this score.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the user who scored this exam.
     */
    public function scorer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scored_by');
    }

    /**
     * Calculate percentage based on marks obtained and total marks.
     */
    public function calculatePercentage(): float
    {
        if (!$this->exam || !$this->exam->total_marks || $this->marks_obtained === null) {
            return 0;
        }

        return round(($this->marks_obtained / $this->exam->total_marks) * 100, 2);
    }

    /**
     * Calculate grade based on percentage.
     */
    public function calculateGrade(): string
    {
        $percentage = $this->percentage ?? $this->calculatePercentage();

        if ($percentage >= 90) return 'A';
        if ($percentage >= 80) return 'B';
        if ($percentage >= 70) return 'C';
        if ($percentage >= 60) return 'D';
        if ($percentage >= 50) return 'E';
        return 'F';
    }

    /**
     * Check if the student passed the exam.
     */
    public function getIsPassedAttribute(): bool
    {
        if ($this->is_absent) {
            return false;
        }

        $percentage = $this->percentage ?? $this->calculatePercentage();
        return $percentage >= ($this->exam->passing_marks ?? 60);
    }

    /**
     * Scope a query to filter by exam.
     */
    public function scopeByExam($query, $examId)
    {
        return $query->where('exam_id', $examId);
    }

    /**
     * Scope a query to filter by student.
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope a query to filter by enrollment.
     */
    public function scopeByEnrollment($query, $enrollmentId)
    {
        return $query->where('enrollment_id', $enrollmentId);
    }

    /**
     * Scope a query to get passed exams.
     */
    public function scopePassed($query)
    {
        return $query->where('is_absent', false)
                    ->whereRaw('COALESCE(percentage, (marks_obtained / (SELECT total_marks FROM exams WHERE exams.id = exam_scores.exam_id)) * 100) >= COALESCE((SELECT passing_marks FROM exams WHERE exams.id = exam_scores.exam_id), 60)');
    }

    /**
     * Scope a query to get failed exams.
     */
    public function scopeFailed($query)
    {
        return $query->where(function ($q) {
            $q->where('is_absent', true)
              ->orWhereRaw('COALESCE(percentage, (marks_obtained / (SELECT total_marks FROM exams WHERE exams.id = exam_scores.exam_id)) * 100) < COALESCE((SELECT passing_marks FROM exams WHERE exams.id = exam_scores.exam_id), 60)');
        });
    }
}