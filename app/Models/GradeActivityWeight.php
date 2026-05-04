<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeActivityWeight extends Model
{
    protected $fillable = [
        'class_id',
        'subject_id',
        'academic_year',
        'activity_type',
        'activity_id',
        'weight',
        'updated_by',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
    ];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
