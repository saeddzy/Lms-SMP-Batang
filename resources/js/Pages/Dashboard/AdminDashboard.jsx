import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import {
    IconAlertTriangle,
    IconBooks,
    IconChartBar,
    IconClipboardCheck,
    IconSchool,
    IconUsers,
} from "@tabler/icons-react";

function StatCard({ label, value, hint, icon: Icon, tone = "indigo" }) {
    const tones = {
        indigo: "border-blue-300/80 bg-blue-100/90",
        sky: "border-sky-300/80 bg-sky-100/90",
        emerald: "border-blue-300/80 bg-blue-100/90",
        amber: "border-indigo-300/80 bg-indigo-100/90",
    };

    return (
        <div
            className={`rounded-2xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${tones[tone] ?? tones.indigo}`}
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                    {label}
                </p>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-stone-700 ring-1 ring-stone-300/80">
                    {Icon ? <Icon className="h-4 w-4" stroke={1.6} /> : null}
                </span>
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-stone-900">
                {value}
            </p>
            <p className="mt-1 text-sm text-stone-600">{hint}</p>
        </div>
    );
}

function Panel({ title, children, icon: Icon }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-blue-100/80 bg-blue-50/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className="border-b border-blue-100 bg-blue-100/80 px-6 py-4">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                    {Icon ? <Icon className="h-4 w-4 text-blue-700" stroke={1.6} /> : null}
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

export default function AdminDashboard() {
    const {
        systemStats = {},
        userStats = {},
        contentStats = {},
        academicStats = {},
        recentActivities = [],
        systemAlerts = [],
    } = usePage().props;

    const totalContent =
        (systemStats.total_materials ?? 0) +
        (systemStats.total_tasks ?? 0) +
        (systemStats.total_quizzes ?? 0) +
        (systemStats.total_exams ?? 0);

    const todayLabel = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <DashboardLayout title="Dashboard Admin">
            <Head title="Dashboard Admin" />

            <div className="space-y-8">
                <div className="overflow-hidden rounded-3xl border border-blue-700/80 bg-gradient-to-br from-[#154497] via-[#1460BE] to-[#1E6FDB] px-8 py-10 shadow-md">
                    <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-white/20 backdrop-blur-sm">
                        {todayLabel}
                    </p>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white">
                        Dashboard Admin
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-100/90">
                        Monitoring operasional LMS: pengguna, performa akademik,
                        aktivitas konten, dan alert prioritas.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                            {systemStats.total_users ?? 0} total user
                        </span>
                        <span className="rounded-full bg-blue-500/95 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20">
                            {totalContent} total konten
                        </span>
                        <span className="rounded-full bg-sky-400/95 px-3 py-1 text-xs font-semibold text-slate-900 ring-1 ring-white/10">
                            {academicStats.overall_average ?? 0}% rata-rata nilai
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Guru aktif"
                        value={userStats.teachers ?? 0}
                        hint="Akun guru terdaftar"
                        icon={IconUsers}
                        tone="sky"
                    />
                    <StatCard
                        label="Siswa aktif"
                        value={userStats.students ?? 0}
                        hint="Akun siswa terdaftar"
                        icon={IconUsers}
                        tone="emerald"
                    />
                    <StatCard
                        label="Kelas aktif"
                        value={systemStats.active_classes ?? 0}
                        hint={`${systemStats.total_classes ?? 0} total kelas`}
                        icon={IconSchool}
                        tone="amber"
                    />
                    <StatCard
                        label="Konten belajar"
                        value={totalContent}
                        hint={`+${contentStats?.recent_content?.total ?? 0} konten (30 hari)`}
                        icon={IconBooks}
                        tone="indigo"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Panel title="Alert Sistem" icon={IconAlertTriangle}>
                        {systemAlerts.length > 0 ? (
                            <ul className="space-y-3">
                                {systemAlerts.map((alert, i) => (
                                    <li
                                        key={`${alert.title}-${i}`}
                                        className={`rounded-xl border px-4 py-3 ${
                                            alert.type === "warning"
                                                ? "border-amber-300/80 bg-amber-50/80"
                                                : "border-sky-300/80 bg-sky-50/80"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-stone-900">
                                                    {alert.title}
                                                </p>
                                                <p className="text-xs text-stone-600">
                                                    {alert.message}
                                                </p>
                                            </div>
                                            {alert.action_url ? (
                                                <a
                                                    href={alert.action_url}
                                                    className="shrink-0 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                                                >
                                                    Buka
                                                </a>
                                            ) : null}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Tidak ada alert saat ini." />
                        )}
                    </Panel>

                    <Panel title="Distribusi Pengguna" icon={IconUsers}>
                        <div className="space-y-3">
                            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                                <div className="mb-1 flex justify-between text-xs text-stone-600">
                                    <span>Admin</span>
                                    <span>
                                        {userStats?.distribution?.admins_percentage ?? 0}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-stone-200">
                                    <div
                                        className="h-2 rounded-full bg-indigo-600"
                                        style={{
                                            width: `${userStats?.distribution?.admins_percentage ?? 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                                <div className="mb-1 flex justify-between text-xs text-stone-600">
                                    <span>Guru</span>
                                    <span>
                                        {userStats?.distribution?.teachers_percentage ?? 0}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-stone-200">
                                    <div
                                        className="h-2 rounded-full bg-sky-600"
                                        style={{
                                            width: `${userStats?.distribution?.teachers_percentage ?? 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3">
                                <div className="mb-1 flex justify-between text-xs text-stone-600">
                                    <span>Siswa</span>
                                    <span>
                                        {userStats?.distribution?.students_percentage ?? 0}%
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-stone-200">
                                    <div
                                        className="h-2 rounded-full bg-emerald-600"
                                        style={{
                                            width: `${userStats?.distribution?.students_percentage ?? 0}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Panel title="Top Kelas Berdasarkan Nilai" icon={IconChartBar}>
                        {academicStats?.top_classes?.length > 0 ? (
                            <ul className="space-y-3">
                                {academicStats.top_classes.map((cls) => (
                                    <li
                                        key={cls.id}
                                        className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-stone-900">
                                                {cls.name}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                Wali: {cls.teacher ?? "-"}
                                            </p>
                                        </div>
                                        <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800">
                                            {cls.average_grade ?? 0}%
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada data performa kelas." />
                        )}
                    </Panel>

                    <Panel title="Guru Paling Aktif" icon={IconClipboardCheck}>
                        {contentStats?.most_active_teachers?.length > 0 ? (
                            <ul className="space-y-3">
                                {contentStats.most_active_teachers.map((teacher) => (
                                    <li
                                        key={teacher.id}
                                        className="rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-sm font-semibold text-stone-900">
                                                {teacher.name}
                                            </p>
                                            <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                                                {teacher.total_content} konten
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-stone-500">
                                            Materi {teacher.materials_count} · Tugas{" "}
                                            {teacher.tasks_count} · Kuis{" "}
                                            {teacher.quizzes_count} · Ujian{" "}
                                            {teacher.exams_count}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <EmptyState text="Belum ada data aktivitas guru." />
                        )}
                    </Panel>
                </div>

                <Panel title="Aktivitas Terbaru Sistem" icon={IconClipboardCheck}>
                    {recentActivities.length > 0 ? (
                        <ul className="space-y-3">
                            {recentActivities.map((activity) => (
                                <li
                                    key={`${activity.type}-${activity.id}`}
                                    className="rounded-xl border border-stone-200 bg-stone-50/60 px-4 py-3"
                                >
                                    <p className="text-sm font-semibold text-stone-900">
                                        {activity.title ?? activity.description}
                                    </p>
                                    <p className="mt-0.5 text-xs text-stone-600">
                                        {activity.details ??
                                            `${activity.time ?? "-"} · ${activity.user ?? "-"}`}
                                    </p>
                                    {activity.date ? (
                                        <p className="mt-1 text-xs text-stone-500">
                                            {new Date(activity.date).toLocaleString("id-ID")}
                                        </p>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <EmptyState text="Belum ada aktivitas sistem." />
                    )}
                </Panel>

                <Panel title="Aksi Cepat Admin" icon={IconClipboardCheck}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <a
                            href={route("users.create")}
                            className="rounded-xl border border-indigo-300/80 bg-indigo-50/70 p-4 text-sm font-medium text-indigo-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-100"
                        >
                            + Tambah user baru
                        </a>
                        <a
                            href={route("classes.create")}
                            className="rounded-xl border border-sky-300/80 bg-sky-50/70 p-4 text-sm font-medium text-sky-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sky-100"
                        >
                            + Buat kelas baru
                        </a>
                        <a
                            href={route("subjects.create")}
                            className="rounded-xl border border-emerald-300/80 bg-emerald-50/70 p-4 text-sm font-medium text-emerald-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100"
                        >
                            + Tambah mata pelajaran
                        </a>
                        <a
                            href={route("admin.reports")}
                            className="rounded-xl border border-amber-300/80 bg-amber-50/70 p-4 text-sm font-medium text-amber-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-100"
                        >
                            Lihat laporan lengkap
                        </a>
                    </div>
                </Panel>
            </div>
        </DashboardLayout>
    );
}
