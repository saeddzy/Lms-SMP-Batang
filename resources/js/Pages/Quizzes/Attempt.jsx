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

export default function QuizAttempt({ quiz, attempt, timeRemaining }) {
    const questions = useMemo(
        () => [...(quiz.questions ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [quiz.questions]
    );

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Number(timeRemaining) || 0));
    const [submitting, setSubmitting] = useState(false);
    const [jumping, setJumping] = useState(false);

    const draftKey = `quiz-attempt-draft-${attempt?.id ?? quiz?.id}`;

    useEffect(() => {
        setSecondsLeft(Math.max(0, Number(timeRemaining) || 0));
    }, [timeRemaining]);

    useEffect(() => {
        const id = setInterval(() => {
            setSecondsLeft((s) => Math.max(0, s - 1));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(draftKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
                setAnswers(parsed);
            }
        } catch (_) {
            // Abaikan draft rusak.
        }
    }, [draftKey]);

    useEffect(() => {
        try {
            localStorage.setItem(draftKey, JSON.stringify(answers));
        } catch (_) {
            // Abaikan jika storage penuh/terblokir.
        }
    }, [answers, draftKey]);

    const current = questions[currentQuestion];
    const progressPercent =
        questions.length > 0
            ? Math.round(((currentQuestion + 1) / questions.length) * 100)
            : 0;

    const isAnswered = (q) => {
        const state = answers[q.id];
        if (!state) return false;

        if (Array.isArray(q.options) && q.options.length > 0) {
            return (
                Array.isArray(state.selected_options) &&
                state.selected_options.length > 0
            );
        }

        return typeof state.answer === "string" && state.answer.trim() !== "";
    };

    const answeredCount = useMemo(
        () => questions.filter((q) => isAnswered(q)).length,
        [questions, answers]
    );

    const setAnswer = (questionId, answer, selectedOptions = null) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: {
                answer,
                selected_options: selectedOptions,
            },
        }));
    };

    const goToQuestion = async (targetIndex) => {
        if (
            targetIndex < 0 ||
            targetIndex >= questions.length ||
            targetIndex === currentQuestion
        ) {
            return;
        }
        setJumping(true);
        setCurrentQuestion(targetIndex);
        setJumping(false);
    };

    const submit = async () => {
        setSubmitting(true);
        try {
            const payloadAnswers = Object.entries(answers).reduce(
                (acc, [questionId, answerState]) => {
                    acc[questionId] =
                        typeof answerState?.answer === "string"
                            ? answerState.answer
                            : "";
                    return acc;
                },
                {}
            );

            const url = route("quizzes.submit-attempt", {
                quiz: quiz.id,
                attempt: attempt.id,
            });
            const { data } = await axios.post(
                url,
                { answers: payloadAnswers },
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
                localStorage.removeItem(draftKey);
                const waitingManual = Boolean(data.pending_manual_grading);
                await Swal.fire({
                    title: "Selesai",
                    html: waitingManual
                        ? `Nilai sementara: <strong>${data.score}%</strong><br/>Menunggu guru memberi nilai esai.`
                        : `Nilai: <strong>${data.score}%</strong><br/>${
                              data.passed ? "Lulus" : "Belum lulus"
                          }`,
                    icon: waitingManual ? "info" : data.passed ? "success" : "info",
                    confirmButtonColor: "#1c1917",
                });
                router.visit(route("quizzes.show", quiz.id));
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
        <DashboardLayout title={`Kerjakan: ${quiz.title}`}>
            <Head title={`Kerjakan: ${quiz.title}`} />

            <div className="mx-auto max-w-5xl space-y-6">
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
                        <Card.Title>{quiz.title}</Card.Title>
                        {quiz.instructions && (
                            <Card.Description className="whitespace-pre-wrap">
                                {quiz.instructions}
                            </Card.Description>
                        )}
                    </Card.Header>

                    <Card.Content className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-stone-600">
                                <span>
                                    Soal {Math.min(currentQuestion + 1, questions.length)} dari {questions.length}
                                </span>
                                <span>
                                    Terjawab {answeredCount}/{questions.length}
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-stone-200">
                                <div
                                    className="h-2 rounded-full bg-indigo-600 transition-all"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {current && (
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
                                <div className="rounded-xl border border-stone-200 p-4">
                                    <p className="font-medium text-stone-900">
                                        {currentQuestion + 1}. {current.question_text}
                                    </p>

                                    {current.question_type === "multiple_choice" &&
                                        Array.isArray(current.options) && (
                                            <div className="mt-3 space-y-2">
                                                {current.options.map((opt, i) => (
                                                    <label
                                                        key={i}
                                                        className="flex cursor-pointer items-start gap-2 rounded-md border border-stone-200 p-3 hover:bg-stone-50"
                                                    >
                                                        <input
                                                            type="radio"
                                                            className="mt-1"
                                                            name={`q-${current.id}`}
                                                            value={String(i)}
                                                            checked={
                                                                answers[current.id]?.answer ===
                                                                String(i)
                                                            }
                                                            onChange={() =>
                                                                setAnswer(
                                                                    current.id,
                                                                    String(i),
                                                                    [i]
                                                                )
                                                            }
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

                                    {current.question_type === "true_false" && (
                                        <div className="mt-3 flex flex-wrap gap-4">
                                            {["true", "false"].map((v) => (
                                                <label
                                                    key={v}
                                                    className="flex cursor-pointer items-center gap-2"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q-${current.id}`}
                                                        value={v}
                                                        checked={
                                                            answers[current.id]?.answer === v
                                                        }
                                                        onChange={() =>
                                                            setAnswer(current.id, v)
                                                        }
                                                    />
                                                    {v === "true" ? "Benar" : "Salah"}
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {current.question_type === "short_answer" && (
                                        <textarea
                                            className="mt-3 block w-full rounded-md border border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            rows={4}
                                            value={answers[current.id]?.answer ?? ""}
                                            onChange={(e) =>
                                                setAnswer(current.id, e.target.value)
                                            }
                                            placeholder="Tulis jawaban singkat"
                                        />
                                    )}

                                    {current.question_type === "essay" && (
                                        <div className="mt-3 space-y-2">
                                            <p className="text-xs text-stone-600">
                                                Soal esai - dinilai guru setelah Anda
                                                mengirim jawaban.
                                            </p>
                                            <textarea
                                                className="block w-full rounded-md border border-stone-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                rows={8}
                                                value={answers[current.id]?.answer ?? ""}
                                                onChange={(e) =>
                                                    setAnswer(
                                                        current.id,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Tulis jawaban Anda di sini..."
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                                    <p className="mb-2 text-xs font-semibold uppercase text-stone-500">
                                        Navigasi Soal
                                    </p>
                                    <div className="grid grid-cols-5 gap-2">
                                        {questions.map((q, idx) => {
                                            const active = idx === currentQuestion;
                                            const answered = isAnswered(q);
                                            const className = active
                                                ? "bg-indigo-600 text-white"
                                                : answered
                                                  ? "bg-emerald-600 text-white"
                                                  : "bg-slate-200 text-slate-700";
                                            return (
                                                <button
                                                    key={q.id}
                                                    type="button"
                                                    onClick={() => goToQuestion(idx)}
                                                    className={`h-9 w-9 rounded-md text-xs font-semibold transition ${className}`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {questions.length === 0 && (
                            <p className="text-stone-600">
                                Belum ada soal untuk kuis ini. Hubungi guru Anda.
                            </p>
                        )}
                    </Card.Content>

                    <Card.Footer className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="inline-flex rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                                onClick={() => goToQuestion(currentQuestion - 1)}
                                disabled={currentQuestion === 0 || jumping}
                            >
                                Sebelumnya
                            </button>
                            <button
                                type="button"
                                className="inline-flex rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                                onClick={() => goToQuestion(currentQuestion + 1)}
                                disabled={
                                    currentQuestion === questions.length - 1 ||
                                    questions.length === 0 ||
                                    jumping
                                }
                            >
                                Selanjutnya
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                className="inline-flex rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                                onClick={() =>
                                    router.visit(route("quizzes.show", quiz.id))
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
                                {submitting ? "Mengirim..." : "Kumpulkan"}
                            </button>
                        </div>
                    </Card.Footer>
                </Card>
            </div>
        </DashboardLayout>
    );
}
