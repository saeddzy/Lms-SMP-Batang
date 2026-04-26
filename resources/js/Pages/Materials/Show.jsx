import React, { useEffect, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell from "@/Components/Student/StudentShell";
import Button from "@/Components/Button";
import { Head, Link, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";
import { hasRole } from "@/Utils/Permissions";
import { materialClassName } from "@/Utils/materialClassName";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

function typeLabel(material) {
    if (material.type_label) return material.type_label;
    const t = material.material_type ?? material.type;
    if (t === "video") return "Video";
    if (t === "pdf") return "Dokumen";
    return t ?? "—";
}

function mimeLabel(material) {
    if (material.mime_type && material.mime_type !== "application/x-url") {
        return material.mime_type;
    }
    return typeLabel(material);
}

function fileExtension(material) {
    const fromName = String(material.file_name || "")
        .toLowerCase()
        .split(".")
        .pop();

    if (fromName && fromName !== String(material.file_name || "").toLowerCase()) {
        return fromName;
    }

    const mime = String(material.mime_type || "").toLowerCase();
    if (mime.includes("word")) return "docx";
    if (mime.includes("presentation")) return "pptx";
    if (mime.includes("excel") || mime.includes("spreadsheetml")) return "xlsx";
    if (mime === "text/csv") return "csv";
    if (mime === "application/pdf") return "pdf";
    return "";
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
    const isDocumentType = (material.material_type ?? material.type) === "pdf";
    const isPdfMime =
        String(material.mime_type || "").toLowerCase() === "application/pdf" ||
        String(material.file_name || "").toLowerCase().endsWith(".pdf");
    const ext = fileExtension(material);
    const isOfficeLike = ["doc", "docx", "ppt", "pptx", "xls", "xlsx", "csv"].includes(ext);
    const canUseRemoteViewer = Boolean(fileUrl && isRemote);
    const officeViewerUrl = canUseRemoteViewer
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
        : null;
    const googleViewerUrl = canUseRemoteViewer
        ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(fileUrl)}`
        : null;
    const classLabel = materialClassName(material);
    const [docxPreview, setDocxPreview] = useState("");
    const [docxPreviewLoading, setDocxPreviewLoading] = useState(false);
    const [docxPreviewError, setDocxPreviewError] = useState("");
    const [sheetPreview, setSheetPreview] = useState([]);
    const [sheetPreviewLoading, setSheetPreviewLoading] = useState(false);
    const [sheetPreviewError, setSheetPreviewError] = useState("");

    const isLocalDocx = isDocumentType && !isRemote && (ext === "docx" || ext === "doc");
    const isLocalSheet = isDocumentType && !isRemote && ["xls", "xlsx", "csv"].includes(ext);

    useEffect(() => {
        let cancelled = false;

        const loadDocxPreview = async () => {
            if (!isLocalDocx || !fileUrl) {
                setDocxPreview("");
                setDocxPreviewError("");
                setDocxPreviewLoading(false);
                return;
            }

            try {
                setDocxPreviewLoading(true);
                setDocxPreviewError("");

                const response = await fetch(fileUrl, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil file dokumen.");
                }

                const arrayBuffer = await response.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });

                if (cancelled) return;
                setDocxPreview(result.value || "<p>Tidak ada konten yang bisa ditampilkan.</p>");
            } catch (error) {
                if (cancelled) return;
                setDocxPreview("");
                setDocxPreviewError(
                    "Pratinjau DOCX belum bisa ditampilkan. Gunakan tombol Unduh/Pratinjau untuk membuka file."
                );
            } finally {
                if (!cancelled) {
                    setDocxPreviewLoading(false);
                }
            }
        };

        loadDocxPreview();

        return () => {
            cancelled = true;
        };
    }, [isLocalDocx, fileUrl]);

    useEffect(() => {
        let cancelled = false;

        const loadSheetPreview = async () => {
            if (!isLocalSheet || !fileUrl) {
                setSheetPreview([]);
                setSheetPreviewError("");
                setSheetPreviewLoading(false);
                return;
            }

            try {
                setSheetPreviewLoading(true);
                setSheetPreviewError("");

                const response = await fetch(fileUrl, {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Gagal mengambil file spreadsheet.");
                }

                let rows = [];
                if (ext === "csv") {
                    const text = await response.text();
                    rows = text
                        .split(/\r?\n/)
                        .filter((line) => line.trim() !== "")
                        .slice(0, 101)
                        .map((line) => line.split(",").slice(0, 20));
                } else {
                    const arrayBuffer = await response.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: "array" });
                    const firstSheetName = workbook.SheetNames[0];
                    const firstSheet = workbook.Sheets[firstSheetName];
                    rows = XLSX.utils.sheet_to_json(firstSheet, {
                        header: 1,
                        defval: "",
                        blankrows: false,
                    }).slice(0, 101).map((row) => row.slice(0, 20));
                }

                if (cancelled) return;
                setSheetPreview(rows);
            } catch (error) {
                if (cancelled) return;
                setSheetPreview([]);
                setSheetPreviewError(
                    "Pratinjau spreadsheet belum bisa ditampilkan. Gunakan tombol Unduh/Pratinjau untuk membuka file."
                );
            } finally {
                if (!cancelled) {
                    setSheetPreviewLoading(false);
                }
            }
        };

        loadSheetPreview();

        return () => {
            cancelled = true;
        };
    }, [isLocalSheet, fileUrl, ext]);

    const renderPreview = () => {
        if (!material.file_path || !fileUrl) {
            return (
                <p className="text-sm text-stone-500">
                    Belum ada berkas atau tautan untuk materi ini.
                </p>
            );
        }

        if (isDocumentType && isPdfMime) {
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

        if (isDocumentType && !isPdfMime) {
            if (isLocalDocx) {
                return (
                    <div className="mt-2 rounded-lg border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-stone-600">
                            Pratinjau dokumen Word
                        </div>
                        <div className="max-h-[70vh] overflow-auto p-5">
                            {docxPreviewLoading ? (
                                <p className="text-sm text-slate-500">Memuat pratinjau dokumen...</p>
                            ) : docxPreviewError ? (
                                <p className="text-sm text-slate-600">{docxPreviewError}</p>
                            ) : (
                                <div
                                    className="prose prose-sm max-w-none text-slate-800"
                                    dangerouslySetInnerHTML={{ __html: docxPreview }}
                                />
                            )}
                        </div>
                    </div>
                );
            }

            if (isLocalSheet) {
                return (
                    <div className="mt-2 rounded-lg border border-stone-200 bg-white">
                        <div className="border-b border-stone-200 bg-stone-50 px-4 py-2 text-xs font-medium text-stone-600">
                            Pratinjau spreadsheet (maks. 100 baris pertama)
                        </div>
                        <div className="max-h-[70vh] overflow-auto p-4">
                            {sheetPreviewLoading ? (
                                <p className="text-sm text-slate-500">Memuat pratinjau spreadsheet...</p>
                            ) : sheetPreviewError ? (
                                <p className="text-sm text-slate-600">{sheetPreviewError}</p>
                            ) : sheetPreview.length === 0 ? (
                                <p className="text-sm text-slate-600">Tidak ada data yang bisa ditampilkan.</p>
                            ) : (
                                <table className="min-w-full border-collapse text-sm">
                                    <tbody>
                                        {sheetPreview.map((row, rowIdx) => (
                                            <tr key={`r-${rowIdx}`} className="border-b border-slate-100">
                                                {row.map((cell, colIdx) => (
                                                    <td
                                                        key={`c-${rowIdx}-${colIdx}`}
                                                        className={`px-3 py-2 align-top ${
                                                            rowIdx === 0
                                                                ? "bg-slate-50 font-semibold text-slate-800"
                                                                : "text-slate-700"
                                                        }`}
                                                    >
                                                        {String(cell ?? "")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                );
            }

            if (isOfficeLike && canUseRemoteViewer) {
                return (
                    <div className="space-y-3">
                        <div className="rounded-lg border border-stone-200 bg-stone-50 overflow-hidden">
                            <iframe
                                title={`${material.title} preview`}
                                src={officeViewerUrl}
                                className="h-[min(70vh,720px)] w-full"
                            />
                        </div>
                        <p className="text-xs text-slate-500">
                            Jika pratinjau kosong, buka fallback viewer Google.
                            {" "}
                            <a
                                href={googleViewerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-[#163d8f] hover:underline"
                            >
                                Buka fallback
                            </a>
                        </p>
                    </div>
                );
            }

            return (
                <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p>Pratinjau langsung untuk format ini belum tersedia pada file lokal/protected route.</p>
                    <p>Gunakan tombol <strong>Unduh</strong> atau <strong>Pratinjau</strong> untuk membuka file.</p>
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
                            <Link
                                href={route("materials.index")}
                                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                            >
                                Kembali
                            </Link>
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
