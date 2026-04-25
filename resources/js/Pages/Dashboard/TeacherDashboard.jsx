import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconArrowUpRight,
    IconCalendarEvent,
    IconChecklist,
    IconClipboardText,
    IconEditCircle,
    IconFilePlus,
    IconNotebook,
    IconSchool,
    IconUsers,
} from "@tabler/icons-react";

const THEME = {
    primary: "#163d8f",
    secondary: "#2563eb",
    light: "#dbeafe",
    bg: "#f8fafc",
    text: "#0f172a",
    border: "#e5e7eb",
};

function formatValue(value, suffix = "") {
    if (typeof value === "number") return `${value.toLocaleString("id-ID")}${suffix}`;
    return `${value ?? 0}${suffix}`;
}

function ProgressDonut({ value = 0 }) {
    const normalized = Math.max(0, Math.min(100, Number(value) || 0));
    const donutStyle = {
        background: `conic-gradient(${THEME.primary} ${normalized * 3.6}deg, ${THEME.light} 0deg)`,
    };

    return (
        <div className="relative mx-auto h-36 w-36">
            <div className="h-full w-full rounded-full shadow-sm" style={donutStyle} />
            <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white">
                <span className="text-3xl font-semibold text-slate-900">{normalized}%</span>
            </div>
        </div>
    );
}

function StatBlock({ label, hint, value, suffix = "", trend, icon: Icon }) {
    const isPositive = trend >= 0;

    return (
        <div className="rounded-[20px] border border-[#e5e7eb] bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: THEME.light, color: THEME.primary }}
                >
                    <Icon className="h-4 w-4" stroke={1.8} />
                </span>
            </div>

            <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                {formatValue(value, suffix)}
            </p>

            <div className="mt-2 flex items-center justify-between">
                <p className="text-sm text-slate-500">{hint}</p>
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                        isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}
                >
                    <IconArrowUpRight className={`h-3 w-3 ${isPositive ? "" : "rotate-90"}`} stroke={1.8} />
                    {Math.abs(trend)}%
                </span>
            </div>
        </div>
    );
}

function Panel({ title, children, icon: Icon, rightAction }) {
    return (
        <section className="overflow-hidden rounded-[20px] border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] bg-slate-50 px-5 py-4">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                    {Icon ? <Icon className="h-4 w-4 text-[#163d8f]" stroke={1.8} /> : null}
                    {title}
                </h2>
                {rightAction ? (
                    <Link
                        href={rightAction.href}
                        className="text-xs font-semibold transition-colors hover:opacity-90"
                        style={{ color: THEME.primary }}
                    >
                        {rightAction.label}
                    </Link>
                ) : null}
            </div>
            <div className="p-5">{children}</div>
        </section>
    );
}

function EmptyState({ text }) {
    return <p className="py-8 text-center text-sm text-slate-500">{text}</p>;
}

function formatDeadlineLabel(rawDeadline = "") {
    const text = String(rawDeadline).toLowerCase();
    if (text.includes("lalu") || text.includes("ago")) return "deadline lewat";
    if (text.includes("hari ini") || text.includes("today")) return "deadline hari ini";
    return rawDeadline || "-";
}

function getClockParts(now) {
    return {
        day: now.toLocaleDateString("id-ID", { weekday: "long" }),
        date: now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
        time: now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    };
}

