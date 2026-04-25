import React, { useEffect, useRef, useState } from "react";
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
    const [activeTab, setActiveTab] = useState("subjects");
    const [learningTab, setLearningTab] = useState("materials");
    const [studentSearchQuery, setStudentSearchQuery] = useState("");
    const [debouncedStudentQuery, setDebouncedStudentQuery] = useState("");
    const [studentSort, setStudentSort] = useState("name_asc");
    const [learningSearchQuery, setLearningSearchQuery] = useState("");
    const [debouncedLearningSearchQuery, setDebouncedLearningSearchQuery] =
        useState("");
    const [learningTypeFilter, setLearningTypeFilter] = useState("materials");
    const [learningSort, setLearningSort] = useState("newest");
    const studentSearchInputRef = useRef(null);
    const [selectedClassSubjectId, setSelectedClassSubjectId] = useState(
        schoolClass.class_subjects?.[0]?.id ?? null
    );

    const totalStudents =
        schoolClass.student_count ??
        schoolClass.enrollments?.length ??
        schoolClass.students?.length ??
        0;

    const totalSubjects = schoolClass.class_subjects?.length ?? 0;
    const selectedClassSubject =
        schoolClass.class_subjects?.find(
            (classSubject) =>
                String(classSubject.id) === String(selectedClassSubjectId)
        ) ??
        schoolClass.class_subjects?.[0] ??
        null;

    const withClassSubjectContext = (url) =>
        selectedClassSubject ? `${url}?class_subject_id=${selectedClassSubject.id}` : url;

    const learningTabs = [
        {
            id: "materials",
            label: "Materi",
            count: selectedClassSubject?.materials?.length ?? 0,
            canView: hasAnyPermission(["materials view"]),
            canCreate:
                selectedClassSubject?.can_manage_learning &&
                hasAnyPermission(["materials create"]),
            createUrl: withClassSubjectContext(route("materials.create")),
            viewRoute: "materials.show",
            items: selectedClassSubject?.materials ?? [],
            emptyText: "Belum ada materi pada mapel ini.",
            dateField: "created_at",
        },
        {
            id: "tasks",
            label: "Tugas",
            count: selectedClassSubject?.tasks?.length ?? 0,
            canView: hasAnyPermission(["tasks view"]),
            canCreate:
                selectedClassSubject?.can_manage_learning &&
                hasAnyPermission(["tasks create"]),
            createUrl: withClassSubjectContext(route("tasks.create")),
            viewRoute: "tasks.show",
            items: selectedClassSubject?.tasks ?? [],
            emptyText: "Belum ada tugas pada mapel ini.",
            dateField: "due_date",
        },
        {
            id: "quizzes",
            label: "Kuis",
            count: selectedClassSubject?.quizzes?.length ?? 0,
            canView: hasAnyPermission(["quizzes view"]),
            canCreate:
                selectedClassSubject?.can_manage_learning &&
                hasAnyPermission(["quizzes create"]),
            createUrl: withClassSubjectContext(route("quizzes.create")),
            viewRoute: "quizzes.show",
            items: selectedClassSubject?.quizzes ?? [],
            emptyText: "Belum ada kuis pada mapel ini.",
            dateField: "created_at",
        },
        {
            id: "exams",
            label: "Ujian",
            count: selectedClassSubject?.exams?.length ?? 0,
            canView: hasAnyPermission(["exams view"]),
            canCreate:
                selectedClassSubject?.can_manage_learning &&
                hasAnyPermission(["exams create"]),
            createUrl: withClassSubjectContext(route("exams.create")),
            viewRoute: "exams.show",
            items: selectedClassSubject?.exams ?? [],
            emptyText: "Belum ada ujian pada mapel ini.",
            dateField: "exam_date",
        },
    ];

    const activeLearningTab =
        learningTabs.find((tab) => tab.id === learningTab) ?? learningTabs[0];

    const parseDateToTime = (value) => {
        if (!value) return 0;
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    };

    const sortLearningItems = (items, tabDateField) => {
        const sorted = [...items];
        if (learningSort === "title_asc") {
            return sorted.sort((a, b) =>
                (a.title ?? "").localeCompare(b.title ?? "", "id")
            );
        }
        if (learningSort === "title_desc") {
            return sorted.sort((a, b) =>
                (b.title ?? "").localeCompare(a.title ?? "", "id")
            );
        }

        return sorted.sort(
            (a, b) =>
                parseDateToTime(b[tabDateField] ?? b.created_at) -
                parseDateToTime(a[tabDateField] ?? a.created_at)
        );
    };

    const filterLearningItems = (tab) => {
        const query = debouncedLearningSearchQuery;
        const baseItems = tab.items ?? [];
        const matchedItems = baseItems.filter((item) => {
            if (!query) return true;
            return (item.title ?? "").toLowerCase().includes(query);
        });

        return sortLearningItems(matchedItems, tab.dateField);
    };

    const filteredLearningByType = learningTabs.reduce((acc, tab) => {
        acc[tab.id] = filterLearningItems(tab);
        return acc;
    }, {});

    const displayedLearningTypes =
        learningTypeFilter === "all"
            ? learningTabs.map((tab) => tab.id)
            : [learningTypeFilter];

    const hasAnyLearningResult = displayedLearningTypes.some(
        (typeId) => (filteredLearningByType[typeId] ?? []).length > 0
    );

    const highlightKeyword = (text) => {
        const safeText = text || "(Tanpa judul)";
        if (!debouncedLearningSearchQuery) return safeText;

        const escaped = debouncedLearningSearchQuery.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
        const regex = new RegExp(`(${escaped})`, "ig");
        const parts = safeText.split(regex);

        return parts.map((part, index) =>
            index % 2 === 1 ? (
                <mark
                    key={`${part}-${index}`}
                    className="rounded-sm bg-amber-100 px-0.5 text-slate-900"
                >
                    {part}
                </mark>
            ) : (
                <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>
            )
        );
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedStudentQuery(studentSearchQuery.trim().toLowerCase());
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [studentSearchQuery]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key !== "/" || activeTab !== "students") return;
            if (
                ["INPUT", "TEXTAREA", "SELECT"].includes(
                    document.activeElement?.tagName
                )
            ) {
                return;
            }

            event.preventDefault();
            studentSearchInputRef.current?.focus();
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [activeTab]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedLearningSearchQuery(
                learningSearchQuery.trim().toLowerCase()
            );
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [learningSearchQuery]);

    const filteredEnrollments = (schoolClass.enrollments ?? [])
        .filter((enrollment) => {
            const studentName = (enrollment.student?.name ?? "").toLowerCase();
            const studentEmail = (enrollment.student?.email ?? "").toLowerCase();

            if (debouncedStudentQuery) {
                const isMatch =
                    studentName.includes(debouncedStudentQuery) ||
                    studentEmail.includes(debouncedStudentQuery);
                if (!isMatch) return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (studentSort === "name_desc") {
                return (b.student?.name ?? "").localeCompare(a.student?.name ?? "", "id");
            }
            if (studentSort === "newest") {
                return new Date(b.enrolled_at ?? 0) - new Date(a.enrolled_at ?? 0);
            }
            if (studentSort === "oldest") {
                return new Date(a.enrolled_at ?? 0) - new Date(b.enrolled_at ?? 0);
            }

            return (a.student?.name ?? "").localeCompare(b.student?.name ?? "", "id");
        });

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
            alert("Pilih minimal satu siswa, atau gunakan Naikkan semua.");
            return;
        }
        router.post(route("classes.promote-students", schoolClass.id), {
            target_class_id: targetClassId,
            student_ids: promoteAll ? [] : selectedStudentIds,
            promote_all: promoteAll,
        });
    };

    const selectClassSubject = (classSubjectId) => {
        setSelectedClassSubjectId(classSubjectId);
        setLearningTab("materials");
        setLearningTypeFilter("materials");
    };

    return (
        <DashboardLayout title={`Detail Kelas: ${schoolClass.name}`}>
            <Head title={`Detail Kelas: ${schoolClass.name}`} />

            <div className="mx-auto max-w-7xl space-y-4">
                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                Overview Kelas
                            </p>
                            <h1 className="mt-1 text-xl font-bold text-slate-900">Ringkasan Kelas</h1>
                            <p className="mt-0.5 text-sm text-slate-500">
                                {schoolClass.academic_year || "-"} · {totalStudents} siswa · {totalSubjects} mapel
                            </p>
                        </div>
                        <span
                            className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                schoolClass.is_active
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
                                    : "bg-rose-50 text-rose-700 ring-rose-200/80"
                            }`}
                        >
                            {schoolClass.is_active ? "Kelas Aktif" : "Kelas Tidak Aktif"}
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {hasAnyPermission(["classes edit"]) && (
                                <Button
                                    type="edit"
                                    url={route("classes.edit", schoolClass.id)}
                                    text="Kelola Kelas"
                                />
                            )}
                            {hasAnyPermission(["classes delete"]) && (
                                <Button
                                    type="delete"
                                    url={route("classes.destroy", schoolClass.id)}
                                />
                            )}
                        </div>
                    </div>
                </section>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 bg-slate-50/60 px-6 py-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Informasi Kelas</h2>
                                <p className="text-sm text-slate-500">Workspace kelas guru.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("subjects")}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition-all ${
                                        activeTab === "subjects"
                                            ? "bg-[#163d8f] text-white ring-[#163d8f] shadow-sm"
                                            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    Mapel ({totalSubjects})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("students")}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition-all ${
                                        activeTab === "students"
                                            ? "bg-[#163d8f] text-white ring-[#163d8f] shadow-sm"
                                            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    Siswa ({totalStudents})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("stats")}
                                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition-all ${
                                        activeTab === "stats"
                                            ? "bg-[#163d8f] text-white ring-[#163d8f] shadow-sm"
                                            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    Statistik
                                </button>
                            </div>
                        </div>
                        {activeTab === "subjects" && showTeacherOnlySubjects && (
                            <p className="mt-2 text-xs text-[#163d8f]">
                                Menampilkan hanya mata pelajaran yang Anda ampu di kelas ini.
                            </p>
                        )}
                    </div>
                    <div className="space-y-6 p-6">
                        <div className="space-y-6">
                            {activeTab === "subjects" && (
                            <>
                                {schoolClass.class_subjects && schoolClass.class_subjects.length > 0 ? (
                                    <div className="space-y-4">
                                        {schoolClass.class_subjects.length > 1 && (
                                            <div className="border border-slate-200 bg-slate-50/60 p-3">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Pilih mapel
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {schoolClass.class_subjects.map((classSubject) => (
                                                        <button
                                                            key={classSubject.id}
                                                            type="button"
                                                            onClick={() => selectClassSubject(classSubject.id)}
                                                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${
                                                                String(selectedClassSubjectId) ===
                                                                String(classSubject.id)
                                                                    ? "bg-[#163d8f] text-white ring-[#163d8f]"
                                                                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            {classSubject.subject?.name || "Mapel"}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="overflow-x-auto border border-slate-200 bg-white">
                                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                                            <thead className="bg-slate-50/80">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Mapel</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Kode</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Guru</th>
                                                    <th className="px-4 py-2 text-left font-semibold text-slate-600">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 bg-white">
                                                {schoolClass.class_subjects.map((classSubject) => (
                                                    <tr
                                                        key={classSubject.id}
                                                        className={`cursor-pointer transition-colors ${
                                                            String(selectedClassSubjectId) ===
                                                            String(classSubject.id)
                                                                ? "bg-[#163d8f]/6"
                                                                : "hover:bg-slate-50/80"
                                                        }`}
                                                        onClick={() => selectClassSubject(classSubject.id)}
                                                    >
                                                        <td className="px-4 py-2 font-medium text-slate-900">
                                                            {classSubject.subject?.name || "-"}
                                                        </td>
                                                        <td className="px-4 py-2 text-slate-600">
                                                            {classSubject.subject?.code || "-"}
                                                        </td>
                                                        <td className="px-4 py-2 text-slate-600">
                                                            {classSubject.teacher?.name || "Belum ditentukan"}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                                                    classSubject.is_active
                                                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
                                                                        : "bg-rose-50 text-rose-700 ring-rose-200/80"
                                                                }`}
                                                            >
                                                                {classSubject.is_active ? "Aktif" : "Tidak Aktif"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                                        Belum ada mata pelajaran di kelas ini.
                                    </div>
                                )}

                                {selectedClassSubject && (
                                    <div
                                        id="class-subject-workspace"
                                        className="overflow-hidden border border-slate-200 bg-white"
                                    >
                                        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-4 md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                                                    Workspace Pembelajaran
                                                </p>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Workspace Mapel: {selectedClassSubject.subject?.name ?? "-"}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Guru: {selectedClassSubject.teacher?.name || "Belum ditentukan"}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {learningTabs.map((tab) => (
                                                    <button
                                                        key={tab.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setLearningTab(tab.id);
                                                            setLearningTypeFilter(tab.id);
                                                        }}
                                                        className={`rounded-md px-3 py-1.5 text-xs font-semibold ring-1 transition-all ${
                                                            learningTab === tab.id
                                                                ? "bg-[#163d8f] text-white ring-[#163d8f] shadow-sm"
                                                                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        {tab.label} ({tab.count})
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="mb-4 bg-slate-50/70 p-3">
                                                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                                    <div className="relative w-full lg:max-w-md">
                                                        <svg
                                                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <circle
                                                                cx="11"
                                                                cy="11"
                                                                r="8"
                                                            ></circle>
                                                            <path d="m21 21-4.3-4.3"></path>
                                                        </svg>
                                                        <input
                                                            type="text"
                                                            value={
                                                                learningSearchQuery
                                                            }
                                                            onChange={(e) =>
                                                                setLearningSearchQuery(
                                                                    e.target.value
                                                                )
                                                            }
                                                            placeholder="Cari materi, tugas, kuis, ujian..."
                                                            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 shadow-sm focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                                                        />
                                                        {learningSearchQuery.trim() && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setLearningSearchQuery(
                                                                        ""
                                                                    )
                                                                }
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                                aria-label="Kosongkan pencarian konten"
                                                            >
                                                                ×
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex w-full items-center justify-end gap-2 lg:w-auto">
                                                        <label className="text-xs font-medium text-slate-600">
                                                            Urutkan
                                                        </label>
                                                        <select
                                                            value={learningSort}
                                                            onChange={(e) =>
                                                                setLearningSort(
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="min-w-[150px] rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                                                        >
                                                            <option value="newest">
                                                                Terbaru
                                                            </option>
                                                            <option value="title_asc">
                                                                Judul A-Z
                                                            </option>
                                                            <option value="title_desc">
                                                                Judul Z-A
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>

                                            </div>

                                            <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    Daftar{" "}
                                                    {learningTypeFilter === "all"
                                                        ? "Semua Konten"
                                                        : activeLearningTab.label}
                                                </p>
                                                {learningTypeFilter !== "all" &&
                                                    activeLearningTab.canCreate && (
                                                    <Link
                                                        href={activeLearningTab.createUrl}
                                                        className="inline-flex items-center rounded-md bg-[#163d8f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#0f2e6f]"
                                                    >
                                                        + Tambah {activeLearningTab.label}
                                                    </Link>
                                                    )}
                                            </div>

                                            {hasAnyLearningResult ? (
                                                <div className="space-y-4">
                                                    {displayedLearningTypes.map(
                                                        (typeId) => {
                                                            const tab =
                                                                learningTabs.find(
                                                                    (item) =>
                                                                        item.id ===
                                                                        typeId
                                                                );
                                                            if (!tab) return null;

                                                            const tabItems =
                                                                filteredLearningByType[
                                                                    typeId
                                                                ] ?? [];
                                                            if (tabItems.length === 0)
                                                                return null;

                                                            return (
                                                                <div key={typeId}>
                                                                    {learningTypeFilter ===
                                                                        "all" && (
                                                                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                                            {tab.label} (
                                                                            {tabItems.length}
                                                                            )
                                                                        </p>
                                                                    )}
                                                                    <div className="space-y-2">
                                                                        {tabItems.map(
                                                                            (
                                                                                item,
                                                                                index
                                                                            ) => (
                                                                                <div
                                                                                    key={
                                                                                        item.id ??
                                                                                        `${typeId}-${index}`
                                                                                    }
                                                                                    className="flex items-center justify-between border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:bg-slate-50/70"
                                                                                >
                                                                                    <div className="min-w-0">
                                                                                        <p className="truncate text-sm font-medium text-slate-900">
                                                                                            {highlightKeyword(
                                                                                                item.title
                                                                                            )}
                                                                                        </p>
                                                                                        <p className="text-xs text-slate-500">
                                                                                            {item[
                                                                                                tab.dateField
                                                                                            ]
                                                                                                ? new Date(
                                                                                                      item[
                                                                                                          tab.dateField
                                                                                                      ]
                                                                                                  ).toLocaleDateString(
                                                                                                      "id-ID"
                                                                                                  )
                                                                                                : "Tanggal belum tersedia"}
                                                                                        </p>
                                                                                    </div>
                                                                                    {tab.canView && (
                                                                                        <Button
                                                                                            type="view"
                                                                                            url={route(
                                                                                                tab.viewRoute,
                                                                                                item.id
                                                                                            )}
                                                                                            text="Buka Detail"
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
                                                    {debouncedLearningSearchQuery
                                                        ? `Tidak ada hasil untuk "${debouncedLearningSearchQuery}".`
                                                        : "Belum ada konten pada filter yang dipilih."}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </>
                            )}

                            {activeTab === "students" && (
                            <div className="space-y-4">
                                {canPromoteStudents && promotionTargets.length > 0 && (
                                    <div className="border border-indigo-100 bg-indigo-50/80 p-4">
                                        <p className="text-sm font-semibold text-slate-900">Pindah kelas siswa</p>
                                        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
                                            <div className="min-w-[220px]">
                                                <label className="block text-xs font-medium text-slate-700">
                                                    Kelas tujuan
                                                </label>
                                                <select
                                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                                                disabled={!targetClassId || selectedStudentIds.length === 0}
                                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Pindahkan ({selectedStudentIds.length})
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => postPromote(true)}
                                                disabled={!targetClassId}
                                                className="rounded-md border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-800 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Naikkan Semua
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <Table.Card title={`Daftar Siswa (${totalStudents})`}>
                                    <div className="mb-4 bg-slate-50/70 p-3">
                                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="relative w-full lg:max-w-md">
                                                <svg
                                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <circle cx="11" cy="11" r="8"></circle>
                                                    <path d="m21 21-4.3-4.3"></path>
                                                </svg>
                                                <input
                                                    ref={studentSearchInputRef}
                                                    type="text"
                                                    value={studentSearchQuery}
                                                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                                                    placeholder="Cari siswa (nama atau email)..."
                                                    className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-9 text-sm text-slate-700 shadow-sm focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f]"
                                                />
                                                {studentSearchQuery.trim() && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setStudentSearchQuery("")}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                        aria-label="Kosongkan pencarian"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>

                                        </div>

                                        <div className="mt-2 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                                            <p>
                                                Menampilkan {filteredEnrollments.length} dari{" "}
                                                {schoolClass.enrollments?.length ?? 0} siswa ·
                                                shortcut fokus pencarian: <span className="font-semibold">/</span>
                                            </p>
                                            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                                                <label className="font-medium text-slate-600">
                                                    Urutkan
                                                </label>
                                                <select
                                                    value={studentSort}
                                                    onChange={(e) => setStudentSort(e.target.value)}
                                                    className="min-w-[180px] rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:border-[#163d8f] focus:outline-none focus:ring-1 focus:ring-[#163d8f] sm:min-w-[190px]"
                                                >
                                                    <option value="name_asc">Nama A-Z</option>
                                                    <option value="name_desc">Nama Z-A</option>
                                                    <option value="newest">Bergabung Terbaru</option>
                                                    <option value="oldest">Bergabung Terlama</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
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
                                            {filteredEnrollments.length > 0 ? (
                                                filteredEnrollments.map((enrollment, i) => (
                                                    <tr key={enrollment.id ?? i}>
                                                        {canPromoteStudents && promotionTargets.length > 0 && (
                                                            <Table.Td>
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                    checked={selectedStudentIds.includes(enrollment.student?.id)}
                                                                    onChange={() => toggleStudent(enrollment.student?.id)}
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
                                                        className="py-8 text-center"
                                                    >
                                                        <div className="text-gray-500">
                                                            {studentSearchQuery.trim()
                                                                ? "Tidak ada siswa yang cocok dengan pencarian."
                                                                : "Belum ada siswa yang terdaftar di kelas ini"}
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
                            </div>
                            )}

                            {activeTab === "stats" && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Materi
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {stats.materials_count ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Tugas
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {stats.tasks_count ?? 0}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Nilai Rata-rata
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {stats.grades_average != null ? `${stats.grades_average}%` : "—"}
                                    </p>
                                </div>
                            </div>
                            )}
                        </div>

                    </div>
                </section>

            </div>
        </DashboardLayout>
    );
}
