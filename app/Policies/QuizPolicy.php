<?php

namespace App\Policies;

use App\Models\ClassSubject;
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
            // Pembuat kuis selalu boleh melihat (data lama kadang tanpa class_subject)
            if ((int) ($quiz->created_by ?? 0) === (int) $user->id) {
                return true;
            }
            // Selaras dengan daftar kuis: guru pengampu / guru mapel / konteks forTeacher
            if ($quiz->class_subject_id) {
                return ClassSubject::query()
                    ->whereKey($quiz->class_subject_id)
                    ->forTeacher($user)
                    ->exists();
            }
            $quiz->loadMissing('classSubject', 'schoolClass');
            if ($quiz->classSubject) {
                return $quiz->classSubject->isVisibleToTeacher($user);
            }
            if ($quiz->schoolClass && (int) $quiz->schoolClass->teacher_id === (int) $user->id) {
                return true;
            }

            return false;
        }

        if ($user->hasRole('siswa') && $user->can('quizzes view')) {
            return $user->enrolledClasses()->where('school_classes.id', $quiz->class_id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        if (! $user->can('quizzes create')) {
            return false;
        }
        if ($user->hasRole('admin')) {
            return true;
        }
        if ($user->hasRole('guru')) {
            return ClassSubject::where('teacher_id', $user->id)->exists();
        }

        return false;
    }

    public function update(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('admin') && $user->can('quizzes edit')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('quizzes edit')) {
            if (! $quiz->classSubject) {
                return false;
            }

            return $quiz->classSubject->isAssignedSlotTeacher($user);
        }

        return false;
    }

    public function delete(User $user, Quiz $quiz): bool
    {
        if ($user->hasRole('admin') && $user->can('quizzes delete')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('quizzes delete')) {
            if (! $quiz->classSubject) {
                return false;
            }

            return $quiz->classSubject->isAssignedSlotTeacher($user);
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
