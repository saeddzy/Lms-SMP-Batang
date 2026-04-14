import React from "react";
import clsx from "clsx";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, { formatStudentDateTime } from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconSchool,
    IconClipboardList,
    IconBrain,
    IconChartBar,
    IconCalendarEvent,
    IconActivity,
    IconBook,
    IconArrowRight,
    IconFlame,
} from "@tabler/icons-react";

function gradeLetter(score) {
    if (score == null || Number.isNaN(Number(score))) return "—";
    const n = Number(score);
    if (n >= 90) return "A";
    if (n >= 80) return "B";
    if (n >= 70) return "C";
    if (n >= 60) return "D";
    return "E";
}

function examTypeLabel(type) {
    const m = {
        mid_term: "UTS",
        final: "UAS",
        quiz: "Kuis",
        practice: "Latihan",
        remedial: "Remedial",
    };
    return m[type] || type || "—";
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

export default function StudentDashboard() {
    const {
        auth,
        enrolledClasses = [],
        recentActivities = [],
        upcomingTasks = [],
        upcomingQuizzes = [],
        upcomingExams = [],
        recentGrades = [],
        learningStats = {},
        recentMaterials = [],
    } = usePage().props;

    const user = auth?.user;
    const firstName = user?.name?.split?.(" ")?.[0] || "Siswa";

    const classCount = Array.isArray(enrolledClasses)
        ? enrolledClasses.length
        : enrolledClasses?.data?.length ?? 0;

    const lt = learningStats?.tasks ?? {};
    const lq = learningStats?.quizzes ?? {};
    const avg = learningStats?.average_grade ?? 0;

    return (
        <DashboardLayout title="Dashboard Siswa">
            <Head title="Dashboard Siswa" />

            <StudentShell
                title={`Halo, ${firstName}`}
                subtitle="Ringkasan pembelajaran Anda — jadwal, progres, dan materi terbaru dalam satu layar."
            >
                {/* Quick stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StudentStatCard
                        icon={IconSchool}
                        label="Kelas diikuti"
                        value={classCount}
                        hint="Kelas Anda saat ini"
                        accent="indigo"
                    />
                    <StudentStatCard
                        icon={IconClipboardList}
                        label="Progres tugas"
                        value={`${lt.completed ?? 0}/${lt.total ?? 0}`}
                        hint={
                            lt.total > 0
                                ? `${lt.completion_rate ?? 0}% selesai`
                                : "Belum ada tugas"
                        }
                        accent="emerald"
                    />
                    <StudentStatCard
                        icon={IconBrain}
                        label="Kuis & latihan"
                        value={`${lq.completed ?? 0}/${lq.total ?? 0}`}
                        hint={
                            lq.total > 0
                                ? `Lulus: ${lq.passed ?? 0} · ${lq.pass_rate ?? 0}%`
                                : "Belum ada kuis"
                        }
                        accent="amber"
                    />
                    <StudentStatCard
                        icon={IconChartBar}
                        label="Rata-rata nilai"
                        value={`${avg}%`}
                        hint={`Predikat ${gradeLetter(avg)}`}
                        accent="cyan"
                    />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Agenda */}
                    <section className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                    <IconCalendarEvent
                                        className="h-5 w-5"
                                        stroke={1.5}
                                    />
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Agenda mendatang
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        7 hari ke depan
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route("student.tasks")}
                                className="hidden text-sm font-medium text-indigo-600 hover:text-indigo-800 sm:inline-flex sm:items-center sm:gap-1"
                            >
                                Lihat semua
                                <IconArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <AgendaColumn
                                title="Tugas"
                                empty="Tidak ada deadline mendatang"
                                items={upcomingTasks}
                                render={(t) => (
                                    <AgendaItem
                                        key={t.id}
                                        href={route("tasks.show", t.id)}
                                        badge={
                                            t.submitted
                                                ? "Sudah kumpul"
                                                : `${t.days_left ?? 0} hari lagi`
                                        }
                                        badgeTone={
                                            t.submitted ? "done" : "warn"
                                        }
                                        meta={`${t.subject} · ${t.class}`}
                                        title={t.title}
                                        foot={formatStudentDateTime(t.due_date)}
                                    />
                                )}
                            />
                            <AgendaColumn
                                title="Kuis"
                                empty="Tidak ada kuis di jendela ini"
                                items={upcomingQuizzes}
                                render={(q) => (
                                    <AgendaItem
                                        key={q.id}
                                        href={route("quizzes.show", q.id)}
                                        badge={
                                            q.is_open
                                                ? "Sedang dibuka"
                                                : "Akan dibuka"
                                        }
                                        badgeTone={
                                            q.is_open ? "success" : "info"
                                        }
                                        meta={`${q.subject} · ${q.class}`}
                                        title={q.title}
                                        foot={
                                            q.is_open && q.end_time
                                                ? `Selesai ${formatStudentDateTime(q.end_time)}`
                                                : formatStudentDateTime(
                                                      q.start_time
                                                  )
                                        }
                                    />
                                )}
                            />
                            <AgendaColumn
                                title="Ujian"
                                empty="Tidak ada ujian di jendela ini"
                                items={upcomingExams}
                                render={(e) => (
                                    <AgendaItem
                                        key={e.id}
                                        href={route("exams.show", e.id)}
                                        badge={examTypeLabel(e.type)}
                                        badgeTone="neutral"
                                        meta={`${e.subject} · ${e.class}`}
                                        title={e.title}
                                        foot={formatStudentDateTime(
                                            e.scheduled_date
                                        )}
                                    />
                                )}
                            />
                        </div>
                    </section>

                    {/* Aktivitas */}
                    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                                <IconActivity className="h-5 w-5" stroke={1.5} />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    Aktivitas terbaru
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Pengumpulan & penilaian
                                </p>
                            </div>
                        </div>
                        {recentActivities.length > 0 ? (
                            <ul className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                                {recentActivities.map((a) => {
                                    const Icon = activityIcon(a.type);
                                    return (
                                        <li
                                            key={`${a.type}-${a.id}`}
                                            className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
                                        >
                                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/80">
                                                <Icon
                                                    className="h-4 w-4"
                                                    stroke={1.5}
                                                />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium leading-snug text-slate-900">
                                                    {a.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {a.subject} · {a.class}
                                                </p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                                    <span className="rounded-md bg-white px-2 py-0.5 font-medium text-slate-600 ring-1 ring-slate-200/80">
                                                        {a.status}
                                                    </span>
                                                    <span className="text-slate-400">
                                                        {formatStudentDateTime(
                                                            a.date
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="py-8 text-center text-sm text-slate-500">
                                Belum ada aktivitas. Mulai dengan mengerjakan
                                tugas atau kuis.
                            </p>
                        )}
                    </section>
                </div>

                {/* Nilai singkat + materi */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                    <IconChartBar
                                        className="h-5 w-5"
                                        stroke={1.5}
                                    />
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Nilai terbaru
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Dari sistem penilaian
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route("student.grades")}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                Riwayat
                            </Link>
                        </div>
                        {recentGrades.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {recentGrades.slice(0, 6).map((g) => (
                                    <div
                                        key={g.id}
                                        className="flex flex-col rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 ring-1 ring-slate-100/80"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="line-clamp-2 text-sm font-semibold text-slate-900">
                                                {g.subject}
                                            </span>
                                            <span className="shrink-0 rounded-lg bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                                                {gradeLetter(g.score)}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                                            {g.score ?? "—"}%
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {g.component || "Komponen"} ·{" "}
                                            {formatStudentDateTime(
                                                g.calculated_at
                                            )}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="py-6 text-center text-sm text-slate-500">
                                Nilai akan muncul setelah guru mempublikasikan
                                hasil.
                            </p>
                        )}
                    </section>

                    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                                    <IconBook className="h-5 w-5" stroke={1.5} />
                                </span>
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Materi baru
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Di kelas Anda
                                    </p>
                                </div>
                            </div>
                            <Link
                                href={route("materials.index")}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                            >
                                Semua materi
                            </Link>
                        </div>
                        {recentMaterials.length > 0 ? (
                            <ul className="space-y-2">
                                {recentMaterials.slice(0, 5).map((m) => (
                                    <li key={m.id}>
                                        <Link
                                            href={route(
                                                "materials.show",
                                                m.id
                                            )}
                                            className="group flex items-start justify-between gap-3 rounded-xl border border-transparent px-3 py-2 transition hover:border-indigo-100 hover:bg-indigo-50/50"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-800">
                                                    {m.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {m.subject} · {m.class}
                                                </p>
                                            </div>
                                            <IconArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                                <IconFlame
                                    className="h-10 w-10 text-amber-400"
                                    stroke={1.25}
                                />
                                <p className="text-sm text-slate-500">
                                    Belum ada materi baru. Cek lagi nanti.
                                </p>
                            </div>
                        )}
                    </section>
                </div>
            </StudentShell>
        </DashboardLayout>
    );
}

function AgendaColumn({ title, items, empty, render }) {
    return (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                {title}
            </h3>
            {items.length > 0 ? (
                <ul className="space-y-2">{items.map(render)}</ul>
            ) : (
                <p className="text-sm text-slate-500">{empty}</p>
            )}
        </div>
    );
}

function AgendaItem({
    href,
    title,
    meta,
    foot,
    badge,
    badgeTone = "neutral",
}) {
    const tones = {
        done: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
        success: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
        warn: "bg-amber-50 text-amber-900 ring-amber-200/80",
        info: "bg-sky-50 text-sky-800 ring-sky-200/80",
        neutral: "bg-slate-50 text-slate-700 ring-slate-200/80",
    };
    return (
        <li>
            <Link
                href={href}
                className="block rounded-xl border border-slate-100 bg-slate-50/80 p-3 transition hover:border-indigo-200 hover:bg-white hover:shadow-sm"
            >
                <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                        {title}
                    </p>
                    {badge ? (
                        <span
                            className={clsx(
                                "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                                tones[badgeTone] ?? tones.neutral
                            )}
                        >
                            {badge}
                        </span>
                    ) : null}
                </div>
                <p className="mt-1 text-xs text-slate-500">{meta}</p>
                <p className="mt-2 text-xs font-medium text-indigo-600">{foot}</p>
            </Link>
        </li>
    );
}
