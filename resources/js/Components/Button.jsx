import { Link, useForm } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconCheck,
    IconEye,
    IconPencil,
    IconPlus,
    IconTrash,
} from "@tabler/icons-react";
import React from "react";
import Swal from "sweetalert2";
import clsx from "clsx";

const baseIcon = "h-4 w-4 shrink-0";

export default function Button({
    type,
    url,
    className,
    children,
    label,
    text,
    ...props
}) {
    const { delete: destroy } = useForm();

    const addLabel = text ?? label ?? children ?? "Tambah data";
    const viewLabel = text ?? label ?? children ?? "Lihat";

    const handleDeleteData = async (deleteUrl) => {
        Swal.fire({
            title: "Hapus data ini?",
            text: "Data tidak dapat dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1c1917",
            cancelButtonColor: "#78716c",
            confirmButtonText: "Ya, hapus",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(deleteUrl);

                Swal.fire({
                    title: "Terhapus",
                    text: "Data berhasil dihapus.",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    const btnClass = clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors",
        className
    );

    return (
        <>
            {type === "add" && (
                <Link
                    href={url}
                    className={clsx(
                        btnClass,
                        "bg-[#163d8f] px-4 py-2.5 text-white shadow-sm hover:bg-[#0f2e6f]",
                        className
                    )}
                >
                    <IconPlus className={baseIcon} strokeWidth={1.5} />
                    <span className="hidden sm:inline">{addLabel}</span>
                </Link>
            )}
            {type === "modal" && (
                <button
                    {...props}
                    type="button"
                    className={clsx(
                        "inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-50",
                        className
                    )}
                >
                    {children}
                </button>
            )}
            {type === "submit" && (
                <button
                    type="submit"
                    className={clsx(
                        btnClass,
                        "bg-[#163d8f] px-4 py-2.5 text-white shadow-sm hover:bg-[#0f2e6f]",
                        className
                    )}
                >
                    <IconCheck className={baseIcon} strokeWidth={1.5} />
                    Simpan
                </button>
            )}
            {type === "cancel" && (
                <Link
                    href={url}
                    className={clsx(
                        btnClass,
                        "border border-stone-200 bg-white px-4 py-2.5 text-stone-600 hover:bg-stone-50",
                        className
                    )}
                >
                    <IconArrowLeft className={baseIcon} strokeWidth={1.5} />
                    Kembali
                </Link>
            )}
            {type === "edit" && (
                <Link
                    href={url}
                    className={clsx(
                        btnClass,
                        "h-9 w-9 border border-stone-200 bg-white p-0 text-stone-600 hover:bg-stone-50 hover:text-stone-900 sm:h-10 sm:w-10",
                        className
                    )}
                    title="Ubah"
                >
                    <IconPencil className={baseIcon} strokeWidth={1.5} />
                </Link>
            )}
            {type === "view" && (
                <Link
                    href={url}
                    className={clsx(
                        text || label || children
                            ? "inline-flex items-center justify-center gap-2 rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-900"
                            : clsx(
                                  btnClass,
                                  "h-9 w-9 border border-stone-200 bg-white p-0 text-stone-600 hover:bg-stone-50 hover:text-stone-900 sm:h-10 sm:w-10"
                              ),
                        className
                    )}
                    title={viewLabel}
                >
                    {text || label || children ? (
                        <span>{viewLabel}</span>
                    ) : (
                        <IconEye className={baseIcon} strokeWidth={1.5} />
                    )}
                </Link>
            )}
            {type === "delete" && (
                <button
                    type="button"
                    onClick={() => handleDeleteData(url)}
                    className={clsx(
                        btnClass,
                        "h-9 w-9 border border-red-100 bg-red-50/80 p-0 text-red-600 hover:bg-red-100 sm:h-10 sm:w-10",
                        className
                    )}
                    title="Hapus"
                >
                    <IconTrash className={baseIcon} strokeWidth={1.5} />
                </button>
            )}
        </>
    );
}
