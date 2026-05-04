import React, { useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { formatStudentDateTime } from "@/Components/Student/StudentShell";
import {
    IconArrowLeft,
    IconBrandYoutube,
    IconChevronDown,
    IconPaperclip,
    IconSearch,
} from "@tabler/icons-react";

function SubmissionGradePanel({ task, submission }) {
    const max = Number(task.max_score ?? 100);
    const { data, setData, post, processing, errors } = useForm({
        score: submission.score != null ? String(submission.score) : "",
        feedback: submission.feedback ?? "",
    });

    const submit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        post(
            route("tasks.grade-submission", {
                task: task.id,
                submission: submission.id,
            }),
            { preserveScroll: true }
        );
    };

    const fileDownloadUrl =
        submission.file_path &&
        submission.id &&
        route("tasks.submission.file", {
            task: task.id,
            submission: submission.id,
        });

    return (
        <div className="space-y-4 text-sm">
            {submission.content ? (
                <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Jawaban teks
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-slate-800">
                        {submission.content}
                    </p>
                </div>
            ) : null}
            {fileDownloadUrl ? (
                <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                        Lampiran berkas
                    </p>
                    <a
                        href={fileDownloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#163d8f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2e6f] active:scale-[0.99]"
                    >
                        <IconPaperclip className="h-4 w-4" stroke={1.75} />
                        Buka & unduh lampiran
                    </a>
                    {submission.file_name ? (
                        <p className="mt-1.5 text-xs text-slate-500">
                            {submission.file_name}
                        </p>
                    ) : null}
                </div>
            ) : null}
            {submission.youtube_url ? (
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                    <p className="text-xs font-semibold uppercase text-rose-800">
                        Tautan video YouTube
                    </p>
                    <a
                        href={submission.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
                    >
                        <IconBrandYoutube className="h-5 w-5" stroke={1.5} />
                        Buka video siswa
                    </a>
                    <p className="mt-2 break-all text-xs text-rose-900/80">
                        {submission.youtube_url}
                    </p>
                </div>
            ) : null}

            <form
                onSubmit={submit}
                className="space-y-4 border-t border-slate-200 pt-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Nilai (maks. {max})
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={max}
                            step="0.01"
                            value={data.score}
                            onChange={(e) =>
                                setData("score", e.target.value)
                            }
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                        />
                        {errors.score ? (
                            <p className="mt-1 text-sm text-rose-600">
                                {errors.score}
                            </p>
                        ) : null}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Feedback (opsional)
                    </label>
                    <textarea
                        rows={3}
                        value={data.feedback}
                        onChange={(e) =>
                            setData("feedback", e.target.value)
                        }
                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                    />
                    {errors.feedback ? (
                        <p className="mt-1 text-sm text-rose-600">
                            {errors.feedback}
                        </p>
                    ) : null}
                </div>
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex rounded-md bg-[#163d8f] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f2e6f] disabled:opacity-50"
                >
                    {processing ? "Menyimpan…" : "Simpan penilaian"}
                </button>
            </form>
        </div>
    );
}

export default function GradeTask() {
    const { task, submissions = [] } = usePage().props;
    const sc = task.school_class ?? task.schoolClass;

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const submitted = useMemo(
        () => submissions.filter((s) => s.submitted_at),
        [submissions]
    );

    const stats = useMemo(() => {
        const total = submitted.length;
        const graded = submitted.filter((s) => s.score != null).length;
        const pending = total - graded;
        const pct =
            total > 0 ? Math.round((graded / total) * 100) : 0;
        return { total, graded, pending, pct };
    }, [submitted]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return submitted.filter((s) => {
            const name = (s.student?.name ?? "").toLowerCase();
            if (q && !name.includes(q)) return false;
            if (filter === "pending") return s.score == null;
            if (filter === "graded") return s.score != null;
            return true;
        });
    }, [submitted, search, filter]);

    const filterBtn =
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors";

    return (
        <DashboardLayout title={`Penilaian: ${task.title}`}>
            <Head title={`Penilaian: ${task.title}`} />

            <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href={route("tasks.show", task.id)}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        <IconArrowLeft className="h-4 w-4" stroke={1.5} />
                        Kembali ke detail tugas
                    </Link>
                </div>

                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Penilaian tugas
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                            {task.title}
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            {sc?.name ?? "—"} · {task.subject?.name ?? "—"}
                        </p>
                    </div>
                </div>

                {submitted.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center text-slate-600">
                        Belum ada pengumpulan yang dikirim untuk tugas ini.
                    </div>
                ) : (
                    <>
                        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">
                                        Ringkasan penilaian
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {stats.graded} dari {stats.total}{" "}
                                        pengumpulan sudah ada nilai
                                        {stats.total > 0 && (
                                            <span className="text-slate-500">
                                                {" "}
                                                ({stats.pct}%)
                                            </span>
                                        )}
                                    </p>
                                    <div className="mt-3 h-2 max-w-md overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className="h-full rounded-full bg-emerald-500 transition-all"
                                            style={{
                                                width: `${stats.pct}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-slate-500">
                                        Belum dinilai:{" "}
                                        <strong>{stats.pending}</strong> siswa
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                                <div className="relative min-w-[200px] flex-1 sm:max-w-sm">
                                    <IconSearch
                                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                        stroke={1.5}
                                    />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Cari nama siswa…"
                                        className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className={`${filterBtn} ${
                                            filter === "all"
                                                ? "bg-[#163d8f] text-white"
                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                        onClick={() => setFilter("all")}
                                    >
                                        Semua ({submitted.length})
                                    </button>
                                    <button
                                        type="button"
                                        className={`${filterBtn} ${
                                            filter === "pending"
                                                ? "bg-amber-600 text-white"
                                                : "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80 hover:bg-amber-100"
                                        }`}
                                        onClick={() =>
                                            setFilter("pending")
                                        }
                                    >
                                        Belum dinilai ({stats.pending})
                                    </button>
                                    <button
                                        type="button"
                                        className={`${filterBtn} ${
                                            filter === "graded"
                                                ? "bg-emerald-600 text-white"
                                                : "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80 hover:bg-emerald-100"
                                        }`}
                                        onClick={() => setFilter("graded")}
                                    >
                                        Sudah dinilai ({stats.graded})
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[min(70vh,1200px)] space-y-2 overflow-y-auto pr-1">
                            {filtered.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-600">
                                    Tidak ada siswa yang cocok dengan pencarian
                                    / filter ini.
                                </div>
                            ) : (
                                filtered.map((submission) => (
                                    <details
                                        key={`${submission.id}-${submission.updated_at ?? ""}`}
                                        className="group rounded-lg border border-slate-200 bg-white open:border-[#b8c9ec] open:ring-1 open:ring-[#d9e5f8]"
                                    >
                                        <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 group-open:bg-[#dfe9fb] group-open:text-[#163d8f]">
                                                <IconChevronDown
                                                    className="h-5 w-5 transition-transform group-open:rotate-180"
                                                    stroke={1.5}
                                                />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-slate-900">
                                                    {submission.student
                                                        ?.name ?? "Siswa"}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Dikumpulkan:{" "}
                                                    {submission.submitted_at
                                                        ? formatStudentDateTime(
                                                              submission.submitted_at
                                                          )
                                                        : "—"}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                                {submission.score !=
                                                null ? (
                                                    <>
                                                        <span className="tabular-nums text-lg font-bold text-slate-900">
                                                            {submission.score}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            /
                                                            {Number(
                                                                task.max_score ??
                                                                    100
                                                            )}
                                                        </span>
                                                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900 ring-1 ring-emerald-200/80">
                                                            Selesai
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
                                                        Belum nilai
                                                    </span>
                                                )}
                                            </div>
                                        </summary>
                                        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-4">
                                            <SubmissionGradePanel
                                                task={task}
                                                submission={submission}
                                            />
                                        </div>
                                    </details>
                                ))
                            )}
                        </div>

                        <p className="text-center text-xs text-slate-500">
                            Tip: klik baris untuk membuka jawaban dan form
                            penilaian. Gunakan pencarian & filter jika banyak
                            siswa.
                        </p>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
