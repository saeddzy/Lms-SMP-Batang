import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Swal from "sweetalert2";

export default function Edit() {
    const { permission } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        name: permission.name,
        _method: "put",
    });

    const handleUpdateData = async (e) => {
        e.preventDefault();

        post(route("permissions.update", permission.id), {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Permission berhasil diperbarui.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            },
        });
    };

    return (
        <DashboardLayout title="Edit Permission">
            <Head title="Edit Permission" />

            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Edit Permission
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Perbarui nama permission untuk pengaturan hak akses.
                        </p>
                    </div>

                    <form onSubmit={handleUpdateData} className="space-y-6 p-6">
                        <section className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Informasi Permission
                            </p>
                            <div className="max-w-xl">
                                <Input.Label
                                    htmlFor="name"
                                    value="Nama Permission"
                                />
                                <Input.Text
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="Contoh: users create"
                                    required
                                />
                                <Input.Error message={errors.name} />
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button type="cancel" url={route("permissions.index")} />
                            <Button
                                type="submit"
                                processing={processing}
                                disabled={processing}
                            >
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
