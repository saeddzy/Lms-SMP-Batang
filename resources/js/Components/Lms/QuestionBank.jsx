import React, { useMemo, useRef, useState } from "react";
import { router, useForm, usePage } from "@inertiajs/react";

const MAX_QUESTIONS = 100;

const TYPE_OPTIONS = [
    { value: "multiple_choice", label: "Pilihan ganda", short: "PG" },
    { value: "true_false", label: "Benar / salah", short: "BS" },
    { value: "short_answer", label: "Jawaban singkat", short: "JS" },
    { value: "essay", label: "Esai (manual)", short: "E" },
];

const validationFieldLabels = {
    form: "Formulir",
    question_text: "Pertanyaan",
    question_type: "Tipe soal",
    options: "Opsi",
    correct_answer: "Jawaban benar / kunci",
    points: "Poin",
    explanation: "Pembahasan / rubrik",
};

const emptyForm = () => ({
    question_text: "",
    question_type: "multiple_choice",
    optionsText: "",
    correct_answer: "0",
    points: "1",
    explanation: "",
});

function questionStoreUrl(mode, entityId) {
    if (mode === "quiz") {
        return route("quizzes.questions.store", { quiz: entityId }, false);
    }
    return route("exams.questions.store", { exam: entityId }, false);
}

function questionBatchStoreUrl(mode, entityId) {
    if (mode === "quiz") {
        return route("quizzes.questions.store-batch", { quiz: entityId }, false);
    }
    return null;
}

function questionUpdateUrl(mode, entityId, questionId) {
    if (mode === "quiz") {
        return route(
            "quizzes.questions.update",
            { quiz: entityId, question: questionId },
            false
        );
    }
    return route(
        "exams.questions.update",
        { exam: entityId, question: questionId },
        false
    );
}

function questionDestroyUrl(mode, entityId, questionId) {
    if (mode === "quiz") {
        return route(
            "quizzes.questions.destroy",
            { quiz: entityId, question: questionId },
            false
        );
    }
    return route(
        "exams.questions.destroy",
        { exam: entityId, question: questionId },
        false
    );
}

