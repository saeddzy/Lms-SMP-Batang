<?php

namespace App\Models\Concerns;

/**
 * Penilaian otomatis untuk soal pilihan ganda, benar/salah, dan jawaban singkat.
 * Jawaban singkat: satu baris per kunci yang diterima; tidak case-sensitive;
 * spasi dibenarkan; baris diawali ~ artinya siswa harus mengandung teks setelah ~.
 */
trait MatchesStudentQuizAnswers
{
    public function isStudentAnswerCorrect(?string $studentAnswer): bool
    {
        return match ($this->question_type) {
            'multiple_choice' => $this->matchMultipleChoice($studentAnswer),
            'true_false' => $this->matchTrueFalse($studentAnswer),
            'short_answer' => $this->matchShortAnswer($studentAnswer),
            'essay' => false,
            default => false,
        };
    }

    protected function matchMultipleChoice(?string $studentAnswer): bool
    {
        if ($studentAnswer === null || $studentAnswer === '') {
            return false;
        }

        return (string) $studentAnswer === (string) $this->correct_answer;
    }

    protected function matchTrueFalse(?string $studentAnswer): bool
    {
        if ($studentAnswer === null || $studentAnswer === '') {
            return false;
        }

        $toCanonical = static function (string $value): ?string {
            $value = strtolower(trim($value));

            return match ($value) {
                'true', 't', '1', 'benar', 'b' => 'true',
                'false', 'f', '0', 'salah', 's' => 'false',
                default => null,
            };
        };

        $a = $toCanonical((string) $studentAnswer);
        $b = $toCanonical((string) $this->correct_answer);

        return $a !== null && $b !== null && $a === $b;
    }

    protected function matchShortAnswer(?string $studentAnswer): bool
    {
        if ($studentAnswer === null) {
            return false;
        }

        $norm = $this->normalizeAnswerText($studentAnswer);
        if ($norm === '') {
            return false;
        }

        $lines = preg_split('/\r\n|\r|\n/', (string) $this->correct_answer) ?: [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            if (str_starts_with($line, '~')) {
                $needle = $this->normalizeAnswerText(substr($line, 1));
                if ($needle !== '' && str_contains($norm, $needle)) {
                    return true;
                }
            } else {
                if ($this->normalizeAnswerText($line) === $norm) {
                    return true;
                }
            }
        }

        return false;
    }

    protected function normalizeAnswerText(string $value): string
    {
        $value = mb_strtolower(trim($value), 'UTF-8');
        $value = preg_replace('/\s+/u', ' ', $value) ?? '';

        return $value;
    }
}
