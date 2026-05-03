import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { userSecondaryLabel } from "@/Utils/userDisplay";
import Table from "@/Components/Table";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, router, usePage } from "@inertiajs/react";
import hasAnyPermission, { hasRole } from "@/Utils/Permissions";

export default function Index() {
    const { subjects, filters } = usePage().props;
    const isGuru = hasRole("guru");

    const getSubjectSummaryUrl = (subject) => {
        if (isGuru) {
            const classSubjectId = subject.class_subjects?.[0]?.id;
            if (!classSubjectId) return null;
            return `${route("subjects.show", subject.id)}?class_subject_id=${classSubjectId}`;
        }
        return route("subjects.show", subject.id);
    };

    return (
        <DashboardLayout title="Mata Pelajaran">
            <Head title="Mata Pelajaran" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mata Pelajaran</h1>
                        <p className="text-gray-600">
                            Ringkasan mata pelajaran lintas kelas. Klik "Lihat Ringkasan" untuk melihat kelas yang diajar.
                        </p>
                    </div>
                    {hasAnyPermission(["subjects create"]) && (
                        <Button
                            type={"add"}
                            url={route("subjects.create")}
                        />
                    )}
                </div>

                {/* Search */}
                <Search
                    url={route("subjects.index")}
                    placeholder="Cari mata pelajaran..."
                    filter={filters}
                />
                <p className="text-xs text-gray-500">
                    Tip: klik baris mata pelajaran untuk membuka ringkasan kelas yang diajar.
                </p>

                {/* Table */}
                <Table.Card>
                    <Table>
                        <Table.Thead>
                            <tr>
                                <Table.Th>#</Table.Th>
                                <Table.Th>Nama Mata Pelajaran</Table.Th>
                                <Table.Th>Kode</Table.Th>
                                <Table.Th>Deskripsi</Table.Th>
                                <Table.Th>Guru Pengajar</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Jumlah Kelas</Table.Th>
                                <Table.Th>Aksi</Table.Th>
                            </tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {subjects.data && subjects.data.length > 0 ? (
                                subjects.data.map((subject, i) => (
                                    <tr
                                        key={subject.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            const url = getSubjectSummaryUrl(subject);
                                            if (url) router.visit(url);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                e.preventDefault();
                                                const url = getSubjectSummaryUrl(subject);
                                                if (url) router.visit(url);
                                            }
                                        }}
                                        className="cursor-pointer transition-colors hover:bg-slate-50/80 focus-within:bg-slate-50/80"
                                    >
                                        <Table.Td>{subjects.from + i}</Table.Td>
                                        <Table.Td>
                                            <div>
                                                <div className="font-medium text-gray-900">
                                                    {subject.name}
                                                </div>
                                                {subject.code && (
                                                    <div className="text-sm text-gray-500">
                                                        Kode: {subject.code}
                                                    </div>
                                                )}
                                            </div>
                                        </Table.Td>
                                        <Table.Td>{subject.code || '-'}</Table.Td>
                                        <Table.Td>
                                            <div className="max-w-xs truncate">
                                                {subject.description || '-'}
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <div className="max-w-xs">
                                                {subject.teacher ? (
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-900">
                                                            {subject.teacher.name}
                                                        </div>
                                                        {userSecondaryLabel(subject.teacher) && (
                                                            <div className="text-gray-500">
                                                                {userSecondaryLabel(subject.teacher)}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">-</span>
                                                )}
                                            </div>
                                        </Table.Td>
                                        <Table.Td>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                subject.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {subject.is_active ? 'Aktif' : 'Tidak Aktif'}
                                            </span>
                                        </Table.Td>
                                        <Table.Td>{subject.classes_count || 0}</Table.Td>
                                        <Table.Td>
                                            <div
                                                className="flex flex-wrap gap-2"
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => e.stopPropagation()}
                                            >
                                                {hasAnyPermission(["subjects view"]) && (
                                                    <Button
                                                        type="view"
                                                        url={getSubjectSummaryUrl(subject) || "#"}
                                                        text="Lihat Ringkasan"
                                                        className={`h-auto w-auto rounded-md px-3 py-1.5 ${
                                                            !getSubjectSummaryUrl(subject)
                                                                ? "pointer-events-none cursor-not-allowed opacity-50"
                                                                : ""
                                                        }`}
                                                    />
                                                )}
                                                {hasAnyPermission(["subjects edit"]) && !hasRole("guru") && (
                                                    <Button
                                                        type={"edit"}
                                                        url={route("subjects.edit", subject.id)}
                                                    />
                                                )}
                                                {hasAnyPermission(["subjects delete"]) && !hasRole("guru") && (
                                                    <Button
                                                        type={"delete"}
                                                        url={route("subjects.destroy", subject.id)}
                                                    />
                                                )}
                                            </div>
                                        </Table.Td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <Table.Td colSpan={8} className="text-center py-8">
                                        <div className="text-gray-500">
                                            {filters?.search ? 'Tidak ada mata pelajaran yang ditemukan' : 'Belum ada mata pelajaran yang terdaftar'}
                                        </div>
                                        {hasAnyPermission(["subjects create"]) && !filters?.search && (
                                            <div className="mt-2">
                                                <Button
                                                    type={"add"}
                                                    url={route("subjects.create")}
                                                    text="Tambah Mata Pelajaran"
                                                />
                                            </div>
                                        )}
                                    </Table.Td>
                                </tr>
                            )}
                        </Table.Tbody>
                    </Table>

                    {/* Pagination */}
                    {subjects.last_page > 1 && (
                        <Table.Footer>
                            <Pagination links={subjects.links} />
                        </Table.Footer>
                    )}
                </Table.Card>
            </div>
        </DashboardLayout>
    );
}