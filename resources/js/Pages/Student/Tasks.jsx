import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Search from "@/Components/Search";
import SimplePagination from "@/Components/SimplePagination";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconClipboardList,
    IconClockHour4,
    IconCheck,
    IconAlertTriangle,
    IconPlayerPlayFilled,
    IconClock,
    IconCircleCheck,
    IconCalendarEvent,
    IconPaperclip,
    IconUser,
} from "@tabler/icons-react";

function submissionStatus(task, submission) {
    if (submission?.score != null || submission?.status === "graded") {
        return "graded";
    }
    if (submission?.submitted_at || submission?.status === "submitted") {
        return "submitted";
    }
    const due = task?.due_date ? new Date(task.due_date) : null;
    if (due && due < new Date()) {
        return "overdue";
    }
    return "pending";
}

const statusConfig = {
    pending: {
        label: "Belum dikumpulkan",
        className: "bg-amber-50 text-amber-900 ring-amber-200/80",
        icon: IconClockHour4,
    },
    submitted: {
        label: "Sudah dikumpul",
        className: "bg-sky-50 text-sky-900 ring-sky-200/80",
        icon: IconClipboardList,
    },
    graded: {
        label: "Sudah dinilai",
        className: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
        icon: IconCheck,
    },
    overdue: {
        label: "Terlambat",
        className: "bg-rose-50 text-rose-900 ring-rose-200/80",
        icon: IconAlertTriangle,
    },
};

