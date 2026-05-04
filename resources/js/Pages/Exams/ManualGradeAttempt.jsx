import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { IconArrowLeft } from "@tabler/icons-react";
import Swal from "sweetalert2";

export default function ManualGradeAttempt() {
    const { exam, attempt, essayAnswers = [] } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        grades: essayAnswers.map((a) => ({
            answer_id: a.id,
            points_awarded:
                a.points_awarded != null ? String(a.points_awarded) : "",
            teacher_feedback: a.teacher_feedback ?? "",
        })),
    });

    const submit = (e) => {
        e.preventDefault();
        post(
            route("exams.manual-grade.save", {
                exam: exam.id,
                attempt: attempt.id,
            }),
            {
                onSuccess: async () => {
                    await Swal.fire({
                        title: "Nilai telah diberikan",
                        text: "Penilaian esai ujian berhasil disimpan.",
                        icon: "success",
                        confirmButtonColor: "#4f46e5",
                    });
                },
            }
        );
    };

    const sc = exam.school_class ?? exam.schoolClass;

    return (
        <DashboardLayout title={`Nilai esai — ${exam.title}`}>
            <Head title={`Nilai esai — ${exam.title}`} />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Penilaian esai ujian
                                </p>
                                <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                                    {exam.title}
                                </h1>
                                <p className="mt-1 text-sm text-slate-600">
                                    {sc?.name ?? "—"} ·{" "}
                                    {attempt.student?.name ?? "Siswa"}
                                </p>
                            </div>
                            <Link
                                href={route("exams.show", exam.id)}
                                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <IconArrowLeft className="h-4 w-4" stroke={1.5} />
                                Kembali ke detail ujian
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-3">
                        <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Jumlah jawaban esai
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                {essayAnswers.length}
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Attempt
                            </p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">
                                #{attempt.id}
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                            </p>
                            <p className="mt-1 text-sm font-semibold text-amber-700">
                                Menunggu penilaian esai
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {essayAnswers.map((ans, idx) => {
                        const max = Number(ans.question?.points ?? 1);
                        const g = data.grades[idx];
                        return (
                            <div
                                key={ans.id}
                                className="rounded-lg border border-slate-200 bg-white p-6"
                            >
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Soal esai · maks. {max} poin
                                </p>
                                <p className="mt-2 font-medium text-slate-900">
                                    {ans.question?.question_text}
                                </p>
                                {ans.question?.explanation ? (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Catatan guru (pembuatan):{" "}
                                        {ans.question.explanation}
                                    </p>
                                ) : null}
                                <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold text-slate-500">
                                        Jawaban siswa
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                                        {ans.answer?.trim()
                                            ? ans.answer
                                            : "(kosong)"}
                                    </p>
                                </div>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-semibold uppercase text-slate-500">
                                            Nilai (0 – {max})
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            max={max}
                                            step="0.01"
                                            required
                                            onWheel={(e) =>
                                                e.currentTarget.blur()
                                            }
                                            value={g?.points_awarded ?? ""}
                                            onChange={(e) => {
                                                const next = [
                                                    ...data.grades,
                                                ];
                                                next[idx] = {
                                                    ...next[idx],
                                                    points_awarded:
                                                        e.target.value,
                                                };
                                                setData("grades", next);
                                            }}
                                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="text-xs font-semibold uppercase text-slate-500">
                                        Feedback untuk siswa (opsional)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={g?.teacher_feedback ?? ""}
                                        onChange={(e) => {
                                            const next = [
                                                ...data.grades,
                                            ];
                                            next[idx] = {
                                                ...next[idx],
                                                teacher_feedback:
                                                    e.target.value,
                                            };
                                            setData("grades", next);
                                        }}
                                        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                                    />
                                </div>
                            </div>
                        );
                    })}

                    {errors.grades && (
                        <p className="text-sm text-rose-600">{errors.grades}</p>
                    )}

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-md bg-[#163d8f] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f2e6f] disabled:opacity-50 sm:w-auto sm:px-8"
                    >
                        {processing ? "Menyimpan…" : "Simpan semua nilai esai"}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}

