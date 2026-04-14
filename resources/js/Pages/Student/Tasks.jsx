import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell from "@/Components/Student/StudentShell";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, usePage } from "@inertiajs/react";
import {
    IconClipboardList,
    IconClockHour4,
    IconCheck,
    IconAlertTriangle,
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
    const [search, setSearch] = useState(filters.search || "");

    const rows = tasks.data ?? [];
    const total = tasks.total ?? 0;

    return (
        <DashboardLayout title="Tugas Saya">
            <Head title="Tugas Saya" />

            <StudentShell
                eyebrow="Pembelajaran"
                title="Tugas saya"
                subtitle="Daftar tugas di kelas Anda — kumpulkan teks dan lampiran sebelum deadline."
            >
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm sm:p-6">
                    <Search
                        value={search}
                        onChange={(value) => setSearch(value)}
                        placeholder="Cari judul atau deskripsi…"
                        routeName="student.tasks"
                        filters={filters}
                    />
                </div>

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
                    <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {rows.map((task) => {
                            const submission = task.submissions?.[0] ?? null;
                            const st = submissionStatus(task, submission);
                            const cfg = statusConfig[st] ?? statusConfig.pending;
                            const Icon = cfg.icon;
                            const due = task.due_date
                                ? new Date(task.due_date)
                                : null;
                            return (
                                <li
                                    key={task.id}
                                    className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-indigo-200/80 hover:shadow-md"
                                >
                                    <div className="flex flex-1 flex-col gap-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                                                    {task.subject?.name ??
                                                        "Mapel"}
                                                    {task.school_class?.name
                                                        ? ` · ${task.school_class.name}`
                                                        : ""}
                                                </p>
                                                <h3 className="mt-1 text-lg font-semibold leading-snug text-slate-900 group-hover:text-indigo-800">
                                                    {task.title}
                                                </h3>
                                                {task.description ? (
                                                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                                                        {task.description}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <span
                                                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cfg.className}`}
                                            >
                                                <Icon
                                                    className="h-3.5 w-3.5"
                                                    stroke={1.5}
                                                />
                                                {cfg.label}
                                            </span>
                                        </div>

                                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                            <div className="text-sm text-slate-600">
                                                {due ? (
                                                    <>
                                                        <span className="font-medium text-slate-800">
                                                            Deadline:{" "}
                                                        </span>
                                                        {due.toLocaleString(
                                                            "id-ID",
                                                            {
                                                                dateStyle:
                                                                    "medium",
                                                                timeStyle:
                                                                    "short",
                                                            }
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">
                                                        Tanpa deadline
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {submission?.score != null ? (
                                                    <span className="rounded-lg bg-slate-900 px-3 py-1 text-sm font-bold tabular-nums text-white">
                                                        {submission.score}
                                                    </span>
                                                ) : null}
                                                <Button
                                                    type="view"
                                                    url={route(
                                                        "tasks.show",
                                                        task.id
                                                    )}
                                                />
                                                <Button
                                                    type="edit"
                                                    url={route(
                                                        "tasks.submit-page",
                                                        task.id
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {tasks.last_page > 1 && (
                    <div className="flex justify-center rounded-2xl border border-slate-200/90 bg-white px-4 py-4">
                        <Pagination
                            links={tasks.links}
                            currentPage={tasks.current_page}
                            lastPage={tasks.last_page}
                            from={tasks.from}
                            to={tasks.to}
                            total={tasks.total}
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