export default function TeacherDashboard() {
    const {
        stats = {},
        classPerformance = [],
        pendingTasks = [],
        upcomingSchedules = [],
        taughtClasses = [],
        auth = {},
    } = usePage().props;

    const canMutate = auth.canMutateTeachingContent ?? false;
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(id);
    }, []);

    const clock = useMemo(() => getClockParts(now), [now]);

    const statCards = useMemo(
        () => [
            { label: "Total Siswa", value: stats.totalStudents ?? 0, hint: "Siswa aktif yang diajar", trend: 12, icon: IconUsers },
            { label: "Kelas Aktif", value: stats.totalClasses ?? 0, hint: "Rombel berjalan", trend: 5, icon: IconSchool },
            { label: "Tugas Perlu Dinilai", value: stats.pendingSubmissions ?? 0, hint: "Perlu ditindak sekarang", trend: -8, icon: IconChecklist },
            { label: "Rata-rata Nilai", value: stats.averageClassGrade ?? 0, hint: "Rerata tugas dinilai", suffix: "%", trend: 6, icon: IconClipboardText },
        ],
        [stats]
    );

    return (
        <DashboardLayout title="Dashboard Guru">
            <Head title="Dashboard Guru" />

            <div className="mx-auto max-w-7xl space-y-6 pb-6" style={{ backgroundColor: THEME.bg }}>
                <section
                    className="animate-[fadeIn_500ms_ease-out] rounded-[24px] border px-7 py-6 shadow-[0_16px_38px_rgba(22,61,143,0.22)]"
                    style={{
                        borderColor: "rgba(219,234,254,0.45)",
                        background: "linear-gradient(120deg, #163d8f 0%, #1e4fb5 62%, #2563eb 100%)",
                    }}
                >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-100">Selamat datang kembali, Pak Gunawan</p>
                            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Dashboard Guru</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100">
                                Kelola kelas, tugas, dan aktivitas belajar hari ini dengan lebih mudah.
                            </p>
                        </div>
                        <div className="grid w-full max-w-sm grid-cols-3 gap-3">
                            <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                                <p className="text-[11px] uppercase tracking-wide text-blue-100">Hari</p>
                                <p className="mt-1 text-sm font-semibold text-white">{clock.day}</p>
                            </div>
                            <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                                <p className="text-[11px] uppercase tracking-wide text-blue-100">Tanggal</p>
                                <p className="mt-1 text-sm font-semibold text-white">{clock.date}</p>
                            </div>
                            <div className="rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
                                <p className="text-[11px] uppercase tracking-wide text-blue-100">Jam</p>
                                <p className="mt-1 text-sm font-semibold text-white">{clock.time}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((item) => (
                        <StatBlock key={item.label} {...item} />
                    ))}
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                    <Panel title="Aksi Cepat" icon={IconEditCircle}>
                        {canMutate ? (
                            <div className="grid grid-cols-1 gap-3">
                                <Link href={route("materials.create")} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">Upload Materi</Link>
                                <Link href={route("tasks.create")} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">Buat Tugas</Link>
                                <Link href={route("quizzes.create")} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">Buat Kuis</Link>
                                <Link href={route("grades.index")} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700">Input Nilai</Link>
                            </div>
                        ) : (
                            <EmptyState text="Aksi cepat tersedia setelah kelas/mapel aktif terhubung ke akun Anda." />
                        )}
                    </Panel>

                    <Panel title="Kelas yang Anda Ajar" icon={IconSchool}>
                        {taughtClasses.length > 0 ? (
                            <ul className="space-y-3">
                                {taughtClasses.map((cls) => (
                                    <li key={cls.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm">
                                        <span className="font-semibold text-slate-800">{cls.name}</span>
                                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{cls.students_count ?? 0} siswa</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada kelas mengajar untuk akun guru ini." />
                        )}
                    </Panel>

                    <Panel title="Insight Nilai" icon={IconNotebook}>
                        <ProgressDonut value={stats.averageClassGrade ?? 0} />
                        <p className="mt-4 text-center text-sm font-medium text-slate-700">Rata-rata nilai tugas minggu ini</p>
                    </Panel>
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                    <Panel title="Performa Kelas" icon={IconSchool}>
                        {classPerformance.length > 0 ? (
                            <ul className="space-y-4">
                                {classPerformance.map((item) => (
                                    <li key={item.id}>
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="text-sm font-semibold text-slate-800">{item.name}</span>
                                            <span className="text-sm font-semibold text-slate-700">{item.averageGrade}%</span>
                                        </div>
                                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${Math.max(0, Math.min(100, Number(item.averageGrade) || 0))}%`,
                                                    backgroundImage: "linear-gradient(90deg, #163d8f 0%, #2563eb 100%)",
                                                }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada data performa kelas." />
                        )}
                    </Panel>

                    <Panel title="Tugas Menunggu Penilaian" icon={IconFilePlus} rightAction={{ href: route("grades.index"), label: "Lihat Semua" }}>
                        {pendingTasks.length > 0 ? (
                            <ul className="space-y-3">
                                {pendingTasks.map((task) => (
                                    <li key={task.id} className="rounded-lg border border-slate-200 bg-white px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm">
                                        <p className="text-sm font-semibold text-slate-800">{task.title}</p>
                                        <p className="mt-1 text-xs text-slate-500">{task.class} · {task.subject}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="rounded-md bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{task.submissions} siswa submit</span>
                                            <span className="text-xs font-medium text-slate-500">{formatDeadlineLabel(task.deadline)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Tidak ada tugas yang menunggu penilaian." />
                        )}
                    </Panel>
                </section>

                <section>
                    <Panel title="Agenda 7 Hari ke Depan" icon={IconCalendarEvent}>
                        {upcomingSchedules.length > 0 ? (
                            <ul className="space-y-3">
                                {upcomingSchedules.map((item) => (
                                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                            <p className="text-xs text-slate-500">{item.type} · {item.subject} · {item.class}</p>
                                            <p className="text-xs text-slate-500">{item.time}</p>
                                        </div>
                                        <Link href={item.url} className="text-xs font-semibold transition-colors hover:opacity-90" style={{ color: THEME.primary }}>
                                            Buka Agenda
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada agenda minggu ini." />
                        )}
                    </Panel>
                </section>
            </div>
        </DashboardLayout>
    );
}
