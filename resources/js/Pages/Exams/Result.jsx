import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Card from "@/Components/Card";
import { Head, router, usePage } from "@inertiajs/react";
import { IconCheck, IconX, IconClock, IconPercentage } from "@tabler/icons-react";

export default function ExamResult() {
    const { exam, attempt, isStudentView = true, canManualGrade = false } =
        usePage().props;

    const getStatusBadge = (status) => {
        const badges = {
            finished: { color: 'green', text: 'Selesai', icon: IconCheck },
            submitted: { color: 'blue', text: 'Menunggu Penilaian', icon: IconClock },
            timeout: { color: 'red', text: 'Waktu Habis', icon: IconX },
            in_progress: { color: 'blue', text: 'Sedang Berlangsung', icon: IconClock },
        };
        
        const badge = badges[status] || badges.finished;
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-${badge.color}-100 text-${badge.color}-800`}>
                <Icon className="w-3 h-3" />
                {badge.text}
            </span>
        );
    };

    const answers = Array.isArray(attempt?.answers) ? attempt.answers : [];
    const sortedAnswers = [...answers].sort((a, b) => {
        const orderA = Number(a?.question?.order ?? 0);
        const orderB = Number(b?.question?.order ?? 0);
        return orderA - orderB;
    });
    const hasEssayAnswers = sortedAnswers.some(
        (ans) => ans?.question?.question_type === "essay"
    );
    const isPendingManual =
        attempt?.attempt_status === "menunggu_penilaian" ||
        attempt?.passed == null;

    const formatStudentAnswer = (ans) => {
        const raw = typeof ans?.answer === "string" ? ans.answer.trim() : "";
        if (!raw) return "(kosong)";

        const type = ans?.question?.question_type;
        if (type === "multiple_choice") {
            const options = Array.isArray(ans?.question?.options)
                ? ans.question.options
                : [];
            const selectedIndex = Number(raw);
            if (Number.isInteger(selectedIndex) && options[selectedIndex] != null) {
                const optionLabel = String.fromCharCode(65 + selectedIndex);
                return `${optionLabel}. ${options[selectedIndex]}`;
            }
        }

        if (type === "true_false") {
            return raw === "true" ? "Benar" : raw === "false" ? "Salah" : raw;
        }

        return raw;
    };

    return (
        <DashboardLayout title="Hasil Ujian">
            <Head title="Hasil Ujian" />

            <div className="max-w-4xl mx-auto py-6">
                {/* Header */}
                <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">{exam.title}</h1>
                            <p className="text-sm text-slate-600 mt-1">
                                {exam.subject?.name} • {exam.school_class?.name}
                            </p>
                            {!isStudentView && (
                                <p className="text-sm text-slate-600 mt-1">
                                    Siswa:{" "}
                                    <span className="font-semibold text-slate-800">
                                        {attempt.student?.name ?? "—"}
                                    </span>
                                </p>
                            )}
                        </div>
                        {getStatusBadge(attempt.attempt_status)}
                    </div>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <Card.Content>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-900">
                                    {isPendingManual
                                        ? "Menunggu"
                                        : attempt.score != null
                                          ? `${attempt.score}%`
                                          : "—"}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">Nilai Akhir</div>
                            </div>
                        </Card.Content>
                    </Card>

                    <Card>
                        <Card.Content>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-900">
                                    {attempt.total_correct || 0}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">Jawaban Benar</div>
                            </div>
                        </Card.Content>
                    </Card>

                    <Card>
                        <Card.Content>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-slate-900">
                                    {attempt.total_questions || 0}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">Total Soal</div>
                            </div>
                        </Card.Content>
                    </Card>
                </div>

                {/* Result Status */}
                <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
                    <div className="text-center">
                        {attempt.passed === true ? (
                            <div>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <IconCheck className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-green-600 mb-2">Lulus</h2>
                                <p className="text-slate-600">
                                    Nilai akhir {attempt.score}% melewati ambang lulus.
                                </p>
                            </div>
                        ) : attempt.passed === false ? (
                            <div>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <IconX className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-red-600 mb-2">Belum Lulus</h2>
                                <p className="text-slate-600">
                                    Nilai minimum untuk lulus adalah {exam.passing_marks || 70}%.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
                                    <IconClock className="w-8 h-8 text-sky-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-sky-700 mb-2">Menunggu Penilaian</h2>
                                <p className="text-slate-600">
                                    Terdapat soal esai yang belum dinilai guru.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Answers */}
                <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Jawaban Siswa
                    </h2>
                    <div className="mt-4 space-y-4">
                        {sortedAnswers.length === 0 ? (
                            <p className="text-sm text-slate-500">Belum ada jawaban tersimpan.</p>
                        ) : (
                            sortedAnswers.map((ans, idx) => {
                                const isEssay = ans.question?.question_type === "essay";
                                return (
                                    <div
                                        key={ans.id}
                                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <p className="text-xs font-semibold uppercase text-slate-500">
                                            Soal {idx + 1} · {ans.question?.question_type ?? "-"}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-900">
                                            {ans.question?.question_text ?? "-"}
                                        </p>
                                        <div className="mt-3 rounded-md border border-slate-200 bg-white p-3">
                                            <p className="text-xs font-semibold text-slate-500">
                                                Jawaban siswa
                                            </p>
                                            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                                                {formatStudentAnswer(ans)}
                                            </p>
                                        </div>
                                        {isEssay ? (
                                            <div className="mt-2 space-y-1 text-xs text-slate-600">
                                                <p>
                                                    Nilai esai:{" "}
                                                    {ans.points_awarded != null
                                                        ? `${ans.points_awarded} / ${ans.question?.points ?? 0}`
                                                        : "Belum dinilai"}
                                                </p>
                                                {ans.teacher_feedback ? (
                                                    <p className="whitespace-pre-wrap rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-amber-900">
                                                        Feedback guru:{" "}
                                                        {ans.teacher_feedback}
                                                    </p>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <p className="mt-2 text-xs text-slate-600">
                                                Status:{" "}
                                                {ans.is_correct ? (
                                                    <span className="font-semibold text-emerald-700">
                                                        Benar
                                                    </span>
                                                ) : (
                                                    <span className="font-semibold text-rose-700">
                                                        Salah
                                                    </span>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                        <Card.Content>
                            <div className="flex items-center gap-3">
                                <IconClock className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-sm text-slate-600">Waktu Mulai</div>
                                    <div className="font-medium text-slate-900">
                                        {new Date(attempt.started_at).toLocaleString('id-ID')}
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>

                    <Card>
                        <Card.Content>
                            <div className="flex items-center gap-3">
                                <IconClock className="w-5 h-5 text-slate-400" />
                                <div>
                                    <div className="text-sm text-slate-600">Waktu Selesai</div>
                                    <div className="font-medium text-slate-900">
                                        {attempt.finished_at ? new Date(attempt.finished_at).toLocaleString('id-ID') : '-'}
                                    </div>
                                </div>
                            </div>
                        </Card.Content>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() =>
                            router.visit(
                                isStudentView
                                    ? route("student.exams")
                                    : route("exams.show", exam.id)
                            )
                        }
                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        {isStudentView
                            ? "Kembali ke Daftar Ujian"
                            : "Kembali ke Detail Ujian"}
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                        Kembali
                    </button>
                    
                    {attempt.attempt_status === 'finished' && (
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Cetak Hasil
                        </button>
                    )}
                    {canManualGrade && hasEssayAnswers && (
                        <button
                            onClick={() =>
                                router.visit(
                                    route("exams.manual-grade", {
                                        exam: exam.id,
                                        attempt: attempt.id,
                                    })
                                )
                            }
                            className="px-6 py-2 bg-amber-100 text-amber-900 rounded-lg hover:bg-amber-200 transition-colors"
                        >
                            Nilai / ubah esai
                        </button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
