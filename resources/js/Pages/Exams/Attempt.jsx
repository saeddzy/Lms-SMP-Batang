import React, { useEffect, useRef, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { IconClock, IconCheck, IconX, IconAlertTriangle } from "@tabler/icons-react";

export default function ExamAttempt() {
    const { exam, attempt, questions, remainingSeconds, endTime } = usePage().props;
    const MAX_VIOLATIONS = 3;

    // Check jika questions kosong
    if (!questions || questions.length === 0) {
        return (
            <DashboardLayout title="Error">
                <Head title="Error" />
                <div className="max-w-4xl mx-auto py-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-red-800 mb-2">Tidak Ada Soal</h2>
                        <p className="text-red-600">Soal ujian tidak tersedia. Silakan hubungi administrator.</p>
                        <button 
                            onClick={() => window.history.back()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Kembali
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }
    
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [timeLeft, setTimeLeft] = useState(Math.floor(remainingSeconds / 60));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [violations, setViolations] = useState(0);
    const [violationMessage, setViolationMessage] = useState("");
    const [submitError, setSubmitError] = useState("");
    const [autoSubmitTriggered, setAutoSubmitTriggered] = useState(false);
    const submitTriggeredRef = useRef(false);
    const violationLockRef = useRef(false);
    const warningTimeoutRef = useRef(null);
    const postJson = async (url, payload) => {
        try {
            const response = await window.axios.post(url, payload, {
                headers: {
                    Accept: "application/json",
                },
            });

            return response.data;
        } catch (error) {
            const status = error?.response?.status;
            if (status === 419) {
                throw new Error("Sesi keamanan berakhir (CSRF). Silakan refresh halaman.");
            }
            throw new Error(`Request failed: ${status ?? "unknown"}`);
        }
    };

    const exitFullscreenIfActive = async () => {
        if (!document.fullscreenElement || !document.exitFullscreen) {
            return;
        }

        try {
            await document.exitFullscreen();
        } catch (error) {
            // Abaikan jika browser menolak exit fullscreen.
        }
    };

    const ensureExitFullscreen = async () => {
        // Beberapa browser kadang butuh lebih dari sekali panggil.
        await exitFullscreenIfActive();
        if (document.fullscreenElement) {
            await new Promise((resolve) => setTimeout(resolve, 120));
            await exitFullscreenIfActive();
        }
    };

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const end = new Date(endTime);
            const diff = Math.max(0, Math.floor((end - now) / 1000 / 60));
            
            setTimeLeft(diff);
            
            if (diff === 0) {
                handleSubmit(); // Auto submit when time is up
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    useEffect(() => {
        const showWarning = (message) => {
            setViolationMessage(message);
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
            warningTimeoutRef.current = setTimeout(() => setViolationMessage(""), 2500);
        };

        const sendViolation = async (type) => {
            try {
                await window.axios.post(
                    route("exams.attempt.violation", [exam.id, attempt.id]),
                    { type },
                    {
                    headers: {
                        Accept: "application/json",
                    },
                    }
                );
            } catch (error) {
                // Jangan ganggu pengerjaan ujian kalau pengiriman log gagal.
            }
        };

        const registerViolation = (type, message) => {
            if (violationLockRef.current || submitTriggeredRef.current) {
                return;
            }
            violationLockRef.current = true;
            setTimeout(() => {
                violationLockRef.current = false;
            }, 1200);

            void sendViolation(type);
            setViolations((prev) => {
                const next = prev + 1;
                const remaining = Math.max(0, MAX_VIOLATIONS - next);
                showWarning(
                    `${message} (${next}/${MAX_VIOLATIONS})${
                        remaining > 0 ? ` - sisa toleransi ${remaining}` : ""
                    }`
                );

                if (next >= MAX_VIOLATIONS && !submitTriggeredRef.current) {
                    submitTriggeredRef.current = true;
                    showWarning("Batas pelanggaran tercapai. Ujian dikumpulkan otomatis.");
                    setAutoSubmitTriggered(true);
                }
                return next;
            });
        };

        const requestFullscreen = async () => {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                try {
                    await document.documentElement.requestFullscreen();
                } catch (error) {
                    // Jangan blok user jika browser menolak auto fullscreen
                }
            }
        };

        requestFullscreen();

        const onFullscreenChange = () => {
            if (!document.fullscreenElement) {
                registerViolation(
                    "exit_fullscreen",
                    "Anda keluar dari mode fullscreen"
                );
                // Coba masuk fullscreen lagi agar tidak perlu klik manual.
                setTimeout(() => {
                    void requestFullscreen();
                }, 300);
            }
        };

        const onVisibilityChange = () => {
            if (document.hidden) {
                registerViolation(
                    "tab_switch",
                    "Terdeteksi pindah tab atau minimize browser"
                );
            }
        };

        const blockCopyPasteContext = (event) => {
            event.preventDefault();
            const type =
                event.type === "contextmenu" ? "right_click" : `blocked_${event.type}`;
            registerViolation(type, "Aksi copy/paste/right click tidak diizinkan");
        };

        const onKeyDown = (event) => {
            const key = event.key.toLowerCase();
            const blockedShortcut =
                (event.ctrlKey && ["c", "v", "u"].includes(key)) ||
                key === "f12";
            if (!blockedShortcut) return;

            event.preventDefault();
            registerViolation("blocked_key", `Shortcut ${event.key.toUpperCase()} diblokir`);
        };

        document.addEventListener("fullscreenchange", onFullscreenChange);
        document.addEventListener("visibilitychange", onVisibilityChange);
        document.addEventListener("copy", blockCopyPasteContext);
        document.addEventListener("paste", blockCopyPasteContext);
        document.addEventListener("contextmenu", blockCopyPasteContext);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("fullscreenchange", onFullscreenChange);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            document.removeEventListener("copy", blockCopyPasteContext);
            document.removeEventListener("paste", blockCopyPasteContext);
            document.removeEventListener("contextmenu", blockCopyPasteContext);
            document.removeEventListener("keydown", onKeyDown);
            if (warningTimeoutRef.current) {
                clearTimeout(warningTimeoutRef.current);
            }
        };
    }, [exam.id, attempt.id]);

    useEffect(() => {
        if (!autoSubmitTriggered || isSubmitting) {
            return;
        }
        handleSubmit();
    }, [autoSubmitTriggered, isSubmitting]);

    const handleAnswerChange = (questionId, answer, selectedOptions = null) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                answer,
                selected_options: selectedOptions,
                time_spent_seconds: (prev[questionId]?.time_spent_seconds || 0) + 1
            }
        }));
    };

    const hasAnswerForQuestion = (question) => {
        const ans = answers[question.id];
        if (!ans) return false;

        if (Array.isArray(question.options) && question.options.length > 0) {
            return (
                Array.isArray(ans.selected_options) &&
                ans.selected_options.length > 0
            );
        }

        return typeof ans.answer === "string" && ans.answer.trim() !== "";
    };

    const saveQuestionAnswer = async (question) => {
        const answerData = answers[question.id];
        if (!answerData) return;

        const answerValue =
            typeof answerData.answer === "string"
                ? answerData.answer.trim()
                : "";

        if (!answerValue) return;

        await postJson(route("exams.attempt.save-answer", [exam.id, attempt.id]), {
            question_id: question.id,
            answer: answerValue,
        });
    };

    const goToQuestion = async (targetIndex) => {
        if (
            targetIndex < 0 ||
            targetIndex >= questions.length ||
            targetIndex === currentQuestion ||
            isSubmitting
        ) {
            return;
        }

        try {
            setIsAutoSaving(true);
            const current = questions[currentQuestion];
            if (current) {
                await saveQuestionAnswer(current);
            }
        } catch (_) {
            // Jangan blok navigasi; jawaban tetap ada di state lokal.
        } finally {
            setIsAutoSaving(false);
            setCurrentQuestion(targetIndex);
        }
    };

    const handleSubmit = async ({ exitFirst = false } = {}) => {
        if (isSubmitting) return;

        submitTriggeredRef.current = true;
        setIsSubmitting(true);
        setSubmitError("");

        try {
            // Untuk submit manual (klik tombol), keluar fullscreen lebih awal
            // agar tetap dianggap user gesture oleh browser.
            if (exitFirst) {
                await ensureExitFullscreen();
            }

            // Save all answers first
            for (const [questionId, answerData] of Object.entries(answers)) {
                await postJson(route('exams.attempt.save-answer', [exam.id, attempt.id]), {
                    question_id: questionId,
                    ...answerData
                });
            }

            // Then submit exam
            const submitResult = await postJson(
                route('exams.attempt.submit', [exam.id, attempt.id]),
                {}
            );

            await ensureExitFullscreen();
            
            router.visit(
                submitResult?.result_url || route('exams.attempt.result', [exam.id, attempt.id])
            );
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitError(
                error?.message ||
                    "Gagal mengumpulkan jawaban. Cek koneksi lalu coba lagi."
            );
            setIsSubmitting(false);
            submitTriggeredRef.current = false;
        }
    };

    const handleManualSubmit = () => handleSubmit({ exitFirst: true });

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const getStatusColor = () => {
        if (timeLeft <= 5) return 'text-red-600 bg-red-50';
        if (timeLeft <= 10) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    const answeredCount = questions.filter((q) => {
        const ans = answers[q.id];
        if (!ans) return false;

        if (Array.isArray(q.options) && q.options.length > 0) {
            return Array.isArray(ans.selected_options) && ans.selected_options.length > 0;
        }

        return typeof ans.answer === "string" && ans.answer.trim() !== "";
    }).length;
    const isLockedByViolation = violations >= MAX_VIOLATIONS || autoSubmitTriggered;

    return (
        <DashboardLayout title={`Mengerjakan: ${exam.title}`}>
            <Head title={`Mengerjakan: ${exam.title}`} />

            <div className="max-w-6xl mx-auto py-6">
                {/* Header */}
                <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">{exam.title}</h1>
                            <p className="text-sm text-slate-600">
                                Soal {currentQuestion + 1} dari {questions.length}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                                Jawaban tersimpan: {answeredCount}/{questions.length}
                            </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                            <IconClock className="inline w-4 h-4 mr-1" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800 ring-1 ring-amber-200">
                            <IconAlertTriangle className="h-3.5 w-3.5" />
                            Pelanggaran: {violations}/{MAX_VIOLATIONS}
                        </span>
                        {violationMessage ? (
                            <span className="text-red-600 font-medium">{violationMessage}</span>
                        ) : (
                            <span className="text-slate-500">
                                Tetap fullscreen dan fokus di halaman ujian.
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-slate-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Question */}
                {questions[currentQuestion] && (
                    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_240px]">
                        <div className="rounded-lg border border-slate-200 bg-white p-6">
                            <div className="mb-4">
                                <div className="flex items-start gap-2 mb-2">
                                    <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium">
                                        {currentQuestion + 1}
                                    </span>
                                    <h2 className="text-lg font-medium text-slate-900 flex-1">
                                        {questions[currentQuestion].question_text}
                                    </h2>
                                </div>
                                
                                {questions[currentQuestion].question_image && (
                                    <img 
                                        src={`/storage/${questions[currentQuestion].question_image}`}
                                        alt="Question image"
                                        className="mt-3 max-w-full h-auto rounded-lg border border-slate-200"
                                    />
                                )}
                            </div>

                            {/* Options */}
                            {questions[currentQuestion].options && questions[currentQuestion].options.length > 0 ? (
                                <div className="space-y-3">
                                    {questions[currentQuestion].options.map((option, index) => (
                                        <label 
                                            key={index}
                                            className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name={`question_${questions[currentQuestion].id}`}
                                                value={index}
                                                disabled={isLockedByViolation}
                                                checked={answers[questions[currentQuestion].id]?.selected_options?.includes(index)}
                                                onChange={(e) => {
                                                    const question = questions[currentQuestion];
                                                    const currentAnswers = answers[questions[currentQuestion].id]?.selected_options || [];
                                                    if (e.target.checked) {
                                                        handleAnswerChange(
                                                            questions[currentQuestion].id, 
                                                            question.question_type === "multiple_choice"
                                                                ? String(index)
                                                                : option,
                                                            [index]
                                                        );
                                                    } else {
                                                        handleAnswerChange(
                                                            questions[currentQuestion].id, 
                                                            question.question_type === "multiple_choice"
                                                                ? String(index)
                                                                : option,
                                                            currentAnswers.filter(id => id !== index)
                                                        );
                                                    }
                                                }}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium text-slate-900">
                                                    {String.fromCharCode(65 + index)}. {option}
                                                </span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                /* Essay question */
                                <textarea
                                    rows={4}
                                    placeholder="Tulis jawaban Anda di sini..."
                                    disabled={isLockedByViolation}
                                    value={answers[questions[currentQuestion].id]?.answer || ''}
                                    onChange={(e) => handleAnswerChange(questions[currentQuestion].id, e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            )}
                        </div>

                        <div className="rounded-lg border border-slate-200 bg-white p-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Navigasi Soal
                            </p>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToQuestion(index)}
                                        disabled={isLockedByViolation || isAutoSaving}
                                        className={`h-9 w-9 rounded-md text-xs font-semibold transition-colors ${
                                            index === currentQuestion 
                                                ? 'bg-indigo-600 text-white' 
                                                : hasAnswerForQuestion(questions[index])
                                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => goToQuestion(currentQuestion - 1)}
                        disabled={currentQuestion === 0 || isLockedByViolation || isAutoSaving}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Sebelumnya
                    </button>

                    <div />

                    <button
                        onClick={() => goToQuestion(currentQuestion + 1)}
                        disabled={currentQuestion === questions.length - 1 || isLockedByViolation || isAutoSaving}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Selanjutnya
                    </button>
                </div>

                {/* Submit Button */}
                <div className="mt-8 text-center">
                    {isAutoSaving ? (
                        <p className="mb-3 text-xs text-slate-500">
                            Menyimpan jawaban soal aktif...
                        </p>
                    ) : null}
                    {submitError ? (
                        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                            {submitError}
                        </div>
                    ) : null}
                    <button
                        onClick={handleManualSubmit}
                        disabled={isSubmitting || timeLeft === 0 || isLockedByViolation}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {isSubmitting
                            ? 'Menyimpan...'
                            : isLockedByViolation
                              ? 'Auto-submit pelanggaran...'
                              : 'Kumpulkan Jawaban'}
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
