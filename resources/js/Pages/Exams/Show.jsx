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
    IconTestPipe,
    IconUsers,
    IconCircleCheck,
    IconClock,
    IconPercentage,
    IconSettings,
    IconCalendarTime,
    IconListCheck,
} from "@tabler/icons-react";
import QuestionBank from "@/Components/Lms/QuestionBank";
import ToggleSwitch from "@/Components/ToggleSwitch";

function attemptProgressBadge(att) {
    if (!att.finished_at) {
        return {
            text: "Berlangsung",
            className:
                "bg-amber-50 text-amber-900 ring-amber-200/80",
        };
    }
    if (
        att.attempt_status === "menunggu_penilaian" ||
        att.essay_grading_pending
    ) {
        return {
            text: "Menunggu penilaian",
            className: "bg-sky-50 text-sky-900 ring-sky-200/80",
        };
    }
    return {
        text: "Selesai",
        className: "bg-emerald-50 text-emerald-900 ring-emerald-200/80",
    };
}

function examTypeLabel(t) {
    const m = {
        mid_term: "UTS",
        final: "UAS",
        quiz: "Kuis",
        practice: "Latihan",
        remedial: "Remedial",
    };
    return m[t] || t || "—";
}

function examWindow(exam) {
    if (exam.is_cancelled) return "batal";
    if (!exam.scheduled_date || exam.duration_minutes == null) return "invalid";
    const start = new Date(exam.scheduled_date);
    const end = new Date(
        start.getTime() + Number(exam.duration_minutes) * 60 * 1000
    );
    const now = new Date();
    if (now < start) return "belum";
    if (now > end) return "selesai";
    return "buka";
}

