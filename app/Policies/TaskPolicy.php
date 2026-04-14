<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\User;

class TaskPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('tasks index');
    }

    public function view(User $user, Task $task): bool
    {
        if ($user->hasRole('admin') && $user->can('tasks view')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('tasks view')) {
            if (!$task->classSubject) {
                return false;
            }
            $task->classSubject->loadMissing('subject');

            return $task->classSubject->isTaughtBy($user);
        }

        if ($user->hasRole('siswa') && $user->can('tasks view')) {
            return $user->enrolledClasses()->where('school_classes.id', $task->class_id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('tasks create');
    }

    public function update(User $user, Task $task): bool
    {
        if ($user->hasRole('admin') && $user->can('tasks edit')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('tasks edit')) {
            if (!$task->classSubject) {
                return false;
            }
            $task->classSubject->loadMissing('subject');

            return $task->classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function delete(User $user, Task $task): bool
    {
        if ($user->hasRole('admin') && $user->can('tasks delete')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('tasks delete')) {
            if (!$task->classSubject) {
                return false;
            }
            $task->classSubject->loadMissing('subject');

            return $task->classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function restore(User $user, Task $task): bool
    {
        return $user->can('tasks delete');
    }

    public function forceDelete(User $user, Task $task): bool
    {
        return $user->can('tasks delete');
    }
}
