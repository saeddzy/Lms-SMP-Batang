import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Card from "@/Components/Card";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import Swal from "sweetalert2";

function getXsrfToken() {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : "";
}

function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ExamAttempt({ exam, attempt, timeRemaining }) {
    const questions = useMemo(
        () => [...(exam.questions ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [exam.questions]
    );

    const [answers, setAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Number(timeRemaining) || 0));
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setSecondsLeft(Math.max(0, Number(timeRemaining) || 0));
    }, [timeRemaining]);

    useEffect(() => {
        const id = setInterval(() => {
            setSecondsLeft((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const setAnswer = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const submit = async () => {
        setSubmitting(true);
        try {
            const url = route("exams.submit-attempt", {
                exam: exam.id,
                attempt: attempt.id,
            });
            const { data } = await axios.post(
                url,
                { answers },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-XSRF-TOKEN": getXsrfToken(),
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    withCredentials: true,
                }
            );
            if (data.success) {
                await Swal.fire({
                    title: "Selesai",
                    html: `Nilai: <strong>${data.score}%</strong><br/>${
                        data.passed ? "Lulus" : "Belum lulus"
                    }`,
                    icon: data.passed ? "success" : "info",
                    confirmButtonColor: "#1c1917",
                });
                router.visit(route("exams.show", exam.id));
            }
        } catch (e) {
            const msg =
                e.response?.data?.message ||
                e.response?.data?.error ||
                e.message ||
                "Gagal mengirim jawaban.";
            await Swal.fire({ title: "Gagal", text: msg, icon: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DashboardLayout title={`Ujian: ${exam.title}`}>
            <Head title={`Ujian: ${exam.title}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                    <span>
                        Sisa waktu: <strong className="tabular-nums">{formatTime(secondsLeft)}</strong>
                    </span>
                    {secondsLeft === 0 && (
                        <span className="font-medium text-red-700">Waktu habis — kirim jawaban segera.</span>
                    )}
                </div>

                <Card>
                    <Card.Header>
                        <Card.Title>{exam.title}</Card.Title>
                        {exam.instructions && (
                            <Card.Description className="whitespace-pre-wrap">
                                {exam.instructions}
                            </Card.Description>
                        )}
                    </Card.Header>

                    <Card.Content className="space-y-8">
                        {questions.map((q, idx) => (
                            <div
                                key={q.id}
                                className="border-b border-stone-200 pb-6 last:border-0 last:pb-0"
                            >
                                <p className="font-medium text-stone-900">
                                    {idx + 1}. {q.question_text}
                                </p>

                                {q.question_type === "multiple_choice" && Array.isArray(q.options) && (
                                    <div className="mt-3 space-y-2">
                                        {q.options.map((opt, i) => (
                                            <label
                                                key={i}
                                                className="flex cursor-pointer items-start gap-2 rounded-md border border-stone-200 p-3 hover:bg-stone-50"
                                            >
                                                <input
                                                    type="radio"
                                                    className="mt-1"
                                                    name={`q-${q.id}`}
                                                    value={String(i)}
                                                    checked={answers[q.id] === String(i)}
                                                    onChange={() => setAnswer(q.id, String(i))}
                                                />
                                                <span>
                                                    <span className="font-medium text-stone-600">
                                                        {String.fromCharCode(65 + i)}.{" "}
                                                    </span>
                                                    {opt}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.question_type === "true_false" && (
                                    <div className="mt-3 flex flex-wrap gap-4">
                                        {["true", "false"].map((v) => (
                                            <label
                                                key={v}
                                                className="flex cursor-pointer items-center gap-2"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`q-${q.id}`}
                                                    value={v}
                                                    checked={answers[q.id] === v}
                                                    onChange={() => setAnswer(q.id, v)}
                                                />
                                                {v === "true" ? "Benar" : "Salah"}
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.question_type === "short_answer" && (
                                    <textarea
                                        className="mt-3 block w-full rounded-md border border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        rows={4}
                                        value={answers[q.id] ?? ""}
                                        onChange={(e) => setAnswer(q.id, e.target.value)}
                                        placeholder="Tulis jawaban singkat"
                                    />
                                )}

                                {q.question_type === "essay" && (
                                    <div className="mt-3 space-y-2">
                                        <p className="text-xs text-stone-600">
                                            Soal esai — dinilai guru setelah Anda
                                            mengirim jawaban.
                                        </p>
                                        <textarea
                                            className="block w-full rounded-md border border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            rows={10}
                                            value={answers[q.id] ?? ""}
                                            onChange={(e) =>
                                                setAnswer(
                                                    q.id,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Tulis jawaban Anda di sini…"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}

                        {questions.length === 0 && (
                            <p className="text-stone-600">
                                Belum ada soal untuk ujian ini. Hubungi guru Anda.
                            </p>
                        )}
                    </Card.Content>

                    <Card.Footer className="flex flex-wrap items-center justify-between gap-3">
                        <button
                            type="button"
                            className="inline-flex rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                            onClick={() =>
                                router.visit(route("exams.show", exam.id))
                            }
                        >
                            Kembali
                        </button>
                        <button
                            type="button"
                            disabled={submitting || questions.length === 0}
                            onClick={submit}
                            className="inline-flex items-center rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-stone-800 disabled:opacity-50"
                        >
                            {submitting ? "Mengirim…" : "Kirim jawaban"}
                        </button>
                    </Card.Footer>
                </Card>
            </div>
        </DashboardLayout>
    );
}
