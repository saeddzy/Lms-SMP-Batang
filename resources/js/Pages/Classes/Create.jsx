import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import Input from '@/Components/Input';
import Button from '@/Components/Button';
import Card from '@/Components/Card';
import Select2 from '@/Components/Select2';
import Swal from 'sweetalert2';

export default function Create() {
    const { subjects = [], students = [], teachers = [] } = usePage().props;

    const { data, setData, post, errors } = useForm({
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
        label: student.email ? `${student.name} (${student.email})` : student.name
    }));

    const formattedTeachers = teachers.map(teacher => ({
        value: teacher.id,
        label: teacher.email ? `${teacher.name} (${teacher.email})` : teacher.name
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
            <Card title={'Buat kelas baru'}>
                <form onSubmit={handleStoreData}>
                    <div className='mb-4'>
                        <Input
                            label={'Nama Kelas'}
                            type={'text'}
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            errors={errors.name}
                            placeholder="Contoh: Matematika VII-A"
                        />
                    </div>

                    {formattedTeachers.length > 0 && (
                        <div className='mb-4'>
                            <div className='flex items-center gap-2 text-sm text-gray-700 mb-2'>
                                Wali kelas / Guru penanggung jawab
                            </div>
                            <Select2
                                isMulti={false}
                                value={formattedTeachers.find(option => option.value === data.teacher_id) ?? null}
                                onChange={(selected) => setData('teacher_id', selected ? selected.value : '')}
                                options={formattedTeachers}
                                placeholder="Pilih guru..."
                            />
                            {errors.teacher_id && <div className='text-xs text-red-500 mt-1'>{errors.teacher_id}</div>}
                        </div>
                    )}

                    <div className='mb-4'>
                        <div className='flex items-center gap-2 text-sm text-gray-700 mb-2'>
                            Mata Pelajaran
                        </div>
                        <Select2
                            isMulti={true}
                            value={formattedSubjects.filter(option => data.subject_ids.includes(option.value))}
                            onChange={(selected) => setData('subject_ids', selected ? selected.map(option => option.value) : [])}
                            options={formattedSubjects}
                            placeholder="Pilih mata pelajaran..."
                        />
                        {errors.subject_ids && <div className='text-xs text-red-500 mt-1'>{errors.subject_ids}</div>}
                    </div>

                    <div className='mb-4'>
                        <div className='flex items-center gap-2 text-sm text-gray-700 mb-2'>
                            Siswa
                        </div>
                        <Select2
                            isMulti={true}
                            isSearchable={true}
                            value={formattedStudents.filter(option => data.student_ids.includes(option.value))}
                            onChange={(selected) => setData('student_ids', selected ? selected.map(option => option.value) : [])}
                            options={formattedStudents}
                            placeholder="Cari dan pilih siswa..."
                        />
                        {errors.student_ids && <div className='text-xs text-red-500 mt-1'>{errors.student_ids}</div>}
                    </div>

                    <div className='mb-4'>
                        <Input
                            label={'Tahun Ajaran'}
                            type={'text'}
                            value={data.academic_year}
                            onChange={e => setData('academic_year', e.target.value)}
                            errors={errors.academic_year}
                            placeholder="Contoh: 2024/2025"
                        />
                    </div>

                    <div className='mb-4'>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows="4"
                            placeholder="Deskripsi kelas (opsional)"
                        />
                        {errors.description && <div className='text-xs text-red-500 mt-1'>{errors.description}</div>}
                    </div>

                    <div className='mb-4'>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Kelas aktif</span>
                        </label>
                        {errors.is_active && <div className='text-xs text-red-500 mt-1'>{errors.is_active}</div>}
                    </div>

                    <div className='flex gap-2'>
                        <Button type={'submit'} />
                        <Button
                            type={'cancel'}
                            url={route('classes.index')}
                        />
                    </div>
                </form>
            </Card>
        </DashboardLayout>
    );
}