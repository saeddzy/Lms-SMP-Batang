import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";
import { datetimeLocalToLaravel } from "@/Utils/datetimeForm";

function pickId(v) {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "object" && v !== null && "value" in v) return v.value;
    return v;
}

export default function Create() {
    const {
        classes = [],
        subjects = [],
        selectedClassId = null,
        selectedSubjectId = null,
    } = usePage().props;

    const { data, setData, post, processing, errors, transform } = useForm({
        title: "",
        description: "",
        class_id: selectedClassId ?? "",
        subject_id: selectedSubjectId ?? "",
        type: "multiple_choice",
        duration: "",
        total_questions: "",
        passing_score: "",
        max_attempts: "",
        start_datetime: "",
        end_datetime: "",
        instructions: "",
        shuffle_questions: false,
        shuffle_answers: false,
        show_results: true,
        status: "draft",
    });

    transform((raw) => {
        const classId =
            selectedClassId != null && selectedClassId !== ""
                ? selectedClassId
                : pickId(raw.class_id);
        const subjectId =
            selectedSubjectId != null && selectedSubjectId !== ""
                ? selectedSubjectId
                : pickId(raw.subject_id);

        const start = datetimeLocalToLaravel(raw.start_datetime);
        const end = datetimeLocalToLaravel(raw.end_datetime);

        return {
            title: raw.title,
            description: raw.description || null,
            class_id: classId,
            subject_id: subjectId,
            start_time: start,
            end_time: end,
            time_limit: raw.duration === "" ? 60 : Number(raw.duration),
            total_questions:
                raw.total_questions === "" ? 0 : Number(raw.total_questions),
            max_attempts:
                raw.max_attempts === "" ? 3 : Number(raw.max_attempts),
            passing_score:
                raw.passing_score === "" ? 70 : Number(raw.passing_score),
            instructions: raw.instructions || null,
            is_active: raw.status === "published",
            is_randomized: Boolean(raw.shuffle_questions),
            show_results: Boolean(raw.show_results),
        };
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("quizzes.store"));
    };

    const classOptions = classes.map((cls) => ({
        value: cls.id,
        label: cls.name,
    }));

    const subjectOptions = subjects.map((subject) => ({
        value: subject.id,
        label: subject.name,
    }));

    const typeOptions = [
        { value: "multiple_choice", label: "Pilihan Ganda" },
        { value: "true_false", label: "Benar/Salah" },
        { value: "essay", label: "Esai" },
        { value: "mixed", label: "Campuran" },
    ];

    const statusOptions = [
        { value: "draft", label: "Draft (Simpan sebagai draf)" },
        { value: "published", label: "Publikasikan (Langsung tersedia)" },
    ];

    const selectedClass = data.class_id
        ? classOptions.find((c) => c.value === data.class_id) ?? null
        : null;
    const selectedSubject = data.subject_id
        ? subjectOptions.find((s) => s.value === data.subject_id) ?? null
        : null;

    return (
        <DashboardLayout title="Buat Kuis Baru">
            <Head title="Buat Kuis Baru" />

            <div className="mx-auto max-w-4xl">
                <Card>
                    <Card.Header>
                        <Card.Title>Buat Kuis Baru</Card.Title>
                        <Card.Description>
                            Buat kuis dengan pengaturan lengkap untuk siswa
                        </Card.Description>
                    </Card.Header>

                    <form onSubmit={handleSubmit}>
                        <Card.Content>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="title" value="Judul Kuis" />
                                    <Input.Text
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        placeholder="Masukkan judul kuis"
                                        required
                                    />
                                    <Input.Error message={errors.title} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="class_id" value="Kelas" />
                                    {selectedClassId ? (
                                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                            {classes.find(
                                                (c) => c.id === selectedClassId
                                            )?.name || "Kelas terpilih"}
                                        </div>
                                    ) : (
                                        <Select2
                                            id="class_id"
                                            value={selectedClass}
                                            onChange={(selected) =>
                                                setData(
                                                    "class_id",
                                                    selected ? selected.value : ""
                                                )
                                            }
                                            options={classOptions}
                                            placeholder="Pilih kelas"
                                            required
                                        />
                                    )}
                                    <Input.Error message={errors.class_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="subject_id" value="Mata Pelajaran" />
                                    {selectedSubjectId ? (
                                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                            {subjects.find(
                                                (s) => s.id === selectedSubjectId
                                            )?.name || "Mata pelajaran terpilih"}
                                        </div>
                                    ) : (
                                        <Select2
                                            id="subject_id"
                                            value={selectedSubject}
                                            onChange={(selected) =>
                                                setData(
                                                    "subject_id",
                                                    selected ? selected.value : ""
                                                )
                                            }
                                            options={subjectOptions}
                                            placeholder="Pilih mata pelajaran"
                                            required
                                        />
                                    )}
                                    <Input.Error message={errors.subject_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="type" value="Tipe Kuis" />
                                    <Select2
                                        id="type"
                                        value={typeOptions.find(
                                            (t) => t.value === data.type
                                        )}
                                        onChange={(selected) =>
                                            setData(
                                                "type",
                                                selected
                                                    ? selected.value
                                                    : "multiple_choice"
                                            )
                                        }
                                        options={typeOptions}
                                        placeholder="Pilih tipe kuis"
                                    />
                                    <Input.Error message={errors.type} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="duration" value="Durasi (Menit)" />
                                    <Input.Number
                                        id="duration"
                                        value={data.duration}
                                        onChange={(e) =>
                                            setData("duration", e.target.value)
                                        }
                                        placeholder="60"
                                        min="1"
                                        required
                                    />
                                    <Input.Error message={errors.time_limit} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="total_questions" value="Jumlah Soal" />
                                    <Input.Number
                                        id="total_questions"
                                        value={data.total_questions}
                                        onChange={(e) =>
                                            setData("total_questions", e.target.value)
                                        }
                                        placeholder="20"
                                        min="1"
                                    />
                                    <Input.Error message={errors.total_questions} />
                                </div>

                                <div>
                                    <Input.Label
                                        htmlFor="passing_score"
                                        value="Nilai Kelulusan (%)"
                                    />
                                    <Input.Number
                                        id="passing_score"
                                        value={data.passing_score}
                                        onChange={(e) =>
                                            setData("passing_score", e.target.value)
                                        }
                                        placeholder="70"
                                        min="0"
                                        max="100"
                                        required
                                    />
                                    <Input.Error message={errors.passing_score} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="max_attempts" value="Maksimal Percobaan" />
                                    <Input.Number
                                        id="max_attempts"
                                        value={data.max_attempts}
                                        onChange={(e) =>
                                            setData("max_attempts", e.target.value)
                                        }
                                        placeholder="3"
                                        min="1"
                                        required
                                    />
                                    <Input.Error message={errors.max_attempts} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label
                                        htmlFor="start_datetime"
                                        value="Mulai pengerjaan (tanggal & jam)"
                                    />
                                    <Input.DateTimeLocal
                                        id="start_datetime"
                                        value={data.start_datetime}
                                        onChange={(e) =>
                                            setData(
                                                "start_datetime",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                    <p className="mt-1 text-xs text-stone-500">
                                        Waktu mengikuti zona waktu perangkat
                                        Anda; disimpan sesuai pengaturan server.
                                    </p>
                                    <Input.Error message={errors.start_time} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label
                                        htmlFor="end_datetime"
                                        value="Selesai pengerjaan (tanggal & jam)"
                                    />
                                    <Input.DateTimeLocal
                                        id="end_datetime"
                                        value={data.end_datetime}
                                        onChange={(e) =>
                                            setData(
                                                "end_datetime",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                    <Input.Error message={errors.end_time} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="description" value="Deskripsi Kuis" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData("description", e.target.value)
                                        }
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Jelaskan tentang kuis ini"
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label
                                        htmlFor="instructions"
                                        value="Instruksi untuk Siswa (Opsional)"
                                    />
                                    <textarea
                                        id="instructions"
                                        value={data.instructions}
                                        onChange={(e) =>
                                            setData("instructions", e.target.value)
                                        }
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Instruksi khusus untuk mengerjakan kuis"
                                    />
                                    <Input.Error message={errors.instructions} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label value="Pengaturan Kuis" />
                                    <div className="mt-2 space-y-3">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.shuffle_questions}
                                                    onChange={(e) =>
                                                        setData(
                                                            "shuffle_questions",
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">
                                                    Acak urutan soal
                                                </span>
                                            </label>

                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.shuffle_answers}
                                                    onChange={(e) =>
                                                        setData(
                                                            "shuffle_answers",
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">
                                                    Acak urutan jawaban
                                                </span>
                                            </label>

                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.show_results}
                                                    onChange={(e) =>
                                                        setData(
                                                            "show_results",
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">
                                                    Tampilkan hasil setelah selesai
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="status" value="Status Publikasi" />
                                    <Select2
                                        id="status"
                                        value={statusOptions.find(
                                            (s) => s.value === data.status
                                        )}
                                        onChange={(selected) =>
                                            setData(
                                                "status",
                                                selected ? selected.value : "draft"
                                            )
                                        }
                                        options={statusOptions}
                                        placeholder="Pilih status"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {data.status === "draft"
                                            ? "Kuis akan disimpan sebagai draf dan belum dapat diakses siswa"
                                            : "Kuis akan langsung dipublikasikan dan dapat diakses siswa"}
                                    </p>
                                    <Input.Error message={errors.status} />
                                </div>
                            </div>
                        </Card.Content>

                        <Card.Footer>
                            <div className="flex justify-end gap-3">
                                <Button type="cancel" url={route("quizzes.index")} />
                                <Button
                                    type="submit"
                                    processing={processing}
                                    disabled={processing}
                                >
                                    {data.status === "published"
                                        ? "Publikasikan Kuis"
                                        : "Simpan sebagai Draft"}
                                </Button>
                            </div>
                        </Card.Footer>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}
