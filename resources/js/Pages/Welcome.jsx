import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectCoverflow } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const totalSlides = 3;

    const authButton = auth?.user
        ? { href: route('dashboard'), label: 'Dashboard' }
        : { href: route('login'), label: 'Login' };
    const schoolImages = {
        building: '/images/gedung-depan-smp3-e1569509634282.jpg',
        medal: '/images/Penyerahan-Medali-KS_web.jpg',
        staff: '/images/Foto-Guru-Karyawan-2019-1-2-e1569476157519.jpeg',
        trophy: '/images/Piala-Bergilir-web.png',
    };
    const fileUrl = (path) => encodeURI(path).replace(/\+/g, '%2B');
    const normalizeLabel = (text) =>
        text
            .replace(/[-_]+/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\bWali kelas\b/gi, 'Wali Kelas')
            .replace(/\bGuru\b/gi, 'Guru')
            .trim();
    const buildTeacherProfile = (path) => {
        const rawName = decodeURIComponent(path)
            .replace('/images/guru/', '')
            .replace(/\.(png|jpe?g|webp)$/i, '')
            .replace(/\bscaled\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
        const [namePart, rolePart] = rawName.split(/\s+Guru\s+/i);
        const name = normalizeLabel(namePart || rawName);
        const role = rolePart
            ? `Guru ${normalizeLabel(rolePart)}`
            : 'Guru SMP Negeri 3 Batang';

        return {
            name,
            role,
            description: 'Mendampingi siswa berkembang secara akademik, karakter, dan keterampilan hidup di lingkungan sekolah yang suportif.',
            photo: fileUrl(path),
        };
    };
    const principal = {
        name: 'Budiyatmaka',
        role: 'Kepala Sekolah',
        description: 'Memimpin transformasi pembelajaran yang berfokus pada karakter, prestasi, dan budaya sekolah yang positif.',
        photo: fileUrl('/images/guru/Budiyatmaka-kepala sekolah.png'),
    };
    const teacherImagePaths = [
        '/images/guru/Umi-Haniin-S.-Pd Guru IPA + Wali Kelas 7 A.jpg',
        '/images/guru/Sinta-Kusumawati-S.-Pd Guru Seni Budaya + Ur. Humas.jpg',
        '/images/guru/Margining-Utami-S.-Pd Guru B. Indonesia + Ka Perpus + BOS.jpg',
        '/images/guru/Pratama-Imanda-S.Pd-M.M Guru Seni Budaya + Ur. Kurikulum.png',
        '/images/guru/Mursito-Adi-S.-Pd Guru PJOK + Ur. Kesiswaan.png',
        '/images/guru/Nufindah-Pribadi-S.-Pd-M.-Pd Guru IPS Wali Kelas VIII D.jpg',
        '/images/guru/Dita-Isfandiari-S.-Psi-MM Guru BK Wali Kelas 9 C.jpg',
        '/images/guru/Muhammad-Labib-M.-Pd-scaled Guru PAI + Sarpras + Wali Kelas 9A.jpg',
        '/images/guru/Mahardika-Adhi-Filando-S.-Pd Guru B. indonesia + Wali Kelas 9 G.jpg',
        '/images/guru/Yudha-Anggarina-K-S.-Pd Guru PJOK + WKS2.jpg',
        '/images/guru/Mohamad-Yakop-SE-M.Kom_ Guru IPS + WKS.jpg',
        '/images/guru/Mohammad-Gurawan-S.-Pd-M.-Pd Wali kelas 8B.jpg',
        '/images/guru/Sabar-S.-Pd-MT Guru Bahasa Inggris.jpg',
        '/images/guru/Khaerodin-S.-Pd Guru B. Inggris.jpg',
        '/images/guru/Erma-Fatmawati-S.-Pd Guru IPA + Wali Kelas 9E.jpg',
        '/images/guru/Pardi-S.-Pd Guru Matematika Wali kelas 7D.jpg',
    ];
    const teachers = teacherImagePaths.map(buildTeacherProfile);

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                <title>SMP 3 | Batang</title>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
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
                        .hero-door {
                            position: relative;
                            overflow: hidden;
                            box-shadow: 0 40px 120px rgba(15, 23, 42, 0.14);
                            clip-path: polygon(15% 0, 85% 0, 100% 10%, 100% 100%, 0 100%, 0 10%);
                        }
                        .hero-door::before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.28) 35%, rgba(0, 0, 0, 0.05) 70%, transparent 100%);
                            pointer-events: none;
                        }
                        .hero-door img {
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            transform: scale(1.06);
                            filter: brightness(0.75) saturate(1.1);
                            clip-path: inherit;
                        }
                        .hamburger-icon {
                            transition: transform 0.3s ease-in-out;
                        }
                        .hamburger-icon.open {
                            transform: rotate(90deg);
                        }
                        .carousel-swiper .swiper-button-prev,
                        .carousel-swiper .swiper-button-next {
                            color: white;
                            opacity: 0.95;
                            width: 2.5rem;
                            height: 2.5rem;
                        }
                        .carousel-swiper .swiper-button-prev::after,
                        .carousel-swiper .swiper-button-next::after {
                            font-size: 1.4rem;
                        }
                        .custom-pagination {
                            position: relative;
                            height: 0.45rem;
                            background: rgba(255, 255, 255, 0.18);
                            border-radius: 9999px;
                            overflow: hidden;
                            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
                        }
                        .custom-pagination .swiper-pagination-progressbar-fill {
                            background: linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.85));
                            border-radius: 9999px;
                            transition: width 0.45s ease;
                            box-shadow: inset 0 0 12px rgba(255,255,255,0.35);
                        }
                        .custom-pagination::before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            border-radius: 9999px;
                            background: linear-gradient(90deg, rgba(255,255,255,0.12), transparent 55%);
                            pointer-events: none;
                        }
                        .swiper-pagination-bullet,
                        .swiper-pagination-bullet-active {
                            display: none;
                        }
                        .teacher-swiper .swiper-slide {
                            height: auto;
                        }
                        .teacher-card {
                            position: relative;
                            overflow: hidden;
                            border-radius: 1.5rem;
                            height: 19rem;
                            box-shadow: 0 18px 44px rgba(2, 6, 23, 0.14);
                        }
                        .teacher-card--principal {
                            height: 21rem;
                        }
                        .teacher-card::after {
                            content: '';
                            position: absolute;
                            inset: 0;
                            background: linear-gradient(180deg, rgba(2, 6, 23, 0.05) 35%, rgba(2, 6, 23, 0.5) 100%);
                            transition: opacity 260ms ease;
                        }
                        .teacher-card img {
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            object-position: center 30%;
                            transition: transform 450ms ease;
                        }
                        .teacher-card:hover img {
                            transform: scale(1.06);
                        }
                        .teacher-card .teacher-info {
                            position: absolute;
                            left: 1rem;
                            right: 1rem;
                            bottom: 1rem;
                            z-index: 2;
                            color: white;
                            backdrop-filter: blur(8px);
                            background: rgba(15, 23, 42, 0.38);
                            border: 1px solid rgba(255,255,255,0.2);
                            border-radius: 1rem;
                            padding: 0.95rem;
                            opacity: 0;
                            transform: translateY(14px);
                            pointer-events: none;
                            transition: opacity 220ms ease, transform 260ms ease;
                        }
                        .teacher-card:hover::after {
                            opacity: 1;
                        }
                        .teacher-card:hover .teacher-info {
                            opacity: 1;
                            transform: translateY(0);
                        }
                        .teacher-card .teacher-name-inline {
                            position: absolute;
                            z-index: 2;
                            left: 1rem;
                            right: 1rem;
                            bottom: 1rem;
                            color: white;
                            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
                            transition: opacity 220ms ease, transform 260ms ease;
                        }
                        .teacher-card:hover .teacher-name-inline {
                            opacity: 0;
                            transform: translateY(8px);
                        }
                        @media (max-width: 1024px) {
                            .teacher-card,
                            .teacher-card--principal {
                                height: 18rem;
                            }
                        }
                        @media (max-width: 767px) {
                            .teacher-card,
                            .teacher-card--principal {
                                height: 16.5rem;
                            }
                            .carousel-swiper {
                                height: 15.5rem !important;
                                max-width: 100%;
                            }
                            .carousel-swiper .swiper-slide {
                                width: min(18rem, 82vw) !important;
                                height: 15.5rem !important;
                            }
                            .carousel-swiper .swiper-slide .w-full.h-full {
                                min-height: 100%;
                            }
                            .carousel-swiper {
                                touch-action: pan-y pinch-zoom;
                            }
                            .carousel-swiper .swiper-slide {
                                user-select: none;
                                touch-action: pan-y pinch-zoom;
                            }
                            .carousel-swiper .swiper-slide .p-6,
                            .carousel-swiper .swiper-slide .p-5 {
                                padding: 0.85rem !important;
                            }
                            .carousel-swiper .swiper-slide span {
                                font-size: 0.66rem;
                                letter-spacing: 0.32em;
                            }
                            .carousel-swiper .swiper-slide h3 {
                                font-size: 0.92rem;
                            }
                            .carousel-swiper .swiper-slide p {
                                font-size: 0.7rem;
                            }
                            .custom-pagination {
                                height: 0.28rem;
                            }
                            .custom-pagination + .text-white {
                                font-size: 0.9rem;
                            }
                        }
                    `
                }} />
            </Head>
            <div className="bg-surface text-on-surface overflow-x-hidden">
                <nav className="fixed inset-x-0 top-0 z-50 px-4 sm:px-6 py-3">
                    <div className="bg-white/40 backdrop-blur-xl rounded-full w-full max-w-7xl mx-auto mt-6 px-6 sm:px-8 py-3 flex items-center justify-between gap-8 sm:gap-12 shadow-[0_20px_40px_rgba(0,7,103,0.06)]">
                        <Link href="/" className="text-xl sm:text-2xl font-serif tracking-tighter text-indigo-900 hover:text-indigo-700 transition-colors flex-shrink-0">LMS SMP N 3 Batang</Link>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <a className="text-xs uppercase tracking-widest font-sans text-indigo-900 font-semibold hover:text-indigo-700 transition-all duration-300 scale-105 active:scale-95" href="/">Home</a>
                            <Link href={route('features')} className="text-xs uppercase tracking-widest font-sans text-slate-500 font-normal hover:text-indigo-700 transition-all duration-300 scale-105 active:scale-95">Fitur</Link>
                            <Link href={route('contact')} className="text-xs uppercase tracking-widest font-sans text-slate-500 font-normal hover:text-indigo-700 transition-all duration-300 scale-105 active:scale-95">Kontak</Link>
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
                            <Link href="/" className="block px-5 py-4 text-sm uppercase tracking-widest font-sans text-indigo-900 font-semibold hover:bg-white/20 rounded-3xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link href={route('features')} className="block px-5 py-4 text-sm uppercase tracking-widest font-sans text-slate-600 hover:bg-white/20 rounded-3xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
                                Fitur
                            </Link>
                            <Link href={route('contact')} className="block px-5 py-4 text-sm uppercase tracking-widest font-sans text-slate-600 hover:bg-white/20 rounded-3xl transition-all duration-300" onClick={() => setMobileMenuOpen(false)}>
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
                    <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/20 rounded-full blur-[120px] -z-10"></div>
                        <div className="mt-20 w-full max-w-6xl relative h-[620px] md:h-[920px] hero-door overflow-hidden">
                            <img alt="Gedung depan SMP 3 Batang" src={schoolImages.medal} />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent"></div>
                            <div className="absolute inset-0 flex items-center justify-center px-6 py-10">
                                <div className="max-w-4xl text-center space-y-8 text-white">
                                    <span className="text-xs uppercase tracking-[0.35em] text-white/70 font-label">Sekolah Menengah Pertama Negeri 3 Batang</span>
                                    <h1 className="text-4xl md:text-6xl font-serif italic font-light leading-snug tracking-tight text-white max-w-3xl mx-auto">
                                        Membangun Generasi <br />Unggul dalam <span className="text-cyan-200">Semangat Kebangsaan</span>
                                    </h1>
                                    <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto font-body tracking-tight leading-relaxed">
                                        Menyatukan prestasi akademik dan karakter mulia di lingkungan belajar yang inspiratif dan berwawasan lokal.
                                    </p>
                                    <div className="pt-10">
                                        <Swiper
                                            modules={[Autoplay, Pagination, EffectCoverflow]}
                                            effect="coverflow"
                                            dir="ltr"
                                            grabCursor={true}
                                            slideToClickedSlide={true}
                                            initialSlide={0}
                                            centeredSlides={true}
                                            slidesPerView="auto"
                                            loop={true}
                                            spaceBetween={16}
                                            coverflowEffect={{
                                                rotate: 50,
                                                stretch: 0,
                                                depth: 100,
                                                modifier: 1,
                                                slideShadows: true,
                                            }}
                                            touchRatio={1}
                                            simulateTouch={true}
                                            allowTouchMove={true}
                                            keyboard={{ enabled: true, onlyInViewport: true }}
                                            breakpoints={{
                                                0: { slidesPerView: 'auto', centeredSlides: true, spaceBetween: 12 },
                                                640: { slidesPerView: 'auto', centeredSlides: true, spaceBetween: 14 },
                                                768: { slidesPerView: 1.08, centeredSlides: false, spaceBetween: 16 },
                                                1024: { slidesPerView: 1.3, centeredSlides: false, spaceBetween: 18 },
                                            }}
                                            autoplay={{ delay: 4200, disableOnInteraction: false }}
                                            pagination={{ el: '.custom-pagination', type: 'progressbar', progressbarOpposite: false }}
                                            onSlideChange={(swiper) => setActiveSlide(swiper.realIndex)}
                                            className="carousel-swiper max-w-4xl mx-auto h-[22rem]"
                                        >
                                            <SwiperSlide className="w-[14rem] h-[14rem] sm:w-[15.5rem] sm:h-[15.5rem] md:w-72 md:h-[20rem]">
                                                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                                                    <img src={schoolImages.building} alt="Gedung depan sekolah" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                                        <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-4">
                                                            <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-200 font-semibold">Program Unggulan</span>
                                                            <h3 className="mt-3 text-lg font-semibold leading-tight">Pembelajaran Digital & Literasi STEM</h3>
                                                            <p className="mt-2 text-xs md:text-sm text-white/80">Untuk masa depan yang lebih cerah dengan teknologi terkini.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                            <SwiperSlide className="w-[14rem] h-[14rem] sm:w-[15.5rem] sm:h-[15.5rem] md:w-72 md:h-[20rem]">
                                                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                                                    <img src={schoolImages.medal} alt="Penyerahan medali siswa" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                                        <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-4">
                                                            <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-200 font-semibold">Ekstrakurikuler</span>
                                                            <h3 className="mt-3 text-lg font-semibold leading-tight">Penguatan Karakter & Kreativitas</h3>
                                                            <p className="mt-2 text-xs md:text-sm text-white/80">Melalui kegiatan siswa yang aktif dan bermanfaat.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                            <SwiperSlide className="w-[14rem] h-[14rem] sm:w-[15.5rem] sm:h-[15.5rem] md:w-72 md:h-[20rem]">
                                                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
                                                    <img src={schoolImages.staff} alt="Foto guru dan karyawan" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                                        <div className="backdrop-blur-sm bg-black/30 rounded-2xl p-4">
                                                            <span className="text-[10px] uppercase tracking-[0.35em] text-cyan-200 font-semibold">Ruang Belajar Nyaman</span>
                                                            <h3 className="mt-3 text-lg font-semibold leading-tight">Suasana Belajar Sehat & Aman</h3>
                                                            <p className="mt-2 text-xs md:text-sm text-white/80">Penuh inspirasi untuk semua siswa SMP 3 Batang.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        </Swiper>
                                        <div className="mt-6 flex items-center gap-4">
                                            <div className="custom-pagination w-full h-2 rounded-full bg-white/15 overflow-hidden"></div>
                                            <div className="text-white text-2xl font-semibold tracking-tight">0{activeSlide + 1}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="py-32 px-6 md:px-12 bg-surface-container-low">
                        <div className="max-w-7xl mx-auto space-y-20">
                            <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                                <div className="space-y-4">
                                    <h2 className="text-4xl md:text-5xl font-serif italic text-primary">Pengalaman Pendidikan Terpadu</h2>
                                    <p className="text-on-surface-variant max-w-md">Program akademik dan ekstrakurikuler yang dirancang untuk memperkuat karakter, kompetensi, dan kebanggaan siswa SMP 3 Batang.</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8" id="archive">
                                <div className="md:col-span-8 group relative overflow-hidden bg-surface-container-lowest p-12 flex flex-col justify-between h-[500px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" style={{ clipPath: 'polygon(0 0, 95% 0, 100% 10%, 100% 90%, 95% 100%, 0 100%, 0 10%)' }}>
                                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <span className="material-symbols-outlined text-[120px]">architecture</span>
                                    </div>
                                    <div className="relative z-10 space-y-4">
                                        <span className="text-xs uppercase tracking-widest text-primary font-bold">Kurikulum Unggul</span>
                                        <h3 className="text-3xl font-serif">Pendekatan Pembelajaran Terstruktur</h3>
                                        <p className="text-on-surface-variant max-w-xs">Kurikulum kami dirancang untuk membentuk kemampuan akademik dan karakter siswa secara seimbang di SMP 3 Batang.</p>
                                    </div>
                                    <div className="relative z-10">
                                        <img className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300" alt="Piala bergilir SMP 3 Batang" src={schoolImages.trophy} />
                                    </div>
                                </div>
                                <div className="md:col-span-4 glass-card p-10 flex flex-col justify-center gap-8 h-[500px] shadow-[0_20px_40px_rgba(0,7,103,0.04)] hover:shadow-[0_30px_60px_rgba(0,7,103,0.08)] hover:-translate-y-1 transition-all duration-300" style={{ clipPath: 'polygon(0 0, 85% 0, 100% 20%, 100% 100%, 0 100%, 0 20%)' }}>
                                    <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
                                        <span className="material-symbols-outlined text-on-secondary-container">auto_awesome</span>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-serif">Prestasi Tercatat</h3>
                                        <p className="text-sm text-on-surface-variant leading-relaxed">Laporan capaian belajar lengkap untuk mendukung pemantauan perkembangan siswa di sekolah kami.</p>
                                    </div>
                                    <div className="pt-4 h-32 flex items-end gap-2">
                                        <div className="flex-1 bg-primary/10 rounded-t-full h-[40%] transition-all hover:h-[60%]"></div>
                                        <div className="flex-1 bg-primary/20 rounded-t-full h-[70%] transition-all hover:h-[85%]"></div>
                                        <div className="flex-1 bg-primary/15 rounded-t-full h-[55%] transition-all hover:h-[70%]"></div>
                                        <div className="flex-1 bg-primary/30 rounded-t-full h-[90%] transition-all hover:h-[100%]"></div>
                                        <div className="flex-1 bg-primary/25 rounded-t-full h-[65%] transition-all hover:h-[80%]"></div>
                                    </div>
                                </div>
                                <div className="md:col-span-4 bg-primary text-on-primary p-10 flex flex-col justify-between h-[450px] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" style={{ clipPath: 'polygon(0 0, 80% 0, 100% 25%, 100% 100%, 0 100%, 0 25%)' }}>
                                    <h3 className="text-2xl font-serif italic">&ldquo;SMART SCHOOL&rdquo;</h3>
                                    <p className="text-sm text-on-primary/85 leading-relaxed">
                                        Spirit for Marvelous, Aspiring, Responsive, and Trusted School.
                                    </p>
                                    <div className="space-y-4">
                                        <p className="text-sm opacity-60 uppercase tracking-widest">Motto SMP 3 Batang</p>
                                        <div className="h-px bg-on-primary/20 w-full"></div>
                                    </div>
                                </div>
                                <div className="md:col-span-8 relative overflow-hidden h-[450px] shadow-xl hover:shadow-2xl transition-shadow duration-300" style={{ clipPath: 'polygon(0 0, 90% 0, 100% 15%, 100% 85%, 90% 100%, 0 100%, 0 15%)' }}>
                                    <img className="w-full h-full object-cover" alt="Kegiatan siswa dan guru" src={schoolImages.staff} />
                                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-12">
                                        <div className="max-w-md text-center space-y-6">
                                            <h3 className="text-3xl font-serif text-white">Laboratorium Kreatif</h3>
                                            <p className="text-white/80">Ruang belajar dan praktek yang mendukung eksplorasi sains, seni, dan teknologi bagi siswa SMP 3 Batang.</p>
                                            <button className="bg-white text-primary px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold hover:opacity-90 hover:scale-105 transition-all active:scale-95">Pelajari Lebih Lanjut</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="py-32 bg-surface overflow-hidden">
                        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-20">
                            <div className="flex-1 space-y-8">
                                <span className="text-xs uppercase tracking-[0.4em] text-on-surface-variant">Sistem Informasi Sekolah</span>
                                <h2 className="text-5xl font-serif italic leading-tight text-primary">Kemajuan yang <br />Dikelola dengan Jelas</h2>
                                <p className="text-lg text-on-surface-variant leading-relaxed">Laporan dan insight akademik untuk orang tua dan guru, menampilkan perkembangan siswa secara ringkas dan mudah dipahami.</p>
                                <ul className="space-y-6 pt-4">
                                    <li className="flex items-center gap-4 text-on-surface">
                                        <span className="material-symbols-outlined text-primary">lens</span>
                                        <span className="tracking-tight font-medium">Monitoring Kegiatan Belajar</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-on-surface">
                                        <span className="material-symbols-outlined text-primary">lens</span>
                                        <span className="tracking-tight font-medium">Jalur Prestasi Siswa</span>
                                    </li>
                                    <li className="flex items-center gap-4 text-on-surface">
                                        <span className="material-symbols-outlined text-primary">lens</span>
                                        <span className="tracking-tight font-medium">Arsip Portofolio Kegiatan</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex-1 relative">
                                <div className="relative w-full aspect-square rounded-full border border-outline-variant/20 flex items-center justify-center p-12">
                                    <div className="absolute inset-0 border-[40px] border-secondary-container/10 rounded-full"></div>
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/5 to-secondary/10 flex items-center justify-center relative">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="text-outline-variant/30" cx="110" cy="110" r="70" fill="transparent" stroke="currentColor" strokeWidth="1" />
                                            <circle className="text-primary" cx="110" cy="110" r="70" fill="transparent" stroke="currentColor" strokeDasharray="439.82" strokeDashoffset="105" strokeLinecap="round" strokeWidth="6" />
                                        </svg>
                                        <div className="absolute text-center space-y-1">
                                            <span className="text-4xl font-serif italic text-primary">92%</span>
                                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Mastery</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-10 right-0 glass-card px-6 py-3 rounded-xl shadow-lg">
                                    <span className="text-xs font-serif italic">Bahasa &amp; Literasi</span>
                                </div>
                                <div className="absolute bottom-20 -left-10 glass-card px-6 py-3 rounded-xl shadow-lg">
                                    <span className="text-xs font-serif italic">Matematika &amp; IPA</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="py-40 bg-surface-container-low px-6">
                        <div className="max-w-4xl mx-auto space-y-20 text-center">
                            <div className="space-y-8">
                                <span className="text-xs uppercase tracking-[0.5em] text-on-surface-variant">Visi</span>
                                <blockquote className="text-2xl md:text-3xl lg:text-4xl font-serif italic font-light text-primary leading-snug">
                                    &ldquo;Terwujudnya Layanan Prima untuk Mencetak Generasi Yang Unggul dalam Prestasi, Cinta Lingkungan dan Budaya, Berlandaskan Iman dan Taqwa&rdquo;
                                </blockquote>
                            </div>
                            <div className="h-px bg-outline-variant/30 w-24 mx-auto"></div>
                            <div className="space-y-8 text-left max-w-3xl mx-auto">
                                <span className="block text-center text-xs uppercase tracking-[0.5em] text-on-surface-variant">Misi</span>
                                <ol className="list-decimal list-outside space-y-5 pl-6 md:pl-8 text-base md:text-lg text-primary/90 leading-relaxed font-light">
                                    <li>Mewujudkan peserta didik yang berakhlak mulia, berprestasi, dan berkualitas dengan kecerdasan spiritual, emosional, dan intelektual.</li>
                                    <li>Meningkatkan kualitas kurikulum untuk menciptakan budaya mutu di sekolah dengan pelaksanaan penguatan pendidikan karakter.</li>
                                    <li>Menerapkan strategi pembelajaran yang kreatif, inovatif dan menyenangkan berbasis pada lingkungan dan kearifan lokal yang menuju daya saing global.</li>
                                    <li>Mengembangkan sistem penilaian yang terprogram dan terencana berbasis Teknologi Informasi (IT).</li>
                                    <li>Mewujudkan kualitas tenaga pendidik dan kependidikan yang profesional, berintegritas dan berkepribadian mulia.</li>
                                    <li>Meningkatkan sarana dan prasarana sekolah untuk menciptakan suasana yang kondusif sehingga dapat menumbuhkan minat baca, mencintai lingkungan, kreatif dalam berkreasi dan terampil dalam berkarya serta berbudaya.</li>
                                    <li>Mengembangkan pengelolaan sekolah untuk meningkatkan kualitas sekolah dalam memberikan pelayanan prima pendidikan.</li>
                                </ol>
                            </div>
                            <div className="h-px bg-outline-variant/30 w-24 mx-auto"></div>
                            <div className="space-y-6">
                                <span className="text-xs uppercase tracking-[0.5em] text-on-surface-variant">Motto</span>
                                <p className="text-3xl md:text-4xl font-serif italic font-semibold text-primary">&ldquo;SMART SCHOOL&rdquo;</p>
                                <p className="text-sm md:text-base text-on-surface-variant leading-relaxed max-w-2xl mx-auto">
                                    Spirit for Marvelous, Aspiring, Responsive, and Trusted School (Sekolah yang memiliki Semangat yang Hebat, Bercita-cita Tinggi, Cepat Tanggap, dan Terpercaya)
                                </p>
                            </div>
                        </div>
                    </section>
                    <section className="py-28 px-6 bg-surface">
                        <div className="max-w-7xl mx-auto space-y-12">
                            <div className="text-center space-y-4">
                                <span className="text-xs uppercase tracking-[0.4em] text-on-surface-variant">
                                    Tim Pengajar SMP 3 Batang
                                </span>
                                <h2 className="text-4xl md:text-5xl font-serif italic text-primary">
                                    Kepala Sekolah & Guru-Guru Inspiratif
                                </h2>
                                <p className="text-on-surface-variant max-w-2xl mx-auto">
                                    Mengenal sosok pendidik yang membimbing, menginspirasi, dan membersamai perjalanan belajar siswa setiap hari.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                                <div className="lg:col-span-4">
                                    <article className="teacher-card teacher-card--principal max-w-md">
                                        <img src={principal.photo} alt={principal.name} />
                                        <div className="teacher-name-inline">
                                            <h3 className="text-xl font-serif">{principal.name}</h3>
                                            <p className="text-xs text-white/90">{principal.role}</p>
                                        </div>
                                        <div className="teacher-info">
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200">
                                                Kepemimpinan Sekolah
                                            </p>
                                            <h3 className="mt-2 text-2xl font-serif">{principal.name}</h3>
                                            <p className="text-sm text-white/90">{principal.role}</p>
                                            <p className="mt-2 text-xs leading-relaxed text-white/85">
                                                {principal.description}
                                            </p>
                                        </div>
                                    </article>
                                </div>

                                <div className="lg:col-span-8">
                                    <Swiper
                                        modules={[Autoplay]}
                                        spaceBetween={14}
                                        slidesPerView={1}
                                        loop={teachers.length > 1}
                                        autoplay={{ delay: 3200, disableOnInteraction: false }}
                                        breakpoints={{
                                            768: { slidesPerView: 1.4 },
                                            1024: { slidesPerView: 2 },
                                            1280: { slidesPerView: 2.2 },
                                        }}
                                        className="teacher-swiper"
                                    >
                                        {teachers.map((teacher) => (
                                            <SwiperSlide key={teacher.name}>
                                                <article className="teacher-card">
                                                    <img src={teacher.photo} alt={teacher.name} />
                                                    <div className="teacher-name-inline">
                                                        <h3 className="text-lg font-serif">{teacher.name}</h3>
                                                        <p className="text-xs text-white/90">{teacher.role}</p>
                                                    </div>
                                                    <div className="teacher-info">
                                                        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-200">
                                                            Profil Guru
                                                        </p>
                                                        <h3 className="mt-2 text-xl font-serif">{teacher.name}</h3>
                                                        <p className="text-sm text-white/90">{teacher.role}</p>
                                                        <p className="mt-2 text-xs leading-relaxed text-white/85">
                                                            {teacher.description}
                                                        </p>
                                                    </div>
                                                </article>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="relative py-48 px-6 overflow-hidden">
                        <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-20" alt="Gedung SMP 3 Batang" src={schoolImages.building} />
                        <div className="absolute inset-0 bg-primary/10"></div>
                        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
                            <h2 className="text-5xl md:text-7xl font-serif italic text-primary">Bergabung Bersama SMP 3 Batang</h2>
                            <p className="text-xl text-on-surface-variant max-w-xl mx-auto">Pendaftaran siswa baru dibuka, mari wujudkan potensi akademik dan karakter di lingkungan sekolah kami.</p>
                            <div className="flex justify-center">
                                <Link href={route('register')} className="pearlescent-gradient text-on-primary px-16 py-6 rounded-xl text-sm uppercase tracking-[0.2em] font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                    Daftar Sekarang
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
                <footer className="bg-[#f4f3f1] w-full px-12 md:px-24 flex flex-col items-start gap-20 pt-32 pb-16">
                    <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
                        <div className="space-y-10">
                            <div className="space-y-6">
                                <span className="text-4xl font-serif italic text-indigo-900">SMP 3 Batang</span>
                                <p className="font-serif text-lg text-indigo-900 max-w-xs">Menjadi pusat pendidikan yang kuat dalam prestasi, karakter, dan kebanggaan daerah.</p>
                            </div>
                            <div className="space-y-1 text-sm text-slate-700">
                                <p><span className="font-semibold text-indigo-900">Alamat:</span> Jl. Ki. Mangunsarkoro No. 6 Proyonanggan Selatan</p>
                                <p>Batang - Jawa Tengah - Indonesia</p>
                                <p><span className="font-semibold text-indigo-900">Kode Pos:</span> 51211</p>
                                <p><span className="font-semibold text-indigo-900">Telepon:</span> 0285-391422</p>
                                <p><span className="font-semibold text-indigo-900">Fax:</span> 0285-391422</p>
                                <p><span className="font-semibold text-indigo-900">Posmail:</span> smptigabatang@gmail.cccom</p>
                                <p>
                                    <span className="font-semibold text-indigo-900">Website:</span>{" "}
                                    <a
                                        href="https://www.smpn3batang.sch.id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-800 underline hover:text-indigo-600"
                                    >
                                        www.smpn3batang.sch.id
                                    </a>
                                </p>
                                <p>
                                    <span className="font-semibold text-indigo-900">Administrator:</span>{" "}
                                    <a
                                        href="mailto:madya15@gmail.com"
                                        className="text-indigo-800 underline hover:text-indigo-600"
                                    >
                                        madya15@gmail.com
                                    </a>
                                </p>
                            </div>
                        </div>
                        <div className="w-full">
                            <p className="mb-4 font-sans tracking-tight text-slate-500 text-sm">
                                Lokasi Sekolah
                            </p>
                            <div className="overflow-hidden rounded-2xl border border-indigo-100 shadow-sm">
                                <iframe
                                    title="Lokasi SMP N 3 Batang"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.7498867103236!2d109.72903811323248!3d-6.920475169654714!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x6b7184d9fc3822fd!2sSMP%20N%203%20BATANG!5e0!3m2!1sid!2sid!4v1569472653245!5m2!1sid!2sid"
                                    className="h-[280px] w-full"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full pt-16 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-6">
                        <span className="text-slate-500 font-sans tracking-tight text-sm">© 2026 SMP Negeri 3 Batang. Pendidikan untuk Generasi Emas.</span>
                        <div className="flex gap-8">
                            <span className="material-symbols-outlined text-indigo-900/50">brush</span>
                            <span className="material-symbols-outlined text-indigo-900/50">book</span>
                            <span className="material-symbols-outlined text-indigo-900/50">school</span>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
