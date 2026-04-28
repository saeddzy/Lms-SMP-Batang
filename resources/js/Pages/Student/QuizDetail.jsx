import React, { useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import StudentShell, { formatStudentDateTime } from "@/Components/Student/StudentShell";
import Table from "@/Components/Table";
import { Head, router, usePage } from "@inertiajs/react";
import {
    IconBrain,
    IconClock,
    IconCalendarEvent,
    IconFileText,
    IconTargetArrow,
    IconInfoCircle,
    IconPlayerPlay,
    IconEye,
    IconAlertTriangle,
    IconUsers,
} from "@tabler/icons-react";

function attemptProgressBadge(att) {
    if (!att.finished_at) {
        return {
            text: "Berlangsung",
            className: "bg-amber-50 text-amber-900 ring-amber-200/80",
        };
    }
    if (att.attempt_status === "menunggu_penilaian" || att.essay_grading_pending) {
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

function quizWindowLabel(quiz) {
    const st = quiz.start_time ? new Date(quiz.start_time) : null;
    const en = quiz.end_time ? new Date(quiz.end_time) : null;
    if (!st || !en) return "jadwal_tidak_lengkap";
    const now = new Date();
    if (now < st) return "belum_mulai";
    if (now > en) return "berakhir";
    return "buka";
}

export default function QuizDetail() {
    const { quiz, attempts = [] } = usePage().props;
    const sc = quiz.school_class ?? quiz.schoolClass;
    const window = quizWindowLabel(quiz);

    const unfinished = useMemo(() => attempts.find((a) => !a.finished_at), [attempts]);
    const completedAttempts = attempts.filter((a) => a.finished_at);

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
        {
            label: "Mapel",
            value: quiz.subject?.name ?? "Belum ada mapel",
            icon: IconBrain,
        },
        {
            label: "Kelas",
            value: sc?.name ?? "Belum ada kelas",
            icon: IconUsers,
        },
        {
            label: "Waktu pengerjaan",
            value: quiz.time_limit ? `${quiz.time_limit} menit` : "Belum diatur",
            icon: IconClock,
        },
        {
            label: "Soal / lulus",
            value: `${quiz.questions?.length ?? quiz.total_questions ?? 0} soal · target ${quiz.passing_score ?? 0}%`,
            icon: IconTargetArrow,
        },
        {
            label: "Periode pengerjaan",
            value: `${quiz.start_time ? formatStudentDateTime(quiz.start_time) : "Belum diatur"} — ${
                quiz.end_time ? formatStudentDateTime(quiz.end_time) : "Belum diatur"
            }`,
            icon: IconCalendarEvent,
        },
        {
            label: "Percobaan maks.",
            value: quiz.max_attempts ?? "Belum diatur",
            icon: IconFileText,
        },
    ];

    return (
        <DashboardLayout title={`Detail Kuis: ${quiz.title}`}>
            <Head title={`Detail Kuis: ${quiz.title}`} />
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
                            Dibuat untuk kelas Anda. Ketersediaan tombol kerjakan mengikuti{" "}
                            <strong>jadwal buka-tutup</strong>, terpisah dari kapan guru menyusun soal.
                        </p>
                    </div>
                </div>

                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                    <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="line-clamp-1 text-2xl font-bold tracking-tight text-slate-900">
                                    {quiz.title}
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    {quiz.subject?.name ?? "Mapel belum diatur"} ·{" "}
                                    {sc?.name ?? "Kelas belum diatur"}
                                </p>
                            </div>
                            <span
                                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ${
                                    window === "buka"
                                        ? "bg-emerald-50 text-emerald-900 ring-emerald-200/80"
                                        : window === "belum_mulai"
                                          ? "bg-amber-50 text-amber-900 ring-amber-200/80"
                                          : "bg-rose-50 text-rose-900 ring-rose-200/80"
                                }`}
                            >
                                {window === "buka"
                                    ? "Aktif"
                                    : window === "belum_mulai"
                                      ? "Akan Datang"
                                      : "Berakhir"}
                            </span>
                        </div>
                    </div>

                    <div
                        className={`rounded-xl border p-4 text-sm shadow-sm ${
                            window === "buka"
                                ? "border-emerald-200 bg-emerald-50/80 text-emerald-950"
                                : window === "belum_mulai"
                                  ? "border-amber-200 bg-amber-50/85 text-amber-950"
                                  : window === "jadwal_tidak_lengkap"
                                    ? "border-amber-200 bg-amber-50/85 text-amber-950"
                                    : "border-rose-200 bg-rose-50 text-rose-900"
                        }`}
                    >
                        <p className="inline-flex items-center gap-2 font-semibold">
                            <IconAlertTriangle className="h-4 w-4" />
                            {window === "buka" && "Jadwal pengerjaan sedang berlangsung"}
                            {window === "belum_mulai" && "Kuis belum dimulai sesuai jadwal"}
                            {window === "berakhir" && "Waktu pengerjaan kuis sudah berakhir"}
                            {window === "jadwal_tidak_lengkap" && "Jadwal mulai/selesai belum lengkap"}
                        </p>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Informasi Kuis
                        </p>
                        <dl className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {metaItems.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-lg border border-slate-100 bg-slate-50/70 p-3"
                                >
                                    <dt className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <item.icon className="h-3.5 w-3.5" />
                                        {item.label}
                                    </dt>
                                    <dd className="mt-1 text-sm font-medium leading-snug text-slate-900">
                                        {item.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

                        <section className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
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

                {quiz.is_active && (
                    <div className="flex flex-wrap gap-3">
                        {(window === "buka" || unfinished) && (
                            <button
                                type="button"
                                onClick={startOrContinue}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#163d8f] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f2e6f]"
                            >
                                <IconPlayerPlay className="h-4 w-4" />
                                {unfinished ? "Lanjutkan pengerjaan" : "Mulai / kerjakan kuis"}
                            </button>
                        )}
                        {completedAttempts.length > 0 && (
                            <button
                                type="button"
                                onClick={() => router.visit(route("student.quizzes"))}
                                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
                            >
                                <IconEye className="h-4 w-4" />
                                Lihat Hasil
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => router.visit(route("student.quizzes"))}
                            className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                        >
                            Kembali ke daftar kuis
                        </button>
                    </div>
                )}

                <Table.Card
                    title={`Percobaan (${attempts.length})`}
                    className="rounded-md border-slate-200 shadow-none"
                >
                    <div className="max-h-[380px] overflow-auto">
                        <Table>
                            <Table.Thead className="sticky top-0 z-10 bg-slate-50/95">
                                <tr>
                                    <Table.Th>#</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Mulai</Table.Th>
                                    <Table.Th>Selesai</Table.Th>
                                    <Table.Th>Nilai</Table.Th>
                                    <Table.Th>Lulus</Table.Th>
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
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${st.className}`}
                                                    >
                                                        {st.text}
                                                    </span>
                                                </Table.Td>
                                                <Table.Td className="px-4 py-2.5 text-sm">
                                                    {att.started_at
                                                        ? formatStudentDateTime(att.started_at)
                                                        : "-"}
                                                </Table.Td>
                                                <Table.Td className="px-4 py-2.5 text-sm">
                                                    {att.finished_at
                                                        ? formatStudentDateTime(att.finished_at)
                                                        : "-"}
                                                </Table.Td>
                                                <Table.Td className="px-4 py-2.5">
                                                    {att.attempt_status === "menunggu_penilaian"
                                                        ? "Menunggu"
                                                        : att.score != null
                                                          ? `${att.score}%`
                                                          : "-"}
                                                </Table.Td>
                                                <Table.Td className="px-4 py-2.5">
                                                    {att.passed === true ? (
                                                        <span className="text-emerald-700">Ya</span>
                                                    ) : att.passed === false ? (
                                                        <span className="text-rose-700">Tidak</span>
                                                    ) : (
                                                        "-"
                                                    )}
                                                </Table.Td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <Table.Td colSpan={6} className="py-10 text-center text-slate-500">
                                            Belum ada percobaan.
                                        </Table.Td>
                                    </tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                </Table.Card>
            </StudentShell>
        </DashboardLayout>
    );
}
