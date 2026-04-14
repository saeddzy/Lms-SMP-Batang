import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell from "@/Components/Student/StudentShell";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Input from "@/Components/Input";
import { Head, useForm, usePage } from "@inertiajs/react";
import { IconClock, IconFileUpload } from "@tabler/icons-react";

export default function TaskSubmit() {
    const { task, submission } = usePage().props;

    const { data, setData, post, processing, errors, progress } = useForm({
        content: submission?.content ?? "",
        file: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("tasks.submit", task.id), {
            forceFormData: true,
        });
    };

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
                <div className="mx-auto max-w-3xl">
                    <Card>
                        <Card.Header>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <Card.Title>Pengumpulan</Card.Title>
                                    <Card.Description>
                                        Teks wajib; lampiran opsional (PDF, gambar,
                                        dokumen).
                                    </Card.Description>
                                </div>
                                {due ? (
                                    <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200/80">
                                        <IconClock
                                            className="h-5 w-5 shrink-0"
                                            stroke={1.5}
                                        />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/90">
                                                Deadline
                                            </p>
                                            <p className="font-medium">
                                                {due.toLocaleString("id-ID", {
                                                    dateStyle: "medium",
                                                    timeStyle: "short",
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </Card.Header>

                        <form onSubmit={handleSubmit}>
                            <Card.Content className="space-y-5">
                                {task.description ? (
                                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-800">
                                        <p className="font-semibold text-slate-900">
                                            Instruksi tugas
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                                            {task.description}
                                        </p>
                                    </div>
                                ) : null}

                                <div>
                                    <Input.Label
                                        htmlFor="content"
                                        value="Jawaban / keterangan (teks)"
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
                                    <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 transition hover:border-indigo-300 hover:bg-indigo-50/30">
                                        <IconFileUpload
                                            className="h-10 w-10 text-slate-400"
                                            stroke={1.25}
                                        />
                                        <span className="mt-2 text-sm font-medium text-slate-700">
                                            Klik untuk memilih berkas
                                        </span>
                                        <span className="mt-1 text-xs text-slate-500">
                                            atau seret ke area ini
                                        </span>
                                        <input
                                            id="file"
                                            type="file"
                                            className="sr-only"
                                            onChange={(e) =>
                                                setData(
                                                    "file",
                                                    e.target.files?.[0] ??
                                                        null
                                                )
                                            }
                                        />
                                    </label>
                                    <Input.Error message={errors.file} />
                                    {submission?.file_name ? (
                                        <p className="mt-2 text-xs text-slate-500">
                                            Berkas terunggah sebelumnya:{" "}
                                            <span className="font-medium text-slate-700">
                                                {submission.file_name}
                                            </span>
                                        </p>
                                    ) : null}
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
                            </Card.Content>

                            <Card.Footer>
                                <div className="flex flex-wrap justify-end gap-3">
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
                            </Card.Footer>
                        </form>
                    </Card>
                </div>
            </StudentShell>
        </DashboardLayout>
    );
}
