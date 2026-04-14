import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Card from "@/Components/Card";
import Select2 from "@/Components/Select2";
import { Head, useForm, usePage } from "@inertiajs/react";
import hasAnyPermission from "@/Utils/Permissions";

export default function Edit() {
    const { subject, teachers } = usePage().props;

    // Get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const classSubjectId = urlParams.get('class_subject_id');

    const { data, setData, put, processing, errors } = useForm({
        name: subject.name || '',
        code: subject.code || '',
        description: subject.description || '',
        teacher_id: subject.teacher_id || null,
        is_active: subject.is_active || false,
    });

    const selectedTeacher = data.teacher_id
        ? teachers.find((teacher) => teacher.id === data.teacher_id)
        : null;

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('subjects.update', subject.id));
    };

    // Build cancel URL with class context if available
    const cancelUrl = classSubjectId
        ? `${route('subjects.show', subject.id)}?class_subject_id=${classSubjectId}`
        : route('subjects.show', subject.id);

    return (
        <DashboardLayout title="Edit Mata Pelajaran">
            <Head title="Edit Mata Pelajaran" />

            <div className="max-w-2xl mx-auto">
                <Card>
                    <Card.Header>
                        <Card.Title>Edit Mata Pelajaran: {subject.name}</Card.Title>
                        <Card.Description>
                            Perbarui informasi mata pelajaran sesuai kebutuhan
                        </Card.Description>
                    </Card.Header>

                    <form onSubmit={handleSubmit}>
                        <Card.Content>
                            <div className="space-y-6">
                                <div>
                                    <Input.Label htmlFor="name" value="Nama Mata Pelajaran" />
                                    <Input.Text
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama mata pelajaran"
                                        required
                                    />
                                    <Input.Error message={errors.name} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="code" value="Kode Mata Pelajaran (Opsional)" />
                                    <Input.Text
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="MTK, IPA, IPS, dll."
                                    />
                                    <Input.Error message={errors.code} />
                                </div>

                                <div>
                                    <Input.Label value="Guru Pengampu (Opsional)" />
                                    <Select2
                                        name="teacher_id"
                                        isClearable={true}
                                        options={teachers.map(teacher => ({
                                            value: teacher.id,
                                            label: `${teacher.name} (${teacher.email})`
                                        }))}
                                        value={selectedTeacher ? {
                                            value: selectedTeacher.id,
                                            label: `${selectedTeacher.name} (${selectedTeacher.email})`
                                        } : null}
                                        onChange={(selected) => setData('teacher_id', selected ? selected.value : null)}
                                        placeholder="Pilih guru pengampu..."
                                    />
                                    <Input.Error message={errors.teacher_id} />
                                </div>

                                <div>
                                    <Input.Label htmlFor="description" value="Deskripsi (Opsional)" />
                                    <textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={4}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        placeholder="Masukkan deskripsi mata pelajaran"
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
                                                onChange={(e) => setData('is_active', e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-600">Aktif</span>
                                        </label>
                                    </div>
                                    <Input.Error message={errors.is_active} />
                                </div>
                            </div>
                        </Card.Content>

                        <Card.Footer>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="cancel"
                                    url={cancelUrl}
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