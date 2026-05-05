import React, { useMemo } from "react";

export function parseMultipleCheckboxOptions(rawOptions) {
    if (!rawOptions || typeof rawOptions !== "object") return [];
    if (rawOptions.type !== "multiple_checkbox") return [];
    if (!Array.isArray(rawOptions.options)) return [];
    return rawOptions.options
        .map((item) => ({
            text: String(item?.text ?? "").trim(),
            is_correct: Boolean(item?.is_correct),
        }))
        .filter((item) => item.text);
}

function uniqueNormalized(values) {
    const seen = new Set();
    const out = [];
    for (const value of values) {
        const norm = String(value ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");
        if (!norm || seen.has(norm)) continue;
        seen.add(norm);
        out.push(norm);
    }
    return out;
}

export function parseMultipleCheckboxAnswer(raw) {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(String(raw));
        if (Array.isArray(parsed)) return uniqueNormalized(parsed);
        if (Array.isArray(parsed?.answers)) return uniqueNormalized(parsed.answers);
    } catch {
        return [];
    }
    return [];
}

export function isMultipleCheckboxResponseComplete(answerRaw) {
    return parseMultipleCheckboxAnswer(answerRaw).length > 0;
}

export default function MultipleCheckboxQuestionBlock({
    options,
    value,
    onChange,
    disabled = false,
    helperText = "(Pilih lebih dari satu jawaban)",
}) {
    const selectedSet = useMemo(
        () => new Set(parseMultipleCheckboxAnswer(value)),
        [value]
    );

    const toggle = (text) => {
        const key = String(text ?? "")
            .trim()
            .toLowerCase()
            .replace(/\s+/g, " ");
        const next = new Set(selectedSet);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        const payload = JSON.stringify({ answers: [...next] });
        onChange(payload);
    };

    return (
        <div className="mt-3 space-y-3">
            <p className="text-xs font-medium text-slate-500">{helperText}</p>
            <div className="space-y-2">
                {options.map((opt, idx) => {
                    const key = String(opt.text).trim().toLowerCase().replace(/\s+/g, " ");
                    const checked = selectedSet.has(key);
                    return (
                        <label
                            key={`${idx}-${opt.text}`}
                            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                                checked
                                    ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-200"
                                    : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"
                            } ${disabled ? "pointer-events-none opacity-60" : ""}`}
                        >
                            <input
                                type="checkbox"
                                className="mt-0.5 h-5 w-5 rounded accent-indigo-600"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggle(opt.text)}
                            />
                            <span className="text-sm text-slate-900">{opt.text}</span>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}

export function MultipleCheckboxReview({
    options,
    answerRaw,
}) {
    const selected = new Set(parseMultipleCheckboxAnswer(answerRaw));
    return (
        <div className="mt-3 space-y-2">
            {options.map((opt, idx) => {
                const key = String(opt.text).trim().toLowerCase().replace(/\s+/g, " ");
                const picked = selected.has(key);
                const isCorrect = Boolean(opt.is_correct);
                const stateClass = isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                    : picked
                      ? "border-rose-200 bg-rose-50 text-rose-950"
                      : "border-slate-200 bg-slate-50 text-slate-700";

                return (
                    <div key={`${idx}-${opt.text}`} className={`rounded-lg border px-3 py-2 text-sm ${stateClass}`}>
                        <span className="font-medium">{opt.text}</span>
                        {isCorrect ? "  ✔ benar" : picked ? "  ✖ dipilih tapi salah" : ""}
                    </div>
                );
            })}
        </div>
    );
}
