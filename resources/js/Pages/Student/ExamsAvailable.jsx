import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, { formatStudentDateTime } from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Pagination from "@/Components/Pagination";
import Search from "@/Components/Search";
import { Head, usePage, Link } from "@inertiajs/react";
import {
    IconTestPipe,
    IconCircleCheck,
    IconPercentage,
    IconSearch,
    IconSparkles,
    IconPlayerPlayFilled,
    IconCheck,
    IconBook2,
    IconFileText,
    IconCalendarEvent,
    IconCalendarX,
    IconCalendar,
    IconClock,
    IconSchool,
    IconX,
    IconEye,
} from "@tabler/icons-react";

export default function ExamsAvailable() {
    const { exams, summary = {}, filters = {} } = usePage().props;

    const rows = exams?.data ?? [];
    const total = exams?.total ?? 0;
    const [now, setNow] = useState(() => Date.now());
    const [statusFilter, setStatusFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getLatestAttempt = (exam) => exam.attempts?.[0] ?? null;
    const isCompletedAttempt = (attempt) =>
        Boolean(
            attempt?.finished_at ||
                ["finished", "submitted", "timeout"].includes(
                    attempt?.attempt_status
                )
        );

    const activeExams = rows.filter((exam) => {
        const attemptsUsed = exam.attempts?.filter(isCompletedAttempt).length || 0;
        const maxAttempts = exam.max_attempts || 1;
        const hasUnfinished = exam.attempts?.some((a) => !isCompletedAttempt(a));
        
        return attemptsUsed < maxAttempts || hasUnfinished;
    });

    const completedExams = rows.filter((exam) => 
        exam.attempts?.some(isCompletedAttempt)
    );

    const waitingCount = useMemo(
        () =>
            completedExams.filter((exam) => {
                const latestAttempt = getLatestAttempt(exam);
                return latestAttempt && ["submitted", "menunggu_penilaian"].includes(latestAttempt.attempt_status);
            }).length,
        [completedExams]
    );

    const examTypeLabel = (type) => {
        const types = {
            mid_term: "UTS",
            final: "UAS",
            quiz: "Kuis",
            practice: "Latihan",
        };
        return types[type] || type;
    };

    const formatExamDate = (value) => {
        if (!value) return "—";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "—";
        return d.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const parseExamStart = (exam) => {
        if (!exam) return null;

        // Prioritaskan datetime penuh jika backend sudah mengirimkannya.
        if (exam.start_time) {
            const directStart = new Date(exam.start_time);
            if (!Number.isNaN(directStart.getTime())) {
                return directStart;
            }
        }

        if (!exam.scheduled_date) return null;

        // Fallback gabungan tanggal + jam lokal jika start_time berupa "HH:mm[:ss]".
        const normalizedTime = exam.start_time
            ? String(exam.start_time).slice(0, 8)
            : "00:00:00";
        const fallbackStart = new Date(`${exam.scheduled_date}T${normalizedTime}`);
        if (Number.isNaN(fallbackStart.getTime())) {
            return null;
        }
        return fallbackStart;
    };

    const examWindow = (exam) => {
        const duration = Number(exam.duration_minutes ?? exam.duration);
        const start = parseExamStart(exam);
        if (!start || Number.isNaN(duration) || duration <= 0) return "invalid";

        const nowDate = new Date(now);
        const end = new Date(start.getTime() + duration * 60 * 1000);

        if (nowDate < start) return "belum";
        if (nowDate >= start && nowDate <= end) return "buka";
        return "berakhir";
    };

    const studentAttemptState = (exam) => {
        const latestAttempt = exam.attempts?.[0];
        if (!latestAttempt) {
            return null;
        }

        if (!isCompletedAttempt(latestAttempt)) {
            return "berlangsung_siswa";
        }
        
        const attemptsUsed = exam.attempts?.filter(isCompletedAttempt).length || 0;
        const maxAttempts = exam.max_attempts || 1;
        
        if (attemptsUsed >= maxAttempts) {
            return "selesai_siswa";
        }

        return null;
    };

    const examStatus = (exam) => {
        return studentAttemptState(exam) ?? examWindow(exam);
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

    const subjectOptions = useMemo(() => {
        const set = new Set();
        for (const exam of activeExams) {
            if (exam.subject?.name) set.add(exam.subject.name);
        }
        return ["all", ...Array.from(set)];
    }, [activeExams]);

    const filteredActiveExams = useMemo(() => {
        return activeExams.filter((exam) => {
            const status = examStatus(exam);
            const matchStatus =
                statusFilter === "all" ||
                (statusFilter === "active" &&
                    (status === "buka" || status === "berlangsung_siswa")) ||
                (statusFilter === "done" &&
                    ["berakhir", "selesai_siswa"].includes(status));
            const matchSubject =
                subjectFilter === "all" ||
                exam.subject?.name === subjectFilter;
            return matchStatus && matchSubject;
        });
    }, [activeExams, statusFilter, subjectFilter, now]);

    const groupedExams = useMemo(() => {
        const groups = { active: [], upcoming: [], ended: [] };
        for (const exam of filteredActiveExams) {
            const status = examStatus(exam);
            if (status === "buka" || status === "berlangsung_siswa") {
                groups.active.push(exam);
            } else if (status === "belum") {
                groups.upcoming.push(exam);
            } else {
                groups.ended.push(exam);
            }
        }
        return groups;
    }, [filteredActiveExams, now]);

    const featuredExam = useMemo(() => {
        return (
            groupedExams.active.find((exam) => examStatus(exam) === "berlangsung_siswa") ??
            groupedExams.active[0] ??
            null
        );
    }, [groupedExams, now]);

    const orderedSections = useMemo(() => {
        const sections = [
            {
                key: "active",
                title: "Ujian Aktif",
                icon: IconPlayerPlayFilled,
                iconClass: "text-yellow-700",
                empty: "Belum ada ujian aktif.",
                items: groupedExams.active,
                priority: 0,
            },
            {
                key: "upcoming",
                title: "Akan Datang",
                icon: IconCalendarEvent,
                iconClass: "text-blue-700",
                empty: "Belum ada jadwal ujian mendatang.",
                items: groupedExams.upcoming,
                priority: 1,
            },
            {
                key: "ended",
                title: "Sudah Berakhir",
                icon: IconCalendarX,
                iconClass: "text-rose-700",
                empty: "Belum ada ujian berakhir.",
                items: groupedExams.ended,
                priority: 2,
            },
        ];
        return [...sections].sort((a, b) => {
            const aHas = a.items.length > 0 ? 1 : 0;
            const bHas = b.items.length > 0 ? 1 : 0;
            if (aHas !== bHas) return bHas - aHas;
            return a.priority - b.priority;
        });
    }, [groupedExams]);

    const renderExamCard = (exam) => {
        const status = examStatus(exam);
        const latestAttempt = exam.attempts?.[0];
        const start = parseExamStart(exam);
        const duration = Number(exam.duration_minutes ?? exam.duration);
        const end = start && duration > 0 ? new Date(start.getTime() + duration * 60 * 1000) : null;
        const toStart = start ? Math.floor((start.getTime() - now) / 1000) : 0;
        const toEnd = end ? Math.floor((end.getTime() - now) / 1000) : 0;

        const badgeClass =
            status === "berlangsung_siswa"
                ? "bg-amber-50 text-amber-900 ring-amber-200/80"
                : status === "buka"
                  ? "bg-yellow-50 text-yellow-900 ring-yellow-200/80"
                  : status === "belum"
                    ? "bg-blue-50 text-blue-900 ring-blue-200/80"
                    : "bg-rose-50 text-rose-900 ring-rose-200/80";

        const action =
            status === "berlangsung_siswa" && latestAttempt
                ? {
                      label: "Lanjutkan",
                      href: route("exams.attempt.take", {
                          exam: exam.id,
                          attempt: latestAttempt.id,
                      }),
                      className: "bg-amber-600 text-white hover:bg-amber-700",
                  }
                : status === "buka"
                  ? {
                        label: "Mulai Ujian",
                        href: route("exams.show", exam.id),
                        className: "bg-indigo-600 text-white hover:bg-indigo-700",
                    }
                  : {
                        label: status === "belum" ? "Belum Mulai" : "Lihat Detail",
                        href: status === "belum" ? null : route("exams.show", exam.id),
                        className:
                            status === "belum"
                                ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                                : "bg-slate-900 text-white hover:bg-slate-800",
                    };

        return (
            <li
                key={exam.id}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
                <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-bold text-slate-900">{exam.title}</p>
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ${badgeClass}`}>
                        {status === "berlangsung_siswa"
                            ? "Lanjutkan"
                            : status === "buka"
                              ? "Berlangsung"
                              : status === "belum"
                                ? "Belum Dikerjakan"
                                : "Berakhir"}
                    </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <IconBook2 className="h-3.5 w-3.5" />
                    <span className="line-clamp-1">
                        {exam.subject?.name ?? "Mapel"} · {exam.school_class?.name ?? "Kelas"}
                    </span>
                </p>
                <dl className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-slate-600">
                    <div>
                        <dt className="text-[11px] text-slate-500">Jadwal</dt>
                        <dd className="line-clamp-1 font-medium text-slate-800">
                            {exam.start_time ? formatStudentDateTime(exam.start_time) : formatExamDate(exam.scheduled_date)}
                        </dd>
                    </div>
                    <div>
                        <dt className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <IconClock className="h-3.5 w-3.5" />
                            Durasi
                        </dt>
                        <dd className="font-medium text-slate-800">{exam.duration_minutes || exam.duration} menit</dd>
                    </div>
                    <div>
                        <dt className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <IconFileText className="h-3.5 w-3.5" />
                            Soal
                        </dt>
                        <dd className="font-medium text-slate-800">{exam.questions_count ?? 0} soal</dd>
                    </div>
                    <div>
                        <dt className="text-[11px] text-slate-500">Jenis</dt>
                        <dd className="font-medium text-slate-800">{examTypeLabel(exam.exam_type)}</dd>
                    </div>
                </dl>
                <div className="mt-2 text-xs text-slate-500">
                    {status === "buka" || status === "berlangsung_siswa" ? (
                        <span className="inline-flex items-center gap-1">
                            <IconClock className="h-3.5 w-3.5 animate-pulse text-yellow-600" />
                            Sisa waktu <strong className="tabular-nums">{formatCountdown(toEnd)}</strong>
                        </span>
                    ) : status === "belum" ? (
                        <span>Mulai dalam <strong className="tabular-nums">{formatCountdown(toStart)}</strong></span>
                    ) : (
                        <span>Waktu ujian sudah terlewat.</span>
                    )}
                </div>
                <div className="mt-3">
                    {action.href ? (
                        <Link
                            href={action.href}
                            className={`inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs font-medium shadow-sm transition-all duration-200 hover:shadow-md sm:w-auto ${action.className}`}
                        >
                            {action.label}
                        </Link>
                    ) : (
                        <button
                            type="button"
                            disabled
                            className={`inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs font-medium sm:w-auto ${action.className}`}
                        >
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
                subtitle="Daftar ujian yang tersedia untuk kelas Anda"
            >
                {featuredExam && (
                    <section className="rounded-2xl border border-indigo-300/70 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 text-white shadow-md">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="min-w-0">
                                <p className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
                                    <IconSparkles className="h-3.5 w-3.5" />
                                    Prioritas Utama
                                </p>
                                <h2 className="mt-2 line-clamp-1 text-2xl font-bold">{featuredExam.title}</h2>
                                <p className="mt-1 text-sm text-blue-100">
                                    {featuredExam.subject?.name ?? "Mapel"} · {featuredExam.school_class?.name ?? "Kelas"}
                                </p>
                            </div>
                            <Link
                                href={route("exams.show", featuredExam.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-[0_0_24px_rgba(255,255,255,0.45)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(255,255,255,0.6)]"
                            >
                                <IconPlayerPlayFilled className="h-4 w-4" />
                                Lanjutkan Ujian
                            </Link>
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StudentStatCard
                        icon={IconPlayerPlayFilled}
                        label="Ujian aktif"
                        value={groupedExams.active.length}
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
                        value={completedExams.length}
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
                    <div className="mb-4">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ujian untuk Anda</h2>
                        <p className="mt-1 text-sm text-slate-600">
                            Ujian baru atau yang belum selesai dikerjakan.
                        </p>
                    </div>

                    {filteredActiveExams.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-12 text-center">
                            <IconCalendar className="mx-auto h-10 w-10 text-slate-300" stroke={1.25} />
                            <p className="mt-3 text-sm font-medium text-slate-700">Belum ada ujian 😄</p>
                            <p className="mt-1 text-sm text-slate-500">Coba ubah filter atau tunggu guru menambahkan ujian.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {orderedSections.map((section) => {
                                const SectionIcon = section.icon;
                                return (
                                    <div key={section.key}>
                                        <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                                            <SectionIcon className={`h-4 w-4 ${section.iconClass}`} />
                                            {section.title}
                                        </h3>
                                        {section.items.length > 0 ? (
                                            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                {section.items.map(renderExamCard)}
                                            </ul>
                                        ) : (
                                            <div className="py-3 text-center text-sm text-slate-400">📭 {section.empty}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <section className="mt-8">
                    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-lg overflow-hidden">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-900">📋 Riwayat Ujian</h2>
                            <p className="mt-1 text-sm text-slate-600">Riwayat semua ujian yang telah Anda kerjakan</p>
                        </div>

                        {completedExams.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <IconSchool className="h-8 w-8 text-slate-300" stroke={1.25} />
                                </div>
                                <p className="text-lg font-semibold text-slate-900 mb-2">Belum Ada Riwayat</p>
                                <p className="text-sm text-slate-500">Riwayat akan muncul setelah Anda mengerjakan ujian</p>
                            </div>
                        ) : (
                            <div className="max-h-96 overflow-y-auto">
                                <div className="divide-y divide-slate-100">
                                    {completedExams.map((exam) => {
                                        const latestAttempt = getLatestAttempt(exam);
                                        const isPending =
                                            latestAttempt?.attempt_status === "submitted" ||
                                            latestAttempt?.attempt_status === "menunggu_penilaian";
                                        const score = latestAttempt?.score;
                                        const passed = latestAttempt?.passed;
                                        
                                        // Dynamic score color
                                        const scoreColor = score >= 90 ? 'text-emerald-600' : score >= 70 ? 'text-amber-600' : 'text-rose-600';
                                        const scoreBg = score >= 90 ? 'bg-emerald-50' : score >= 70 ? 'bg-amber-50' : 'bg-rose-50';
                                        
                                        return (
                                            <div 
                                                key={exam.id}
                                                className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors duration-200 group"
                                            >
                                                {/* Left Content */}
                                                <div className="flex-1 min-w-0 pr-3">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-slate-900 text-sm leading-tight mb-0.5 line-clamp-1">
                                                                {exam.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                                <span className="flex items-center gap-0.5">
                                                                    <IconTestPipe className="h-3.5 w-3.5" />
                                                                    {exam.subject?.name ?? "Mapel"}
                                                                </span>
                                                                <span>•</span>
                                                                <span>{exam.school_class?.name ?? "Kelas"}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-0.5">
                                                                <IconCalendarEvent className="h-3 w-3" />
                                                                {formatStudentDateTime(latestAttempt?.finished_at ?? latestAttempt?.updated_at)}
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
                                                    {latestAttempt && (
                                                        <Link
                                                            href={route("exams.attempt.result", {
                                                                exam: exam.id,
                                                                attempt: latestAttempt.id,
                                                            })}
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
                </section>

                {rows.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
                        <IconCalendar
                            className="mx-auto h-12 w-12 text-slate-300"
                            stroke={1.25}
                        />
                        <p className="mt-4 text-sm font-medium text-slate-700">
                            Tidak ada ujian tersedia
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                            Belum ada ujian yang dibuat untuk kelas Anda.
                        </p>
                    </div>
                ) : null}

                {exams?.last_page > 1 && (
                    <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm">
                        <Pagination links={exams.links} />
                    </div>
                )}
            </StudentShell>
        </DashboardLayout>
    );
}
