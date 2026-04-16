<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'class_id',
        'enrolled_at',
        'left_at',
        'status', // active, inactive, graduated, transferred
        'notes',
    ];

    protected $casts = [
        'enrolled_at' => 'datetime',
        'left_at' => 'datetime',
    ];

    /**
     * Get the student that owns this enrollment.
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    /**
     * Get the class that owns this enrollment.
     */
    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    /**
     * Get the final grade for this enrollment.
     */
    public function finalGrade()
    {
        return $this->hasOne(FinalGrade::class, 'enrollment_id');
    }

    /**
     * Get the exam scores for this enrollment.
     */
    public function examScores()
    {
        return $this->hasMany(ExamScore::class, 'enrollment_id');
    }

    /**
     * Scope a query to only include active enrollments.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
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
}