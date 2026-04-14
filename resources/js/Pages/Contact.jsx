import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Contact({ auth }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const authButton = auth?.user
        ? { href: route('dashboard'), label: 'Dashboard' }
        : { href: route('login'), label: 'Login' };

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                <title>Kontak | SMP 3 Batang</title>
                <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&amp;family=Manrope:wght@200..800&amp;display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
                <style dangerouslySetInnerHTML={{
                    __html: `
                        body { font-family: 'Manrope', sans-serif; background-color: #faf9f6; overflow-y: scroll; }
                        .font-serif { font-family: 'Newsreader', serif; }
                        .glass-card {
                            background: rgba(255, 255, 255, 0.4);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                        }
                        .pearlescent-gradient {
                            background: linear-gradient(135deg, #000666 0%, #1a237e 100%);
                        }
                        .material-symbols-outlined {
                            font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
                        }
                        .hamburger-icon {
                            transition: transform 0.3s ease-in-out;
                        }
                        .hamburger-icon.open {
                            transform: rotate(90deg);
                        }
                    `
                }} />
            </Head>
            <div className="bg-surface text-on-surface overflow-x-hidden">
                {/* Navbar */}
                <nav className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 py-3">
                    <div className="bg-white/40 backdrop-blur-xl rounded-full w-full max-w-7xl mx-auto mt-6 px-6 sm:px-8 py-3 flex items-center justify-between gap-8 sm:gap-12 shadow-[0_20px_40px_rgba(0,7,103,0.06)]">
                        <Link href="/" className="text-xl sm:text-2xl font-serif tracking-tighter text-indigo-900 hover:text-indigo-700 transition-colors flex-shrink-0">LMS SMP N 3 Batang</Link>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <a className="text-xs uppercase tracking-widest font-sans text-slate-500 font-normal hover:text-indigo-700 transition-all duration-300 scale-105 active:scale-95" href="/">Home</a>
                            <Link href={route('features')} className="text-xs uppercase tracking-widest font-sans text-slate-500 font-normal hover:text-indigo-700 transition-all duration-300 scale-105 active:scale-95">Fitur</Link>
                            <Link href={route('contact')} className="text-xs uppercase tracking-widest font-sans text-indigo-900 font-semibold hover:text-indigo-700 transition-all duration-300 scale-105 active:scale-95">Kontak</Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-indigo-900 hover:text-indigo-700 transition-colors flex-shrink-0"
                        >
                            <span className={`material-symbols-outlined text-2xl hamburger-icon ${mobileMenuOpen ? 'open' : ''}`}>
                                {mobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                        
                        {/* Desktop Login Button */}
                        <Link href={authButton.href} className="hidden sm:block bg-primary text-on-primary px-6 py-2 rounded-full text-xs uppercase tracking-widest font-sans hover:opacity-90 transition-all active:scale-95 flex-shrink-0">
                            {authButton.label}
                        </Link>
                    </div>
                </nav>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="fixed top-20 left-0 right-0 z-40 md:hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="glass-card max-w-3xl mx-auto rounded-[2rem] border border-white/30 bg-white/15 backdrop-blur-3xl shadow-2xl shadow-slate-900/20 px-6 py-6 space-y-4">
                            <Link href="/" className="block px-5 py-4 text-sm uppercase tracking-widest font-sans text-slate-600 hover:bg-white/20 rounded-3xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link href={route('features')} className="block px-5 py-4 text-sm uppercase tracking-widest font-sans text-slate-600 hover:bg-white/20 rounded-3xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                                Fitur
                            </Link>
                            <Link href={route('contact')} className="block px-5 py-4 text-sm uppercase tracking-widest font-sans text-indigo-900 font-semibold hover:bg-white/20 rounded-3xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                                Kontak
                            </Link>
                            <div className="pt-4 border-t border-white/20">
                                <Link href={authButton.href} className="block w-full bg-primary/95 text-on-primary px-6 py-3 rounded-full text-xs uppercase tracking-widest font-sans hover:bg-primary transition-all duration-300 text-center" onClick={() => setMobileMenuOpen(false)}>
                                    {authButton.label}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
                <main>
                    {/* Contact Header Section */}
                    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/20 rounded-full blur-[120px] -z-10"></div>
                        <div className="max-w-4xl text-center space-y-8 relative z-10">
                            <h1 className="font-serif text-5xl md:text-7xl text-on-surface mb-6 tracking-tight">Hubungi Kami</h1>
                            <p className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed tracking-wide">
                                Kami hadir untuk mendukung perjalanan intelektual Anda. Silakan hubungi kami untuk informasi lebih lanjut mengenai pendaftaran, kurikulum, atau fasilitas kami.
                            </p>
                        </div>
                    </section>

                    {/* Contact Content Section */}
                    <section className="py-32 px-6 md:px-12 bg-surface-container-low">
                        <div className="max-w-7xl mx-auto">
                            {/* Bento Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-20">
                                {/* Information Column */}
                                <div className="md:col-span-5 space-y-8">
                                    {/* Address Card */}
                                    <div className="bg-surface-container-low p-10 rounded-xl transition-all duration-300 hover:bg-surface-container-high">
                                        <div className="flex flex-col gap-6">
                                            <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                                            <div>
                                                <h3 className="font-serif text-2xl mb-4">Lokasi Kami</h3>
                                                <p className="text-on-surface-variant leading-loose tracking-wide">
                                                    Jl. Pendidikan No. 42, Kebayoran Baru<br/>
                                                    Jakarta Selatan, 12110<br/>
                                                    Indonesia
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Channels Card */}
                                    <div className="bg-surface-container-lowest p-10 rounded-xl shadow-sm border border-outline-variant/10">
                                        <h3 className="font-serif text-2xl mb-8">Saluran Komunikasi</h3>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined">call</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">Telepon</p>
                                                    <p className="font-semibold">+62 (21) 555-0123</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 group">
                                                <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined">mail</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">Email</p>
                                                    <p className="font-semibold">hello@academiasanctuary.edu</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Social Media */}
                                    <div className="flex gap-4">
                                        <a className="flex-1 bg-surface-container-low py-4 rounded-xl text-center font-label text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300" href="#">Instagram</a>
                                        <a className="flex-1 bg-surface-container-low py-4 rounded-xl text-center font-label text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300" href="#">LinkedIn</a>
                                        <a className="flex-1 bg-surface-container-low py-4 rounded-xl text-center font-label text-xs uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all duration-300" href="#">Twitter</a>
                                    </div>
                                </div>

                                {/* Form Column */}
                                <div className="md:col-span-7">
                                    <div className="bg-surface-container-lowest p-10 md:p-14 rounded-xl shadow-xl shadow-primary/5 h-full border border-outline-variant/10">
                                        <h3 className="font-serif text-3xl mb-10">Kirim Pesan</h3>
                                        <form className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-2">
                                                    <label className="font-body text-xs uppercase tracking-widest text-on-surface-variant ml-2">Nama Lengkap</label>
                                                    <input className="w-full bg-surface-container-low border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" placeholder="Jane Doe" type="text"/>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="font-body text-xs uppercase tracking-widest text-on-surface-variant ml-2">Alamat Email</label>
                                                    <input className="w-full bg-surface-container-low border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" placeholder="jane@example.com" type="email"/>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="font-body text-xs uppercase tracking-widest text-on-surface-variant ml-2">Subjek</label>
                                                <input className="w-full bg-surface-container-low border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none" placeholder="Informasi Pendaftaran" type="text"/>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="font-body text-xs uppercase tracking-widest text-on-surface-variant ml-2">Pesan Anda</label>
                                                <textarea className="w-full bg-surface-container-low border-none rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none resize-none" placeholder="Tuliskan pertanyaan atau pesan Anda di sini..." rows="5"></textarea>
                                            </div>
                                            <button className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-5 rounded-xl font-semibold text-lg hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-primary/20" type="submit">
                                                Kirim Pesan
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            {/* Map/Exterior Section */}
                            <div className="mt-20">
                                <div className="relative w-full h-[500px] rounded-xl overflow-hidden group">
                                    <img alt="Academia Sanctuary Exterior" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKrmrZTgi2S71kDHdQRPizVgPIdAwYaz6qIm4uN48upZm2ouQZLsakBPKr-Fr7cU4Ehqbb3nM_bWjbKGxqWQhLzJk9WrTiK13xcGWrQjSXsk6X3_vF38RiDwMF8kyMY26S7zDbIAVTOOExVKPY_BDk3fFM4bX4GFGmwE9vtqJX7KwT2zBD-BIwxnA1GFivh9gjNrpeXCCzTq5A0BenXvvJzpj_8uqnTgbJoV9RI7HBj48zKhkN6MJ_rsxFJaT73Ew8c6tdzSaDgR2L" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-12">
                                        <div className="text-white max-w-xl">
                                            <h4 className="font-serif text-3xl mb-4">Kunjungi Kampus Kami</h4>
                                            <p className="font-body opacity-90 tracking-wide leading-relaxed mb-6">
                                                Lingkungan belajar yang tenang dan inspiratif menanti Anda. Kami menyambut kunjungan terjadwal bagi calon siswa dan orang tua.
                                            </p>
                                            <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-3 rounded-full hover:bg-white hover:text-primary transition-all duration-300">
                                                Jadwalkan Tur Kampus
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute top-8 right-8">
                                        <div className="bg-white p-4 rounded-xl shadow-2xl flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                            <span className="font-body text-xs uppercase tracking-widest text-on-surface">Kampus Terbuka</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="w-full rounded-t-[3rem] mt-20 bg-[#f4f3f1]">
                    <div className="flex flex-col md:flex-row justify-between items-center px-16 py-12 w-full max-w-[1920px] mx-auto">
                        <div className="mb-8 md:mb-0">
                            <span className="font-serif italic text-xl text-[#1A237E]">Academia Sanctuary</span>
                        </div>
                        <div className="flex flex-col items-center md:items-end gap-6">
                            <div className="flex gap-8">
                                <a className="font-body tracking-[0.03em] uppercase text-xs text-stone-500 hover:text-[#1A237E] transition-colors" href="#">Kebijakan Privasi</a>
                                <a className="font-body tracking-[0.03em] uppercase text-xs text-stone-500 hover:text-[#1A237E] transition-colors" href="#">Syarat &amp; Ketentuan</a>
                                <a className="font-body tracking-[0.03em] uppercase text-xs text-stone-500 hover:text-[#1A237E] transition-colors" href="#">Pusat Bantuan</a>
                            </div>
                            <p className="font-body tracking-[0.03em] uppercase text-xs text-stone-500 opacity-80">
                                © 2024 Academia Sanctuary. Scholarly Excellence.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
