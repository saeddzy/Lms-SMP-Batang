import { Head } from "@inertiajs/react";
import { useState } from "react";
import LandingNavbar from "@/Components/Landing/LandingNavbar";
import LandingFooter from "@/Components/Landing/LandingFooter";

const SCHOOL_EMAIL = "smptigabatang@gmail.com";
const SCHOOL_PHONE_DISPLAY = "(0285) 391422";
const HUMAS_WA = "628122937837";

export default function Contact({ auth }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const sub = form.subject.trim() || "Pesan dari halaman Kontak LMS";
        const body = [
            form.name.trim() ? `Nama: ${form.name.trim()}` : null,
            form.email.trim() ? `Email pengirim: ${form.email.trim()}` : null,
            "",
            form.message.trim() || "(Tidak ada isi pesan)",
        ]
            .filter(Boolean)
            .join("\n");
        const href = `mailto:${SCHOOL_EMAIL}?subject=${encodeURIComponent(
            sub
        )}&body=${encodeURIComponent(body)}`;
        window.location.href = href;
    };

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                <title>Kontak | SMP Negeri 3 Batang</title>
                <link
                    href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&amp;family=Manrope:wght@200..800&amp;display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap"
                    rel="stylesheet"
                />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        body { font-family: 'Manrope', sans-serif; background-color: #faf9f6; overflow-y: scroll; }
                        .font-serif { font-family: 'Newsreader', serif; }
                        .glass-card {
                            background: rgba(255, 255, 255, 0.4);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
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
                    `,
                    }}
                />
            </Head>
            <div className="bg-surface text-on-surface overflow-x-hidden">
                <LandingNavbar
                    key={auth?.user?.id ?? "guest"}
                    auth={auth}
                    current="contact"
                />
                <main>
                    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32">
                        <div className="bg-primary/5 absolute left-1/4 top-1/4 -z-10 h-96 w-96 rounded-full blur-[120px]" />
                        <div className="bg-secondary-container/20 absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full blur-[120px]" />
                        <div className="relative z-10 max-w-4xl space-y-8 text-center">
                            <h1 className="font-serif mb-6 text-5xl tracking-tight text-on-surface md:text-7xl">
                                Hubungi kami
                            </h1>
                            <p className="font-body mx-auto max-w-2xl text-lg leading-relaxed tracking-wide text-on-surface-variant">
                                Untuk pertanyaan tentang pembelajaran di LMS, bantuan akun, atau informasi umum seputar{" "}
                                <strong>SMP Negeri 3 Batang</strong>, silakan gunakan kontak resmi di bawah atau kirim
                                pesan melalui formulir.
                            </p>
                        </div>
                    </section>

                    <section className="bg-surface-container-low px-6 py-32 md:px-12">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-12">
                                <div className="space-y-8 md:col-span-5">
                                    <div className="bg-surface-container-low hover:bg-surface-container-high rounded-xl p-10 transition-all duration-300">
                                        <div className="flex flex-col gap-6">
                                            <span className="material-symbols-outlined text-primary text-3xl">
                                                location_on
                                            </span>
                                            <div>
                                                <h3 className="font-serif mb-4 text-2xl">Alamat sekolah</h3>
                                                <p className="text-on-surface-variant leading-loose tracking-wide">
                                                    Jl. Ki. Mangunsarkoro No. 6, Proyonanggan Selatan
                                                    <br />
                                                    Batang, Jawa Tengah 51211
                                                    <br />
                                                    Indonesia
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-outline-variant/10 bg-surface-container-lowest rounded-xl border p-10 shadow-sm">
                                        <h3 className="font-serif mb-8 text-2xl">Saluran komunikasi</h3>
                                        <div className="space-y-6">
                                            <div className="group flex items-center gap-4">
                                                <div className="bg-secondary-container text-primary flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined">call</span>
                                                </div>
                                                <div>
                                                    <p className="font-label text-on-surface-variant mb-1 text-xs uppercase tracking-widest">
                                                        Telepon / fax
                                                    </p>
                                                    <p className="font-semibold">{SCHOOL_PHONE_DISPLAY}</p>
                                                </div>
                                            </div>
                                            <div className="group flex items-center gap-4">
                                                <div className="bg-secondary-container text-primary flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined">mail</span>
                                                </div>
                                                <div>
                                                    <p className="font-label text-on-surface-variant mb-1 text-xs uppercase tracking-widest">
                                                        Email
                                                    </p>
                                                    <a
                                                        href={`mailto:${SCHOOL_EMAIL}`}
                                                        className="font-semibold text-indigo-800 underline hover:text-indigo-600"
                                                    >
                                                        {SCHOOL_EMAIL}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="group flex items-center gap-4">
                                                <div className="bg-secondary-container text-primary flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110">
                                                    <span className="material-symbols-outlined">chat</span>
                                                </div>
                                                <div>
                                                    <p className="font-label text-on-surface-variant mb-1 text-xs uppercase tracking-widest">
                                                        Humas (WhatsApp)
                                                    </p>
                                                    <a
                                                        href={`https://wa.me/${HUMAS_WA}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-indigo-800 underline hover:text-indigo-600"
                                                    >
                                                        0812-2937-837
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <a
                                            href="https://www.smpn3batang.sch.id"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-label bg-surface-container-low hover:bg-primary hover:text-on-primary rounded-xl py-4 text-center text-xs uppercase tracking-widest transition-all duration-300"
                                        >
                                            Website resmi
                                        </a>
                                        <a
                                            href={`mailto:${SCHOOL_EMAIL}`}
                                            className="font-label bg-surface-container-low hover:bg-primary hover:text-on-primary rounded-xl py-4 text-center text-xs uppercase tracking-widest transition-all duration-300"
                                        >
                                            Kirim email
                                        </a>
                                        <a
                                            href={`https://wa.me/${HUMAS_WA}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-label bg-surface-container-low hover:bg-primary hover:text-on-primary rounded-xl py-4 text-center text-xs uppercase tracking-widest transition-all duration-300"
                                        >
                                            WhatsApp
                                        </a>
                                    </div>
                                </div>

                                <div className="md:col-span-7">
                                    <div className="border-outline-variant/10 bg-surface-container-lowest h-full rounded-xl border p-10 shadow-xl shadow-primary/5 md:p-14">
                                        <h3 className="font-serif mb-4 text-3xl">Kirim pesan</h3>
                                        <p className="font-body mb-10 text-sm text-on-surface-variant">
                                            Isi formulir berikut. Saat Anda mengetuk &quot;Kirim pesan&quot;, aplikasi email
                                            di perangkat Anda akan terbuka dengan alamat tujuan{" "}
                                            <strong>{SCHOOL_EMAIL}</strong>.
                                        </p>
                                        <form className="space-y-8" onSubmit={handleSubmit}>
                                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="font-body text-on-surface-variant ml-2 text-xs uppercase tracking-widest">
                                                        Nama lengkap
                                                    </label>
                                                    <input
                                                        className="bg-surface-container-low focus:ring-primary/20 w-full rounded-xl border-none px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2"
                                                        placeholder="Contoh: Budi Santoso"
                                                        type="text"
                                                        value={form.name}
                                                        onChange={(e) =>
                                                            setForm((f) => ({ ...f, name: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="font-body text-on-surface-variant ml-2 text-xs uppercase tracking-widest">
                                                        Email Anda
                                                    </label>
                                                    <input
                                                        className="bg-surface-container-low focus:ring-primary/20 w-full rounded-xl border-none px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2"
                                                        placeholder="nama@email.com"
                                                        type="email"
                                                        value={form.email}
                                                        onChange={(e) =>
                                                            setForm((f) => ({ ...f, email: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="font-body text-on-surface-variant ml-2 text-xs uppercase tracking-widest">
                                                    Subjek
                                                </label>
                                                <input
                                                    className="bg-surface-container-low focus:ring-primary/20 w-full rounded-xl border-none px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2"
                                                    placeholder="Contoh: Pertanyaan tentang akun siswa"
                                                    type="text"
                                                    value={form.subject}
                                                    onChange={(e) =>
                                                        setForm((f) => ({ ...f, subject: e.target.value }))
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="font-body text-on-surface-variant ml-2 text-xs uppercase tracking-widest">
                                                    Pesan
                                                </label>
                                                <textarea
                                                    className="bg-surface-container-low focus:ring-primary/20 w-full resize-none rounded-xl border-none px-6 py-4 outline-none transition-all focus:bg-white focus:ring-2"
                                                    placeholder="Tuliskan pertanyaan atau pesan Anda di sini..."
                                                    rows={5}
                                                    value={form.message}
                                                    onChange={(e) =>
                                                        setForm((f) => ({ ...f, message: e.target.value }))
                                                    }
                                                />
                                            </div>
                                            <button
                                                className="from-primary to-primary-container text-on-primary w-full rounded-xl bg-gradient-to-r py-5 text-lg font-semibold shadow-xl shadow-primary/20 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98]"
                                                type="submit"
                                            >
                                                Kirim pesan
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-20">
                                <div className="relative overflow-hidden rounded-xl">
                                    <img
                                        alt="Gedung SMP Negeri 3 Batang"
                                        className="h-full min-h-[280px] w-full object-cover"
                                        src={encodeURI("/images/gedung-depan-smp3-e1569509634282.jpg")}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                                        <h4 className="font-serif mb-2 text-2xl md:text-3xl">Lingkungan belajar</h4>
                                        <p className="font-body text-sm leading-relaxed opacity-95">
                                            Kunjungan ke sekolah dapat dijalin melalui tata usaha atau humas sesuai jam
                                            kerja.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <LandingFooter />
            </div>
        </>
    );
}
