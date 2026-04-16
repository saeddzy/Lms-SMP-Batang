import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Table from "@/Components/Table";
import Button from "@/Components/Button";
import { Head, Link, router, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

export default function Show() {
    const {
        schoolClass,
        showTeacherOnlySubjects,
        stats = {},
        promotionTargets = [],
        canPromoteStudents = false,
    } = usePage().props;

    const [targetClassId, setTargetClassId] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    const toggleStudent = (id) => {
        setSelectedStudentIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const postPromote = (promoteAll) => {
        if (!targetClassId) {
            alert("Pilih kelas tujuan terlebih dahulu.");
            return;
        }
        if (!promoteAll && selectedStudentIds.length === 0) {
            alert("Pilih minimal satu siswa, atau gunakan “Naikkan semua”.");
            return;
        }
        router.post(route("classes.promote-students", schoolClass.id), {
            target_class_id: targetClassId,
            student_ids: promoteAll ? [] : selectedStudentIds,
            promote_all: promoteAll,
        });
    };

    return (
        <DashboardLayout title={`Detail Kelas: ${schoolClass.name}`}>
            <Head title={`Detail Kelas: ${schoolClass.name}`} />

            <div className="space-y-6">
                {/* Class Information Card */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {schoolClass.name}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {hasAnyPermission(["classes edit"]) && (
                                    <Button
                                        type={"edit"}
                                        url={route("classes.edit", schoolClass.id)}
                                        text="Kelola Kelas"
                                    />
                                )}
                                {hasAnyPermission(["classes delete"]) && (
                                    <Button
                                        type={"delete"}
                                        url={route("classes.destroy", schoolClass.id)}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Jumlah Mata Pelajaran
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {schoolClass.class_subjects?.length || 0}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Tahun Ajaran
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {schoolClass.academic_year}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Kapasitas
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {schoolClass.capacity || '-'} siswa
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Status
                                </label>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm mt-1 ${
                                    schoolClass.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {schoolClass.is_active ? 'Aktif' : 'Tidak Aktif'}
                                </span>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Deskripsi
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {schoolClass.description || 'Tidak ada deskripsi'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Jumlah Siswa
                                </label>
                                <p className="mt-1 text-sm text-gray-900">
                                    {schoolClass.student_count ??
                                        schoolClass.enrollments?.length ??
                                        schoolClass.students?.length ??
                                        0}{" "}
                                    siswa
                                </p>
                            </div>
                        </div>
                        {showTeacherOnlySubjects && (
                            <div className="mt-4 text-sm text-blue-600">
                                Menampilkan hanya mata pelajaran yang Anda ampu di kelas ini.
                            </div>
                        )}
                    </div>
                </div>

                {/* Subjects Cards */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Daftar Mata Pelajaran ({schoolClass.class_subjects?.length || 0})
                    </h3>
                    {schoolClass.class_subjects && schoolClass.class_subjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {schoolClass.class_subjects.map((classSubject) => (
                                <Link
                                    key={classSubject.id}
                                    href={`${route("subjects.show", classSubject.subject.id)}?class_subject_id=${classSubject.id}`}
                                    className="block bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {classSubject.subject?.name || '-'}
                                                </h4>
                                                {classSubject.subject?.code && (
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        Kode: {classSubject.subject.code}
                                                    </p>
                                                )}
                                                    <div className="space-y-2">
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-700">Guru pengampu:</span>
                                                        <p className="text-sm text-gray-900">
                                                            {classSubject.teacher?.name || 'Belum ditentukan'}
                                                        </p>
                                                        {classSubject.teacher?.email && (
                                                            <p className="text-xs text-gray-500">
                                                                {classSubject.teacher.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-4 ${
                                                classSubject.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {classSubject.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-8 text-center">
                                <div className="text-gray-500">
                                    Belum ada mata pelajaran yang ditambahkan ke kelas ini
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {canPromoteStudents && promotionTargets.length > 0 && (
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50/80 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Naik / pindah kelas
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Pindahkan siswa ke kelas tujuan. Data tugas, kuis, dan nilai di
                            kelas ini tetap tersimpan; siswa tidak lagi mengakses pembelajaran
                            kelas ini.
                        </p>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                            <div className="min-w-[200px]">
                                <label className="block text-xs font-medium text-gray-700">
                                    Kelas tujuan
                                </label>
                                <select
                                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    value={targetClassId}
                                    onChange={(e) => setTargetClassId(e.target.value)}
                                >
                                    <option value="">— Pilih kelas —</option>
                                    {promotionTargets.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.academic_year})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="button"
                                onClick={() => postPromote(false)}
                                disabled={!targetClassId}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Pindahkan terpilih
                            </button>
                            <button
                                type="button"
                                onClick={() => postPromote(true)}
                                disabled={!targetClassId}
                                className="rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-800 shadow-sm hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Naikkan semua siswa
                            </button>
                        </div>
                    </div>
                )}

                {/* Students List */}
                <Table.Card title={`Daftar Siswa (${schoolClass.enrollments?.length ?? schoolClass.student_count ?? schoolClass.students?.length ?? 0})`}>
                    <Table>
                        <Table.Thead>
                            <tr>
                                {canPromoteStudents && promotionTargets.length > 0 && (
                                    <Table.Th className="w-10">Pilih</Table.Th>
                                )}
                                <Table.Th>#</Table.Th>
                                <Table.Th>Nama Siswa</Table.Th>
                                <Table.Th>Email</Table.Th>
                                <Table.Th>Tanggal Bergabung</Table.Th>
                                {hasAnyPermission(["classes manage_students"]) && (
                                    <Table.Th>Aksi</Table.Th>
                                )}
                            </tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {schoolClass.enrollments && schoolClass.enrollments.length > 0 ? (
                                schoolClass.enrollments.map((enrollment, i) => (
                                    <tr key={enrollment.id ?? i}>
                                        {canPromoteStudents && promotionTargets.length > 0 && (
                                            <Table.Td>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selectedStudentIds.includes(
                                                        enrollment.student?.id
                                                    )}
                                                    onChange={() =>
                                                        toggleStudent(enrollment.student?.id)
                                                    }
                                                    disabled={!enrollment.student?.id}
                                                />
                                            </Table.Td>
                                        )}
                                        <Table.Td>{i + 1}</Table.Td>
                                        <Table.Td>{enrollment.student?.name ?? "—"}</Table.Td>
                                        <Table.Td>{enrollment.student?.email ?? "—"}</Table.Td>
                                        <Table.Td>
                                            {enrollment.enrolled_at
                                                ? new Date(enrollment.enrolled_at).toLocaleDateString("id-ID")
                                                : "—"}
                                        </Table.Td>
                                        {hasAnyPermission(["classes manage_students"]) && (
                                            <Table.Td>
                                                <Button
                                                    type={"delete"}
                                                    url={route("classes.remove-student", [
                                                        schoolClass.id,
                                                        enrollment.student?.id,
                                                    ])}
                                                    confirmMessage="Apakah Anda yakin ingin menghapus siswa ini dari kelas?"
                                                />
                                            </Table.Td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <Table.Td
                                        colSpan={
                                            (canPromoteStudents && promotionTargets.length > 0 ? 1 : 0) +
                                            4 +
                                            (hasAnyPermission(["classes manage_students"]) ? 1 : 0)
                                        }
                                        className="text-center py-8"
                                    >
                                        <div className="text-gray-500">
                                            Belum ada siswa yang terdaftar di kelas ini
                                        </div>
                                        {hasAnyPermission(["classes manage_students"]) && (
                                            <div className="mt-2">
                                                <Button
                                                    type={"add"}
                                                    url={route("classes.edit", schoolClass.id)}
                                                    text="Tambah Siswa"
                                                />
                                            </div>
                                        )}
                                    </Table.Td>
                                </tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.Card>

                {/* Class Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Materi</h3>
                                    <p className="text-sm text-gray-500">Materi pembelajaran yang tersedia</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {stats.materials_count ?? 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Tugas</h3>
                                    <p className="text-sm text-gray-500">Tugas yang diberikan</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {stats.tasks_count ?? 0}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">Nilai rata-rata</h3>
                                    <p className="text-sm text-gray-500">Rata-rata nilai akhir (semua mapel)</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {stats.grades_average != null
                                            ? `${stats.grades_average}%`
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}