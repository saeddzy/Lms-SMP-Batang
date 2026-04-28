import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Checkbox from "@/Components/Checkbox";
import Swal from "sweetalert2";

export default function Edit() {
    const { permissions = [], role } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        name: role.name,
        selectedPermissions: role.permissions.map(
            (permission) => permission.name
        ),
        _method: "put",
    });

    const handleSelectedPermissions = (permissionName, checked) => {
        if (checked) {
            setData("selectedPermissions", (prev) =>
                prev.includes(permissionName) ? prev : [...prev, permissionName]
            );
            return;
        }

        setData("selectedPermissions", (prev) =>
            prev.filter((item) => item !== permissionName)
        );
    };

    const handleUpdatedata = async (e) => {
        e.preventDefault();

        post(route("roles.update", role.id), {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Data role berhasil diperbarui.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            },
        });
    };
    return (
        <DashboardLayout title="Edit Role">
            <Head title="Edit Role" />

            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Edit Role
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Perbarui nama role dan pengaturan permission akses.
                        </p>
                    </div>

                    <form onSubmit={handleUpdatedata} className="space-y-6 p-6">
                        <section className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Informasi Role
                            </p>
                            <div className="max-w-xl">
                                <Input.Label htmlFor="name" value="Nama Role" />
                                <Input.Text
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    placeholder="Contoh: wali-kelas"
                                    required
                                />
                                <Input.Error message={errors.name} />
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Hak Akses Permission
                            </p>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {Object.entries(permissions).map(([group, permissionItems]) => (
                                    <div
                                        key={group}
                                        className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                                    >
                                        <h3 className="mb-3 text-sm font-semibold text-slate-800">
                                            {group}
                                        </h3>
                                        <div className="space-y-2">
                                            {permissionItems.map((permission) => (
                                                <Checkbox
                                                    key={permission}
                                                    label={permission}
                                                    value={permission}
                                                    checked={data.selectedPermissions.includes(permission)}
                                                    onChange={(e) =>
                                                        handleSelectedPermissions(
                                                            permission,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Input.Error message={errors.selectedPermissions} />
                        </section>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button type="cancel" url={route("roles.index")} />
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
