import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { IconArrowLeft } from "@tabler/icons-react";
import Swal from "sweetalert2";

export default function ManualGradeAttempt() {
    const { quiz, attempt, essayAnswers = [] } = usePage().props;

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
            route("quizzes.manual-grade.save", {
                quiz: quiz.id,
                attempt: attempt.id,
            }),
            {
                onSuccess: async () => {
                    await Swal.fire({
                        title: "Nilai telah diberikan",
                        text: "Penilaian esai kuis berhasil disimpan.",
                        icon: "success",
                        confirmButtonColor: "#4f46e5",
                    });
                },
            }
        );
    };

    const sc = quiz.school_class ?? quiz.schoolClass;

    return (
        <DashboardLayout title={`Nilai esai — ${quiz.title}`}>
            <Head title={`Nilai esai — ${quiz.title}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                <Link
                    href={route("quizzes.show", quiz.id)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                    <IconArrowLeft className="h-4 w-4" stroke={1.5} />
                    Kembali ke kuis
                </Link>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h1 className="text-xl font-bold text-slate-900">
                        Penilaian esai
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        {quiz.title} · {sc?.name ?? "—"} ·{" "}
                        {attempt.student?.name ?? "Siswa"}
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {essayAnswers.map((ans, idx) => {
                        const max = Number(ans.question?.points ?? 1);
                        const g = data.grades[idx];
                        return (
                            <div
                                key={ans.id}
                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
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
                                            className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                                        className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
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
                        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 sm:w-auto sm:px-8"
                    >
                        {processing ? "Menyimpan…" : "Simpan semua nilai esai"}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}

