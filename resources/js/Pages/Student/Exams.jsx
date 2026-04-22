import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, { formatStudentDateTime } from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Button from "@/Components/Button";
import Pagination from "@/Components/Pagination";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconTestPipe,
    IconCircleCheck,
    IconPercentage,
    IconSchool,
    IconCalendar,
    IconClock,
} from "@tabler/icons-react";

export default function StudentExams() {
    const { attempts, summary = {}, availableExams = [] } = usePage().props;

    const rows = attempts?.data ?? [];
    const total = attempts?.total ?? 0;

    const examTypeLabel = (type) => {
        const types = {
            'mid_term': 'UTS',
            'final': 'UAS',
            'quiz': 'Kuis',
            'practice': 'Latihan',
        };
        return types[type] || type;
    };

    const examWindow = (exam) => {
        // Gunakan duration_minutes atau duration sebagai fallback
        const duration = exam.duration_minutes != null ? exam.duration_minutes : exam.duration;
        
        // Jika tidak ada duration, return invalid
        if (!duration || duration === 0) {
            return "invalid";
        }
        
        // Jika tidak ada start_time atau end_time, return invalid
        if (!exam.start_time || !exam.end_time) {
            return "invalid";
        }
        
        // Parse start_time dan end_time yang sudah digabung di backend
        // Handle timezone conversion from UTC to local
        const startDateTime = new Date(exam.start_time);
        const endDateTime = new Date(exam.end_time);
        
        // Validasi datetime
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
            return "invalid";
        }
        
        // Get current time
        const now = new Date();
        
        // Debug logging
        console.log('Exam Status Debug:', {
            examId: exam.id,
            examTitle: exam.title,
            startTime: exam.start_time,
            endTime: exam.end_time,
            startDateTime: startDateTime.toString(),
            endDateTime: endDateTime.toString(),
            now: now.toString(),
            nowLessThanStart: now < startDateTime,
            nowGreaterThanEnd: now > endDateTime
        });
        
        if (now < startDateTime) return "belum";
        if (now > endDateTime) return "selesai";
        return "buka";
    };

    const getStatusBadge = (exam) => {
        const status = examWindow(exam);
        const badges = {
            'belum': { color: 'blue', text: 'Belum Dimulai' },
            'buka': { color: 'green', text: 'Sedang Berlangsung' },
            'selesai': { color: 'gray', text: 'Selesai' },
            'invalid': { color: 'red', text: 'Tidak Valid' },
        };
        const badge = badges[status] || badges.invalid;
        
        return (
            <span className={`inline-flex rounded-full bg-${badge.color}-50 px-2.5 py-0.5 text-xs font-semibold text-${badge.color}-900 ring-1 ring-${badge.color}-200/80`}>
                {badge.text}
            </span>
        );
    };

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
                title="Ujian & riwayat"
                subtitle="Daftar ujian di kelas Anda, lalu riwayat percobaan setelah Anda mengerjakan."
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
                                Ujian untuk Anda
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Ujian muncul di sini bila{" "}
                                <strong>aktif</strong> dan Anda terdaftar di
                                kelas terkait. Tombol kerjakan mengikuti{" "}
                                <strong>jadwal buka–tutup</strong> yang ditetapkan
                                guru.
                            </p>
                        </div>
                        <Link
                            href={route("exams.index")}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Lihat daftar ujian →
                        </Link>
                    </div>

                    {availableExams.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                            <IconCalendar
                                className="mx-auto h-11 w-11 text-slate-300"
                                stroke={1.25}
                            />
                            <p className="mt-3 text-sm font-medium text-slate-700">
                                Belum ada ujian aktif di kelas Anda
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Pastikan Anda sudah masuk kelas yang benar, atau
                                tunggu guru mengaktifkan ujian untuk kelas Anda.
                            </p>
                        </div>
                    ) : (
                        <ul className="grid gap-4 sm:grid-cols-2">
                            {availableExams.map((exam) => {
                                const status = examWindow(exam);
                                const badges = {
                                    'belum': { color: 'blue', text: 'Belum Dimulai' },
                                    'buka': { color: 'green', text: 'Sedang Berlangsung' },
                                    'selesai': { color: 'gray', text: 'Selesai' },
                                    'invalid': { color: 'red', text: 'Tidak Valid' },
                                };
                                const badge = badges[status] || badges.invalid;
                                
                                return (
                                    <li
                                        key={exam.id}
                                        className="flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <p className="min-w-0 font-semibold text-slate-900">
                                                {exam.title}
                                            </p>
                                            <span
                                                className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${
                                                    badge.color === 'green' ? 'bg-emerald-50 text-emerald-900 ring-emerald-200/80' :
                                                    badge.color === 'blue' ? 'bg-sky-50 text-sky-900 ring-sky-200/80' :
                                                    badge.color === 'gray' ? 'bg-slate-100 text-slate-700 ring-slate-200/80' :
                                                    'bg-slate-50 text-slate-700 ring-slate-200/80'
                                                }`}
                                            >
                                                {badge.text}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {exam.subject?.name} · {exam.school_class?.name}
                                        </p>
                                        {exam.description ? (
                                            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                                {exam.description}
                                            </p>
                                        ) : null}
                                        <dl className="mt-3 space-y-1 text-xs text-slate-600">
                                            <div className="flex justify-between gap-2">
                                                <dt>Mulai</dt>
                                                <dd className="text-right font-medium text-slate-800">
                                                    {exam.start_time
                                                        ? formatStudentDateTime(exam.start_time)
                                                        : formatStudentDateTime(exam.scheduled_date)}
                                                </dd>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <dt>Durasi</dt>
                                                <dd className="font-medium text-slate-800">
                                                    {exam.duration_minutes || exam.duration} menit
                                                </dd>
                                            </div>
                                            <div className="flex justify-between gap-2">
                                                <dt>Soal</dt>
                                                <dd className="font-medium text-slate-800">
                                                    {exam.questions_count ?? 0}{" "}
                                                    soal
                                                </dd>
                                            </div>
                                        </dl>
                                        <div className="mt-4 flex justify-end">
                                            {status === 'buka' ? (
                                                <Link
                                                    href={route('exams.attempt.start', exam.id)}
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
                                                    {status === 'belum' ? 'Belum Dimulai' : 'Selesai'}
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                <section className="mt-8">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Riwayat ujian
                    </h2>

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
                                                            att.finished_at ?? att.updated_at
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
                                                        {att.attempt_status === "menunggu_penilaian" ? (
                                                            <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                                                                Menunggu
                                                            </span>
                                                        ) : att.attempt_status === "selesai" ? (
                                                            <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
                                                                {passed ? "Lulus" : "Tidak Lulus"}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-900 ring-1 ring-slate-200/80">
                                                                {att.attempt_status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                                        {ex?.id ? (
                                                            <Link
                                                                href={route(
                                                                    "exams.attempt.result",
                                                                    {
                                                                        exam: ex.id,
                                                                        attempt: att.id,
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
                                <Pagination
                                    links={attempts.links}
                                    currentPage={attempts.current_page}
                                    lastPage={attempts.last_page}
                                    from={attempts.from}
                                    to={attempts.to}
                                    total={attempts.total}
                                />
                            </div>
                        </div>
                        )}
                </section>

                <p className="text-center text-xs text-slate-400">
                    Menampilkan {rows.length} dari {total} percobaan
                </p>
            </StudentShell>
        </DashboardLayout>
    );
}
