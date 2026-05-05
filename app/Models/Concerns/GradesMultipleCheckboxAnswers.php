<?php

namespace App\Models\Concerns;

trait GradesMultipleCheckboxAnswers
{
    /**
     * @return list<array{text: string, is_correct: bool}>
     */
    public function multipleCheckboxOptions(): array
    {
        if ($this->question_type !== 'multiple_checkbox' || ! is_array($this->options)) {
            return [];
        }

        if (($this->options['type'] ?? '') !== 'multiple_checkbox') {
            return [];
        }

        $rows = $this->options['options'] ?? [];
        if (! is_array($rows)) {
            return [];
        }

        $out = [];
        foreach ($rows as $row) {
            if (! is_array($row)) {
                continue;
            }
            $text = trim((string) ($row['text'] ?? ''));
            if ($text === '') {
                continue;
            }
            $out[] = [
                'text' => $text,
                'is_correct' => (bool) ($row['is_correct'] ?? false),
            ];
        }

        return $out;
    }

    /**
     * @return array{points_awarded: float, all_correct: bool, score_raw: int, selected_count: int, correct_count: int}|null
     */
    public function gradeMultipleCheckboxResponse(?string $studentJson): ?array
    {
        $options = $this->multipleCheckboxOptions();
        if (count($options) < 2) {
            return null;
        }

        $normalizedCorrect = [];
        foreach ($options as $opt) {
            if (! $opt['is_correct']) {
                continue;
            }
            $normalizedCorrect[$this->normalizeMultipleCheckboxText($opt['text'])] = true;
        }

        $selected = $this->parseMultipleCheckboxSelection($studentJson);
        $selectedSet = [];
        foreach ($selected as $item) {
            $selectedSet[$item] = true;
        }

        $truePositive = 0;
        $falsePositive = 0;
        foreach (array_keys($selectedSet) as $item) {
            if (isset($normalizedCorrect[$item])) {
                $truePositive++;
            } else {
                $falsePositive++;
            }
        }

        $scoreRaw = $truePositive - $falsePositive;
        $correctCount = count($normalizedCorrect);
        $fraction = $correctCount > 0 ? max(0.0, min(1.0, $scoreRaw / $correctCount)) : 0.0;
        $pointsAwarded = round(((float) $this->points) * $fraction, 2);

        $allCorrect = $correctCount > 0
            && count($selectedSet) === $correctCount
            && $falsePositive === 0
            && $truePositive === $correctCount;

        return [
            'points_awarded' => $pointsAwarded,
            'all_correct' => $allCorrect,
            'score_raw' => $scoreRaw,
            'selected_count' => count($selectedSet),
            'correct_count' => $correctCount,
        ];
    }

    public function multipleCheckboxIsFullyCorrect(?string $studentJson): bool
    {
        $graded = $this->gradeMultipleCheckboxResponse($studentJson);

        return $graded !== null && $graded['all_correct'];
    }

    /**
     * @return list<string>
     */
    protected function parseMultipleCheckboxSelection(?string $studentJson): array
    {
        $decoded = json_decode((string) ($studentJson ?? ''), true);
        $rawList = [];

        if (is_array($decoded) && array_is_list($decoded)) {
            $rawList = $decoded;
        } elseif (is_array($decoded) && is_array($decoded['answers'] ?? null)) {
            $rawList = $decoded['answers'];
        } else {
            return [];
        }

        $out = [];
        $seen = [];
        foreach ($rawList as $val) {
            $norm = $this->normalizeMultipleCheckboxText((string) $val);
            if ($norm === '' || isset($seen[$norm])) {
                continue;
            }
            $seen[$norm] = true;
            $out[] = $norm;
        }

        return $out;
    }

    protected function normalizeMultipleCheckboxText(string $value): string
    {
        $value = mb_strtolower(trim($value), 'UTF-8');
        $value = preg_replace('/\s+/u', ' ', $value) ?? '';

        return $value;
    }
}
