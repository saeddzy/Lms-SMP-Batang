import clsx from "clsx";

/**
 * Sakelar aktif/nonaktif dengan animasi (untuk kelas, tugas, kuis, ujian).
 */
export default function ToggleSwitch({
    checked,
    onChange,
    disabled = false,
    label,
    description,
    activeLabel = "Aktif",
    inactiveLabel = "Nonaktif",
}) {
    return (
        <div
            className={clsx(
                "flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm ring-1 ring-slate-100/80",
                disabled && "opacity-60"
            )}
        >
            <div className="min-w-0 flex-1">
                {label ? (
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                ) : null}
                {description ? (
                    <p className="mt-0.5 text-xs text-slate-600">{description}</p>
                ) : null}
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    disabled={disabled}
                    onClick={() => !disabled && onChange?.(!checked)}
                    className={clsx(
                        "relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
                        checked
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-inner"
                            : "bg-slate-300"
                    )}
                >
                    <span
                        className={clsx(
                            "absolute top-1 left-1 inline-block h-6 w-6 rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-300 ease-out",
                            checked ? "translate-x-7" : "translate-x-0"
                        )}
                    />
                </button>
                <span
                    className={clsx(
                        "min-w-[5.5rem] text-right text-xs font-bold uppercase tracking-wide",
                        checked ? "text-emerald-700" : "text-slate-500"
                    )}
                >
                    {checked ? activeLabel : inactiveLabel}
                </span>
            </div>
        </div>
    );
}
