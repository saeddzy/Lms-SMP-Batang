<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GradesRecapExport implements FromArray, WithHeadings, WithStyles, ShouldAutoSize
{
    /**
     * @param array<int, array<int, string|int|float|null>> $rows
     */
    public function __construct(private readonly array $rows)
    {
    }

    /**
     * @return array<int, string>
     */
    public function headings(): array
    {
        return [
            'Nama Siswa',
            'NIS',
            'Kelas',
            'Nilai Tugas',
            'Nilai Kuis',
            'Nilai Ujian',
            'Nilai Akhir',
        ];
    }

    /**
     * @return array<int, array<int, string|int|float|null>>
     */
    public function array(): array
    {
        return $this->rows;
    }

    public function styles(Worksheet $sheet): array
    {
        $lastRow = count($this->rows) + 1; // +1 for heading row

        $sheet->getStyle('A1:G1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFFFF'],
            ],
            'fill' => [
                'fillType' => 'solid',
                'startColor' => ['argb' => 'FF1E429F'],
            ],
        ]);

        $sheet->getStyle("A1:G{$lastRow}")->applyFromArray([
            'alignment' => [
                'vertical' => 'center',
            ],
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
