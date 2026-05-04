import React, { useEffect, useId, useMemo, useRef } from "react";
import Checkbox from "@/Components/Checkbox";
import Input from "@/Components/Input";

const checkboxClass =
    "h-4 w-4 rounded-md border-gray-200 bg-white text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 checked:bg-teal-500";

function flattenGroupedPermissions(permissions) {
    return Object.values(permissions).flat();
}

function TriStateCheckbox({ checked, indeterminate, onChange, id, ariaLabel }) {
    const ref = useRef(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = Boolean(indeterminate);
        }
    }, [indeterminate]);

    return (
        <input
            ref={ref}
            id={id}
            type="checkbox"
            className={checkboxClass}
            checked={checked}
            onChange={onChange}
            aria-label={ariaLabel}
        />
    );
}

/**
 * Hak akses role: pilih semua global, pilih semua per grup, dan daftar permission.
 *
 * @param {Record<string, string[]>} permissions
 * @param {string[]} selectedPermissions
 * @param {(next: string[]) => void} onChange — mengganti seluruh daftar permission terpilih
 */
export default function RolePermissionsSection({
    permissions,
    selectedPermissions,
    onChange,
    errorMessage,
}) {
    const baseId = useId();

    const allNames = useMemo(
        () => flattenGroupedPermissions(permissions),
        [permissions]
    );

    const total = allNames.length;
    const selectedSet = useMemo(
        () => new Set(selectedPermissions),
        [selectedPermissions]
    );

    const selectedCount = useMemo(
        () => allNames.filter((n) => selectedSet.has(n)).length,
        [allNames, selectedSet]
    );

    const allSelected = total > 0 && selectedCount === total;
    const someSelected = selectedCount > 0 && selectedCount < total;

    const handleToggleAll = (e) => {
        const checked = e.target.checked;
        onChange(checked ? [...allNames] : []);
    };

    const handleToggleGroup = (groupItems, checked) => {
        if (checked) {
            onChange([...new Set([...selectedPermissions, ...groupItems])]);
            return;
        }
        onChange(
            selectedPermissions.filter((p) => !groupItems.includes(p))
        );
    };

    const handleTogglePermission = (name, checked) => {
        if (checked) {
            if (selectedPermissions.includes(name)) return;
            onChange([...selectedPermissions, name]);
            return;
        }
        onChange(selectedPermissions.filter((p) => p !== name));
    };

    return (
        <section className="space-y-4 border-t border-slate-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hak Akses Permission
            </p>

            <div
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                role="group"
                aria-label="Pilih semua permission"
            >
                <div className="flex items-center gap-3">
                    <TriStateCheckbox
                        id={`${baseId}-select-all`}
                        ariaLabel="Pilih semua permission"
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={handleToggleAll}
                        disabled={total === 0}
                    />
                    <label
                        htmlFor={`${baseId}-select-all`}
                        className="cursor-pointer text-sm font-medium text-slate-800"
                    >
                        Pilih semua permission
                    </label>
                </div>
                <p className="text-xs text-slate-500 sm:text-right">
                    {total === 0
                        ? "Tidak ada permission terdaftar."
                        : `${selectedCount} dari ${total} dipilih`}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {Object.entries(permissions).map(([group, permissionItems]) => {
                    const gid = `${baseId}-group-${group}`;
                    const inGroup = permissionItems.filter((p) =>
                        selectedSet.has(p)
                    );
                    const gAll =
                        permissionItems.length > 0 &&
                        inGroup.length === permissionItems.length;
                    const gSome =
                        inGroup.length > 0 &&
                        inGroup.length < permissionItems.length;

                    return (
                        <div
                            key={group}
                            className="rounded-lg border border-slate-200 bg-slate-50/50 p-4"
                        >
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    {group}
                                </h3>
                                <div className="flex shrink-0 items-center gap-2">
                                    <TriStateCheckbox
                                        id={`${gid}-all`}
                                        ariaLabel={`Pilih semua permission pada grup ${group}`}
                                        checked={gAll}
                                        indeterminate={gSome}
                                        onChange={(e) =>
                                            handleToggleGroup(
                                                permissionItems,
                                                e.target.checked
                                            )
                                        }
                                        disabled={permissionItems.length === 0}
                                    />
                                    <label
                                        htmlFor={`${gid}-all`}
                                        className="cursor-pointer text-xs font-medium text-slate-600"
                                    >
                                        Semua di grup ini
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {permissionItems.map((permission) => (
                                    <Checkbox
                                        key={permission}
                                        label={permission}
                                        value={permission}
                                        checked={selectedPermissions.includes(
                                            permission
                                        )}
                                        onChange={(e) =>
                                            handleTogglePermission(
                                                permission,
                                                e.target.checked
                                            )
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            <Input.Error message={errorMessage} />
        </section>
    );
}

export { flattenGroupedPermissions };
