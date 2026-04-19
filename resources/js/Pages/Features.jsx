import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import LandingNavbar from "@/Components/Landing/LandingNavbar";
import LandingFooter from "@/Components/Landing/LandingFooter";
import {
    IconSchool,
    IconBooks,
    IconClipboardList,
    IconBrain,
    IconChartBar,
    IconUsers,
    IconShieldLock,
    IconCalendarTime,
    IconFileTypePdf,
    IconAward,
    IconDeviceAnalytics,
    IconChevronRight,
    IconSparkles,
} from "@tabler/icons-react";

const roleContent = {
    guru: {
        label: "Guru",
        accent: "from-violet-600 to-indigo-600",
        points: [
            "Dashboard ringkas: kelas, tugas mendesak, dan agenda kuis/ujian.",
            "Kelola materi PDF & video per kelas–mapel dengan status aktif/nonaktif.",
            "Buat tugas, koreksi pengumpulan, dan beri nilai serta feedback.",
            "Susun kuis & ujian (pilihan ganda & esai), jadwal buka–tutup, dan penilaian esai manual.",
            "Manajemen nilai per kelas: rekap tugas, kuis, ujian, dan ekspor data.",
        ],
    },
    siswa: {
        label: "Siswa",
        accent: "from-sky-600 to-cyan-600",
        points: [
            "Akses materi, tugas, kuis, dan ujian sesuai kelas yang diikuti.",
            "Kumpulkan tugas dengan lampiran; lihat nilai dan umpan balik guru.",
            "Kerjakan kuis/ujian dengan batas waktu; notifikasi jelas saat esai menunggu penilaian.",
            "Dashboard menampilkan agenda dan status pembelajaran.",
        ],
    },
    admin: {
        label: "Administrator",
        accent: "from-slate-700 to-indigo-800",
        points: [
            "Pengguna, peran, dan izin akses (role-based) untuk keamanan data.",
            "Kelola kelas, mapel, dan penugasan guru–kelas secara terstruktur.",
            "Monitoring aktivitas pembelajaran dari satu sumber sistem.",
        ],
    },
};

const featureTiles = [
    {
        icon: IconSchool,
        title: "Kelas & mapel",
        blurb: "Struktur kelas, mata pelajaran, dan penugasan guru terkait dengan pembelajaran.",
    },
    {
        icon: IconBooks,
        title: "Materi digital",
        blurb: "Unggah dan bagikan materi PDF atau video untuk siswa, dengan pratinjau di perangkat.",
    },
    {
        icon: IconClipboardList,
        title: "Tugas & pengumpulan",
        blurb: "Buat deadline, kumpulkan jawaban, dan nilai dengan umpan balik yang jelas.",
    },
    {
        icon: IconBrain,
        title: "Kuis & ujian",
        blurb: "Soal pilihan ganda dan esai, jadwal, batas waktu, serta penilaian esai oleh guru.",
    },
    {
        icon: IconChartBar,
        title: "Nilai & rekap",
        blurb: "Rekap per siswa dan per kelas; unduh data untuk analisis lebih lanjut.",
    },
    {
        icon: IconShieldLock,
        title: "Keamanan & peran",
        blurb: "Hak akses sesuai peran: pengguna hanya melihat data yang relevan.",
    },
];

