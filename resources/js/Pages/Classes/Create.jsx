import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Select2 from '@/Components/Select2';
import Swal from 'sweetalert2';
import { formatUserOptionLabel } from '@/Utils/userDisplay';

export default function Create() {
    const { subjects = [], students = [], teachers = [] } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        name: '',
        subject_ids: [],
        student_ids: [],
        academic_year: '',
        description: '',
        is_active: true,
        teacher_id: '',
    });

    const formattedSubjects = subjects.map(subject => ({
        value: subject.id,
        label: subject.name
    }));

    const formattedStudents = students.map(student => ({
        value: student.id,
        label: formatUserOptionLabel(student),
    }));

    const formattedTeachers = teachers.map(teacher => ({
        value: teacher.id,
        label: formatUserOptionLabel(teacher),
    }));

    const handleStoreData = async (e) => {
        e.preventDefault();

        post(route('classes.store'), {
            onSuccess: () => {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Kelas berhasil dibuat!',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        });
    };

    return (
        <DashboardLayout title="Buat Kelas Baru">
            <Head title={'Buat Kelas'} />
            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">Buat Kelas Baru</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Buat kelas baru dan atur siswa, mapel, serta wali kelas.
                        </p>
                    </div>

                    <form onSubmit={handleStoreData} className="space-y-6 p-6">
                        <section className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Informasi Utama
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Input.Label htmlFor="name" value="Nama Kelas" />
                                    <Input.Text
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Contoh: Matematika VII-A"
                                        required
                                    />
                                    <Input.Error message={errors.name} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="academic_year" value="Tahun Ajaran" />
                                    <Input.Text
                                        id="academic_year"
                                        value={data.academic_year}
                                        onChange={e => setData('academic_year', e.target.value)}
                                        placeholder="Contoh: 2024/2025"
                                        required
                                    />
                                    <Input.Error message={errors.academic_year} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Pengaturan Kelas
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {formattedTeachers.length > 0 && (
                                    <div>
                                        <Input.Label htmlFor="teacher_id" value="Wali kelas / Guru penanggung jawab" />
                                        <Select2
                                            id="teacher_id"
                                            isMulti={false}
                                            value={formattedTeachers.find(option => option.value === data.teacher_id) ?? null}
                                            onChange={(selected) => setData('teacher_id', selected ? selected.value : '')}
                                            options={formattedTeachers}
                                            placeholder="Pilih guru..."
                                        />
                                        <Input.Error message={errors.teacher_id} />
                                    </div>
                                )}

                                <div>
                                    <Input.Label htmlFor="subject_ids" value="Mata Pelajaran" />
                                    <Select2
                                        id="subject_ids"
                                        isMulti={true}
                                        value={formattedSubjects.filter(option => data.subject_ids.includes(option.value))}
                                        onChange={(selected) => setData('subject_ids', selected ? selected.map(option => option.value) : [])}
                                        options={formattedSubjects}
                                        placeholder="Pilih mata pelajaran..."
                                    />
                                    <Input.Error message={errors.subject_ids} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="student_ids" value="Siswa" />
                                    <Select2
                                        id="student_ids"
                                        isMulti={true}
                                        isSearchable={true}
                                        value={formattedStudents.filter(option => data.student_ids.includes(option.value))}
                                        onChange={(selected) => setData('student_ids', selected ? selected.map(option => option.value) : [])}
                                        options={formattedStudents}
                                        placeholder="Cari dan pilih siswa..."
                                    />
                                    <Input.Error message={errors.student_ids} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="description" value="Deskripsi (Opsional)" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#163d8f] focus:ring-[#163d8f]"
                                        rows="4"
                                        placeholder="Deskripsi kelas (opsional)"
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="is_active" value="Status" />
                                    <div className="mt-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                id="is_active"
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={e => setData('is_active', e.target.checked)}
                                                className="rounded border-slate-300 text-[#163d8f] shadow-sm focus:ring-[#163d8f]"
                                            />
                                            <span className="ml-2 text-sm text-slate-600">Kelas aktif</span>
                                        </label>
                                        <Input.Error message={errors.is_active} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button
                                type={'cancel'}
                                url={route('classes.index')}
                            />
                            <Button
                                type={'submit'}
                                processing={processing}
                                disabled={processing}
                            >
                                Simpan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}