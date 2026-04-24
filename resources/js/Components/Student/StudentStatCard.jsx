import clsx from "clsx";

const lightBlueAccents = {
    primary: "border-sky-300/80 bg-sky-100/80",
    secondary: "border-cyan-300/80 bg-cyan-100/80", 
    accent: "border-blue-300/80 bg-blue-100/80",
    ocean: "border-indigo-300/80 bg-indigo-100/80",
    sky: "border-teal-300/80 bg-teal-100/80",
    emerald: "border-emerald-300/80 bg-emerald-100/80",
};

export default function StudentStatCard({
    icon: Icon,
    label,
    value,
    hint,
    accent = "primary",
}) {
    return (
        <div
            className={clsx(
                "group rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md",
                lightBlueAccents[accent] ?? lightBlueAccents.primary
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    {label}
                </p>
                {Icon ? (
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-300/80 transition-colors duration-200 group-hover:bg-slate-900 group-hover:text-white">
                        <Icon className="h-4 w-4" stroke={1.7} />
                    </span>
                ) : null}
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
                {value}
            </p>
            {hint ? (
                <p className="mt-1 text-sm text-slate-500">{hint}</p>
            ) : null}
        </div>
    );
}
