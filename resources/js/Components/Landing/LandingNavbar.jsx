import { Link } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";

/**
 * Navbar publik (landing) — dipakai di beranda, Fitur, Kontak.
 * @param {{ user?: object } | null} auth
 * @param {'home' | 'features' | 'contact'} [current='home']
 */
export default function LandingNavbar({ auth, current = "home" }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const authButton = auth?.user
        ? { href: route("dashboard"), label: "Dashboard" }
        : { href: route("login"), label: "Login" };

    const desktopClass = (key) =>
        current === key
            ? "text-xs uppercase tracking-widest font-sans text-indigo-900 font-semibold hover:text-indigo-700 transition-all duration-300 scale-105 active:scale-95"
            : "text-xs uppercase tracking-widest font-sans text-slate-500 font-normal hover:text-indigo-700 transition-all duration-300 scale-105 active:scale-95";

    const mobileClass = (key) =>
        current === key
            ? "block rounded-3xl px-6 py-5 text-left text-base uppercase tracking-[0.2em] font-sans font-semibold text-indigo-900 transition-all duration-300 hover:bg-slate-50 active:bg-slate-100"
            : "block rounded-3xl px-6 py-5 text-left text-base uppercase tracking-[0.2em] font-sans text-slate-600 transition-all duration-300 hover:bg-slate-50 active:bg-slate-100";

    useEffect(() => {
        if (!mobileMenuOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [auth?.user?.id]);

    return (
        <>
            <nav className="fixed inset-x-0 top-0 z-50 px-4 py-3 sm:px-6">
                <div className="mx-auto mt-6 flex w-full max-w-7xl items-center justify-between gap-8 rounded-full bg-white/40 px-6 py-3 shadow-[0_20px_40px_rgba(0,7,103,0.06)] backdrop-blur-xl sm:gap-12 sm:px-8">
                    <Link
                        href="/"
                        className="flex-shrink-0 font-serif text-xl tracking-tighter text-indigo-900 transition-colors hover:text-indigo-700 sm:text-2xl"
                    >
                        LMS SMP N 3 Batang
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        <a href="/" className={desktopClass("home")}>
                            Home
                        </a>
                        <Link href={route("features")} className={desktopClass("features")}>
                            Fitur
                        </Link>
                        <Link href={route("contact")} className={desktopClass("contact")}>
                            Kontak
                        </Link>
                    </div>

                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex-shrink-0 rounded-lg p-1.5 text-indigo-900 transition-colors hover:bg-white/50 hover:text-indigo-700 md:hidden"
                        aria-expanded={mobileMenuOpen}
                        aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
                    >
                        {mobileMenuOpen ? (
                            <IconX className="h-7 w-7" stroke={1.75} />
                        ) : (
                            <IconMenu2 className="h-7 w-7" stroke={1.75} />
                        )}
                    </button>

                    <Link
                        href={authButton.href}
                        className="bg-primary text-on-primary hidden flex-shrink-0 rounded-full px-6 py-2 font-sans text-xs uppercase tracking-widest transition-all hover:opacity-90 active:scale-95 sm:block"
                    >
                        {authButton.label}
                    </Link>
                </div>
            </nav>

            {mobileMenuOpen ? (
                <div
                    className="fixed inset-0 z-[100] flex min-h-0 flex-col bg-white/97 backdrop-blur-2xl md:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu navigasi"
                >
                    <div className="flex shrink-0 items-center justify-between border-b border-slate-100/90 px-7 py-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
                        <Link
                            href="/"
                            className="max-w-[70%] font-serif text-2xl leading-snug tracking-tighter text-indigo-900 sm:text-[1.65rem]"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            LMS SMP N 3 Batang
                        </Link>
                        <button
                            type="button"
                            className="rounded-full p-3 text-indigo-900 transition-colors hover:bg-slate-100 active:bg-slate-200"
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Tutup menu"
                        >
                            <IconX className="h-8 w-8" stroke={1.75} />
                        </button>
                    </div>
                    <nav className="flex min-h-0 flex-1 flex-col justify-center gap-2 overflow-y-auto px-7 pb-[max(2rem,env(safe-area-inset-bottom))]">
                        <Link
                            href="/"
                            className={mobileClass("home")}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href={route("features")}
                            className={mobileClass("features")}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Fitur
                        </Link>
                        <Link
                            href={route("contact")}
                            className={mobileClass("contact")}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Kontak
                        </Link>
                        <div className="mt-8 border-t border-slate-100 pt-8">
                            <Link
                                href={authButton.href}
                                className="bg-primary/95 text-on-primary block w-full rounded-full px-8 py-4 text-center font-sans text-sm font-semibold uppercase tracking-[0.22em] transition-all duration-300 hover:bg-primary active:opacity-95"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {authButton.label}
                            </Link>
                        </div>
                    </nav>
                </div>
            ) : null}
        </>
    );
}
