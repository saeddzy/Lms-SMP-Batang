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

    const getTypeIcon = (type) => {
        switch (type) {
            case "video":
                return "🎥";
            case "pdf":
            case "document":
                return "📄";
            case "presentation":
                return "📊";
            case "image":
                return "🖼️";
            default:
                return "📁";
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case "video":
                return "Video";
            case "pdf":
                return "PDF";
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

            <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-amber-50 via-white to-orange-50 px-6 py-5">
                        <h1 className="text-2xl font-bold text-stone-900">
                            Materi pembelajaran
                        </h1>
                        <p className="text-sm text-stone-600">
                            Kelola materi kelas dalam tampilan ringkas untuk guru.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 border-t border-stone-100 px-6 py-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                            <p className="text-xs font-semibold uppercase text-stone-500">
                                Total materi
                            </p>
                            <p className="mt-1 text-xl font-bold text-stone-900">
                                {totalMaterials}
                            </p>
                        </div>
                        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                            <p className="text-xs font-semibold uppercase text-stone-500">
                                Fokus halaman
                            </p>
                            <p className="mt-1 text-sm font-medium text-stone-900">
                                Tipe materi, status aktif, dan pengajar
                            </p>
                        </div>
                        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                            <p className="text-xs font-semibold uppercase text-stone-500">
                                Tampilan
                            </p>
                            <p className="mt-1 text-sm font-medium text-stone-900">
                                Card responsif untuk akses cepat
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {canMutate && hasAnyPermission(["materials create"]) && (
                        <Button
                            type="add"
                            url={route("materials.create")}
                            label="Tambah materi"
                        />
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
                                className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <span className="text-2xl" aria-hidden>
                                            {getTypeIcon(
                                                material.material_type ??
                                                    material.type
                                            )}
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="line-clamp-2 text-base font-semibold text-stone-900">
                                                {material.title}
                                            </h2>
                                            <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                                                {material.description ||
                                                    "Tanpa deskripsi"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={badge}>
                                        {getTypeLabel(
                                            material.material_type ??
                                                material.type
                                        )}
                                    </span>
                                </div>

                                <dl className="mt-4 space-y-1.5 text-sm text-stone-700">
                                    <div className="flex justify-between gap-2">
                                        <dt>Mapel</dt>
                                        <dd className="text-right font-medium text-stone-900">
                                            {material.subject?.name ?? "—"}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Kelas</dt>
                                        <dd className="text-right font-medium text-stone-900">
                                            {materialClassName(material) ?? "—"}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Status</dt>
                                        <dd>
                                            <span className={badge}>
                                                {material.is_active
                                                    ? "Aktif"
                                                    : "Tidak aktif"}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-4 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-xs text-stone-600">
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
                                        <div className="mt-4 w-full max-w-md">
                                            <ToggleSwitch
                                                checked={material.is_active}
                                                label="Materi aktif"
                                                description="Nonaktifkan agar materi tidak ditampilkan kepada siswa."
                                                onChange={() =>
                                                    router.patch(
                                                        route(
                                                            "materials.toggle-status",
                                                            material.id
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

                                <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4">
                                    <Link
                                        href={route("materials.show", material.id)}
                                        className="inline-flex rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800"
                                    >
                                        Buka
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
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-10 text-center text-sm text-stone-500">
                        {searchQuery
                            ? "Tidak ada materi yang cocok dengan pencarian."
                            : "Belum ada materi pembelajaran."}
                    </div>
                )}

                {materials?.last_page > 1 && (
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-3">
                        <Pagination links={materials.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
