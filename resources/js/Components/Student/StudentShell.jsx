import clsx from "clsx";

/**
 * Hero + spacing for halaman siswa (gaya LMS modern).
 */
export default function StudentShell({
    eyebrow = "Area siswa",
    title,
    subtitle,
    children,
    className,
}) {
    return (
        <div className={clsx("space-y-8", className)}>
            <div
                className={clsx(
                    "relative overflow-hidden rounded-2xl p-8 shadow-xl shadow-indigo-950/10",
                    "bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-600",
                    "ring-1 ring-white/10"
                )}
            >
                <div
                    className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-cyan-400/25 blur-2xl"
                    aria-hidden
                />
                <div className="relative">
                    {eyebrow ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
                            {eyebrow}
                        </p>
                    ) : null}
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {title}
                    </h1>
                    {subtitle ? (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-indigo-100/95">
                            {subtitle}
                        </p>
                    ) : null}
                </div>
            </div>
            {children}
        </div>
    );
}

export function formatStudentDateTime(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    } catch {
        return "—";
    }
}

export function formatStudentDate(iso) {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}
