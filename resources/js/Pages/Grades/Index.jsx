import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import { Head, Link, router, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

function buildExportHref(filters, selectedClassId, selectedSubjectId) {
    const params = new URLSearchParams();
    const merged = {
        ...filters,
        class_id: selectedClassId || filters?.class_id || "",
        subject_id:
            selectedSubjectId !== undefined && selectedSubjectId !== null
                ? selectedSubjectId
                : filters?.subject_id ?? "",
    };
    Object.entries(merged).forEach(([k, v]) => {
        if (v !== null && v !== undefined && String(v) !== "") {
            params.set(k, String(v));
        }
    });
    const qs = params.toString();
    const base = route("grades.export.excel", {}, false);
    return qs ? `${base}?${qs}` : base;
}

function badgeClass(score) {
    if (score >= 90) return "bg-emerald-50 text-emerald-800 ring-emerald-200/80";
    if (score >= 80) return "bg-sky-50 text-sky-800 ring-sky-200/80";
    if (score >= 70) return "bg-amber-50 text-amber-900 ring-amber-200/80";
    if (score >= 60) return "bg-orange-50 text-orange-800 ring-orange-200/80";
    return "bg-rose-50 text-rose-800 ring-rose-200/80";
}

export default function Index() {
    const {
        classBoard = [],
        classes = [],
        subjectsForClass = [],
        filters = {},
        selectedClassId,
        selectedSubjectId,
        auth = {},
    } = usePage().props;
    const canInputGrades = auth.canInputGrades ?? false;
    const activeSort = filters.sort ?? "score_desc";
    const activePerformance = filters.performance ?? "";
    const activeScoreRange = filters.score_range ?? "";
    const baseFilter = {
        ...filters,
        class_id: selectedClassId ?? filters.class_id ?? "",
        subject_id: selectedSubjectId ?? filters.subject_id ?? "",
        search: filters.search ?? "",
    };

    const applyFilter = (next) => {
        router.get(
            route("grades.index"),
            {
                ...baseFilter,
                ...next,
            },
            {
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const summary = useMemo(() => {
        if (classBoard.length === 0) {
            return { avg: 0, top: 0, low: 0 };
        }
        const values = classBoard.map((x) => Number(x.overall_avg ?? 0));
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return {
            avg: Math.round(avg * 10) / 10,
            top: Math.max(...values),
            low: Math.min(...values),
        };
    }, [classBoard]);

    return (
        <DashboardLayout title="Manajemen Nilai">
            <Head title="Manajemen Nilai" />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900">
                                    Manajemen Nilai per Kelas
                                </h1>
                                <p className="text-sm text-slate-600">
                                    Daftar siswa dalam kelas dengan rekap nilai tugas, kuis,
                                    ujian, dan rata-rata.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={buildExportHref(
                                        filters,
                                        selectedClassId,
                                        selectedSubjectId
                                    )}
                                    className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
                                >
                                    Download CSV (Excel)
                                </a>
                                {canInputGrades && hasAnyPermission(["grades calculate"]) && (
                                    <Button type="add" url={route("grades.create")} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-6">
                        <Search
                            url={route("grades.index")}
                            placeholder="Cari nama siswa di kelas ini..."
                            filter={baseFilter}
                        />

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <select
                                value={activeSort}
                                onChange={(e) => applyFilter({ sort: e.target.value })}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="score_desc">Nilai tertinggi ke terendah</option>
                                <option value="score_asc">Nilai terendah ke tertinggi</option>
                                <option value="name_asc">Nama A-Z</option>
                                <option value="name_desc">Nama Z-A</option>
                            </select>
                            <select
                                value={activePerformance}
                                onChange={(e) => applyFilter({ performance: e.target.value })}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua performa</option>
                                <option value="passed">Tuntas (>=75)</option>
                                <option value="not_passed">Belum tuntas (&lt;75)</option>
                            </select>
                        </div>


                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={route("grades.index", {
                                    ...filters,
                                    class_id: "",
                                    subject_id: "",
                                })}
                                className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
                                    !selectedClassId
                                        ? "bg-[#163d8f] text-white ring-[#163d8f]"
                                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                }`}
                            >
                                Semua kelas
                            </Link>
                            {classes.map((cls) => (
                                <Link
                                    key={cls.id}
                                    href={route("grades.index", {
                                        ...filters,
                                        class_id: cls.id,
                                        subject_id: "",
                                    })}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
                                        String(selectedClassId) === String(cls.id)
                                            ? "bg-[#163d8f] text-white ring-[#163d8f]"
                                            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    {cls.name}
                                </Link>
                            ))}
                        </div>

                        {selectedClassId && subjectsForClass.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Mata pelajaran
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href={route("grades.index", {
                                            ...filters,
                                            class_id: selectedClassId,
                                            subject_id: "",
                                            search: filters.search ?? "",
                                        })}
                                        className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
                                            selectedSubjectId == null ||
                                            selectedSubjectId === ""
                                                ? "bg-[#163d8f] text-white ring-[#163d8f]"
                                                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        Semua mapel
                                    </Link>
                                    {subjectsForClass.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={route("grades.index", {
                                                ...filters,
                                                class_id: selectedClassId,
                                                subject_id: sub.id,
                                                search: filters.search ?? "",
                                            })}
                                            className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
                                                String(selectedSubjectId) ===
                                                String(sub.id)
                                                    ? "bg-[#163d8f] text-white ring-[#163d8f]"
                                                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                            }`}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jumlah siswa</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{classBoard.length}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rata-rata kelas</p>
                        <p className="mt-1 text-2xl font-semibold text-[#163d8f]">{summary.avg}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nilai tertinggi / terendah</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                            {summary.top}% / {summary.low}%
                        </p>
                    </div>
                </div>

                {classBoard.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {classBoard.map((row) => (
                            <article
                                key={row.student_id}
                                className="rounded-lg border border-slate-200 bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            {row.student_name}
                                        </h2>
                                        <p className="text-xs text-slate-500">{row.student_email}</p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${badgeClass(
                                            Number(row.overall_avg ?? 0)
                                        )}`}
                                    >
                                        {row.overall_avg}%
                                    </span>
                                </div>

                                <dl className="mt-4 space-y-2 text-sm text-slate-700">
                                    <div className="flex justify-between gap-2">
                                        <dt>Tugas</dt>
                                        <dd className="font-medium text-slate-900">{row.task_avg}%</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Kuis</dt>
                                        <dd className="font-medium text-slate-900">{row.quiz_avg}%</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Ujian</dt>
                                        <dd className="font-medium text-slate-900">{row.exam_avg}%</dd>
                                    </div>
                                    <div className="flex justify-between gap-2 border-t border-slate-100 pt-2">
                                        <dt className="font-semibold">Rata-rata</dt>
                                        <dd className="font-bold text-slate-900">{row.overall_avg}%</dd>
                                    </div>
                                </dl>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
                        {!selectedClassId
                            ? "Pilih salah satu kelas di atas untuk melihat daftar siswa dan rekap nilai tugas, kuis, dan ujian."
                            : "Tidak ada siswa di kelas ini (atau tidak cocok dengan pencarian), atau belum ada nilai yang tercatat."}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
