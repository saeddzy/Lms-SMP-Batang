import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, { formatStudentDateTime } from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Button from "@/Components/Button";
import Pagination from "@/Components/Pagination";
import { Head, usePage } from "@inertiajs/react";
import {
    IconTestPipe,
    IconCircleCheck,
    IconPercentage,
    IconSchool,
} from "@tabler/icons-react";

export default function StudentExams() {
    const { attempts, summary = {} } = usePage().props;

    const rows = attempts?.data ?? [];
    const total = attempts?.total ?? 0;

    const avgPage = useMemo(() => {
        const scored = rows.filter((a) => a.score != null);
        if (scored.length === 0) return null;
        const sum = scored.reduce((s, a) => s + Number(a.score), 0);
        return Math.round((sum / scored.length) * 10) / 10;
    }, [rows]);

    return (
        <DashboardLayout title="Ujian Saya">
            <Head title="Ujian Saya" />

            <StudentShell
                eyebrow="Penilaian"
                title="Riwayat ujian"
                subtitle="Ringkasan percobaan ujian — detail jadwal dan pengaturan ada di halaman ujian."
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StudentStatCard
                        icon={IconTestPipe}
                        label="Total percobaan"
                        value={summary.total_attempts ?? 0}
                        hint="Semua waktu"
                        accent="indigo"
                    />
                    <StudentStatCard
                        icon={IconCircleCheck}
                        label="Lulus"
                        value={summary.passed ?? 0}
                        hint="Memenuhi ambang kelulusan"
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

                {rows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                        <IconSchool
                            className="mx-auto h-12 w-12 text-slate-300"
                            stroke={1.25}
                        />
                        <p className="mt-4 text-sm font-medium text-slate-700">
                            Belum ada riwayat ujian
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Setelah Anda mengikuti ujian, hasil akan tercatat di
                            sini.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                                <thead>
                                    <tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        <th className="px-5 py-3">#</th>
                                        <th className="px-5 py-3">Ujian</th>
                                        <th className="px-5 py-3">Mapel / Kelas</th>
                                        <th className="px-5 py-3">Selesai</th>
                                        <th className="px-5 py-3">Nilai</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {rows.map((att, i) => {
                                        const ex = att.exam;
                                        const passed = att.passed;
                                        return (
                                            <tr
                                                key={att.id}
                                                className="hover:bg-indigo-50/30"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                                                    {(attempts.from ?? 0) + i}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-slate-900">
                                                        {ex?.title ?? "—"}
                                                    </p>
                                                    {ex?.description ? (
                                                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                                                            {ex.description}
                                                        </p>
                                                    ) : null}
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    <div>{ex?.subject?.name}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {ex?.school_class?.name}
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
                                                    {att.attempt_status ===
                                                    "menunggu_penilaian" ? (
                                                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                                                            Menunggu nilai esai
                                                        </span>
                                                    ) : passed === true ? (
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
                                                    {ex?.id ? (
                                                        <Button
                                                            type="view"
                                                            url={route(
                                                                "exams.show",
                                                                ex.id
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

                <p className="text-center text-xs text-slate-400">
                    Menampilkan {rows.length} dari {total} percobaan
                </p>
            </StudentShell>
        </DashboardLayout>
    );
}
