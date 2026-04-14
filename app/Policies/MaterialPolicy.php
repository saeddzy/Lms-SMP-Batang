<?php

namespace App\Policies;

use App\Models\Material;
use App\Models\User;

class MaterialPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('materials index');
    }

    public function view(User $user, Material $material): bool
    {
        $material->loadMissing('classSubject');

        if ($user->hasRole('admin')) {
            return $user->can('materials view') || $user->can('materials index');
        }

        if ($user->hasRole('guru') && $user->can('materials view')) {
            if ((int) $material->uploaded_by === (int) $user->id) {
                return true;
            }

            if (!$material->classSubject) {
                return false;
            }
            $material->classSubject->loadMissing('subject');

            return $material->classSubject->isTaughtBy($user);
        }

        if ($user->hasRole('siswa') && $user->can('materials view')) {
            $classId = $material->class_id ?? $material->classSubject?->class_id;
            if (!$classId) {
                return false;
            }

            return $user->enrolledClasses()->where('school_classes.id', $classId)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('materials create');
    }

    public function update(User $user, Material $material): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('guru')) {
            if (!$material->classSubject) {
                return false;
            }
            $material->classSubject->loadMissing('subject');

            return $material->classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function delete(User $user, Material $material): bool
    {
        if ($user->hasRole('admin') && $user->can('materials delete')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('materials delete')) {
            if (!$material->classSubject) {
                return false;
            }
            $material->classSubject->loadMissing('subject');

            return $material->classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function restore(User $user, Material $material): bool
    {
        return $user->can('materials delete');
    }

    public function forceDelete(User $user, Material $material): bool
    {
        return $user->can('materials delete');
    }
}
