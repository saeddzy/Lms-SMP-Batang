import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";

function StatBlock({ label, hint, value }) {
    return (
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">
                {label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-stone-900">
                {value}
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

function StatusLine({ label, ok }) {
    return (
        <div className="flex items-center justify-between border-b border-stone-50 py-3 last:border-0">
            <span className="text-sm text-stone-600">{label}</span>
            <span
                className={
                    ok
                        ? "text-xs font-medium text-emerald-700"
                        : "text-xs font-medium text-red-600"
                }
            >
                {ok ? "Sehat" : "Bermasalah"}
            </span>
        </div>
    );
}

export default function AdminDashboard() {
    const { stats, recentActivities, systemHealth, userGrowth } = usePage().props;

    return (
        <DashboardLayout title="Dashboard Admin">
            <Head title="Dashboard Admin" />

            <div className="space-y-8">
                <div className="rounded-2xl border border-stone-200/80 bg-white px-8 py-10 shadow-sm">
                    <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                        Dashboard administrator
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
                        Pantau performa sistem dan kelola LMS SMP Batang dari satu
                        tempat.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                    <StatBlock
                        label="Siswa"
                        hint="Terdaftar di sistem"
                        value={stats?.totalStudents ?? 0}
                    />
                    <StatBlock
                        label="Guru"
                        hint="Pengajar aktif"
                        value={stats?.totalTeachers ?? 0}
                    />
                    <StatBlock
                        label="Kelas"
                        hint="Kelas aktif"
                        value={stats?.totalClasses ?? 0}
                    />
                    <StatBlock
                        label="Materi"
                        hint="Unggahan pembelajaran"
                        value={stats?.totalMaterials ?? 0}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Panel title="Status sistem">
                        <div className="divide-y divide-stone-100">
                            <StatusLine
                                label="Database"
                                ok={systemHealth?.database === "healthy"}
                            />
                            <StatusLine
                                label="Storage"
                                ok={systemHealth?.storage === "healthy"}
                            />
                            <StatusLine
                                label="Cache"
                                ok={systemHealth?.cache === "healthy"}
                            />
                            <StatusLine
                                label="Queue"
                                ok={systemHealth?.queue === "healthy"}
                            />
                        </div>
                        <div className="mt-4 flex justify-between border-t border-stone-100 pt-4 text-sm">
                            <span className="font-medium text-stone-800">
                                Uptime
                            </span>
                            <span className="text-stone-500">
                                {systemHealth?.uptime ?? "N/A"}
                            </span>
                        </div>
                    </Panel>

                    <Panel title="Pertumbuhan pengguna">
                        {userGrowth && userGrowth.length > 0 ? (
                            <ul className="space-y-4">
                                {userGrowth.map((growth, i) => (
                                    <li
                                        key={i}
                                        className="flex items-start justify-between gap-4 border-b border-stone-50 pb-4 last:border-0 last:pb-0"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-stone-900">
                                                {growth.period}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                {growth.description}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold tabular-nums text-stone-900">
                                                +{growth.newUsers}
                                            </p>
                                            <p className="text-xs text-stone-500">
                                                pengguna baru
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="py-6 text-center text-sm text-stone-500">
                                Belum ada data pertumbuhan
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
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-stone-800">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-stone-500">
                                            {activity.time} · {activity.user}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="py-6 text-center text-sm text-stone-500">
                            Belum ada aktivitas sistem
                        </p>
                    )}
                </Panel>

                <Panel title="Aksi cepat">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                        <a
                            href={route("users.create")}
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
                                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-medium text-stone-900">
                                    Tambah user
                                </h4>
                                <p className="text-xs text-stone-500">
                                    Siswa atau guru baru
                                </p>
                            </div>
                        </a>
                        <a
                            href={route("classes.create")}
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
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-medium text-stone-900">
                                    Buat kelas
                                </h4>
                                <p className="text-xs text-stone-500">
                                    Kelas baru
                                </p>
                            </div>
                        </a>
                        <a
                            href={route("subjects.create")}
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
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-medium text-stone-900">
                                    Tambah mapel
                                </h4>
                                <p className="text-xs text-stone-500">
                                    Mata pelajaran baru
                                </p>
                            </div>
                        </a>
                        <a
                            href={route("admin.reports")}
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
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </span>
                            <div>
                                <h4 className="text-sm font-medium text-stone-900">
                                    Laporan
                                </h4>
                                <p className="text-xs text-stone-500">
                                    Ringkasan sistem
                                </p>
                            </div>
                        </a>
                    </div>
                </Panel>
            </div>
        </DashboardLayout>
    );
}
