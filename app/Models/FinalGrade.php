<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinalGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'enrollment_id',
        'class_id',
        'student_id',
        'subject_id',
        'component_id', // which grade component this grade belongs to
        'academic_year',
        'score', // actual score for this component
        'weighted_score', // score * component weight
        'remarks',
        'calculated_by',
        'calculated_at',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'weighted_score' => 'decimal:2',
        'calculated_at' => 'datetime',
    ];

    /**
     * Get the student enrollment that owns this final grade.
     */
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(StudentEnrollment::class, 'enrollment_id');
    }

    /**
     * Get the class that owns this final grade.
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the student that owns this final grade.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the subject that owns this final grade.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * Get the grade component that owns this final grade.
     */
    public function component(): BelongsTo
    {
        return $this->belongsTo(GradeComponent::class, 'component_id');
    }

    /**
     * Get the user who calculated this grade.
     */
    public function calculator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }

    /**
     * Calculate weighted score based on component weight.
     */
    public function calculateWeightedScore(): float
    {
        if (!$this->component || !$this->component->weight || $this->score === null) {
            return 0;
        }

        return round(($this->score * $this->component->weight) / 100, 2);
    }

    /**
     * Get the letter grade based on score.
     */
    public function getLetterGradeAttribute(): string
    {
        if ($this->score === null) {
            return '-';
        }

        if ($this->score >= 90) return 'A';
        if ($this->score >= 80) return 'B';
        if ($this->score >= 70) return 'C';
        if ($this->score >= 60) return 'D';
        if ($this->score >= 50) return 'E';
        return 'F';
    }

    /**
     * Scope a query to filter by enrollment.
     */
    public function scopeByEnrollment($query, $enrollmentId)
    {
        return $query->where('enrollment_id', $enrollmentId);
    }

    /**
     * Scope a query to filter by student.
     */
    public function scopeByStudent($query, $studentId)
    {
        return $query->where('student_id', $studentId);
    }

    /**
     * Scope a query to filter by class.
     */
    public function scopeByClass($query, $classId)
    {
        return $query->where('class_id', $classId);
    }

    /**
     * Scope a query to filter by subject.
     */
    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    /**
     * Scope a query to filter by component.
     */
    public function scopeByComponent($query, $componentId)
    {
        return $query->where('component_id', $componentId);
    }

    /**
     * Scope a query to filter by academic year.
     */
    public function scopeByAcademicYear($query, $year)
    {
        return $query->where('academic_year', $year);
    }
}