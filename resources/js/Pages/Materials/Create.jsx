import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

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

            <div className="max-w-4xl mx-auto">
                <Card>
                    <Card.Header>
                        <Card.Title>Tambah Materi Pembelajaran Baru</Card.Title>
                        <Card.Description>
                            Upload materi pembelajaran untuk siswa
                        </Card.Description>
                    </Card.Header>

                    <form onSubmit={handleSubmit}>
                        <Card.Content>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="title" value="Judul Materi" />
                                    <Input.Text
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Masukkan judul materi"
                                        required
                                    />
                                    <Input.Error message={errors.title} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="class_id" value="Kelas" />
                                    {selectedClassId ? (
                                        <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
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
                                        <div className="px-3 py-2 bg-slate-50 rounded-md border border-slate-200">
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

                                <div className="md:col-span-2">
                                    {data.material_type === 'pdf' && (
                                        <>
                                            <Input.Label htmlFor="file" value="File PDF" />
                                            <input
                                                id="file"
                                                type="file"
                                                onChange={handleFileChange}
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                accept=".pdf"
                                                required
                                            />
                                            {filePreview && <p className="text-sm text-gray-600 mt-2">File: {filePreview}</p>}
                                        </>
                                    )}

                                    {data.material_type === 'video' && (
                                        <>
                                            <Input.Label htmlFor="file" value="File Video atau URL Video" />
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm text-gray-600">Upload File Video (MP4, AVI, MOV)</label>
                                                    <input
                                                        id="file"
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        accept=".mp4,.avi,.mov,.wmv"
                                                    />
                                                    {filePreview && <p className="text-sm text-gray-600 mt-2">File: {filePreview}</p>}
                                                </div>
                                                <div className="text-center text-sm text-gray-500">atau</div>
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
                                        </>
                                    )}
                                    <Input.Error message={errors.file} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="description" value="Deskripsi (Opsional)" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="Masukkan deskripsi materi"
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="is_active" value="Status" />
                                    <div className="mt-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                id="is_active"
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Aktif</span>
                                        </label>
                                    </div>
                                    <Input.Error message={errors.is_active} />
                                </div>
                            </div>

                            {/* Upload Progress */}
                            {progress && (
                                <div className="mt-6">
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">Upload progress: {progress}%</p>
                                </div>
                            )}
                        </Card.Content>

                        <Card.Footer>
                            <div className="flex justify-end gap-3">
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
                        </Card.Footer>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}