import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, Link, router, usePage } from "@inertiajs/react";
import hasAnyPermission, { hasRole } from "@/Utils/Permissions";
import { materialClassName } from "@/Utils/materialClassName";
import ToggleSwitch from "@/Components/ToggleSwitch";

const badge =
    "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ring-1 ring-stone-200/80 bg-stone-50 text-stone-700";

export default function Index() {
    const {
        materials,
        subjects = [],
        classes = [],
        teachers = [],
        filters = {},
        auth = {},
    } = usePage().props;
    const canMutate = auth.canMutateTeachingContent ?? false;
    const isAdmin = hasRole("admin");
    const searchQuery = filters.search ?? "";
    const totalMaterials = materials?.total ?? materials?.data?.length ?? 0;
    const filterQuery = {
        search: filters.search ?? "",
        subject_id: filters.subject_id ?? "",
        class_id: filters.class_id ?? "",
        teacher_id: filters.teacher_id ?? "",
        type: filters.type ?? "",
        status: filters.status ?? "",
    };

    const applyFilter = (patch = {}) => {
        const next = { ...filterQuery, ...patch };
        router.get(route("materials.index"), next, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case "video":
                return "Video";
            case "pdf":
                return "Dokumen";
            case "document":
                return "Dokumen";
            case "presentation":
                return "Presentasi";
            case "image":
                return "Gambar";
            default:
                return type ?? "—";
        }
    };

    const selectedSubject = subjects.find(
        (s) => String(s.id) === String(filterQuery.subject_id)
    );
    const selectedClass = classes.find(
        (c) => String(c.id) === String(filterQuery.class_id)
    );
    const selectedTeacher = teachers.find(
        (t) => String(t.id) === String(filterQuery.teacher_id)
    );

    const activeFilters = [
        filterQuery.search
            ? {
                  key: "search",
                  label: `Cari: "${filterQuery.search}"`,
                  clear: () => applyFilter({ search: "" }),
              }
            : null,
        filterQuery.subject_id
            ? {
                  key: "subject_id",
                  label: `Mapel: ${selectedSubject?.name ?? filterQuery.subject_id}`,
                  clear: () => applyFilter({ subject_id: "" }),
              }
            : null,
        filterQuery.class_id
            ? {
                  key: "class_id",
                  label: `Kelas: ${selectedClass?.name ?? filterQuery.class_id}`,
                  clear: () => applyFilter({ class_id: "" }),
              }
            : null,
        filterQuery.teacher_id
            ? {
                  key: "teacher_id",
                  label: `Guru: ${selectedTeacher?.name ?? filterQuery.teacher_id}`,
                  clear: () => applyFilter({ teacher_id: "" }),
              }
            : null,
        filterQuery.type
            ? {
                  key: "type",
                  label: `Tipe: ${getTypeLabel(filterQuery.type)}`,
                  clear: () => applyFilter({ type: "" }),
              }
            : null,
        filterQuery.status !== ""
            ? {
                  key: "status",
                  label: `Status: ${
                      String(filterQuery.status) === "1" ? "Aktif" : "Tidak aktif"
                  }`,
                  clear: () => applyFilter({ status: "" }),
              }
            : null,
    ].filter(Boolean);

    return (
        <DashboardLayout title="Materi pembelajaran">
            <Head title="Materi Pembelajaran" />

            <div className="space-y-5">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="px-6 py-5">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Materi pembelajaran
                        </h1>
                        <p className="text-sm text-slate-600">
                            Kelola materi ajar per kelas dengan alur yang jelas untuk guru.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-6 py-4">
                        <div className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5">
                            <p className="text-xs font-semibold uppercase text-slate-500">
                                Total materi
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                                {totalMaterials}
                            </p>
                        </div>
                        <p className="text-xs text-slate-500">
                            Tip: klik "Buka Detail" untuk lihat materi lengkap.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {canMutate && hasAnyPermission(["materials create"]) && (
                        <Link
                            href={route("materials.create")}
                            className="inline-flex items-center rounded-md bg-[#163d8f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2e6f]"
                        >
                            Tambah Materi
                        </Link>
                    )}
                    <div className="w-full min-w-0 sm:max-w-md sm:flex-1">
                        <Search
                            url={route("materials.index")}
                            placeholder="Cari materi..."
                            filter={isAdmin ? filterQuery : { search: filterQuery.search ?? "" }}
                        />
                    </div>
                </div>

                {isAdmin && (
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Mapel
                            </label>
                            <select
                                value={filterQuery.subject_id}
                                onChange={(e) => applyFilter({ subject_id: e.target.value })}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua mapel</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Kelas
                            </label>
                            <select
                                value={filterQuery.class_id}
                                onChange={(e) => applyFilter({ class_id: e.target.value })}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua kelas</option>
                                {classes.map((schoolClass) => (
                                    <option key={schoolClass.id} value={schoolClass.id}>
                                        {schoolClass.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Guru
                            </label>
                            <select
                                value={filterQuery.teacher_id}
                                onChange={(e) => applyFilter({ teacher_id: e.target.value })}
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
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Tipe
                            </label>
                            <select
                                value={filterQuery.type}
                                onChange={(e) => applyFilter({ type: e.target.value })}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua tipe</option>
                                <option value="pdf">Dokumen</option>
                                <option value="video">Video</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </label>
                            <select
                                value={filterQuery.status}
                                onChange={(e) => applyFilter({ status: e.target.value })}
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua status</option>
                                <option value="1">Aktif</option>
                                <option value="0">Tidak aktif</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Link
                            href={route("materials.index")}
                            className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        >
                            Reset filter
                        </Link>
                    </div>
                </div>
                )}

                {isAdmin && activeFilters.length > 0 && (
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Filter aktif
                            </p>
                            {activeFilters.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={item.clear}
                                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                    title="Klik untuk menghapus filter ini"
                                >
                                    <span>{item.label}</span>
                                    <span className="text-slate-400">x</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {materials?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {materials.data.map((material) => (
                            <article
                                key={material.id}
                                className="flex flex-col rounded-lg border border-slate-200 bg-white p-5"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="line-clamp-2 text-base font-semibold text-slate-900">
                                            {material.title}
                                        </h2>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                                            {material.description ||
                                                "Tanpa deskripsi"}
                                        </p>
                                    </div>
                                    <span className={badge}>
                                        {getTypeLabel(
                                            material.material_type ??
                                                material.type
                                        )}
                                    </span>
                                </div>

                                <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
                                    <div className="flex items-start justify-between gap-2">
                                        <dt className="text-slate-500">Mapel</dt>
                                        <dd className="max-w-[65%] text-right font-medium text-slate-900">
                                            {material.subject?.name ?? "—"}
                                        </dd>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <dt className="text-slate-500">Kelas</dt>
                                        <dd className="text-right font-medium text-slate-900">
                                            {materialClassName(material) ?? "—"}
                                        </dd>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <dt className="text-slate-500">Status</dt>
                                        <dd>
                                            <span className={badge}>
                                                {material.is_active ? "Aktif" : "Tidak aktif"}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                    <p>
                                        Dibuat{" "}
                                        {material.created_at
                                            ? new Date(
                                                  material.created_at
                                              ).toLocaleDateString("id-ID")
                                            : "—"}
                                    </p>
                                    <p>
                                        Oleh{" "}
                                        {material.uploader?.name ??
                                            material.teacher?.name ??
                                            "—"}
                                    </p>
                                </div>

                                {canMutate &&
                                    hasAnyPermission(["materials edit"]) && (
                                        <div className="mt-4 w-full">
                                            <ToggleSwitch
                                                checked={material.is_active}
                                                label="Materi aktif"
                                                description="Nonaktifkan agar materi tidak ditampilkan kepada siswa."
                                                activeLabel="Aktif"
                                                inactiveLabel="Nonaktif"
                                                onChange={() =>
                                                    router.patch(
                                                        route("materials.toggle-status", material.id),
                                                        {},
                                                        { preserveScroll: true }
                                                    )
                                                }
                                            />
                                        </div>
                                    )}

                                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                                    <Link
                                        href={route("materials.show", material.id)}
                                        className="inline-flex items-center rounded-md bg-[#163d8f] px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2e6f]"
                                    >
                                        Lihat Detail
                                    </Link>
                                    {hasAnyPermission(["materials edit"]) && (
                                        <Button
                                            type="edit"
                                            url={route("materials.edit", material.id)}
                                        />
                                    )}
                                    {hasAnyPermission(["materials delete"]) && (
                                        <Button
                                            type="delete"
                                            url={route(
                                                "materials.destroy",
                                                material.id
                                            )}
                                        />
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-stone-200 bg-stone-50/60 p-10 text-center text-sm text-stone-500">
                        {searchQuery
                            ? "Tidak ada materi yang cocok dengan pencarian."
                            : "Belum ada materi pembelajaran."}
                    </div>
                )}

                {materials?.last_page > 1 && (
                    <div className="rounded-lg border border-stone-200/90 bg-white p-3">
                        <Pagination links={materials.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
