import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Login | SMP N 3 Batang</title>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com" rel="preconnect" />
                <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&amp;family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&amp;display=swap" rel="stylesheet" />
                <style dangerouslySetInnerHTML={{
                    __html: `
                        html, body { overflow-x: hidden; max-width: 100%; }
                        body { font-family: 'Manrope', sans-serif; }
                        .font-serif { font-family: 'Newsreader', serif; }
                        .material-symbols-outlined {
                            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                        }
                        .pearlescent-gradient {
                            background: linear-gradient(135deg, #000666 0%, #1a237e 100%);
                        }
                        .glass-overlay {
                            background: rgba(255, 255, 255, 0.08);
                            backdrop-filter: blur(24px);
                            border: 1px solid rgba(255, 255, 255, 0.15);
                        }
                        .login-motto-card {
                            background: linear-gradient(
                                165deg,
                                rgba(255, 255, 255, 0.18) 0%,
                                rgba(255, 255, 255, 0.06) 100%
                            );
                            backdrop-filter: blur(28px);
                            border: 1px solid rgba(255, 255, 255, 0.22);
                            box-shadow:
                                0 28px 56px -12px rgba(0, 12, 48, 0.55),
                                inset 0 1px 0 rgba(255, 255, 255, 0.28);
                        }
                        .deep-shadow {
                            box-shadow: 0 20px 40px rgba(0, 7, 103, 0.06);
                        }
                    `
                }} />
            </Head>
            <main className="flex min-h-screen w-full max-w-full overflow-x-hidden">
                {/* Left Side: Immersive Imagery */}
                <section className="hidden min-w-0 lg:flex relative w-1/2 h-screen overflow-hidden">
                    <img alt="Gambar" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQMkScZFnx8Td0-2u3Zb2vN-XGQ7qGAvgO7KNdklUGaWo3vORH5M4cf2hmwpR_-8h9JhfKql8kkIcVTyurBTRFSq78yBBhwG6uOl2JuSDvl2Z8hKTm-pIXMe_Y5Aow6oRRFi-bB9jIoQY9O5rZip9gmpP-bDyv8mF2FKO9v-YQ3ZR4rLhTJ_-G9djUhc671EBXv20RXp8GDFpzW_Hzeti3sJ8cZfsBglupgzFueyeKEDfDS_tDXYSEF0SEg_HIY6Fa3NdSTHDdIYvY" />
                    {/* Glassmorphic Text Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-12">
                        <div className="login-motto-card relative max-w-md rounded-[1.75rem] px-8 py-10 text-center sm:max-w-lg sm:rounded-3xl sm:px-12 sm:py-12">
                            <p className="font-body text-[0.9375rem] font-medium leading-[1.7] text-white/95 [text-shadow:0_2px_20px_rgba(0,8,40,0.45)] sm:text-base">
                                "Spirit for Marvelous, Aspiring, Responsive,{' '}
                                <span className="sm:whitespace-nowrap">and Trusted School."</span>
                            </p>
                            <div
                                className="mx-auto my-8 h-px max-w-[10rem] bg-gradient-to-r from-transparent via-white/45 to-transparent sm:my-9 sm:max-w-[14rem]"
                                aria-hidden
                            />
                            <h2 className="font-serif text-3xl font-bold italic tracking-tight text-white/95 [text-shadow:0_3px_28px_rgba(0,10,50,0.5)] sm:text-4xl md:text-[2.65rem] md:leading-tight">
                                SMART SCHOOL
                            </h2>
                        </div>
                    </div>
                    {/* Branding — klik kembali ke landing */}
                    <div className="absolute bottom-12 left-12">
                        <Link
                            href="/"
                            className="text-white font-serif italic text-2xl font-bold transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm"
                            aria-label="Kembali ke beranda"
                        >
                            SMP N 3 Batang
                        </Link>
                    </div>
                </section>
                {/* Right Side: Login Area */}
                <section className="relative flex min-h-screen w-full min-w-0 flex-col items-center justify-start overflow-x-hidden bg-surface-bright px-6 pt-8 pb-24 sm:px-12 sm:pt-10 sm:pb-28 md:px-16 lg:w-1/2 lg:justify-center lg:px-24 lg:py-10 lg:pb-20">
                    {/* Dekorasi blur — di dalam clip supaya tidak memperlebar halaman (scrollbar) */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                        <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-primary-fixed/20 blur-[100px] sm:h-80 sm:w-80 sm:-right-12 sm:-top-24" />
                    </div>
                    <div className="w-full max-w-md relative z-10">
                        {/* Branding for Mobile */}
                        <div className="lg:hidden mb-6 text-center">
                            <Link
                                href="/"
                                className="inline-block text-primary font-serif italic text-3xl font-bold transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 rounded-sm"
                                aria-label="Kembali ke beranda"
                            >
                                SMP N 3 Batang
                            </Link>
                        </div>
                        <div className="mb-8">
                            <h1 className="font-serif text-3xl md:text-5xl text-on-surface font-light tracking-tight mb-2">Welcome Back</h1>
                            <p className="text-on-surface-variant font-body text-base md:text-lg tracking-wide">Continue your journey through the archives.</p>
                        </div>
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}
                        <form onSubmit={submit} className="space-y-5">
                            {/* Input: Email */}
                            <div className="space-y-3">
                                <label className="block font-body text-sm font-semibold tracking-widest uppercase text-on-surface-variant ml-1" htmlFor="login">NIS, NIP, atau Email</label>
                                <div className="relative group">
                                    <input
                                        id="login"
                                        type="text"
                                        name="login"
                                        value={data.login}
                                        className="w-full h-10 md:h-14 px-6 bg-surface-container-low border-none rounded-3xl focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all duration-300 font-body text-base md:text-lg placeholder:text-outline-variant"
                                        autoComplete="username"
                                        placeholder="Nomor NIS, NIP, atau email"
                                        onChange={(e) => setData('login', e.target.value)}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined">badge</span>
                                    </div>
                                </div>
                                {errors.login && <div className="text-red-500 text-sm mt-2">{errors.login}</div>}
                            </div>
                            {/* Input: Password */}
                            <div className="space-y-3">
                                <label className="block font-body text-sm font-semibold tracking-widest uppercase text-on-surface-variant ml-1" htmlFor="password">Password</label>
                                <div className="relative group">
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="w-full h-10 md:h-14 px-6 bg-surface-container-low border-none rounded-3xl focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all duration-300 font-body text-base md:text-lg placeholder:text-outline-variant"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined">lock</span>
                                    </div>
                                </div>
                                {errors.password && <div className="text-red-500 text-sm mt-2">{errors.password}</div>}
                            </div>
                            {/* Remember me + actions — satu blok rapat (hindari space-y besar di antara) */}
                            <div className="space-y-4 pt-1">
                                <div className="flex items-center px-1">
                                    <label className="flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary-container bg-surface-container-low"
                                        />
                                        <span className="ml-3 text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">Remember me</span>
                                    </label>
                                </div>
                                <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="order-2 w-full text-center text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors underline sm:order-1 sm:w-auto sm:text-left">
                                            Forgot your password?
                                        </Link>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="order-1 h-10 md:h-12 px-6 md:px-8 pearlescent-gradient text-white font-body font-bold text-sm tracking-widest rounded-3xl shadow-lg hover:opacity-90 transition-all uppercase disabled:opacity-50 sm:order-2"
                                    >
                                        {processing ? 'Logging in...' : 'LOG IN'}
                                    </button>
                                </div>
                            </div>
                        </form>
                        
                    </div>
                    {/* Bottom decorative utility */}
                    <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-40 sm:bottom-6">
                        <nav className="flex gap-6 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant sm:gap-8">
                            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
                            <a className="hover:text-primary transition-colors" href="#">Ethics</a>
                            <a className="hover:text-primary transition-colors" href="#">Systems</a>
                        </nav>
                    </div>
                </section>
            </main>
            {/* Support for background shapes & grain */}
            <div className="pointer-events-none fixed inset-0 max-h-full max-w-full overflow-hidden opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        </>
    );
}
