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

export default function Edit() {
    const { task, classes, subjects } = usePage().props;

    const dueDate = task.due_date ? new Date(task.due_date) : new Date();
    const dueDateString = dueDate.toISOString().split("T")[0];
    const dueTimeString = dueDate.toTimeString().slice(0, 5);

    const { data, setData, put, processing, errors, transform } = useForm({
        title: task.title || "",
        description: task.description || "",
        class_id: task.class_id || "",
        subject_id: task.subject_id || "",
        due_date: dueDateString,
        due_time: dueTimeString,
        priority: task.priority || "medium",
        instructions: task.instructions || "",
        max_score: task.max_score ?? "",
        allow_late_submission: task.allow_late_submission || false,
        status: task.is_active ? "published" : "draft",
        _method: "PUT",
    });

    transform((raw) => {
        const classId = pickId(raw.class_id);
        const subjectId = pickId(raw.subject_id);
        const dueTime =
            raw.due_time && raw.due_time.length === 5
                ? `${raw.due_time}:00`
                : raw.due_time;
        const dueDateVal =
            raw.due_date && dueTime ? `${raw.due_date} ${dueTime}` : raw.due_date;

        return {
            title: raw.title,
            description: raw.description,
            class_id: classId,
            subject_id: subjectId,
            due_date: dueDateVal,
            max_score:
                raw.max_score === "" || raw.max_score === null
                    ? null
                    : Number(raw.max_score),
            instructions: raw.instructions || null,
            is_active: raw.status === "published",
            _method: "PUT",
        };
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("tasks.update", task.id));
    };

    const classOptions = classes.map((cls) => ({
        value: cls.id,
        label: cls.name,
    }));

    const subjectOptions = subjects.map((subject) => ({
        value: subject.id,
        label: subject.name,
    }));

    const selectedClass = data.class_id
        ? classOptions.find((c) => c.value === data.class_id) ?? null
        : null;
    const selectedSubject = data.subject_id
        ? subjectOptions.find((s) => s.value === data.subject_id) ?? null
        : null;

    const priorityOptions = [
        { value: 'low', label: 'Rendah' },
        { value: 'medium', label: 'Sedang' },
        { value: 'high', label: 'Tinggi' },
    ];

    const statusOptions = [
        { value: 'draft', label: 'Draft (Simpan sebagai draf)' },
        { value: 'published', label: 'Publikasikan (Langsung terbit)' },
        { value: 'closed', label: 'Tutup (Tidak menerima submission lagi)' },
    ];

    return (
        <DashboardLayout title="Edit Tugas">
            <Head title="Edit Tugas" />

            <div className="max-w-4xl mx-auto">
                <Card>
                    <Card.Header>
                        <Card.Title>Edit Tugas: {task.title}</Card.Title>
                        <Card.Description>
                            Perbarui informasi tugas sesuai kebutuhan
                        </Card.Description>
                    </Card.Header>

                    <form onSubmit={handleSubmit}>
                        <Card.Content>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="title" value="Judul Tugas" />
                                    <Input.Text
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Masukkan judul tugas"
                                        required
                                    />
                                    <Input.Error message={errors.title} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="class_id" value="Kelas" />
                                    <Select2
                                        id="class_id"
                                        value={selectedClass}
                                        onChange={(selected) =>
                                            setData("class_id", selected ? selected.value : "")
                                        }
                                        options={classOptions}
                                        placeholder="Pilih kelas"
                                        required
                                    />
                                    <Input.Error message={errors.class_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="subject_id" value="Mata Pelajaran" />
                                    <Select2
                                        id="subject_id"
                                        value={selectedSubject}
                                        onChange={(selected) =>
                                            setData("subject_id", selected ? selected.value : "")
                                        }
                                        options={subjectOptions}
                                        placeholder="Pilih mata pelajaran"
                                        required
                                    />
                                    <Input.Error message={errors.subject_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="due_date" value="Tanggal Deadline" />
                                    <Input.Date
                                        id="due_date"
                                        value={data.due_date}
                                        onChange={(e) => setData('due_date', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                    <Input.Error message={errors.due_date} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="due_time" value="Waktu Deadline" />
                                    <Input.Time
                                        id="due_time"
                                        value={data.due_time}
                                        onChange={(e) => setData('due_time', e.target.value)}
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
                                    <Input.Label htmlFor="max_score" value="Nilai Maksimal (Opsional)" />
                                    <Input.Number
                                        id="max_score"
                                        value={data.max_score}
                                        onChange={(e) => setData('max_score', e.target.value)}
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
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="Jelaskan tugas yang harus dikerjakan siswa"
                                        required
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="instructions" value="Instruksi Lengkap (Opsional)" />
                                    <textarea
                                        id="instructions"
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        rows={6}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="Instruksi detail, langkah-langkah, atau panduan pengerjaan tugas"
                                    />
                                    <Input.Error message={errors.instructions} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="allow_late_submission" value="Pengaturan Tugas" />
                                    <div className="mt-2 space-y-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.allow_late_submission}
                                                onChange={(e) => setData('allow_late_submission', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Izinkan keterlambatan pengumpulan</span>
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.status === 'draft' && 'Tugas akan disimpan sebagai draf dan belum dapat diakses siswa'}
                                        {data.status === 'published' && 'Tugas akan dipublikasikan dan dapat diakses siswa'}
                                        {data.status === 'closed' && 'Tugas akan ditutup dan tidak menerima submission baru'}
                                    </p>
                                    <Input.Error message={errors.status} />
                                </div>
                            </div>
                        </Card.Content>

                        <Card.Footer>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="cancel"
                                    url={route('tasks.show', task.id)}
                                />
                                <Button
                                    type="submit"
                                    processing={processing}
                                    disabled={processing}
                                >
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </Card.Footer>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
}