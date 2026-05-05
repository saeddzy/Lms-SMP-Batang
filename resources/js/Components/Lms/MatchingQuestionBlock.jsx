import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DND_PAYLOAD = "application/x-lms-matching";

function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function parseMatchingPairs(options) {
    if (!options || typeof options !== "object") return [];
    if (options.type !== "matching" || !Array.isArray(options.pairs)) return [];
    return options.pairs
        .map((p, idx) => {
            const left = normalizePairSide(p?.left);
            const right = normalizePairSide(p?.right);
            if (!left || !right) return null;
            const id = Number(p?.id) > 0 ? Number(p.id) : idx + 1;
            return { id, left, right };
        })
        .filter(Boolean);
}

function normalizePairSide(raw) {
    if (raw && typeof raw === "object") {
        const type = raw.type === "image" ? "image" : "text";
        const value = String(raw.value ?? "").trim();
        if (!value) return null;
        return { type, value };
    }
    const value = String(raw ?? "").trim();
    if (!value) return null;
    return { type: "text", value };
}

function parseAnswerJson(raw) {
    if (raw == null || raw === "") return null;
    try {
        const v = JSON.parse(String(raw));
        return Array.isArray(v) ? v : null;
    } catch {
        return null;
    }
}

function normMatchKeyLocal(s) {
    return String(s ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

function toAssetUrl(value) {
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
    return `/storage/${value}`;
}

function PairItemView({ item, compact = false }) {
    if (!item) return null;
    if (item.type === "image") {
        return (
            <img
                src={toAssetUrl(item.value)}
                alt="matching item"
                className={`rounded-lg object-cover shadow-sm ${
                    compact ? "h-16 w-24" : "max-h-28 w-full max-w-[180px]"
                }`}
                loading="lazy"
            />
        );
    }
    return <span className="flex-1 text-stone-900">{item.value}</span>;
}

/** Validasi jawaban menjodohkan: semua kiri terisi, multiset jawaban = multiset kunci kanan. */
export function isMatchingResponseComplete(options, answerRaw) {
    const pairs = parseMatchingPairs(options);
    if (pairs.length < 2) return true;
    if (typeof answerRaw !== "string" || answerRaw.trim() === "") return false;
    const data = parseAnswerJson(answerRaw);
    if (!data || data.length !== pairs.length) return false;
    const byLeft = Object.fromEntries(
        data.map((row) => [String(row?.left_id ?? row?.left ?? "").trim(), String(row?.answer ?? "").trim()])
    );
    if (
        !pairs.every(
            (p) =>
                byLeft[String(p.id)] ||
                byLeft[normMatchKeyLocal(p.left?.value ?? "")]
        )
    )
        return false;
    const rights = data.map((r) => normMatchKeyLocal(r?.answer)).filter(Boolean).sort();
    const expected = pairs.map((p) => normMatchKeyLocal(p.right?.value)).sort();
    if (rights.length !== expected.length) return false;
    for (let i = 0; i < rights.length; i++) {
        if (rights[i] !== expected[i]) return false;
    }
    return true;
}

/**
 * Kartu jawaban: teks diacak, huruf (A..) diambil dari pool yang diacak terpisah
 * sehingga tidak ada korelasi huruf ↔ urutan pasangan di DB.
 */
function buildShuffledCardDeck(pairs) {
    const rights = pairs.map((p) => p.right);
    const n = rights.length;
    if (n === 0) return [];
    const shuffledRights = shuffle([...rights]);
    const letterPool = shuffle(
        Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i))
    );
    return shuffledRights.map((right, i) => ({
        letter: letterPool[i],
        item: right,
    }));
}

/**
 * Urutan kartu di kolom kanan mengikuti indexPerm (sudah diacak sekali per soal).
 * Tidak memanggil shuffle lagi — menghindari jawaban "loncat" tiap re-render / onChange.
 */
