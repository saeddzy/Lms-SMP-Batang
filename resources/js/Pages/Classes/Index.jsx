import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Pagination from "@/Components/Pagination";
import { Head, router, usePage } from "@inertiajs/react";
import Search from "@/Components/Search";
import hasAnyPermission, { hasRole } from "@/Utils/Permissions";
import ClassCardThumbnail from "@/Components/ClassCardThumbnail";
import ToggleSwitch from "@/Components/ToggleSwitch";

export default function Index() {
    const { classes, filters } = usePage().props;

    return (
        <DashboardLayout title="Kelas">
            <Head title={"Kelas"} />
            <div className="space-y-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                    {hasAnyPermission(["classes create"]) && (
                        <Button type={"add"} url={route("classes.create")} />
                    )}
                    <div className="w-full md:w-4/6">
                        <Search
                            url={route("classes.index")}
                            placeholder={"Cari kelas berdasarkan nama..."}
                            filter={filters}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {classes.data.map((schoolClass) => (
                        <div
                            key={schoolClass.id}
                            role="button"
                            tabIndex={0}
                            onClick={() =>
                                router.visit(
                                    route("classes.show", schoolClass.id)
                                )
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    router.visit(
                                        route("classes.show", schoolClass.id)
                                    );
                                }
                            }}
                            className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <ClassCardThumbnail classId={schoolClass.id} />
                            <div className="flex flex-col p-6">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-lg font-semibold tracking-tight text-stone-900">
                                        {schoolClass.name}
                                    </h3>
                                </div>
                                <span
                                    className={
                                        schoolClass.is_active
                                            ? "shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80"
                                            : "shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200/80"
                                    }
                                >
                                    {schoolClass.is_active
                                        ? "Aktif"
                                        : "Tidak aktif"}
                                </span>
                            </div>

                            <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg border border-slate-200 bg-white p-3 text-sm">
                                <div className="col-span-2 border-b border-slate-100 pb-2">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                                        Tahun Ajaran
                                    </p>
                                    <p className="mt-1 font-medium text-stone-900">
                                        {schoolClass.academic_year || "-"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                                        Jumlah Siswa
                                    </p>
                                    <p className="mt-1 font-medium text-stone-900">
                                        {schoolClass.student_count || 0} siswa
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                                        Jumlah Mapel
                                    </p>
                                    <p className="mt-1 font-medium text-stone-900">
                                        {schoolClass.class_subjects_count || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                                    Deskripsi
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm text-stone-700">
                                    {schoolClass.description || "Tidak ada deskripsi kelas."}
                                </p>
                            </div>

                            <div
                                className="mt-auto flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-100 pt-4"
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => e.stopPropagation()}
                            >
                                {hasRole("admin") &&
                                    hasAnyPermission(["classes edit"]) && (
                                        <div className="w-full min-w-[200px] max-w-xs">
                                            <ToggleSwitch
                                                checked={schoolClass.is_active}
                                                label="Kelas aktif"
                                                description="Siswa hanya mengikuti kelas yang dipublikasikan."
                                                activeLabel="Aktif"
                                                inactiveLabel="Nonaktif"
                                                onChange={() =>
                                                    router.patch(
                                                        route(
                                                            "classes.toggle-active",
                                                            schoolClass.id
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
                                {hasAnyPermission(["classes view"]) && (
                                    <Button
                                        type="view"
                                        url={route(
                                            "classes.show",
                                            schoolClass.id
                                        )}
                                        text="Masuk Kelas"
                                        className="h-auto w-auto rounded-md border-blue-700 bg-blue-700 px-3 py-1.5 text-white hover:bg-blue-800 hover:text-white"
                                    />
                                )}
                                {hasAnyPermission(["classes edit"]) && (
                                    <Button
                                        type="edit"
                                        url={route(
                                            "classes.edit",
                                            schoolClass.id
                                        )}
                                    />
                                )}
                                {hasAnyPermission(["classes delete"]) && (
                                    <Button
                                        type="delete"
                                        url={route(
                                            "classes.destroy",
                                            schoolClass.id
                                        )}
                                    />
                                )}
                            </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-center">
                    {classes.last_page !== 1 && (
                        <Pagination links={classes.links} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
