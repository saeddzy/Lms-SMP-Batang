import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Table from "@/Components/Table";
import Button from "@/Components/Button";
import { Head, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

export default function Show() {
    const { grade } = usePage().props;

    const getGradeColor = (score) => {
        if (score >= 90) return 'bg-green-100 text-green-700';
        if (score >= 80) return 'bg-blue-100 text-blue-700';
        if (score >= 70) return 'bg-yellow-100 text-yellow-700';
        if (score >= 60) return 'bg-orange-100 text-orange-700';
        return 'bg-red-100 text-red-700';
    };

    const getGradeLetter = (score) => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'E';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-700';
            case 'published':
                return 'bg-green-100 text-green-700';
            case 'archived':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'draft':
                return 'Draft';
            case 'published':
                return 'Dipublikasikan';
            case 'archived':
                return 'Diarsipkan';
            default:
                return status;
        }
    };

    const getAssessmentTypeLabel = (type) => {
        switch (type) {
            case 'task':
                return 'Tugas';
            case 'quiz':
                return 'Kuis';
            case 'exam':
                return 'Ujian';
            default:
                return type;
        }
    };

    const isPassing = grade.score >= 60;

    return (
        <DashboardLayout title={`Detail Nilai: ${grade.student?.name || 'Siswa'}`}>
            <Head title={`Detail Nilai: ${grade.student?.name || 'Siswa'}`} />

            <div className="space-y-6">
                {/* Grade Information Card */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="text-4xl mr-4">
                                    {grade.score >= 90 ? '🏆' :
                                     grade.score >= 80 ? '🎯' :
                                     grade.score >= 70 ? '👍' :
                                     grade.score >= 60 ? '✅' : '❌'}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {grade.student?.name || 'Nama Siswa'}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        NIS: {grade.student?.nis || '-'} • {grade.class?.name || 'Kelas'} • {grade.subject?.name || 'Mata Pelajaran'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {hasAnyPermission(["grades edit"]) && (
                                    <Button
                                        type={"edit"}
                                        url={route("grades.edit", grade.id)}
                                    />
                                )}
                                {hasAnyPermission(["grades delete"]) && (
                                    <Button
                                        type={"delete"}
                                        url={route("grades.destroy", grade.id)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-gray-900 mb-2">
                                    {grade.score}%
                                </div>
                                <div className="text-lg text-gray-600">Nilai Angka</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-6xl font-bold mb-2 ${getGradeColor(grade.score)}`}>
                                    {getGradeLetter(grade.score)}
                                </div>
                                <div className="text-lg text-gray-600">Grade Huruf</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-4xl font-bold mb-2 ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                                    {isPassing ? 'LULUS' : 'TIDAK LULUS'}
                                </div>
                                <div className="text-lg text-gray-600">Status</div>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tipe Penilaian
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {getAssessmentTypeLabel(grade.assessment_type)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Nama Penilaian
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {grade.assessment?.title || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm mt-1 ${getStatusColor(grade.status)}`}>
                                    {getStatusLabel(grade.status)}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tanggal Input
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {new Date(grade.created_at).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                        </div>

                        {/* Feedback */}
                        {grade.feedback && (
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Feedback Guru
                                </label>
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="prose prose-sm max-w-none text-blue-900">
                                        {grade.feedback.split('\n').map((line, i) => (
                                            <p key={i} className="mb-2">{line}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grade Status */}
                        <div className="mt-6">
                            <div className={`p-4 rounded-lg ${
                                isPassing ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                            }`}>
                                <div className="flex items-center">
                                    <div className={`flex-shrink-0 ${
                                        isPassing ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {isPassing ? (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <h3 className={`text-sm font-medium ${
                                            isPassing ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                            {isPassing ? 'Nilai Memuaskan' : 'Nilai Perlu Ditingkatkan'}
                                        </h3>
                                        <p className={`text-sm ${
                                            isPassing ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                            {isPassing
                                                ? 'Selamat! Siswa telah mencapai standar kelulusan.'
                                                : 'Siswa perlu meningkatkan performa untuk mencapai standar kelulusan.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assessment Details */}
                {grade.assessment && (
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Detail Penilaian
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Judul
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {grade.assessment.title}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Deskripsi
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {grade.assessment.description || 'Tidak ada deskripsi'}
                                    </p>
                                </div>
                                {grade.assessment_type === 'task' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Deadline
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {grade.assessment.deadline ? new Date(grade.assessment.deadline).toLocaleString('id-ID') : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Prioritas
                                            </label>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                grade.assessment.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                grade.assessment.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {grade.assessment.priority === 'high' ? 'Tinggi' :
                                                 grade.assessment.priority === 'medium' ? 'Sedang' : 'Rendah'}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {grade.assessment_type === 'quiz' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Jumlah Soal
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {grade.assessment.total_questions || '-'} soal
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Durasi
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {grade.assessment.duration ? `${grade.assessment.duration} menit` : 'Tidak terbatas'}
                                            </p>
                                        </div>
                                    </>
                                )}
                                {grade.assessment_type === 'exam' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Jadwal Ujian
                                            </label>
                                            <p className="mt-1 text-sm text-gray-900">
                                                {new Date(grade.assessment.scheduled_date).toLocaleDateString('id-ID')}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {grade.assessment.start_time} - {grade.assessment.end_time}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">
                                                Tipe Ujian
                                            </label>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                grade.assessment.type === 'midterm' ? 'bg-blue-100 text-blue-700' :
                                                grade.assessment.type === 'final' ? 'bg-red-100 text-red-700' :
                                                grade.assessment.type === 'quiz' ? 'bg-green-100 text-green-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {grade.assessment.type === 'midterm' ? 'UTS' :
                                                 grade.assessment.type === 'final' ? 'UAS' :
                                                 grade.assessment.type === 'quiz' ? 'Kuis' : 'Latihan'}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Student Performance History */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Riwayat Performa Siswa
                        </h3>

                        <div className="text-sm text-gray-600 mb-4">
                            Statistik performa {grade.student?.name} di mata pelajaran {grade.subject?.name}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {grade.student?.grades?.filter(g => g.subject_id === grade.subject_id).length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Total Penilaian</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {grade.student?.grades?.filter(g => g.subject_id === grade.subject_id && g.score >= 90).length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Grade A</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">
                                    {grade.student?.grades?.filter(g => g.subject_id === grade.subject_id).length > 0
                                        ? Math.round(grade.student.grades.filter(g => g.subject_id === grade.subject_id).reduce((sum, g) => sum + g.score, 0) / grade.student.grades.filter(g => g.subject_id === grade.subject_id).length)
                                        : 0}%
                                </div>
                                <div className="text-sm text-gray-600">Rata-rata</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {grade.student?.grades?.filter(g => g.subject_id === grade.subject_id && g.score >= 60).length || 0}
                                </div>
                                <div className="text-sm text-gray-600">Lulus</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}