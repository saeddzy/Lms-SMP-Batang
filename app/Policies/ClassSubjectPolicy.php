<?php

namespace App\Policies;

use App\Models\ClassSubject;
use App\Models\User;

class ClassSubjectPolicy
{
    public function view(User $user, ClassSubject $classSubject): bool
    {
        if ($user->hasRole('admin') && $user->hasPermissionTo('classes view')) {
            return true;
        }

        if ($user->hasRole('guru')) {
            $classSubject->loadMissing('subject');

            return $classSubject->isTaughtBy($user);
        }

        if ($user->hasRole('siswa')) {
            return $user->enrolledClasses()->where('school_classes.id', $classSubject->class_id)->exists();
        }

        return false;
    }

    public function update(User $user, ClassSubject $classSubject): bool
    {
        if ($user->hasRole('admin') && $user->hasPermissionTo('classes edit')) {
            return true;
        }

        if ($user->hasRole('guru')) {
            $classSubject->loadMissing('subject');

            return $classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function delete(User $user, ClassSubject $classSubject): bool
    {
        if ($user->hasRole('admin') && $user->hasPermissionTo('classes delete')) {
            return true;
        }

        return false;
    }
}
