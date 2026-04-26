import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, Link, router, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";
import { materialClassName } from "@/Utils/materialClassName";
import ToggleSwitch from "@/Components/ToggleSwitch";

const badge =
    "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium ring-1 ring-stone-200/80 bg-stone-50 text-stone-700";

export default function Index() {
    const { materials, filters = {}, auth = {} } = usePage().props;
    const canMutate = auth.canMutateTeachingContent ?? false;
    const searchQuery = filters.search ?? "";
    const totalMaterials = materials?.total ?? materials?.data?.length ?? 0;

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
                            filter={filters}
                        />
                    </div>
                </div>

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
