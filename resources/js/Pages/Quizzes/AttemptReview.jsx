import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import { IconArrowLeft } from "@tabler/icons-react";
import { formatStudentDateTime } from "@/Components/Student/StudentShell";

function optionLetter(idx) {
    if (!Number.isFinite(Number(idx))) return "";
    return String.fromCharCode(65 + Number(idx));
}

function renderStudentMcqAnswer(question, raw) {
    if (raw == null || raw === "") return "—";
    const idx = Number(raw);
    if (!Number.isFinite(idx) || !question.options?.[idx]) {
        return String(raw);
    }
    return `${optionLetter(idx)}. ${question.options[idx]}`;
}

function renderCorrectMcq(question) {
    const idx = Number(question.correct_answer);
    if (!Number.isFinite(idx) || !question.options?.[idx]) {
        return question.correct_answer ?? "—";
    }
    return `${optionLetter(idx)}. ${question.options[idx]}`;
}

function tfLabel(raw) {
    const v = String(raw ?? "")
        .trim()
        .toLowerCase();
    if (["true", "t", "1", "benar", "b"].includes(v)) return "Benar";
    if (["false", "f", "0", "salah", "s"].includes(v)) return "Salah";
    return raw || "—";
}

export default function AttemptReview() {
    const { quiz, attempt } = usePage().props;

    const answersByQuestionId = useMemo(() => {
        const m = new Map();
        (attempt.answers ?? []).forEach((a) => {
            m.set(a.question_id, a);
        });
        return m;
    }, [attempt.answers]);

    const questions = useMemo(
        () => [...(quiz.questions ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [quiz.questions]
    );

    const sc = quiz.school_class ?? quiz.schoolClass;

    return (
        <DashboardLayout title={`Jawaban siswa — ${quiz.title}`}>
            <Head title={`Review percobaan — ${quiz.title}`} />

            <div className="mx-auto max-w-5xl space-y-6">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Review percobaan kuis
                                </p>
                                <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                                    {quiz.title}
                                </h1>
                                <p className="mt-1 text-sm text-slate-600">
                                    {attempt.student?.name ?? "Siswa"} · {sc?.name ?? "—"} · Attempt #
                                    {attempt.id}
                                </p>
                            </div>
                            <Link
                                href={route("quizzes.show", quiz.id)}
                                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                <IconArrowLeft className="h-4 w-4" stroke={1.5} />
                                Kembali ke detail kuis
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Mulai
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {attempt.started_at
                                    ? formatStudentDateTime(attempt.started_at)
                                    : "—"}
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Selesai
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-900">
                                {attempt.finished_at
                                    ? formatStudentDateTime(attempt.finished_at)
                                    : "—"}
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Nilai
                            </p>
                            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
                                {attempt.score != null ? `${attempt.score}%` : "—"}
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Lulus
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">
                                {attempt.passed === true ? (
                                    <span className="text-emerald-700">Ya</span>
                                ) : attempt.passed === false ? (
                                    <span className="text-rose-700">Tidak</span>
                                ) : (
                                    <span className="text-amber-700">Menunggu penilaian</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {questions.map((q, i) => {
                        const ans = answersByQuestionId.get(q.id);
                        const type = q.question_type ?? "multiple_choice";

                        return (
                            <section
                                key={q.id}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                            Soal {i + 1} ·{" "}
                                            {type === "multiple_choice"
                                                ? "Pilihan ganda"
                                                : type === "true_false"
                                                  ? "Benar / salah"
                                                  : type === "short_answer"
                                                    ? "Jawaban singkat"
                                                    : type === "essay"
                                                      ? "Esai"
                                                      : type}
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-slate-900">
                                            {q.question_text}
                                        </p>
                                    </div>
                                    {ans && type !== "essay" && (
                                        <span
                                            className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                                ans.is_correct
                                                    ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                                                    : "bg-rose-50 text-rose-900 ring-rose-200"
                                            }`}
                                        >
                                            {ans.is_correct ? "Benar" : "Salah"}
                                        </span>
                                    )}
                                    {type === "essay" && ans?.points_awarded != null && (
                                        <span className="inline-flex shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-900 ring-1 ring-indigo-200">
                                            {ans.points_awarded} / {q.points ?? 0} poin
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 space-y-3 text-sm">
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                            Jawaban siswa
                                        </p>
                                        <div className="mt-1 text-slate-800">
                                            {!ans ? (
                                                "—"
                                            ) : type === "multiple_choice" ? (
                                                renderStudentMcqAnswer(q, ans.answer)
                                            ) : type === "true_false" ? (
                                                tfLabel(ans.answer)
                                            ) : (
                                                <span className="whitespace-pre-wrap">
                                                    {ans.answer || "—"}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {type === "multiple_choice" || type === "true_false" ? (
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                Kunci / jawaban benar
                                            </p>
                                            <p className="mt-1 text-slate-700">
                                                {type === "multiple_choice"
                                                    ? renderCorrectMcq(q)
                                                    : tfLabel(q.correct_answer)}
                                            </p>
                                        </div>
                                    ) : null}

                                    {type === "essay" && ans?.teacher_feedback ? (
                                        <div className="rounded-lg border border-amber-100 bg-amber-50/80 px-3 py-2 text-amber-950">
                                            <p className="text-xs font-semibold uppercase">
                                                Umpan balik guru
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm">
                                                {ans.teacher_feedback}
                                            </p>
                                        </div>
                                    ) : null}

                                    {q.explanation ? (
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-slate-700">
                                            <p className="text-xs font-semibold uppercase text-slate-500">
                                                Pembahasan
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm">
                                                {q.explanation}
                                            </p>
                                        </div>
                                    ) : null}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </DashboardLayout>
    );
}
