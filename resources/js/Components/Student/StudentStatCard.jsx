import clsx from "clsx";

const accents = {
    indigo: "from-indigo-500 to-violet-600 shadow-indigo-500/30",
    emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
    amber: "from-amber-500 to-orange-600 shadow-amber-500/30",
    rose: "from-rose-500 to-pink-600 shadow-rose-500/30",
    cyan: "from-cyan-500 to-blue-600 shadow-cyan-500/30",
};

export default function StudentStatCard({
    icon: Icon,
    label,
    value,
    hint,
    accent = "indigo",
}) {
    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6",
                "shadow-sm transition hover:border-indigo-200/80 hover:shadow-md"
            )}
        >
            <div
                className={clsx(
                    "absolute right-4 top-4 flex rounded-xl bg-gradient-to-br p-2.5 text-white shadow-lg",
                    accents[accent] ?? accents.indigo
                )}
            >
                {Icon ? <Icon className="h-5 w-5" stroke={1.5} /> : null}
            </div>
            <p className="pr-14 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {label}
            </p>
            <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
                {value}
            </p>
            {hint ? (
                <p className="mt-1 text-sm leading-snug text-slate-500">{hint}</p>
            ) : null}
        </div>
    );
}
