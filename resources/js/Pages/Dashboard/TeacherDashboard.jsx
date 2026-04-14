import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";

function StatBlock({ label, hint, value, suffix = "" }) {
    return (
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-stone-900">
                {value}
                {suffix}
            </p>
            <p className="mt-1 text-sm text-stone-500">{hint}</p>
        </div>
    );
}

function Panel({ title, children }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-6 py-4">
                <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
            </div>
            <div className="p-6">{children}</div>
        </section>
    );
}

export default function TeacherDashboard() {
    const { stats, recentActivities, classPerformance, pendingTasks } =
        usePage().props;

    return (
        <DashboardLayout title="Dashboard Guru">
            <Head title="Dashboard Guru" />

            <div className="space-y-8">
                <div className="rounded-2xl border border-stone-200/80 bg-white px-8 py-10 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                        Dashboard guru
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
                        Kelola kelas, tugas, dan pantau perkembangan siswa Anda.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <StatBlock
                        label="Siswa"
                        hint="Yang Anda ajar"
                        value={stats?.totalStudents ?? 0}
                    />
                    <StatBlock
                        label="Kelas"
                        hint="Kelas aktif"
                        value={stats?.totalClasses ?? 0}
                    />
                    <StatBlock
                        label="Tugas"
                        hint="Total tugas dibuat"
                        value={stats?.totalTasks ?? 0}
                    />
                    <StatBlock
                        label="Rata nilai"
                        hint="Rata-rata kelas"
                        value={stats?.averageClassGrade ?? 0}
                        suffix="%"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Panel title="Performa kelas">
                        {classPerformance && classPerformance.length > 0 ? (
                            <ul className="space-y-3">
                                {classPerformance.map((classData, i) => (
                                    <li
                                        key={i}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-100 bg-stone-50/40 px-4 py-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-stone-900">
                                                {classData.name}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {classData.subject}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-semibold tabular-nums text-stone-900">
                                                    {classData.averageGrade}%
                                                </p>
                                                <p className="text-xs text-stone-500">
                                                    {classData.totalStudents} siswa
                                                </p>
                                            </div>
                                            <div
                                                className="h-2 w-14 overflow-hidden rounded-full bg-stone-200"
                                                title={`${classData.averageGrade}%`}
                                            >
                                                <div
                                                    className="h-full rounded-full bg-stone-700"
                                                    style={{
                                                        width: `${Math.min(100, classData.averageGrade)}%`,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-6 text-center text-sm text-stone-500">
                                Belum ada data performa kelas
                            </p>
                        )}
                    </Panel>

                    <Panel title="Tugas menunggu penilaian">
                        {pendingTasks && pendingTasks.length > 0 ? (
                            <ul className="space-y-3">
                                {pendingTasks.map((task, i) => (
                                    <li
                                        key={i}
                                        className="rounded-xl border border-stone-100 px-4 py-3"
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
                                            </div>
                                            <span className="shrink-0 rounded-lg bg-stone-100 px-2 py-1 text-xs font-medium text-stone-700">
                                                {task.submissions} belum dinilai
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-6 text-center text-sm text-stone-500">
                                Tidak ada tugas yang menunggu penilaian
                            </p>
                        )}
                    </Panel>
                </div>

                <Panel title="Aktivitas terbaru">
                    {recentActivities && recentActivities.length > 0 ? (
                        <ul className="space-y-4">
                            {recentActivities.map((activity, i) => (
                                <li key={i} className="flex gap-3">
                                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-stone-300" />
                                    <div className="min-w-0">
                                        <p className="text-sm text-stone-800">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-stone-500">
                                            {activity.time}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-6 text-center text-sm text-stone-500">
                            Belum ada aktivitas terbaru
                        </p>
                    )}
                </Panel>

                <Panel title="Aksi cepat">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <a
                            href={route("tasks.create")}
                            className="flex items-center gap-3 rounded-xl border border-stone-200/80 p-4 transition-colors hover:border-stone-300 hover:bg-stone-50"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-medium text-stone-900">
                                    Buat tugas
                                </h4>
                                <p className="text-xs text-stone-500">
                                    Untuk siswa
                                </p>
                            </div>
                        </a>
                        <a
                            href={route("quizzes.create")}
                            className="flex items-center gap-3 rounded-xl border border-stone-200/80 p-4 transition-colors hover:border-stone-300 hover:bg-stone-50"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-medium text-stone-900">
                                    Buat kuis
                                </h4>
                                <p className="text-xs text-stone-500">
                                    Evaluasi singkat
                                </p>
                            </div>
                        </a>
                        <a
                            href={route("materials.create")}
                            className="flex items-center gap-3 rounded-xl border border-stone-200/80 p-4 transition-colors hover:border-stone-300 hover:bg-stone-50"
                        >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-medium text-stone-900">
                                    Unggah materi
                                </h4>
                                <p className="text-xs text-stone-500">
                                    Berbagi ke siswa
                                </p>
                            </div>
                        </a>
                    </div>
                </Panel>
            </div>
        </DashboardLayout>
    );
}
