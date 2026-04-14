import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";

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
        due_date: "",
        due_time: "",
        priority: "medium",
        instructions: "",
        max_score: "",
        allow_late_submission: false,
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
        const dueTime =
            raw.due_time && raw.due_time.length === 5
                ? `${raw.due_time}:00`
                : raw.due_time;
        const dueDate =
            raw.due_date && dueTime
                ? `${raw.due_date} ${dueTime}`
                : raw.due_date;

        return {
            title: raw.title,
            description: raw.description,
            class_id: classId,
            subject_id: subjectId,
            due_date: dueDate,
            max_score:
                raw.max_score === "" || raw.max_score === null
                    ? null
                    : Number(raw.max_score),
            instructions: raw.instructions || null,
            is_active: raw.status === "published",
        };
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("tasks.store"));
    };

    const classOptions = classes.map((cls) => ({
        value: cls.id,
        label: cls.name,
    }));

    const subjectOptions = subjects.map((subject) => ({
        value: subject.id,
        label: subject.name,
    }));

    const priorityOptions = [
        { value: "low", label: "Rendah" },
        { value: "medium", label: "Sedang" },
        { value: "high", label: "Tinggi" },
    ];

    const statusOptions = [
        { value: "draft", label: "Draft (Simpan sebagai draf)" },
        { value: "published", label: "Publikasikan (Langsung terbit)" },
    ];

    const selectedClass = data.class_id
        ? classOptions.find((c) => c.value === data.class_id) ?? null
        : null;
    const selectedSubject = data.subject_id
        ? subjectOptions.find((s) => s.value === data.subject_id) ?? null
        : null;

    return (
        <DashboardLayout title="Buat Tugas Baru">
            <Head title="Buat Tugas Baru" />

            <div className="mx-auto max-w-4xl">
                <Card>
                    <Card.Header>
                        <Card.Title>Buat Tugas Baru</Card.Title>
                        <Card.Description>
                            Buat tugas baru untuk siswa dengan deadline dan kriteria
                            penilaian
                        </Card.Description>
                    </Card.Header>

                    <form onSubmit={handleSubmit}>
                        <Card.Content>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="title" value="Judul Tugas" />
                                    <Input.Text
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        placeholder="Masukkan judul tugas"
                                        required
                                    />
                                    <Input.Error message={errors.title} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="class_id" value="Kelas" />
                                    {selectedClassId ? (
                                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                            {classes.find(
                                                (schoolClass) =>
                                                    schoolClass.id === selectedClassId
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
                                                (subject) =>
                                                    subject.id === selectedSubjectId
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
                                    <Input.Label htmlFor="due_date" value="Tanggal Deadline" />
                                    <Input.Date
                                        id="due_date"
                                        value={data.due_date}
                                        onChange={(e) =>
                                            setData("due_date", e.target.value)
                                        }
                                        min={new Date().toISOString().split("T")[0]}
                                        required
                                    />
                                    <Input.Error message={errors.due_date} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="due_time" value="Waktu Deadline" />
                                    <Input.Time
                                        id="due_time"
                                        value={data.due_time}
                                        onChange={(e) =>
                                            setData("due_time", e.target.value)
                                        }
                                        required
                                    />
                                    <Input.Error message={errors.due_time} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="priority" value="Prioritas" />
                                    <Select2
                                        id="priority"
                                        value={priorityOptions.find(
                                            (p) => p.value === data.priority
                                        )}
                                        onChange={(selected) =>
                                            setData(
                                                "priority",
                                                selected ? selected.value : "medium"
                                            )
                                        }
                                        options={priorityOptions}
                                        placeholder="Pilih prioritas"
                                    />
                                    <Input.Error message={errors.priority} />
                                </div>

                                <div>
                                    <Input.Label
                                        htmlFor="max_score"
                                        value="Nilai Maksimal (Opsional)"
                                    />
                                    <Input.Number
                                        id="max_score"
                                        value={data.max_score}
                                        onChange={(e) =>
                                            setData("max_score", e.target.value)
                                        }
                                        placeholder="100"
                                        min="0"
                                        max="100"
                                    />
                                    <Input.Error message={errors.max_score} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="description" value="Deskripsi Tugas" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData("description", e.target.value)
                                        }
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Jelaskan tugas yang harus dikerjakan siswa"
                                        required
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label
                                        htmlFor="instructions"
                                        value="Instruksi Lengkap (Opsional)"
                                    />
                                    <textarea
                                        id="instructions"
                                        value={data.instructions}
                                        onChange={(e) =>
                                            setData("instructions", e.target.value)
                                        }
                                        rows={6}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Instruksi detail, langkah-langkah, atau panduan pengerjaan tugas"
                                    />
                                    <Input.Error message={errors.instructions} />
                                </div>

                                <div>
                                    <Input.Label
                                        htmlFor="allow_late_submission"
                                        value="Pengaturan Tugas"
                                    />
                                    <div className="mt-2 space-y-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.allow_late_submission}
                                                onChange={(e) =>
                                                    setData(
                                                        "allow_late_submission",
                                                        e.target.checked
                                                    )
                                                }
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">
                                                Izinkan keterlambatan pengumpulan
                                            </span>
                                        </label>
                                    </div>
                                    <Input.Error message={errors.allow_late_submission} />
                                </div>

                                <div>
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
                                            ? "Tugas akan disimpan sebagai draf dan belum dapat diakses siswa"
                                            : "Tugas akan langsung dipublikasikan dan dapat diakses siswa"}
                                    </p>
                                    <Input.Error message={errors.status} />
                                </div>
                            </div>
                        </Card.Content>

                        <Card.Footer>
                            <div className="flex justify-end gap-3">
                                <Button type="cancel" url={route("tasks.index")} />
                                <Button
                                    type="submit"
                                    processing={processing}
                                    disabled={processing}
                                >
                                    {data.status === "published"
                                        ? "Publikasikan Tugas"
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
