import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Input";
import Button from "@/Components/Button";
import Select2 from "@/Components/Select2";
import Swal from "sweetalert2";

export default function Create() {
    const { roles = [] } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        name: "",
        nis: "",
        nip: "",
        email: "",
        selectedRoles: [],
        password: "",
        password_confirmation: "",
    });

    const formattedRoles = roles.map((role) => ({
        value: role.name,
        label: role.name,
    }));

    const selectedRoleOptions = data.selectedRoles
        .map((roleName) => formattedRoles.find((role) => role.value === roleName))
        .filter(Boolean);

    const handleSelectedRoles = (selected) => {
        const selectedValues = selected ? selected.map((option) => option.value) : [];
        setData("selectedRoles", selectedValues);
    };

    const handleStoreData = async (e) => {
        e.preventDefault();

        post(route("users.store"), {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "User berhasil dibuat.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            },
        });
    };

    return (
        <DashboardLayout title="Tambah User">
            <Head title="Tambah User" />

            <div className="mx-auto max-w-5xl">
                <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <div className="h-1 w-full bg-gradient-to-r from-[#163d8f] via-[#2453b8] to-[#5b84d9]" />
                    <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-5">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Tambah User Baru
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Buat akun pengguna dan tentukan role akses sistem LMS.
                        </p>
                    </div>

                    <form onSubmit={handleStoreData} className="space-y-6 p-6">
                        <section className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Informasi Akun
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Input.Label htmlFor="name" value="Nama" />
                                    <Input.Text
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Contoh: Ahmad Fauzi"
                                        required
                                    />
                                    <Input.Error message={errors.name} />
                                </div>

                                <div>
                                    <Input.Label
                                        htmlFor="email"
                                        value="Email (opsional)"
                                    />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="Untuk login atau reset password"
                                    />
                                    <Input.Error message={errors.email} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Input.Label htmlFor="nis" value="NIS (Nomor Induk Siswa)" />
                                    <Input
                                        id="nis"
                                        type="text"
                                        inputMode="numeric"
                                        value={data.nis}
                                        onChange={(e) => setData("nis", e.target.value)}
                                        placeholder="Wajib jika role memuat Siswa"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        Digunakan siswa untuk login (selain email).
                                    </p>
                                    <Input.Error message={errors.nis} />
                                </div>
                                <div>
                                    <Input.Label htmlFor="nip" value="NIP (Nomor Induk Pegawai)" />
                                    <Input
                                        id="nip"
                                        type="text"
                                        inputMode="numeric"
                                        value={data.nip}
                                        onChange={(e) => setData("nip", e.target.value)}
                                        placeholder="Wajib jika role Guru atau Admin"
                                    />
                                    <p className="mt-1 text-xs text-slate-500">
                                        Digunakan guru/admin untuk login (selain email).
                                    </p>
                                    <Input.Error message={errors.nip} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Hak Akses
                            </p>
                            <div>
                                <Input.Label htmlFor="selectedRoles" value="Role" />
                                <Select2
                                    id="selectedRoles"
                                    isMulti={true}
                                    isSearchable={true}
                                    value={selectedRoleOptions}
                                    onChange={handleSelectedRoles}
                                    options={formattedRoles}
                                    placeholder="Pilih role user..."
                                />
                                <Input.Error message={errors.selectedRoles} />
                            </div>
                        </section>

                        <section className="space-y-4 border-t border-slate-100 pt-6">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Keamanan
                            </p>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <Input.Label htmlFor="password" value="Password" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="Masukkan password"
                                        required
                                    />
                                    <Input.Error message={errors.password} />
                                </div>

                                <div>
                                    <Input.Label
                                        htmlFor="password_confirmation"
                                        value="Konfirmasi Password"
                                    />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData("password_confirmation", e.target.value)
                                        }
                                        placeholder="Ulangi password"
                                        required
                                    />
                                    <Input.Error message={errors.password_confirmation} />
                                </div>
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                            <Button type="cancel" url={route("users.index")} />
                            <Button
                                type="submit"
                                processing={processing}
                                disabled={processing}
                            >
                                Simpan
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
