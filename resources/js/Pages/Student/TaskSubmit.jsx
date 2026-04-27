import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell from "@/Components/Student/StudentShell";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Input from "@/Components/Input";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    IconClock,
    IconFile,
    IconFileUpload,
    IconSparkles,
    IconTrash,
    IconExternalLink,
    IconRefresh,
} from "@tabler/icons-react";

function formatBytes(bytes) {
    if (bytes == null || Number.isNaN(Number(bytes))) return "—";
    const n = Number(bytes);
    if (n === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(n) / Math.log(k));
    return `${parseFloat((n / Math.pow(k, i)).toFixed(n >= k && i > 0 ? 1 : 0))} ${sizes[i]}`;
}

function storageUrl(path) {
    if (!path || String(path).startsWith("http")) return path || "#";
    return `/storage/${String(path).replace(/^\/+/, "")}`;
}

export default function TaskSubmit() {
    const { task, submission } = usePage().props;
    const [celebrate, setCelebrate] = useState(false);
    const [fileInputKey, setFileInputKey] = useState(0);
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, progress, transform } =
        useForm({
            content: submission?.content ?? "",
            youtube_url: submission?.youtube_url ?? "",
            file: null,
            remove_file: false,
        });

    const hasExistingFile =
        Boolean(submission?.file_path) && !data.remove_file;

    const handleSubmit = (e) => {
        e.preventDefault();
        transform((form) => ({
            ...form,
            remove_file: form.remove_file ? 1 : 0,
        }));
        post(route("tasks.submit", task.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setCelebrate(true);
                setData("file", null);
                setData("remove_file", false);
                setFileInputKey((k) => k + 1);
            },
        });
    };

    const clearPendingFile = () => {
        setData("file", null);
        setFileInputKey((k) => k + 1);
    };

    const removeExistingFile = () => {
        setData("remove_file", true);
        setData("file", null);
        setFileInputKey((k) => k + 1);
    };

    const undoRemoveExisting = () => {
        setData("remove_file", false);
    };

    useEffect(() => {
        if (!celebrate) return undefined;
        const t = setTimeout(() => setCelebrate(false), 4500);
        return () => clearTimeout(t);
    }, [celebrate]);

    const due = task.due_date ? new Date(task.due_date) : null;

    return (
        <DashboardLayout title={`Kumpulkan: ${task.title}`}>
            <Head title={`Kumpulkan: ${task.title}`} />

            <StudentShell
                eyebrow="Pengumpulan tugas"
                title={task.title}
                subtitle={
                    task.subject?.name
                        ? `${task.subject.name}${
                              task.school_class?.name
                                  ? ` · ${task.school_class.name}`
                                  : ""
                          }`
                        : "Kumpulkan jawaban Anda di bawah ini."
                }
            >
                {celebrate ? (
                    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
                        <div className="flex max-w-sm flex-col items-center rounded-3xl bg-white px-8 py-10 text-center shadow-2xl ring-1 ring-emerald-200/80">
                            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
                                <IconSparkles
                                    className="h-9 w-9"
                                    stroke={1.5}
                                />
                            </span>
                            <p className="mt-4 text-lg font-bold text-slate-900">
                                Berhasil dikirim!
                            </p>
                            <p className="mt-2 text-sm text-slate-600">
                                Pengumpulan tugas Anda telah tersimpan.
                            </p>
                        </div>
                    </div>
                ) : null}

                <div className="mx-auto max-w-3xl">
                    <section
                        id="ringkasan-tugas"
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5"
                    >
                        <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h2 className="line-clamp-1 text-2xl font-bold tracking-tight text-slate-900">
                                        {task.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {task.subject?.name ?? "Mapel belum diatur"} ·{" "}
                                        {task.school_class?.name ?? "Kelas belum diatur"}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                                        {due && (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">
                                                <IconClock className="h-3.5 w-3.5" />
                                                Deadline {due.toLocaleString("id-ID", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-1 ring-1 ring-slate-200">
                                            <IconFile className="h-3.5 w-3.5" />
                                            {submission ? "Edit Pengumpulan" : "Pengumpulan Baru"}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
                                        due && new Date() > due
                                            ? "bg-rose-50 text-rose-900 ring-rose-200/80"
                                            : due && new Date() <= due
                                                ? "bg-emerald-50 text-emerald-900 ring-emerald-200/80"
                                                : "bg-slate-50 text-slate-900 ring-slate-200/80"
                                    }`}
                                >
                                    {due && new Date() > due
                                        ? "Terlewat"
                                        : due && new Date() <= due
                                            ? "Aktif"
                                            : "Tanpa Deadline"}
                                </span>
                            </div>
                        </div>

                        <div
                            className={`rounded-xl border p-4 text-sm shadow-sm ${
                                due && new Date() > due
                                    ? "border-rose-200 bg-rose-50 text-rose-950"
                                    : due && new Date() <= due
                                        ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                                        : "border-slate-200 bg-slate-50 text-slate-800"
                            }`}
                        >
                            <p className="inline-flex items-center gap-2 font-semibold">
                                <IconClock className="h-4 w-4" />
                                {due && new Date() > due
                                    ? "Deadline sudah terlewat"
                                    : due && new Date() <= due
                                        ? "Pengumpulan masih dibuka"
                                        : "Tugas tanpa deadline"}
                            </p>
                            <p className="mt-1 opacity-90">
                                {due && new Date() > due
                                    ? "Waktu pengumpulan sudah berakhir"
                                    : due && new Date() <= due
                                        ? "Anda masih bisa mengumpulkan tugas"
                                        : "Tugas dapat dikumpulkan kapan saja"}
                                {due && ` · Deadline: ${due.toLocaleString("id-ID", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                })}`}
                            </p>
                        </div>

                        {task.description ? (
                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-slate-900">
                                    Deskripsi Tugas
                                </h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                                    {task.description}
                                </p>
                            </div>
                        ) : null}
                    </section>

                    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Pengumpulan Tugas</h3>
                            <p className="mt-1 text-sm text-slate-600">
                                Minimal salah satu: teks jawaban, lampiran (PDF, PPT, gambar, Excel, maks. 20 MB), atau tautan video YouTube.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-5">
                                <div>
                                    <Input.Label
                                        htmlFor="content"
                                        value="Jawaban / keterangan (teks, opsional jika ada berkas/YouTube)"
                                    />
                                    <textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) =>
                                            setData("content", e.target.value)
                                        }
                                        rows={10}
                                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                        placeholder="Tulis jawaban, ringkasan, atau catatan pengerjaan di sini."
                                    />
                                    <Input.Error message={errors.content} />
                                </div>

                                <div>
                                    <Input.Label
                                        htmlFor="file"
                                        value="Lampiran berkas (opsional)"
                                    />

                                    {/* Berkas yang sudah tersimpan sebelumnya */}
                                    {hasExistingFile ? (
                                        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-indigo-200/90 bg-indigo-50/90 px-4 py-3 ring-1 ring-indigo-100">
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                                                    <IconFile
                                                        className="h-6 w-6"
                                                        stroke={1.5}
                                                    />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800/80">
                                                        Berkas terpasang
                                                    </p>
                                                    <p className="truncate font-medium text-slate-900">
                                                        {submission.file_name}
                                                    </p>
                                                    <p className="text-xs text-slate-600">
                                                        {formatBytes(
                                                            submission.file_size
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <a
                                                    href={storageUrl(
                                                        submission.file_path
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-indigo-800 shadow-sm hover:bg-indigo-50"
                                                >
                                                    <IconExternalLink
                                                        className="h-4 w-4"
                                                        stroke={1.5}
                                                    />
                                                    Buka
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={removeExistingFile}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-900 hover:bg-rose-100"
                                                >
                                                    <IconTrash
                                                        className="h-4 w-4"
                                                        stroke={1.5}
                                                    />
                                                    Hapus
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    {data.remove_file &&
                                    submission?.file_path &&
                                    !data.file ? (
                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-100">
                                            <span>
                                                Lampiran lama akan{" "}
                                                <strong>dihapus</strong> saat
                                                Anda menyimpan.
                                            </span>
                                            <button
                                                type="button"
                                                onClick={undoRemoveExisting}
                                                className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100"
                                            >
                                                Batalkan hapus
                                            </button>
                                        </div>
                                    ) : null}

                                    {/* Preview berkas baru (belum dikirim) */}
                                    {data.file ? (
                                        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 ring-1 ring-emerald-100">
                                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                                                    <IconFileUpload
                                                        className="h-6 w-6"
                                                        stroke={1.5}
                                                    />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900/80">
                                                        Akan diunggah
                                                    </p>
                                                    <p className="truncate font-medium text-slate-900">
                                                        {data.file.name}
                                                    </p>
                                                    <p className="text-xs text-slate-600">
                                                        {formatBytes(
                                                            data.file.size
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"
                                                >
                                                    <IconRefresh
                                                        className="h-4 w-4"
                                                        stroke={1.5}
                                                    />
                                                    Ganti berkas
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={clearPendingFile}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                    <IconTrash
                                                        className="h-4 w-4"
                                                        stroke={1.5}
                                                    />
                                                    Buang
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}

                                    <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 transition hover:border-indigo-300 hover:bg-indigo-50/30">
                                        <IconFileUpload
                                            className="h-10 w-10 text-slate-400"
                                            stroke={1.25}
                                        />
                                        <span className="mt-2 text-sm font-medium text-slate-700">
                                            {data.file
                                                ? "Pilih berkas lain"
                                                : "Klik untuk memilih berkas"}
                                        </span>
                                        <span className="mt-1 text-center text-xs text-slate-500">
                                            PDF, PPT/PPTX, JPG/PNG/GIF/WebP,
                                            XLS/XLSX — maks. 20 MB
                                        </span>
                                        <input
                                            key={fileInputKey}
                                            ref={fileInputRef}
                                            id="file"
                                            type="file"
                                            className="sr-only"
                                            accept=".pdf,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/*,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                            onChange={(e) => {
                                                const f =
                                                    e.target.files?.[0] ?? null;
                                                setData("file", f);
                                                if (f) {
                                                    setData(
                                                        "remove_file",
                                                        false
                                                    );
                                                }
                                            }}
                                        />
                                    </label>
                                    <Input.Error message={errors.file} />
                                </div>

                                <div>
                                    <Input.Label
                                        htmlFor="youtube_url"
                                        value="Tautan video YouTube (opsional)"
                                    />
                                    <input
                                        id="youtube_url"
                                        type="url"
                                        value={data.youtube_url}
                                        onChange={(e) =>
                                            setData(
                                                "youtube_url",
                                                e.target.value
                                            )
                                        }
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                    />
                                    <Input.Error message={errors.youtube_url} />
                                </div>

                                {progress ? (
                                    <p className="text-sm text-slate-600">
                                        Mengunggah…{" "}
                                        {typeof progress === "number"
                                            ? progress
                                            : (progress.percentage ?? 0)}
                                        %
                                    </p>
                                ) : null}
                            </div>

                            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-6">
                                <Button
                                    type="cancel"
                                    url={route("student.tasks")}
                                />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50"
                                >
                                    {processing
                                        ? "Mengirim…"
                                        : submission
                                          ? "Perbarui pengumpulan"
                                          : "Kumpulkan tugas"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </StudentShell>
        </DashboardLayout>
    );
}
