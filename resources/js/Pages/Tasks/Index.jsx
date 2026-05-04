import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, Link, router, usePage } from "@inertiajs/react";
import hasAnyPermission, { hasRole } from "@/Utils/Permissions";
import ToggleSwitch from "@/Components/ToggleSwitch";

const chipBase =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1";

function statusMeta(status) {
    switch (status) {
        case "active":
            return {
                label: "Aktif",
                className: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
            };
        case "overdue":
            return {
                label: "Lewat deadline",
                className: "bg-rose-50 text-rose-800 ring-rose-200/80",
            };
        default:
            return {
                label: "Nonaktif",
                className: "bg-slate-100 text-slate-700 ring-slate-200/80",
            };
    }
}

function shortDateTime(value) {
    if (!value) return "?";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "?";
    return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Index() {
    const {
        tasks,
        subjects = [],
        classes = [],
        teachers = [],
        filters = {},
        auth = {},
    } = usePage().props;
    const canMutate = auth.canMutateTeachingContent ?? false;
    const isAdmin = hasRole("admin");
    const taskItems = tasks?.data ?? [];
    const selectedStatus = filters.status ?? "";
    const filterQuery = {
        search: filters.search ?? "",
        status: selectedStatus,
        subject_id: filters.subject_id ?? "",
        class_id: filters.class_id ?? "",
        teacher_id: filters.teacher_id ?? "",
    };

    const totalTasks = taskItems.length;
    const activeTasks = taskItems.filter((t) => t.status === "active").length;
    const overdueTasks = taskItems.filter((t) => t.status === "overdue").length;
    const totalParticipants = taskItems.reduce(
        (sum, t) => sum + (t.participants_count ?? 0),
        0
    );
    const totalSubmissions = taskItems.reduce(
        (sum, t) => sum + (t.submissions_count ?? 0),
        0
    );
    const submissionRate =
        totalParticipants > 0
            ? Math.round((totalSubmissions / totalParticipants) * 100)
            : 0;

    const statusOptions = [
        { value: "", label: "Semua" },
        { value: "active", label: "Aktif" },
        { value: "overdue", label: "Lewat deadline" },
        { value: "inactive", label: "Nonaktif" },
    ];

    const applyStatusFilter = (status) => {
        router.get(
            route("tasks.index"),
            {
                search: filterQuery.search,
                status,
                ...(isAdmin
                    ? {
                          subject_id: filterQuery.subject_id,
                          class_id: filterQuery.class_id,
                          teacher_id: filterQuery.teacher_id,
                      }
                    : {}),
            },
            {
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <DashboardLayout title="Tugas">
            <Head title="Tugas" />

            <div className="space-y-6">
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-2xl font-semibold text-slate-900">
                                    Tugas
                                </h1>
                                <p className="mt-1 text-sm text-slate-600">
                                    Kelola tugas per kelas dengan status deadline
                                    dan progres pengumpulan siswa.
                                </p>
                            </div>
                            {canMutate && hasAnyPermission(["tasks create"]) && (
                                <Button
                                    type="add"
                                    url={route("tasks.create")}
                                    className="border-[#163d8f] bg-[#163d8f] hover:bg-[#0f2e6f]"
                                />
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5 md:grid-cols-4">
                        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Total tugas
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {totalTasks}
                            </p>
                        </div>
                        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                                Aktif
                            </p>
                            <p className="mt-1 text-xl font-semibold text-emerald-800">
                                {activeTasks}
                            </p>
                        </div>
                        <div className="rounded-md border border-rose-200 bg-rose-50/50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-rose-700">
                                Lewat deadline
                            </p>
                            <p className="mt-1 text-xl font-semibold text-rose-800">
                                {overdueTasks}
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Rasio submit
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {submissionRate}%
                            </p>
                        </div>
                    </div>
                </section>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <Search
                        url={route("tasks.index")}
                        placeholder="Cari judul / deskripsi tugas..."
                        filter={
                            isAdmin
                                ? filterQuery
                                : {
                                      search: filterQuery.search,
                                      status: filterQuery.status,
                                  }
                        }
                    />
                    {isAdmin && (
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <select
                                value={filterQuery.subject_id}
                                onChange={(e) =>
                                    router.get(
                                        route("tasks.index"),
                                        {
                                            ...filterQuery,
                                            subject_id: e.target.value,
                                        },
                                        { preserveScroll: true, replace: true }
                                    )
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua mapel</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterQuery.class_id}
                                onChange={(e) =>
                                    router.get(
                                        route("tasks.index"),
                                        {
                                            ...filterQuery,
                                            class_id: e.target.value,
                                        },
                                        { preserveScroll: true, replace: true }
                                    )
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua kelas</option>
                                {classes.map((schoolClass) => (
                                    <option key={schoolClass.id} value={schoolClass.id}>
                                        {schoolClass.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterQuery.teacher_id}
                                onChange={(e) =>
                                    router.get(
                                        route("tasks.index"),
                                        {
                                            ...filterQuery,
                                            teacher_id: e.target.value,
                                        },
                                        { preserveScroll: true, replace: true }
                                    )
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua guru</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {statusOptions.map((status) => {
                            const isActive = selectedStatus === status.value;
                            return (
                                <button
                                    key={status.value || "all"}
                                    type="button"
                                    onClick={() => applyStatusFilter(status.value)}
                                    className={
                                        isActive
                                            ? "inline-flex items-center rounded-md border border-[#163d8f] bg-[#163d8f] px-3 py-1.5 text-xs font-semibold text-white"
                                            : "inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    }
                                >
                                    {status.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {taskItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {taskItems.map((task) => {
                            const st = statusMeta(task.status);
                            const participants = task.participants_count ?? 0;
                            const submissions = task.submissions_count ?? 0;
                            const progressPct =
                                participants > 0
                                    ? Math.min(
                                          100,
                                          Math.round(
                                              (submissions / participants) * 100
                                          )
                                      )
                                    : 0;

                            return (
                                <article
                                    key={task.id}
                                    className="flex flex-col rounded-lg border border-slate-200 bg-white p-5"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="line-clamp-2 text-base font-semibold text-slate-900">
                                            {task.title}
                                        </h2>
                                        <span className={`${chipBase} ${st.className}`}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                        {task.description || "Tanpa deskripsi"}
                                    </p>

                                    <dl className="mt-4 space-y-1.5 text-sm text-slate-700">
                                        <div className="flex justify-between gap-2">
                                            <dt className="text-slate-500">
                                                Kelas
                                            </dt>
                                            <dd className="text-right font-medium text-slate-900">
                                                {task.school_class?.name ?? task.schoolClass?.name ?? "?"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt className="text-slate-500">
                                                Mapel
                                            </dt>
                                            <dd className="text-right font-medium text-slate-900">
                                                {task.subject?.name ?? "?"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt className="text-slate-500">
                                                Peserta
                                            </dt>
                                            <dd className="font-medium text-slate-900">
                                                {participants} siswa
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt className="text-slate-500">
                                                Submission
                                            </dt>
                                            <dd className="font-medium text-slate-900">
                                                {submissions}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                        <p>Deadline: {shortDateTime(task.due_date)}</p>
                                    </div>

                                    <div className="mt-3">
                                        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                            <span>Progres pengumpulan</span>
                                            <span>{progressPct}%</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-2 rounded-full bg-[#163d8f]"
                                                style={{ width: `${progressPct}%` }}
                                            />
                                        </div>
                                    </div>

                                    {canMutate &&
                                        hasAnyPermission(["tasks edit"]) && (
                                            <div className="mt-4 w-full max-w-md">
                                                <ToggleSwitch
                                                    checked={task.is_active}
                                                    label="Tugas aktif"
                                                    description="Matikan agar siswa tidak dapat mengumpulkan."
                                                    onChange={() =>
                                                        router.patch(
                                                            route(
                                                                "tasks.toggle-status",
                                                                task.id
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            }
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}

                                    <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
                                        <Link
                                            href={route("tasks.show", task.id)}
                                            className="inline-flex rounded-md bg-[#163d8f] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0f2e6f]"
                                        >
                                            Buka Detail
                                        </Link>
                                        {hasAnyPermission(["tasks edit"]) && (
                                            <Button type="edit" url={route("tasks.edit", task.id)} />
                                        )}
                                        {hasAnyPermission(["tasks delete"]) && (
                                            <Button
                                                type="delete"
                                                url={route("tasks.destroy", task.id)}
                                            />
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
                        Belum ada tugas yang cocok dengan filter saat ini.
                    </div>
                )}

                {tasks?.last_page > 1 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <Pagination links={tasks.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
