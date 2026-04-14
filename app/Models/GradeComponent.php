<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GradeComponent extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_id',
        'name', // e.g., "Tugas", "Kuis", "UTS", "UAS"
        'type', // assignment, quiz, mid_term, final
        'weight', // percentage weight (0-100)
        'description',
        'is_active',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Get the subject that owns this grade component.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    /**
     * Get the final grades that use this component.
     */
    public function finalGrades(): HasMany
    {
        return $this->hasMany(FinalGrade::class, 'component_id');
    }

    /**
     * Scope a query to only include active grade components.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to filter by subject.
     */
    public function scopeBySubject($query, $subjectId)
    {
        return $query->where('subject_id', $subjectId);
    }

    /**
     * Scope a query to filter by type.
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope a query to order by weight descending.
     */
    public function scopeOrderedByWeight($query)
    {
        return $query->orderBy('weight', 'desc');
    }
}