function buildInitialRows(pairs, value, lefts, catalog, indexPerm) {
    const n = pairs.length;
    const middle = Array(n).fill(null);
    const right = Array(n).fill(null);

    const parsed = parseAnswerJson(value);
    const hasRealAnswers =
        parsed &&
        parsed.length === n &&
        parsed.some((row) => String(row?.answer ?? "").trim() !== "");

    const inMiddleLetters = new Set();

    if (hasRealAnswers) {
        const byLeft = Object.fromEntries(
            parsed.map((r) => [
                String(r?.left_id ?? r?.left ?? "").trim(),
                String(r?.answer ?? "").trim(),
            ])
        );
        for (let i = 0; i < n; i++) {
            const ans =
                byLeft[String(lefts[i].id)] ??
                byLeft[normMatchKeyLocal(lefts[i]?.item?.value ?? "")];
            if (!ans || ans.trim() === "") continue;
            const card = catalog.find(
                (c) => String(c.item?.value ?? "").trim() === ans
            );
            if (card) {
                middle[i] = card;
                inMiddleLetters.add(card.letter);
            }
        }
    }

    const remainingOrdered = indexPerm
        .map((pi) => catalog[pi])
        .filter((c) => c && !inMiddleLetters.has(c.letter));
    let u = 0;
    for (let i = 0; i < n; i++) {
        if (middle[i]) {
            right[i] = null;
        } else {
            right[i] = remainingOrdered[u++] ?? null;
        }
    }

    return { middle, right };
}

function rowsToPayload(lefts, middle) {
    return JSON.stringify(
        lefts.map((left, i) => ({
            left_id: left.id,
            answer: middle[i]?.item?.value ?? "",
        }))
    );
}

/**
 * Layout 3 kolom: pernyataan | zona drop (putus-putus) | bank jawaban (A. B. …).
 * Drag & drop HTML5 + tap kartu lalu tap target.
 */
