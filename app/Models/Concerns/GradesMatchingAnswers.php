<?php

namespace App\Models\Concerns;

trait GradesMatchingAnswers
{
    /**
     * @return list<array{id: int, left: array{type: string, value: string}, right: array{type: string, value: string}}>
     */
    public function matchingPairs(): array
    {
        if ($this->question_type !== 'matching' || ! is_array($this->options)) {
            return [];
        }

        if (($this->options['type'] ?? '') !== 'matching') {
            return [];
        }

        $raw = $this->options['pairs'] ?? [];
        if (! is_array($raw)) {
            return [];
        }

        $out = [];
        foreach ($raw as $idx => $row) {
            $pair = $this->normalizeMatchingPair($row, $idx + 1);
            if ($pair === null) {
                continue;
            }
            $out[] = $pair;
        }

        return $out;
    }

    /**
     * @return array{points_awarded: float, correct_count: int, pair_count: int, all_correct: bool}|null
     */
    public function gradeMatchingResponse(?string $studentJson): ?array
    {
        $pairs = $this->matchingPairs();
        $n = count($pairs);
        if ($n === 0) {
            return null;
        }

        $decoded = json_decode($studentJson ?? '', true);
        if (! is_array($decoded)) {
            return [
                'points_awarded' => 0.0,
                'correct_count' => 0,
                'pair_count' => $n,
                'all_correct' => false,
            ];
        }

        $expectedRights = [];
        $studentByLeft = [];
        foreach ($pairs as $p) {
            $expectedRights[] = $this->normalizeMatchingItemValue($p['right']['value']);
        }

        foreach ($this->normalizeStudentMatchingRows($decoded) as $row) {
            if (! is_array($row)) {
                continue;
            }
            $leftKey = (string) ($row['left_key'] ?? '');
            $answer = (string) ($row['answer'] ?? '');
            if ($leftKey === '' || $answer === '') {
                continue;
            }
            $studentByLeft[$leftKey] = $this->normalizeMatchingItemValue($answer);
        }

        $canonicalLeftKeys = [];
        foreach ($pairs as $p) {
            $canonicalLeftKeys[$this->matchingLeftKeyFromPair($p)] = true;
        }

        $hasAllLefts = count($studentByLeft) === $n && count($canonicalLeftKeys) === $n;
        foreach (array_keys($canonicalLeftKeys) as $lk) {
            if (! isset($studentByLeft[$lk])) {
                $hasAllLefts = false;
                break;
            }
        }

        $studentRightsNorm = array_values($studentByLeft);
        sort($studentRightsNorm);
        $expectedRightsNorm = $expectedRights;
        sort($expectedRightsNorm);
        $multisetOk = $hasAllLefts && $studentRightsNorm === $expectedRightsNorm;

        $correct = 0;
        if ($multisetOk) {
            foreach ($pairs as $p) {
                $key = $this->matchingLeftKeyFromPair($p);
                $given = $studentByLeft[$key] ?? '';
                $expected = $this->normalizeMatchingItemValue($p['right']['value']);
                if ($given === $expected) {
                    $correct++;
                }
            }
        }

        $maxPoints = (float) $this->points;
        $pointsAwarded = $n > 0 ? round($maxPoints * ($correct / $n), 2) : 0.0;

        return [
            'points_awarded' => $pointsAwarded,
            'correct_count' => $correct,
            'pair_count' => $n,
            'all_correct' => $correct === $n && $multisetOk,
        ];
    }

    public function matchingIsFullyCorrect(?string $studentJson): bool
    {
        $r = $this->gradeMatchingResponse($studentJson);

        return $r !== null && $r['all_correct'];
    }

    /**
     * @param  mixed  $row
     * @return array{id: int, left: array{type: string, value: string}, right: array{type: string, value: string}}|null
     */
    protected function normalizeMatchingPair($row, int $fallbackId): ?array
    {
        if (! is_array($row)) {
            return null;
        }

        $left = $this->normalizeMatchingItem($row['left'] ?? null);
        $right = $this->normalizeMatchingItem($row['right'] ?? null);

        if ($left === null || $right === null) {
            // Backward compatibility: left/right string lama.
            $legacyLeft = isset($row['left']) ? trim((string) $row['left']) : '';
            $legacyRight = isset($row['right']) ? trim((string) $row['right']) : '';
            if ($legacyLeft === '' || $legacyRight === '') {
                return null;
            }
            $left = ['type' => 'text', 'value' => $legacyLeft];
            $right = ['type' => 'text', 'value' => $legacyRight];
        }

        $id = isset($row['id']) ? (int) $row['id'] : $fallbackId;
        if ($id <= 0) {
            $id = $fallbackId;
        }

        return [
            'id' => $id,
            'left' => $left,
            'right' => $right,
        ];
    }

    /**
     * @param  mixed  $item
     * @return array{type: string, value: string}|null
     */
    protected function normalizeMatchingItem($item): ?array
    {
        if (! is_array($item)) {
            return null;
        }
        $type = (string) ($item['type'] ?? 'text');
        $value = trim((string) ($item['value'] ?? ''));
        if ($value === '') {
            return null;
        }
        if (! in_array($type, ['text', 'image'], true)) {
            $type = 'text';
        }

        return ['type' => $type, 'value' => $value];
    }

    /**
     * @param  mixed  $decoded
     * @return list<array{left_key: string, answer: string}>
     */
    protected function normalizeStudentMatchingRows($decoded): array
    {
        if (! is_array($decoded)) {
            return [];
        }
        $rows = [];
        foreach ($decoded as $row) {
            if (! is_array($row)) {
                continue;
            }
            $answer = trim((string) ($row['answer'] ?? ''));
            if ($answer === '') {
                continue;
            }
            if (isset($row['left_id']) && (int) $row['left_id'] > 0) {
                $rows[] = [
                    'left_key' => 'id:'.(int) $row['left_id'],
                    'answer' => $answer,
                ];
                continue;
            }
            $legacyLeft = trim((string) ($row['left'] ?? ''));
            if ($legacyLeft !== '') {
                $rows[] = [
                    'left_key' => 'txt:'.$this->normalizeMatchingItemValue($legacyLeft),
                    'answer' => $answer,
                ];
            }
        }

        return $rows;
    }

    /**
     * @param  array{id: int, left: array{type: string, value: string}, right: array{type: string, value: string}}  $pair
     */
    protected function matchingLeftKeyFromPair(array $pair): string
    {
        if (($pair['id'] ?? 0) > 0) {
            return 'id:'.$pair['id'];
        }

        return 'txt:'.$this->normalizeMatchingItemValue($pair['left']['value'] ?? '');
    }

    protected function normalizeMatchingItemValue(string $value): string
    {
        $value = mb_strtolower(trim($value), 'UTF-8');
        $value = preg_replace('/\s+/u', ' ', $value) ?? '';

        return $value;
    }
}
