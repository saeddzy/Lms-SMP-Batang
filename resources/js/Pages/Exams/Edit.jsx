import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

export default function Edit() {
    const { exam, classes, subjects } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        title: exam.title || '',
        description: exam.description || '',
        class_id: exam.class_id || '',
        subject_id: exam.subject_id || '',
        type: exam.type || 'quiz',
        scheduled_date: exam.scheduled_date || '',
        start_time: exam.start_time || '',
        end_time: exam.end_time || '',
        duration: exam.duration || '',
        total_questions: exam.total_questions || '',
        passing_score: exam.passing_score || '',
        supervision_required: exam.supervision_required || false,
        allow_review: exam.allow_review || false,
        randomize_questions: exam.randomize_questions || false,
        randomize_answers: exam.randomize_answers || false,
        instructions: exam.instructions || '',
        status: exam.status || 'draft',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('exams.update', exam.id));
    };

    const examTypes = [
        { value: 'quiz', label: 'Kuis' },
        { value: 'midterm', label: 'UTS' },
        { value: 'final', label: 'UAS' },
        { value: 'practice', label: 'Latihan' },
    ];

    const examStatuses = [
        { value: 'draft', label: 'Draft' },
        { value: 'scheduled', label: 'Terjadwal' },
        { value: 'in_progress', label: 'Sedang Berlangsung' },
        { value: 'completed', label: 'Selesai' },
        { value: 'cancelled', label: 'Dibatalkan' },
    ];

    const classOptions = classes?.map(cls => ({
        value: cls.id,
        label: cls.name
    })) || [];

    const subjectOptions = subjects?.map(subject => ({
        value: subject.id,
        label: subject.name
    })) || [];

    return (
        <DashboardLayout title={`Edit Ujian: ${exam.title}`}>
            <Head title={`Edit Ujian: ${exam.title}`} />

            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Informasi Dasar
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Judul Ujian"
                                    value={data.title}
                                    onChange={(value) => setData('title', value)}
                                    error={errors.title}
                                    required
                                />

                                <Select2
                                    label="Tipe Ujian"
                                    value={data.type}
                                    onChange={(value) => setData('type', value)}
                                    options={examTypes}
                                    error={errors.type}
                                    required
                                />

                                <Select2
                                    label="Kelas"
                                    value={data.class_id}
                                    onChange={(value) => setData('class_id', value)}
                                    options={classOptions}
                                    error={errors.class_id}
                                    required
                                />

                                <Select2
                                    label="Mata Pelajaran"
                                    value={data.subject_id}
                                    onChange={(value) => setData('subject_id', value)}
                                    options={subjectOptions}
                                    error={errors.subject_id}
                                    required
                                />

                                <div className="md:col-span-2">
                                    <Input
                                        label="Deskripsi"
                                        type="textarea"
                                        value={data.description}
                                        onChange={(value) => setData('description', value)}
                                        error={errors.description}
                                        placeholder="Deskripsi singkat tentang ujian ini..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Scheduling */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Jadwal dan Waktu
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Tanggal Ujian"
                                    type="date"
                                    value={data.scheduled_date}
                                    onChange={(value) => setData('scheduled_date', value)}
                                    error={errors.scheduled_date}
                                    required
                                />

                                <Input
                                    label="Durasi (menit)"
                                    type="number"
                                    value={data.duration}
                                    onChange={(value) => setData('duration', value)}
                                    error={errors.duration}
                                    placeholder="Kosongkan jika tidak terbatas"
                                    min="1"
                                />

                                <Input
                                    label="Waktu Mulai"
                                    type="time"
                                    value={data.start_time}
                                    onChange={(value) => setData('start_time', value)}
                                    error={errors.start_time}
                                    required
                                />

                                <Input
                                    label="Waktu Selesai"
                                    type="time"
                                    value={data.end_time}
                                    onChange={(value) => setData('end_time', value)}
                                    error={errors.end_time}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Exam Settings */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Pengaturan Ujian
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Jumlah Soal"
                                    type="number"
                                    value={data.total_questions}
                                    onChange={(value) => setData('total_questions', value)}
                                    error={errors.total_questions}
                                    min="1"
                                />

                                <Input
                                    label="Nilai Kelulusan (%)"
                                    type="number"
                                    value={data.passing_score}
                                    onChange={(value) => setData('passing_score', value)}
                                    error={errors.passing_score}
                                    min="0"
                                    max="100"
                                />

                                <Select2
                                    label="Status"
                                    value={data.status}
                                    onChange={(value) => setData('status', value)}
                                    options={examStatuses}
                                    error={errors.status}
                                    required
                                />

                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            id="supervision_required"
                                            type="checkbox"
                                            checked={data.supervision_required}
                                            onChange={(e) => setData('supervision_required', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="supervision_required" className="ml-2 block text-sm text-gray-900">
                                            Pengawasan Diperlukan
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="allow_review"
                                            type="checkbox"
                                            checked={data.allow_review}
                                            onChange={(e) => setData('allow_review', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="allow_review" className="ml-2 block text-sm text-gray-900">
                                            Izinkan Review Jawaban
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="randomize_questions"
                                            type="checkbox"
                                            checked={data.randomize_questions}
                                            onChange={(e) => setData('randomize_questions', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="randomize_questions" className="ml-2 block text-sm text-gray-900">
                                            Acak Urutan Soal
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="randomize_answers"
                                            type="checkbox"
                                            checked={data.randomize_answers}
                                            onChange={(e) => setData('randomize_answers', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="randomize_answers" className="ml-2 block text-sm text-gray-900">
                                            Acak Urutan Jawaban
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Instruksi untuk Siswa
                            </h3>

                            <Input
                                label="Instruksi"
                                type="textarea"
                                value={data.instructions}
                                onChange={(value) => setData('instructions', value)}
                                error={errors.instructions}
                                placeholder="Instruksi khusus untuk siswa sebelum mengerjakan ujian..."
                                rows={6}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button
                            type="cancel"
                            url={route('exams.show', exam.id)}
                        />
                        <Button
                            type="submit"
                            processing={processing}
                            disabled={processing}
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}