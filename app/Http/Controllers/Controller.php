<?php

namespace App\Http\Controllers;

use App\Models\ClassSubject;

abstract class Controller
{
    /**
     * Materi/tugas/kuis/ujian hanya boleh dikelola oleh guru pengampu (class_subjects.teacher_id), bukan wali kelas atau guru mapel master saja.
     */
    protected function authorizeClassSubjectSlotTeacher(ClassSubject $classSubject): void
    {
        $user = auth()->user();
        if (! $user) {
            abort(403);
        }
        if ($user->hasRole('admin')) {
            return;
        }
        if ($user->hasRole('guru') && ! $classSubject->isAssignedSlotTeacher($user)) {
            // Jika guru tidak terdaftar, coba assign otomatis atau berikan error yang jelas
            if (!$classSubject->teacher_id) {
                // Assign user sebagai guru jika belum ada
                $classSubject->update(['teacher_id' => $user->id]);
                return;
            }
            abort(403, 'Hanya guru pengampu mata pelajaran di kelas ini yang dapat melakukan aksi ini.');
        }
    }
}
