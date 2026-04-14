import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, Link, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

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
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Index() {
    const { tasks, filters = {} } = usePage().props;

    return (
        <DashboardLayout title="Tugas">
            <Head title="Tugas" />

            <div className="space-y-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-stone-900">Tugas</h1>
                        <p className="text-sm text-stone-600">
                            Daftar tugas dinamis per kelas dengan status deadline,
                            peserta, dan progres pengumpulan.
                        </p>
                    </div>
                    {hasAnyPermission(["tasks create"]) && (
                        <Button type="add" url={route("tasks.create")} />
                    )}
                </div>

                <Search
                    url={route("tasks.index")}
                    placeholder="Cari judul / deskripsi tugas..."
                    filter={{ search: filters.search ?? "" }}
                />

                {tasks?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {tasks.data.map((task) => {
                            const st = statusMeta(task.status);

                            return (
                                <article
                                    key={task.id}
                                    className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="line-clamp-2 text-base font-semibold text-stone-900">
                                            {task.title}
                                        </h2>
                                        <span className={`${chipBase} ${st.className}`}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                                        {task.description || "Tanpa deskripsi"}
                                    </p>

                                    <dl className="mt-4 space-y-1.5 text-sm text-stone-700">
                                        <div className="flex justify-between gap-2">
                                            <dt>Kelas</dt>
                                            <dd className="text-right font-medium text-stone-900">
                                                {task.school_class?.name ?? task.schoolClass?.name ?? "—"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt>Mapel</dt>
                                            <dd className="text-right font-medium text-stone-900">
                                                {task.subject?.name ?? "—"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt>Peserta</dt>
                                            <dd className="font-medium text-stone-900">
                                                {task.participants_count ?? 0} siswa
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt>Submission</dt>
                                            <dd className="font-medium text-stone-900">
                                                {task.submissions_count ?? 0}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-4 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                                        <p>Deadline: {shortDateTime(task.due_date)}</p>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4">
                                        <Link
                                            href={route("tasks.show", task.id)}
                                            className="inline-flex rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800"
                                        >
                                            Buka
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
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-10 text-center text-sm text-stone-500">
                        Belum ada tugas yang cocok dengan filter saat ini.
                    </div>
                )}

                {tasks?.last_page > 1 && (
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-3">
                        <Pagination links={tasks.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
