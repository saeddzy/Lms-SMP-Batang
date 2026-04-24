import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconBook2,
    IconCalendarEvent,
    IconChecklist,
    IconClipboardText,
    IconSchool,
    IconUsers,
} from "@tabler/icons-react";

function StatBlock({ label, hint, value, suffix = "", tone = "slate", icon: Icon }) {
    const toneMap = {
        slate: "border-stone-300/80 bg-white",
        indigo: "border-indigo-400/80 bg-indigo-200/80",
        emerald: "border-emerald-400/80 bg-emerald-200/80",
        sky: "border-sky-400/80 bg-sky-200/80",
        amber: "border-amber-400/80 bg-amber-200/80",
    };

    return (
        <div
            className={`group rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${toneMap[tone] ?? toneMap.slate}`}
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    {label}
                </p>
                {Icon ? (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-stone-700 ring-1 ring-stone-300/80 transition-colors duration-200 group-hover:bg-stone-900 group-hover:text-white">
                        <Icon className="h-4 w-4" stroke={1.7} />
                    </span>
                ) : null}
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-stone-900">
                {value}
                {suffix}
            </p>
            <p className="mt-1 text-sm text-stone-500">{hint}</p>
        </div>
    );
}

function Panel({ title, children, icon: Icon, tone = "dark-blue" }) {
    const toneClass = {
        "dark-blue": "bg-gradient-to-r from-[#154497] to-[#1460BE]",
        slate: "bg-stone-100/80",
        indigo: "bg-indigo-100/80",
        sky: "bg-sky-100/80",
        emerald: "bg-emerald-100/80",
        amber: "bg-amber-100/80",
    };

    return (
        <section className="overflow-hidden rounded-2xl border-[rgba(20,96,190,0.25)] bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className={`border-b border-[rgba(20,96,190,0.3)] px-6 py-4 ${toneClass[tone] ?? toneClass["dark-blue"]}`}>
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                    {Icon ? <Icon className="h-4 w-4 text-white" stroke={1.7} /> : null}
                    {title}
                </h2>
            </div>
            <div className="p-6">{children}</div>
        </section>
    );
}

function EmptyState({ text }) {
    return <p className="py-6 text-center text-sm text-stone-500">{text}</p>;
}

function agendaTone(type) {
    if (type === "Ujian") return "bg-rose-50 text-rose-700 ring-rose-200/80";
    if (type === "Kuis") return "bg-sky-50 text-sky-700 ring-sky-200/80";
    return "bg-amber-50 text-amber-700 ring-amber-200/80";
}