export default function MatchingQuestionBlock({
    pairs,
    value,
    onChange,
    disabled = false,
}) {
    const lefts = useMemo(() => pairs.map((p) => ({ id: p.id, item: p.left })), [pairs]);
    const pairsKey = useMemo(() => JSON.stringify(pairs), [pairs]);
    const n = lefts.length;

    /** Deck kartu (huruf + teks acak) dan permutasi posisi bank — sekali per soal. */
    const { cardDeck, indexPerm } = useMemo(() => {
        const deck = buildShuffledCardDeck(pairs);
        const len = deck.length;
        const idx = Array.from({ length: len }, (_, i) => i);
        return { cardDeck: deck, indexPerm: shuffle(idx) };
    }, [pairsKey]);

    const [{ middle, right }, setRows] = useState(() =>
        buildInitialRows(pairs, value, lefts, cardDeck, indexPerm)
    );
    const lastEmittedRef = useRef("");
    const pairsKeySeenRef = useRef(pairsKey);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const [dragOver, setDragOver] = useState(null);
    const [tapPick, setTapPick] = useState(null);

    useEffect(() => {
        const l = pairs.map((p) => ({ id: p.id, item: p.left }));
        const keyChanged = pairsKeySeenRef.current !== pairsKey;
        pairsKeySeenRef.current = pairsKey;

        if (keyChanged) {
            lastEmittedRef.current = "";
            setRows(buildInitialRows(pairs, value, l, cardDeck, indexPerm));
            setTapPick(null);
            return;
        }

        if (value === lastEmittedRef.current) {
            return;
        }
        setRows(buildInitialRows(pairs, value, l, cardDeck, indexPerm));
        setTapPick(null);
    }, [pairsKey, value, pairs, cardDeck, indexPerm]);

    useEffect(() => {
        const json = rowsToPayload(lefts, middle);
        if (json !== lastEmittedRef.current) {
            lastEmittedRef.current = json;
            onChangeRef.current(json);
        }
    }, [middle, lefts]);

    const moveCard = useCallback(
        (fromZone, fromIdx, toZone, toIdx) => {
            if (disabled) return;
            setRows((prev) => {
                const m = [...prev.middle];
                const r = [...prev.right];
                const read = (z, i) => (z === "m" ? m[i] : r[i]);
                const write = (z, i, v) => {
                    if (z === "m") m[i] = v;
                    else r[i] = v;
                };

                const moving = read(fromZone, fromIdx);
                if (!moving) return prev;

                const incumbent = read(toZone, toIdx);

                write(fromZone, fromIdx, null);
                write(toZone, toIdx, moving);

                if (incumbent) {
                    write(fromZone, fromIdx, incumbent);
                }

                for (let i = 0; i < n; i++) {
                    if (m[i] && r[i]) {
                        const spill = r[i];
                        r[i] = null;
                        const k = m.findIndex(
                            (mid, j) => j !== i && !mid && !r[j]
                        );
                        if (k !== -1) r[k] = spill;
                        else r[i] = spill;
                    }
                }

                return { middle: m, right: r };
            });
        },
        [disabled, n]
    );

    const onDragStart = (e, zone, index) => {
        if (disabled) return;
        const card = zone === "m" ? middle[index] : right[index];
        if (!card) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData(
            DND_PAYLOAD,
            JSON.stringify({ zone, index })
        );
        try {
            e.dataTransfer.setData(
                "text/plain",
                `${card.letter}:${String(card.item?.value ?? "")}`
            );
        } catch {
            /* ignore */
        }
    };

    const onDragOverZone = (e) => {
        if (disabled) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const onDrop = (e, toZone, toIdx) => {
        if (disabled) return;
        e.preventDefault();
        setDragOver(null);
        const raw = e.dataTransfer.getData(DND_PAYLOAD);
        if (!raw) return;
        try {
            const { zone: fromZone, index: fromIdx } = JSON.parse(raw);
            if (fromZone === "m" || fromZone === "r") {
                moveCard(fromZone, fromIdx, toZone, toIdx);
            }
        } catch {
            /* ignore */
        }
    };

    const onTapCell = (zone, index) => {
        if (disabled) return;
        const card = zone === "m" ? middle[index] : right[index];
        if (!tapPick) {
            if (card) setTapPick({ zone, index });
            return;
        }
        if (tapPick.zone === zone && tapPick.index === index) {
            setTapPick(null);
            return;
        }
        moveCard(tapPick.zone, tapPick.index, zone, index);
        setTapPick(null);
    };

    const CardFace = ({ card, zone, index }) => {
        if (!card) return null;
        const picked =
            tapPick && tapPick.zone === zone && tapPick.index === index;
        return (
            <div
                role="button"
                tabIndex={0}
                draggable={!disabled}
                onDragStart={(e) => onDragStart(e, zone, index)}
                onDragEnd={() => setDragOver(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    onTapCell(zone, index);
                }}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        onTapCell(zone, index);
                    }
                }}
                className={`flex cursor-grab items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-sm shadow-sm select-none active:cursor-grabbing ${
                    picked
                        ? "border-indigo-500 ring-2 ring-indigo-300"
                        : "border-stone-200 hover:border-indigo-200"
                } ${disabled ? "pointer-events-none opacity-50" : ""}`}
            >
                <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 ring-1 ring-stone-200"
                    aria-hidden
                >
                    ⋮⋮
                </span>
                <span className="font-semibold text-indigo-700">{card.letter}.</span>
                <PairItemView item={card.item} compact />
            </div>
        );
    };

    if (n < 2) {
        return (
            <p className="mt-3 text-sm text-amber-800">
                Soal menjodohkan perlu minimal 2 pasangan.
            </p>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            <p className="text-xs text-stone-600 md:hidden">
                Mobile: ketuk kartu di kolom kanan, lalu ketuk kotak putus-putus di tengah.
            </p>

            <div className="hidden md:grid md:grid-cols-3 md:gap-2 md:px-1">
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
                    Pernyataan
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
                    Tempat jawaban
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-stone-500">
                    Jawaban
                </span>
            </div>

            <div className="space-y-3">
                {lefts.map((left, i) => (
                    <div
                        key={`row-${pairsKey}-${i}`}
                        className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-3 md:items-center"
                    >
                        <div className="flex gap-3 rounded-xl border border-violet-100 bg-white p-3 shadow-sm ring-1 ring-violet-100/80">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                                {i + 1}
                            </span>
                            <p className="min-w-0 flex-1 text-sm font-medium text-stone-900">
                                <PairItemView item={left.item} />
                            </p>
                        </div>

                        <div
                            role="button"
                            tabIndex={0}
                            onDragOver={(e) => {
                                onDragOverZone(e);
                                setDragOver(`m-${i}`);
                            }}
                            onDragLeave={() =>
                                setDragOver((d) => (d === `m-${i}` ? null : d))
                            }
                            onDrop={(e) => onDrop(e, "m", i)}
                            onClick={() => onTapCell("m", i)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    onTapCell("m", i);
                                }
                            }}
                            className={`flex min-h-[52px] items-center justify-center rounded-xl border-2 border-dashed px-2 py-2 ${
                                dragOver === `m-${i}`
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-stone-300 bg-stone-50/60"
                            } ${disabled ? "pointer-events-none opacity-60" : ""}`}
                        >
                            {middle[i] ? (
                                <CardFace card={middle[i]} zone="m" index={i} />
                            ) : (
                                <span className="text-xs font-medium text-stone-400">
                                    Letakkan jawaban di sini
                                </span>
                            )}
                        </div>

                        <div
                            onDragOver={(e) => {
                                onDragOverZone(e);
                                setDragOver(`r-${i}`);
                            }}
                            onDragLeave={() =>
                                setDragOver((d) => (d === `r-${i}` ? null : d))
                            }
                            onDrop={(e) => onDrop(e, "r", i)}
                            className={`flex min-h-[52px] items-center rounded-xl border border-transparent px-1 ${
                                dragOver === `r-${i}` ? "bg-indigo-50/80" : ""
                            }`}
                        >
                            {right[i] ? (
                                <CardFace card={right[i]} zone="r" index={i} />
                            ) : (
                                <span className="w-full text-center text-xs text-stone-300">
                                    —
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function normMatchKey(s) {
    return String(s ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

/** Baris review: hijau/merah + jawaban benar jika salah */
export function MatchingReviewTable({ pairs, answerRaw }) {
    const rows = useMemo(() => {
        const plist = pairs;
        let student = [];
        try {
            student = JSON.parse(answerRaw || "[]");
        } catch {
            student = [];
        }
        if (!Array.isArray(student)) student = [];
        const byLeft = Object.fromEntries(
            student.map((row) => [
                String(row?.left_id ?? row?.left ?? "").trim(),
                String(row?.answer ?? "").trim(),
            ])
        );
        return plist.map((p) => {
            const given = byLeft[String(p.id)] ?? "";
            const ok = normMatchKey(given) === normMatchKey(p.right?.value);
            return { left: p.left, given, correct: p.right, ok };
        });
    }, [pairs, answerRaw]);

    return (
        <div className="mt-3 space-y-2">
            {rows.map((row, i) => (
                <div
                    key={i}
                    className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${
                        row.ok
                            ? "border-emerald-200 bg-emerald-50/90 text-emerald-950"
                            : "border-rose-200 bg-rose-50/90 text-rose-950"
                    }`}
                >
                    <div className="font-medium">
                        <PairItemView item={row.left} />
                    </div>
                    <p className="mt-1">
                        Jawabanmu:{" "}
                        {row.correct?.type === "image" ? (
                            row.given ? (
                                <img
                                    src={toAssetUrl(row.given)}
                                    alt="jawaban siswa"
                                    className="mt-1 h-16 w-24 rounded-lg object-cover"
                                />
                            ) : (
                                <strong>—</strong>
                            )
                        ) : (
                            <strong>{row.given || "—"}</strong>
                        )}
                    </p>
                    {!row.ok ? (
                        <p className="mt-1 text-xs">
                            Benar:{" "}
                            {row.correct?.type === "image" ? (
                                <img
                                    src={toAssetUrl(row.correct?.value)}
                                    alt="correct matching"
                                    className="mt-1 h-16 w-24 rounded-lg object-cover"
                                />
                            ) : (
                                <strong>{row.correct?.value}</strong>
                            )}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    );
}
