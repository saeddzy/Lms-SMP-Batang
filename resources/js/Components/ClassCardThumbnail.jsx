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
            className={`relative h-36 w-full shrink-0 overflow-hidden bg-gradient-to-br from-[#154497] to-[#1460BE] ${className}`}
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
                    <stop offset="0%" stopColor="#154497" />
                    <stop offset="55%" stopColor="#1460BE" />
                    <stop offset="100%" stopColor="#1E6FDB" />
                </linearGradient>
                <linearGradient id={`${uid}-orb`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
            </defs>
            <rect width="320" height="144" fill={`url(#${uid}-bg)`} />
            <circle cx="260" cy="28" r="56" fill={`url(#${uid}-orb)`} />
            <circle cx="48" cy="120" r="42" fill="#60A5FA" opacity="0.3" />
            <path
                d="M0 96 Q 80 72 160 88 T 320 80 L 320 144 L 0 144 Z"
                fill="#154497"
                opacity="0.15"
            />
            <path
                d="M40 112 Q 120 88 200 100 T 320 92"
                fill="none"
                stroke="#1460BE"
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
                    <stop offset="0%" stopColor="#154497" />
                    <stop offset="100%" stopColor="#1460BE" />
                </linearGradient>
            </defs>
            <rect width="320" height="144" fill={`url(#${uid}-bg2)`} />
            <rect
                x="196"
                y="24"
                width="88"
                height="72"
                rx="14"
                fill="#1460BE"
                opacity="0.9"
            />
            <rect
                x="152"
                y="48"
                width="88"
                height="72"
                rx="14"
                fill="#60A5FA"
                opacity="0.6"
            />
            <rect
                x="108"
                y="72"
                width="88"
                height="72"
                rx="14"
                fill="#B6D4FF"
                opacity="0.85"
            />
            <rect
                x="36"
                y="100"
                width="56"
                height="4"
                rx="2"
                fill="#CBD5E1"
                opacity="0.3"
            />
            <rect
                x="36"
                y="108"
                width="40"
                height="4"
                rx="2"
                fill="#94A3B8"
                opacity="0.25"
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
                    <stop offset="0%" stopColor="#154497" />
                    <stop offset="100%" stopColor="#1460BE" />
                </linearGradient>
                <linearGradient id={`${uid}-sun`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#1460BE" />
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
