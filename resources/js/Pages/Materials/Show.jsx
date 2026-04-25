import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell from "@/Components/Student/StudentShell";
import Button from "@/Components/Button";
import { Head, Link, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";
import { hasRole } from "@/Utils/Permissions";
import { materialClassName } from "@/Utils/materialClassName";

function typeLabel(material) {
    if (material.type_label) return material.type_label;
    const t = material.material_type ?? material.type;
    if (t === "video") return "Video";
    if (t === "pdf") return "PDF";
    return t ?? "—";
}

function mimeLabel(material) {
    if (material.mime_type && material.mime_type !== "application/x-url") {
        return material.mime_type;
    }
    return typeLabel(material);
}

/** URL unduh untuk file lokal (route Laravel); tautan eksternal tidak ditambah query. */
function downloadHref(fileUrl, isRemote) {
    if (!fileUrl || isRemote) return fileUrl;
    const sep = fileUrl.includes("?") ? "&" : "?";
    return `${fileUrl}${sep}download=1`;
}

export default function Show() {
    const { material, canManageMaterial = false } = usePage().props;
    const isStudent = hasRole("siswa");

    const fileUrl = material.file_public_url || null;
    const downloadUrl = downloadHref(fileUrl, material.is_remote_url);
    const youtubeEmbed = material.youtube_embed_url;
    const isRemote = material.is_remote_url;
    const isVideoType = (material.material_type ?? material.type) === "video";
    const isPdfType = (material.material_type ?? material.type) === "pdf";
    const classLabel = materialClassName(material);

    const renderPreview = () => {
        if (!material.file_path || !fileUrl) {
            return (
                <p className="text-sm text-stone-500">
                    Belum ada berkas atau tautan untuk materi ini.
                </p>
            );
        }

        if (isPdfType) {
            return (
                <div className="mt-2 rounded-lg border border-stone-200 bg-stone-50 overflow-hidden">
                    <iframe
                        title={material.title}
                        src={fileUrl}
                        className="h-[min(70vh,720px)] w-full"
                    />
                </div>
            );
        }

        if (isVideoType && youtubeEmbed) {
            return (
                <div className="mt-2 aspect-video w-full max-w-4xl overflow-hidden rounded-lg border border-stone-200 bg-black">
                    <iframe
                        title={material.title}
                        src={youtubeEmbed}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            );
        }

        if (isVideoType && !isRemote) {
            return (
                <div className="mt-2 max-w-4xl rounded-lg border border-stone-200 bg-black p-2">
                    <video
                        controls
                        className="max-h-[70vh] w-full rounded-md"
                        src={fileUrl}
                    >
                        Browser Anda tidak mendukung pemutaran video.
                    </video>
                </div>
            );
        }

        if (isVideoType && isRemote) {
            return (
                <div className="mt-2 space-y-3 rounded-lg border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900">
                    <p>
                        Pratinjau tidak tersedia untuk tautan ini di halaman ini. Gunakan
                        tombol di bawah untuk membuka atau mengunduh.
                    </p>
                    <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex font-medium text-amber-950 underline"
                    >
                        Buka tautan video
                    </a>
                </div>
            );
        }

        return null;
    };

    const mainCard = (
        <div className="mx-auto max-w-6xl space-y-4">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Detail Materi
                            </p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                                {material.title}
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                {typeLabel(material)}
                                {material.subject?.name ? ` • ${material.subject.name}` : ""}
                                {classLabel ? ` • ${classLabel}` : ""}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {fileUrl && (
                                <>
                                    <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        Pratinjau
                                    </a>
                                    <a
                                        href={downloadUrl || fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                        {isRemote ? "Buka Tautan" : "Unduh"}
                                    </a>
                                </>
                            )}
                            {canManageMaterial && hasAnyPermission(["materials edit"]) && (
                                <Button
                                    type="edit"
                                    url={route("materials.edit", material.id)}
                                />
                            )}
                            {canManageMaterial && hasAnyPermission(["materials delete"]) && (
                                <Button
                                    type="delete"
                                    url={route("materials.destroy", material.id)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-x-8 gap-y-5 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Mata pelajaran
                        </span>
                        <p className="mt-1 text-sm text-slate-900">
                            {material.subject?.name || "—"}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Kelas
                        </span>
                        <p className="mt-1 text-sm text-slate-900">
                            {classLabel || "—"}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Tipe / MIME
                        </span>
                        <p className="mt-1">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">
                                {mimeLabel(material)}
                            </span>
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Status
                        </span>
                        <p className="mt-1">
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                                    material.is_active
                                        ? "bg-emerald-50 text-emerald-800 ring-emerald-200/80"
                                        : "bg-amber-50 text-amber-900 ring-amber-200/80"
                                }`}
                            >
                                {material.is_active ? "Aktif" : "Tidak aktif"}
                            </span>
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Diunggah oleh
                        </span>
                        <p className="mt-1 text-sm text-slate-900">
                            {material.uploader?.name || "—"}
                        </p>
                    </div>
                    <div className="md:col-span-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Deskripsi
                        </span>
                        <p className="mt-1 text-sm text-slate-800">
                            {material.description?.trim()
                                ? material.description
                                : "Tidak ada deskripsi"}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Nama berkas
                        </span>
                        <p className="mt-1 break-all text-sm text-slate-900">
                            {material.file_name || "—"}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                            Diperbarui
                        </span>
                        <p className="mt-1 text-sm text-slate-900">
                            {new Date(material.updated_at).toLocaleString("id-ID")}
                        </p>
                    </div>
                </div>
            </section>

            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Pratinjau materi
                    </h3>
                </div>
                <div className="px-6 py-5">{renderPreview()}</div>
            </section>
        </div>
    );

    return (
        <DashboardLayout title={`Detail Materi: ${material.title}`}>
            <Head title={`Detail Materi: ${material.title}`} />

            {isStudent ? (
                <StudentShell
                    eyebrow="Materi pembelajaran"
                    title={material.title}
                    subtitle={`${typeLabel(material)}${
                        material.subject?.name
                            ? ` · ${material.subject.name}`
                            : ""
                    }${classLabel ? ` · ${classLabel}` : ""}`}
                >
                    <Link
                        href={route("materials.index")}
                        className="inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                        Kembali ke daftar materi
                    </Link>
                    {mainCard}
                </StudentShell>
            ) : (
                mainCard
            )}
        </DashboardLayout>
    );
}
