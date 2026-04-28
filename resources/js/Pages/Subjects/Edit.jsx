import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function Edit() {
    const { subject, teachers } = usePage().props;

    // Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const classSubjectId = urlParams.get('class_subject_id');

    const { data, setData, put, processing, errors } = useForm({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        teacher_id: subject.teacher_id || null,
        is_active: subject.is_active || false,
    });

    const selectedTeacher = data.teacher_id
        ? teachers.find((teacher) => teacher.id === data.teacher_id)
        : null;

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('subjects.update', subject.id));
    };

    // Build cancel URL with class context if available
    const cancelUrl = classSubjectId
        ? `${route('subjects.show', subject.id)}?class_subject_id=${classSubjectId}`
        : route('subjects.show', subject.id);

    return (
        <DashboardLayout title="Edit Mata Pelajaran">
            <Head title="Edit Mata Pelajaran" />

            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Edit Mata Pelajaran: {subject.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Perbarui informasi mata pelajaran sesuai kebutuhan.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        <section className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Informasi Utama
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Input.Label htmlFor="name" value="Nama Mata Pelajaran" />
                                    <Input.Text
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama mata pelajaran"
                                        required
                                    />
                                    <Input.Error message={errors.name} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="code" value="Kode Mata Pelajaran (Opsional)" />
                                    <Input.Text
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="MTK, IPA, IPS, dll."
                                    />
                                    <Input.Error message={errors.code} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Pengaturan
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input.Label value="Guru Pengampu (Opsional)" />
                                    <Select2
                                        name="teacher_id"
                                        isClearable={true}
                                        isSearchable={true}
                                        options={teachers.map(teacher => ({
                                            value: teacher.id,
                                            label: `${teacher.name} (${teacher.email})`
                                        }))}
                                        value={selectedTeacher ? {
                                            value: selectedTeacher.id,
                                            label: `${selectedTeacher.name} (${selectedTeacher.email})`
                                        } : null}
                                        onChange={(selected) => setData('teacher_id', selected ? selected.value : null)}
                                        placeholder="Pilih guru pengampu..."
                                    />
                                    <Input.Error message={errors.teacher_id} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="description" value="Deskripsi (Opsional)" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#163d8f] focus:ring-[#163d8f]"
                                        placeholder="Masukkan deskripsi mata pelajaran"
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="is_active" value="Status" />
                                    <div className="mt-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-slate-300 text-[#163d8f] shadow-sm focus:ring-[#163d8f]"
                                            />
                                            <span className="ml-2 text-sm text-slate-600">Aktif</span>
                                        </label>
                                    </div>
                                    <Input.Error message={errors.is_active} />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button
                                type="cancel"
                                url={cancelUrl}
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
            </div>
        </DashboardLayout>
    );
}