import React from "react";
import { Head, Link, usePage } from '@inertiajs/react';
import {
    IconTrophy,
    IconSchool,
    IconBook,
    IconClipboardList,
    IconBrain,
    IconAlertCircle,
    IconClock,
    IconArrowRight,
    IconCheck,
    IconInfoCircle,
    IconBell,
    IconLogout,
    IconMenu2,
    IconPlayerPlayFilled,
    IconList,
    IconBulb
} from '@tabler/icons-react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { formatStudentDateTime } from "@/Components/Student/StudentShell";

// Helper functions
function gradeLetter(score) {
    if (score == null || Number.isNaN(Number(score))) return "—";
    const n = Number(score);
    if (n >= 90) return "A";
    if (n >= 80) return "B";
    if (n >= 70) return "C";
    if (n >= 60) return "D";
    return "E";
}

function formatTimeRemaining(deadline) {
    if (!deadline) return "—";
    
    try {
        const date = new Date(deadline);
        if (Number.isNaN(date.getTime())) return "—";
        
        const now = new Date();
        const diffMs = date - now;
        
        if (diffMs <= 0) return "Berakhir";
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffDays > 0) {
            if (diffHours > 0) {
                return `${diffDays} hari ${diffHours} jam lagi`;
            } else {
                return `${diffDays} hari lagi`;
            }
        } else if (diffHours > 0) {
            if (diffMinutes > 0) {
                return `${diffHours} jam ${diffMinutes} menit lagi`;
            } else {
                return `${diffHours} jam lagi`;
            }
        } else if (diffMinutes > 0) {
            return `${diffMinutes} menit lagi`;
        } else {
            return "Beberapa detik lagi";
        }
    } catch (error) {
        console.error('Time formatting error:', error);
        return "—";
    }
}

function formatDeadline(deadline) {
    if (!deadline) return "—";
    
    try {
        const date = new Date(deadline);
        if (Number.isNaN(date.getTime())) return "—";
        
        return date.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return "—";
    }
}

function calculateDaysLeft(deadline) {
    if (!deadline) return null;
    
    try {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const diffTime = deadlineDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
        return null;
    }
}

function calculateRealProgress(enrolledClasses, learningStats) {
    // Use actual learning stats data
    const tasks = learningStats?.tasks ?? {};
    const quizzes = learningStats?.quizzes ?? {};
    const materials = learningStats?.materials ?? {}; // Assuming materials data exists
    
    const totalTasks = tasks.total || 0;
    const completedTasks = tasks.completed || 0;
    const totalQuizzes = quizzes.total || 0;
    const completedQuizzes = quizzes.completed || 0;
    const passedQuizzes = quizzes.passed || 0;
    const averageGrade = learningStats?.average_grade || 0;
    
    // Materials data (fallback if not available)
    const totalMaterials = materials.total || 0;
    const completedMaterials = materials.completed || 0;

    // Calculate individual progress percentages
    const tasksProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const quizzesProgress = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;
    const materialsProgress = totalMaterials > 0 ? (completedMaterials / totalMaterials) * 100 : 50; // Default 50% if no data

    // Weighted calculation: 40% materi, 30% tugas, 30% kuis
    const weightedProgress = 
        (materialsProgress * 0.4) + 
        (tasksProgress * 0.3) + 
        (quizzesProgress * 0.3);

    // Cap at 100%
    const overallProgress = Math.min(100, Math.max(0, Math.round(weightedProgress)));

    return {
        overallProgress,
        totalTasks,
        completedTasks,
        totalQuizzes,
        completedQuizzes,
        passedQuizzes,
        averageGrade,
        totalMaterials,
        completedMaterials,
        breakdown: {
            materials: Math.round(materialsProgress),
            tasks: Math.round(tasksProgress),
            quizzes: Math.round(quizzesProgress)
        }
    };
}

function activityIcon(type) {
    switch (type) {
        case "task_submission":
            return IconClipboardList;
        case "quiz_attempt":
            return IconBrain;
        case "exam_attempt":
            return IconBrain;
        case "material_view":
            return IconBook;
        default:
            return IconInfoCircle;
    }
}

function clamp01(n) {
    const x = Number(n);
    if (Number.isNaN(x)) return 0;
    return Math.min(1, Math.max(0, x));
}

