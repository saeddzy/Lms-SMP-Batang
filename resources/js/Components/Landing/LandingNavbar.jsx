import { Link } from "@inertiajs/react";
import { useState } from "react";

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
            ? "block px-5 py-4 text-sm uppercase tracking-widest font-sans text-indigo-900 font-semibold hover:bg-white/20 rounded-3xl transition-all duration-300"
            : "block px-5 py-4 text-sm uppercase tracking-widest font-sans text-slate-600 hover:bg-white/20 rounded-3xl transition-all duration-300";

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
                        className="flex-shrink-0 text-indigo-900 transition-colors hover:text-indigo-700 md:hidden"
                        aria-expanded={mobileMenuOpen}
                        aria-label="Menu"
                    >
                        <span
                            className={`material-symbols-outlined hamburger-icon text-2xl ${mobileMenuOpen ? "open" : ""}`}
                        >
                            {mobileMenuOpen ? "close" : "menu"}
                        </span>
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
                <div className="animate-in fade-in slide-in-from-top-2 fixed left-0 right-0 top-20 z-40 duration-300 md:hidden">
                    <div className="glass-card mx-auto max-w-3xl space-y-4 rounded-[2rem] border border-white/30 bg-white/15 px-6 py-6 shadow-2xl shadow-slate-900/20 backdrop-blur-3xl">
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
                        <div className="border-t border-white/20 pt-4">
                            <Link
                                href={authButton.href}
                                className="bg-primary/95 text-on-primary block w-full rounded-full px-6 py-3 text-center font-sans text-xs uppercase tracking-widest transition-all duration-300 hover:bg-primary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {authButton.label}
                            </Link>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
