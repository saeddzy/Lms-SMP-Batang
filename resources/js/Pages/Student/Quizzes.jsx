import React, { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, {
    formatStudentDateTime,
} from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Pagination from "@/Components/Pagination";
import Search from "@/Components/Search";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconBrain,
    IconCircleCheck,
    IconClock,
    IconSearch,
    IconSparkles,
    IconPlayerPlayFilled,
    IconCheck,
    IconBook2,
    IconCalendarEvent,
    IconCalendarX,
    IconPlayerPlay,
    IconEye,
    IconTrophy,
    IconX,
} from "@tabler/icons-react";

function windowBadge(q) {
    switch (q.window) {
        case "buka":
            return { label: "Jadwal dibuka", tone: "open" };
        case "belum_mulai":
            return { label: "Belum waktu mulai", tone: "soon" };
        case "berakhir":
            return { label: "Sudah berakhir", tone: "ended" };
        case "jadwal_tidak_lengkap":
            return { label: "Jadwal belum lengkap", tone: "warn" };
        default:
            return { label: "—", tone: "neutral" };
    }
}

const badgeToneClass = {
    open: "bg-blue-50 text-blue-900 ring-blue-200/80",
    soon: "bg-amber-50 text-amber-900 ring-amber-200/80",
    ended: "bg-rose-50 text-rose-900 ring-rose-200/80",
    warn: "bg-amber-50 text-amber-950 ring-amber-200/80",
    neutral: "bg-slate-50 text-slate-700 ring-slate-200/80",
};

function toDateTime(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
}

