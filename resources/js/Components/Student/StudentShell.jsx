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
                    "relative overflow-hidden rounded-2xl p-8 shadow-xl shadow-[rgba(20,96,190,0.3)]",
                    "bg-gradient-to-br from-[#154497] via-[#1460BE] to-[#1E6FDB]",
                    "ring-1 ring-[rgba(96,165,250,0.2)]"
                )}
            >
                <div
                    className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
                    aria-hidden
                />
                <div
                    className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-[#60A5FA]/25 blur-2xl"
                    aria-hidden
                />
                <div className="relative">
                    {eyebrow ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B6D4FF]">
                            {eyebrow}
                        </p>
                    ) : null}
                    <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {title}
                    </h1>
                    {subtitle ? (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#CBD5E1]/95">
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
        const parsed = new Date(iso);
        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }

        return parsed.toLocaleString("id-ID", {
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
        const parsed = new Date(iso);
        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }

        return parsed.toLocaleDateString("id-ID", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}
