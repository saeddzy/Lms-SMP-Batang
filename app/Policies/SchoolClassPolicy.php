<?php

namespace App\Policies;

use App\Models\SchoolClass;
use App\Models\User;

class SchoolClassPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('classes index');
    }

    public function view(User $user, SchoolClass $schoolClass): bool
    {
        if ($user->hasRole('admin') && $user->hasPermissionTo('classes view')) {
            return true;
        }

        // Guru: wali kelas, atau punya minimal satu mapel yang diampu / guru mapel master
        if ($user->hasRole('guru') && $user->hasPermissionTo('classes view')) {
            if ((int) $schoolClass->teacher_id === (int) $user->id) {
                return true;
            }

            return $schoolClass->classSubjects()->forTeacher($user)->exists();
        }

        if ($user->hasRole('siswa') && $user->hasPermissionTo('classes view')) {
            return $schoolClass->enrollments()
                ->where('student_id', $user->id)
                ->where('status', 'active')
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('classes create');
    }

    public function update(User $user, SchoolClass $schoolClass): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('classes edit');
    }

    public function delete(User $user, SchoolClass $schoolClass): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('classes delete');
    }

    public function manageStudents(User $user, SchoolClass $schoolClass): bool
    {
        return $user->hasRole('admin') && $user->hasPermissionTo('classes manage_students');
    }

    public function restore(User $user, SchoolClass $schoolClass): bool
    {
        return false;
    }

    public function forceDelete(User $user, SchoolClass $schoolClass): bool
    {
        return false;
    }
}