function formatCountdown(totalSeconds) {
    const sec = Math.max(0, Number(totalSeconds) || 0);
    const days = Math.floor(sec / 86400);
    const hours = Math.floor((sec % 86400) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    if (days > 0) return `${days}h ${hours}j ${minutes}m`;
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m ${seconds}d`;
}

export default function StudentQuizzes() {
    const {
        attempts,
        availableQuizzes = [],
        filters = {},
    } = usePage().props;

    const rows = attempts?.data ?? [];
    const total = attempts?.total ?? 0;
    const [now, setNow] = useState(() => Date.now());
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const waitingCount = useMemo(
        () =>
            rows.filter((a) =>
                ["submitted", "menunggu_penilaian"].includes(a.attempt_status)
            ).length,
        [rows]
    );

    const subjectOptions = useMemo(() => {
        const set = new Set();
        for (const q of availableQuizzes) {
            if (q.subject) set.add(q.subject);
        }
        return ["all", ...Array.from(set)];
    }, [availableQuizzes]);

    const filteredQuizzes = useMemo(() => {
        return availableQuizzes.filter((q) => {
            const matchStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && q.window === "buka") ||
                (statusFilter === "done" && q.window === "berakhir");
            const matchSubject =
                subjectFilter === "all" || q.subject === subjectFilter;
            return matchStatus && matchSubject;
        });
    }, [availableQuizzes, statusFilter, subjectFilter]);

    const groupedQuizzes = useMemo(() => {
        const groups = { active: [], upcoming: [], ended: [] };
        for (const q of filteredQuizzes) {
            if (q.window === "buka") {
                groups.active.push(q);
            } else if (q.window === "belum_mulai") {
                groups.upcoming.push(q);
            } else {
                groups.ended.push(q);
            }
        }
        return groups;
    }, [filteredQuizzes]);

    const featuredQuiz = useMemo(() => {
        return groupedQuizzes.active[0] ?? null;
    }, [groupedQuizzes.active]);

    const orderedSections = useMemo(() => {
        const base = [
            {
                key: "active",
                title: "Kuis Aktif",
                icon: IconPlayerPlay,
                iconClass: "text-indigo-600",
                empty: "📭 Belum ada kuis aktif. Silakan tunggu guru Anda.",
                items: groupedQuizzes.active,
                priority: 0,
            },
            {
                key: "upcoming",
                title: "Akan Datang",
                icon: IconCalendarEvent,
                iconClass: "text-amber-600",
                empty: "📭 Belum ada jadwal kuis mendatang.",
                items: groupedQuizzes.upcoming,
                priority: 1,
            },
            {
                key: "ended",
                title: "Sudah Berakhir",
                icon: IconCalendarX,
                iconClass: "text-rose-700",
                empty: "📭 Belum ada kuis berstatus berakhir.",
                items: groupedQuizzes.ended,
                priority: 2,
            },
        ];

        return [...base].sort((a, b) => {
            const aHas = a.items.length > 0 ? 1 : 0;
            const bHas = b.items.length > 0 ? 1 : 0;
            if (aHas !== bHas) return bHas - aHas;
            return a.priority - b.priority;
        });
    }, [groupedQuizzes]);

    const renderQuizCard = (q) => {
        const b = windowBadge(q);
        const startAt = toDateTime(q.start_time);
        const endAt = toDateTime(q.end_time);
        const hasFinishedAttempt = (q.attempts_count ?? 0) > 0 && !q.can_try;
        const isOpen = q.window === "buka";
        const isUpcoming = q.window === "belum_mulai";
        const isEnded = q.window === "berakhir";

        const secondsToStart = startAt
            ? Math.max(0, Math.floor((startAt.getTime() - now) / 1000))
            : 0;
        const secondsToEnd = endAt
            ? Math.max(0, Math.floor((endAt.getTime() - now) / 1000))
            : 0;

        const action = q.can_try
            ? {
                  label: q.unfinished_attempt_id ? "Lanjutkan" : "Kerjakan",
                  href: route("quizzes.show", q.id),
                  className:
                      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
              }
            : isUpcoming
              ? {
                    label: "Belum Mulai",
                    href: null,
                    className: "bg-slate-100 text-slate-500 cursor-not-allowed",
                }
              : hasFinishedAttempt || isEnded
                ? {
                      label: "Lihat Detail",
                      href: route("quizzes.show", q.id),
                      className:
                          "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-600",
                  }
                : {
                      label: "Detail",
                      href: route("quizzes.show", q.id),
                      className:
                          "bg-slate-200 text-slate-700 hover:bg-slate-300 focus-visible:ring-slate-400",
                  };

        return (
            <li
                key={q.id}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 line-clamp-1 text-base font-bold leading-snug text-slate-900">
                        {q.title}
                    </p>
                    <span
                        className={clsx(
                            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                            badgeToneClass[b.tone] ?? badgeToneClass.neutral
                        )}
                    >
                        {b.label}
                    </span>
                </div>

                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <IconBook2 className="h-3.5 w-3.5" />
                    <span className="line-clamp-1">
                        {q.subject} · {q.class}
                    </span>
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600">
                    <div className="min-w-0">
                        <dt className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <IconCalendarEvent className="h-3.5 w-3.5" />
                            Mulai
                        </dt>
                        <dd className="truncate font-medium text-slate-800">
                            {q.start_time
                                ? formatStudentDateTime(q.start_time)
                                : "—"}
                        </dd>
                    </div>
                    <div>
                        <dt className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <IconClock className="h-3.5 w-3.5" />
                            Durasi
                        </dt>
                        <dd className="font-medium text-slate-800">
                            {q.duration_minutes ??
                                q.duration ??
                                q.time_limit ??
                                "—"}{" "}
                            menit
                        </dd>
                    </div>
                    <div>
                        <dt className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <IconBrain className="h-3.5 w-3.5" />
                            Soal
                        </dt>
                        <dd className="font-medium text-slate-800">
                            {q.questions_count ?? 0} soal
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[11px] text-slate-500">Status</dt>
                        <dd>
                            <span
                                className={clsx(
                                    "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ring-1",
                                    badgeToneClass[b.tone] ??
                                        badgeToneClass.neutral
                                )}
                            >
                                {isOpen
                                    ? "Aktif"
                                    : isUpcoming
                                      ? "Akan datang"
                                      : "Berakhir"}
                            </span>
                        </dd>
                    </div>
                </dl>

                <div className="mt-2 text-xs text-slate-500">
                    {isOpen ? (
                        <span>
                            ⏱ Sisa:{" "}
                            <strong className="tabular-nums">
                                {formatCountdown(secondsToEnd)}
                            </strong>
                        </span>
                    ) : isUpcoming ? (
                        <span>
                            📅 Mulai dalam{" "}
                            <strong className="tabular-nums">
                                {formatCountdown(secondsToStart)}
                            </strong>
                        </span>
                    ) : (
                        <span>🔴 Kuis sudah berakhir.</span>
                    )}
                </div>

                <div className="mt-3">
                    {action.href ? (
                        <Link
                            href={action.href}
                            className={clsx(
                                "inline-flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 hover:shadow-md sm:w-auto",
                                action.className
                            )}
                        >
                            {isOpen ? (
                                <IconPlayerPlay className="h-3.5 w-3.5" />
                            ) : (
                                <IconEye className="h-3.5 w-3.5" />
                            )}
                            {action.label}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            disabled
                            className={clsx(
                                "inline-flex w-full items-center justify-center gap-1 rounded-md px-3 py-2 text-xs font-medium sm:w-auto",
                                action.className
                            )}
                        >
                            <IconClock className="h-3.5 w-3.5" />
                            {action.label}
                        </button>
                    )}
                </div>
            </li>
        );
    };

    return (
        <DashboardLayout title="Kuis Saya">
            <Head title="Kuis Saya" />

            <StudentShell
                eyebrow="Penilaian"
                title="Kuis Saya"
                subtitle="Lihat kuis aktif, jadwal mendatang, dan kuis yang sudah berakhir dalam satu tampilan."
            >
                {featuredQuiz && (
                    <section className="rounded-2xl border border-indigo-300/70 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                                    <IconSparkles className="h-3.5 w-3.5" />
                                    Prioritas Utama
                                </p>
                                <h2 className="mt-2 line-clamp-1 text-2xl font-bold">
                                    {featuredQuiz.title}
                                </h2>
                                <p className="mt-1 text-sm text-blue-100">
                                    {featuredQuiz.subject} · {featuredQuiz.class}
                                </p>
                                <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-blue-50">
                                    <IconClock className="h-4 w-4 animate-pulse" />
                                    Sisa waktu{" "}
                                    <span className="rounded-md bg-white/20 px-2 py-0.5 tabular-nums">
                                        {formatCountdown(
                                            Math.max(
                                                0,
                                                Math.floor(
                                                    ((toDateTime(featuredQuiz.end_time)?.getTime() ??
                                                        now) -
                                                        now) /
                                                        1000
                                                )
                                            )
                                        )}
                                    </span>
                                </p>
                            </div>
                            <Link
                                href={route("quizzes.show", featuredQuiz.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-[0_0_24px_rgba(255,255,255,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(255,255,255,0.6)]"
                            >
                                <IconPlayerPlayFilled className="h-4 w-4" />
                                Lanjutkan Kuis
                            </Link>
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StudentStatCard
                        icon={IconPlayerPlay}
                        label="Kuis aktif"
                        value={groupedQuizzes.active.length}
                        hint="Perlu dikerjakan sekarang"
                        accent="indigo"
                    />
                    <StudentStatCard
                        icon={IconClock}
                        label="Menunggu"
                        value={waitingCount}
                        hint="Menunggu penilaian guru"
                        accent="amber"
                    />
                    <StudentStatCard
                        icon={IconCircleCheck}
                        label="Selesai"
                        value={rows.length}
                        hint="Percobaan yang sudah dikumpulkan"
                        accent="emerald"
                    />
                </div>

                <section className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
                        <div className="relative">
                            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Search
                    url={route("student.quizzes")}
                    placeholder="Cari judul kuis, mapel, atau kelas..."
                    filter={{ search: filters.search ?? "" }}
                                className="[&_.search-input]:rounded-full [&_.search-input]:pl-9"
                            />
                        </div>
                        <div className="flex items-center rounded-full bg-slate-100 p-1 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setStatusFilter("all")}
                                className={`rounded-full px-3 py-1 transition ${statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter("active")}
                                className={`rounded-full px-3 py-1 transition ${statusFilter === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                            >
                                Aktif
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter("done")}
                                className={`rounded-full px-3 py-1 transition ${statusFilter === "done" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                            >
                                Selesai
                            </button>
                        </div>
                        <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-300"
                        >
                            {subjectOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt === "all" ? "Semua mapel" : opt}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>

                <section className="mt-8">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                Prioritas Kuis Anda
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Fokus kerjakan kuis aktif terlebih dahulu, lalu pantau kuis yang akan datang.
                            </p>
                        </div>
                        <Link
                            href={route("quizzes.index")}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            Lihat tampilan daftar kuis →
                        </Link>
                    </div>

                    {availableQuizzes.length === 0 ? (
                        <div className="rounded-lg py-6 text-center">
                            <IconBrain
                                className="mx-auto h-8 w-8 text-slate-300"
                                stroke={1.25}
                            />
                            <p className="mt-2 text-sm font-medium text-slate-700">
                                Belum ada kuis untuk ditampilkan
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Kuis aktif, kuis akan datang, dan kuis berakhir akan muncul di sini.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orderedSections.map((section) => {
                                const SectionIcon = section.icon;
                                return (
                                    <div key={section.key}>
                                        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                                            <SectionIcon
                                                className={clsx(
                                                    "h-4 w-4",
                                                    section.iconClass
                                                )}
                                            />
                                            {section.title}
                                        </h3>
                                        {section.items.length > 0 ? (
                                            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                {section.items.map(renderQuizCard)}
                                            </ul>
                                        ) : (
                                            <div className="py-3 text-center text-sm text-slate-400">
                                                <span className="block text-base leading-none opacity-70">
                                                    📭
                                            </span>
                                                <span>{section.empty.replace("📭 ", "")}</span>
                                            </div>
                                        )}
                                        </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="mt-12">
                    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-lg overflow-hidden">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-900">📊 Riwayat Percobaan Kuis</h2>
                            <p className="mt-1 text-sm text-slate-600">Riwayat semua kuis yang telah Anda kerjakan</p>
                        </div>

                        {rows.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IconTrophy className="h-8 w-8 text-slate-300" stroke={1.25} />
                                </div>
                                <p className="text-lg font-semibold text-slate-900 mb-2">Belum Ada Riwayat</p>
                                <p className="text-sm text-slate-500">Riwayat akan muncul setelah Anda mengerjakan kuis</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                <div className="divide-y divide-slate-100">
                                    {rows.map((att) => {
                                        const q = att.quiz;
                                        const passed = att.passed;
                                        const isPending = att.attempt_status === "menunggu_penilaian";
                                        const score = att.score;
                                        
                                        // Dynamic score color
                                        const scoreColor = score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-rose-600';
                                        const scoreBg = score >= 90 ? 'bg-emerald-50' : score >= 70 ? 'bg-amber-50' : 'bg-rose-50';
                                        
                                        return (
                                            <div 
                                                key={att.id}
                                                className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors duration-200 group"
                                            >
                                                {/* Left Content */}
                                                <div className="flex-1 min-w-0 pr-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-slate-900 text-sm leading-tight mb-0.5 line-clamp-1">
                                                                {q?.title ?? "Kuis"}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                                <span className="flex items-center gap-0.5">
                                                                    <IconBook2 className="h-3.5 w-3.5" />
                                                                    {q?.subject?.name ?? "Mapel"}
                                                                </span>
                                                                <span>•</span>
                                                                <span>{q?.school_class?.name ?? "Kelas"}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-0.5">
                                                                <IconCalendarEvent className="h-3 w-3" />
                                                                {formatStudentDateTime(att.finished_at ?? att.updated_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right Content */}
                                                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                    {/* Score - Prioritas Utama */}
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500 mb-0.5">Nilai</p>
                                                        <div className={`font-bold text-xl tabular-nums transition-colors ${scoreColor}`}>
                                                            {isPending ? (
                                                                <span className="text-xs">...</span>
                                                            ) : score != null ? (
                                                                `${score}%`
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status Badge - Dipisah dari nilai */}
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                                                            isPending
                                                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                                : passed
                                                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                                  : 'bg-rose-100 text-rose-700 border border-rose-200'
                                                        }`}
                                                    >
                                                        {isPending ? (
                                                            <span><IconClock className="h-2.5 w-2.5" /> Menunggu</span>
                                                        ) : passed ? (
                                                            <span><IconCheck className="h-2.5 w-2.5" /> Lulus</span>
                                                        ) : (
                                                            <span><IconX className="h-2.5 w-2.5" /> Tidak Lulus</span>
                                                        )}
                                                    </span>

                                                    {/* Action Button - Terpisah */}
                                                    {q?.id && (
                                                        <Link
                                                            href={route("quizzes.show", q.id)}
                                                            className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline transition-all duration-200"
                                                        >
                                                            <IconEye className="h-3 w-3" />
                                                            Lihat Detail
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {attempts.last_page > 1 && (
                        <div className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                            <Pagination
                                links={attempts.links}
                                currentPage={attempts.current_page}
                                lastPage={attempts.last_page}
                                from={attempts.from}
                                to={attempts.to}
                                total={attempts.total}
                            />
                        </div>
                    )}

                    <p className="mt-4 text-center text-xs text-slate-400">
                        Menampilkan {rows.length} dari {total} percobaan
                    </p>
                </section>
            </StudentShell>
        </DashboardLayout>
    );
}
