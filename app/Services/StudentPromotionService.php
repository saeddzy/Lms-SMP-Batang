<?php

namespace App\Services;

use App\Models\SchoolClass;
use App\Models\StudentEnrollment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StudentPromotionService
{
    /**
     * Pindahkan siswa dari kelas asal ke kelas tujuan (naik kelas).
     * Enrollment lama ditandai transferred + left_at; data tugas/nilai tetap pada siswa & kelas lama.
     *
     * @param  list<int>  $studentIds  ID user siswa; kosong jika $promoteAll true
     * @return array{promoted: int, skipped: list<string>}
     */
    public function promote(
        SchoolClass $fromClass,
        SchoolClass $toClass,
        array $studentIds,
        bool $promoteAll,
        ?User $actor = null
    ): array {
        if ($fromClass->id === $toClass->id) {
            throw ValidationException::withMessages([
                'target_class_id' => 'Kelas tujuan harus berbeda dari kelas asal.',
            ]);
        }

        if ($promoteAll) {
            $studentIds = $fromClass->enrollments()
                ->where('status', 'active')
                ->pluck('student_id')
                ->all();
        } else {
            $studentIds = array_values(array_unique(array_map('intval', $studentIds)));
        }

        if ($studentIds === []) {
            throw ValidationException::withMessages([
                'student_ids' => 'Tidak ada siswa yang dipilih atau kelas asal kosong.',
            ]);
        }

        $skipped = [];
        $promoted = 0;
        $notePrefix = $actor
            ? sprintf('Dipindahkan oleh %s. ', $actor->name)
            : '';

        DB::transaction(function () use ($fromClass, $toClass, $studentIds, &$skipped, &$promoted, $notePrefix) {
            foreach ($studentIds as $studentId) {
                $student = User::find($studentId);
                if (! $student || ! $student->hasRole('siswa')) {
                    $skipped[] = "ID {$studentId}: bukan siswa valid";

                    continue;
                }

                $old = StudentEnrollment::where('class_id', $fromClass->id)
                    ->where('student_id', $studentId)
                    ->where('status', 'active')
                    ->first();

                if (! $old) {
                    $skipped[] = "{$student->name}: tidak aktif di kelas asal";

                    continue;
                }

                $existingTarget = StudentEnrollment::where('class_id', $toClass->id)
                    ->where('student_id', $studentId)
                    ->first();

                if ($existingTarget && $existingTarget->status === 'active') {
                    $skipped[] = "{$student->name}: sudah aktif di kelas tujuan";

                    continue;
                }

                $old->update([
                    'status' => 'transferred',
                    'left_at' => now(),
                    'notes' => trim(($old->notes ? $old->notes.' | ' : '').$notePrefix.'Naik/pindah ke kelas: '.$toClass->name.' ('.$toClass->academic_year.')'),
                ]);

                if ($existingTarget) {
                    $existingTarget->update([
                        'status' => 'active',
                        'enrolled_at' => now(),
                        'left_at' => null,
                        'notes' => trim(($existingTarget->notes ? $existingTarget->notes.' | ' : '').'Kembali aktif dari '.$fromClass->name),
                    ]);
                } else {
                    StudentEnrollment::create([
                        'student_id' => $studentId,
                        'class_id' => $toClass->id,
                        'enrolled_at' => now(),
                        'status' => 'active',
                        'notes' => $notePrefix.'Masuk dari kelas '.$fromClass->name,
                    ]);
                }

                $promoted++;
            }
        });

        return ['promoted' => $promoted, 'skipped' => $skipped];
    }
}
