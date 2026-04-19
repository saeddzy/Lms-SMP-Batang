import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell from "@/Components/Student/StudentShell";
import Pagination from "@/Components/Pagination";
import { Head, router, usePage } from "@inertiajs/react";
import {
    IconSchool,
    IconUsers,
    IconBook,
    IconChevronRight,
} from "@tabler/icons-react";
import ClassCardThumbnail from "@/Components/ClassCardThumbnail";

export default function StudentClasses() {
    const { classes } = usePage().props;
    const list = classes?.data ?? [];

    return (
        <DashboardLayout title="Kelas Anda">
            <Head title="Kelas Anda" />

            <StudentShell
                eyebrow="Komunitas belajar"
                title="Kelas Anda"
                subtitle="Kelas yang dapat Anda akses setelah didaftarkan oleh admin — buka untuk detail."
            >
                {list.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                        <IconSchool
                            className="mx-auto h-12 w-12 text-slate-300"
                            stroke={1.25}
                        />
                        <p className="mt-4 text-sm font-medium text-slate-700">
                            Belum ada kelas
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Hubungi admin jika Anda seharusnya sudah terdaftar.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {list.map((schoolClass) => (
                                <button
                                    key={schoolClass.id}
                                    type="button"
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                "classes.show",
                                                schoolClass.id
                                            )
                                        )
                                    }
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left shadow-sm transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10"
                                >
                                    <div className="relative">
                                        <ClassCardThumbnail
                                            classId={schoolClass.id}
                                        />
                                        <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 text-indigo-600 shadow-md backdrop-blur-sm ring-1 ring-white/60">
                                            <IconSchool
                                                className="h-6 w-6"
                                                stroke={1.5}
                                            />
                                        </span>
                                    </div>
                                    <div className="flex flex-col p-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="min-w-0 text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-800">
                                                {schoolClass.name}
                                            </h3>
                                            <span
                                                className={
                                                    schoolClass.is_active
                                                        ? "shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80"
                                                        : "shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200/80"
                                                }
                                            >
                                                {schoolClass.is_active
                                                    ? "Aktif"
                                                    : "Nonaktif"}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {schoolClass.academic_year ?? "—"}
                                        </p>
                                        <p className="mt-3 text-sm text-slate-600">
                                            <span className="text-slate-400">
                                                Wali kelas:{" "}
                                            </span>
                                            <span className="font-medium text-slate-900">
                                                {schoolClass.teacher?.name ?? "—"}
                                            </span>
                                        </p>
                                        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
                                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                                                <IconUsers
                                                    className="h-4 w-4 text-indigo-500"
                                                    stroke={1.5}
                                                />
                                                <span>
                                                    <span className="font-semibold tabular-nums text-slate-900">
                                                        {schoolClass.student_count ??
                                                            0}
                                                    </span>{" "}
                                                    siswa
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                                                <IconBook
                                                    className="h-4 w-4 text-violet-500"
                                                    stroke={1.5}
                                                />
                                                <span>
                                                    <span className="font-semibold tabular-nums text-slate-900">
                                                        {schoolClass.class_subjects_count ??
                                                            0}
                                                    </span>{" "}
                                                    mapel
                                                </span>
                                            </div>
                                        </div>
                                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                                            Buka detail
                                            <IconChevronRight
                                                className="h-4 w-4 transition group-hover:translate-x-0.5"
                                                stroke={1.5}
                                            />
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {classes.last_page > 1 && (
                            <div className="flex justify-center">
                                <Pagination links={classes.links} />
                            </div>
                        )}
                    </>
                )}
            </StudentShell>
        </DashboardLayout>
    );
}