export default function Show() {
    const { exam, attempts = [], canManageExam = false } = usePage().props;
    const isStudent = hasRole("siswa");
    const sc = exam.school_class ?? exam.schoolClass;

    const window = examWindow(exam);
    const unfinished = useMemo(
        () => attempts.find((a) => !a.finished_at),
        [attempts]
    );

    const completedAttempts = attempts.filter((a) => a.finished_at);
    const avgScore =
        completedAttempts.length > 0
            ? Math.round(
                  (completedAttempts.reduce(
                      (s, a) => s + Number(a.score ?? 0),
                      0
                  ) /
                      completedAttempts.length) *
                      10
              ) / 10
            : null;

    const students = sc?.students ?? [];

    const examHasEssay = useMemo(
        () =>
            (exam.questions ?? []).some(
                (q) => q.question_type === "essay"
            ),
        [exam.questions]
    );

    const startOrContinue = () => {
        if (unfinished) {
            router.visit(
                route("exams.attempt", {
                    exam: exam.id,
                    attempt: unfinished.id,
                })
            );
            return;
        }
        router.post(route("exams.start-attempt", exam.id));
    };

    const metaBlock = (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Tipe
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {examTypeLabel(exam.exam_type ?? exam.type)}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Mapel
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {exam.subject?.name ?? "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Kelas
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {sc?.name ?? "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Durasi
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {exam.duration_minutes != null
                        ? `${exam.duration_minutes} menit`
                        : "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Mulai ujian
                </p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                    {exam.scheduled_date
                        ? formatStudentDateTime(exam.scheduled_date)
                        : "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Ambang lulus
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {exam.passing_marks != null
                        ? `${exam.passing_marks}%`
                        : "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Percobaan maks.
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {exam.max_attempts ?? "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Pengaturan
                </p>
                <p className="mt-1 text-sm text-slate-800">
                    Pengawasan:{" "}
                    {exam.requires_supervision ? "diperlukan" : "tidak"} ·
                    Review: {exam.allow_review ? "diizinkan" : "tidak"}
                </p>
            </div>
        </div>
    );

    const attemptsTable = (
        <Table.Card title={`Percobaan (${attempts.length})`}>
            <Table>
                <Table.Thead>
                    <tr>
                        <Table.Th>#</Table.Th>
                        {!isStudent && <Table.Th>Siswa</Table.Th>}
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Mulai</Table.Th>
                        <Table.Th>Selesai</Table.Th>
                        <Table.Th>Nilai</Table.Th>
                        <Table.Th>Lulus</Table.Th>
                        {!isStudent &&
                            hasAnyPermission(["exams grade"]) && (
                                <Table.Th>Aksi</Table.Th>
                            )}
                    </tr>
                </Table.Thead>
                <Table.Tbody>
                    {attempts.length > 0 ? (
                        attempts.map((att, i) => (
                            <tr key={att.id}>
                                <Table.Td>{i + 1}</Table.Td>
                                {!isStudent && (
                                    <Table.Td>
                                        {att.student?.name ?? "—"}
                                    </Table.Td>
                                )}
                                <Table.Td>
                                    {(() => {
                                        const st = attemptProgressBadge(att);
                                        return (
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${st.className}`}
                                            >
                                                {st.text}
                                            </span>
                                        );
                                    })()}
                                </Table.Td>
                                <Table.Td className="text-sm">
                                    {att.started_at
                                        ? formatStudentDateTime(att.started_at)
                                        : "—"}
                                </Table.Td>
                                <Table.Td className="text-sm">
                                    {att.finished_at
                                        ? formatStudentDateTime(att.finished_at)
                                        : "—"}
                                </Table.Td>
                                <Table.Td>
                                    {att.score != null ? `${att.score}%` : "—"}
                                </Table.Td>
                                <Table.Td>
                                    {att.passed === true
                                        ? "Ya"
                                        : att.passed === false
                                          ? "Tidak"
                                          : "—"}
                                </Table.Td>
                                {!isStudent &&
                                    hasAnyPermission([
                                        "exams grade",
                                    ]) && (
                                        <Table.Td>
                                            {att.finished_at ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        type="view"
                                                        url={route(
                                                            "exams.attempt",
                                                            {
                                                                exam: exam.id,
                                                                attempt:
                                                                    att.id,
                                                            }
                                                        )}
                                                        text="Lihat"
                                                    />
                                                    {examHasEssay ? (
                                                        <Link
                                                            href={route(
                                                                "exams.manual-grade",
                                                                {
                                                                    exam: exam.id,
                                                                    attempt:
                                                                        att.id,
                                                                }
                                                            )}
                                                            className="inline-flex rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-950 ring-1 ring-amber-200 hover:bg-amber-200"
                                                        >
                                                            {att.essay_grading_pending
                                                                ? "Nilai esai"
                                                                : "Lihat / ubah esai"}
                                                        </Link>
                                                    ) : null}
                                                </div>
                                            ) : (
                                                "—"
                                            )}
                                        </Table.Td>
                                    )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <Table.Td
                                colSpan={
                                    isStudent
                                        ? 6
                                        : hasAnyPermission([
                                                "exams grade",
                                            ])
                                          ? 8
                                          : 7
                                }
                                className="py-10 text-center text-slate-500"
                            >
                                Belum ada percobaan.
                            </Table.Td>
                        </tr>
                    )}
                </Table.Tbody>
            </Table>
        </Table.Card>
    );

    const statsRow =
        !isStudent && hasAnyPermission(["exams view"]) ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <StudentStatCard
                    icon={IconUsers}
                    label="Siswa kelas"
                    value={students.length}
                    hint="Terdaftar"
                    accent="indigo"
                />
                <StudentStatCard
                    icon={IconCircleCheck}
                    label="Selesai"
                    value={attempts.filter((a) => a.finished_at).length}
                    hint="Percobaan selesai"
                    accent="emerald"
                />
                <StudentStatCard
                    icon={IconClock}
                    label="Berlangsung"
                    value={attempts.filter((a) => !a.finished_at).length}
                    hint="Belum selesai"
                    accent="amber"
                />
                <StudentStatCard
                    icon={IconPercentage}
                    label="Rata nilai"
                    value={avgScore != null ? `${avgScore}%` : "—"}
                    hint="Dari yang selesai"
                    accent="cyan"
                />
            </div>
        ) : null;

    const teacherActionPanel =
        !isStudent ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-indigo-700">
                        <IconSettings size={15} />
                        Pengaturan
                    </p>
                    <p className="mt-1 text-sm text-indigo-950">
                        Kelola durasi, jadwal, ambang lulus, dan aturan pengerjaan.
                    </p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700">
                        <IconListCheck size={15} />
                        Penilaian
                    </p>
                    <p className="mt-1 text-sm text-emerald-950">
                        Cek percobaan siswa dan nilai esai dari satu halaman detail.
                    </p>
                </div>
                <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-sky-700">
                        <IconCalendarTime size={15} />
                        Jadwal aktif
                    </p>
                    <p className="mt-1 text-sm text-sky-950">
                        Pastikan waktu pelaksanaan sesuai jam belajar di kelas.
                    </p>
                </div>
            </div>
        ) : null;

    const banner =
        window === "batal" ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-950">
                Ujian ini dibatalkan.
            </div>
        ) : window === "invalid" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                Jadwal ujian belum lengkap (tanggal / durasi).
            </div>
        ) : (
            <div
                className={`rounded-xl border p-4 text-sm ${
                    window === "buka"
                        ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                        : window === "belum"
                          ? "border-sky-200 bg-sky-50/80 text-sky-950"
                          : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
            >
                <p className="font-semibold">
                    {window === "buka" && "Jadwal ujian sedang berlangsung"}
                    {window === "belum" && "Ujian belum dimulai"}
                    {window === "selesai" && "Waktu ujian sudah berakhir"}
                </p>
            </div>
        );

    const inner = (
        <>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                {banner}
                <div className="mt-6">{metaBlock}</div>
                {exam.description ? (
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Deskripsi
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                            {exam.description}
                        </p>
                    </div>
                ) : null}
                {exam.instructions ? (
                    <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <h3 className="text-sm font-semibold text-indigo-950">
                            Instruksi
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-indigo-950/90">
                            {exam.instructions}
                        </p>
                    </div>
                ) : null}
                <div className="mt-4 text-xs text-slate-500">
                    Pembuat: {exam.creator?.name ?? exam.teacher?.name ?? "—"}
                </div>
            </div>

            {statsRow}

            {teacherActionPanel}

            {isStudent &&
                exam.is_active &&
                window !== "batal" &&
                window !== "invalid" && (
                    <div className="flex flex-wrap gap-3">
                        {(window === "buka" || unfinished) && (
                            <button
                                type="button"
                                onClick={startOrContinue}
                                className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
                            >
                                {unfinished
                                    ? "Lanjutkan ujian"
                                    : "Mulai ujian"}
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() =>
                                router.visit(route("student.exams"))
                            }
                            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Kembali ke daftar ujian
                        </button>
                    </div>
                )}

            {!isStudent && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Aksi guru
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {canManageExam &&
                                hasAnyPermission(["exams edit"]) && (
                                    <Button
                                        type="edit"
                                        url={route("exams.edit", exam.id)}
                                    />
                                )}
                            {canManageExam &&
                                hasAnyPermission(["exams delete"]) && (
                                    <Button
                                        type="delete"
                                        url={route(
                                            "exams.destroy",
                                            exam.id
                                        )}
                                    />
                                )}
                        </div>
                    </div>
                    {canManageExam &&
                        hasAnyPermission(["exams edit"]) && (
                            <ToggleSwitch
                                checked={exam.is_active}
                                label="Ujian aktif"
                                description="Nonaktifkan agar siswa tidak mengikuti ujian ini."
                                onChange={() =>
                                    router.patch(
                                        route(
                                            "exams.toggle-status",
                                            exam.id
                                        ),
                                        {},
                                        { preserveScroll: true }
                                    )
                                }
                            />
                        )}
                </div>
            )}

            {attemptsTable}

            {!isStudent && (
                <QuestionBank
                    mode="exam"
                    entityId={exam.id}
                    questions={exam.questions ?? []}
                    canManage={canManageExam && hasAnyPermission(["exams edit"])}
                    entityLabel="ujian"
                />
            )}
        </>
    );

    return (
        <DashboardLayout title={`Detail Ujian: ${exam.title}`}>
            <Head title={`Detail Ujian: ${exam.title}`} />

            {isStudent ? (
                <StudentShell
                    eyebrow="Ujian"
                    title={exam.title}
                    subtitle={`${exam.subject?.name ?? "Mapel"} · ${sc?.name ?? "Kelas"}`}
                >
                    <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                            <IconTestPipe
                                className="h-7 w-7"
                                stroke={1.25}
                            />
                        </span>
                        <p className="text-sm text-slate-600">
                            Ikuti jadwal resmi. Penilaian mengacu pada ambang
                            kelulusan yang tertera.
                        </p>
                    </div>
                    {inner}
                </StudentShell>
            ) : (
                <div className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                            <h1 className="text-2xl font-bold text-slate-900">
                                {exam.title}
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {sc?.name ?? "—"} ·{" "}
                                {exam.subject?.name ?? "—"}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Total soal
                                </p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {exam.questions?.length ?? exam.total_questions ?? 0}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Attempt selesai
                                </p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {attempts.filter((a) => a.finished_at).length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Rata-rata saat ini
                                </p>
                                <p className="mt-1 text-lg font-bold text-indigo-700">
                                    {avgScore != null ? `${avgScore}%` : "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                    {inner}
                </div>
            )}
        </DashboardLayout>
    );
}
