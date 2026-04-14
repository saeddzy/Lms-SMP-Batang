import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
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
                <title>Login | The Sanctuary</title>
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com" rel="preconnect" />
                <link crossOrigin="" href="https://fonts.gstatic.com" rel="preconnect" />
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&amp;family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&amp;display=swap" rel="stylesheet" />
                <style dangerouslySetInnerHTML={{
                    __html: `
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
                        .deep-shadow {
                            box-shadow: 0 20px 40px rgba(0, 7, 103, 0.06);
                        }
                    `
                }} />
            </Head>
            <main className="flex min-h-screen w-full">
                {/* Left Side: Immersive Imagery */}
                <section className="hidden lg:flex relative w-1/2 h-screen overflow-hidden">
                    <img alt="Gambar" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQMkScZFnx8Td0-2u3Zb2vN-XGQ7qGAvgO7KNdklUGaWo3vORH5M4cf2hmwpR_-8h9JhfKql8kkIcVTyurBTRFSq78yBBhwG6uOl2JuSDvl2Z8hKTm-pIXMe_Y5Aow6oRRFi-bB9jIoQY9O5rZip9gmpP-bDyv8mF2FKO9v-YQ3ZR4rLhTJ_-G9djUhc671EBXv20RXp8GDFpzW_Hzeti3sJ8cZfsBglupgzFueyeKEDfDS_tDXYSEF0SEg_HIY6Fa3NdSTHDdIYvY" />
                    {/* Glassmorphic Text Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center p-12">
                        <div className="glass-overlay p-10 rounded-3xl max-w-lg text-center shadow-xl">
                            <h2 className="text-gradient-secondary font-serif text-4xl italic tracking-tight mb-4">
                                The Sanctuary of Scholarly Excellence
                            </h2>
                            <p className="text-primary/70 font-body text-xs tracking-[0.3em] uppercase opacity-70">
                                EST. MMXXIV
                            </p>
                        </div>
                    </div>
                    {/* Branding subtle anchor */}
                    <div className="absolute bottom-12 left-12">
                        <span className="text-white font-serif italic text-2xl font-bold">SMP 7 Batang</span>
                    </div>
                </section>
                {/* Right Side: Login Area */}
                <section className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-12 md:px-16 lg:px-24 bg-surface-bright relative">
                    {/* Abstract background shape for depth */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary-fixed/20 rounded-full blur-[120px] -mr-48 -mt-48"></div>
                    <div className="w-full max-w-md relative z-10">
                        {/* Branding for Mobile */}
                        <div className="lg:hidden mb-12 text-center">
                            <span className="text-primary font-serif italic text-3xl font-bold">SMP 7 Batang</span>
                        </div>
                        <div className="mb-12">
                            <h1 className="font-serif text-3xl md:text-5xl text-on-surface font-light tracking-tight mb-3">Welcome Back</h1>
                            <p className="text-on-surface-variant font-body text-base md:text-lg tracking-wide">Continue your journey through the archives.</p>
                        </div>
                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600">
                                {status}
                            </div>
                        )}
                        <form onSubmit={submit} className="space-y-8">
                            {/* Input: Email */}
                            <div className="space-y-3">
                                <label className="block font-body text-sm font-semibold tracking-widest uppercase text-on-surface-variant ml-1" htmlFor="email">Email</label>
                                <div className="relative group">
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="w-full h-10 md:h-14 px-6 bg-surface-container-low border-none rounded-3xl focus:ring-2 focus:ring-primary-container focus:bg-surface-container-lowest transition-all duration-300 font-body text-base md:text-lg placeholder:text-outline-variant"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined">mail</span>
                                    </div>
                                </div>
                                {errors.email && <div className="text-red-500 text-sm mt-2">{errors.email}</div>}
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
                            {/* Remember me */}
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
                            {/* Actions */}
                            <div className="flex items-center justify-end gap-8 mt-4">
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors underline">
                                        Forgot your password?
                                    </Link>
                                )}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="h-10 md:h-12 px-6 md:px-8 pearlescent-gradient text-white font-body font-bold text-sm tracking-widest rounded-3xl shadow-lg hover:opacity-90 transition-all uppercase disabled:opacity-50"
                                >
                                    {processing ? 'Logging in...' : 'LOG IN'}
                                </button>
                            </div>
                        </form>
                        
                    </div>
                    {/* Bottom decorative utility */}
                    <div className="absolute bottom-8 left-0 w-full flex justify-center opacity-40">
                        <nav className="flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant">
                            <a className="hover:text-primary transition-colors" href="#">Privacy</a>
                            <a className="hover:text-primary transition-colors" href="#">Ethics</a>
                            <a className="hover:text-primary transition-colors" href="#">Systems</a>
                        </nav>
                    </div>
                </section>
            </main>
            {/* Support for background shapes & grain */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        </>
    );
}
