import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";

/**
 * Notifikasi singkat dari session flash (success / error / message).
 */
export default function FlashBanner() {
    const { flash = {} } = usePage().props;
    const text =
        flash.success ?? flash.error ?? flash.message ?? null;
    const tone = flash.error ? "error" : "success";

    const [visible, setVisible] = useState(Boolean(text));
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (!text) {
            setVisible(false);
            return undefined;
        }
        setVisible(true);
        setLeaving(false);
        const t = setTimeout(() => setLeaving(true), 4200);
        const t2 = setTimeout(() => setVisible(false), 4800);
        return () => {
            clearTimeout(t);
            clearTimeout(t2);
        };
    }, [text]);

    if (!visible || !text) {
        return null;
    }

    return (
        <div
            role="status"
            className={`pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4 transition-all duration-300 ${
                leaving ? "translate-y-[-8px] opacity-0" : "opacity-100"
            }`}
        >
            <div
                className={`pointer-events-auto flex max-w-lg items-center gap-3 rounded-2xl px-5 py-3.5 text-sm font-medium shadow-xl ring-1 ${
                    tone === "error"
                        ? "bg-rose-50 text-rose-950 ring-rose-200/90"
                        : "bg-emerald-50 text-emerald-950 ring-emerald-200/90"
                }`}
            >
                <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg ${
                        tone === "error"
                            ? "bg-rose-200/80 text-rose-900"
                            : "bg-emerald-200/80 text-emerald-900"
                    }`}
                >
                    {tone === "error" ? "!" : "✓"}
                </span>
                <span className="leading-snug">{text}</span>
            </div>
        </div>
    );
}
