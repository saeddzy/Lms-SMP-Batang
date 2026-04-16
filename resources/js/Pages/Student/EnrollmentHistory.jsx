import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, usePage } from "@inertiajs/react";

export default function EnrollmentHistory() {
    const { history = [] } = usePage().props;

    return (
        <DashboardLayout title="Riwayat kelas">
            <Head title="Riwayat kelas" />

            <div className="mx-auto max-w-4xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-stone-900">Riwayat kelas</h1>
                    <p className="mt-1 text-sm text-stone-600">
                        Kelas yang pernah Anda ikuti setelah naik kelas atau pindah. Di bawah
                        setiap kelas ditampilkan nilai yang tercatat untuk kelas tersebut (nilai
                        lengkap juga ada di menu Nilai Saya dengan filter kelas).
                    </p>
                </div>

                {history.length === 0 ? (
                    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500 shadow-sm">
                        Belum ada riwayat kelas (Anda masih di kelas pertama atau belum
                        dipindahkan).
                    </div>
                ) : (
                    <div className="space-y-8">
                        {history.map((item) => {
                            const sc = item.school_class;
                            const finalGrades = item.final_grades ?? [];
                            const activityScores = item.activity_scores ?? [];
                            return (
                                <section
                                    key={item.enrollment_id}
                                    className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                                >
                                    <div className="border-b border-stone-100 bg-stone-50/80 px-5 py-4">
                                        <h2 className="text-base font-semibold text-stone-900">
                                            {sc?.name ?? "—"}
                                        </h2>
                                        <p className="mt-1 text-xs text-stone-500">
                                            Tahun ajaran: {sc?.academic_year ?? "—"}
                                            {item.left_at && (
                                                <>
                                                    {" "}
                                                    · Selesai:{" "}
                                                    {new Date(item.left_at).toLocaleDateString(
                                                        "id-ID"
                                                    )}
                                                </>
                                            )}
                                            {item.grades_average != null && (
                                                <span className="ms-2 font-medium text-stone-700">
                                                    · Rata-rata nilai: {item.grades_average}
                                                </span>
                                            )}
                                        </p>
                                        {item.notes && (
                                            <p className="mt-2 text-xs text-stone-600">
                                                {item.notes}
                                            </p>
                                        )}
                                    </div>

                                    {finalGrades.length === 0 &&
                                    activityScores.length === 0 ? (
                                        <p className="px-5 py-6 text-sm text-stone-500">
                                            Belum ada nilai yang tercatat untuk kelas ini.
                                        </p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            {finalGrades.length > 0 && (
                                                <table className="w-full min-w-[480px] text-sm">
                                                    <thead className="border-b border-stone-100 bg-white">
                                                        <tr>
                                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                                                Mapel
                                                            </th>
                                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                                                Komponen
                                                            </th>
                                                            <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                                                                Nilai akhir
                                                            </th>
                                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                                                Tahun ajaran
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-stone-100">
                                                        {finalGrades.map((g) => (
                                                            <tr
                                                                key={`fg-${g.id}`}
                                                                className="hover:bg-stone-50/80"
                                                            >
                                                                <td className="whitespace-nowrap px-5 py-3 text-stone-800">
                                                                    {g.subject?.name ?? "—"}
                                                                </td>
                                                                <td className="px-5 py-3 text-stone-600">
                                                                    {g.component?.name ?? "—"}
                                                                </td>
                                                                <td className="whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums text-stone-900">
                                                                    {g.score != null
                                                                        ? Number(g.score).toFixed(
                                                                              0
                                                                          )
                                                                        : "—"}
                                                                </td>
                                                                <td className="whitespace-nowrap px-5 py-3 text-stone-500">
                                                                    {g.academic_year ?? "—"}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}

                                            {activityScores.length > 0 && (
                                                <table className="w-full min-w-[480px] text-sm">
                                                    <thead className="border-y border-stone-100 bg-stone-50/60">
                                                        <tr>
                                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                                                Jenis
                                                            </th>
                                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                                                Aktivitas
                                                            </th>
                                                            <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                                                Mapel
                                                            </th>
                                                            <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                                                                Skor
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-stone-100">
                                                        {activityScores.map((x) => (
                                                            <tr
                                                                key={x.id}
                                                                className="hover:bg-stone-50/80"
                                                            >
                                                                <td className="whitespace-nowrap px-5 py-3 text-stone-700">
                                                                    {x.type}
                                                                </td>
                                                                <td className="px-5 py-3 text-stone-800">
                                                                    {x.title}
                                                                </td>
                                                                <td className="px-5 py-3 text-stone-600">
                                                                    {x.subject}
                                                                </td>
                                                                <td className="whitespace-nowrap px-5 py-3 text-right font-medium tabular-nums text-stone-900">
                                                                    {x.score != null
                                                                        ? Number(x.score).toFixed(
                                                                              0
                                                                          )
                                                                        : "—"}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            )}
                                        </div>
                                    )}
                                </section>
                            );
                        })}
                    </div>
                )}

                <Link
                    href={route("student.grades")}
                    className="inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    ← Lihat semua nilai (Nilai Saya)
                </Link>
            </div>
        </DashboardLayout>
    );
}
