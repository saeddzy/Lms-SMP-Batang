import React from "react";
import clsx from "clsx";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { formatStudentDateTime } from "@/Components/Student/StudentShell";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconClipboardList,
    IconBrain,
    IconAlertCircle,
    IconCheck,
    IconArrowRight,
    IconClock,
    IconTrophy,
    IconInfoCircle,
    IconSchool,
    IconChartBar,
    IconActivity,
    IconBook,
} from "@tabler/icons-react";

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

function activityIcon(type) {
    switch (type) {
        case "task_submission":
            return IconClipboardList;
        case "quiz_attempt":
            return IconBrain;
        case "exam_attempt":
            return IconChartBar;
        default:
            return IconActivity;
    }
}

// Time formatting functions for consistency
function formatTimeRemaining(endTime, startTime = null) {
    if (!endTime) return "—";
    
    try {
        const end = new Date(endTime);
        const now = new Date();
        
        if (Number.isNaN(end.getTime())) return "—";
        
        const diffMs = end - now;
        
        // If already expired
        if (diffMs <= 0) {
            return "Berakhir";
        }
        
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        // Format user-friendly
        if (diffDays > 0) {
            if (diffDays === 1 && diffHours > 0) {
                return `1 hari ${diffHours} jam lagi`;
            } else if (diffDays === 1) {
                return "1 hari lagi";
            } else if (diffHours > 0) {
                return `${diffDays} hari ${diffHours} jam lagi`;
            } else {
                return `${diffDays} hari lagi`;
            }
        } else if (diffHours > 0) {
            if (diffHours === 1 && diffMinutes > 0) {
                return `1 jam ${diffMinutes} menit lagi`;
            } else if (diffHours === 1) {
                return "1 jam lagi";
            } else if (diffMinutes > 0) {
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

// Calculate real progress based on actual student data with weighted calculation
function calculateRealProgress(enrolledClasses, learningStats) {
    // Use actual learning stats data
    const tasks = learningStats?.tasks || {};
    const quizzes = learningStats?.quizzes || {};
    const materials = learningStats?.materials || {}; // Assuming materials data exists
    
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

            <div className="mx-auto max-w-5xl space-y-8 pb-16 pt-4">
                
                {/* 1. Hero Card - Greeting Section */}
                <div className="relative overflow-hidden rounded-2xl p-8 shadow-xl shadow-[rgba(20,96,190,0.3)] bg-gradient-to-br from-[#154497] via-[#1460BE] to-[#1E6FDB] ring-1 ring-[rgba(96,165,250,0.2)]">
                    <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
                    <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#60A5FA]/25 blur-2xl" aria-hidden />
                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B6D4FF]">
                            Komunitas belajar
                        </p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
                            Halo, {firstName} 👋
                        </h1>
                        <h2 className="text-xl font-semibold text-white mt-2">Kelas Anda</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#CBD5E1]/95">
                            Kelas yang dapat Anda akses setelah didaftarkan oleh admin — buka untuk detail.
                        </p>
                        {classCount > 0 && (
                            <div className="mt-6 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <IconSchool className="w-5 h-5 text-white" />
                                    <span className="font-medium text-white">{classCount} kelas aktif</span>
                                </div>
                                <Link 
                                    href={route("student.classes")}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white font-medium transition-colors border border-white/20"
                                >
                                    Lihat Kelas
                                    <IconArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Central Notifications (Alerts) */}
                {(urgentTasks.length > 0 || activeQuizzes.length > 0) && (
                    <section className="flex flex-col gap-3">
                        {activeQuizzes.map(quiz => (
                            <div key={`alert-q-${quiz.id}`} className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg text-blue-600">
                                        <IconBrain className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">Kuis Aktif: {quiz.title}</p>
                                        <p className="text-xs text-blue-700 mt-0.5">{quiz.subject}</p>
                                    </div>
                                </div>
                                <Link href={route("quizzes.show", quiz.id)} className="shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition">
                                    Mulai Kuis
                                </Link>
                            </div>
                        ))}
                        
                        {urgentTasks.map(task => {
                            const daysLeft = calculateDaysLeft(task.due_date);
                            return (
                                <div key={`alert-t-${task.id}`} className="flex items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 p-2 bg-amber-100 rounded-lg text-amber-600">
                                            <IconAlertCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-amber-900">Tugas Mendesak: {task.title}</p>
                                            <p className="text-xs text-amber-700 mt-0.5">
                                                Tenggat: {formatTimeRemaining(task.due_date)}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={route("tasks.show", task.id)} className="shrink-0 px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-amber-600 transition">
                                        Kerjakan
                                    </Link>
                                </div>
                            );
                        })}
                    </section>
                )}

                {/* 3. Progress Belajar - Single Card */}
                <section>
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-blue-50 to-sky-50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-slate-900">Progress Belajar</h2>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <IconSchool className="w-4 h-4" />
                                    <span>{classCount} kelas</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            {/* Main Progress Bar with Better Visual */}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-lg">
                                            <IconTrophy className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-900">{realProgress.overallProgress}% Progress Belajar</p>
                                            <p className="text-sm text-slate-500">Total pembelajaran kamu</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1">
                                            {realProgress.overallProgress >= 80 ? (
                                                <span className="text-2xl">🎉</span>
                                            ) : realProgress.overallProgress >= 50 ? (
                                                <span className="text-2xl">📚</span>
                                            ) : (
                                                <span className="text-2xl">🚀</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Animated Progress Bar */}
                                <div className="relative">
                                    <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                                        <div 
                                            className={`h-4 rounded-full transition-all duration-1000 ease-out shadow-sm ${
                                                realProgress.overallProgress >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                                realProgress.overallProgress >= 50 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                                'bg-gradient-to-r from-amber-500 to-amber-600'
                                            }`}
                                            style={{ width: `${realProgress.overallProgress}%` }}
                                        >
                                            <div className="h-full bg-white/20 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs text-slate-500 mt-2">
                                        {realProgress.overallProgress >= 80 ? 'Luar biasa! Terus pertahankan!' :
                                         realProgress.overallProgress >= 50 ? 'Bagus! Tingkatkan lagi!' :
                                         'Yuk, semangat belajar!'}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Breakdown - This is the key improvement! */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-slate-700 mb-3">📊 Breakdown Progress</h4>
                                <div className="space-y-3">
                                    {/* Materi Progress */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconBook className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-slate-700">Materi</span>
                                                <span className="text-sm font-bold text-purple-600">{realProgress.breakdown.materials}%</span>
                                            </div>
                                            <div className="w-full bg-purple-100 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${realProgress.breakdown.materials}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tugas Progress */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconClipboardList className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-slate-700">Tugas</span>
                                                <span className="text-sm font-bold text-amber-600">{realProgress.breakdown.tasks}%</span>
                                            </div>
                                            <div className="w-full bg-amber-100 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${realProgress.breakdown.tasks}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Kuis Progress */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <IconBrain className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-slate-700">Kuis</span>
                                                <span className="text-sm font-bold text-emerald-600">{realProgress.breakdown.quizzes}%</span>
                                            </div>
                                            <div className="w-full bg-emerald-100 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                                                    style={{ width: `${realProgress.breakdown.quizzes}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-xs text-slate-500 mt-3 text-center">
                                    💡 Bobot: Materi 40% • Tugas 30% • Kuis 30%
                                </p>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-100">
                                    <p className="text-lg font-bold text-amber-700">{realProgress.completedTasks}</p>
                                    <p className="text-xs text-amber-600">Tugas Selesai</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                                    <p className="text-lg font-bold text-emerald-700">{realProgress.passedQuizzes}</p>
                                    <p className="text-xs text-emerald-600">Kuis Lulus</p>
                                </div>
                                <div className="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
                                    <p className="text-lg font-bold text-blue-700">{realProgress.averageGrade}%</p>
                                    <p className="text-xs text-blue-600">Rata-rata Nilai</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Yang Harus Dikerjakan - Prominent Section */}
                <section>
                    <div className="bg-white border-2 border-red-200 rounded-2xl shadow-lg overflow-hidden">
                        <div className="border-b border-red-100 px-6 py-4 bg-gradient-to-r from-red-50 to-orange-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white">
                                        <IconAlertCircle className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-red-900">🚨 Penting! Harus Dikerjakan</h2>
                                        <p className="text-sm text-red-700">Tugas, kuis, dan ujian yang membutuhkan perhatian Anda</p>
                                    </div>
                                </div>
                                <Link href={route("student.tasks")} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-red-700 transition-colors">
                                    Lihat Semua
                                    <IconArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="p-6">
                            {unifiedAgenda.length > 0 ? (
                                <div className="space-y-3">
                                    {unifiedAgenda.map((item) => (
                                        <Link 
                                            key={`${item.type}-${item.id}`} 
                                            href={item.type === 'task' ? route("tasks.show", item.id) : item.type === 'quiz' ? route("quizzes.show", item.id) : route("exams.show", item.id)}
                                            className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 group ${
                                                item.type === 'quiz' && item.is_open ? 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 hover:shadow-md' :
                                                item.type === 'exam' ? 'border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400 hover:shadow-md' :
                                                'border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 hover:shadow-md'
                                            }`}
                                        >
                                            <div className="flex-shrink-0 mr-4">
                                                {item.type === 'task' && <div className="p-3 bg-amber-500 text-white rounded-lg shadow-md"><IconClipboardList className="w-5 h-5" /></div>}
                                                {item.type === 'quiz' && <div className="p-3 bg-blue-500 text-white rounded-lg shadow-md"><IconBrain className="w-5 h-5" /></div>}
                                                {item.type === 'exam' && <div className="p-3 bg-red-500 text-white rounded-lg shadow-md"><IconAlertCircle className="w-5 h-5" /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-base font-bold text-slate-900 truncate">{item.title}</p>
                                                    {item.type === 'quiz' && item.is_open && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-bold animate-pulse">
                                                            ⚡ SEDANG AKTIF
                                                        </span>
                                                    )}
                                                    {item.type === 'exam' && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                                                            📝 UJIAN
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-600">{item.subject}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                {item.type === 'quiz' && item.is_open ? (
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">
                                                            Mulai Sekarang
                                                        </span>
                                                        <p className="text-xs text-blue-600 font-medium">⏰ {item.deadline}</p>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                                                            <IconClock className="w-4 h-4" />
                                                            {item.timeRemaining}
                                                        </div>
                                                        <p className="text-xs text-slate-500">{item.deadline}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                        <IconCheck className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <p className="text-xl font-bold text-slate-900 mb-2">🎉 Semua Beres!</p>
                                    <p className="text-sm text-slate-600">Tidak ada tugas, kuis, atau ujian yang perlu dikerjakan saat ini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* 5. Aktivitas Terbaru */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">📊 Aktivitas Terbaru</h2>
                        <span className="text-sm text-slate-500">Riwayat pembelajaran Anda</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
                        {recentActivities.length > 0 ? (
                            <div className="space-y-4">
                                {recentActivities.slice(0, 5).map((a, i) => {
                                    const Icon = activityIcon(a.type);
                                    return (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <Icon className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 line-clamp-2">{a.title}</p>
                                                <p className="text-xs text-slate-500 mt-1">{formatStudentDateTime(a.date)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <IconInfoCircle className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500">Belum ada riwayat aktivitas.</p>
                                </div>
                            )}
                        </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
