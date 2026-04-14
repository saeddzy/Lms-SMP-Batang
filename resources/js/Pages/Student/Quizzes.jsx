import React, { useMemo } from "react";
import clsx from "clsx";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, {
    formatStudentDateTime,
} from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Button from "@/Components/Button";
import Pagination from "@/Components/Pagination";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconBrain,
    IconCircleCheck,
    IconClock,
    IconPercentage,
    IconTrophy,
} from "@tabler/icons-react";

function windowBadge(q) {
    switch (q.window) {
        case "buka":
            return { label: "Jadwal dibuka", tone: "open" };
        case "belum_mulai":
            return { label: "Belum waktu mulai", tone: "soon" };
        case "berakhir":
            return { label: "Sudah berakhir", tone: "ended" };
        case "jadwal_tidak_lengkap":
            return { label: "Jadwal belum lengkap", tone: "warn" };
        default:
            return { label: "—", tone: "neutral" };
    }
}

const badgeToneClass = {
    open: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
    soon: "bg-sky-50 text-sky-900 ring-sky-200/80",
    ended: "bg-slate-100 text-slate-700 ring-slate-200/80",
    warn: "bg-amber-50 text-amber-950 ring-amber-200/80",
    neutral: "bg-slate-50 text-slate-700 ring-slate-200/80",
};

