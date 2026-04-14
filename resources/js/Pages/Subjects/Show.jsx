import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Table from "@/Components/Table";
import Button from "@/Components/Button";
import { Head, usePage, Link } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

export default function Show() {
    const { subject, classContext, classSubject } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Ringkasan', count: null },
        { id: 'materials', label: 'Materi', count: subject.materials?.length || 0 },
        { id: 'tasks', label: 'Tugas', count: subject.tasks?.length || 0 },
        { id: 'quizzes', label: 'Kuis', count: subject.quizzes?.length || 0 },
        { id: 'exams', label: 'Ujian', count: subject.exams?.length || 0 },
    ];

    const withClassContext = (url) => classSubject ? `${url}?class_subject_id=${classSubject.id}` : url;

    const actionButtons = {
        materials: { create: hasAnyPermission(["materials create"]), url: withClassContext(route("materials.create")) },
        tasks: { create: hasAnyPermission(["tasks create"]), url: withClassContext(route("tasks.create")) },
        quizzes: { create: hasAnyPermission(["quizzes create"]), url: withClassContext(route("quizzes.create")) },
        exams: { create: hasAnyPermission(["exams create"]), url: withClassContext(route("exams.create")) },
    };

    return (
        <DashboardLayout title={`Detail Mata Pelajaran: ${subject.name}`}>
            <Head title={`Detail Mata Pelajaran: ${subject.name}`} />

            <div className="space-y-6">
                {/* Subject Header Card */}
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {subject.name}
                                </h2>
                                <p className="mt-2 text-sm text-gray-600">
                                    {subject.description}
                                </p>
                                <div className="mt-4 flex gap-6 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Kode:</span>
                                        <span className="ml-2 text-gray-600">{subject.code}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Guru Pengampu:</span>
                                        <span className="ml-2 text-gray-600">
                                            {subject.teacher?.name || 'Belum ditentukan'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Status:</span>
                                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            subject.is_active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {subject.is_active ? 'Aktif' : 'Tidak Aktif'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                {hasAnyPermission(["subjects edit"]) && (
                                    <Button
                                        type={"edit"}
                                        url={route("subjects.edit", subject.id)}
                                    />
                                )}
                                {hasAnyPermission(["subjects delete"]) && (
                                    <Button
                                        type={"delete"}
                                        url={route("subjects.destroy", subject.id)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {classSubject && classContext && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-3 text-sm text-indigo-700">
                        Anda sedang melihat mata pelajaran <span className="font-semibold">{subject.name}</span> di kelas <span className="font-semibold">{classContext.name}</span>.
                        Semua penambahan materi, tugas, kuis, dan ujian akan otomatis terkait dengan kelas dan mata pelajaran ini.
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="bg-white shadow-sm sm:rounded-lg border-b border-gray-200">
                    <div className="flex flex-wrap gap-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.label}
                                    {tab.count !== null && (
                                        <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-semibold ${
                                            activeTab === tab.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content - Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Classes Section */}
                        <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Daftar Kelas ({subject.classes?.length || 0})
                                </h3>
                            </div>
                            <Table>
                                <Table.Thead>
                                    <tr>
                                        <Table.Th>#</Table.Th>
                                        <Table.Th>Nama Kelas</Table.Th>
                                        <Table.Th>Guru Pengajar</Table.Th>
                                        <Table.Th>Tahun Ajaran</Table.Th>
                                        <Table.Th>Jumlah Siswa</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        {hasAnyPermission(["classes view"]) && (
                                            <Table.Th>Aksi</Table.Th>
                                        )}
                                    </tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {subject.classes && subject.classes.length > 0 ? (
                                        subject.classes.map((schoolClass, i) => (
                                            <tr key={i}>
                                                <Table.Td>{i + 1}</Table.Td>
                                                <Table.Td>{schoolClass.name}</Table.Td>
                                                <Table.Td>{schoolClass.teacher?.name || '-'}</Table.Td>
                                                <Table.Td>{schoolClass.academic_year}</Table.Td>
                                                <Table.Td>{schoolClass.students?.length || 0}</Table.Td>
                                                <Table.Td>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        schoolClass.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {schoolClass.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </span>
                                                </Table.Td>
                                                {hasAnyPermission(["classes view"]) && (
                                                    <Table.Td>
                                                        <Button
                                                            type={"view"}
                                                            url={route("classes.show", schoolClass.id)}
                                                        />
                                                    </Table.Td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <Table.Td colSpan={hasAnyPermission(["classes view"]) ? 7 : 6} className="text-center py-8">
                                                <div className="text-gray-500">
                                                    Belum ada kelas yang menggunakan mata pelajaran ini
                                                </div>
                                            </Table.Td>
                                        </tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Materi</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{subject.materials?.length || 0}</p>
                                    </div>
                                    <div className="text-4xl text-blue-100">📚</div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Tugas</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{subject.tasks?.length || 0}</p>
                                    </div>
                                    <div className="text-4xl text-green-100">✓</div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Kuis</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{subject.quizzes?.length || 0}</p>
                                    </div>
                                    <div className="text-4xl text-yellow-100">❓</div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Total Ujian</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{subject.exams?.length || 0}</p>
                                    </div>
                                    <div className="text-4xl text-red-100">📋</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content - Materials */}
                {activeTab === 'materials' && (
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Materi ({subject.materials?.length || 0})
                            </h3>
                            {actionButtons.materials.create && (
                                <Link href={actionButtons.materials.url} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
                                    + Tambah Materi
                                </Link>
                            )}
                        </div>
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th>#</Table.Th>
                                    <Table.Th>Judul Materi</Table.Th>
                                    <Table.Th>Tipe</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    <Table.Th>Dibuat</Table.Th>
                                    {hasAnyPermission(["materials view"]) && (
                                        <Table.Th>Aksi</Table.Th>
                                    )}
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {subject.materials && subject.materials.length > 0 ? (
                                    subject.materials.map((material, i) => (
                                        <tr key={i}>
                                            <Table.Td>{i + 1}</Table.Td>
                                            <Table.Td>{material.title}</Table.Td>
                                            <Table.Td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    material.material_type === 'pdf' ? 'bg-red-100 text-red-700' :
                                                    material.material_type === 'video' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {material.material_type === 'pdf' ? 'PDF' :
                                                     material.material_type === 'video' ? 'Video' :
                                                     material.material_type}
                                                </span>
                                            </Table.Td>
                                            <Table.Td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    material.is_active
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {material.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </Table.Td>
                                            <Table.Td>
                                                {new Date(material.created_at).toLocaleDateString('id-ID')}
                                            </Table.Td>
                                            {hasAnyPermission(["materials view"]) && (
                                                <Table.Td>
                                                    <Button
                                                        type={"view"}
                                                        url={route("materials.show", material.id)}
                                                    />
                                                </Table.Td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <Table.Td colSpan={hasAnyPermission(["materials view"]) ? 6 : 5} className="text-center py-8">
                                            <div className="text-gray-500">
                                                Belum ada materi yang dibuat
                                            </div>
                                        </Table.Td>
                                    </tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                )}

                {/* Tab Content - Tasks */}
                {activeTab === 'tasks' && (
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Tugas ({subject.tasks?.length || 0})
                            </h3>
                            {actionButtons.tasks.create && (
                                <Link href={actionButtons.tasks.url} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
                                    + Tambah Tugas
                                </Link>
                            )}
                        </div>
                        <div className="p-6">
                            {subject.tasks && subject.tasks.length > 0 ? (
                                <div className="space-y-4">
                                    {subject.tasks.map((task, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                    <div className="mt-3 flex gap-4 text-xs text-gray-500">
                                                        <span>Due: {new Date(task.due_date).toLocaleDateString('id-ID')}</span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                                                            task.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {task.status === 'published' ? 'Dipublikasikan' : 'Draft'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {hasAnyPermission(["tasks view"]) && (
                                                    <Button
                                                        type={"view"}
                                                        url={route("tasks.show", task.id)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Belum ada tugas yang dibuat
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content - Quizzes */}
                {activeTab === 'quizzes' && (
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Kuis ({subject.quizzes?.length || 0})
                            </h3>
                            {actionButtons.quizzes.create && (
                                <Link href={actionButtons.quizzes.url} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
                                    + Tambah Kuis
                                </Link>
                            )}
                        </div>
                        <div className="p-6">
                            {subject.quizzes && subject.quizzes.length > 0 ? (
                                <div className="space-y-4">
                                    {subject.quizzes.map((quiz, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
                                                    <div className="mt-3 flex gap-4 text-xs text-gray-500">
                                                        <span>Durasi: {quiz.time_limit} menit</span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                                                            quiz.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {quiz.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {hasAnyPermission(["quizzes view"]) && (
                                                    <Button
                                                        type={"view"}
                                                        url={route("quizzes.show", quiz.id)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Belum ada kuis yang dibuat
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tab Content - Exams */}
                {activeTab === 'exams' && (
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Ujian ({subject.exams?.length || 0})
                            </h3>
                            {actionButtons.exams.create && (
                                <Link href={actionButtons.exams.url} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors">
                                    + Tambah Ujian
                                </Link>
                            )}
                        </div>
                        <div className="p-6">
                            {subject.exams && subject.exams.length > 0 ? (
                                <div className="space-y-4">
                                    {subject.exams.map((exam, i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                                                    <div className="mt-3 flex gap-4 text-xs text-gray-500">
                                                        <span>Tanggal: {new Date(exam.exam_date).toLocaleDateString('id-ID')}</span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                                                            exam.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                            {exam.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                        </span>
                                                    </div>
                                                </div>
                                                {hasAnyPermission(["exams view"]) && (
                                                    <Button
                                                        type={"view"}
                                                        url={route("exams.show", exam.id)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Belum ada ujian yang dibuat
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}