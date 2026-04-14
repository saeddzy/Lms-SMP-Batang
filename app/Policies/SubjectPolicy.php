<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;

class SubjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('subjects index');
    }

    public function view(User $user, Subject $subject): bool
    {
        if ($user->hasRole('admin') && $user->hasPermissionTo('subjects view')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->hasPermissionTo('subjects view')) {
            if ((int) $subject->teacher_id === (int) $user->id) {
                return true;
            }

            return $subject->classSubjects()->where('teacher_id', $user->id)->exists();
        }

        if ($user->hasRole('siswa') && $user->hasPermissionTo('subjects view')) {
            return $subject->classSubjects()
                ->whereHas('schoolClass.enrollments', fn ($q) => $q->where('student_id', $user->id))
                ->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('subjects create');
    }

    public function update(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('subjects edit');
    }

    public function delete(User $user, Subject $subject): bool
    {
        return $user->hasPermissionTo('subjects delete');
    }

    public function restore(User $user, Subject $subject): bool
    {
        return false;
    }

    public function forceDelete(User $user, Subject $subject): bool
    {
        return false;
    }
}
