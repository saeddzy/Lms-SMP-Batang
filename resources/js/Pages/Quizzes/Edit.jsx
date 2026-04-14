import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    datetimeLocalToLaravel,
    toDatetimeLocalValue,
} from "@/Utils/datetimeForm";

function pickId(v) {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "object" && v !== null && "value" in v) return v.value;
    return v;
}

export default function Edit() {
    const { quiz, classes, subjects } = usePage().props;

    const { data, setData, put, processing, errors, transform } = useForm({
        title: quiz.title || "",
        description: quiz.description || "",
        class_id: quiz.class_id || "",
        subject_id: quiz.subject_id || "",
        type: quiz.type || "multiple_choice",
        duration: quiz.time_limit ?? "",
        total_questions: quiz.total_questions ?? "",
        passing_score: quiz.passing_score ?? "",
        max_attempts: quiz.max_attempts ?? "",
        start_datetime: toDatetimeLocalValue(quiz.start_time),
        end_datetime: toDatetimeLocalValue(quiz.end_time),
        instructions: quiz.instructions || "",
        shuffle_questions: Boolean(quiz.is_randomized),
        shuffle_answers: false,
        show_results: Boolean(quiz.show_results),
        status: quiz.is_active ? "published" : "draft",
        _method: "PUT",
    });

    transform((raw) => {
        const classId = pickId(raw.class_id);
        const subjectId = pickId(raw.subject_id);
        const startT = datetimeLocalToLaravel(raw.start_datetime);
        const endT = datetimeLocalToLaravel(raw.end_datetime);

        return {
            title: raw.title,
            description: raw.description || null,
            class_id: classId,
            subject_id: subjectId,
            start_time: startT,
            end_time: endT,
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
            _method: "PUT",
        };
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("quizzes.update", quiz.id));
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

    const typeOptions = [
        { value: 'multiple_choice', label: 'Pilihan Ganda' },
        { value: 'true_false', label: 'Benar/Salah' },
        { value: 'essay', label: 'Esai' },
        { value: 'mixed', label: 'Campuran' },
    ];

    const statusOptions = [
        { value: 'draft', label: 'Draft (Simpan sebagai draf)' },
        { value: 'published', label: 'Publikasikan (Langsung tersedia)' },
        { value: 'closed', label: 'Tutup (Tidak menerima attempt lagi)' },
    ];

    return (
        <DashboardLayout title="Edit Kuis">
            <Head title="Edit Kuis" />

            <div className="max-w-4xl mx-auto">
                <Card>
                    <Card.Header>
                        <Card.Title>Edit Kuis: {quiz.title}</Card.Title>
                        <Card.Description>
                            Perbarui informasi kuis sesuai kebutuhan
                        </Card.Description>
                    </Card.Header>

                    <form onSubmit={handleSubmit}>
                        <Card.Content>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="title" value="Judul Kuis" />
                                    <Input.Text
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Masukkan judul kuis"
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
                                    <Input.Label htmlFor="type" value="Tipe Kuis" />
                                    <Select2
                                        id="type"
                                        value={typeOptions.find((t) => t.value === data.type)}
                                        onChange={(selected) =>
                                            setData(
                                                "type",
                                                selected ? selected.value : "multiple_choice"
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
                                        onChange={(e) => setData("duration", e.target.value)}
                                        placeholder="60"
                                        min="1"
                                    />
                                    <Input.Error message={errors.time_limit} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="total_questions" value="Jumlah Soal" />
                                    <Input.Number
                                        id="total_questions"
                                        value={data.total_questions}
                                        onChange={(e) => setData('total_questions', e.target.value)}
                                        placeholder="20"
                                        min="1"
                                    />
                                    <Input.Error message={errors.total_questions} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="passing_score" value="Nilai Kelulusan (%)" />
                                    <Input.Number
                                        id="passing_score"
                                        value={data.passing_score}
                                        onChange={(e) => setData('passing_score', e.target.value)}
                                        placeholder="70"
                                        min="0"
                                        max="100"
                                    />
                                    <Input.Error message={errors.passing_score} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="max_attempts" value="Maksimal Percobaan" />
                                    <Input.Number
                                        id="max_attempts"
                                        value={data.max_attempts}
                                        onChange={(e) => setData('max_attempts', e.target.value)}
                                        placeholder="3"
                                        min="1"
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
                                        Ditampilkan dalam jam lokal perangkat
                                        Anda.
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
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="Jelaskan tentang kuis ini"
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="instructions" value="Instruksi untuk Siswa (Opsional)" />
                                    <textarea
                                        id="instructions"
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="Instruksi khusus untuk mengerjakan kuis"
                                    />
                                    <Input.Error message={errors.instructions} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label value="Pengaturan Kuis" />
                                    <div className="mt-2 space-y-3">
                                        <div className="flex items-center space-x-4">
                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.shuffle_questions}
                                                    onChange={(e) => setData('shuffle_questions', e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Acak urutan soal</span>
                                            </label>

                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.shuffle_answers}
                                                    onChange={(e) => setData('shuffle_answers', e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Acak urutan jawaban</span>
                                            </label>

                                            <label className="inline-flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={data.show_results}
                                                    onChange={(e) => setData('show_results', e.target.checked)}
                                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                                />
                                                <span className="ml-2 text-sm text-gray-600">Tampilkan hasil setelah selesai</span>
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
                                    <p className="text-xs text-gray-500 mt-1">
                                        {data.status === 'draft' && 'Kuis akan disimpan sebagai draf dan belum dapat diakses siswa'}
                                        {data.status === 'published' && 'Kuis akan dipublikasikan dan dapat diakses siswa'}
                                        {data.status === 'closed' && 'Kuis akan ditutup dan tidak menerima attempt baru'}
                                    </p>
                                    <Input.Error message={errors.status} />
                                </div>
                            </div>
                        </Card.Content>

                        <Card.Footer>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="cancel"
                                    url={route('quizzes.show', quiz.id)}
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