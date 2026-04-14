<?php

namespace App\Observers;

use App\Models\ClassSubject;

class ClassSubjectObserver
{
    /**
     * Handle the ClassSubject "creating" event.
     */
    public function creating(ClassSubject $classSubject): void
    {
        // If teacher_id is not set, inherit from subject
        if (!$classSubject->teacher_id && $classSubject->subject_id) {
            $subject = $classSubject->subject;
            if ($subject && $subject->teacher_id) {
                $classSubject->teacher_id = $subject->teacher_id;
            }
        }
    }

    /**
     * Handle the ClassSubject "updating" event.
     */
    public function updating(ClassSubject $classSubject): void
    {
        // If subject_id changed, update teacher_id from new subject if teacher_id is null
        if ($classSubject->isDirty('subject_id') && !$classSubject->teacher_id) {
            $subject = $classSubject->subject;
            if ($subject && $subject->teacher_id) {
                $classSubject->teacher_id = $subject->teacher_id;
            }
        }
    }
}
