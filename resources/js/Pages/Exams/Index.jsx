import React from "react";
import clsx from "clsx";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";
import Search from "@/Components/Search";
import Pagination from "@/Components/Pagination";
import { Head, Link, router, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";
import ToggleSwitch from "@/Components/ToggleSwitch";
import {
    IconClockHour4,
    IconListCheck,
    IconUsersGroup,
    IconBook2,
    IconCalendarEvent,
} from "@tabler/icons-react";

const chipBase =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1";

function statusMeta(status) {
    switch (status) {
        case "active":
            return {
                label: "Aktif",
                className: "bg-emerald-50 text-emerald-800 ring-emerald-200/80",
            };
        case "upcoming":
            return {
                label: "Akan datang",
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
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Index() {
    const { exams, filters = {}, auth = {} } = usePage().props;
    const canMutate = auth.canMutateTeachingContent ?? false;
    const searchQuery = filters.search ?? "";
    const selectedStatus = filters.status ?? "";
    const examItems = exams?.data ?? [];
    const totalExam = exams?.total ?? examItems?.length ?? 0;
    const activeExam = examItems.filter((e) => e.status === "active").length;
    const upcomingExam = examItems.filter((e) => e.status === "upcoming").length;
    const totalParticipants = examItems.reduce(
        (sum, e) => sum + (e.participants_count ?? 0),
        0
    );
    const totalAttempts = examItems.reduce(
        (sum, e) => sum + (e.attempts_count ?? 0),
        0
    );

    const statusOptions = [
        { value: "", label: "Semua" },
        { value: "active", label: "Aktif" },
        { value: "upcoming", label: "Akan Datang" },
        { value: "expired", label: "Berakhir" },
        { value: "inactive", label: "Nonaktif" },
    ];

    const applyStatusFilter = (status) => {
        router.get(
            route("exams.index"),
            {
                search: filters.search ?? "",
                status,
            },
            {
                preserveScroll: true,
                replace: true,
            }
        );
    };

    return (
        <DashboardLayout title="Ujian">
            <Head title="Ujian" />

            <div className="space-y-6">
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Ujian
                        </h1>
                        <p className="mt-1 text-sm text-slate-600">
                            Kelola jadwal ujian, peserta, dan progres pengerjaan siswa.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 px-6 py-5 md:grid-cols-4">
                        <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Total ujian
                            </p>
                            <p className="mt-1 text-xl font-semibold text-slate-900">
                                {totalExam}
                            </p>
                        </div>
                        <div className="rounded-md border border-sky-200 bg-sky-50/50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-sky-700">
                                Akan datang
                            </p>
                            <p className="mt-1 text-xl font-semibold text-sky-800">
                                {upcomingExam}
                            </p>
                        </div>
                        <div className="rounded-md border border-amber-200 bg-amber-50/50 px-4 py-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                                Aktif
                            </p>
                            <p className="mt-1 text-xl font-semibold text-amber-800">
                                {activeExam}
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
                        Gunakan pencarian untuk menemukan ujian lebih cepat.
                    </div>
                    {canMutate && hasAnyPermission(["exams create"]) && (
                        <Button
                            type="add"
                            url={route("exams.create")}
                            className="border-[#163d8f] bg-[#163d8f] hover:bg-[#0f2e6f]"
                        />
                    )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <Search
                        url={route("exams.index")}
                        placeholder="Cari judul, mapel, atau kelas ujian..."
                        filter={{
                            search: searchQuery,
                            status: selectedStatus,
                        }}
                    />
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

                {exams?.data?.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {exams.data.map((exam) => {
                            const st = statusMeta(exam.status);
                            const className =
                                exam.school_class?.name ??
                                exam.schoolClass?.name ??
                                "—";

                            return (
                                <article
                                    key={exam.id}
                                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h2 className="line-clamp-2 text-base font-semibold text-stone-900">
                                                {exam.title}
                                            </h2>
                                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                                <IconBook2 className="h-3.5 w-3.5" />
                                                <span className="line-clamp-1">
                                                    {exam.subject?.name ?? "—"} ·{" "}
                                                    {className}
                                                </span>
                                            </p>
                                        </div>
                                        <span
                                            className={clsx(
                                                chipBase,
                                                st.className
                                            )}
                                        >
                                            {st.label}
                                        </span>
                                    </div>

                                    <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-stone-700">
                                        <div>
                                            <dt>Kelas</dt>
                                            <dd className="font-medium text-stone-900">
                                                {className}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Mapel</dt>
                                            <dd className="font-medium text-stone-900">
                                                {exam.subject?.name ?? "—"}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline-flex items-center gap-1">
                                                <IconClockHour4 size={14} />
                                                Durasi
                                            </dt>
                                            <dd className="font-medium text-stone-900">
                                                {exam.duration ?? "—"} menit
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline-flex items-center gap-1">
                                                <IconListCheck size={14} />
                                                Soal
                                            </dt>
                                            <dd className="font-medium text-stone-900">
                                                {exam.questions_count ?? 0} soal
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="inline-flex items-center gap-1">
                                                <IconUsersGroup size={14} />
                                                Peserta
                                            </dt>
                                            <dd className="font-medium text-stone-900">
                                                {exam.participants_count ?? 0} siswa
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>Status</dt>
                                            <dd>
                                                <span
                                                    className={clsx(
                                                        chipBase,
                                                        st.className
                                                    )}
                                                >
                                                    {st.label}
                                                </span>
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                        <p className="inline-flex items-center gap-1">
                                            <IconCalendarEvent size={14} />
                                            Mulai: {shortDateTime(exam.start_time)}
                                        </p>
                                        <p className="mt-1">
                                            Selesai: {shortDateTime(exam.end_time)}
                                        </p>
                                    </div>

                                    {canMutate &&
                                        hasAnyPermission(["exams edit"]) && (
                                            <div className="mt-4 w-full max-w-md">
                                                <ToggleSwitch
                                                    checked={exam.is_active}
                                                    label="Ujian aktif"
                                                    description="Nonaktifkan agar siswa tidak melihat atau mengerjakan ujian ini."
                                                    onChange={() =>
                                                        router.patch(
                                                            route(
                                                                "exams.toggle-status",
                                                                exam.id
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
                                            href={route("exams.show", exam.id)}
                                            className="inline-flex rounded-md bg-[#163d8f] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#0f2e6f]"
                                        >
                                            Buka Detail
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
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center text-sm text-slate-500">
                        Belum ada ujian yang cocok dengan filter saat ini.
                    </div>
                )}

                {exams?.last_page > 1 && (
                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                        <Pagination links={exams.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}