export default function Features({ auth }) {
    const [role, setRole] = useState("guru");
    const [openTile, setOpenTile] = useState(0);

    return (
        <>
            <Head>
                <title>Fitur LMS | SMP 3 Batang</title>
                <meta
                    name="description"
                    content="Fitur Learning Management System SMP Negeri 3 Batang untuk pembelajaran digital, tugas, kuis, ujian, dan manajemen nilai."
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Manrope:wght@200..800&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        body { font-family: 'Manrope', sans-serif; background-color: #f8fafc; overflow-y: scroll; }
                        .font-serif { font-family: 'Newsreader', serif; }
                        .glass-card {
                            background: rgba(255, 255, 255, 0.4);
                            backdrop-filter: blur(20px);
                            -webkit-backdrop-filter: blur(20px);
                        }
                        .pearlescent-gradient { background: linear-gradient(135deg, #000666 0%, #1a237e 100%); }
                        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24; }
                        .hamburger-icon { transition: transform 0.3s ease-in-out; }
                        .hamburger-icon.open { transform: rotate(90deg); }
                        .feature-hero-mesh {
                            background:
                                radial-gradient(ellipse 80% 60% at 20% 20%, rgba(99, 102, 241, 0.22), transparent 50%),
                                radial-gradient(ellipse 70% 50% at 80% 10%, rgba(14, 165, 233, 0.18), transparent 45%),
                                radial-gradient(ellipse 60% 40% at 50% 90%, rgba(79, 70, 229, 0.12), transparent 50%),
                                linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
                        }
                        .tile-glow { transition: box-shadow 0.35s ease, transform 0.35s ease, border-color 0.35s ease; }
                        .tile-glow:hover { box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18); transform: translateY(-2px); }
                    `,
                    }}
                />
            </Head>

            <div className="min-h-screen text-slate-800">
                <LandingNavbar auth={auth} current="features" />

                <header className="feature-hero-mesh relative overflow-hidden px-4 pb-20 pt-36 md:pb-28 md:pt-40">
                    <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute -left-20 bottom-20 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />

                    <div className="relative mx-auto max-w-4xl text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-800 shadow-sm">
                            <IconSparkles size={16} className="text-amber-500" />
                            Learning Management System
                        </div>
                        <h1 className="font-serif text-4xl font-light italic leading-tight text-slate-900 md:text-5xl lg:text-6xl">
                            Satu platform untuk{" "}
                            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                                belajar, menilai, dan berkembang
                            </span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                            LMS ini menghubungkan guru, siswa, dan pengelola sekolah dalam satu alur: materi,
                            tugas, kuis, ujian, hingga rekap nilai yang transparan dan mudah diakses.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href={route("register")}
                                className="pearlescent-gradient inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-indigo-900/20 transition hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Mulai sebagai siswa
                                <IconChevronRight size={18} />
                            </Link>
                            <Link
                                href={route("login")}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/50"
                            >
                                Masuk akun
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="relative -mt-8 px-4 pb-20">
                    <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 md:p-10">
                        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h2 className="font-serif text-2xl italic text-slate-900 md:text-3xl">
                                    Disesuaikan untuk peran Anda
                                </h2>
                                <p className="mt-2 max-w-xl text-sm text-slate-600">
                                    Pilih tab untuk melihat ringkasan fitur yang paling relevan.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(["guru", "siswa", "admin"] ).map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setRole(key)}
                                        className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition ${
                                            role === key
                                                ? `bg-gradient-to-r ${roleContent[key].accent} text-white shadow-md`
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {roleContent[key].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ul className="space-y-4">
                            {roleContent[role].points.map((line, i) => (
                                <li
                                    key={i}
                                    className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm leading-relaxed text-slate-700 transition hover:border-indigo-200 hover:bg-white"
                                >
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                        {i + 1}
                                    </span>
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="px-4 pb-20">
                    <div className="mx-auto max-w-6xl">
                        <div className="mb-10 text-center">
                            <h2 className="font-serif text-3xl italic text-slate-900 md:text-4xl">
                                Modul utama LMS
                            </h2>
                            <p className="mt-3 text-slate-600">
                                Klik kartu untuk menonjolkan detail — semua dirancang agar konsisten dan mudah dipakai.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {featureTiles.map((tile, i) => {
                                const Icon = tile.icon;
                                const active = openTile === i;
                                return (
                                    <button
                                        key={tile.title}
                                        type="button"
                                        onClick={() => setOpenTile(i)}
                                        className={`tile-glow group rounded-2xl border bg-white p-6 text-left ${
                                            active
                                                ? "border-indigo-300 ring-2 ring-indigo-100"
                                                : "border-slate-200 hover:border-indigo-200"
                                        }`}
                                    >
                                        <div
                                            className={`mb-4 inline-flex rounded-xl p-3 ${
                                                active
                                                    ? "bg-indigo-100 text-indigo-700"
                                                    : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700"
                                            }`}
                                        >
                                            <Icon size={26} stroke={1.35} />
                                        </div>
                                        <h3 className="font-serif text-xl text-slate-900">{tile.title}</h3>
                                        <p
                                            className={`mt-2 text-sm leading-relaxed text-slate-600 transition ${
                                                active ? "opacity-100" : "opacity-90"
                                            }`}
                                        >
                                            {tile.blurb}
                                        </p>
                                        {active && (
                                            <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-indigo-800/90">
                                                Terintegrasi dengan dashboard dan hak akses per peran pengguna.
                                            </p>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-20">
                    <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h2 className="font-serif text-3xl italic text-slate-900 md:text-4xl">
                                Alur pembelajaran yang jelas
                            </h2>
                            <p className="mt-4 text-slate-600">
                                Dari penyampaian materi hingga penilaian akhir, setiap langkah dapat dilacak di
                                dalam sistem.
                            </p>
                            <ol className="mt-8 space-y-6">
                                {[
                                    {
                                        step: "1",
                                        title: "Bagikan materi & informasi",
                                        desc: "Guru mengunggah materi dan menjadwalkan kegiatan sesuai kelas.",
                                    },
                                    {
                                        step: "2",
                                        title: "Siswa belajar & mengumpulkan",
                                        desc: "Siswa mengakses materi, mengerjakan tugas, kuis, atau ujian sesuai jadwal.",
                                    },
                                    {
                                        step: "3",
                                        title: "Nilai & umpan balik",
                                        desc: "Penilaian otomatis untuk pilihan ganda; guru menilai esai bila diperlukan.",
                                    },
                                    {
                                        step: "4",
                                        title: "Rekap & tindak lanjut",
                                        desc: "Nilai terangkum untuk monitoring perkembangan dan komunikasi dengan orang tua.",
                                    },
                                ].map((item) => (
                                    <li key={item.step} className="flex gap-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 font-serif text-lg font-bold text-white shadow-md">
                                            {item.step}
                                        </span>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{item.title}</h3>
                                            <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 text-white shadow-2xl">
                            <IconDeviceAnalytics
                                className="absolute -right-6 -top-6 opacity-20"
                                size={180}
                                stroke={1}
                            />
                            <div className="relative">
                                <IconAward className="mb-4 text-amber-300" size={40} stroke={1.25} />
                                <h3 className="font-serif text-2xl italic">
                                    Mengapa satu LMS?
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-indigo-100">
                                    Mengurangi duplikasi data, menyamakan pengalaman di semua perangkat, dan
                                    memudahkan guru fokus mengajar — bukan mengurus berkas tersebar.
                                </p>
                                <ul className="mt-6 space-y-3 text-sm text-indigo-50">
                                    <li className="flex items-center gap-2">
                                        <IconCalendarTime size={18} />
                                        Jadwal & batas waktu terpusat
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconFileTypePdf size={18} />
                                        Materi & lampiran terorganisir
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <IconUsers size={18} />
                                        Peran guru, siswa, dan admin terpisah rapi
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-4 pb-24 pt-4">
                    <div className="mx-auto max-w-3xl rounded-3xl border border-indigo-200/60 bg-indigo-50/50 px-6 py-12 text-center md:px-12">
                        <h2 className="font-serif text-2xl italic text-indigo-950 md:text-3xl">
                            Siap bergabung dengan ekosistem digital SMP 3 Batang?
                        </h2>
                        <p className="mt-4 text-slate-600">
                            Login untuk guru dan staf, atau daftar sebagai siswa sesuai ketentuan sekolah.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link
                                href={route("login")}
                                className="pearlescent-gradient rounded-xl px-8 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-lg transition hover:opacity-95"
                            >
                                Login
                            </Link>
                            <Link
                                href={route("register")}
                                className="rounded-xl border border-indigo-300 bg-white px-8 py-3 text-sm font-bold uppercase tracking-widest text-indigo-900 transition hover:bg-indigo-50"
                            >
                                Daftar
                            </Link>
                        </div>
                        <Link
                            href="/"
                            className="mt-8 inline-flex items-center gap-1 text-sm font-medium text-indigo-700 hover:text-indigo-900"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            Kembali ke beranda
                        </Link>
                    </div>
                </section>

                <LandingFooter />
            </div>
        </>
    );
}
