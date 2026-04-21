import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Card from "@/Components/Card";
import { Head, router, usePage } from "@inertiajs/react";
import { IconCheck, IconX, IconClock, IconPercentage } from "@tabler/icons-react";

export default function ExamResult() {
    const { exam, attempt } = usePage().props;

    const getStatusBadge = (status) => {
        const badges = {
            finished: { color: 'green', text: 'Selesai', icon: IconCheck },
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

    const calculatePercentage = () => {
        if (!attempt.total_questions || attempt.total_questions === 0) return 0;
        return Math.round((attempt.total_correct / attempt.total_questions) * 100);
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
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
                                    {attempt.score || 0}%
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
                        {attempt.passed ? (
                            <div>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <IconCheck className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-green-600 mb-2">Selamat! Anda Lulus</h2>
                                <p className="text-slate-600">
                                    Anda telah lulus ujian dengan nilai {attempt.score}%.
                                </p>
                            </div>
                        ) : (
                            <div>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <IconX className="w-8 h-8 text-red-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-red-600 mb-2">Belum Lulus</h2>
                                <p className="text-slate-600">
                                    Anda belum lulus ujian. Nilai minimum untuk lulus adalah {exam.passing_marks || 70}%.
                                </p>
                            </div>
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
                        onClick={() => router.visit(route("student.exams"))}
                        className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        Kembali ke Daftar Ujian
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
                </div>
            </div>
        </DashboardLayout>
    );
}
