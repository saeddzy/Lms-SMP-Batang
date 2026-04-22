import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, { formatStudentDateTime } from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Button from "@/Components/Button";
import Pagination from "@/Components/Pagination";
import Search from "@/Components/Search";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    IconTestPipe,
    IconCalendar,
    IconClock,
    IconSchool,
} from "@tabler/icons-react";

export default function ExamsAvailable() {
    const { exams, filters = {} } = usePage().props;

    const rows = exams?.data ?? [];
    const total = exams?.total ?? 0;

    const getLatestAttempt = (exam) => exam.attempts?.[0] ?? null;
    const isCompletedAttempt = (attempt) =>
        Boolean(
            attempt?.finished_at ||
                ["finished", "submitted", "timeout"].includes(
                    attempt?.attempt_status
                )
        );
    const isCompletedExam = (exam) => isCompletedAttempt(getLatestAttempt(exam));
    const activeExams = rows.filter((exam) => !isCompletedExam(exam));
    const completedExams = rows.filter((exam) => isCompletedExam(exam));

    const examTypeLabel = (type) => {
        const types = {
            'mid_term': 'UTS',
            'final': 'UAS',
            'quiz': 'Kuis',
            'practice': 'Latihan',
        };
        return types[type] || type;
    };

    const formatExamDate = (value) => {
        if (!value) return "—";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const examWindow = (exam) => {
        if (!exam.scheduled_date || exam.duration_minutes == null) return "invalid";
        
        const start = new Date(exam.scheduled_date + 'T' + (exam.start_time || '00:00'));
        const end = new Date(
            start.getTime() + Number(exam.duration_minutes) * 60 * 1000
        );
        const now = new Date();
        if (now < start) return "belum";
        if (now > end) return "selesai";
        return "buka";
    };

    const studentAttemptState = (exam) => {
        const latestAttempt = exam.attempts?.[0];
        if (!latestAttempt) {
            return null;
        }

        if (
            latestAttempt.finished_at ||
            ["finished", "submitted", "timeout"].includes(
                latestAttempt.attempt_status
            )
        ) {
            return "selesai_siswa";
        }

        if (latestAttempt.attempt_status === "in_progress") {
            return "berlangsung_siswa";
        }

        return null;
    };

    const examStatus = (exam) => {
        return studentAttemptState(exam) ?? examWindow(exam);
    };

    const getStatusBadge = (exam) => {
        const status = examStatus(exam);
        const badges = {
            'belum': { color: 'blue', text: 'Belum Dimulai' },
            'buka': { color: 'green', text: 'Sedang Berlangsung' },
            'selesai': { color: 'gray', text: 'Selesai' },
            'selesai_siswa': { color: 'gray', text: 'Selesai' },
            'berlangsung_siswa': { color: 'amber', text: 'Belum Dikumpulkan' },
            'invalid': { color: 'red', text: 'Tidak Valid' },
        };
        const badge = badges[status] || badges.invalid;
        
        return (
            <span className={`inline-flex rounded-full bg-${badge.color}-50 px-2.5 py-0.5 text-xs font-semibold text-${badge.color}-900 ring-1 ring-${badge.color}-200/80`}>
                {badge.text}
            </span>
        );
    };

    return (
        <DashboardLayout title="Ujian Tersedia">
            <Head title="Ujian Tersedia" />

            <StudentShell
                eyebrow="Penilaian"
                title="Ujian Tersedia"
                subtitle="Daftar ujian yang tersedia untuk kelas Anda"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StudentStatCard
                        icon={IconTestPipe}
                        label="Total ujian"
                        value={total}
                        hint="Semua kelas"
                        accent="indigo"
                    />
                </div>

                <Search
                    url={route("student.exams")}
                    placeholder="Cari judul ujian, mapel, atau kelas..."
                    filter={{ search: filters.search ?? "" }}
                    className="mt-4"
                />

                <section className="mt-8">
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Ujian untuk Anda
                        </h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Ujian baru atau yang belum selesai dikerjakan.
                        </p>
                    </div>

                    {activeExams.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                            <IconCalendar
                                className="mx-auto h-12 w-12 text-slate-300"
                                stroke={1.25}
                            />
                            <p className="mt-4 text-sm font-medium text-slate-700">
                                Belum ada ujian aktif di kelas Anda
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Pastikan Anda sudah masuk kelas yang benar, atau
                                tunggu guru mengaktifkan ujian untuk kelas Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
                                    <thead>
                                        <tr className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <th className="px-5 py-3">Ujian</th>
                                            <th className="px-5 py-3">Mapel / Kelas</th>
                                            <th className="px-5 py-3">Jadwal</th>
                                            <th className="px-5 py-3">Durasi</th>
                                            <th className="px-5 py-3">Status</th>
                                            <th className="px-5 py-3 text-right">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {activeExams.map((exam) => {
                                            const status = examStatus(exam);
                                            const latestAttempt = exam.attempts?.[0];

                                            return (
                                            <tr
                                                key={exam.id}
                                                className="hover:bg-indigo-50/30"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-slate-900">
                                                        {exam.title}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {examTypeLabel(exam.exam_type)}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-slate-600">
                                                    <div>{exam.subject?.name}</div>
                                                    <div className="text-xs text-slate-400">
                                                        {exam.school_class?.name}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                    <div className="text-xs">
                                                        {formatExamDate(exam.scheduled_date)}
                                                    </div>
                                                    {exam.start_time && (
                                                        <div className="text-xs text-slate-400">
                                                            {formatStudentDateTime(exam.start_time)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <IconClock className="h-3 w-3" />
                                                        <span className="text-xs">
                                                            {exam.duration_minutes || exam.duration} menit
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {getStatusBadge(exam)}
                                                </td>
                                                <td className="whitespace-nowrap px-5 py-4 text-right">
                                                    {status === 'berlangsung_siswa' && latestAttempt ? (
                                                        <Link
                                                            href={route('exams.attempt.take', {
                                                                exam: exam.id,
                                                                attempt: latestAttempt.id,
                                                            })}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
                                                        >
                                                            Lanjutkan
                                                        </Link>
                                                    ) : status === 'buka' ? (
                                                        <Link
                                                            href={route('exams.show', exam.id)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                                                        >
                                                            Kerjakan
                                                        </Link>
                                                    ) : (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            disabled
                                                        >
                                                            {status === 'belum'
                                                                ? 'Belum Dimulai'
                                                                : 'Selesai'}
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                <section className="mt-8">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Riwayat ujian
                    </h2>

                    {completedExams.length === 0 ? (
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
                                        {completedExams.map((exam) => {
                                            const latestAttempt = getLatestAttempt(exam);
                                            const isPending =
                                                latestAttempt?.attempt_status === "submitted" ||
                                                latestAttempt?.attempt_status === "menunggu_penilaian";
                                            return (
                                                <tr
                                                    key={exam.id}
                                                    className="hover:bg-indigo-50/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-900">
                                                            {exam.title}
                                                        </p>
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {examTypeLabel(exam.exam_type)}
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-4 text-slate-600">
                                                        <div>{exam.subject?.name}</div>
                                                        <div className="text-xs text-slate-400">
                                                            {exam.school_class?.name}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                                                        {formatStudentDateTime(
                                                            latestAttempt?.finished_at ?? latestAttempt?.updated_at
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {isPending ? (
                                                            <span className="text-sm font-semibold text-amber-700">
                                                                Menunggu
                                                            </span>
                                                        ) : latestAttempt?.score != null ? (
                                                            <span className="text-lg font-bold tabular-nums text-slate-900">
                                                                {latestAttempt.score}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {isPending ? (
                                                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                                                                Menunggu
                                                            </span>
                                                        ) : latestAttempt?.passed === true ? (
                                                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
                                                                Lulus
                                                            </span>
                                                        ) : latestAttempt?.passed === false ? (
                                                            <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-900 ring-1 ring-rose-200/80">
                                                                Tidak Lulus
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200/80">
                                                                Selesai
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                                        {latestAttempt ? (
                                                            <Link
                                                                href={route(
                                                                    "exams.attempt.result",
                                                                    {
                                                                        exam: exam.id,
                                                                        attempt: latestAttempt.id,
                                                                    }
                                                                )}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                                                            >
                                                                Lihat hasil
                                                            </Link>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </section>

                {rows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                        <IconCalendar
                            className="mx-auto h-12 w-12 text-slate-300"
                            stroke={1.25}
                        />
                        <p className="mt-4 text-sm font-medium text-slate-700">
                            Tidak ada ujian tersedia
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Belum ada ujian yang dibuat untuk kelas Anda.
                        </p>
                    </div>
                ) : null}

                {exams?.links && (
                    <div className="border-t border-slate-200 bg-white px-6 py-3">
                        <Pagination links={exams.links} />
                    </div>
                )}
            </StudentShell>
        </DashboardLayout>
    );
}
