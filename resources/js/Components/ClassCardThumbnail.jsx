import { useId } from "react";

/**
 * Thumbnail statis bergaya ilustrasi minimal modern (SVG, tanpa upload).
 * Variasi dipilih dari classId.
 */
export default function ClassCardThumbnail({ classId, className = "" }) {
    const uid = useId().replace(/:/g, "");
    const v = Math.abs(Number(classId) || 0) % 3;

    return (
        <div
            className={`relative h-36 w-full shrink-0 overflow-hidden bg-stone-100 ${className}`}
            aria-hidden
        >
            {v === 0 && <VariantFlow uid={uid} />}
            {v === 1 && <VariantStack uid={uid} />}
            {v === 2 && <VariantWindow uid={uid} />}
        </div>
    );
}

/** Gradien lembut + bentuk organik mengambang */
function VariantFlow({ uid }) {
    return (
        <svg
            className="h-full w-full"
            viewBox="0 0 320 144"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <linearGradient
                    id={`${uid}-bg`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#e0e7ff" />
                    <stop offset="55%" stopColor="#c7d2fe" />
                    <stop offset="100%" stopColor="#a5b4fc" />
                </linearGradient>
                <linearGradient id={`${uid}-orb`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <rect width="320" height="144" fill={`url(#${uid}-bg)`} />
            <circle cx="260" cy="28" r="56" fill={`url(#${uid}-orb)`} />
            <circle cx="48" cy="120" r="42" fill="#818cf8" opacity="0.2" />
            <path
                d="M0 96 Q 80 72 160 88 T 320 80 L 320 144 L 0 144 Z"
                fill="#4f46e5"
                opacity="0.12"
            />
            <path
                d="M40 112 Q 120 88 200 100 T 320 92"
                fill="none"
                stroke="#4338ca"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.35"
            />
        </svg>
    );
}

/** Blok geometris tumpang tindih — gaya editorial */
function VariantStack({ uid }) {
    return (
        <svg
            className="h-full w-full"
            viewBox="0 0 320 144"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <linearGradient
                    id={`${uid}-bg2`}
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                >
                    <stop offset="0%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
            </defs>
            <rect width="320" height="144" fill={`url(#${uid}-bg2)`} />
            <rect
                x="196"
                y="24"
                width="88"
                height="72"
                rx="14"
                fill="#6366f1"
                opacity="0.88"
            />
            <rect
                x="152"
                y="48"
                width="88"
                height="72"
                rx="14"
                fill="#818cf8"
                opacity="0.55"
            />
            <rect
                x="108"
                y="72"
                width="88"
                height="72"
                rx="14"
                fill="#c4b5fd"
                opacity="0.9"
            />
            <rect
                x="36"
                y="100"
                width="56"
                height="4"
                rx="2"
                fill="#64748b"
                opacity="0.25"
            />
            <rect
                x="36"
                y="108"
                width="40"
                height="4"
                rx="2"
                fill="#64748b"
                opacity="0.18"
            />
        </svg>
    );
}

/** Jendela minimal + cahaya — nuansa kelas */
function VariantWindow({ uid }) {
    return (
        <svg
            className="h-full w-full"
            viewBox="0 0 320 144"
            preserveAspectRatio="xMidYMid slice"
        >
            <defs>
                <linearGradient
                    id={`${uid}-sky`}
                    x1="50%"
                    y1="0%"
                    x2="50%"
                    y2="100%"
                >
                    <stop offset="0%" stopColor="#bae6fd" />
                    <stop offset="100%" stopColor="#e0f2fe" />
                </linearGradient>
                <linearGradient id={`${uid}-sun`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fde68a" />
                    <stop offset="100%" stopColor="#fcd34d" />
                </linearGradient>
            </defs>
            <rect width="320" height="144" fill={`url(#${uid}-sky)`} />
            <circle cx="268" cy="36" r="22" fill={`url(#${uid}-sun)`} opacity="0.85" />
            <rect
                x="72"
                y="40"
                width="176"
                height="88"
                rx="12"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1.5"
            />
            <line x1="160" y1="40" x2="160" y2="128" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="72" y1="84" x2="248" y2="84" stroke="#e2e8f0" strokeWidth="1.5" />
            <rect x="88" y="52" width="56" height="24" rx="4" fill="#bfdbfe" opacity="0.65" />
            <rect x="176" y="96" width="56" height="24" rx="4" fill="#c7d2fe" opacity="0.55" />
            <rect x="88" y="96" width="56" height="24" rx="4" fill="#e0e7ff" opacity="0.7" />
        </svg>
    );
}
