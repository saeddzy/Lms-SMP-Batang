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
    IconCalendar,
    IconCalendarEvent,
    IconCalendarX,
    IconCheck,
    IconCircleCheck,
    IconClock,
    IconBook2,
    IconEye,
    IconPlayerPlay,
    IconSearch,
    IconSchool,
    IconX,
} from "@tabler/icons-react";

const badgeToneClass = {
    open: "bg-blue-50 text-blue-900 ring-blue-200/80",
    soon: "bg-amber-50 text-amber-900 ring-amber-200/80",
    ended: "bg-rose-50 text-rose-900 ring-rose-200/80",
    neutral: "bg-slate-50 text-slate-700 ring-slate-200/80",
};

function windowBadge(status) {
    switch (status) {
        case "buka":
            return { label: "Aktif", tone: "open" };
        case "belum":
            return { label: "Akan datang", tone: "soon" };
        case "berakhir":
            return { label: "Selesai", tone: "ended" };
        default:
            return { label: "—", tone: "neutral" };
    }
}

export default function ExamsAvailable() {
    const {
        activeExams = [],
        upcomingExams = [],
        finishedExams = [],
        attempts,
        filters = {},
        summary = {},
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

    const allExams = useMemo(
        () => [...activeExams, ...upcomingExams, ...finishedExams],
        [activeExams, upcomingExams, finishedExams]
    );

    const subjectOptions = useMemo(() => {
        const set = new Set();
        for (const exam of allExams) {
            const subjectName = exam.subject?.name;
            if (subjectName) set.add(subjectName);
        }
        return ["all", ...Array.from(set)];
    }, [allExams]);

    const parseExamStart = (exam) => {
        if (!exam) return null;

        if (exam.start_time) {
            const directStart = new Date(exam.start_time);
            if (!Number.isNaN(directStart.getTime())) {
                return directStart;
            }
        }

        if (!exam.scheduled_date) return null;

        const normalizedTime = exam.start_time
            ? String(exam.start_time).slice(0, 8)
            : "00:00:00";
        const fallbackStart = new Date(
            `${exam.scheduled_date}T${normalizedTime}`
        );

        return Number.isNaN(fallbackStart.getTime()) ? null : fallbackStart;
    };

    const examWindow = (exam) => {
        const duration = Number(exam.duration_minutes ?? exam.duration);
        const start = parseExamStart(exam);

        if (!start || Number.isNaN(duration) || duration <= 0) {
            return "invalid";
        }

        const nowDate = new Date(now);
        const end = new Date(start.getTime() + duration * 60 * 1000);

        if (nowDate < start) return "belum";
        if (nowDate >= start && nowDate <= end) return "buka";
        return "berakhir";
    };

    const formatCountdown = (seconds) => {
        const sec = Math.max(0, Number(seconds) || 0);
        const days = Math.floor(sec / 86400);
        const hours = Math.floor((sec % 86400) / 3600);
        const minutes = Math.floor((sec % 3600) / 60);

        if (days > 0) return `${days}h ${hours}j ${minutes}m`;
        if (hours > 0) return `${hours}j ${minutes}m`;
        return `${minutes}m`;
    };

    const filteredGroups = useMemo(() => {
        const applyFilters = (items, key) =>
            items.filter((exam) => {
                const matchStatus =
                    statusFilter === "all" || statusFilter === key;
                const matchSubject =
                    subjectFilter === "all" ||
                    exam.subject?.name === subjectFilter;
                return matchStatus && matchSubject;
            });

        return {
            active: applyFilters(activeExams, "active"),
            upcoming: applyFilters(upcomingExams, "upcoming"),
            ended: applyFilters(finishedExams, "ended"),
        };
    }, [activeExams, upcomingExams, finishedExams, statusFilter, subjectFilter]);

    const orderedSections = useMemo(
        () => [
            {
                key: "active",
                title: "Ujian Aktif",
                icon: IconPlayerPlay,
                iconClass: "text-indigo-600",
                empty: "Belum ada ujian aktif.",
                items: filteredGroups.active,
            },
            {
                key: "upcoming",
                title: "Akan Datang",
                icon: IconCalendarEvent,
                iconClass: "text-amber-600",
                empty: "Belum ada jadwal ujian mendatang.",
                items: filteredGroups.upcoming,
            },
            {
                key: "ended",
                title: "Sudah Berakhir",
                icon: IconCalendarX,
                iconClass: "text-rose-700",
                empty: "Belum ada ujian selesai.",
                items: filteredGroups.ended,
            },
        ],
        [filteredGroups]
    );

    const renderExamCard = (exam) => {
        const status = examWindow(exam);
        const badge = windowBadge(status);
        const latestAttempt = exam.attempts?.[0];
        const start = parseExamStart(exam);
        const duration = Number(exam.duration_minutes ?? exam.duration);
        const end =
            start && duration > 0
                ? new Date(start.getTime() + duration * 60 * 1000)
                : null;
        const toStart = start ? Math.floor((start.getTime() - now) / 1000) : 0;
        const toEnd = end ? Math.floor((end.getTime() - now) / 1000) : 0;

        const hasUnfinishedAttempt =
            latestAttempt &&
            !latestAttempt.finished_at &&
            !["finished", "submitted", "timeout"].includes(
                latestAttempt.attempt_status
            );

        const action = hasUnfinishedAttempt
            ? {
                  label: "Lanjutkan",
                  href: route("exams.attempt.take", {
                      exam: exam.id,
                      attempt: latestAttempt.id,
                  }),
                  className:
                      "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
              }
            : status === "buka"
              ? {
                    label: "Kerjakan",
                    href: route("exams.show", exam.id),
                    className:
                        "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500",
                }
              : {
                    label: status === "belum" ? "Belum Mulai" : "Lihat Detail",
                    href:
                        status === "belum"
                            ? null
                            : route("exams.show", exam.id),
                    className:
                        status === "belum"
                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                            : "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-600",
                };

        return (
            <li
                key={exam.id}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 line-clamp-1 text-base font-bold leading-snug text-slate-900">
                        {exam.title}
                    </p>
                    <span
                        className={clsx(
                            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                            badgeToneClass[badge.tone] ?? badgeToneClass.neutral
                        )}
                    >
                        {badge.label}
                    </span>
                </div>

                <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                    <IconBook2 className="h-3.5 w-3.5" />
                    <span className="line-clamp-1">
                        {exam.subject?.name ?? "Mapel"} ·{" "}
                        {exam.school_class?.name ??
                            exam.schoolClass?.name ??
                            "Kelas"}
                    </span>
                </p>

                <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600">
                    <div className="min-w-0">
                        <dt className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <IconCalendarEvent className="h-3.5 w-3.5" />
                            Mulai
                        </dt>
                        <dd className="truncate font-medium text-slate-800">
                            {exam.start_time
                                ? formatStudentDateTime(exam.start_time)
                                : "—"}
                        </dd>
                    </div>
                    <div>
                        <dt className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <IconClock className="h-3.5 w-3.5" />
                            Durasi
                        </dt>
                        <dd className="font-medium text-slate-800">
                            {exam.duration_minutes ?? exam.duration ?? "—"} menit
                        </dd>
                    </div>
                    <div>
                        <dt className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <IconEye className="h-3.5 w-3.5" />
                            Soal
                        </dt>
                        <dd className="font-medium text-slate-800">
                            {exam.questions_count ?? 0} soal
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[11px] text-slate-500">Status</dt>
                        <dd>
                            <span
                                className={clsx(
                                    "inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ring-1",
                                    badgeToneClass[badge.tone] ??
                                        badgeToneClass.neutral
                                )}
                            >
                                {badge.label}
                            </span>
                        </dd>
                    </div>
                </dl>

                <div className="mt-2 text-xs text-slate-500">
                    {status === "buka" ? (
                        <span>
                            ⏱ Sisa:{" "}
                            <strong className="tabular-nums">
                                {formatCountdown(toEnd)}
                            </strong>
                        </span>
                    ) : status === "belum" ? (
                        <span>
                            📅 Mulai dalam{" "}
                            <strong className="tabular-nums">
                                {formatCountdown(toStart)}
                            </strong>
                        </span>
                    ) : (
                        <span>🔴 Ujian sudah berakhir.</span>
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
                            {status === "buka" || hasUnfinishedAttempt ? (
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
        <DashboardLayout title="Ujian Tersedia">
            <Head title="Ujian Tersedia" />

            <StudentShell
                eyebrow="Penilaian"
                title="Ujian Tersedia"
                subtitle="Lihat ringkasan ujian aktif, jadwal mendatang, dan ujian yang sudah selesai dalam satu tampilan."
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StudentStatCard
                        icon={IconPlayerPlay}
                        label="Ujian aktif"
                        value={summary.active ?? activeExams.length}
                        hint="Perlu dikerjakan sekarang"
                        accent="indigo"
                    />
                    <StudentStatCard
                        icon={IconClock}
                        label="Menunggu"
                        value={summary.waiting ?? 0}
                        hint="Menunggu penilaian guru"
                        accent="amber"
                    />
                    <StudentStatCard
                        icon={IconCircleCheck}
                        label="Selesai"
                        value={summary.finished ?? finishedExams.length}
                        hint="Percobaan yang sudah dikumpulkan"
                        accent="emerald"
                    />
                </div>

                <section className="mt-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
                        <div className="relative">
                            <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Search
                                url={route("student.exams")}
                                placeholder="Cari judul ujian, mapel, atau kelas..."
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
                                onClick={() => setStatusFilter("upcoming")}
                                className={`rounded-full px-3 py-1 transition ${statusFilter === "upcoming" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
                            >
                                Akan Datang
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter("ended")}
                                className={`rounded-full px-3 py-1 transition ${statusFilter === "ended" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
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
                                Ujian untuk Anda
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Ringkasan ujian aktif, akan datang, dan selesai
                                dengan tampilan yang lebih ringkas.
                            </p>
                        </div>
                        <Link
                            href="/exams"
                            className="cursor-pointer text-sm font-medium text-indigo-600 hover:underline"
                        >
                            Lihat tampilan daftar ujian →
                        </Link>
                    </div>

                    {orderedSections.every((section) => section.items.length === 0) ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center">
                            <IconCalendar
                                className="mx-auto h-10 w-10 text-slate-300"
                                stroke={1.25}
                            />
                            <p className="mt-3 text-sm font-medium text-slate-700">
                                Belum ada ujian 😄
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Ujian aktif, ujian akan datang, dan ujian selesai
                                akan tampil di sini.
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
                                                {section.items.map(
                                                    renderExamCard
                                                )}
                                            </ul>
                                        ) : (
                                            <div className="py-3 text-center text-sm text-slate-400">
                                                <span className="block text-base leading-none opacity-70">
                                                    📭
                                                </span>
                                                <span>{section.empty}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="mt-12">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                📊 Riwayat Percobaan Ujian
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Riwayat semua ujian yang telah Anda kerjakan
                            </p>
                        </div>

                        {rows.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                                    <IconSchool
                                        className="h-8 w-8 text-slate-300"
                                        stroke={1.25}
                                    />
                                </div>
                                <p className="mb-2 text-lg font-semibold text-slate-900">
                                    Belum Ada Riwayat
                                </p>
                                <p className="text-sm text-slate-500">
                                    Riwayat akan muncul setelah Anda mengerjakan ujian
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                <div className="divide-y divide-slate-100">
                                    {rows.map((att) => {
                                        const exam = att.exam;
                                        const passed = att.passed;
                                        const isPending =
                                            att.attempt_status ===
                                                "submitted" ||
                                            att.attempt_status ===
                                                "menunggu_penilaian";
                                        const score = att.score;
                                        const scoreColor =
                                            score >= 90
                                                ? "text-emerald-600"
                                                : score >= 70
                                                  ? "text-amber-600"
                                                  : "text-rose-600";

                                        return (
                                            <div
                                                key={att.id}
                                                className="group flex items-center justify-between p-3 transition-colors duration-200 hover:bg-slate-50"
                                            >
                                                <div className="min-w-0 flex-1 pr-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="mb-0.5 line-clamp-1 text-sm font-semibold leading-tight text-slate-900">
                                                                {exam?.title ??
                                                                    "Ujian"}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                                <span className="flex items-center gap-0.5">
                                                                    <IconBook2 className="h-3.5 w-3.5" />
                                                                    {exam?.subject
                                                                        ?.name ??
                                                                        "Mapel"}
                                                                </span>
                                                                <span>•</span>
                                                                <span>
                                                                    {exam
                                                                        ?.school_class
                                                                        ?.name ??
                                                                        exam
                                                                            ?.schoolClass
                                                                            ?.name ??
                                                                        "Kelas"}
                                                                </span>
                                                            </div>
                                                            <p className="mt-0.5 flex items-center gap-0.5 text-xs text-slate-500">
                                                                <IconCalendarEvent className="h-3 w-3" />
                                                                {formatStudentDateTime(
                                                                    att.finished_at ??
                                                                        att.updated_at
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-shrink-0 flex-col items-end gap-1.5">
                                                    <div className="text-right">
                                                        <p className="mb-0.5 text-xs text-slate-500">
                                                            Nilai
                                                        </p>
                                                        <div
                                                            className={clsx(
                                                                "text-xl font-bold tabular-nums transition-colors",
                                                                scoreColor
                                                            )}
                                                        >
                                                            {isPending ? (
                                                                <span className="text-xs">
                                                                    ...
                                                                </span>
                                                            ) : score != null ? (
                                                                `${score}%`
                                                            ) : (
                                                                "-"
                                                            )}
                                                        </div>
                                                    </div>

                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold transition-colors ${
                                                            isPending
                                                                ? "border border-amber-200 bg-amber-100 text-amber-700"
                                                                : passed
                                                                  ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
                                                                  : "border border-rose-200 bg-rose-100 text-rose-700"
                                                        }`}
                                                    >
                                                        {isPending ? (
                                                            <span>
                                                                <IconClock className="h-2.5 w-2.5" />{" "}
                                                                Menunggu
                                                            </span>
                                                        ) : passed ? (
                                                            <span>
                                                                <IconCheck className="h-2.5 w-2.5" />{" "}
                                                                Lulus
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                <IconX className="h-2.5 w-2.5" />{" "}
                                                                Tidak Lulus
                                                            </span>
                                                        )}
                                                    </span>

                                                    {exam?.id && (
                                                        <Link
                                                            href={route(
                                                                "exams.attempt.result",
                                                                {
                                                                    exam: exam.id,
                                                                    attempt:
                                                                        att.id,
                                                                }
                                                            )}
                                                            className="inline-flex items-center gap-0.5 px-2 py-1 text-xs font-medium text-slate-600 transition-all duration-200 hover:text-slate-900 hover:underline"
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

                    {attempts?.last_page > 1 && (
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
