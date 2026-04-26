import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Table from "@/Components/Table";
import Button from "@/Components/Button";
import { Head, usePage, Link, router } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

export default function Show() {
    const { subject, classContext, classSubject, stats = {}, canManageLearning = false } = usePage().props;
    const [activeTab, setActiveTab] = useState('overview');
    const canViewClasses = hasAnyPermission(["classes view"]);
    const canViewMaterials = hasAnyPermission(["materials view"]);
    const canViewTasks = hasAnyPermission(["tasks view"]);
    const canViewQuizzes = hasAnyPermission(["quizzes view"]);
    const canViewExams = hasAnyPermission(["exams view"]);

    const tabs = [
        { id: 'overview', label: 'Ringkasan', count: null },
        { id: 'materials', label: 'Materi', count: stats.materials_count ?? subject.materials?.length ?? 0 },
        { id: 'tasks', label: 'Tugas', count: stats.tasks_count ?? subject.tasks?.length ?? 0 },
        { id: 'quizzes', label: 'Kuis', count: stats.quizzes_count ?? subject.quizzes?.length ?? 0 },
        { id: 'exams', label: 'Ujian', count: stats.exams_count ?? subject.exams?.length ?? 0 },
    ];

    const withClassContext = (url) => classSubject ? `${url}?class_subject_id=${classSubject.id}` : url;

    const actionButtons = {
        materials: { create: canManageLearning && hasAnyPermission(["materials create"]), url: withClassContext(route("materials.create")) },
        tasks: { create: canManageLearning && hasAnyPermission(["tasks create"]), url: withClassContext(route("tasks.create")) },
        quizzes: { create: canManageLearning && hasAnyPermission(["quizzes create"]), url: withClassContext(route("quizzes.create")) },
        exams: { create: canManageLearning && hasAnyPermission(["exams create"]), url: withClassContext(route("exams.create")) },
    };

    return (
        <DashboardLayout title={`Detail Mata Pelajaran: ${subject.name}`}>
            <Head title={`Detail Mata Pelajaran: ${subject.name}`} />

            <div className="space-y-6">
                <Link
                    href={route("subjects.index")}
                    className="inline-flex items-center rounded-md border border-[#163d8f] bg-[#163d8f] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f2e6f]"
                >
                    Kembali ke Mata Pelajaran
                </Link>

                {/* Subject Header Card */}
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex-1">
                                <h2 className="text-3xl font-bold text-slate-900">
                                    {subject.name}
                                </h2>
                                <p className="mt-2 text-sm text-slate-600">
                                    {subject.description}
                                </p>
                                <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm md:grid-cols-3">
                                    <div>
                                        <span className="font-medium text-slate-700">Kode:</span>
                                        <span className="ml-2 text-slate-600">{subject.code}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Guru Pengampu:</span>
                                        <span className="ml-2 text-slate-600">
                                            {subject.teacher?.name || 'Belum ditentukan'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Status:</span>
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
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                        Anda sedang melihat mata pelajaran <span className="font-semibold">{subject.name}</span> di kelas <span className="font-semibold">{classContext.name}</span>.
                        Semua penambahan materi, tugas, kuis, dan ujian akan otomatis terkait dengan kelas dan mata pelajaran ini.
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50/60 px-4 py-3">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium ring-1 transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-[#163d8f] text-white ring-[#163d8f]'
                                        : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.label}
                                    {tab.count !== null && (
                                        <span className={`inline-flex items-center justify-center h-5 min-w-[20px] rounded-full px-1 text-xs font-semibold ${
                                            activeTab === tab.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-100 text-slate-700'
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
                                    Daftar Kelas ({subject.class_subjects?.length ?? 0})
                                </h3>
                            </div>
                            <Table>
                                <Table.Thead>
                                    <tr>
                                        <Table.Th>#</Table.Th>
                                        <Table.Th>Nama Kelas</Table.Th>
                                        <Table.Th>Wali Kelas</Table.Th>
                                        <Table.Th>Tahun Ajaran</Table.Th>
                                        <Table.Th>Jumlah Siswa</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        {canViewClasses && (
                                            <Table.Th>Aksi</Table.Th>
                                        )}
                                    </tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {subject.class_subjects && subject.class_subjects.length > 0 ? (
                                        subject.class_subjects.map((cs, i) => {
                                            const schoolClass = cs.school_class ?? cs.schoolClass;
                                            return (
                                            <tr
                                                key={cs.id}
                                                role="button"
                                                tabIndex={0}
                                                className="cursor-pointer transition-colors hover:bg-slate-50/80"
                                                onClick={() => {
                                                    if (schoolClass?.id) {
                                                        router.visit(route("classes.show", schoolClass.id));
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if ((e.key === "Enter" || e.key === " ") && schoolClass?.id) {
                                                        e.preventDefault();
                                                        router.visit(route("classes.show", schoolClass.id));
                                                    }
                                                }}
                                            >
                                                <Table.Td>{i + 1}</Table.Td>
                                                <Table.Td>{schoolClass?.name ?? "—"}</Table.Td>
                                                <Table.Td>{schoolClass?.teacher?.name ?? "—"}</Table.Td>
                                                <Table.Td>{schoolClass?.academic_year ?? "—"}</Table.Td>
                                                <Table.Td>{schoolClass?.students_count ?? 0}</Table.Td>
                                                <Table.Td>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        schoolClass?.is_active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {schoolClass?.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                    </span>
                                                </Table.Td>
                                                {canViewClasses && schoolClass?.id && (
                                                    <Table.Td>
                                                        <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                                            <Button
                                                                type={"view"}
                                                                url={route("classes.show", schoolClass.id)}
                                                                text="Masuk Kelas"
                                                            />
                                                        </div>
                                                    </Table.Td>
                                                )}
                                            </tr>
                                        );})
                                    ) : (
                                        <tr>
                                            <Table.Td colSpan={canViewClasses ? 7 : 6} className="text-center py-8">
                                                <div className="text-gray-500">
                                                    Belum ada kelas yang menggunakan mata pelajaran ini
                                                </div>
                                            </Table.Td>
                                        </tr>
                                    )}
                                </Table.Tbody>
                            </Table>
                        </div>

                    </div>
                )}

                {/* Tab Content - Materials */}
                {activeTab === 'materials' && (
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Materi ({stats.materials_count ?? subject.materials?.length ?? 0})
                            </h3>
                            {actionButtons.materials.create && (
                                <Link
                                    href={actionButtons.materials.url}
                                    className="inline-flex items-center rounded-md bg-[#163d8f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0f2e6f]"
                                >
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
                                    {canViewMaterials && (
                                        <Table.Th>Aksi</Table.Th>
                                    )}
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {subject.materials && subject.materials.length > 0 ? (
                                    subject.materials.map((material, i) => (
                                        <tr
                                            key={i}
                                            role="button"
                                            tabIndex={0}
                                            className="cursor-pointer transition-colors hover:bg-slate-50/80"
                                            onClick={() => {
                                                if (canViewMaterials) {
                                                    router.visit(route("materials.show", material.id));
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if ((e.key === "Enter" || e.key === " ") && canViewMaterials) {
                                                    e.preventDefault();
                                                    router.visit(route("materials.show", material.id));
                                                }
                                            }}
                                        >
                                            <Table.Td>{i + 1}</Table.Td>
                                            <Table.Td className="max-w-[340px] whitespace-normal break-all">
                                                {material.title}
                                            </Table.Td>
                                            <Table.Td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    material.material_type === 'pdf' ? 'bg-slate-100 text-slate-700' :
                                                    material.material_type === 'video' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {material.material_type === 'pdf' ? 'Dokumen' :
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
                                            {canViewMaterials && (
                                                <Table.Td>
                                                    <div
                                                        className="flex justify-end"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    >
                                                        <Button
                                                            type={"view"}
                                                            url={route("materials.show", material.id)}
                                                            text="Buka Detail"
                                                        />
                                                    </div>
                                                </Table.Td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <Table.Td colSpan={canViewMaterials ? 6 : 5} className="text-center py-8">
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
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Tugas ({subject.tasks?.length || 0})
                            </h3>
                            {actionButtons.tasks.create && (
                                <Link
                                    href={actionButtons.tasks.url}
                                    className="inline-flex items-center rounded-md bg-[#163d8f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0f2e6f]"
                                >
                                    + Tambah Tugas
                                </Link>
                            )}
                        </div>
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th>#</Table.Th>
                                    <Table.Th>Judul Tugas</Table.Th>
                                    <Table.Th>Tenggat</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    {canViewTasks && <Table.Th>Aksi</Table.Th>}
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {subject.tasks && subject.tasks.length > 0 ? (
                                    subject.tasks.map((task, i) => (
                                        <tr
                                            key={task.id ?? i}
                                            role="button"
                                            tabIndex={0}
                                            className="cursor-pointer transition-colors hover:bg-slate-50/80"
                                            onClick={() => {
                                                if (canViewTasks) {
                                                    router.visit(route("tasks.show", task.id));
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if ((e.key === "Enter" || e.key === " ") && canViewTasks) {
                                                    e.preventDefault();
                                                    router.visit(route("tasks.show", task.id));
                                                }
                                            }}
                                        >
                                            <Table.Td>{i + 1}</Table.Td>
                                            <Table.Td className="max-w-[340px] whitespace-normal break-all">
                                                <div className="font-medium text-slate-900 break-all">{task.title}</div>
                                                <div className="line-clamp-1 break-all text-xs text-slate-500">{task.description || "—"}</div>
                                            </Table.Td>
                                            <Table.Td>
                                                {task.due_date ? new Date(task.due_date).toLocaleDateString("id-ID") : "—"}
                                            </Table.Td>
                                            <Table.Td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    task.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                                                }`}>
                                                    {task.is_active ? "Aktif" : "Tidak aktif"}
                                                </span>
                                            </Table.Td>
                                            {canViewTasks && (
                                                <Table.Td>
                                                    <div
                                                        className="flex justify-end"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    >
                                                        <Button type={"view"} url={route("tasks.show", task.id)} text="Buka Detail" />
                                                    </div>
                                                </Table.Td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <Table.Td colSpan={canViewTasks ? 5 : 4} className="py-8 text-center text-gray-500">
                                            Belum ada tugas yang dibuat
                                        </Table.Td>
                                    </tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                )}

                {/* Tab Content - Quizzes */}
                {activeTab === 'quizzes' && (
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Kuis ({stats.quizzes_count ?? subject.quizzes?.length ?? 0})
                            </h3>
                            {actionButtons.quizzes.create && (
                                <Link
                                    href={actionButtons.quizzes.url}
                                    className="inline-flex items-center rounded-md bg-[#163d8f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0f2e6f]"
                                >
                                    + Tambah Kuis
                                </Link>
                            )}
                        </div>
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th>#</Table.Th>
                                    <Table.Th>Judul Kuis</Table.Th>
                                    <Table.Th>Durasi</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    {canViewQuizzes && <Table.Th>Aksi</Table.Th>}
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {subject.quizzes && subject.quizzes.length > 0 ? (
                                    subject.quizzes.map((quiz, i) => (
                                        <tr
                                            key={quiz.id ?? i}
                                            role="button"
                                            tabIndex={0}
                                            className="cursor-pointer transition-colors hover:bg-slate-50/80"
                                            onClick={() => {
                                                if (canViewQuizzes) {
                                                    router.visit(route("quizzes.show", quiz.id));
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if ((e.key === "Enter" || e.key === " ") && canViewQuizzes) {
                                                    e.preventDefault();
                                                    router.visit(route("quizzes.show", quiz.id));
                                                }
                                            }}
                                        >
                                            <Table.Td>{i + 1}</Table.Td>
                                            <Table.Td className="max-w-[340px] whitespace-normal break-all">
                                                <div className="font-medium text-slate-900 break-all">{quiz.title}</div>
                                                <div className="line-clamp-1 break-all text-xs text-slate-500">{quiz.description || "—"}</div>
                                            </Table.Td>
                                            <Table.Td>{quiz.time_limit ? `${quiz.time_limit} menit` : "—"}</Table.Td>
                                            <Table.Td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    quiz.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {quiz.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </Table.Td>
                                            {canViewQuizzes && (
                                                <Table.Td>
                                                    <div
                                                        className="flex justify-end"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    >
                                                        <Button type={"view"} url={route("quizzes.show", quiz.id)} text="Buka Detail" />
                                                    </div>
                                                </Table.Td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <Table.Td colSpan={canViewQuizzes ? 5 : 4} className="py-8 text-center text-gray-500">
                                            Belum ada kuis yang dibuat
                                        </Table.Td>
                                    </tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                )}

                {/* Tab Content - Exams */}
                {activeTab === 'exams' && (
                    <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Daftar Ujian ({stats.exams_count ?? subject.exams?.length ?? 0})
                            </h3>
                            {actionButtons.exams.create && (
                                <Link
                                    href={actionButtons.exams.url}
                                    className="inline-flex items-center rounded-md bg-[#163d8f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0f2e6f]"
                                >
                                    + Tambah Ujian
                                </Link>
                            )}
                        </div>
                        <Table>
                            <Table.Thead>
                                <tr>
                                    <Table.Th>#</Table.Th>
                                    <Table.Th>Judul Ujian</Table.Th>
                                    <Table.Th>Tanggal</Table.Th>
                                    <Table.Th>Status</Table.Th>
                                    {canViewExams && <Table.Th>Aksi</Table.Th>}
                                </tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {subject.exams && subject.exams.length > 0 ? (
                                    subject.exams.map((exam, i) => (
                                        <tr
                                            key={exam.id ?? i}
                                            role="button"
                                            tabIndex={0}
                                            className="cursor-pointer transition-colors hover:bg-slate-50/80"
                                            onClick={() => {
                                                if (canViewExams) {
                                                    router.visit(route("exams.show", exam.id));
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if ((e.key === "Enter" || e.key === " ") && canViewExams) {
                                                    e.preventDefault();
                                                    router.visit(route("exams.show", exam.id));
                                                }
                                            }}
                                        >
                                            <Table.Td>{i + 1}</Table.Td>
                                            <Table.Td className="max-w-[340px] whitespace-normal break-all">
                                                <div className="font-medium text-slate-900 break-all">{exam.title}</div>
                                                <div className="line-clamp-1 break-all text-xs text-slate-500">{exam.description || "—"}</div>
                                            </Table.Td>
                                            <Table.Td>
                                                {exam.exam_date
                                                    ? new Date(exam.exam_date).toLocaleDateString("id-ID")
                                                    : exam.scheduled_date
                                                      ? new Date(exam.scheduled_date).toLocaleDateString("id-ID")
                                                      : "—"}
                                            </Table.Td>
                                            <Table.Td>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    exam.is_active ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {exam.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </span>
                                            </Table.Td>
                                            {canViewExams && (
                                                <Table.Td>
                                                    <div
                                                        className="flex justify-end"
                                                        onClick={(e) => e.stopPropagation()}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    >
                                                        <Button type={"view"} url={route("exams.show", exam.id)} text="Buka Detail" />
                                                    </div>
                                                </Table.Td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <Table.Td colSpan={canViewExams ? 5 : 4} className="py-8 text-center text-gray-500">
                                            Belum ada ujian yang dibuat
                                        </Table.Td>
                                    </tr>
                                )}
                            </Table.Tbody>
                        </Table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}