export default function TeacherDashboard() {
    const {
        stats,
        recentActivities,
        classPerformance,
        pendingTasks,
        upcomingSchedules,
        taughtClasses,
        auth = {},
    } = usePage().props;
    const canMutate = auth.canMutateTeachingContent ?? false;
    const todayLabel = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <DashboardLayout title="Dashboard Guru">
            <Head title="Dashboard Guru" />

            <div className="space-y-8">
                <div className="overflow-hidden rounded-3xl border border-indigo-300/80 bg-gradient-to-r from-indigo-200 via-sky-100 to-cyan-200 px-8 py-10 shadow-md">
                    <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-800 ring-1 ring-indigo-300/80">
                        {todayLabel}
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">
                        Dashboard Guru
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-700">
                        Fokus kerja harian Anda: kelas yang diajar, materi, agenda 7
                        hari, dan tugas yang menunggu penilaian.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white ring-1 ring-indigo-500/70">
                            {stats?.totalClasses ?? 0} kelas aktif
                        </span>
                        <span className="rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white ring-1 ring-sky-500/70">
                            {stats?.totalStudents ?? 0} siswa diajar
                        </span>
                        <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white ring-1 ring-amber-400/70">
                            {stats?.pendingSubmissions ?? 0} menunggu penilaian
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <StatBlock
                        label="Siswa"
                        hint="Yang Anda ajar"
                        value={stats?.totalStudents ?? 0}
                        tone="indigo"
                        icon={IconUsers}
                    />
                    <StatBlock
                        label="Kelas"
                        hint="Kelas aktif"
                        value={stats?.totalClasses ?? 0}
                        tone="sky"
                        icon={IconSchool}
                    />
                    <StatBlock
                        label="Tugas"
                        hint="Total tugas dibuat"
                        value={stats?.totalTasks ?? 0}
                        tone="emerald"
                        icon={IconClipboardText}
                    />
                    <StatBlock
                        label="Perlu dinilai"
                        hint="Submission belum dinilai"
                        value={stats?.pendingSubmissions ?? 0}
                        tone="amber"
                        icon={IconChecklist}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl bg-gradient-to-b from-indigo-200/80 to-white p-[1px]">
                        <Panel title="Aksi cepat" icon={IconBook2} tone="indigo">
                        {canMutate ? (
                            <div className="grid grid-cols-1 gap-3">
                                <a
                                    href={route("materials.create")}
                                    className="rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-100/50"
                                >
                                    + Unggah materi baru
                                </a>
                                <a
                                    href={route("tasks.create")}
                                    className="rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-100/50"
                                >
                                    + Buat tugas baru
                                </a>
                                <a
                                    href={route("quizzes.create")}
                                    className="rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-100/50"
                                >
                                    + Buat kuis baru
                                </a>
                                <a
                                    href={route("exams.create")}
                                    className="rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-100/50"
                                >
                                    + Buat ujian baru
                                </a>
                                <a
                                    href={route("grades.index")}
                                    className="rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm font-medium text-stone-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400 hover:bg-indigo-100/50"
                                >
                                    Lihat penilaian kelas
                                </a>
                            </div>
                        ) : (
                            <EmptyState text="Aksi pembuatan konten muncul saat Anda memiliki slot mengajar mapel." />
                        )}
                        </Panel>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-b from-sky-200/80 to-white p-[1px]">
                        <Panel title="Kelas yang Anda ajar" icon={IconSchool} tone="sky">
                        {taughtClasses?.length > 0 ? (
                            <ul className="space-y-2">
                                {taughtClasses.map((cls) => (
                                    <li
                                        key={cls.id}
                                        className="flex items-center justify-between rounded-xl border border-sky-200 bg-white px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:bg-sky-100/40"
                                    >
                                        <span className="text-sm font-medium text-stone-900">
                                            {cls.name}
                                        </span>
                                        <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                                            {cls.students_count ?? 0} siswa
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada kelas yang terhubung ke akun guru ini." />
                        )}
                        </Panel>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-b from-emerald-200/80 to-white p-[1px]">
                        <Panel title="Rata-rata nilai tugas" icon={IconChecklist} tone="emerald">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center transition-all duration-200 hover:shadow-sm">
                            <p className="text-4xl font-semibold tracking-tight text-stone-900">
                                {stats?.averageClassGrade ?? 0}
                                <span className="text-2xl">%</span>
                            </p>
                            <p className="mt-2 text-sm text-stone-500">
                                Diambil dari submission tugas yang sudah dinilai.
                            </p>
                        </div>
                        </Panel>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Panel title="Performa kelas" icon={IconSchool} tone="sky">
                        {classPerformance && classPerformance.length > 0 ? (
                            <ul className="space-y-3">
                                {classPerformance.map((classData) => (
                                    <li
                                        key={classData.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-200/70 bg-sky-50/40 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-stone-900">
                                                {classData.name}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {classData.totalStudents} siswa ·{" "}
                                                {classData.pendingSubmissions} menunggu nilai
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-semibold tabular-nums text-stone-900">
                                                    {classData.averageGrade}%
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    Rata-rata
                                                </p>
                                            </div>
                                            <div
                                                className="h-2 w-14 overflow-hidden rounded-full bg-stone-200"
                                                title={`${classData.averageGrade}%`}
                                            >
                                                <div
                                                    className="h-full rounded-full bg-stone-700"
                                                    style={{
                                                        width: `${Math.min(
                                                            100,
                                                            classData.averageGrade
                                                        )}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada data performa kelas." />
                        )}
                    </Panel>

                    <Panel title="Tugas menunggu penilaian" icon={IconClipboardText} tone="amber">
                        {pendingTasks && pendingTasks.length > 0 ? (
                            <ul className="space-y-3">
                                {pendingTasks.map((task) => (
                                    <li
                                        key={task.id}
                                        className="rounded-xl border border-amber-200/70 bg-gradient-to-r from-white to-amber-50/70 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-stone-900">
                                                    {task.title}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    {task.class} · {task.subject}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    Deadline: {task.deadline}
                                                </p>
                                                <Link
                                                    href={task.action_url}
                                                    className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Buka halaman tugas
                                                </Link>
                                            </div>
                                            <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                                                {task.submissions} belum dinilai
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Tidak ada tugas yang menunggu penilaian." />
                        )}
                    </Panel>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Panel title="Agenda 7 hari ke depan" icon={IconCalendarEvent} tone="indigo">
                        {upcomingSchedules?.length > 0 ? (
                            <ul className="space-y-3">
                                {upcomingSchedules.map((item) => (
                                    <li
                                        key={item.id}
                                        className="rounded-xl border border-indigo-200/70 bg-indigo-50/40 px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-400"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-stone-900">
                                                    {item.title}
                                                </p>
                                                <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ring-1 ${agendaTone(
                                                            item.type
                                                        )}`}
                                                    >
                                                        {item.type}
                                                    </span>
                                                    <span>
                                                        {item.subject} ·{" "}
                                                    </span>
                                                    {item.class}
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    {item.time}
                                                </p>
                                            </div>
                                            <Link
                                                href={item.url}
                                                className="shrink-0 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                                            >
                                                Buka
                                            </Link>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada agenda dalam 7 hari ke depan." />
                        )}
                    </Panel>

                    <Panel title="Aktivitas terbaru" icon={IconChecklist} tone="emerald">
                        {recentActivities && recentActivities.length > 0 ? (
                            <ul className="space-y-4">
                                {recentActivities.map((activity) => (
                                    <li
                                        key={activity.id}
                                        className="flex gap-3 rounded-xl border border-emerald-100/70 bg-emerald-50/40 px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300"
                                    >
                                        <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-stone-300" />
                                        <div className="min-w-0">
                                            <p className="text-sm text-stone-800">
                                                {activity.description}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {activity.subject} · {activity.class} ·{" "}
                                                {activity.time}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada aktivitas terbaru." />
                        )}
                    </Panel>
                </div>
            </div>
        </DashboardLayout>
    );
}
