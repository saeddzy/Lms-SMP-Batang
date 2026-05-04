import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";
import { formatUserOptionLabel } from "@/Utils/userDisplay";

export default function Edit() {
    const { schoolClass, subjects, students, teachers } = usePage().props;
    const [classSubjectTeachers, setClassSubjectTeachers] = useState({});

    const { data, setData, put, processing, errors } = useForm({
        name: schoolClass.name || '',
        subject_ids: schoolClass.subjects ? schoolClass.subjects.map(subject => subject.id) : [],
        student_ids: schoolClass.students ? schoolClass.students.map(student => student.id) : [],
        academic_year: schoolClass.academic_year || '',
        description: schoolClass.description || '',
        is_active: schoolClass.is_active || false,
    });

    // Initialize class subject teachers mapping
    React.useEffect(() => {
        const mapping = {};
        if (schoolClass.class_subjects) {
            schoolClass.class_subjects.forEach(cs => {
                mapping[cs.id] = cs.teacher_id || '';
            });
        }
        setClassSubjectTeachers(mapping);
    }, [schoolClass]);

    const handleClassSubjectTeacherChange = (classSubjectId, teacherId) => {
        setClassSubjectTeachers(prev => ({
            ...prev,
            [classSubjectId]: teacherId
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Merge teacher assignments with form data
        const dataToSubmit = {
            ...data,
            ...Object.entries(classSubjectTeachers).reduce((acc, [id, teacherId]) => {
                acc[`class_subject_teacher_${id}`] = teacherId;
                return acc;
            }, {})
        };
        
        put(route('classes.update', schoolClass.id), dataToSubmit);
    };

    const subjectOptions = subjects.map(subject => ({
        value: subject.id,
        label: subject.name
    }));

    const studentOptions = students.map(student => ({
        value: student.id,
        label: formatUserOptionLabel(student),
    }));

    return (
        <DashboardLayout title="Edit Kelas">
            <Head title="Edit Kelas" />

            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Edit Kelas: {schoolClass.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Perbarui informasi kelas sesuai kebutuhan.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama kelas"
                                        required
                                    />
                                    <Input.Error message={errors.name} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="academic_year" value="Tahun Ajaran" />
                                    <Input.Text
                                        id="academic_year"
                                        value={data.academic_year}
                                        onChange={(e) => setData('academic_year', e.target.value)}
                                        placeholder="2024/2025"
                                        required
                                    />
                                    <Input.Error message={errors.academic_year} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="subject_ids" value="Mata Pelajaran" />
                                    <Select2
                                        isMulti={true}
                                        value={subjectOptions.filter(option => data.subject_ids.includes(option.value))}
                                        onChange={(selected) => setData('subject_ids', selected ? selected.map(option => option.value) : [])}
                                        options={subjectOptions}
                                        placeholder="Pilih mata pelajaran"
                                        required
                                    />
                                    <Input.Error message={errors.subject_ids} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="student_ids" value="Siswa" />
                                    <Select2
                                        isMulti={true}
                                        isSearchable={true}
                                        value={studentOptions.filter(option => data.student_ids.includes(option.value))}
                                        onChange={(selected) => setData('student_ids', selected ? selected.map(option => option.value) : [])}
                                        options={studentOptions}
                                        placeholder="Cari dan pilih siswa untuk kelas ini"
                                    />
                                    <Input.Error message={errors.student_ids} />
                                </div>

                                <div>
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

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Deskripsi
                            </p>
                            <div>
                                <Input.Label htmlFor="description" value="Deskripsi (Opsional)" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-[#163d8f] focus:ring-[#163d8f]"
                                    placeholder="Masukkan deskripsi kelas"
                                />
                                <Input.Error message={errors.description} />
                            </div>
                        </section>

                        {schoolClass.class_subjects && schoolClass.class_subjects.length > 0 && (
                                <section className="space-y-4 border-t border-slate-100 pt-6">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Penugasan Guru per Mata Pelajaran
                                    </p>
                                    <div className="space-y-4">
                                        {schoolClass.class_subjects.map((classSubject) => (
                                            <div key={classSubject.id} className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-slate-700">
                                                            {classSubject.subject?.name || 'Mata Pelajaran'}
                                                        </label>
                                                    </div>
                                                    <div className="flex-1">
                                                        <Select2
                                                            options={teachers.map(t => ({ value: t.id, label: t.name }))}
                                                            value={teachers.find(t => t.id === classSubjectTeachers[classSubject.id]) 
                                                                ? { value: classSubjectTeachers[classSubject.id], label: teachers.find(t => t.id === classSubjectTeachers[classSubject.id])?.name }
                                                                : null
                                                            }
                                                            onChange={(selected) => handleClassSubjectTeacherChange(classSubject.id, selected?.value || null)}
                                                            placeholder="Pilih guru"
                                                            isClearable={true}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button
                                type="cancel"
                                url={route('classes.show', schoolClass.id)}
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