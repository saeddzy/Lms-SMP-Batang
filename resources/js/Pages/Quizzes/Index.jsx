import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, Link, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";
import {
    IconClockHour4,
    IconListCheck,
    IconUsersGroup,
} from "@tabler/icons-react";

const chipBase =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1";

function statusMeta(status) {
    switch (status) {
        case "active":
            return {
                label: "Sedang dibuka",
                className: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
            };
        case "upcoming":
            return {
                label: "Akan dibuka",
                className: "bg-sky-50 text-sky-800 ring-sky-200/80",
            };
        case "expired":
            return {
                label: "Berakhir",
                className: "bg-slate-100 text-slate-700 ring-slate-200/80",
            };
        default:
            return {
                label: "Nonaktif",
                className: "bg-rose-50 text-rose-800 ring-rose-200/80",
            };
    }
}

function shortDateTime(value) {
    if (!value) return "?";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "?";
    return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Index() {
    const { quizzes, filters = {}, auth = {} } = usePage().props;
    const canMutate = auth.canMutateTeachingContent ?? false;
    const searchQuery = filters.search ?? "";
    const totalQuiz = quizzes?.total ?? quizzes?.data?.length ?? 0;

    return (
        <DashboardLayout title="Kuis">
            <Head title="Kuis" />

            <div className="space-y-6">
                <div className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-indigo-50 via-white to-sky-50 px-6 py-5">
                        <h1 className="text-2xl font-bold text-stone-900">
                            Kuis
                        </h1>
                        <p className="text-sm text-stone-600">
                            Daftar kuis kelas Anda dengan info durasi, status,
                            peserta, dan progres soal.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-3 border-t border-stone-100 px-6 py-4 sm:grid-cols-3">
                        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                            <p className="text-xs font-semibold uppercase text-stone-500">
                                Total kuis
                            </p>
                            <p className="mt-1 text-xl font-bold text-stone-900">
                                {totalQuiz}
                            </p>
                        </div>
                        <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3">
                            <p className="text-xs font-semibold uppercase text-stone-500">
                                Fokus halaman
                            </p>
                            <p className="mt-1 text-sm font-medium text-stone-900">
                                Jadwal, peserta, dan progres soal
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
                        Gunakan pencarian untuk menemukan kuis lebih cepat.
                    </div>
                    {canMutate && hasAnyPermission(["quizzes create"]) && (
                        <Button type="add" url={route("quizzes.create")} />
                    )}
                </div>

                <Search
                    url={route("quizzes.index")}
                    placeholder="Cari judul / deskripsi kuis..."
                    filter={{ search: searchQuery }}
                />

                {quizzes?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {quizzes.data.map((quiz) => {
                            const st = statusMeta(quiz.status);
                            const pointsUsed = Number(quiz.questions ?? quiz.questions_count ?? 0)
                                ? quiz.questions_count
                                : quiz.questions_count ?? 0;

                            return (
                                <article
                                    key={quiz.id}
                                    className="rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h2 className="line-clamp-2 text-base font-semibold text-stone-900">
                                            {quiz.title}
                                        </h2>
                                        <span className={`${chipBase} ${st.className}`}>
                                            {st.label}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm text-stone-600 line-clamp-2">
                                        {quiz.description || "Tanpa deskripsi"}
                                    </p>

                                    <dl className="mt-4 space-y-1.5 text-sm text-stone-700">
                                        <div className="flex justify-between gap-2">
                                            <dt>Kelas</dt>
                                            <dd className="font-medium text-stone-900 text-right">
                                                {quiz.school_class?.name ?? quiz.schoolClass?.name ?? "?"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt>Mapel</dt>
                                            <dd className="font-medium text-stone-900 text-right">
                                                {quiz.subject?.name ?? "?"}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt className="inline-flex items-center gap-1">
                                                <IconClockHour4 size={14} />
                                                Durasi
                                            </dt>
                                            <dd className="font-medium text-stone-900">
                                                {quiz.duration ?? quiz.time_limit ?? "?"} menit
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt className="inline-flex items-center gap-1">
                                                <IconUsersGroup size={14} />
                                                Peserta
                                            </dt>
                                            <dd className="font-medium text-stone-900">
                                                {quiz.participants_count ?? 0} siswa
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt>Percobaan</dt>
                                            <dd className="font-medium text-stone-900">
                                                {quiz.attempts_count ?? 0}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between gap-2">
                                            <dt className="inline-flex items-center gap-1">
                                                <IconListCheck size={14} />
                                                Soal
                                            </dt>
                                            <dd className="font-medium text-stone-900">
                                                {pointsUsed ?? 0} soal
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-4 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                                        <p>Mulai: {shortDateTime(quiz.start_time)}</p>
                                        <p>Selesai: {shortDateTime(quiz.end_time)}</p>
                                    </div>

                                    <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-4">
                                        <Link
                                            href={route("quizzes.show", quiz.id)}
                                            className="inline-flex rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-stone-800"
                                        >
                                            Buka
                                        </Link>
                                        {hasAnyPermission(["quizzes edit"]) && (
                                            <Button
                                                type="edit"
                                                url={route("quizzes.edit", quiz.id)}
                                            />
                                        )}
                                        {hasAnyPermission(["quizzes delete"]) && (
                                            <Button
                                                type="delete"
                                                url={route("quizzes.destroy", quiz.id)}
                                            />
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-10 text-center text-sm text-stone-500">
                        Belum ada kuis yang cocok dengan filter saat ini.
                    </div>
                )}

                {quizzes?.last_page > 1 && (
                    <div className="rounded-2xl border border-stone-200/90 bg-white p-3">
                        <Pagination links={quizzes.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
