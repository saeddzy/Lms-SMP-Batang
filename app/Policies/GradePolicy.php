<?php

namespace App\Policies;

use App\Models\FinalGrade;
use App\Models\User;

class GradePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('grades index');
    }

    public function view(User $user, FinalGrade $grade): bool
    {
        if ($user->hasRole('admin') && $user->can('grades view_all')) {
            return true;
        }

        if ($user->hasRole('siswa') && $user->can('grades view_personal')) {
            return (int) $grade->student_id === (int) $user->id;
        }

        if ($user->hasRole('guru') && $user->can('grades view_all')) {
            return $this->teacherTeachesGradeContext($user, $grade);
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->can('grades calculate');
    }

    public function update(User $user, FinalGrade $grade): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('grades calculate')) {
            return $this->teacherTeachesGradeContext($user, $grade);
        }

        return false;
    }

    public function delete(User $user, FinalGrade $grade): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('guru') && $user->can('grades calculate')) {
            return $this->teacherTeachesGradeContext($user, $grade);
        }

        return false;
    }

    /**
     * Guru dapat mengelola nilai untuk kelas/map yang menjadi tanggung jawabnya.
     */
    private function teacherTeachesGradeContext(User $user, FinalGrade $grade): bool
    {
        $class = $grade->schoolClass;
        if (!$class) {
            return false;
        }

        if ((int) $class->teacher_id === (int) $user->id) {
            return true;
        }

        return $class->classSubjects()
            ->where('subject_id', $grade->subject_id)
            ->forTeacher($user)
            ->exists();
    }

    public function restore(User $user, FinalGrade $grade): bool
    {
        return false;
    }

    public function forceDelete(User $user, FinalGrade $grade): bool
    {
        return false;
    }
}
