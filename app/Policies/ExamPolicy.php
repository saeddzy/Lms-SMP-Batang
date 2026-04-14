<?php

namespace App\Policies;

use App\Models\Exam;
use App\Models\User;

class ExamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('exams index');
    }

    public function view(User $user, Exam $exam): bool
    {
        if ($user->hasRole('admin') && $user->can('exams view')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('exams view')) {
            if (!$exam->classSubject) {
                return false;
            }
            $exam->classSubject->loadMissing('subject');

            return $exam->classSubject->isTaughtBy($user);
        }

        if ($user->hasRole('siswa') && $user->can('exams view')) {
            return $user->enrolledClasses()->where('school_classes.id', $exam->class_id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('exams create');
    }

    public function update(User $user, Exam $exam): bool
    {
        if ($user->hasRole('admin') && $user->can('exams edit')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('exams edit')) {
            if (!$exam->classSubject) {
                return false;
            }
            $exam->classSubject->loadMissing('subject');

            return $exam->classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function delete(User $user, Exam $exam): bool
    {
        if ($user->hasRole('admin') && $user->can('exams delete')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('exams delete')) {
            if (!$exam->classSubject) {
                return false;
            }
            $exam->classSubject->loadMissing('subject');

            return $exam->classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function restore(User $user, Exam $exam): bool
    {
        return $user->can('exams delete');
    }

    public function forceDelete(User $user, Exam $exam): bool
    {
        return $user->can('exams delete');
    }
}