export default function QuestionBank({ mode, entityId, questions = [], canManage = false }) {
    const page = usePage();
    const formPanelRef = useRef(null);
    const [composerStep, setComposerStep] = useState("closed"); // closed | form
    const [editing, setEditing] = useState(null);
    const [sequentialDrafts, setSequentialDrafts] = useState([]);
    const [savedListQuery, setSavedListQuery] = useState("");
    const [savedListType, setSavedListType] = useState("");

    const sorted = useMemo(
        () => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [questions]
    );

    const filteredSavedQuestions = useMemo(() => {
        const needle = savedListQuery.trim().toLowerCase();
        return sorted.filter((q) => {
            if (savedListType && (q.question_type ?? "") !== savedListType) {
                return false;
            }
            if (!needle) return true;
            return String(q.question_text ?? "").toLowerCase().includes(needle);
        });
    }, [sorted, savedListQuery, savedListType]);

    const { data, setData, reset, clearErrors } = useForm(emptyForm());
    const pageErrors = page.props.errors ?? {};
    const [visitErrors, setVisitErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const mergedErrors = { ...pageErrors, ...visitErrors };

    const remainingCapacity = Math.max(0, MAX_QUESTIONS - sorted.length);
    const quizTargetQuestions = (() => {
        if (mode !== "quiz") return 0;
        const raw = Number(page.props?.quiz?.total_questions ?? 0);
        return Number.isFinite(raw) && raw > 0 ? raw : 0;
    })();
    const isSequentialTargetEnabled =
        mode === "quiz" && quizTargetQuestions > 0 && sorted.length < quizTargetQuestions;
    const isSequentialComposerMode = !editing && isSequentialTargetEnabled;
    const nextQuestionOrderNumber = sorted.length + sequentialDrafts.length + 1;
    const isFinalSequentialStep =
        isSequentialComposerMode && nextQuestionOrderNumber >= quizTargetQuestions;
    const totalDisplayTarget =
        quizTargetQuestions > 0 ? quizTargetQuestions : MAX_QUESTIONS;
    const displayedQuestionCount = sorted.length + sequentialDrafts.length;
    const resetFormAll = () => {
        reset();
        clearErrors();
        setVisitErrors({});
        setEditing(null);
        setSequentialDrafts([]);
        setComposerStep("closed");
    };

    const typeLabel = (t) => TYPE_OPTIONS.find((x) => x.value === t)?.label ?? t;

    const buildPayload = () => {
        const type = data.question_type;
        let options = null;
        let correct = data.correct_answer;

        if (type === "multiple_choice") {
            options = data.optionsText
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
        }
        if (type === "true_false") {
            correct = data.correct_answer === "false" ? "false" : "true";
        }
        if (type === "essay") {
            return {
                question_text: data.question_text,
                question_type: "essay",
                options: null,
                correct_answer: null,
                points: data.points ? Number(data.points) : 1,
                explanation: data.explanation?.trim() ? data.explanation : null,
            };
        }

        return {
            question_text: data.question_text,
            question_type: type,
            options,
            correct_answer: correct == null ? "" : String(correct),
            points: data.points ? Number(data.points) : 1,
            explanation: data.explanation || null,
        };
    };

    const openQuickAdd = () => {
        setEditing(null);
        setSequentialDrafts([]);
        clearErrors();
        setVisitErrors({});
        setData({
            ...emptyForm(),
            question_type: "multiple_choice",
            correct_answer: "0",
            points: "1",
        });
        setComposerStep("form");
    };

    const validatePayload = (payload) => {
        if (!payload.question_text || String(payload.question_text).trim() === "") {
            return { question_text: ["Pertanyaan wajib diisi."] };
        }
        if (payload.question_type === "multiple_choice" && (!Array.isArray(payload.options) || payload.options.length < 2)) {
            return { options: ["Minimal isi 2 opsi untuk soal pilihan ganda."] };
        }
        if (payload.question_type === "short_answer" && (!payload.correct_answer || String(payload.correct_answer).trim() === "")) {
            return { correct_answer: ["Kunci jawaban singkat wajib diisi."] };
        }
        return null;
    };

    const draftToPayload = (draft) => {
        const questionType = draft.question_type ?? "multiple_choice";
        const options =
            questionType === "multiple_choice"
                ? String(draft.optionsText ?? "")
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean)
                : null;

        return {
            question_text: draft.question_text ?? "",
            question_type: questionType,
            options,
            correct_answer:
                questionType === "essay"
                    ? null
                    : questionType === "true_false"
                      ? (draft.correct_answer === "false" ? "false" : "true")
                      : String(draft.correct_answer ?? ""),
            points: draft.points ? Number(draft.points) : 1,
            explanation: draft.explanation || null,
        };
    };

    const saveNewQuestion = () => {
        if (entityId == null || entityId === "") {
            setVisitErrors({ form: ["ID kuis tidak ditemukan. Muat ulang halaman ini."] });
            return;
        }

        const payload = buildPayload();

        const validationErrors = validatePayload(payload);
        if (validationErrors) {
            setVisitErrors(validationErrors);
            return;
        }

        if (isSequentialComposerMode && !isFinalSequentialStep) {
            setSequentialDrafts((prev) => [
                ...prev,
                {
                    question_text: data.question_text,
                    question_type: data.question_type,
                    optionsText: data.optionsText,
                    correct_answer: data.correct_answer,
                    points: data.points || "1",
                    explanation: data.explanation,
                },
            ]);
            setData({
                ...emptyForm(),
                question_type: "multiple_choice",
                correct_answer: "0",
                points: "1",
            });
            setVisitErrors({});
            return;
        }

        if (isSequentialComposerMode && isFinalSequentialStep) {
            const batchUrl = questionBatchStoreUrl(mode, entityId);
            if (!batchUrl) {
                setVisitErrors({ form: ["Mode batch hanya tersedia untuk kuis."] });
                return;
            }
            const batchPayload = {
                questions: [
                    ...sequentialDrafts.map(draftToPayload),
                    payload,
                ],
            };

            router.post(batchUrl, batchPayload, {
                preserveScroll: true,
                preserveState: true,
                onBefore: () => {
                    setVisitErrors({});
                    setIsSaving(true);
                },
                onSuccess: () => {
                    resetFormAll();
                    setIsSaving(false);
                },
                onError: (errors) => {
                    setVisitErrors(errors ?? {});
                    setIsSaving(false);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                },
                onFinish: () => setIsSaving(false),
            });
            return;
        }

        router.post(questionStoreUrl(mode, entityId), payload, {
            preserveScroll: true,
            preserveState: true,
            onBefore: () => {
                setVisitErrors({});
                setIsSaving(true);
            },
            onSuccess: () => {
                resetFormAll();
                setIsSaving(false);
            },
            onError: (errors) => {
                setVisitErrors(errors ?? {});
                setIsSaving(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
            onFinish: () => setIsSaving(false),
        });
    };

    const saveQuestionEdit = () => {
        if (!editing) return;
        router.put(questionUpdateUrl(mode, entityId, editing), buildPayload(), {
            preserveScroll: true,
            onBefore: () => setVisitErrors({}),
            onSuccess: () => {
                reset();
                clearErrors();
                setVisitErrors({});
                setSequentialDrafts([]);
                setEditing(null);
                setComposerStep("closed");
            },
            onError: (errors) => {
                setVisitErrors(errors ?? {});
            },
        });
    };

    const startEdit = (q) => {
        setEditing(q.id);
        setSequentialDrafts([]);
        setComposerStep("form");
        const qt = q.question_type ?? "multiple_choice";
        setData({
            question_text: q.question_text ?? "",
            question_type: qt,
            optionsText: Array.isArray(q.options) ? q.options.join("\n") : "",
            correct_answer:
                qt === "multiple_choice"
                    ? String(q.correct_answer ?? "0")
                    : qt === "true_false" || qt === "short_answer"
                      ? String(q.correct_answer ?? "")
                      : "",
            points: String(q.points ?? "1"),
            explanation: q.explanation ?? "",
        });
        setVisitErrors({});
        clearErrors();
        requestAnimationFrame(() => {
            formPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    };

    const destroy = (q) => {
        if (!confirm("Hapus soal ini? Tindakan tidak dapat dibatalkan.")) return;
        router.delete(questionDestroyUrl(mode, entityId, q.id), { preserveScroll: true });
    };

    const goBackToPreviousQuestion = () => {
        if (sequentialDrafts.length > 0) {
            const previousDraft = sequentialDrafts[sequentialDrafts.length - 1];
            setSequentialDrafts((prev) => prev.slice(0, -1));
            setData({
                question_text: previousDraft.question_text ?? "",
                question_type: previousDraft.question_type ?? "multiple_choice",
                optionsText: previousDraft.optionsText ?? "",
                correct_answer: previousDraft.correct_answer ?? "0",
                points: String(previousDraft.points ?? "1"),
                explanation: previousDraft.explanation ?? "",
            });
            setVisitErrors({});
            return;
        }
        resetFormAll();
    };

    const mcOptions = data.optionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

    const currentStepLabel =
        composerStep === "closed"
            ? "Belum mulai"
            : editing
                ? "Langkah 2: Edit konten soal"
                : "Langkah 2: Isi konten soal";

    const correctAnswerPreview = (() => {
        if (data.question_type === "multiple_choice") {
            const idx = Number(data.correct_answer);
            if (Number.isNaN(idx) || !mcOptions[idx]) return "Belum dipilih";
            return `${String.fromCharCode(65 + idx)}. ${mcOptions[idx]}`;
        }
        if (data.question_type === "true_false") {
            return data.correct_answer === "false" ? "Salah" : "Benar";
        }
        if (data.question_type === "short_answer") {
            return data.correct_answer?.trim() ? "Kunci jawaban terisi" : "Belum diisi";
        }
        return "Dinilai manual guru";
    })();

    const parseMultipleChoiceOptions = (value) =>
        String(value ?? "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);

    const parseMultipleChoiceDraftOptions = (value) => {
        const raw = String(value ?? "");
        if (raw === "") return [];
        return raw.split("\n").map((s) => String(s ?? ""));
    };

    const setMultipleChoiceOptions = (nextOptions) => {
        const normalized = nextOptions.map((item) => String(item ?? ""));
        setData("optionsText", normalized.join("\n"));
    };

    const multipleChoiceDraftOptions = (() => {
        if (data.question_type !== "multiple_choice") return [];
        const parsed = parseMultipleChoiceDraftOptions(data.optionsText);
        const minVisible = 4;
        if (parsed.length >= minVisible) return parsed;
        return [...parsed, ...Array.from({ length: minVisible - parsed.length }, () => "")];
    })();

    const updateMultipleChoiceOption = (index, value) => {
        const next = [...multipleChoiceDraftOptions];
        next[index] = value;
        setMultipleChoiceOptions(next);
    };

    const addMultipleChoiceOption = () => {
        setMultipleChoiceOptions([...multipleChoiceDraftOptions, ""]);
    };

    const removeMultipleChoiceOption = (index) => {
        if (multipleChoiceDraftOptions.length <= 2) return;
        const next = multipleChoiceDraftOptions.filter((_, idx) => idx !== index);
        setMultipleChoiceOptions(next);
        if (Number(data.correct_answer) >= next.length) {
            setData("correct_answer", "0");
        }
    };

    return (
        <div className="rounded-md border border-slate-200 bg-white p-4 md:p-5">
            <div className="mb-4 rounded-md border border-slate-200 bg-slate-50/90 p-3.5 text-sm text-slate-700">
                <p className="font-medium text-slate-900">
                    Alur cepat:{" "}
                    <strong>1) Tambah soal</strong>,{" "}
                    <strong>2) isi konten soal</strong>, lalu{" "}
                    <strong>3) review daftar soal</strong>.
                </p>
                <p className="mt-1 text-xs text-slate-600">
                    Isi soal satu per satu dengan alur yang sederhana dan konsisten.
                </p>
                <div className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#163d8f] ring-1 ring-[#163d8f]/15">
                    {currentStepLabel}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <h3 className="text-lg font-semibold text-slate-900">
                    Soal ({displayedQuestionCount}/{totalDisplayTarget})
                </h3>
                {canManage && composerStep !== "closed" && (
                    <button
                        type="button"
                        onClick={resetFormAll}
                        className="rounded-md border border-[#163d8f]/20 bg-[#163d8f] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0f2e6f]"
                    >
                        Tutup panel
                    </button>
                )}
            </div>

            {canManage && composerStep === "closed" && remainingCapacity > 0 && (
                <div className="mt-3.5">
                    <button
                        type="button"
                        onClick={openQuickAdd}
                        className="w-full rounded-md border border-[#163d8f]/20 bg-[#163d8f] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f2e6f]"
                    >
                        + Tambah Soal
                    </button>
                </div>
            )}

            {canManage && composerStep === "form" && (
                <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <form
                        ref={formPanelRef}
                        noValidate
                        onSubmit={(e) => {
                            e.preventDefault();
                            editing ? saveQuestionEdit() : saveNewQuestion();
                        }}
                        className="space-y-3.5 rounded-md border border-slate-200 bg-white p-4 lg:col-span-2"
                    >
                    <p className="text-sm font-semibold text-slate-900">
                        {editing
                            ? "Edit soal"
                            : "Tambah soal"}
                    </p>
                    {!editing && isSequentialTargetEnabled && (
                        <p className="rounded-md border border-[#163d8f]/20 bg-[#163d8f]/5 px-3 py-2 text-xs font-semibold text-[#163d8f]">
                            Mode berurutan aktif: soal ke-{nextQuestionOrderNumber} dari {quizTargetQuestions}
                        </p>
                    )}

                    {Object.keys(mergedErrors).length > 0 && (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
                            <ul className="list-disc space-y-1 pl-5">
                                {Object.entries(mergedErrors).map(([key, messages]) => (
                                    <li key={key}>
                                        <span className="font-medium">
                                            {validationFieldLabels[key] ?? key}: 
                                        </span>
                                        {Array.isArray(messages) ? messages.join(" ") : messages}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">Tipe soal</label>
                        <select
                            value={data.question_type}
                            onChange={(e) =>
                                setData({
                                    ...emptyForm(),
                                    question_type: e.target.value,
                                    correct_answer:
                                        e.target.value === "multiple_choice"
                                            ? "0"
                                            : e.target.value === "true_false"
                                              ? "true"
                                              : "",
                                    points: data.points || "1",
                                })
                            }
                            className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20 disabled:bg-slate-100"
                        >
                            {TYPE_OPTIONS.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">
                            Pertanyaan <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={data.question_text}
                            onChange={(e) => setData("question_text", e.target.value)}
                            placeholder="Contoh: Jelaskan perbedaan perubahan fisika dan kimia."
                            className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20"
                        />
                    </div>

                    {data.question_type === "multiple_choice" && (
                        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                            <label className="text-xs font-semibold uppercase text-slate-500">
                                Opsi jawaban <span className="text-rose-500">*</span>
                            </label>
                            <p className="mt-1 text-xs text-slate-600">
                                Isi opsi seperti format profesional (A, B, C, D). Bisa tambah opsi jika diperlukan.
                            </p>
                            <div className="mt-3 space-y-2">
                                {multipleChoiceDraftOptions.map((option, idx) => (
                                    <div key={`mc-opt-${idx}`} className="flex items-center gap-2">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-700">
                                            {String.fromCharCode(65 + idx)}
                                        </span>
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) =>
                                                updateMultipleChoiceOption(idx, e.target.value)
                                            }
                                            placeholder={`Masukkan opsi ${String.fromCharCode(65 + idx)}`}
                                            className="block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20"
                                        />
                                        {idx >= 4 && multipleChoiceDraftOptions.length > 4 && (
                                            <button
                                                type="button"
                                                onClick={() => removeMultipleChoiceOption(idx)}
                                                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    onClick={addMultipleChoiceOption}
                                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    + Tambah opsi
                                </button>
                            </div>
                        </div>
                    )}

                    {data.question_type !== "essay" && (
                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">
                                {data.question_type === "short_answer" ? "Kunci jawaban" : "Jawaban benar"}
                            </label>

                            {data.question_type === "multiple_choice" && (
                                <select
                                    value={data.correct_answer}
                                    onChange={(e) => setData("correct_answer", e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20"
                                >
                                    {mcOptions.length === 0 ? (
                                        <option value="0">Isi opsi terlebih dahulu</option>
                                    ) : (
                                        mcOptions.map((opt, i) => (
                                            <option key={i} value={String(i)}>
                                                {String.fromCharCode(65 + i)}. {opt}
                                            </option>
                                        ))
                                    )}
                                </select>
                            )}

                            {data.question_type === "true_false" && (
                                <div className="mt-2 flex gap-4">
                                    {["true", "false"].map((v) => (
                                        <label
                                            key={v}
                                            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                                        >
                                            <input
                                                type="radio"
                                                checked={data.correct_answer === v}
                                                onChange={() => setData("correct_answer", v)}
                                            />
                                            {v === "true" ? "Benar" : "Salah"}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {data.question_type === "short_answer" && (
                                <textarea
                                    rows={6}
                                    value={data.correct_answer}
                                    onChange={(e) => setData("correct_answer", e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 font-mono text-sm focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20"
                                    placeholder={"Satu baris per variasi benar.\n~kata kunci"}
                                />
                            )}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">
                            {data.question_type === "essay" ? "Rubrik guru (opsional)" : "Pembahasan (opsional)"}
                        </label>
                        <textarea
                            rows={data.question_type === "essay" ? 4 : 2}
                            value={data.explanation}
                            onChange={(e) => setData("explanation", e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">Poin</label>
                        <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={data.points}
                            onChange={(e) => setData("points", e.target.value)}
                            className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20"
                        />
                    </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="inline-flex rounded-md bg-[#163d8f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0f2e6f]"
                            >
                                {editing
                                    ? "Simpan perubahan"
                                    : isSaving
                                      ? "Menyimpan..."
                                      : isSequentialTargetEnabled &&
                                          nextQuestionOrderNumber < quizTargetQuestions
                                        ? "Lanjut ke soal selanjutnya"
                                        : "Simpan soal"}
                            </button>
                            {!editing && isSequentialTargetEnabled && (
                                <button
                                    type="button"
                                    onClick={goBackToPreviousQuestion}
                                    className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Kembali
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={resetFormAll}
                                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                        </div>
                    </form>

                    <aside className="rounded-md border border-slate-200 bg-slate-50 p-3.5">
                        <p className="text-xs font-semibold uppercase text-slate-500">
                            Preview Soal
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900">
                            {data.question_text?.trim() || "Pertanyaan belum diisi"}
                        </p>
                        <div className="mt-3 space-y-2 text-xs text-slate-600">
                            <p>
                                <span className="font-semibold text-slate-700">Tipe:</span>{" "}
                                {typeLabel(data.question_type)}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-700">Jawaban benar:</span>{" "}
                                {correctAnswerPreview}
                            </p>
                            <p>
                                <span className="font-semibold text-slate-700">Poin:</span>{" "}
                                {data.points || "1"}
                            </p>
                        </div>
                        {data.question_type === "multiple_choice" && mcOptions.length > 0 ? (
                            <ul className="mt-3 space-y-1 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
                                {mcOptions.map((opt, i) => (
                                    <li key={i}>
                                        {String.fromCharCode(65 + i)}. {opt}
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </aside>
                </div>
            )}

            {sorted.length > 0 ? (
                <div className="mt-4 rounded-md border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Daftar soal tersimpan
                            </p>
                            <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:max-w-xl">
                                <input
                                    type="search"
                                    value={savedListQuery}
                                    onChange={(e) => setSavedListQuery(e.target.value)}
                                    placeholder="Cari teks soal…"
                                    className="min-w-[140px] flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20"
                                    aria-label="Cari soal di daftar"
                                />
                                <select
                                    value={savedListType}
                                    onChange={(e) => setSavedListType(e.target.value)}
                                    className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 focus:border-[#163d8f] focus:outline-none focus:ring-2 focus:ring-[#163d8f]/20"
                                    aria-label="Filter tipe soal"
                                >
                                    <option value="">Semua tipe</option>
                                    {TYPE_OPTIONS.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                                <span className="shrink-0 tabular-nums text-xs text-slate-500">
                                    {filteredSavedQuestions.length}/{sorted.length}
                                </span>
                            </div>
                        </div>
                    </div>
                    {filteredSavedQuestions.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-slate-500">
                            Tidak ada soal yang cocok dengan pencarian / filter.
                        </p>
                    ) : (
                        <div className="divide-y divide-slate-100 text-sm text-slate-800">
                            {filteredSavedQuestions.map((q) => {
                                const orderNum = sorted.findIndex((s) => s.id === q.id) + 1;
                                return (
                                    <div
                                        key={q.id}
                                        className="flex gap-3 px-4 py-3"
                                    >
                                        <span className="w-8 shrink-0 pt-0.5 text-right text-xs font-semibold tabular-nums text-slate-400">
                                            {orderNum}.
                                        </span>
                                        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                                                    {typeLabel(q.question_type)}
                                                </span>
                                                <span className="mt-1 block break-words font-medium text-slate-900">
                                                    {q.question_text}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {q.points ?? 1} poin
                                                </span>
                                            </div>
                                            {canManage && (
                                                <div className="flex shrink-0 items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => startEdit(q)}
                                                        className="text-xs font-semibold text-[#163d8f] hover:text-[#0f2e6f]"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => destroy(q)}
                                                        className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <p className="mt-4 text-sm text-slate-600">
                    {canManage ? "Belum ada soal. Klik Tambah soal kuis di atas." : "Belum ada soal."}
                </p>
            )}
        </div>
    );
}
