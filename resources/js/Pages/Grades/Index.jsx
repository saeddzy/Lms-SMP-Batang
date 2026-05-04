import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Search from "@/Components/Search";
import { Head, Link, router, usePage } from "@inertiajs/react";

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

/** Membagi 100% ke n bagian; jumlah tepat 100 (hindari 99% karena pembulatan). */
function splitHundred(n) {
    if (n <= 0) return [];
    const arr = [];
    let remaining = 100;
    for (let i = 0; i < n - 1; i++) {
        const share = n - i;
        const part = Math.floor((remaining / share) * 100) / 100;
        arr.push(part);
        remaining -= part;
    }
    arr.push(Math.round(remaining * 100) / 100);
    return arr;
}

/** Tampilan angka bobot tanpa nol depan aneh (24 bukan 024). */
function weightToInputString(w) {
    const n = Number(w);
    if (!Number.isFinite(n)) return "";
    const r = Math.round(Math.min(100, Math.max(0, n)) * 100) / 100;
    if (r === 0) return "0";
    return Number.isInteger(r) ? String(r) : String(r);
}

/**
 * @param {import("@inertiajs/react").usePage<{
 *   gradingMeta: {
 *     tasks: { id: number; title: string }[];
 *     quizzes: { id: number; title: string }[];
 *     exams: { id: number; title: string }[];
 *     weights: { activity_type: string; activity_id: number; weight: number }[];
 *   } | null;
 * }>["props"]["gradingMeta"]} meta
 */
function buildWeightLines(meta) {
    if (!meta) return [];
    const saved = {};
    (meta.weights || []).forEach((w) => {
        saved[`${w.activity_type}:${w.activity_id}`] = w.weight;
    });
    const ordered = [];
    meta.tasks.forEach((t) =>
        ordered.push({
            activity_type: "task",
            activity_id: t.id,
            label: t.title,
            section: "Tugas",
        })
    );
    meta.quizzes.forEach((q) =>
        ordered.push({
            activity_type: "quiz",
            activity_id: q.id,
            label: q.title,
            section: "Kuis",
        })
    );
    meta.exams.forEach((e) =>
        ordered.push({
            activity_type: "exam",
            activity_id: e.id,
            label: e.title,
            section: "Ujian",
        })
    );
    const eq = splitHundred(ordered.length);
    return ordered.map((row, i) => ({
        ...row,
        weight:
            saved[`${row.activity_type}:${row.activity_id}`] !== undefined
                ? saved[`${row.activity_type}:${row.activity_id}`]
                : eq[i],
    }));
}

