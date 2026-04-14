<?php

namespace App\Models;

/**
 * Alias untuk StudentSubmission (tabel student_submissions) agar route binding & controller konsisten.
 *
 * Tanpa properti $table, Eloquent memakai nama tabel dari kelas ini ("task_submissions"), bukan tabel asli.
 */
class TaskSubmission extends StudentSubmission
{
    protected $table = 'student_submissions';
}
