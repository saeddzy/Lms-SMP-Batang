import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, Link, router, usePage } from "@inertiajs/react";
import hasAnyPermission, { hasRole } from "@/Utils/Permissions";
import ToggleSwitch from "@/Components/ToggleSwitch";
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
    const {
        quizzes,
        subjects = [],
        classes = [],
        teachers = [],
        filters = {},
        auth = {},
    } = usePage().props;
    const canMutate = auth.canMutateTeachingContent ?? false;
    const isAdmin = hasRole("admin");
    const searchQuery = filters.search ?? "";
    const selectedStatus = filters.status ?? "";
    const filterQuery = {
        search: searchQuery,
        status: selectedStatus,
        subject_id: filters.subject_id ?? "",
        class_id: filters.class_id ?? "",
        teacher_id: filters.teacher_id ?? "",
    };
    const quizItems = quizzes?.data ?? [];
    const totalQuiz = quizzes?.total ?? quizItems.length ?? 0;
    const activeQuiz = quizItems.filter((q) => q.status === "active").length;
    const upcomingQuiz = quizItems.filter((q) => q.status === "upcoming").length;
    const totalParticipants = quizItems.reduce(
        (sum, q) => sum + (q.participants_count ?? 0),
        0
    );
    const totalAttempts = quizItems.reduce(
        (sum, q) => sum + (q.attempts_count ?? 0),
        0
    );

    const statusOptions = [
        { value: "", label: "Semua" },
        { value: "active", label: "Sedang dibuka" },
        { value: "upcoming", label: "Akan dibuka" },
        { value: "expired", label: "Berakhir" },
        { value: "inactive", label: "Nonaktif" },
    ];

    const applyStatusFilter = (status) => {
        router.get(
            route("quizzes.index"),
            {
                search: filterQuery.search,
                status,
                ...(isAdmin
                    ? {
                          subject_id: filterQuery.subject_id,
                          class_id: filterQuery.class_id,
                          teacher_id: filterQuery.teacher_id,
                      }
                    : {}),
            },
            {
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <DashboardLayout title="Kuis">
            <Head title="Kuis" />

            <div className="space-y-6">
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Kuis
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Daftar kuis kelas Anda dengan info durasi, status,
                            peserta, dan progres soal.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5 md:grid-cols-4">
                        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Total kuis
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {totalQuiz}
                            </p>
                        </div>
                        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                                Sedang dibuka
                            </p>
                            <p className="mt-1 text-xl font-semibold text-emerald-800">
                                {activeQuiz}
                            </p>
                        </div>
                        <div className="rounded-md border border-sky-200 bg-sky-50/50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
                                Akan dibuka
                            </p>
                            <p className="mt-1 text-xl font-semibold text-sky-800">
                                {upcomingQuiz}
                            </p>
                        </div>
                        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Attempt rate
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {totalParticipants > 0
                                    ? `${Math.round((totalAttempts / totalParticipants) * 100)}%`
                                    : "0%"}
                            </p>
                        </div>
                    </div>
                </section>

                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="text-sm text-stone-600">
                        Gunakan pencarian untuk menemukan kuis lebih cepat.
                    </div>
                    {canMutate && hasAnyPermission(["quizzes create"]) && (
                        <Button
                            type="add"
                            url={route("quizzes.create")}
                            className="border-[#163d8f] bg-[#163d8f] hover:bg-[#0f2e6f]"
                        />
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <Search
                        url={route("quizzes.index")}
                        placeholder="Cari judul / deskripsi kuis..."
                        filter={
                            isAdmin
                                ? filterQuery
                                : {
                                      search: filterQuery.search,
                                      status: filterQuery.status,
                                  }
                        }
                    />
                    {isAdmin && (
                        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                            <select
                                value={filterQuery.subject_id}
                                onChange={(e) =>
                                    router.get(
                                        route("quizzes.index"),
                                        {
                                            ...filterQuery,
                                            subject_id: e.target.value,
                                        },
                                        { preserveScroll: true, replace: true }
                                    )
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua mapel</option>
                                {subjects.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterQuery.class_id}
                                onChange={(e) =>
                                    router.get(
                                        route("quizzes.index"),
                                        {
                                            ...filterQuery,
                                            class_id: e.target.value,
                                        },
                                        { preserveScroll: true, replace: true }
                                    )
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua kelas</option>
                                {classes.map((schoolClass) => (
                                    <option key={schoolClass.id} value={schoolClass.id}>
                                        {schoolClass.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filterQuery.teacher_id}
                                onChange={(e) =>
                                    router.get(
                                        route("quizzes.index"),
                                        {
                                            ...filterQuery,
                                            teacher_id: e.target.value,
                                        },
                                        { preserveScroll: true, replace: true }
                                    )
                                }
                                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                            >
                                <option value="">Semua guru</option>
                                {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {statusOptions.map((status) => {
                            const isActive = selectedStatus === status.value;
                            return (
                                <button
                                    key={status.value || "all"}
                                    type="button"
                                    onClick={() => applyStatusFilter(status.value)}
                                    className={
                                        isActive
                                            ? "inline-flex items-center rounded-md border border-[#163d8f] bg-[#163d8f] px-3 py-1.5 text-xs font-semibold text-white"
                                            : "inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    }
                                >
                                    {status.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {quizzes?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {quizzes.data.map((quiz) => {
                            const st = statusMeta(quiz.status);
                            const pointsUsed = Number(quiz.questions ?? quiz.questions_count ?? 0)
                                ? quiz.questions_count
                                : quiz.questions_count ?? 0;
                            const quizDuration =
                                quiz.duration ??
                                quiz.duration_minutes ??
                                quiz.time_limit ??
                                "—";

                            return (
                                <article key={quiz.id} className="rounded-lg border border-slate-200 bg-white p-5">
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
                                                {quizDuration} menit
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

                                    <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                        <p>Mulai: {shortDateTime(quiz.start_time)}</p>
                                        <p>Selesai: {shortDateTime(quiz.end_time)}</p>
                                    </div>

                                    {canMutate &&
                                        hasAnyPermission(["quizzes edit"]) && (
                                            <div className="mt-4 w-full max-w-md">
                                                <ToggleSwitch
                                                    checked={quiz.is_active}
                                                    label="Kuis aktif"
                                                    description="Nonaktifkan agar siswa tidak melihat atau mengerjakan kuis ini."
                                                    onChange={() =>
                                                        router.patch(
                                                            route(
                                                                "quizzes.toggle-status",
                                                                quiz.id
                                                            ),
                                                            {},
                                                            {
                                                                preserveScroll: true,
                                                            }
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}

                                    <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                                        <Link
                                            href={route("quizzes.show", quiz.id)}
                                            className="inline-flex rounded-md bg-[#163d8f] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0f2e6f]"
                                        >
                                            Buka Detail
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
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
                        Belum ada kuis yang cocok dengan filter saat ini.
                    </div>
                )}

                {quizzes?.last_page > 1 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <Pagination links={quizzes.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
