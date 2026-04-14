import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Table from "@/Components/Table";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, usePage } from "@inertiajs/react";
import {
    IconChartBar,
    IconTrophy,
    IconAlertTriangle,
    IconPercentage,
} from "@tabler/icons-react";

export default function StudentGrades() {
    const { grades, filters, stats } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");

    const getGradeColor = (score) => {
        if (score >= 90) return "bg-emerald-100 text-emerald-800 ring-emerald-200/80";
        if (score >= 80) return "bg-sky-100 text-sky-800 ring-sky-200/80";
        if (score >= 70) return "bg-amber-100 text-amber-900 ring-amber-200/80";
        if (score >= 60) return "bg-orange-100 text-orange-900 ring-orange-200/80";
        return "bg-rose-100 text-rose-900 ring-rose-200/80";
    };

    const getGradeLetter = (score) => {
        if (score >= 90) return "A";
        if (score >= 80) return "B";
        if (score >= 70) return "C";
        if (score >= 60) return "D";
        return "E";
    };

    const getAssessmentTypeLabel = (type) => {
        switch (type) {
            case "task":
                return "Tugas";
            case "quiz":
                return "Kuis";
            case "exam":
                return "Ujian";
            default:
                return type || "—";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "draft":
                return "bg-slate-100 text-slate-700 ring-slate-200/80";
            case "published":
                return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
            case "archived":
                return "bg-amber-50 text-amber-900 ring-amber-200/80";
            default:
                return "bg-slate-100 text-slate-700 ring-slate-200/80";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "draft":
                return "Draft";
            case "published":
                return "Dipublikasikan";
            case "archived":
                return "Diarsipkan";
            default:
                return status;
        }
    };

    const rows = grades.data ?? [];
    const pageA = rows.filter((g) => g.score >= 90).length;
    const pageLow = rows.filter((g) => g.score < 70).length;

    return (
        <DashboardLayout title="Nilai Saya">
            <Head title="Nilai Saya" />

            <StudentShell
                eyebrow="Akademik"
                title="Nilai & rapor ringkas"
                subtitle="Data di bawah ini bersumber dari nilai akhir yang dipublikasikan untuk Anda."
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StudentStatCard
                        icon={IconChartBar}
                        label="Rata-rata"
                        value={`${stats?.averageGrade ?? 0}%`}
                        hint={`Predikat ${getGradeLetter(stats?.averageGrade ?? 0)}`}
                        accent="indigo"
                    />
                    <StudentStatCard
                        icon={IconPercentage}
                        label="Total entri"
                        value={stats?.totalGrades ?? grades.total ?? 0}
                        hint="Catatan penilaian"
                        accent="cyan"
                    />
                    <StudentStatCard
                        icon={IconTrophy}
                        label="Tertinggi"
                        value={`${stats?.highestGrade ?? 0}%`}
                        hint="Nilai puncak Anda"
                        accent="emerald"
                    />
                    <StudentStatCard
                        icon={IconAlertTriangle}
                        label="Terendah"
                        value={`${stats?.lowestGrade ?? 0}%`}
                        hint="Untuk referensi perbaikan"
                        accent="amber"
                    />
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6">
                    <Search
                        value={search}
                        onChange={(value) => setSearch(value)}
                        placeholder="Cari mapel, komponen, atau catatan…"
                        routeName="student.grades"
                        filters={filters}
                    />
                </div>

                <Table.Card title={`Riwayat nilai (${grades.total})`}>
                    <Table>
                        <Table.Thead>
                            <tr>
                                <Table.Th>#</Table.Th>
                                <Table.Th>Mata Pelajaran</Table.Th>
                                <Table.Th>Kelas</Table.Th>
                                <Table.Th>Tipe</Table.Th>
                                <Table.Th>Nama penilaian</Table.Th>
                                <Table.Th>Nilai</Table.Th>
                                <Table.Th>Grade</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Tanggal</Table.Th>
                                <Table.Th>Feedback</Table.Th>
                            </tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.length > 0 ? (
                                rows.map((grade, i) => (
                                    <tr key={grade.id}>
                                        <Table.Td>{grades.from + i}</Table.Td>
                                        <Table.Td>
                                            <div className="font-semibold text-slate-900">
                                                {grade.subject?.name || "—"}
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            {grade.class?.name || "—"}
                                        </Table.Td>
                                        <Table.Td>
                                            <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800 ring-1 ring-indigo-200/80">
                                                {getAssessmentTypeLabel(
                                                    grade.assessment_type
                                                )}
                                            </span>
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="max-w-xs">
                                                <div className="font-medium text-slate-900">
                                                    {grade.assessment?.title ||
                                                        "—"}
                                                </div>
                                                {grade.assessment
                                                    ?.description ? (
                                                    <div className="line-clamp-2 text-xs text-slate-500">
                                                        {
                                                            grade.assessment
                                                                .description
                                                        }
                                                    </div>
                                                ) : null}
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <span className="text-lg font-bold tabular-nums text-slate-900">
                                                {grade.score}%
                                            </span>
                                        </Table.Td>
                                        <Table.Td>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm font-bold ring-1 ${getGradeColor(grade.score)}`}
                                            >
                                                {getGradeLetter(grade.score)}
                                            </span>
                                        </Table.Td>
                                        <Table.Td>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getStatusColor(grade.status)}`}
                                            >
                                                {getStatusLabel(grade.status)}
                                            </span>
                                        </Table.Td>
                                        <Table.Td className="whitespace-nowrap text-sm text-slate-600">
                                            {new Date(
                                                grade.created_at
                                            ).toLocaleDateString("id-ID")}
                                        </Table.Td>
                                        <Table.Td>
                                            {grade.feedback ? (
                                                <div
                                                    className="max-w-xs truncate text-sm text-slate-700"
                                                    title={grade.feedback}
                                                >
                                                    {grade.feedback}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400">
                                                    —
                                                </span>
                                            )}
                                        </Table.Td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <Table.Td
                                        colSpan={10}
                                        className="py-12 text-center text-slate-500"
                                    >
                                        Belum ada nilai yang dipublikasikan.
                                    </Table.Td>
                                </tr>
                            )}
                        </Table.Tbody>
                    </Table>

                    {grades.last_page > 1 && (
                        <div className="border-t border-slate-100 px-6 py-4">
                            <Pagination
                                links={grades.links}
                                currentPage={grades.current_page}
                                lastPage={grades.last_page}
                                from={grades.from}
                                to={grades.to}
                                total={grades.total}
                            />
                        </div>
                    )}
                </Table.Card>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Snapshot halaman ini
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Hanya mencakup baris pada halaman tabel saat ini.
                        </p>
                        <div className="mt-4 flex gap-6">
                            <div>
                                <p className="text-2xl font-bold text-emerald-600">
                                    {pageA}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Nilai A (≥90)
                                </p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-600">
                                    {pageLow}
                                </p>
                                <p className="text-xs text-slate-500">
                                    Perlu peningkatan (&lt;70)
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Distribusi grade (halaman ini)
                        </h3>
                        <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
                            {[
                                {
                                    label: "A",
                                    range: "90–100",
                                    n: rows.filter((g) => g.score >= 90).length,
                                    bg: "bg-emerald-50 text-emerald-900",
                                },
                                {
                                    label: "B",
                                    range: "80–89",
                                    n: rows.filter(
                                        (g) => g.score >= 80 && g.score < 90
                                    ).length,
                                    bg: "bg-sky-50 text-sky-900",
                                },
                                {
                                    label: "C",
                                    range: "70–79",
                                    n: rows.filter(
                                        (g) => g.score >= 70 && g.score < 80
                                    ).length,
                                    bg: "bg-amber-50 text-amber-900",
                                },
                                {
                                    label: "D",
                                    range: "60–69",
                                    n: rows.filter(
                                        (g) => g.score >= 60 && g.score < 70
                                    ).length,
                                    bg: "bg-orange-50 text-orange-900",
                                },
                                {
                                    label: "E",
                                    range: "&lt;60",
                                    n: rows.filter((g) => g.score < 60).length,
                                    bg: "bg-rose-50 text-rose-900",
                                },
                            ].map((cell) => (
                                <div
                                    key={cell.label}
                                    className={`rounded-xl px-2 py-3 font-medium ${cell.bg}`}
                                >
                                    <div className="text-lg font-bold tabular-nums">
                                        {cell.n}
                                    </div>
                                    <div className="mt-1 opacity-80">
                                        {cell.label}
                                    </div>
                                    <div className="text-[10px] opacity-70">
                                        {cell.range}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </StudentShell>
        </DashboardLayout>
    );
}
