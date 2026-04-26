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
} from "@tabler/icons-react";
import QuestionBank from "@/Components/Lms/QuestionBank";

/** Status progres percobaan (termasuk esai menunggu guru). */
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
    const { quiz, attempts = [], canManageQuiz = false } = usePage().props;
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

    const metaItems = [
        { label: "Mapel", value: quiz.subject?.name ?? "—" },
        { label: "Kelas", value: sc?.name ?? "—" },
        {
            label: "Waktu pengerjaan",
            value: quiz.time_limit ? `${quiz.time_limit} menit` : "—",
        },
        {
            label: "Soal / lulus",
            value: `${quiz.questions?.length ?? quiz.total_questions ?? 0} soal · lulus ≥ ${quiz.passing_score ?? "—"}%`,
        },
        {
            label: "Periode pengerjaan",
            value: `${quiz.start_time ? formatStudentDateTime(quiz.start_time) : "—"} — ${
                quiz.end_time ? formatStudentDateTime(quiz.end_time) : "—"
            }`,
        },
        { label: "Percobaan maks.", value: quiz.max_attempts ?? "—" },
        { label: "Acak soal", value: quiz.is_randomized ? "Ya" : "Tidak" },
        { label: "Status kuis", value: quiz.is_active ? "Aktif" : "Nonaktif" },
    ];

    const metaBlock = (
        <div className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Informasi Kuis
                </p>
            </div>
            <dl className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-y-0 md:divide-x">
                {metaItems.map((item) => (
                    <div
                        key={item.label}
                        className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[130px,1fr] sm:items-start"
                    >
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {item.label}
                        </dt>
                        <dd className="text-sm font-medium leading-snug text-slate-900">{item.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );

    const attemptsTable = (
        <section id="percobaan-kuis">
            <Table.Card
                title={`Percobaan (${attempts.length})`}
                className="rounded-md border-slate-200 shadow-none"
            >
                <div className="max-h-[380px] overflow-auto">
                    <Table>
                        <Table.Thead className="sticky top-0 z-10 bg-slate-50/95">
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
                            const st = attemptProgressBadge(att);
                            return (
                                <tr key={att.id}>
                                    <Table.Td className="px-4 py-2.5">{i + 1}</Table.Td>
                                    {!isStudent && (
                                        <Table.Td className="px-4 py-2.5">
                                            {att.student?.name ?? "—"}
                                        </Table.Td>
                                    )}
                                    <Table.Td className="px-4 py-2.5">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${st.className}`}
                                        >
                                            {st.text}
                                        </span>
                                    </Table.Td>
                                    <Table.Td className="px-4 py-2.5 text-sm">
                                        {att.started_at
                                            ? formatStudentDateTime(
                                                  att.started_at
                                              )
                                            : "—"}
                                    </Table.Td>
                                    <Table.Td className="px-4 py-2.5 text-sm">
                                        {att.finished_at
                                            ? formatStudentDateTime(
                                                  att.finished_at
                                              )
                                            : "—"}
                                    </Table.Td>
                                    <Table.Td className="px-4 py-2.5">
                                        {att.attempt_status ===
                                        "menunggu_penilaian"
                                            ? "Menunggu"
                                            : att.score != null
                                              ? `${att.score}%`
                                              : "—"}
                                    </Table.Td>
                                    <Table.Td className="px-4 py-2.5">
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
                                            <Table.Td className="px-4 py-2.5">
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
                </div>
            </Table.Card>
        </section>
    );

    const statsRow =
        !isStudent && hasAnyPermission(["quizzes view_results"]) ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

    const inner = (
        <>
            <section id="ringkasan-kuis" className="rounded-md border border-slate-200 bg-white p-4 md:p-5">
                <div
                    className={`rounded-md border p-4 text-sm ${
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
                <div className="mt-4">{metaBlock}</div>
                {quiz.description ? (
                    <div className="mt-5 border-t border-slate-100 pt-5">
                        <h3 className="text-sm font-semibold text-slate-900">
                            Deskripsi
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                            {quiz.description}
                        </p>
                    </div>
                ) : null}
                {quiz.instructions ? (
                    <div className="mt-5 rounded-md border border-indigo-100 bg-indigo-50/50 p-4">
                        <h3 className="text-sm font-semibold text-indigo-950">
                            Instruksi
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-indigo-950/90">
                            {quiz.instructions}
                        </p>
                    </div>
                ) : null}
            </section>

            {statsRow}

            {isStudent && quiz.is_active && (
                <div className="flex flex-wrap gap-3">
                    {(window === "buka" || unfinished) && (
                        <button
                            type="button"
                            onClick={startOrContinue}
                            className="inline-flex items-center rounded-md bg-[#163d8f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f2e6f]"
                        >
                            {unfinished
                                ? "Lanjutkan pengerjaan"
                                : "Mulai / kerjakan kuis"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => router.visit(route("student.quizzes"))}
                        className="inline-flex rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Kembali ke daftar kuis
                    </button>
                </div>
            )}

            {attemptsTable}

            {!isStudent && (
                <section id="kelola-soal" className="scroll-mt-24">
                    <QuestionBank
                        mode="quiz"
                        entityId={quiz.id}
                        questions={quiz.questions ?? []}
                        canManage={canManageQuiz && hasAnyPermission(["quizzes edit"])}
                        entityLabel="kuis"
                    />
                </section>
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
                    <div className="flex items-start gap-3 rounded-md border border-indigo-100 bg-white p-4">
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
                <div className="mx-auto max-w-6xl space-y-4">
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                        <div className="px-5 py-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Detail kuis
                                    </p>
                                    <h1 className="mt-1 text-xl font-semibold text-slate-900">
                                        {quiz.title}
                                    </h1>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {sc?.name ?? "—"} ·{" "}
                                        {quiz.subject?.name ?? "—"}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                        href={route("quizzes.index")}
                                        className="inline-flex items-center rounded-md bg-[#163d8f] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0f2e6f]"
                                    >
                                        Kembali ke daftar kuis
                                    </Link>
                                    {canManageQuiz &&
                                        hasAnyPermission(["quizzes edit"]) && (
                                            <Button
                                                type="edit"
                                                url={route("quizzes.edit", quiz.id)}
                                            />
                                        )}
                                    {canManageQuiz &&
                                        hasAnyPermission(["quizzes delete"]) && (
                                            <Button
                                                type="delete"
                                                url={route(
                                                    "quizzes.destroy",
                                                    quiz.id
                                                )}
                                            />
                                        )}
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-slate-200 bg-slate-50/60 px-5 py-2.5" />
                    </div>
                    <div className="rounded-md border border-slate-200 bg-white px-4 py-2.5">
                        <div className="flex flex-wrap gap-2">
                            <a
                                href="#ringkasan-kuis"
                                className="rounded-md bg-[#163d8f] px-3 py-1.5 text-xs font-semibold text-white"
                            >
                                Ringkasan
                            </a>
                            <a
                                href="#percobaan-kuis"
                                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Percobaan
                            </a>
                            <a
                                href="#kelola-soal"
                                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Kelola Soal
                            </a>
                        </div>
                    </div>
                    {inner}
                </div>
            )}
        </DashboardLayout>
    );
}
