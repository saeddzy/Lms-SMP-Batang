import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, Link, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";
import {
    IconCalendarTime,
    IconClockHour4,
    IconUsersGroup,
} from "@tabler/icons-react";

export default function Index() {
    const { exams, filters = {}, auth = {} } = usePage().props;
    const canMutate = auth.canMutateTeachingContent ?? false;
    const searchQuery = filters.search ?? "";
    const totalExam = exams?.total ?? exams?.data?.length ?? 0;

    const getStatusColor = (status) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-700';
            case 'scheduled':
                return 'bg-blue-100 text-blue-700';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'cancelled':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'draft':
                return 'Draft';
            case 'scheduled':
                return 'Terjadwal';
            case 'in_progress':
                return 'Sedang Berlangsung';
            case 'completed':
                return 'Selesai';
            case 'cancelled':
                return 'Dibatalkan';
            default:
                return status;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'mid_term':
            case 'midterm':
                return 'bg-blue-100 text-blue-700';
            case 'final':
                return 'bg-red-100 text-red-700';
            case 'quiz':
                return 'bg-green-100 text-green-700';
            case 'practice':
                return 'bg-purple-100 text-purple-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'mid_term':
            case 'midterm':
                return 'UTS';
            case 'final':
                return 'UAS';
            case 'quiz':
                return 'Kuis';
            case 'practice':
                return 'Latihan';
            default:
                return type;
        }
    };

    return (
        <DashboardLayout title="Ujian">
            <Head title="Ujian" />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-violet-50 via-white to-indigo-50 px-6 py-5">
                        <h1 className="text-2xl font-bold text-stone-900">
                            Ujian
                        </h1>
                        <p className="text-sm text-stone-600">
                            Kelola jadwal ujian, peserta, dan progres pengerjaan siswa.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 border-t border-stone-100 px-6 py-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                            <p className="text-xs font-semibold uppercase text-stone-500">
                                Total ujian
                            </p>
                            <p className="mt-1 text-xl font-bold text-stone-900">
                                {totalExam}
                            </p>
                        </div>
                        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                            <p className="text-xs font-semibold uppercase text-stone-500">
                                Fokus halaman
                            </p>
                            <p className="mt-1 text-sm font-medium text-stone-900">
                                Status jadwal, durasi, dan jumlah peserta
                            </p>
                        </div>
                        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                            <p className="text-xs font-semibold uppercase text-stone-500">
                                Tampilan
                            </p>
                            <p className="mt-1 text-sm font-medium text-stone-900">
                                Card ringkas untuk monitoring cepat
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="text-sm text-stone-600">
                        Gunakan pencarian untuk menemukan ujian lebih cepat.
                    </div>
                    {canMutate && hasAnyPermission(["exams create"]) && (
                        <Button type="add" url={route("exams.create")} />
                    )}
                </div>

                <Search
                    url={route("exams.index")}
                    placeholder="Cari judul / deskripsi ujian..."
                    filter={{ search: searchQuery }}
                />

                {exams?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {exams.data.map((exam) => (
                            <article
                                key={exam.id}
                                className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="line-clamp-2 text-base font-semibold text-stone-900">
                                        {exam.title}
                                    </h2>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
                                            exam.status
                                        )}`}
                                    >
                                        {getStatusLabel(exam.status)}
                                    </span>
                                </div>

                                <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                                    {exam.description || "Tanpa deskripsi"}
                                </p>

                                <dl className="mt-4 space-y-1.5 text-sm text-stone-700">
                                    <div className="flex justify-between gap-2">
                                        <dt>Kelas</dt>
                                        <dd className="text-right font-medium text-stone-900">
                                            {exam.school_class?.name ??
                                                exam.schoolClass?.name ??
                                                "—"}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Mapel</dt>
                                        <dd className="text-right font-medium text-stone-900">
                                            {exam.subject?.name ?? "—"}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt>Tipe</dt>
                                        <dd>
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getTypeColor(
                                                    exam.exam_type ?? exam.type
                                                )}`}
                                            >
                                                {getTypeLabel(
                                                    exam.exam_type ?? exam.type
                                                )}
                                            </span>
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="inline-flex items-center gap-1">
                                            <IconClockHour4 size={14} />
                                            Durasi
                                        </dt>
                                        <dd className="font-medium text-stone-900">
                                            {exam.duration_minutes ??
                                                exam.duration ??
                                                "—"}{" "}
                                            menit
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <dt className="inline-flex items-center gap-1">
                                            <IconUsersGroup size={14} />
                                            Peserta
                                        </dt>
                                        <dd className="font-medium text-stone-900">
                                            {exam.participants_count ?? 0} siswa
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-4 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                                    <p className="inline-flex items-center gap-1">
                                        <IconCalendarTime size={14} />
                                        Jadwal:{" "}
                                        {exam.scheduled_date
                                            ? new Date(
                                                  exam.scheduled_date
                                              ).toLocaleString("id-ID")
                                            : "—"}
                                    </p>
                                </div>

                                <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4">
                                    <Link
                                        href={route("exams.show", exam.id)}
                                        className="inline-flex rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800"
                                    >
                                        Buka
                                    </Link>
                                    {hasAnyPermission(["exams edit"]) && (
                                        <Button
                                            type="edit"
                                            url={route("exams.edit", exam.id)}
                                        />
                                    )}
                                    {hasAnyPermission(["exams delete"]) && (
                                        <Button
                                            type="delete"
                                            url={route("exams.destroy", exam.id)}
                                        />
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-10 text-center text-sm text-stone-500">
                        Belum ada ujian yang cocok dengan filter saat ini.
                    </div>
                )}

                {exams?.last_page > 1 && (
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-3">
                        <Pagination links={exams.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}