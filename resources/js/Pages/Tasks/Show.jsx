import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, { formatStudentDateTime } from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Table from "@/Components/Table";
import Button from "@/Components/Button";
import { Head, Link, router, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";
import { hasRole } from "@/Utils/Permissions";
import {
    IconClipboardList,
    IconUsers,
    IconChartBar,
    IconSchool,
    IconArrowLeft,
} from "@tabler/icons-react";

export default function Show() {
    const { task, submissions = [], stats = {} } = usePage().props;

    const isStudent = hasRole("siswa");
    const sc = task.school_class ?? task.schoolClass;
    const teacherName =
        task.teacher?.name ?? task.creator?.name ?? "—";

    const due = task.due_date ? new Date(task.due_date) : null;
    const overdue = due && due < new Date();

    const mySubmission = useMemo(() => {
        if (!isStudent) return null;
        return submissions[0] ?? null;
    }, [isStudent, submissions]);

    const students = sc?.students ?? [];
    const submissionByStudent = useMemo(() => {
        const m = {};
        submissions.forEach((s) => {
            m[s.student_id] = s;
        });
        return m;
    }, [submissions]);

    /** Gabungkan daftar siswa kelas dengan pengumpulan (tampilkan orphan submission jika ada) */
    const teacherStudentRows = useMemo(() => {
        const map = new Map();
        students.forEach((student) => {
            map.set(student.id, {
                student,
                submission: submissionByStudent[student.id] ?? null,
            });
        });
        submissions.forEach((sub) => {
            if (!sub.student_id) return;
            if (!map.has(sub.student_id)) {
                map.set(sub.student_id, {
                    student: sub.student ?? {
                        id: sub.student_id,
                        name: `Siswa #${sub.student_id}`,
                    },
                    submission: sub,
                });
            }
        });
        return Array.from(map.values()).sort((a, b) =>
            String(a.student?.name ?? "").localeCompare(
                String(b.student?.name ?? ""),
                "id"
            )
        );
    }, [students, submissions, submissionByStudent]);

    const MetaGrid = () => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mata pelajaran
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {task.subject?.name ?? "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Kelas
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {sc?.name ?? "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Guru
                </p>
                <p className="mt-1 font-medium text-slate-900">{teacherName}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Nilai maks.
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {task.max_score ?? "—"} poin
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Deadline
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                    {due
                        ? formatStudentDateTime(task.due_date)
                        : "—"}
                </p>
                {overdue ? (
                    <span className="mt-2 inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-800 ring-1 ring-rose-200/80">
                        Lewat deadline
                    </span>
                ) : null}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status tugas
                </p>
                <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                        task.is_active
                            ? "bg-emerald-50 text-emerald-900 ring-emerald-200/80"
                            : "bg-slate-100 text-slate-700 ring-slate-200/80"
                    }`}
                >
                    {task.is_active ? "Aktif" : "Tidak aktif"}
                </span>
            </div>
        </div>
    );

    const body = (
        <>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900">
                    Deskripsi
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {task.description?.trim()
                        ? task.description
                        : "Tidak ada deskripsi."}
                </p>
                {task.instructions?.trim() ? (
                    <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <h4 className="text-sm font-semibold text-indigo-950">
                            Instruksi
                        </h4>
                        <div className="prose prose-sm mt-2 max-w-none whitespace-pre-wrap text-indigo-950/90">
                            {task.instructions}
                        </div>
                    </div>
                ) : null}
            </div>

            {isStudent && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">
                        Pengumpulan saya
                    </h3>
                    {mySubmission?.submitted_at ? (
                        <div className="mt-4 space-y-3 text-sm">
                            <p className="text-slate-600">
                                Dikirim:{" "}
                                <strong>
                                    {formatStudentDateTime(
                                        mySubmission.submitted_at
                                    )}
                                </strong>
                            </p>
                            {mySubmission.content ? (
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase text-slate-500">
                                        Teks
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap text-slate-800">
                                        {mySubmission.content}
                                    </p>
                                </div>
                            ) : null}
                            {mySubmission.file_path ? (
                                <a
                                    href={`/storage/${String(
                                        mySubmission.file_path
                                    ).replace(/^\/+/, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                    Unduh / buka lampiran
                                </a>
                            ) : null}
                            {mySubmission.score != null ? (
                                <div className="flex flex-wrap items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white">
                                    <span className="text-sm opacity-90">
                                        Nilai
                                    </span>
                                    <span className="text-2xl font-bold tabular-nums">
                                        {mySubmission.score}
                                    </span>
                                    <span className="text-sm opacity-75">
                                        / {task.max_score ?? 100}
                                    </span>
                                </div>
                            ) : (
                                <p className="text-slate-500">
                                    Menunggu penilaian guru.
                                </p>
                            )}
                            {mySubmission.feedback ? (
                                <div className="rounded-xl border border-amber-100 bg-amber-50/80 p-4 text-amber-950">
                                    <p className="text-xs font-semibold uppercase">
                                        Feedback guru
                                    </p>
                                    <p className="mt-2 whitespace-pre-wrap">
                                        {mySubmission.feedback}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-slate-600">
                            Anda belum mengumpulkan tugas ini.
                        </p>
                    )}
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href={route("student.tasks")}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                            <IconArrowLeft
                                className="h-4 w-4"
                                stroke={1.5}
                            />
                            Kembali ke daftar tugas
                        </Link>
                        {task.is_active ? (
                            <button
                                type="button"
                                onClick={() =>
                                    router.visit(
                                        route("tasks.submit-page", task.id)
                                    )
                                }
                                className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
                            >
                                {mySubmission ? "Ubah pengumpulan" : "Kumpulkan tugas"}
                            </button>
                        ) : null}
                    </div>
                </div>
            )}

            {!isStudent && hasAnyPermission(["tasks view_submissions"]) && (
                <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <StudentStatCard
                            icon={IconUsers}
                            label="Siswa di kelas"
                            value={stats.total_students ?? 0}
                            hint="Terdaftar di kelas ini"
                            accent="indigo"
                        />
                        <StudentStatCard
                            icon={IconClipboardList}
                            label="Sudah kumpul"
                            value={stats.submitted_count ?? 0}
                            hint="Mengirim pengumpulan"
                            accent="emerald"
                        />
                        <StudentStatCard
                            icon={IconChartBar}
                            label="Sudah dinilai"
                            value={stats.graded_count ?? 0}
                            hint="Nilai terisi"
                            accent="amber"
                        />
                        <StudentStatCard
                            icon={IconSchool}
                            label="Rata-rata nilai"
                            value={
                                stats.avg_score != null && stats.avg_score > 0
                                    ? String(stats.avg_score)
                                    : "—"
                            }
                            hint="Dari pengumpulan terukur"
                            accent="cyan"
                        />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Pengumpulan per siswa
                        </h2>
                        {hasAnyPermission(["tasks grade"]) && (
                            <Link
                                href={route("teacher.grade-task", task.id)}
                                className="inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Buka halaman penilaian
                            </Link>
                        )}
                    </div>

                    <Table.Card
                        title={`${teacherStudentRows.length} siswa (terdaftar + pengumpulan)`}
                    >
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th>#</Table.Th>
                                    <Table.Th>Siswa</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Dikumpulkan</Table.Th>
                                    <Table.Th>Nilai</Table.Th>
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {teacherStudentRows.length > 0 ? (
                                    teacherStudentRows.map((row, i) => {
                                        const sub = row.submission;
                                        return (
                                            <tr key={row.student.id}>
                                                <Table.Td>{i + 1}</Table.Td>
                                                <Table.Td className="font-medium">
                                                    {row.student.name}
                                                </Table.Td>
                                                <Table.Td>
                                                    {sub?.submitted_at ? (
                                                        <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-900 ring-1 ring-emerald-200/80">
                                                            Terkumpul
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">
                                                            Belum
                                                        </span>
                                                    )}
                                                </Table.Td>
                                                <Table.Td className="text-sm text-slate-600">
                                                    {sub?.submitted_at
                                                        ? formatStudentDateTime(
                                                              sub.submitted_at
                                                          )
                                                        : "—"}
                                                </Table.Td>
                                                <Table.Td>
                                                    {sub?.score != null ? (
                                                        <span className="font-bold tabular-nums text-slate-900">
                                                            {sub.score}
                                                        </span>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </Table.Td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <Table.Td
                                            colSpan={5}
                                            className="py-10 text-center text-slate-500"
                                        >
                                            Belum ada siswa atau pengumpulan untuk
                                            tugas ini.
                                        </Table.Td>
                                    </tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </Table.Card>
                </>
            )}
        </>
    );

    return (
        <DashboardLayout title={`Detail Tugas: ${task.title}`}>
            <Head title={`Detail Tugas: ${task.title}`} />

            {isStudent ? (
                <StudentShell
                    eyebrow="Tugas"
                    title={task.title}
                    subtitle={`${task.subject?.name ?? "Mapel"} · ${sc?.name ?? "Kelas"}`}
                >
                    <MetaGrid />
                    {body}
                </StudentShell>
            ) : (
                <div className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        {task.title}
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {sc?.name ?? "—"} ·{" "}
                                        {task.subject?.name ?? "—"}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {hasAnyPermission(["tasks edit"]) && (
                                        <Button
                                            type="edit"
                                            url={route("tasks.edit", task.id)}
                                        />
                                    )}
                                    {hasAnyPermission(["tasks delete"]) && (
                                        <Button
                                            type="delete"
                                            url={route(
                                                "tasks.destroy",
                                                task.id
                                            )}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="p-6">
                            <MetaGrid />
                        </div>
                    </div>
                    {body}
                </div>
            )}
        </DashboardLayout>
    );
}
