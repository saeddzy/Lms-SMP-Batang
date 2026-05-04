import React, { useEffect, useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function Create() {
    const {
        classes = [],
        subjects = [],
        classSubjectsMap = {},
        selectedClassId = null,
        selectedSubjectId = null,
    } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        class_id: selectedClassId ?? '',
        subject_id: selectedSubjectId ?? '',
        type: 'midterm',
        scheduled_date: '',
        start_time: '',
        end_time: '',
        duration: '',
        max_attempts: 1,
        passing_score: '',
        instructions: '',
        supervision_required: true,
        allow_review: false,
        randomize_questions: false,
        status: 'draft',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('exams.store'));
    };

    const classOptions = classes.map(cls => ({
        value: cls.id,
        label: cls.name
    }));

    const subjectOptions = useMemo(() => {
        const classId = Number(data.class_id);
        if (!classId) {
            return subjects.map((subject) => ({
                value: subject.id,
                label: subject.name,
            }));
        }

        const classSubjects = classSubjectsMap?.[classId] ?? classSubjectsMap?.[String(classId)] ?? [];
        return classSubjects.map((subject) => ({
            value: subject.id,
            label: subject.name,
        }));
    }, [data.class_id, subjects, classSubjectsMap]);

    useEffect(() => {
        if (!data.subject_id) return;

        const selectedSubjectStillValid = subjectOptions.some(
            (option) => String(option.value) === String(data.subject_id)
        );
        if (!selectedSubjectStillValid) {
            setData("subject_id", "");
        }
    }, [data.subject_id, setData, subjectOptions]);

    const typeOptions = [
        { value: 'midterm', label: 'Ujian Tengah Semester (UTS)' },
        { value: 'final', label: 'Ujian Akhir Semester (UAS)' },
        { value: 'quiz', label: 'Kuis' },
        { value: 'practice', label: 'Latihan' },
    ];

    const statusOptions = [
        { value: 'draft', label: 'Draft (Simpan sebagai draf)' },
        { value: 'scheduled', label: 'Terjadwal (Siap dilaksanakan)' },
    ];

    return (
        <DashboardLayout title="Buat Ujian Baru">
            <Head title="Buat Ujian Baru" />

            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">Buat Ujian Baru</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Buat ujian dengan jadwal pelaksanaan dan pengaturan penilaian.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <section className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Informasi Utama
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="title" value="Judul Ujian" />
                                    <Input.Text
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Masukkan judul ujian"
                                        required
                                    />
                                    <Input.Error message={errors.title} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Kelas dan Jadwal
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Input.Label htmlFor="class_id" value="Kelas" />
                                    {selectedClassId ? (
                                        <>
                                            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                                {classes.find((schoolClass) => schoolClass.id === selectedClassId)?.name || 'Kelas terpilih'}
                                            </div>
                                            <input type="hidden" name="class_id" value={selectedClassId} />
                                        </>
                                    ) : (
                                        <Select2
                                            id="class_id"
                                            value={classOptions.find(option => option.value === data.class_id)}
                                            onChange={(selected) => {
                                                setData('class_id', selected ? selected.value : '');
                                                setData('subject_id', '');
                                            }}
                                            options={classOptions}
                                            placeholder="Pilih kelas"
                                            required
                                        />
                                    )}
                                    <Input.Error message={errors.class_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="subject_id" value="Mata Pelajaran" />
                                    {selectedSubjectId ? (
                                        <>
                                            <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
                                                {subjects.find((subject) => subject.id === selectedSubjectId)?.name || 'Mata pelajaran terpilih'}
                                            </div>
                                            <input type="hidden" name="subject_id" value={selectedSubjectId} />
                                        </>
                                    ) : (
                                        <Select2
                                            id="subject_id"
                                            value={subjectOptions.find(option => option.value === data.subject_id)}
                                            onChange={(selected) => setData('subject_id', selected ? selected.value : '')}
                                            options={subjectOptions}
                                            placeholder={
                                                data.class_id
                                                    ? "Pilih mata pelajaran sesuai kelas"
                                                    : "Pilih kelas terlebih dahulu"
                                            }
                                            isDisabled={!data.class_id}
                                            required
                                        />
                                    )}
                                    <Input.Error message={errors.subject_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="type" value="Tipe Ujian" />
                                    <Select2
                                        id="type"
                                        value={typeOptions.find(option => option.value === data.type)}
                                        onChange={(selected) => setData('type', selected ? selected.value : '')}
                                        options={typeOptions}
                                        placeholder="Pilih tipe ujian"
                                    />
                                    <Input.Error message={errors.type} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="scheduled_date" value="Tanggal Ujian" />
                                    <Input.Date
                                        id="scheduled_date"
                                        value={data.scheduled_date}
                                        onChange={(e) => setData('scheduled_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                    <Input.Error message={errors.scheduled_date} />
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
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Struktur Penilaian
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Input.Label htmlFor="duration" value="Durasi (Menit)" />
                                    <Input.Number
                                        id="duration"
                                        value={data.duration}
                                        onChange={(e) => setData('duration', e.target.value)}
                                        placeholder="120"
                                        min="1"
                                    />
                                    <Input.Error message={errors.duration} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="max_attempts" value="Percobaan Maksimal" />
                                    <Input.Number
                                        id="max_attempts"
                                        value={data.max_attempts}
                                        onChange={(e) => setData('max_attempts', e.target.value)}
                                        placeholder="1"
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
                                        placeholder="70"
                                        min="0"
                                        max="100"
                                    />
                                    <Input.Error message={errors.passing_score} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Konten dan Publikasi
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="description" value="Deskripsi Ujian" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#163d8f] focus:ring-[#163d8f]"
                                        placeholder="Jelaskan tentang ujian ini"
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="instructions" value="Instruksi untuk Siswa" />
                                    <textarea
                                        id="instructions"
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#163d8f] focus:ring-[#163d8f]"
                                        placeholder="Instruksi khusus untuk mengikuti ujian"
                                        required
                                    />
                                    <Input.Error message={errors.instructions} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label value="Pengaturan Ujian" />
                                    <div className="mt-2 space-y-3">
                                        <div className="flex items-center space-x-6">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.supervision_required}
                                                    onChange={(e) => setData('supervision_required', e.target.checked)}
                                                    className="rounded border-slate-300 text-[#163d8f] shadow-sm focus:ring-[#163d8f]"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Pengawasan diperlukan</span>
                                            </label>

                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.allow_review}
                                                    onChange={(e) => setData('allow_review', e.target.checked)}
                                                    className="rounded border-slate-300 text-[#163d8f] shadow-sm focus:ring-[#163d8f]"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Izinkan review jawaban</span>
                                            </label>

                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.randomize_questions}
                                                    onChange={(e) => setData('randomize_questions', e.target.checked)}
                                                    className="rounded border-slate-300 text-[#163d8f] shadow-sm focus:ring-[#163d8f]"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Acak urutan soal</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="status" value="Status Ujian" />
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#163d8f]"
                                    >
                                        <option value="">Pilih status</option>
                                        {statusOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.status === 'draft' ? 'Ujian akan disimpan sebagai draf dan belum dapat diakses siswa' : 'Ujian akan terjadwal dan dapat diakses siswa sesuai jadwal'}
                                    </p>
                                    <Input.Error message={errors.status} />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button
                                type="cancel"
                                url={route('exams.index')}
                            />
                            <Button
                                type="submit"
                                processing={processing}
                                disabled={processing}
                            >
                                {data.status === 'scheduled' ? 'Jadwalkan Ujian' : 'Simpan sebagai Draft'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}