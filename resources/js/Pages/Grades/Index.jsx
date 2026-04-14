import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import { Head, Link, usePage } from "@inertiajs/react";
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
    } = usePage().props;

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
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">
                            Manajemen Nilai per Kelas
                        </h1>
                        <p className="text-sm text-stone-600">
                            Daftar siswa dalam kelas dengan rekap nilai tugas,
                            kuis, ujian, dan rata-rata.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a
                            href={buildExportHref(
                                filters,
                                selectedClassId,
                                selectedSubjectId
                            )}
                            className="inline-flex items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
                        >
                            Download CSV (Excel)
                        </a>
                        {hasAnyPermission(["grades create"]) && (
                            <Button type="add" url={route("grades.create")} />
                        )}
                    </div>
                </div>

                <Search
                    url={route("grades.index")}
                    placeholder="Cari nama siswa di kelas ini..."
                    filter={{
                        ...filters,
                        class_id: selectedClassId ?? filters.class_id ?? "",
                        subject_id: selectedSubjectId ?? filters.subject_id ?? "",
                        search: filters.search ?? "",
                    }}
                />

                <div className="flex flex-wrap gap-2">
                    <Link
                        href={route("grades.index", {
                            ...filters,
                            class_id: "",
                            subject_id: "",
                        })}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
                            !selectedClassId
                                ? "bg-stone-900 text-white ring-stone-900"
                                : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"
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
                                    ? "bg-stone-900 text-white ring-stone-900"
                                    : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"
                            }`}
                        >
                            {cls.name}
                        </Link>
                    ))}
                </div>

                {selectedClassId && subjectsForClass.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
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
                                        ? "bg-indigo-900 text-white ring-indigo-900"
                                        : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"
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
                                            ? "bg-indigo-900 text-white ring-indigo-900"
                                            : "bg-white text-stone-700 ring-stone-200 hover:bg-stone-50"
                                    }`}
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-stone-500">Jumlah siswa</p>
                        <p className="mt-1 text-2xl font-bold text-stone-900">{classBoard.length}</p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-stone-500">Rata-rata kelas</p>
                        <p className="mt-1 text-2xl font-bold text-indigo-700">{summary.avg}%</p>
                    </div>
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-stone-500">Nilai tertinggi / terendah</p>
                        <p className="mt-1 text-lg font-bold text-stone-900">
                            {summary.top}% / {summary.low}%
                        </p>
                    </div>
                </div>

                {classBoard.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {classBoard.map((row) => (
                            <article
                                key={row.student_id}
                                className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h2 className="text-base font-semibold text-stone-900">
                                            {row.student_name}
                                        </h2>
                                        <p className="text-xs text-stone-500">{row.student_email}</p>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${badgeClass(
                                            Number(row.overall_avg ?? 0)
                                        )}`}
                                    >
                                        {row.overall_avg}%
                                    </span>
                                </div>

                                <dl className="mt-4 space-y-2 text-sm text-stone-700">
                                    <div className="flex justify-between gap-2">
                                        <dt>Tugas</dt>
                                        <dd className="font-medium text-stone-900">{row.task_avg}%</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Kuis</dt>
                                        <dd className="font-medium text-stone-900">{row.quiz_avg}%</dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Ujian</dt>
                                        <dd className="font-medium text-stone-900">{row.exam_avg}%</dd>
                                    </div>
                                    <div className="flex justify-between gap-2 border-t border-stone-100 pt-2">
                                        <dt className="font-semibold">Rata-rata</dt>
                                        <dd className="font-bold text-stone-900">{row.overall_avg}%</dd>
                                    </div>
                                </dl>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-10 text-center text-sm text-stone-500">
                        Tidak ada data siswa / nilai untuk kelas terpilih.
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
