import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";

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
        max_attempts: exam.max_attempts || 1,
        passing_score: exam.passing_score || '',
        supervision_required: exam.supervision_required || false,
        allow_review: exam.allow_review || false,
        instructions: exam.instructions || '',
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
                                <div>
                                    <Input.Label htmlFor="title" value="Judul Ujian" />
                                    <Input.Text
                                        id="title"
                                    value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        required
                                    />
                                    <Input.Error message={errors.title} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="type" value="Tipe Ujian" />
                                    <Select2
                                        id="type"
                                        value={examTypes.find(option => option.value === data.type)}
                                        onChange={(selected) => setData('type', selected ? selected.value : '')}
                                        options={examTypes}
                                        placeholder="Pilih tipe ujian"
                                    />
                                    <Input.Error message={errors.type} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="class_id" value="Kelas" />
                                    <Select2
                                        id="class_id"
                                        value={classOptions.find(option => option.value === data.class_id)}
                                        onChange={(selected) => setData('class_id', selected ? selected.value : '')}
                                        options={classOptions}
                                        placeholder="Pilih kelas"
                                        required
                                    />
                                    <Input.Error message={errors.class_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="subject_id" value="Mata Pelajaran" />
                                    <Select2
                                        id="subject_id"
                                        value={subjectOptions.find(option => option.value === data.subject_id)}
                                        onChange={(selected) => setData('subject_id', selected ? selected.value : '')}
                                        options={subjectOptions}
                                        placeholder="Pilih mata pelajaran"
                                        required
                                    />
                                    <Input.Error message={errors.subject_id} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="description" value="Deskripsi" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="Deskripsi singkat tentang ujian ini..."
                                    />
                                    <Input.Error message={errors.description} />
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
                                <div>
                                    <Input.Label htmlFor="scheduled_date" value="Tanggal Ujian" />
                                    <Input.Date
                                        id="scheduled_date"
                                    value={data.scheduled_date}
                                        onChange={(e) => setData('scheduled_date', e.target.value)}
                                        required
                                    />
                                    <Input.Error message={errors.scheduled_date} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="duration" value="Durasi (menit)" />
                                    <Input.Number
                                        id="duration"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        min="1"
                                    />
                                    <Input.Error message={errors.duration} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="start_time" value="Waktu Mulai" />
                                    <Input.Time
                                        id="start_time"
                                        value={data.start_time}
                                        onChange={(e) => setData('start_time', e.target.value)}
                                        required
                                    />
                                    <Input.Error message={errors.start_time} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="end_time" value="Waktu Selesai" />
                                    <Input.Time
                                        id="end_time"
                                        value={data.end_time}
                                        onChange={(e) => setData('end_time', e.target.value)}
                                        required
                                    />
                                    <Input.Error message={errors.end_time} />
                                </div>
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
                                <div>
                                    <Input.Label htmlFor="max_attempts" value="Percobaan Maksimal" />
                                    <Input.Number
                                        id="max_attempts"
                                        value={data.max_attempts}
                                        onChange={(e) => setData('max_attempts', e.target.value)}
                                        min="1"
                                    />
                                    <Input.Error message={errors.max_attempts} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="passing_score" value="Nilai Kelulusan (%)" />
                                    <Input.Number
                                        id="passing_score"
                                        value={data.passing_score}
                                        onChange={(e) => setData('passing_score', e.target.value)}
                                        min="0"
                                        max="100"
                                    />
                                    <Input.Error message={errors.passing_score} />
                                </div>

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
                                            checked={false}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            disabled
                                        />
                                        <label htmlFor="randomize_questions" className="ml-2 block text-sm text-gray-900">
                                            Acak Urutan Soal (segera hadir)
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="randomize_answers"
                                            type="checkbox"
                                            checked={false}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            disabled
                                        />
                                        <label htmlFor="randomize_answers" className="ml-2 block text-sm text-gray-900">
                                            Acak Urutan Jawaban (segera hadir)
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

                            <Input.Label htmlFor="instructions" value="Instruksi" />
                            <textarea
                                id="instructions"
                                value={data.instructions}
                                onChange={(e) => setData('instructions', e.target.value)}
                                rows={6}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                placeholder="Instruksi khusus untuk siswa sebelum mengerjakan ujian..."
                            />
                            <Input.Error message={errors.instructions} />
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