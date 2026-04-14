import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

export default function Edit() {
    const { grade, classes, subjects, students, tasks, quizzes, exams } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        student_id: grade.student_id || '',
        class_id: grade.class_id || '',
        subject_id: grade.subject_id || '',
        assessment_type: grade.assessment_type || 'task',
        assessment_id: grade.assessment_id || '',
        score: grade.score || '',
        feedback: grade.feedback || '',
        status: grade.status || 'draft',
    });

    const [filteredStudents, setFilteredStudents] = useState([]);
    const [filteredAssessments, setFilteredAssessments] = useState([]);

    // Filter students based on selected class
    useEffect(() => {
        if (data.class_id) {
            const classStudents = students.filter(student =>
                student.classes?.some(cls => cls.id == data.class_id)
            );
            setFilteredStudents(classStudents);
        } else {
            setFilteredStudents([]);
        }
    }, [data.class_id, students]);

    // Filter assessments based on type and subject
    useEffect(() => {
        if (data.assessment_type && data.subject_id) {
            let assessments = [];
            switch (data.assessment_type) {
                case 'task':
                    assessments = tasks.filter(task => task.subject_id == data.subject_id);
                    break;
                case 'quiz':
                    assessments = quizzes.filter(quiz => quiz.subject_id == data.subject_id);
                    break;
                case 'exam':
                    assessments = exams.filter(exam => exam.subject_id == data.subject_id);
                    break;
            }
            setFilteredAssessments(assessments);
        } else {
            setFilteredAssessments([]);
        }
    }, [data.assessment_type, data.subject_id, tasks, quizzes, exams]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('grades.update', grade.id));
    };

    const assessmentTypes = [
        { value: 'task', label: 'Tugas' },
        { value: 'quiz', label: 'Kuis' },
        { value: 'exam', label: 'Ujian' },
    ];

    const statuses = [
        { value: 'draft', label: 'Draft' },
        { value: 'published', label: 'Dipublikasikan' },
        { value: 'archived', label: 'Diarsipkan' },
    ];

    const classOptions = classes?.map(cls => ({
        value: cls.id,
        label: cls.name
    })) || [];

    const subjectOptions = subjects?.map(subject => ({
        value: subject.id,
        label: subject.name
    })) || [];

    const studentOptions = filteredStudents.map(student => ({
        value: student.id,
        label: `${student.name} (${student.nis})`
    }));

    const assessmentOptions = filteredAssessments.map(assessment => ({
        value: assessment.id,
        label: assessment.title
    }));

    return (
        <DashboardLayout title={`Edit Nilai: ${grade.student?.name || 'Siswa'}`}>
            <Head title={`Edit Nilai: ${grade.student?.name || 'Siswa'}`} />

            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Assessment Information */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Informasi Penilaian
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select2
                                    label="Tipe Penilaian"
                                    value={data.assessment_type}
                                    onChange={(value) => setData('assessment_type', value)}
                                    options={assessmentTypes}
                                    error={errors.assessment_type}
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

                                <Select2
                                    label="Kelas"
                                    value={data.class_id}
                                    onChange={(value) => setData('class_id', value)}
                                    options={classOptions}
                                    error={errors.class_id}
                                    required
                                />

                                <Select2
                                    label="Nama Penilaian"
                                    value={data.assessment_id}
                                    onChange={(value) => setData('assessment_id', value)}
                                    options={assessmentOptions}
                                    error={errors.assessment_id}
                                    required
                                    disabled={!data.subject_id}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Informasi Siswa
                            </h3>

                            <Select2
                                label="Nama Siswa"
                                value={data.student_id}
                                onChange={(value) => setData('student_id', value)}
                                options={studentOptions}
                                error={errors.student_id}
                                required
                                disabled={!data.class_id}
                                placeholder={data.class_id ? "Pilih siswa..." : "Pilih kelas terlebih dahulu"}
                            />
                        </div>
                    </div>

                    {/* Grade Information */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Informasi Nilai
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Nilai (0-100)"
                                    type="number"
                                    value={data.score}
                                    onChange={(value) => setData('score', value)}
                                    error={errors.score}
                                    required
                                    min="0"
                                    max="100"
                                    placeholder="Masukkan nilai..."
                                />

                                <Select2
                                    label="Status"
                                    value={data.status}
                                    onChange={(value) => setData('status', value)}
                                    options={statuses}
                                    error={errors.status}
                                    required
                                />

                                <div className="md:col-span-2">
                                    <Input
                                        label="Feedback"
                                        type="textarea"
                                        value={data.feedback}
                                        onChange={(value) => setData('feedback', value)}
                                        error={errors.feedback}
                                        placeholder="Berikan feedback untuk siswa..."
                                        rows={4}
                                    />
                                </div>
                            </div>

                            {/* Grade Preview */}
                            {data.score && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Pratinjau Grade</h4>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-gray-900">{data.score}%</div>
                                            <div className="text-sm text-gray-500">Nilai</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${
                                                data.score >= 90 ? 'text-green-600' :
                                                data.score >= 80 ? 'text-blue-600' :
                                                data.score >= 70 ? 'text-yellow-600' :
                                                data.score >= 60 ? 'text-orange-600' :
                                                'text-red-600'
                                            }`}>
                                                {data.score >= 90 ? 'A' :
                                                 data.score >= 80 ? 'B' :
                                                 data.score >= 70 ? 'C' :
                                                 data.score >= 60 ? 'D' : 'E'}
                                            </div>
                                            <div className="text-sm text-gray-500">Grade</div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-2xl font-bold ${
                                                data.score >= 60 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {data.score >= 60 ? 'LULUS' : 'TIDAK LULUS'}
                                            </div>
                                            <div className="text-sm text-gray-500">Status</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Change History */}
                            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                                <h4 className="text-sm font-medium text-yellow-800 mb-2">Riwayat Perubahan</h4>
                                <div className="text-sm text-yellow-700">
                                    <p>Nilai awal: <strong>{grade.score}%</strong></p>
                                    <p>Terakhir diubah: {new Date(grade.updated_at).toLocaleString('id-ID')}</p>
                                    <p>Oleh: {grade.updater?.name || 'Sistem'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-4">
                        <Button
                            type="cancel"
                            url={route('grades.show', grade.id)}
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