export default function StudentTasks() {
    const { tasks, filters = {} } = usePage().props;

    const rows = tasks.data ?? [];
    const total = tasks.total ?? 0;

    // Calculate statistics
    const stats = useMemo(() => {
        const pending = rows.filter(task => {
            const submission = task.submissions?.[0] ?? null;
            return submissionStatus(task, submission) === 'pending';
        }).length;

        const submitted = rows.filter(task => {
            const submission = task.submissions?.[0] ?? null;
            return submissionStatus(task, submission) === 'submitted';
        }).length;

        const graded = rows.filter(task => {
            const submission = task.submissions?.[0] ?? null;
            return submissionStatus(task, submission) === 'graded';
        }).length;

        return { pending, submitted, graded };
    }, [rows]);

    return (
        <DashboardLayout title="Tugas Saya">
            <Head title="Tugas Saya" />

            <StudentShell
                eyebrow="Pembelajaran"
                title="Tugas saya"
                subtitle="Daftar tugas di kelas Anda — kumpulkan teks dan lampiran sebelum deadline."
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StudentStatCard
                        icon={IconPlayerPlayFilled}
                        label="Perlu dikerjakan"
                        value={stats.pending}
                        hint="Tugas yang belum dikumpulkan"
                        accent="indigo"
                    />
                    <StudentStatCard
                        icon={IconClock}
                        label="Menunggu nilai"
                        value={stats.submitted}
                        hint="Tugas yang sedang dinilai"
                        accent="amber"
                    />
                    <StudentStatCard
                        icon={IconCircleCheck}
                        label="Selesai"
                        value={stats.graded}
                        hint="Tugas yang sudah dinilai"
                        accent="emerald"
                    />
                </div>

                <section className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
                        <div className="relative">
                            <IconClipboardList className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Search
                                url={route("student.tasks")}
                                placeholder="Cari judul tugas, mapel, atau kelas..."
                                filter={{ search: filters.search ?? "" }}
                                className="[&_.search-input]:rounded-full [&_.search-input]:pl-9"
                            />
                        </div>
                    </div>
                </section>

                {rows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                        <IconClipboardList
                            className="mx-auto h-12 w-12 text-slate-300"
                            stroke={1.25}
                        />
                        <p className="mt-4 text-sm font-medium text-slate-700">
                            Belum ada tugas
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Tugas akan muncul ketika guru memposting di kelas Anda.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {rows.map((task) => {
                            const submission = task.submissions?.[0] ?? null;
                            const st = submissionStatus(task, submission);
                            const cfg = statusConfig[st] ?? statusConfig.pending;
                            const Icon = cfg.icon;
                            const due = task.due_date
                                ? new Date(task.due_date)
                                : null;
                            const teacherName =
                                task.teacher?.name ??
                                task.creator?.name ??
                                "Guru";
                            const dueDateLabel = due
                                ? due.toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                  })
                                : "Tanpa deadline";
                            const dueDateTimeLabel = due
                                ? due.toLocaleString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  })
                                : "Belum ditentukan";
                            const actionLabel = submission
                                ? "Kumpulkan Ulang"
                                : "Kumpulkan";

                            return (
                                <article
                                    key={task.id}
                                    className="group rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-blue-200 hover:shadow-md md:p-6"
                                >
                                    <div className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-semibold text-blue-700 ring-1 ring-blue-200/70">
                                                        <IconClipboardList className="h-3.5 w-3.5" />
                                                        {task.subject?.name ?? "Mapel"}
                                                    </span>
                                                    {task.school_class?.name && (
                                                        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 ring-1 ring-slate-200/80">
                                                            {task.school_class.name}
                                                        </span>
                                                    )}
                                                    {due && (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 ring-1 ring-slate-200/80">
                                                            <IconClockHour4 className="h-3.5 w-3.5" />
                                                            {dueDateLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="mt-3 text-2xl font-bold leading-tight text-slate-900 group-hover:text-blue-800">
                                                    {task.title}
                                                </h3>
                                                {task.description ? (
                                                    <p className="mt-2 line-clamp-1 text-sm text-slate-500">
                                                        {task.description}
                                                    </p>
                                                ) : (
                                                    <p className="mt-2 text-sm text-slate-400">
                                                        -
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex flex-row items-start justify-between gap-3 md:flex-col md:items-end">
                                                <span
                                                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cfg.className}`}
                                                >
                                                    <Icon
                                                        className="h-3.5 w-3.5"
                                                        stroke={1.5}
                                                    />
                                                    {cfg.label}
                                                </span>
                                                {submission?.score != null && (
                                                    <span className="rounded-full bg-slate-900 px-4 py-1.5 text-base font-bold tabular-nums text-white">
                                                        {Number(submission.score).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-dashed border-slate-200 pt-4">
                                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
                                                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-200/60">
                                                        <IconCalendarEvent className="h-4 w-4" />
                                                    </span>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Deadline
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {dueDateTimeLabel}
                                                        </p>
                                                        {st === "overdue" ? (
                                                            <p className="mt-0.5 text-xs font-medium text-rose-600">
                                                                Terlambat
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
                                                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-200/60">
                                                        <IconPaperclip className="h-4 w-4" />
                                                    </span>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Lampiran
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {task.file_path ? "1 Lampiran" : "Tidak ada lampiran"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200/70">
                                                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-blue-200/60">
                                                        <IconUser className="h-4 w-4" />
                                                    </span>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-500">
                                                            Diberikan oleh
                                                        </p>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            {teacherName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                            <Link
                                                href={route("tasks.show", task.id)}
                                                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                Lihat Detail
                                            </Link>
                                            <Link
                                                href={route("tasks.submit-page", task.id)}
                                                className="inline-flex items-center justify-center rounded-md bg-[#1E429F] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1A3A8C]"
                                            >
                                                {actionLabel}
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}

                {tasks.last_page > 1 && (
                    <div className="mt-6">
                        <SimplePagination
                            currentPage={tasks.current_page}
                            lastPage={tasks.last_page}
                            from={tasks.from}
                            to={tasks.to}
                            total={tasks.total}
                            links={tasks.links}
                        />
                    </div>
                )}

                <p className="text-center text-xs text-slate-400">
                    Menampilkan {rows.length} dari {total} tugas
                </p>
            </StudentShell>
        </DashboardLayout>
    );
}