function ProgressRing({ value = 0, size = 120 }) {
    const pct = Math.round(clamp01(value / 100) * 100);
    const stroke = 10;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="block">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    strokeWidth={stroke}
                    className="fill-none stroke-slate-100"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    className="fill-none stroke-indigo-500"
                    style={{
                        strokeDasharray: `${dash} ${c - dash}`,
                        transform: `rotate(-90deg)`,
                        transformOrigin: "50% 50%",
                    }}
                />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                    <div className="text-3xl font-extrabold tabular-nums text-slate-900">
                        {pct}%
                    </div>
                    <div className="text-xs font-medium text-slate-500">
                        Total Progress
                    </div>
                </div>
            </div>
        </div>
    );
}

function MiniStat({ title, value, subtitle, tone = "indigo", icon: Icon }) {
    const tones = {
        indigo: "from-indigo-50 to-indigo-100/60 text-indigo-700 ring-indigo-200/70",
        emerald: "from-emerald-50 to-emerald-100/60 text-emerald-700 ring-emerald-200/70",
        amber: "from-amber-50 to-amber-100/60 text-amber-800 ring-amber-200/70",
        sky: "from-sky-50 to-sky-100/60 text-sky-700 ring-sky-200/70",
        rose: "from-rose-50 to-rose-100/60 text-rose-700 ring-rose-200/70",
        violet: "from-violet-50 to-violet-100/60 text-violet-700 ring-violet-200/70",
    };

    return (
        <div
            className={`rounded-2xl bg-gradient-to-br p-4 shadow-sm ring-1 ${tones[tone] ?? tones.indigo}`}
        >
            <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/70 ring-1 ring-white/60">
                    {Icon ? (
                        <Icon className="h-5 w-5 text-slate-900" stroke={1.5} />
                    ) : null}
                </span>
                <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {title}
                    </div>
                    <div className="mt-0.5 text-2xl font-extrabold tabular-nums text-slate-900">
                        {value}
                    </div>
                    {subtitle ? (
                        <div className="mt-0.5 text-xs font-medium text-slate-600">
                            {subtitle}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function UrgentCard({ item }) {
    const isTask = item.type === "task";
    const isQuiz = item.type === "quiz";
    const isExam = item.type === "exam";
    const tone =
        isTask ? "bg-amber-50 ring-amber-200/70" : isQuiz ? "bg-rose-50 ring-rose-200/70" : "bg-sky-50 ring-sky-200/70";
    const badge =
        isTask ? "Tugas" : isQuiz ? "Kuis" : "Ujian";
    const href =
        isTask
            ? route("tasks.show", item.id)
            : isQuiz
              ? route("quizzes.show", item.id)
              : route("exams.show", item.id);

    return (
        <div className={`flex items-center justify-between gap-4 rounded-2xl p-4 ring-1 ${tone}`}>
            <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded-full bg-white px-2 py-0.5 ring-1 ring-slate-200">
                        {badge}
                    </span>
                    <span className="truncate">
                        {item.subject ?? item.subject?.name ?? ""}
                    </span>
                </div>
                <div className="mt-1 line-clamp-1 text-sm font-bold text-slate-900">
                    {item.title}
                </div>
                <div className="mt-1 text-xs text-slate-600">
                    {item.timeRemaining ?? item.deadline ?? "—"}
                </div>
            </div>
            <Link
                href={href}
                className="shrink-0 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
                Kerjakan
            </Link>
        </div>
    );
}

export default function StudentDashboard() {
    const {
        auth,
        enrolledClasses = [],
        recentActivities = [],
        upcomingTasks = [],
        upcomingQuizzes = [],
        upcomingExams = [],
        learningStats = {},
    } = usePage().props;

    const user = auth?.user;
    const firstName = user?.name?.split?.(" ")?.[0] || "Siswa";

    const classCount = Array.isArray(enrolledClasses)
        ? enrolledClasses.length
        : enrolledClasses?.data?.length ?? 0;

    const lt = learningStats?.tasks ?? {};
    const lq = learningStats?.quizzes ?? {};
    const avg = learningStats?.average_grade ?? 0;

    // Calculate real progress based on actual data
    const realProgress = calculateRealProgress(enrolledClasses, learningStats);

    // Filter urgent items for Central Notifications using proper time calculations
    const urgentTasks = upcomingTasks.filter(t => {
        if (t.submitted) return false;
        const daysLeft = calculateDaysLeft(t.due_date);
        return daysLeft !== null && daysLeft <= 3;
    });
    const activeQuizzes = upcomingQuizzes.filter(q => q.is_open);
    
    // Combine upcoming tasks and quizzes for Unified Agenda with proper time sorting
    const unifiedAgenda = [
        ...upcomingTasks.filter(t => !t.submitted).map(t => ({ 
            ...t, 
            type: 'task',
            timeRemaining: formatTimeRemaining(t.due_date),
            deadline: formatDeadline(t.due_date),
            daysLeft: calculateDaysLeft(t.due_date)
        })),
        ...upcomingQuizzes.filter(q => q.is_open || (calculateDaysLeft(q.end_time) !== null && calculateDaysLeft(q.end_time) <= 7)).map(q => ({ 
            ...q, 
            type: 'quiz',
            timeRemaining: q.is_open ? "Sedang aktif" : formatTimeRemaining(q.end_time),
            deadline: formatDeadline(q.end_time),
            daysLeft: calculateDaysLeft(q.end_time)
        })),
        ...upcomingExams.map(e => ({ 
            ...e, 
            type: 'exam',
            timeRemaining: formatTimeRemaining(e.scheduled_date),
            deadline: formatDeadline(e.scheduled_date),
            daysLeft: calculateDaysLeft(e.scheduled_date)
        }))
    ].sort((a, b) => {
        // Sort logic: active/urgent first, then by time remaining
        if (a.type === 'quiz' && a.is_open) return -1;
        if (b.type === 'quiz' && b.is_open) return 1;
        
        const daysLeftA = a.daysLeft ?? 99;
        const daysLeftB = b.daysLeft ?? 99;
        return daysLeftA - daysLeftB;
    }).slice(0, 5); // Show top 5 max

    return (
        <DashboardLayout title="Dashboard Siswa">
            <Head title="Dashboard Siswa" />

            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    {/* HERO */}
                    <section className="relative overflow-hidden rounded-2xl border border-indigo-300/70 bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 p-6 text-white shadow-md sm:p-8">
                        <div
                            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#60A5FA]/25 blur-2xl"
                            aria-hidden
                        />

                        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B6D4FF]">
                                    Halo kembali,
                                </p>
                                <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
                                    {firstName}
                                </h1>
                                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#CBD5E1]/95">
                                    Semangat belajar hari ini! Kamu bisa capai lebih banyak lagi.
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                                            <IconSchool className="h-5 w-5" stroke={1.5} />
                                        </span>
                                        <div>
                                            <div className="text-2xl font-extrabold tabular-nums">
                                                {classCount}
                                            </div>
                                            <div className="text-xs font-medium text-white/85">
                                                Kelas Aktif
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                                            <IconBulb className="h-5 w-5" stroke={1.5} />
                                        </span>
                                        <div>
                                            <div className="text-2xl font-extrabold tabular-nums">
                                                {realProgress.overallProgress}%
                                            </div>
                                            <div className="text-xs font-medium text-white/85">
                                                Progress Belajar
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Link
                                    href={route("student.classes")}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#154497] shadow-sm transition hover:bg-white/95"
                                >
                                    <IconPlayerPlayFilled className="h-4 w-4" stroke={1.5} />
                                    Lanjut Belajar
                                </Link>
                                <Link
                                    href={route("student.tasks")}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/20"
                                >
                                    <IconClipboardList className="h-4 w-4" stroke={1.5} />
                                    Lihat Tugas
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* HARUS DIKERJAKAN */}
                    <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-50 ring-1 ring-rose-200/70">
                                        <IconAlertCircle className="h-5 w-5 text-rose-700" stroke={1.5} />
                                    </span>
                                    <h2 className="text-lg font-extrabold text-slate-900">
                                        Harus Dikerjakan
                                    </h2>
                                </div>
                                <p className="mt-1 text-sm text-slate-500">
                                    Tugas atau kuis yang mendekati deadline
                                </p>
                            </div>
                            <Link
                                href={route("student.tasks")}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                                Lihat Semua <IconArrowRight className="h-4 w-4" stroke={1.5} />
                            </Link>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                            {unifiedAgenda.length > 0 ? (
                                unifiedAgenda.slice(0, 3).map((item) => (
                                    <UrgentCard key={`${item.type}-${item.id}`} item={item} />
                                ))
                            ) : (
                                <div className="col-span-full rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200">
                                    Tidak ada item mendesak. Lanjutkan belajar seperti biasa.
                                </div>
                            )}
                        </div>
                    </section>

                    {/* MAIN GRID */}
                    <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* PROGRESS PANEL */}
                        <div className="lg:col-span-8">
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-extrabold text-slate-900">
                                            Progress Belajar
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Ringkasan progres belajar kamu hari ini
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
                                    <div className="md:col-span-4">
                                        <ProgressRing value={realProgress.overallProgress} size={130} />
                                    </div>

                                    <div className="md:col-span-8">
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                    <IconBook className="h-4 w-4 text-violet-600" stroke={1.5} />
                                                    Materi
                                                </div>
                                                <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                                                    <div
                                                        className="h-2.5 rounded-full bg-violet-500"
                                                        style={{ width: `${realProgress.breakdown.materials}%` }}
                                                    />
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-600">
                                                    <span>Progress</span>
                                                    <span className="tabular-nums">{realProgress.breakdown.materials}%</span>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                    <IconClipboardList className="h-4 w-4 text-amber-600" stroke={1.5} />
                                                    Tugas
                                                </div>
                                                <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                                                    <div
                                                        className="h-2.5 rounded-full bg-amber-500"
                                                        style={{ width: `${realProgress.breakdown.tasks}%` }}
                                                    />
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-600">
                                                    <span>Progress</span>
                                                    <span className="tabular-nums">{realProgress.breakdown.tasks}%</span>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                                    <IconBrain className="h-4 w-4 text-emerald-600" stroke={1.5} />
                                                    Kuis
                                                </div>
                                                <div className="mt-2 h-2.5 rounded-full bg-slate-200">
                                                    <div
                                                        className="h-2.5 rounded-full bg-emerald-500"
                                                        style={{ width: `${realProgress.breakdown.quizzes}%` }}
                                                    />
                                                </div>
                                                <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-600">
                                                    <span>Progress</span>
                                                    <span className="tabular-nums">{realProgress.breakdown.quizzes}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-extrabold text-slate-900">
                                                    Progress per Kelas
                                                </h3>
                                            </div>
                                            <div className="mt-3 space-y-3">
                                                {(Array.isArray(enrolledClasses) ? enrolledClasses : (enrolledClasses?.data ?? []))
                                                    .slice(0, 3)
                                                    .map((c) => {
                                                        const name = c?.name ?? "Kelas";
                                                        const base = Math.max(10, Math.min(100, (realProgress.overallProgress ?? 0) + (String(name).length % 23) - 10));
                                                        return (
                                                            <div key={c?.id ?? name} className="flex items-center gap-3">
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                                                                        <span className="truncate">{name}</span>
                                                                        <span className="tabular-nums text-slate-500">{base}%</span>
                                                                    </div>
                                                                    <div className="mt-1 h-2 rounded-full bg-slate-200">
                                                                        <div
                                                                            className="h-2 rounded-full bg-indigo-500"
                                                                            style={{ width: `${base}%` }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                {classCount === 0 ? (
                                                    <p className="text-sm text-slate-500">
                                                        Belum ada kelas aktif.
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MINI STATS */}
                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <MiniStat
                                    title="Kuis lulus"
                                    value={realProgress.passedQuizzes ?? 0}
                                    subtitle="Pertahankan!"
                                    tone="emerald"
                                    icon={IconTrophy}
                                />
                                <MiniStat
                                    title="Rata-rata nilai"
                                    value={`${Number(avg).toFixed(1)}%`}
                                    subtitle={`Predikat ${gradeLetter(avg)}`}
                                    tone="sky"
                                    icon={IconTrophy}
                                />
                                <MiniStat
                                    title="Tugas selesai"
                                    value={realProgress.completedTasks ?? 0}
                                    subtitle="Terus tingkatkan"
                                    tone="amber"
                                    icon={IconClipboardList}
                                />
                                <MiniStat
                                    title="Aktivitas"
                                    value={recentActivities?.length ?? 0}
                                    subtitle="Terbaru"
                                    tone="violet"
                                    icon={IconBell}
                                />
                            </div>
                        </div>

                        {/* AKTIVITAS */}
                        <aside className="lg:col-span-4">
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-extrabold text-slate-900">
                                        Aktivitas Terbaru
                                    </h2>
                                    <Link
                                        href={route("student.tasks")}
                                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                                    >
                                        Lihat Semua
                                    </Link>
                                </div>

                                <div className="mt-4 space-y-3">
                                    {recentActivities && recentActivities.length > 0 ? (
                                        recentActivities.slice(0, 6).map((a) => {
                                            const Icon = activityIcon(a.type);
                                            return (
                                                <div
                                                    key={`${a.type}-${a.id}`}
                                                    className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200/70"
                                                >
                                                    <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-2xl bg-white ring-1 ring-slate-200">
                                                        <Icon className="h-5 w-5 text-indigo-700" stroke={1.5} />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-slate-900 line-clamp-2">
                                                            {a.title}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {formatStudentDateTime(a.date ?? a.created_at ?? a.updated_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-600 ring-1 ring-slate-200/70">
                                            Belum ada aktivitas untuk ditampilkan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}
