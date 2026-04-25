import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function Create() {
    const { subjects = [], classes = [], selectedClassId = null, selectedSubjectId = null } = usePage().props;

    const { data, setData, post, processing, errors, progress } = useForm({
        title: '',
        description: '',
        class_id: selectedClassId ?? '',
        subject_id: selectedSubjectId ?? '',
        material_type: 'pdf',
        file: null,
        video_url: '',
        is_active: true,
    });

    const [filePreview, setFilePreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('materials.store'));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('file', file);
            setFilePreview(file.name);
        }
    };

    const subjectOptions = subjects.map(subject => ({
        value: subject.id,
        label: subject.name
    }));

    const classOptions = classes.map(klass => ({
        value: klass.id,
        label: klass.name
    }));

    const materialTypeOptions = [
        { value: 'pdf', label: 'File PDF' },
        { value: 'video', label: 'Video' },
    ];

    return (
        <DashboardLayout title="Tambah Materi Pembelajaran">
            <Head title="Tambah Materi Pembelajaran" />

            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">Tambah Materi Pembelajaran</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Buat materi baru dengan struktur yang rapi agar mudah dipahami siswa.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <section className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Informasi Dasar
                            </p>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="title" value="Judul Materi" />
                                    <Input.Text
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Contoh: Sistem Pernapasan Manusia"
                                        required
                                    />
                                    <Input.Error message={errors.title} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="class_id" value="Kelas" />
                                    {selectedClassId ? (
                                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                            {classes.find((schoolClass) => schoolClass.id === selectedClassId)?.name || 'Kelas terpilih'}
                                        </div>
                                    ) : (
                                        <Select2
                                            id="class_id"
                                            options={classOptions}
                                            value={data.class_id ? classOptions.find(c => c.value === data.class_id) : null}
                                            onChange={(selected) => setData('class_id', selected ? selected.value : '')}
                                            placeholder="Pilih kelas"
                                        />
                                    )}
                                    <Input.Error message={errors.class_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="subject_id" value="Mata Pelajaran" />
                                    {selectedSubjectId ? (
                                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                                            {subjects.find((subject) => subject.id === selectedSubjectId)?.name || 'Mata pelajaran terpilih'}
                                        </div>
                                    ) : (
                                        <Select2
                                            id="subject_id"
                                            options={subjectOptions}
                                            value={data.subject_id ? subjectOptions.find(s => s.value === data.subject_id) : null}
                                            onChange={(selected) => setData('subject_id', selected ? selected.value : '')}
                                            placeholder="Pilih mata pelajaran"
                                        />
                                    )}
                                    <Input.Error message={errors.subject_id} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Konten Materi
                            </p>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                <div>
                                    <Input.Label htmlFor="material_type" value="Tipe Materi" />
                                    <Select2
                                        id="material_type"
                                        options={materialTypeOptions}
                                        value={materialTypeOptions.find(t => t.value === data.material_type)}
                                        onChange={(selected) => setData('material_type', selected ? selected.value : 'pdf')}
                                        placeholder="Pilih tipe materi"
                                    />
                                    <Input.Error message={errors.material_type} />
                                </div>
                            </div>

                            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-4">
                                {data.material_type === 'pdf' && (
                                    <div className="space-y-2">
                                        <Input.Label htmlFor="file" value="Upload File PDF" />
                                        <input
                                            id="file"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="block w-full rounded-md border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-[#163d8f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0f2e6f]"
                                            accept=".pdf"
                                            required
                                        />
                                        {filePreview && <p className="text-sm text-slate-600">File terpilih: {filePreview}</p>}
                                    </div>
                                )}

                                {data.material_type === 'video' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Input.Label htmlFor="file" value="Upload File Video (Opsional)" />
                                            <input
                                                id="file"
                                                type="file"
                                                onChange={handleFileChange}
                                                className="block w-full rounded-md border border-slate-300 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-[#163d8f] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#0f2e6f]"
                                                accept=".mp4,.avi,.mov,.wmv"
                                            />
                                            {filePreview && <p className="mt-2 text-sm text-slate-600">File terpilih: {filePreview}</p>}
                                        </div>
                                        <div className="text-center text-xs font-medium uppercase tracking-wide text-slate-400">atau</div>
                                        <div>
                                            <Input.Label htmlFor="video_url" value="URL Video (YouTube, Vimeo, dll)" />
                                            <Input.Text
                                                id="video_url"
                                                type="url"
                                                value={data.video_url || ''}
                                                onChange={(e) => setData('video_url', e.target.value)}
                                                placeholder="https://youtube.com/watch?v=..."
                                            />
                                        </div>
                                    </div>
                                )}
                                <Input.Error message={errors.file} />
                            </div>

                            <div>
                                <Input.Label htmlFor="description" value="Deskripsi (Opsional)" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border border-slate-300 shadow-sm focus:border-[#163d8f] focus:ring-[#163d8f]"
                                    placeholder="Tambahkan ringkasan materi untuk memudahkan siswa."
                                />
                                <Input.Error message={errors.description} />
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Pengaturan
                            </p>
                            <div>
                                <label className="inline-flex items-center">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="rounded border-slate-300 text-[#163d8f] shadow-sm focus:ring-[#163d8f]"
                                    />
                                    <span className="ml-2 text-sm text-slate-700">Publikasikan materi sekarang</span>
                                </label>
                                <Input.Error message={errors.is_active} />
                            </div>
                        </section>

                        {progress && (
                            <div className="rounded-md border border-blue-100 bg-blue-50/70 p-3">
                                <div className="h-2 overflow-hidden rounded-full bg-blue-100">
                                    <div
                                        className="h-2 rounded-full bg-[#163d8f] transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="mt-2 text-sm text-slate-600">Progres upload: {progress}%</p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button
                                type="cancel"
                                url={route('materials.index')}
                            />
                            <Button
                                type="submit"
                                processing={processing}
                                disabled={processing}
                            >
                                Upload Materi
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}