export default function Index() {
    const {
        classBoard = [],
        classes = [],
        subjectsForClass = [],
        filters = {},
        selectedClassId,
        selectedSubjectId,
        gradingMeta = null,
        flash,
        errors: pageErrors = {},
    } = usePage().props;

    const [isExporting, setIsExporting] = useState(false);
    const [expanded, setExpanded] = useState({});
    const [weightLines, setWeightLines] = useState([]);
    /** Teks input bobot (sinkron dengan weightLines; di-normalisasi di blur). */
    const [weightInputs, setWeightInputs] = useState([]);
    const [savingWeights, setSavingWeights] = useState(false);

    useEffect(() => {
        const lines = buildWeightLines(gradingMeta);
        setWeightLines(lines);
        setWeightInputs(lines.map((l) => weightToInputString(l.weight)));
    }, [gradingMeta]);

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

    const handleExportExcel = () => {
        setIsExporting(true);
        const exportUrl = buildExportHref(
            filters,
            selectedClassId,
            selectedSubjectId
        );
        window.location.href = exportUrl;
        setTimeout(() => setIsExporting(false), 4000);
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

    const weightSum = useMemo(() => {
        let s = 0;
        weightLines.forEach((line, idx) => {
            const raw = weightInputs[idx];
            let n = parseFloat(String(raw ?? "").replace(",", "."));
            if (Number.isNaN(n)) {
                n = Number(line.weight ?? 0);
            }
            if (String(raw ?? "").trim() === "") {
                n = 0;
            }
            s += Math.min(100, Math.max(0, n));
        });
        return Math.round(s * 100) / 100;
    }, [weightLines, weightInputs]);

    const activityCount =
        gradingMeta != null
            ? gradingMeta.tasks.length +
              gradingMeta.quizzes.length +
              gradingMeta.exams.length
            : 0;

    const flushWeightsForSubmit = () =>
        weightLines.map((line, idx) => {
            const raw = weightInputs[idx];
            let n = parseFloat(String(raw ?? "").replace(",", "."));
            if (Number.isNaN(n)) {
                n = Number(line.weight);
            }
            if (String(raw ?? "").trim() === "") {
                n = 0;
            }
            const clamped =
                Math.round(Math.min(100, Math.max(0, n)) * 100) / 100;
            return {
                activity_type: line.activity_type,
                activity_id: line.activity_id,
                weight: clamped,
            };
        });

    const saveWeights = (e) => {
        e.preventDefault();
        setSavingWeights(true);
        router.post(
            route("grades.activity-weights"),
            {
                class_id: selectedClassId,
                subject_id: selectedSubjectId,
                academic_year: filters.period ?? "",
                weights: flushWeightsForSubmit(),
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingWeights(false),
            }
        );
    };

    const updateWeightInput = (idx, raw) => {
        let cleaned = raw.replace(",", ".").replace(/[^\d.]/g, "");
        const dot = cleaned.indexOf(".");
        if (dot !== -1) {
            cleaned =
                cleaned.slice(0, dot + 1) +
                cleaned.slice(dot + 1).replace(/\./g, "");
        }
        setWeightInputs((prev) => {
            const next = [...prev];
            next[idx] = cleaned;
            return next;
        });
    };

    const commitWeightInput = (idx) => {
        const raw = weightInputs[idx];
        let n = parseFloat(String(raw ?? "").replace(",", "."));
        if (Number.isNaN(n) || String(raw ?? "").trim() === "") {
            n = 0;
        }
        const clamped =
            Math.round(Math.min(100, Math.max(0, n)) * 100) / 100;
        setWeightLines((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], weight: clamped };
            return next;
        });
        setWeightInputs((prev) => {
            const next = [...prev];
            next[idx] = weightToInputString(clamped);
            return next;
        });
    };

    const toggleExpand = (studentId) => {
        setExpanded((prev) => ({
            ...prev,
            [studentId]: !prev[studentId],
        }));
    };

    return (
        <DashboardLayout title="Manajemen Nilai">
            <Head title="Manajemen Nilai" />

            <div className="space-y-6">
                {flash?.success && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                        {flash.success}
                    </div>
                )}

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900">
                                    Manajemen Nilai per Kelas
                                </h1>
                                <p className="text-sm text-slate-600">
                                    Rekap tugas, kuis (nilai tertinggi per kuis),
                                    ujian. Pilih kelas dan mapel untuk mengatur
                                    bobot setiap aktivitas (total 100%).
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleExportExcel}
                                    disabled={isExporting}
                                    className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isExporting
                                        ? "Mengekspor..."
                                        : "Export ke Excel"}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-6">
                        <Search
                            url={route("grades.index")}
                            placeholder="Cari nama siswa di kelas ini..."
                            filter={baseFilter}
                        />

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <select
                                value={activeSort}
                                onChange={(e) =>
                                    applyFilter({ sort: e.target.value })
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="score_desc">
                                    Nilai tertinggi ke terendah
                                </option>
                                <option value="score_asc">
                                    Nilai terendah ke tertinggi
                                </option>
                                <option value="name_asc">Nama A-Z</option>
                                <option value="name_desc">Nama Z-A</option>
                            </select>
                            <select
                                value={activePerformance}
                                onChange={(e) =>
                                    applyFilter({ performance: e.target.value })
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua performa</option>
                                <option value="passed">
                                    {'Tuntas (≥ 75)'}
                                </option>
                                <option value="not_passed">
                                    {'Belum tuntas (< 75)'}
                                </option>
                            </select>
                            <input
                                type="text"
                                value={filters.period ?? ""}
                                onChange={(e) =>
                                    applyFilter({ period: e.target.value })
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                                placeholder="Tahun ajaran / periode (bobot per periode)"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {classes.map((cls) => (
                                <Link
                                    key={cls.id}
                                    href={route("grades.index", {
                                        ...filters,
                                        class_id: cls.id,
                                        subject_id: "",
                                    })}
                                    className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 ${
                                        String(selectedClassId) ===
                                        String(cls.id)
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

                {selectedClassId && selectedSubjectId && gradingMeta && (
                    <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-5">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-900">
                                    Pembobotan nilai (kelas + mapel ini)
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Bagi total <strong>100%</strong> ke setiap
                                    tugas, kuis, dan ujian. Nilai akhir = Σ
                                    (bobot × nilai %) ÷ 100. Tanpa nilai dianggap
                                    0. Kuis & ujian memakai{" "}
                                    <strong>skor percobaan tertinggi</strong>.
                                </p>
                            </div>
                            <div className="text-right text-sm">
                                <span
                                    className={
                                        Math.abs(weightSum - 100) < 0.02
                                            ? "font-semibold text-emerald-700"
                                            : "font-semibold text-amber-800"
                                    }
                                >
                                    Total: {weightSum}%
                                </span>
                                {gradingMeta.weights_ready && (
                                    <p className="text-xs text-emerald-700">
                                        Bobot tersimpan · nilai akhir terbobot
                                    </p>
                                )}
                            </div>
                        </div>

                        {activityCount === 0 ? (
                            <p className="mt-4 text-sm text-slate-600">
                                Belum ada tugas, kuis, atau ujian di kelas +
                                mapel ini.
                            </p>
                        ) : (
                            <form onSubmit={saveWeights} className="mt-4">
                                <div className="space-y-4">
                                    {["Tugas", "Kuis", "Ujian"].map((sec) => {
                                        const lines = weightLines
                                            .map((line, idx) => ({
                                                line,
                                                idx,
                                            }))
                                            .filter(
                                                ({ line }) =>
                                                    line.section === sec
                                            );
                                        if (lines.length === 0) return null;
                                        return (
                                            <div key={sec}>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    {sec}
                                                </p>
                                                <ul className="mt-2 space-y-2">
                                                    {lines.map(
                                                        ({ line, idx }) => (
                                                            <li
                                                                key={`${line.activity_type}-${line.activity_id}`}
                                                                className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                                                            >
                                                                <span className="min-w-0 flex-1 text-sm text-slate-800">
                                                                    {line.label}
                                                                </span>
                                                                <label className="flex shrink-0 items-center gap-2 text-sm text-slate-600">
                                                                    <span className="whitespace-nowrap">
                                                                        Bobot %
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        inputMode="decimal"
                                                                        autoComplete="off"
                                                                        spellCheck={
                                                                            false
                                                                        }
                                                                        aria-label={`Bobot untuk ${line.label}`}
                                                                        value={
                                                                            weightInputs[
                                                                                idx
                                                                            ] ??
                                                                            ""
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            updateWeightInput(
                                                                                idx,
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        onBlur={() =>
                                                                            commitWeightInput(
                                                                                idx
                                                                            )
                                                                        }
                                                                        className="w-20 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-right text-base font-medium tabular-nums text-slate-900 shadow-inner focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                                                                    />
                                                                </label>
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>

                                {pageErrors?.weights && (
                                    <p className="mt-3 text-sm text-rose-600">
                                        {pageErrors.weights}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        type="submit"
                                        disabled={
                                            savingWeights ||
                                            Math.abs(weightSum - 100) >= 0.02
                                        }
                                        className="inline-flex items-center rounded-md bg-[#163d8f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#0f2e6f] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {savingWeights
                                            ? "Menyimpan..."
                                            : "Simpan bobot"}
                                    </button>
                                    {Math.abs(weightSum - 100) >= 0.02 && (
                                        <span className="self-center text-xs text-amber-800">
                                            Total harus tepat 100% agar bisa
                                            disimpan.
                                        </span>
                                    )}
                                </div>
                            </form>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Jumlah siswa
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">
                            {classBoard.length}
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Rata-rata kelas
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-[#163d8f]">
                            {summary.avg}%
                        </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Nilai tertinggi / terendah
                        </p>
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
                                        <p className="text-xs text-slate-500">
                                            {row.student_email}
                                        </p>
                                        {row.uses_weighted_formula && (
                                            <p className="mt-1 text-xs font-medium text-indigo-700">
                                                Nilai akhir terbobot
                                            </p>
                                        )}
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
                                        <dt>Rerata tugas</dt>
                                        <dd className="font-medium text-slate-900">
                                            {row.task_avg}%
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Rerata kuis</dt>
                                        <dd className="font-medium text-slate-900">
                                            {row.quiz_avg}%
                                            <span className="ml-1 text-xs font-normal text-slate-500">
                                                (tertinggi/kuis)
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Rerata ujian</dt>
                                        <dd className="font-medium text-slate-900">
                                            {row.exam_avg}%
                                            <span className="ml-1 text-xs font-normal text-slate-500">
                                                (tertinggi/ujian)
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2 border-t border-slate-100 pt-2">
                                        <dt className="font-semibold">
                                            Nilai akhir
                                        </dt>
                                        <dd className="font-bold text-slate-900">
                                            {row.overall_avg}%
                                        </dd>
                                    </div>
                                </dl>

                                {row.detail && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                toggleExpand(row.student_id)
                                            }
                                            className="mt-4 text-sm font-medium text-[#163d8f] hover:underline"
                                        >
                                            {expanded[row.student_id]
                                                ? "Sembunyikan rincian"
                                                : "Lihat rincian per aktivitas"}
                                        </button>

                                        {expanded[row.student_id] && (
                                            <div className="mt-3 space-y-3 border-t border-slate-100 pt-3 text-sm">
                                                {[
                                                    [
                                                        "Tugas",
                                                        row.detail.tasks,
                                                    ],
                                                    [
                                                        "Kuis",
                                                        row.detail.quizzes,
                                                    ],
                                                    [
                                                        "Ujian",
                                                        row.detail.exams,
                                                    ],
                                                ].map(([label, items]) =>
                                                    items?.length ? (
                                                        <div key={label}>
                                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                                {label}
                                                            </p>
                                                            <ul className="mt-1 space-y-1">
                                                                {items.map(
                                                                    (it) => (
                                                                        <li
                                                                            key={`${it.type}-${it.id}`}
                                                                            className="flex justify-between gap-2 text-slate-700"
                                                                        >
                                                                            <span className="min-w-0 truncate">
                                                                                {
                                                                                    it.title
                                                                                }
                                                                            </span>
                                                                            <span className="shrink-0 font-medium">
                                                                                {it.score !=
                                                                                null
                                                                                    ? `${it.score}%`
                                                                                    : "—"}
                                                                                {it.weight !=
                                                                                    null &&
                                                                                    it.contribution !=
                                                                                        null && (
                                                                                        <span className="ml-2 text-xs font-normal text-slate-500">
                                                                                            (±
                                                                                            {it.contribution.toFixed(
                                                                                                1
                                                                                            )}{" "}
                                                                                            poin)
                                                                                        </span>
                                                                                    )}
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    ) : null
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
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
