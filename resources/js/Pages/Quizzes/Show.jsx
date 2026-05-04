import React, { useMemo, useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { formatStudentDateTime } from "@/Components/Student/StudentShell";
import StudentStatCard from "@/Components/Student/StudentStatCard";
import Table from "@/Components/Table";
import Button from "@/Components/Button";
import { Head, Link, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";
import {
    IconUsers,
    IconCircleCheck,
    IconClock,
    IconPercentage,
    IconFileText,
    IconInfoCircle,
    IconAlertTriangle,
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

const TAB_HASH = {
    ringkasan: "ringkasan-kuis",
    percobaan: "percobaan-kuis",
    soal: "kelola-soal",
};

const HASH_TO_TAB = Object.fromEntries(
    Object.entries(TAB_HASH).map(([tab, id]) => [id, tab])
);

export default function Show() {
    const { quiz, attempts = [], canManageQuiz = false } = usePage().props;
    const sc = quiz.school_class ?? quiz.schoolClass;

    const [activeNav, setActiveNav] = useState("ringkasan");

    const selectTab = useCallback((key) => {
        if (!TAB_HASH[key]) return;
        setActiveNav(key);
        try {
            window.history.replaceState(
                null,
                "",
                `#${TAB_HASH[key]}`
            );
        } catch {
            /* ignore */
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    useEffect(() => {
        const hash = window.location.hash?.replace(/^#/, "");
        const tab = HASH_TO_TAB[hash];
        if (tab) setActiveNav(tab);
    }, []);

    const quizHasEssay = useMemo(
        () =>
            (quiz.questions ?? []).some(
                (q) => q.question_type === "essay"
            ),
        [quiz.questions]
    );

    const scheduleWindow = quizWindowLabel(quiz);

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

    const MetaGrid = () => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mata pelajaran
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.subject?.name ?? "—"}
                </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Kelas
                </p>
                <p className="mt-1 font-medium text-slate-900">{sc?.name ?? "—"}</p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Waktu pengerjaan
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.time_limit ? `${quiz.time_limit} menit` : "Belum diatur"}
                </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Percobaan maks.
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.max_attempts ?? "Belum diatur"}
                </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4 sm:col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Periode pengerjaan
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                    {quiz.start_time
                        ? formatStudentDateTime(quiz.start_time)
                        : "Belum diatur"}{" "}
                    —{" "}
                    {quiz.end_time
                        ? formatStudentDateTime(quiz.end_time)
                        : "Belum diatur"}
                </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Soal / target lulus
                </p>
                <p className="mt-1 font-medium text-slate-900">
                    {quiz.questions?.length ?? quiz.total_questions ?? 0} soal ·{" "}
                    {quiz.passing_score ?? 0}%
                </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status kuis
                </p>
                <span
                    className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                        quiz.is_active
                            ? "bg-emerald-50 text-emerald-900 ring-emerald-200/80"
                            : "bg-slate-100 text-slate-700 ring-slate-200/80"
                    }`}
                >
                    {quiz.is_active ? "Aktif" : "Tidak aktif"}
                </span>
            </div>
        </div>
    );

    const attemptsTable = (
        <section
            id="percobaan-kuis"
            role="tabpanel"
            aria-labelledby="tab-percobaan"
        >
            <Table.Card
                title={`Percobaan (${attempts.length})`}
                className="rounded-md border-slate-200 shadow-none"
            >
                <div className="max-h-[380px] overflow-auto">
                    <Table>
                        <Table.Thead className="sticky top-0 z-10 bg-slate-50/95">
                    <tr>
                        <Table.Th>#</Table.Th>
                        <Table.Th>Siswa</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Mulai</Table.Th>
                        <Table.Th>Selesai</Table.Th>
                        <Table.Th>Nilai</Table.Th>
                        <Table.Th>Lulus</Table.Th>
                        {hasAnyPermission(["quizzes grade"]) && (
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
                                    <Table.Td className="px-4 py-2.5">
                                        {att.student?.name ?? "—"}
                                    </Table.Td>
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
                                    {hasAnyPermission(["quizzes grade"]) && (
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
                                    hasAnyPermission(["quizzes grade"]) ? 8 : 7
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

    const statsRow = hasAnyPermission(["quizzes view_results"]) ? (
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

    const ringkasanPanel = (
        <div
            className="space-y-6"
            role="tabpanel"
            aria-labelledby="tab-ringkasan"
        >
            <section
                id="ringkasan-kuis"
                className="rounded-lg border border-slate-200 bg-white p-6"
            >
                <div
                    className={`rounded-md border p-4 text-sm ${
                        scheduleWindow === "buka"
                            ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                            : scheduleWindow === "belum_mulai"
                              ? "border-amber-200 bg-amber-50/85 text-amber-950"
                              : scheduleWindow === "jadwal_tidak_lengkap"
                                ? "border-amber-200 bg-amber-50/85 text-amber-950"
                              : "border-rose-200 bg-rose-50 text-rose-900"
                    }`}
                >
                    <p className="inline-flex items-center gap-2 font-semibold">
                        <IconAlertTriangle className="h-4 w-4" />
                        {scheduleWindow === "buka" && "Jadwal pengerjaan sedang berlangsung"}
                        {scheduleWindow === "belum_mulai" &&
                            "Kuis belum dimulai sesuai jadwal"}
                        {scheduleWindow === "berakhir" &&
                            "Waktu pengerjaan kuis sudah berakhir"}
                        {scheduleWindow === "jadwal_tidak_lengkap" &&
                            "Jadwal mulai/selesai belum lengkap"}
                    </p>
                    <p className="mt-1 opacity-90">
                        Status kuis:{" "}
                        {quiz.is_active ? "aktif" : "nonaktif"}
                        {" · "}
                        {scheduleWindow === "buka" &&
                            "Siswa bisa mengerjakan pada rentang waktu ini"}
                        {scheduleWindow === "belum_mulai" &&
                            "Menunggu tanggal/jam mulai yang ditetapkan"}
                        {scheduleWindow === "berakhir" &&
                            "Tanggal/jam selesai sudah lewat"}
                        {scheduleWindow === "jadwal_tidak_lengkap" &&
                            "Atur tanggal mulai dan selesai di pengaturan kuis"}
                    </p>
                </div>
                <div className="mt-6">
                    <MetaGrid />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <section className="rounded-lg border border-slate-200 bg-white p-4">
                        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                            <IconInfoCircle className="h-4 w-4" />
                            Deskripsi
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                            {quiz.description?.trim()
                                ? quiz.description
                                : "Belum ada deskripsi kuis dari guru."}
                        </p>
                    </section>

                    <section className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                        <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-950">
                            <IconFileText className="h-4 w-4" />
                            Instruksi
                        </h3>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-indigo-950/90">
                            {quiz.instructions?.trim()
                                ? quiz.instructions
                                : "Belum ada instruksi tambahan untuk kuis ini."}
                        </p>
                    </section>
                </div>
            </section>

            {statsRow}
        </div>
    );

    const kelolaSoalPanel = (
        <section
            id="kelola-soal"
            role="tabpanel"
            aria-labelledby="tab-kelola-soal"
        >
            <QuestionBank
                mode="quiz"
                entityId={quiz.id}
                questions={quiz.questions ?? []}
                canManage={canManageQuiz && hasAnyPermission(["quizzes edit"])}
                entityLabel="kuis"
            />
        </section>
    );

    return (
        <DashboardLayout title={`Detail Kuis: ${quiz.title}`}>
            <Head title={`Detail Kuis: ${quiz.title}`} />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Detail kuis
                                </p>
                                <h1 className="mt-1 text-2xl font-semibold text-slate-900">
                                    {quiz.title}
                                </h1>
                                <p className="mt-1 text-sm text-slate-600">
                                    {sc?.name ?? "—"} · {quiz.subject?.name ?? "—"}
                                </p>
                            </div>
                            <div className="flex w-full flex-col gap-4 sm:w-auto sm:min-w-[280px]">
                                <div className="flex flex-wrap gap-2">
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
                                                url={route("quizzes.destroy", quiz.id)}
                                            />
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-4 py-2.5">
                    <nav
                        className="flex flex-wrap gap-2"
                        aria-label="Bagian detail kuis"
                        role="tablist"
                    >
                        {(
                            [
                                ["ringkasan", "Ringkasan", "tab-ringkasan"],
                                ["percobaan", "Percobaan", "tab-percobaan"],
                                ["soal", "Kelola Soal", "tab-kelola-soal"],
                            ]
                        ).map(([key, label, tabId]) => (
                            <button
                                key={key}
                                id={tabId}
                                type="button"
                                role="tab"
                                aria-selected={activeNav === key}
                                aria-controls={
                                    key === "ringkasan"
                                        ? "ringkasan-kuis"
                                        : key === "percobaan"
                                          ? "percobaan-kuis"
                                          : "kelola-soal"
                                }
                                onClick={() => selectTab(key)}
                                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#163d8f]/40 ${
                                    activeNav === key
                                        ? "bg-[#163d8f] text-white shadow-sm"
                                        : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="space-y-6">
                    {activeNav === "ringkasan" && ringkasanPanel}
                    {activeNav === "percobaan" && attemptsTable}
                    {activeNav === "soal" && kelolaSoalPanel}
                </div>
            </div>
        </DashboardLayout>
    );
}
