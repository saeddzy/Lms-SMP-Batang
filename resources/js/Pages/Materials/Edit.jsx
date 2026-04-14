import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function Edit() {
    const { material, subjects = [], classes = [] } = usePage().props;

    const initialVideoUrl =
        material.material_type === "video" &&
        material.file_path &&
        (material.is_remote_url ||
            String(material.file_path).startsWith("http://") ||
            String(material.file_path).startsWith("https://"))
            ? material.file_path
            : "";

    const { data, setData, post, processing, errors, progress } = useForm({
        title: material.title || "",
        description: material.description || "",
        class_id: material.class_id || "",
        subject_id: material.subject_id || "",
        material_type: material.material_type || "pdf",
        file: null,
        video_url: initialVideoUrl,
        is_active: Boolean(material.is_active),
        _method: "PUT",
    });

    const [filePreview, setFilePreview] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("materials.update", material.id));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("file", file);
            setFilePreview(file.name);
        }
    };

    const subjectOptions = subjects.map((subject) => ({
        value: subject.id,
        label: subject.name,
    }));

    const classOptions = classes.map((klass) => ({
        value: klass.id,
        label: klass.name,
    }));

    const materialTypeOptions = [
        { value: "pdf", label: "File PDF" },
        { value: "video", label: "Video" },
    ];

    const selectedClass = data.class_id
        ? classOptions.find((c) => c.value === data.class_id) ?? null
        : null;
    const selectedSubject = data.subject_id
        ? subjectOptions.find((s) => s.value === data.subject_id) ?? null
        : null;
    const selectedMaterialType =
        materialTypeOptions.find((t) => t.value === data.material_type) ||
        materialTypeOptions[0];

    return (
        <DashboardLayout title="Edit Materi Pembelajaran">
            <Head title="Edit Materi Pembelajaran" />

            <div className="mx-auto max-w-4xl">
                <Card>
                    <Card.Header>
                        <Card.Title>Edit Materi: {material.title}</Card.Title>
                        <Card.Description>
                            Perbarui informasi materi pembelajaran
                        </Card.Description>
                    </Card.Header>

                    <form onSubmit={handleSubmit}>
                        <Card.Content>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="title" value="Judul Materi" />
                                    <Input.Text
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData("title", e.target.value)}
                                        placeholder="Masukkan judul materi"
                                        required
                                    />
                                    <Input.Error message={errors.title} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="class_id" value="Kelas" />
                                    <Select2
                                        id="class_id"
                                        options={classOptions}
                                        value={selectedClass}
                                        onChange={(selected) =>
                                            setData("class_id", selected ? selected.value : "")
                                        }
                                        placeholder="Pilih kelas"
                                    />
                                    <Input.Error message={errors.class_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="subject_id" value="Mata Pelajaran" />
                                    <Select2
                                        id="subject_id"
                                        options={subjectOptions}
                                        value={selectedSubject}
                                        onChange={(selected) =>
                                            setData(
                                                "subject_id",
                                                selected ? selected.value : ""
                                            )
                                        }
                                        placeholder="Pilih mata pelajaran"
                                    />
                                    <Input.Error message={errors.subject_id} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="material_type" value="Tipe Materi" />
                                    <Select2
                                        id="material_type"
                                        options={materialTypeOptions}
                                        value={selectedMaterialType}
                                        onChange={(selected) =>
                                            setData(
                                                "material_type",
                                                selected ? selected.value : "pdf"
                                            )
                                        }
                                        placeholder="Pilih tipe materi"
                                    />
                                    <Input.Error message={errors.material_type} />
                                </div>

                                <div className="md:col-span-2">
                                    {data.material_type === "pdf" && (
                                        <>
                                            <Input.Label
                                                htmlFor="file"
                                                value="Ganti file PDF (opsional)"
                                            />
                                            <input
                                                id="file"
                                                type="file"
                                                onChange={handleFileChange}
                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                                accept=".pdf"
                                            />
                                            <p className="mt-1 text-xs text-stone-500">
                                                Kosongkan jika tidak mengganti file. Berkas
                                                saat ini:{" "}
                                                <span className="font-medium">
                                                    {material.file_name || "—"}
                                                </span>
                                            </p>
                                        </>
                                    )}

                                    {data.material_type === "video" && (
                                        <>
                                            <Input.Label
                                                htmlFor="file"
                                                value="Ganti file video atau URL"
                                            />
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-sm text-gray-600">
                                                        Unggah file video (MP4, AVI, MOV)
                                                    </label>
                                                    <input
                                                        id="file"
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                                        accept=".mp4,.avi,.mov,.wmv"
                                                    />
                                                    {filePreview && (
                                                        <p className="mt-2 text-sm text-gray-600">
                                                            File baru: {filePreview}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-center text-sm text-gray-500">
                                                    atau
                                                </div>
                                                <div>
                                                    <Input.Label
                                                        htmlFor="video_url"
                                                        value="URL video (YouTube, dll.)"
                                                    />
                                                    <Input.Text
                                                        id="video_url"
                                                        type="url"
                                                        value={data.video_url || ""}
                                                        onChange={(e) =>
                                                            setData("video_url", e.target.value)
                                                        }
                                                        placeholder="https://youtube.com/watch?v=..."
                                                    />
                                                    <p className="mt-1 text-xs text-stone-500">
                                                        Isi URL jika materi berupa tautan (mengganti
                                                        file lokal jika diisi).
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <Input.Error message={errors.file} />
                                </div>

                                <div className="md:col-span-2">
                                    <Input.Label htmlFor="description" value="Deskripsi (opsional)" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) =>
                                            setData("description", e.target.value)
                                        }
                                        rows={4}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        placeholder="Masukkan deskripsi materi"
                                    />
                                    <Input.Error message={errors.description} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="is_active" value="Status" />
                                    <div className="mt-2">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={data.is_active}
                                                onChange={(e) =>
                                                    setData("is_active", e.target.checked)
                                                }
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">
                                                Aktif (dapat diakses siswa sesuai aturan)
                                            </span>
                                        </label>
                                    </div>
                                    <Input.Error message={errors.is_active} />
                                </div>
                            </div>

                            {progress && (
                                <div className="mt-6">
                                    <div className="h-2 rounded-full bg-gray-200">
                                        <div
                                            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                            style={{
                                                width: `${typeof progress === "number" ? progress : progress.percentage ?? 0}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Mengunggah…{" "}
                                        {typeof progress === "number"
                                            ? progress
                                            : progress.percentage ?? 0}
                                        %
                                    </p>
                                </div>
                            )}
                        </Card.Content>

                        <Card.Footer>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="cancel"
                                    url={route("materials.show", material.id)}
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
