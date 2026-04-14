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
    IconBrain,
    IconUsers,
    IconCircleCheck,
    IconClock,
    IconPercentage,
    IconCalendarTime,
    IconSettings,
    IconListCheck,
} from "@tabler/icons-react";
import QuestionBank from "@/Components/Lms/QuestionBank";

function attemptRowStatus(att) {
    if (att.finished_at) return "completed";
    return "in_progress";
}

/** Keadaan jendela waktu vs jam sekarang (bukan soal sudah diisi atau belum). */
function quizWindowLabel(quiz) {
    const st = quiz.start_time ? new Date(quiz.start_time) : null;
    const en = quiz.end_time ? new Date(quiz.end_time) : null;
    if (!st || !en) return "jadwal_tidak_lengkap";
    const now = new Date();
    if (now < st) return "belum_mulai";
    if (now > en) return "berakhir";
    return "buka";
}

export default function Show() {
    const { quiz, attempts = [] } = usePage().props;
    const isStudent = hasRole("siswa");
    const sc = quiz.school_class ?? quiz.schoolClass;

    const quizHasEssay = useMemo(
        () =>
            (quiz.questions ?? []).some(
                (q) => q.question_type === "essay"
            ),
        [quiz.questions]
    );

    const window = quizWindowLabel(quiz);
    const canStart =
        quiz.is_active &&
        window === "buka" &&
        (attempts.filter((a) => !a.finished_at).length === 0
            ? true
            : false);

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

    const startOrContinue = () => {
        if (unfinished) {
            router.visit(
                route("quizzes.attempt", {
                    quiz: quiz.id,
                    attempt: unfinished.id,
                })
            );
            return;
        }
        router.post(route("quizzes.start-attempt", quiz.id));
    };

    const metaBlock = (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Mapel
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.subject?.name ?? "—"}
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
                    Waktu pengerjaan
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.time_limit ? `${quiz.time_limit} menit` : "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Soal / lulus
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.questions?.length ?? quiz.total_questions ?? 0} soal ·
                    lulus ≥ {quiz.passing_score ?? "—"}%
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Jendela kuis
                </p>
                <p className="mt-1 text-sm text-slate-800">
                    {quiz.start_time
                        ? formatStudentDateTime(quiz.start_time)
                        : "—"}{" "}
                    —{" "}
                    {quiz.end_time
                        ? formatStudentDateTime(quiz.end_time)
                        : "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Percobaan maks.
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.max_attempts ?? "—"}
                </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">
                    Acak soal
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.is_randomized ? "Ya" : "Tidak"}
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
                        {!isStudent && hasAnyPermission(["quizzes grade"]) && (
                            <Table.Th>Aksi</Table.Th>
                        )}
                    </tr>
                </Table.Thead>
                <Table.Tbody>
                    {attempts.length > 0 ? (
                        attempts.map((att, i) => {
                            const st = attemptRowStatus(att);
                            return (
                                <tr key={att.id}>
                                    <Table.Td>{i + 1}</Table.Td>
                                    {!isStudent && (
                                        <Table.Td>
                                            {att.student?.name ?? "—"}
                                        </Table.Td>
                                    )}
                                    <Table.Td>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                                                st === "completed"
                                                    ? "bg-emerald-50 text-emerald-900 ring-emerald-200/80"
                                                    : "bg-amber-50 text-amber-900 ring-amber-200/80"
                                            }`}
                                        >
                                            {st === "completed"
                                                ? "Selesai"
                                                : "Berlangsung"}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="text-sm">
                                        {att.started_at
                                            ? formatStudentDateTime(
                                                  att.started_at
                                              )
                                            : "—"}
                                    </Table.Td>
                                    <Table.Td className="text-sm">
                                        {att.finished_at
                                            ? formatStudentDateTime(
                                                  att.finished_at
                                              )
                                            : "—"}
                                    </Table.Td>
                                    <Table.Td>
                                        {att.score != null
                                            ? `${att.score}%`
                                            : "—"}
                                    </Table.Td>
                                    <Table.Td>
                                        {att.passed === true ? (
                                            <span className="text-emerald-700">
                                                Ya
                                            </span>
                                        ) : att.passed === false ? (
                                            <span className="text-rose-700">
                                                Tidak
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </Table.Td>
                                    {!isStudent &&
                                        hasAnyPermission([
                                            "quizzes grade",
                                        ]) && (
                                            <Table.Td>
                                                {att.finished_at ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        <Button
                                                            type="view"
                                                            url={route(
                                                                "quizzes.attempt",
                                                                {
                                                                    quiz: quiz.id,
                                                                    attempt:
                                                                        att.id,
                                                                }
                                                            )}
                                                            text="Lihat"
                                                        />
                                                        {quizHasEssay ? (
                                                            <Link
                                                                href={route(
                                                                    "quizzes.manual-grade",
                                                                    {
                                                                        quiz: quiz.id,
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
                            );
                        })
                    ) : (
                        <tr>
                            <Table.Td
                                colSpan={
                                    !isStudent &&
                                    hasAnyPermission(["quizzes grade"])
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
        !isStudent && hasAnyPermission(["quizzes view_results"]) ? (
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
                    value={
                        attempts.filter((a) => a.finished_at).length
                    }
                    hint="Percobaan selesai"
                    accent="emerald"
                />
                <StudentStatCard
                    icon={IconClock}
                    label="Berlangsung"
                    value={
                        attempts.filter((a) => !a.finished_at).length
                    }
                    hint="Belum submit"
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
                        Edit jadwal, durasi, passing score, dan konfigurasi kuis.
                    </p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-emerald-700">
                        <IconListCheck size={15} />
                        Penilaian
                    </p>
                    <p className="mt-1 text-sm text-emerald-950">
                        Pantau hasil percobaan dan lakukan penilaian esai bila perlu.
                    </p>
                </div>
                <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-4">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase text-sky-700">
                        <IconCalendarTime size={15} />
                        Jadwal aktif
                    </p>
                    <p className="mt-1 text-sm text-sky-950">
                        Pastikan jendela mulai-selesai sesuai waktu kelas berlangsung.
                    </p>
                </div>
            </div>
        ) : null;

    const inner = (
        <>
            <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                <div
                    className={`rounded-xl border p-4 text-sm ${
                        window === "buka"
                            ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                            : window === "belum_mulai"
                              ? "border-sky-200 bg-sky-50/80 text-sky-950"
                              : window === "jadwal_tidak_lengkap"
                                ? "border-amber-200 bg-amber-50/85 text-amber-950"
                                : "border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                >
                    <p className="font-semibold">
                        {window === "buka" && "Jadwal pengerjaan sedang berlangsung"}
                        {window === "belum_mulai" &&
                            "Belum waktu pengerjaan (mengikuti jadwal)"}
                        {window === "berakhir" &&
                            "Waktu pengerjaan sudah berakhir"}
                        {window === "jadwal_tidak_lengkap" &&
                            "Jadwal mulai/selesai belum lengkap"}
                    </p>
                    <p className="mt-1 opacity-90">
                        Status kuis:{" "}
                        {quiz.is_active ? "aktif" : "nonaktif"}
                        {" · "}
                        {window === "buka" &&
                            "Siswa bisa mengerjakan pada rentang waktu ini"}
                        {window === "belum_mulai" &&
                            "Menunggu tanggal/jam mulai yang ditetapkan"}
                        {window === "berakhir" &&
                            "Tanggal/jam selesai sudah lewat"}
                        {window === "jadwal_tidak_lengkap" &&
                            "Atur tanggal mulai dan selesai di pengaturan kuis"}
                    </p>
                    {isStudent &&
                        window === "belum_mulai" &&
                        quiz.start_time &&
                        quiz.end_time && (
                            <p className="mt-3 border-t border-sky-200/80 pt-3 text-sm leading-relaxed text-sky-950/95">
                                <span className="font-semibold text-sky-950">
                                    Catatan:{" "}
                                </span>
                                Pesan ini soal{" "}
                                <strong>jadwal</strong>, bukan karena soal belum
                                disiapkan guru. Soal bisa disusun lebih dulu;
                                Anda baru bisa mulai mengerjakan setelah{" "}
                                <strong>
                                    {formatStudentDateTime(quiz.start_time)}
                                </strong>
                                {" "}
                                (sampai{" "}
                                <strong>
                                    {formatStudentDateTime(quiz.end_time)}
                                </strong>
                                ).
                            </p>
                        )}
                </div>
                {metaBlock}
                {quiz.description ? (
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Deskripsi
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                            {quiz.description}
                        </p>
                    </div>
                ) : null}
                {quiz.instructions ? (
                    <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <h3 className="text-sm font-semibold text-indigo-950">
                            Instruksi
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-indigo-950/90">
                            {quiz.instructions}
                        </p>
                    </div>
                ) : null}
            </div>

            {statsRow}

            {teacherActionPanel}

            {isStudent && quiz.is_active && (
                <div className="flex flex-wrap gap-3">
                    {(window === "buka" || unfinished) && (
                        <button
                            type="button"
                            onClick={startOrContinue}
                            className="inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25"
                        >
                            {unfinished
                                ? "Lanjutkan pengerjaan"
                                : "Mulai / kerjakan kuis"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => router.visit(route("student.quizzes"))}
                        className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Kembali ke daftar kuis
                    </button>
                </div>
            )}

            {!isStudent && (
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Aksi guru
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {hasAnyPermission(["quizzes edit"]) && (
                            <Button
                                type="edit"
                                url={route("quizzes.edit", quiz.id)}
                            />
                        )}
                        {hasAnyPermission(["quizzes delete"]) && (
                            <Button
                                type="delete"
                                url={route("quizzes.destroy", quiz.id)}
                            />
                        )}
                    </div>
                </div>
            )}

            {attemptsTable}

            {!isStudent && (
                <QuestionBank
                    mode="quiz"
                    entityId={quiz.id}
                    questions={quiz.questions ?? []}
                    canManage={hasAnyPermission(["quizzes edit"])}
                    entityLabel="kuis"
                />
            )}
        </>
    );

    return (
        <DashboardLayout title={`Detail Kuis: ${quiz.title}`}>
            <Head title={`Detail Kuis: ${quiz.title}`} />

            {isStudent ? (
                <StudentShell
                    eyebrow="Kuis"
                    title={quiz.title}
                    subtitle={`${quiz.subject?.name ?? "Mapel"} · ${sc?.name ?? "Kelas"}`}
                >
                    <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                            <IconBrain className="h-7 w-7" stroke={1.25} />
                        </span>
                        <div>
                            <p className="text-sm text-slate-600">
                                Dibuat untuk kelas Anda. Ketersediaan tombol
                                kerjakan mengikuti{" "}
                                <strong>jadwal buka–tutup</strong>, terpisah
                                dari kapan guru menyusun soal.
                            </p>
                        </div>
                    </div>
                    {inner}
                </StudentShell>
            ) : (
                <div className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
                        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
                            <h1 className="text-2xl font-bold text-slate-900">
                                {quiz.title}
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                {sc?.name ?? "—"} ·{" "}
                                {quiz.subject?.name ?? "—"}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 px-6 py-4 sm:grid-cols-3">
                            <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                    Total soal
                                </p>
                                <p className="mt-1 text-lg font-bold text-slate-900">
                                    {quiz.questions?.length ?? quiz.total_questions ?? 0}
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