export default function StudentQuizzes() {
    const {
        attempts,
        summary = {},
        availableQuizzes = [],
    } = usePage().props;

    const rows = attempts?.data ?? [];
    const total = attempts?.total ?? 0;

    const avgPage = useMemo(() => {
        const scored = rows.filter((a) => a.score != null);
        if (scored.length === 0) return null;
        const sum = scored.reduce((s, a) => s + Number(a.score), 0);
        return Math.round((sum / scored.length) * 10) / 10;
    }, [rows]);

    return (
        <DashboardLayout title="Kuis Saya">
            <Head title="Kuis Saya" />

            <StudentShell
                eyebrow="Penilaian"
                title="Kuis & riwayat"
                subtitle="Daftar kuis di kelas Anda, lalu riwayat percobaan setelah Anda mengerjakan."
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StudentStatCard
                        icon={IconBrain}
                        label="Total percobaan"
                        value={summary.total_attempts ?? 0}
                        hint="Semua waktu"
                        accent="indigo"
                    />
                    <StudentStatCard
                        icon={IconCircleCheck}
                        label="Lulus"
                        value={summary.passed ?? 0}
                        hint="Percobaan memenuhi kelulusan"
                        accent="emerald"
                    />
                    <StudentStatCard
                        icon={IconPercentage}
                        label="Rata-rata nilai"
                        value={`${summary.avg_score ?? 0}%`}
                        hint={
                            avgPage != null
                                ? `Rata halaman ini: ${avgPage}%`
                                : "Agregat keseluruhan"
                        }
                        accent="amber"
                    />
                </div>

                <section className="mt-8">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900">
                                Kuis untuk Anda
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Kuis muncul di sini bila{" "}
                                <strong>aktif</strong> dan Anda terdaftar di
                                kelas terkait. Tombol kerjakan mengikuti{" "}
                                <strong>jadwal buka–tutup</strong> yang ditetapkan
                                guru.
                            </p>
                        </div>
                        <Link
                            href={route("quizzes.index")}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Lihat tampilan daftar kuis →
                        </Link>
                    </div>

                    {availableQuizzes.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                            <IconClock
                                className="mx-auto h-11 w-11 text-slate-300"
                                stroke={1.25}
                            />
                            <p className="mt-3 text-sm font-medium text-slate-700">
                                Belum ada kuis aktif di kelas Anda
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Pastikan Anda sudah masuk kelas yang benar, atau
                                tunggu guru mengaktifkan kuis untuk kelas Anda.
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-4 sm:grid-cols-2">
                            {availableQuizzes.map((q) => {
                                const b = windowBadge(q);
                                return (
                                    <li
                                        key={q.id}
                                        className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <p className="min-w-0 font-semibold text-slate-900">
                                                {q.title}
                                            </p>
                                            <span
                                                className={clsx(
                                                    "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                                                    badgeToneClass[b.tone] ??
                                                        badgeToneClass.neutral
                                                )}
                                            >
                                                {b.label}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {q.subject} · {q.class}
                                        </p>
                                        {q.description ? (
                                            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                                {q.description}
                                            </p>
                                        ) : null}
                                        <dl className="mt-3 space-y-1 text-xs text-slate-600">
                                            <div className="flex justify-between gap-2">
                                                <dt>Mulai</dt>
                                                <dd className="text-right font-medium text-slate-800">
                                                    {q.start_time
                                                        ? formatStudentDateTime(
                                                              q.start_time
                                                          )
                                                        : "—"}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <dt>Selesai</dt>
                                                <dd className="text-right font-medium text-slate-800">
                                                    {q.end_time
                                                        ? formatStudentDateTime(
                                                              q.end_time
                                                          )
                                                        : "—"}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <dt>Soal</dt>
                                                <dd className="font-medium text-slate-800">
                                                    {q.questions_count ?? 0}{" "}
                                                    soal
                                                </dd>
                                            </div>
                                        </dl>
                                        {!q.has_questions &&
                                        q.window === "buka" ? (
                                            <p className="mt-3 text-xs text-amber-800">
                                                Guru belum menambahkan soal —
                                                tombol kerjakan akan aktif
                                                setelah soal tersedia.
                                            </p>
                                        ) : null}
                                        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                                            <Button
                                                type="view"
                                                url={route(
                                                    "quizzes.show",
                                                    q.id
                                                )}
                                                text={
                                                    q.can_try
                                                        ? q.unfinished_attempt_id
                                                            ? "Lanjutkan"
                                                            : "Kerjakan"
                                                        : "Detail"
                                                }
                                            />
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className="mt-12">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Riwayat percobaan
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        Muncul setelah Anda menyelesaikan atau mengumpulkan
                        percobaan kuis.
                    </p>

                    {rows.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                            <IconTrophy
                                className="mx-auto h-12 w-12 text-slate-300"
                                stroke={1.25}
                            />
                            <p className="mt-4 text-sm font-medium text-slate-700">
                                Belum ada riwayat percobaan
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Riwayat akan terisi setelah Anda mengerjakan kuis
                                di bagian atas.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <th className="px-5 py-3">#</th>
                                            <th className="px-5 py-3">Kuis</th>
                                            <th className="px-5 py-3">
                                                Mapel / Kelas
                                            </th>
                                            <th className="px-5 py-3">
                                                Selesai
                                            </th>
                                            <th className="px-5 py-3">Nilai</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rows.map((att, i) => {
                                            const q = att.quiz;
                                            const passed = att.passed;
                                            return (
                                                <tr
                                                    key={att.id}
                                                    className="hover:bg-indigo-50/30"
                                                >
                                                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                                        {(attempts.from ?? 0) +
                                                            i}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-900">
                                                            {q?.title ?? "—"}
                                                        </p>
                                                        {q?.description ? (
                                                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                                                {q.description}
                                                            </p>
                                                        ) : null}
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">
                                                        <div>
                                                            {q?.subject?.name}
                                                        </div>
                                                        <div className="text-xs text-slate-400">
                                                            {
                                                                q?.school_class
                                                                    ?.name
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                        {formatStudentDateTime(
                                                            att.finished_at ??
                                                                att.updated_at
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {att.score != null ? (
                                                            <span className="text-lg font-bold tabular-nums text-slate-900">
                                                                {att.score}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {passed === true ? (
                                                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80">
                                                                Lulus
                                                            </span>
                                                        ) : passed === false ? (
                                                            <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800 ring-1 ring-rose-200/80">
                                                                Belum lulus
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        {q?.id ? (
                                                            <Button
                                                                type="view"
                                                                url={route(
                                                                    "quizzes.show",
                                                                    q.id
                                                                )}
                                                                text="Detail"
                                                            />
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {attempts.last_page > 1 && (
                                <div className="border-t border-slate-100 px-4 py-4">
                                    <Pagination
                                        links={attempts.links}
                                        currentPage={attempts.current_page}
                                        lastPage={attempts.last_page}
                                        from={attempts.from}
                                        to={attempts.to}
                                        total={attempts.total}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <p className="mt-4 text-center text-xs text-slate-400">
                        Menampilkan {rows.length} dari {total} percobaan
                    </p>
                </section>
            </StudentShell>
        </DashboardLayout>
    );
}
