import React, { useMemo, useState } from "react";
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

function repeatType(type, count) {
    const n = Math.max(0, Number(count) || 0);
    return Array.from({ length: n }, () => type);
}

export default function QuestionBank({ mode, entityId, questions = [], canManage = false }) {
    const sorted = useMemo(
        () => [...questions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        [questions]
    );

    const [composerStep, setComposerStep] = useState("closed"); // closed | plan | form
    const [editing, setEditing] = useState(null);

    const [planTotal, setPlanTotal] = useState("5");
    const [planMode, setPlanMode] = useState("single"); // single | mixed
    const [singleType, setSingleType] = useState("multiple_choice");
    const [mixCounts, setMixCounts] = useState({
        multiple_choice: 3,
        true_false: 0,
        short_answer: 0,
        essay: 2,
    });

    const [plannedTypes, setPlannedTypes] = useState([]);
    const [activePlanIndex, setActivePlanIndex] = useState(0);

    const { data, setData, reset, clearErrors } = useForm(emptyForm());
    const pageErrors = usePage().props.errors ?? {};
    const [visitErrors, setVisitErrors] = useState({});
    const mergedErrors = { ...pageErrors, ...visitErrors };

    const remainingCapacity = Math.max(0, MAX_QUESTIONS - sorted.length);
    const currentPlannedType = plannedTypes[activePlanIndex] ?? null;

    const resetPlanner = () => {
        setPlanTotal("5");
        setPlanMode("single");
        setSingleType("multiple_choice");
        setMixCounts({
            multiple_choice: 3,
            true_false: 0,
            short_answer: 0,
            essay: 2,
        });
        setPlannedTypes([]);
        setActivePlanIndex(0);
    };

    const resetFormAll = () => {
        reset();
        clearErrors();
        setVisitErrors({});
        setEditing(null);
        setComposerStep("closed");
        resetPlanner();
    };

    const typeLabel = (t) => TYPE_OPTIONS.find((x) => x.value === t)?.label ?? t;
    const typeShort = (t) => TYPE_OPTIONS.find((x) => x.value === t)?.short ?? "?";

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

    const openPlan = () => {
        setEditing(null);
        reset();
        clearErrors();
        setVisitErrors({});
        setComposerStep("plan");
        resetPlanner();
    };

    const startPlannedInput = () => {
        if (remainingCapacity <= 0) {
            setVisitErrors({ form: ["Jumlah soal sudah mencapai batas maksimum 100."] });
            return;
        }

        const target = Number(planTotal) || 0;
        if (target < 1) {
            setVisitErrors({ form: ["Minimal rencana 1 soal."] });
            return;
        }
        if (target > remainingCapacity) {
            setVisitErrors({
                form: [`Sisa slot soal hanya ${remainingCapacity}. Kurangi jumlah rencana.`],
            });
            return;
        }

        let plan = [];
        if (planMode === "single") {
            plan = repeatType(singleType, target);
        } else {
            plan = [
                ...repeatType("multiple_choice", mixCounts.multiple_choice),
                ...repeatType("true_false", mixCounts.true_false),
                ...repeatType("short_answer", mixCounts.short_answer),
                ...repeatType("essay", mixCounts.essay),
            ];
            if (plan.length !== target) {
                setVisitErrors({
                    form: ["Total komposisi tipe harus sama dengan jumlah soal yang direncanakan."],
                });
                return;
            }
        }

        setVisitErrors({});
        setPlannedTypes(plan);
        setActivePlanIndex(0);
        setData({
            ...emptyForm(),
            question_type: plan[0],
            correct_answer: plan[0] === "multiple_choice" ? "0" : plan[0] === "true_false" ? "true" : "",
            points: "1",
        });
        setComposerStep("form");
    };

    const saveNewQuestion = () => {
        if (entityId == null || entityId === "") {
            setVisitErrors({ form: ["ID kuis tidak ditemukan. Muat ulang halaman ini."] });
            return;
        }

        router.post(questionStoreUrl(mode, entityId), buildPayload(), {
            preserveScroll: true,
            onBefore: () => setVisitErrors({}),
            onSuccess: () => {
                if (plannedTypes.length > 0 && activePlanIndex < plannedTypes.length - 1) {
                    const next = activePlanIndex + 1;
                    const nextType = plannedTypes[next];
                    setActivePlanIndex(next);
                    setData({
                        ...emptyForm(),
                        question_type: nextType,
                        correct_answer:
                            nextType === "multiple_choice"
                                ? "0"
                                : nextType === "true_false"
                                  ? "true"
                                  : "",
                        points: "1",
                    });
                } else {
                    resetFormAll();
                }
            },
            onError: (errors) => {
                setVisitErrors(errors ?? {});
                window.scrollTo({ top: 0, behavior: "smooth" });
            },
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
        setComposerStep("form");
        setPlannedTypes([]);
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
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const destroy = (q) => {
        if (!confirm("Hapus soal ini? Tindakan tidak dapat dibatalkan.")) return;
        router.delete(questionDestroyUrl(mode, entityId, q.id), { preserveScroll: true });
    };

    const mcOptions = data.optionsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

    return (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="mb-4 rounded-lg border border-slate-100 bg-slate-50/90 p-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">
                    Mulai dari <strong>Tambah soal</strong>, atur jumlah soal dan komposisi tipe, lalu isi per nomor seperti ujian pada umumnya.
                </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">
                    Soal ({sorted.length}/{MAX_QUESTIONS})
                </h3>
                {canManage && composerStep !== "closed" && (
                    <button
                        type="button"
                        onClick={resetFormAll}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        Tutup panel
                    </button>
                )}
            </div>

            {canManage && composerStep === "closed" && remainingCapacity > 0 && (
                <button
                    type="button"
                    onClick={openPlan}
                    className="mt-4 w-full rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 py-4 text-sm font-semibold text-indigo-900 hover:bg-indigo-50"
                >
                    + Tambah soal kuis
                </button>
            )}

            {canManage && composerStep === "plan" && (
                <div className="mt-6 space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
                    <p className="text-sm font-semibold text-indigo-950">
                        Atur rencana input soal
                    </p>
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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">
                                Jumlah soal yang akan dibuat
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={remainingCapacity}
                                value={planTotal}
                                onChange={(e) => setPlanTotal(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Sisa slot: {remainingCapacity}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">
                                Mode komposisi tipe
                            </label>
                            <select
                                value={planMode}
                                onChange={(e) => setPlanMode(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                                <option value="single">Satu tipe saja</option>
                                <option value="mixed">Campur beberapa tipe</option>
                            </select>
                        </div>
                    </div>

                    {planMode === "single" ? (
                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">
                                Tipe soal
                            </label>
                            <select
                                value={singleType}
                                onChange={(e) => setSingleType(e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                                {TYPE_OPTIONS.map((t) => (
                                    <option key={t.value} value={t.value}>
                                        {t.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {TYPE_OPTIONS.map((t) => (
                                <div key={t.value}>
                                    <label className="text-xs font-semibold uppercase text-slate-500">
                                        {t.label}
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={mixCounts[t.value] ?? 0}
                                        onChange={(e) =>
                                            setMixCounts((prev) => ({
                                                ...prev,
                                                [t.value]: Number(e.target.value) || 0,
                                            }))
                                        }
                                        className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={startPlannedInput}
                            className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            Mulai input soal per nomor
                        </button>
                        <button
                            type="button"
                            onClick={resetFormAll}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}

            {canManage && composerStep === "form" && (
                <form
                    noValidate
                    onSubmit={(e) => {
                        e.preventDefault();
                        editing ? saveQuestionEdit() : saveNewQuestion();
                    }}
                    className="mt-6 space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4"
                >
                    {plannedTypes.length > 0 && !editing && (
                        <div className="rounded-lg border border-indigo-200 bg-white p-3">
                            <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                                Progres input soal
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {plannedTypes.map((t, i) => {
                                    const done = i < activePlanIndex;
                                    const current = i === activePlanIndex;
                                    return (
                                        <span
                                            key={`${t}-${i}`}
                                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-xs font-semibold ring-1 ${
                                                current
                                                    ? "bg-indigo-600 text-white ring-indigo-600"
                                                    : done
                                                      ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                                                      : "bg-slate-50 text-slate-600 ring-slate-200"
                                            }`}
                                            title={typeLabel(t)}
                                        >
                                            {i + 1} · {typeShort(t)}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <p className="text-sm font-semibold text-indigo-950">
                        {editing
                            ? "Edit soal"
                            : `Isi soal nomor ${activePlanIndex + 1} — ${typeLabel(currentPlannedType)}`}
                    </p>

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
                            disabled={!editing && plannedTypes.length > 0}
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
                            className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100"
                        >
                            {TYPE_OPTIONS.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase text-slate-500">Pertanyaan</label>
                        <textarea
                            rows={3}
                            value={data.question_text}
                            onChange={(e) => setData("question_text", e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>

                    {data.question_type === "multiple_choice" && (
                        <div>
                            <label className="text-xs font-semibold uppercase text-slate-500">
                                Opsi (satu baris per opsi, minimal 2)
                            </label>
                            <textarea
                                rows={4}
                                value={data.optionsText}
                                onChange={(e) => setData("optionsText", e.target.value)}
                                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                            />
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
                                    className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
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
                                        <label key={v} className="flex items-center gap-2 text-sm">
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
                                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
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
                            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
                            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            className="inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            {editing
                                ? "Simpan perubahan"
                                : activePlanIndex < plannedTypes.length - 1
                                  ? "Simpan & lanjut nomor berikutnya"
                                  : "Simpan soal terakhir"}
                        </button>
                        <button
                            type="button"
                            onClick={resetFormAll}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            )}

            {sorted.length > 0 ? (
                <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm text-slate-800">
                    {sorted.map((q) => (
                        <li key={q.id} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <span className="rounded bg-white px-1.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                        {typeLabel(q.question_type)}
                                    </span>
                                    <span className="mt-1 block font-medium text-slate-900">
                                        {q.question_text}
                                    </span>
                                    <span className="text-xs text-slate-500">{q.points ?? 1} poin</span>
                                </div>
                                {canManage && (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(q)}
                                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
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
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="mt-4 text-sm text-slate-600">
                    {canManage ? "Belum ada soal. Klik Tambah soal kuis di atas." : "Belum ada soal."}
                </p>
            )}
        </div>
    );
}
