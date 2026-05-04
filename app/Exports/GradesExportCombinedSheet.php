<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * Satu lembar: meta (kelas, mapel, periode) di atas; identitas + detail nilai;
 * tabel pembobotan di kanan; baris kelompok untuk tugas / kuis / ujian.
 */
class GradesExportCombinedSheet implements FromArray, ShouldAutoSize, WithStyles, WithTitle
{
    /**
     * @param  array{class:string, subject:string, period:string}  $meta
     * @param  array<int, array{0:string, 1:string, 2:float|string}>  $bobotRows
     * @param  array<int, string>  $groupRow  Panjang sama seperti $headings; kosong = tanpa baris grup
     * @param  array<int, string>  $headings
     * @param  array<int, array<int, mixed>>  $rows
     */
    public function __construct(
        private readonly array $meta,
        private readonly array $bobotRows,
        private readonly array $groupRow,
        private readonly array $headings,
        private readonly array $rows,
    ) {}

    public function title(): string
    {
        return 'Rekap nilai';
    }

    /**
     * @return array<int, array<int, mixed>>
     */
    public function array(): array
    {
        $w = count($this->headings);
        $gap = [''];
        $bobotHeadings = ['Jenis', 'Judul aktivitas', 'Bobot (%)'];
        $bobotGroupTitle = ['Pembobotan per aktivitas', '', ''];
        $totalCols = $w + count($gap) + count($bobotHeadings);

        $pad = function (array $row, int $len): array {
            $c = count($row);
            if ($c === $len) {
                return $row;
            }
            if ($c > $len) {
                return array_slice($row, 0, $len);
            }

            return array_merge($row, array_fill(0, $len - $c, ''));
        };

        $out = [];

        $metaRows = [
            ['Kelas', $this->meta['class'] ?? '—'],
            ['Mata pelajaran', $this->meta['subject'] ?? '—'],
            ['Periode / tahun ajaran', ($this->meta['period'] ?? '') !== '' ? $this->meta['period'] : '—'],
        ];
        foreach ($metaRows as $mr) {
            $out[] = $pad(array_merge($mr, array_fill(0, max(0, $totalCols - 2), '')), $totalCols);
        }

        $out[] = array_fill(0, $totalCols, '');

        $hasGroup = $this->groupRow !== [];
        if ($hasGroup) {
            $out[] = $pad(array_merge($pad($this->groupRow, $w), $gap, $bobotGroupTitle), $totalCols);
        }

        $out[] = $pad(array_merge($this->headings, $gap, $bobotHeadings), $totalCols);

        $nStudents = count($this->rows);
        $nBobot = count($this->bobotRows);
        $maxData = max($nStudents, $nBobot);

        for ($i = 0; $i < $maxData; $i++) {
            $left = $this->rows[$i] ?? array_fill(0, $w, '');
            if ($nBobot > 0) {
                $right = $this->bobotRows[$i] ?? ['', '', ''];
            } elseif ($i === 0) {
                $right = ['—', 'Belum ada pembobotan untuk kombinasi kelas/mapel/periode ini', '—'];
            } else {
                $right = ['', '', ''];
            }
            $out[] = $pad(array_merge($left, $gap, $right), $totalCols);
        }

        return $out;
    }

    public function styles(Worksheet $sheet): array
    {
        $w = count($this->headings);
        $totalCols = $w + 4;
        $lastCol = Coordinate::stringFromColumnIndex($totalCols);

        $hasGroup = $this->groupRow !== [];
        $rowHeader = $hasGroup ? 6 : 5;

        $nStudents = count($this->rows);
        $nBobot = count($this->bobotRows);
        $maxData = max($nStudents, $nBobot);
        $lastRow = $rowHeader + $maxData;

        $sheet->getStyle('A1:A3')->applyFromArray([
            'font' => ['bold' => true],
            'fill' => [
                'fillType' => 'solid',
                'startColor' => ['argb' => 'FFF1F5F9'],
            ],
        ]);

        if ($hasGroup) {
            $sheet->getStyle('A5:'.$lastCol.'5')->applyFromArray([
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => 'solid',
                    'startColor' => ['argb' => 'FFE2E8F0'],
                ],
                'alignment' => [
                    'horizontal' => 'center',
                    'vertical' => 'center',
                    'wrapText' => true,
                ],
            ]);
        }

        $sheet->getStyle('A'.$rowHeader.':'.$lastCol.$rowHeader)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'],
            ],
            'fill' => [
                'fillType' => 'solid',
                'startColor' => ['argb' => 'FF1E429F'],
            ],
            'alignment' => [
                'vertical' => 'center',
                'wrapText' => true,
            ],
        ]);

        $sheet->getStyle('A'.$rowHeader.':'.$lastCol.$lastRow)->applyFromArray([
            'alignment' => ['vertical' => 'center'],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => 'thin',
                    'color' => ['argb' => 'FFE2E8F0'],
                ],
            ],
        ]);

        return [];
    }
}
