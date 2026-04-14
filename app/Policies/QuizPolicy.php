<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('quizzes index');
    }

    public function view(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('admin') && $user->can('quizzes view')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('quizzes view')) {
            if (!$quiz->classSubject) {
                return false;
            }
            $quiz->classSubject->loadMissing('subject');

            return $quiz->classSubject->isTaughtBy($user);
        }

        if ($user->hasRole('siswa') && $user->can('quizzes view')) {
            return $user->enrolledClasses()->where('school_classes.id', $quiz->class_id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('quizzes create');
    }

    public function update(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('admin') && $user->can('quizzes edit')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('quizzes edit')) {
            if (!$quiz->classSubject) {
                return false;
            }
            $quiz->classSubject->loadMissing('subject');

            return $quiz->classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function delete(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('admin') && $user->can('quizzes delete')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('quizzes delete')) {
            if (!$quiz->classSubject) {
                return false;
            }
            $quiz->classSubject->loadMissing('subject');

            return $quiz->classSubject->isTaughtBy($user);
        }

        return false;
    }

    public function restore(User $user, Quiz $quiz): bool
    {
        return $user->can('quizzes delete');
    }

    public function forceDelete(User $user, Quiz $quiz): bool
    {
        return $user->can('quizzes delete');
    }
}
