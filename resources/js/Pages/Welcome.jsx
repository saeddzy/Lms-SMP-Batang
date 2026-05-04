import { Head, Link } from '@inertiajs/react';
import { useRef, useState } from 'react';
import LandingNavbar from '@/Components/Landing/LandingNavbar';
import LandingFooter from '@/Components/Landing/LandingFooter';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);
    const heroSwiperRef = useRef(null);

    const schoolImages = {
        hero: '/images/hero.jpg',
        building: '/images/gedung-depan-smp3-e1569509634282.jpg',
        medal: '/images/Penyerahan-Medali-KS_web.jpg',
        staff: '/images/Foto-Guru-Karyawan-2019-1-2-e1569476157519.jpeg',
        trophy: '/images/Piala-Bergilir-web.png',
    };

    const heroCarouselSlides = [
        {
            src: schoolImages.building,
            alt: 'Gedung depan sekolah',
            badge: 'Program Unggulan',
            title: 'Pembelajaran Digital & Literasi STEM',
            caption: 'Untuk masa depan yang lebih cerah dengan teknologi terkini.',
        },
        {
            src: schoolImages.medal,
            alt: 'Penyerahan medali siswa',
            badge: 'Ekstrakurikuler',
            title: 'Penguatan Karakter & Kreativitas',
            caption: 'Melalui kegiatan siswa yang aktif dan bermanfaat.',
        },
        {
            src: schoolImages.staff,
            alt: 'Foto guru dan karyawan',
            badge: 'Ruang Belajar Nyaman',
            title: 'Suasana Belajar Sehat & Aman',
            caption: 'Penuh inspirasi untuk semua siswa SMP N 3 Batang.',
        },
    ];
    const totalHeroSlides = heroCarouselSlides.length;
    const heroProgressPercent =
        totalHeroSlides > 0
            ? Math.round(((activeSlide + 1) / totalHeroSlides) * 100)
            : 0;
    const heroPrevDisabled = totalHeroSlides < 2 || activeSlide === 0;
    const heroNextDisabled =
        totalHeroSlides < 2 || activeSlide === totalHeroSlides - 1;

    const heroSlideMs = 680;
    const goHeroPrevNav = () => {
        const s = heroSwiperRef.current;
        if (!s || totalHeroSlides < 2) return;
        s.slideTo(Math.max(0, s.activeIndex - 1), heroSlideMs);
    };
    const goHeroNextNav = () => {
        const s = heroSwiperRef.current;
        if (!s || totalHeroSlides < 2) return;
        s.slideTo(Math.min(totalHeroSlides - 1, s.activeIndex + 1), heroSlideMs);
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
                            box-shadow:
                                0 40px 120px rgba(15, 23, 42, 0.16),
                                inset 0 0 0 1px rgba(255, 255, 255, 0.1),
                                inset 0 -24px 48px rgba(0, 0, 0, 0.12);
                            /* Siluet pintu: lengkungan atas (arch), sisi lurus, sudut bawah membulat */
                            border-top-left-radius: 50% 22%;
                            border-top-right-radius: 50% 22%;
                            border-bottom-left-radius: 1.25rem;
                            border-bottom-right-radius: 1.25rem;
                        }
                        @media (max-width: 767px) {
                            .hero-door {
                                /* Lengkungan lebih landai di HP agar teks judul tidak terpotong */
                                border-top-left-radius: 50% 10%;
                                border-top-right-radius: 50% 10%;
                                border-bottom-left-radius: 1rem;
                                border-bottom-right-radius: 1rem;
                                box-shadow:
                                    0 24px 64px rgba(15, 23, 42, 0.14),
                                    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
                                    inset 0 -16px 32px rgba(0, 0, 0, 0.1);
                            }
                            .landing-hero-swiper .swiper-pagination {
                                margin-top: 0.5rem;
                            }
                        }
                        @media (min-width: 768px) {
                            .hero-door {
                                border-top-left-radius: 50% 18%;
                                border-top-right-radius: 50% 18%;
                                border-bottom-left-radius: 1.75rem;
                                border-bottom-right-radius: 1.75rem;
                            }
                        }
                        @media (min-width: 1280px) {
                            .hero-door {
                                border-top-left-radius: 50% 15%;
                                border-top-right-radius: 50% 15%;
                                border-bottom-left-radius: 2rem;
                                border-bottom-right-radius: 2rem;
                            }
                        }
                        .hero-door::before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            border-radius: inherit;
                            background: linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.28) 35%, rgba(0, 0, 0, 0.05) 70%, transparent 100%);
                            pointer-events: none;
                            z-index: 1;
                        }
                        .hero-door img {
                            position: absolute;
                            top: 0;
                            left: 0;
                            z-index: 0;
                            width: 100%;
                            height: 100%;
                            object-fit: cover;
                            transform: scale(1.06);
                            filter: brightness(0.75) saturate(1.1);
                            border-radius: inherit;
                        }
                        .hamburger-icon {
                            transition: transform 0.3s ease-in-out;
                        }
                        .hamburger-icon.open {
                            transform: rotate(90deg);
                        }
                        /* Transisi geser halus (utama desktop); easing panjang di akhir biar tidak “ngejut” */
                        .landing-hero-swiper.swiper {
                            --swiper-wrapper-transition-timing-function: cubic-bezier(0.33, 1, 0.28, 1);
                        }
                        .landing-hero-swiper .swiper-pagination-bullet,
                        .landing-hero-swiper .swiper-pagination-bullet-active {
                            display: none;
                        }
                        .landing-hero-swiper .swiper-pagination {
                            position: relative !important;
                            margin-top: 0.75rem;
                            width: 100%;
                            top: auto !important;
                            left: auto !important;
                            right: auto !important;
                            bottom: auto !important;
                            transform: none !important;
                        }
                        .landing-hero-swiper .swiper-pagination-progressbar {
                            position: relative;
                            height: 0.45rem;
                            background: rgba(255, 255, 255, 0.18);
                            border-radius: 9999px;
                            overflow: hidden;
                            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
                        }
                        .landing-hero-swiper .swiper-pagination-progressbar-fill {
                            background: linear-gradient(90deg, rgba(255,255,255,0.96), rgba(255,255,255,0.85));
                            border-radius: 9999px;
                            transition: transform 0.45s ease;
                            box-shadow: inset 0 0 12px rgba(255,255,255,0.35);
                        }
                        .landing-hero-swiper .swiper-pagination-progressbar::before {
                            content: '';
                            position: absolute;
                            inset: 0;
                            border-radius: 9999px;
                            background: linear-gradient(90deg, rgba(255,255,255,0.12), transparent 55%);
                            pointer-events: none;
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
                            .landing-hero-swiper .swiper-pagination-progressbar {
                                height: 0.28rem;
                            }
                        }
                    `
                }} />
            </Head>
            <div className="bg-surface text-on-surface overflow-x-hidden">
                <LandingNavbar
                    key={auth?.user?.id ?? "guest"}
                    auth={auth}
                    current="home"
                />
                <main>
                    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pb-8 pt-24 sm:px-6 sm:pt-28 md:pt-32">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10"></div>
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/20 rounded-full blur-[120px] -z-10"></div>
                        <div className="hero-door relative mt-12 min-h-[min(92dvh,620px)] w-full max-w-6xl md:mt-20 md:h-[920px] md:min-h-0">
                            <img alt="SMP Negeri 3 Batang" src={schoolImages.hero} />
                            <div className="absolute inset-0 z-[2] rounded-[inherit] bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent" />
                            <div className="absolute inset-0 z-[3] flex min-h-full flex-col justify-between px-4 py-6 sm:px-6 sm:py-8 md:items-center md:justify-center md:py-10">
                                <div className="mx-auto w-full max-w-4xl shrink-0 space-y-3 pt-5 text-center sm:pt-0 sm:space-y-5 md:space-y-8">
                                    <span className="block text-[10px] uppercase leading-relaxed tracking-[0.22em] text-white/75 font-label sm:text-xs sm:tracking-[0.3em] md:tracking-[0.35em]">
                                        Sekolah Menengah Pertama Negeri 3 Batang
                                    </span>
                                    <h1 className="mx-auto max-w-3xl font-serif text-[1.5rem] font-light italic leading-[1.25] tracking-tight text-white sm:text-3xl md:text-5xl lg:text-6xl">
                                        Membangun Generasi <br className="hidden sm:block" />
                                        Unggul dalam <span className="text-cyan-200">Semangat Kebangsaan</span>
                                    </h1>
                                    <p className="mx-auto max-w-xl px-1 font-body text-xs leading-relaxed tracking-tight text-white/80 sm:px-0 sm:text-sm md:text-base">
                                        Menyatukan prestasi akademik dan karakter mulia di lingkungan belajar yang inspiratif dan berwawasan lokal.
                                    </p>
                                </div>
                                <div className="mt-4 w-full shrink-0 pb-1 pt-0 sm:mt-6 md:mt-10 md:pb-0">
                                        <div className="mx-auto flex w-full max-w-full items-stretch gap-2 sm:max-w-[588px] sm:items-start sm:gap-4 sm:px-0 md:max-w-[720px] lg:max-w-[952px] lg:gap-4 xl:max-w-[1080px] 2xl:max-w-[1280px]">
                                            <div className="min-w-0 flex-1">
                                                <Swiper
                                                    modules={[Autoplay, Pagination]}
                                                    dir="ltr"
                                                    speed={680}
                                                    grabCursor
                                                    simulateTouch
                                                    followFinger
                                                    resistanceRatio={0.85}
                                                    slidesPerView="auto"
                                                    centeredSlides
                                                    centerInsufficientSlides
                                                    spaceBetween={8}
                                                    loop={false}
                                                    watchOverflow={false}
                                                    keyboard={{ enabled: true, onlyInViewport: true }}
                                                    autoplay={{
                                                        delay: 4200,
                                                        disableOnInteraction: false,
                                                        pauseOnMouseEnter: true,
                                                        waitForTransition: true,
                                                        stopOnLastSlide: true,
                                                    }}
                                                    pagination={{ type: 'progressbar' }}
                                                    breakpoints={{
                                                        640: {
                                                            slidesPerView: 'auto',
                                                            centeredSlides: false,
                                                            centerInsufficientSlides: false,
                                                            spaceBetween: 10,
                                                            slidesOffsetAfter: 480,
                                                            snapToSlideEdge: true,
                                                        },
                                                    }}
                                                    onSwiper={(swiper) => {
                                                        heroSwiperRef.current = swiper;
                                                        setActiveSlide(swiper.activeIndex);
                                                        requestAnimationFrame(() => {
                                                            swiper.update();
                                                        });
                                                    }}
                                                    onSlideChange={(swiper) =>
                                                        setActiveSlide(swiper.activeIndex)
                                                    }
                                                    className="landing-hero-swiper swiper-backface-hidden pb-1"
                                                >
                                                    {heroCarouselSlides.map((slide) => (
                                                        <SwiperSlide
                                                            key={slide.src}
                                                            className="!box-border !h-auto !w-[min(100%,calc(100vw-2.75rem))] !max-w-full !shrink-0 sm:!w-[300px] md:!w-[320px] md:!max-w-[320px] lg:!w-[400px] lg:!max-w-[400px] xl:!w-[470px] xl:!max-w-[470px]"
                                                        >
                                                            <div className="relative aspect-[1.65/1] w-full overflow-hidden rounded-lg shadow-2xl sm:rounded-xl sm:aspect-[1.8/1] lg:aspect-[2/1] lg:rounded-2xl">
                                                                <img
                                                                    src={slide.src}
                                                                    alt={slide.alt}
                                                                    width={800}
                                                                    height={450}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                                                                <div className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-4 md:p-5">
                                                                    <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-cyan-200 sm:text-[9px] sm:tracking-[0.28em] md:text-[10px] md:tracking-[0.35em]">
                                                                        {slide.badge}
                                                                    </span>
                                                                    <h3 className="mt-1 text-xs font-semibold leading-snug sm:mt-1.5 sm:text-sm md:mt-2 md:text-base">
                                                                        {slide.title}
                                                                    </h3>
                                                                    <p className="mt-0.5 line-clamp-2 text-[10px] text-white/85 sm:mt-1 sm:text-[11px] md:text-xs">
                                                                        {slide.caption}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>
                                                    ))}
                                                </Swiper>

                                                <div className="mx-auto mt-3 flex w-full max-w-md flex-col items-center gap-3 sm:mt-6 md:mt-8 md:max-w-none xl:mt-10">
                                                    <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-center sm:gap-5 xl:justify-center">
                                                        <button
                                                            type="button"
                                                            aria-label="Slide sebelumnya"
                                                            aria-disabled={heroPrevDisabled}
                                                            disabled={heroPrevDisabled}
                                                            onClick={goHeroPrevNav}
                                                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-white/35 active:scale-95 disabled:pointer-events-none disabled:scale-90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:opacity-35 disabled:shadow-none disabled:grayscale disabled:saturate-0 sm:h-[42px] sm:w-[42px]"
                                                        >
                                                            <svg
                                                                width="7"
                                                                height="10"
                                                                viewBox="0 0 7 10"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                aria-hidden
                                                            >
                                                                <path
                                                                    d="M3.328 4.99984L6.157 7.82784L4.743 9.24284L0.5 4.99984L4.743 0.756836L6.157 2.17184L3.328 4.99984Z"
                                                                    fill="currentColor"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <p
                                                            className="min-w-[3.5rem] text-center font-sans text-xs font-semibold tabular-nums tracking-widest text-white/90 sm:hidden"
                                                            aria-live="polite"
                                                        >
                                                            {String(activeSlide + 1).padStart(2, '0')}
                                                            <span className="mx-1 text-white/45">/</span>
                                                            {String(totalHeroSlides).padStart(2, '0')}
                                                        </p>
                                                        <button
                                                            type="button"
                                                            aria-label="Slide berikutnya"
                                                            aria-disabled={heroNextDisabled}
                                                            disabled={heroNextDisabled}
                                                            onClick={goHeroNextNav}
                                                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-white shadow-sm transition-all duration-200 ease-out hover:scale-105 hover:bg-white/35 active:scale-95 disabled:pointer-events-none disabled:scale-90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:opacity-35 disabled:shadow-none disabled:grayscale disabled:saturate-0 sm:h-[42px] sm:w-[42px]"
                                                        >
                                                            <svg
                                                                width="7"
                                                                height="10"
                                                                viewBox="0 0 7 10"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                aria-hidden
                                                            >
                                                                <path
                                                                    d="M3.67177 4.99984L0.842773 2.17184L2.25677 0.756836L6.49977 4.99984L2.25677 9.24284L0.842773 7.82784L3.67177 4.99984Z"
                                                                    fill="currentColor"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden h-[200px] w-fit shrink-0 flex-col items-center justify-between gap-3 self-center sm:flex sm:h-[320px] md:h-[220px] lg:h-[240px] xl:h-[280px] xl:gap-8">
                                                <p className="flex rotate-90 flex-row justify-center font-sans text-xl font-bold leading-7 text-white sm:text-2xl sm:leading-8 md:mt-0 xl:self-center xl:text-[37px] xl:leading-[44px]">
                                                    {String(activeSlide + 1).padStart(2, '0')}
                                                </p>
                                                <div className="w-1 flex-1 overflow-hidden rounded-sm bg-white/35">
                                                    <div
                                                        className="w-full rounded-sm bg-white transition-all duration-200 ease-out"
                                                        style={{
                                                            height: `${heroProgressPercent}%`,
                                                        }}
                                                    />
                                                </div>
                                                <p className="flex rotate-90 flex-row justify-center font-sans text-xl font-bold leading-7 text-white sm:text-2xl sm:leading-8 md:mt-0 xl:self-center xl:text-[37px] xl:leading-[44px]">
                                                    {String(totalHeroSlides).padStart(2, '0')}
                                                </p>
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
                                    <p className="text-on-surface-variant max-w-md">Program akademik dan ekstrakurikuler yang dirancang untuk memperkuat karakter, kompetensi, dan kebanggaan siswa SMP N 3 Batang.</p>
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
                                        <p className="text-on-surface-variant max-w-xs">Kurikulum kami dirancang untuk membentuk kemampuan akademik dan karakter siswa secara seimbang di SMP N 3 Batang.</p>
                                    </div>
                                    <div className="relative z-10">
                                        <img className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform duration-300" alt="Piala bergilir SMP N 3 Batang" src={schoolImages.trophy} />
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
                                        <p className="text-sm opacity-60 uppercase tracking-widest">Motto SMP N 3 Batang</p>
                                        <div className="h-px bg-on-primary/20 w-full"></div>
                                    </div>
                                </div>
                                <div className="md:col-span-8 relative overflow-hidden h-[450px] shadow-xl hover:shadow-2xl transition-shadow duration-300" style={{ clipPath: 'polygon(0 0, 90% 0, 100% 15%, 100% 85%, 90% 100%, 0 100%, 0 15%)' }}>
                                    <img className="w-full h-full object-cover" alt="Kegiatan siswa dan guru" src={schoolImages.staff} />
                                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center p-12">
                                        <div className="max-w-md text-center space-y-6">
                                            <h3 className="text-3xl font-serif text-white">Laboratorium Kreatif</h3>
                                            <p className="text-white/80">Ruang belajar dan praktek yang mendukung eksplorasi sains, seni, dan teknologi bagi siswa SMP N 3 Batang.</p>
                                            <button className="bg-white text-primary px-8 py-3 rounded-full text-xs uppercase tracking-widest font-bold hover:opacity-90 hover:scale-105 transition-all active:scale-95">Pelajari Lebih Lanjut</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="overflow-hidden bg-surface py-32 px-6 md:px-12">
                        <div className="mx-auto flex max-w-7xl flex-col items-stretch gap-16 md:flex-row md:items-center md:gap-20 lg:gap-24">
                            <div className="flex-1 space-y-8 md:max-w-xl lg:max-w-2xl">
                                <div className="space-y-4">
                                    <span className="text-xs font-medium uppercase tracking-[0.4em] text-on-surface-variant">
                                        Sistem Informasi Sekolah
                                    </span>
                                    <h2 className="font-serif text-4xl italic leading-tight text-primary md:text-5xl">
                                        Kemajuan yang Dikelola dengan Jelas
                                    </h2>
                                    <p className="max-w-md leading-relaxed text-on-surface-variant">
                                        Laporan dan wawasan akademik untuk orang tua dan guru menampilkan perkembangan siswa secara ringkas dan mudah dipahami di SMP Negeri 3 Batang.
                                    </p>
                                </div>
                                <ul className="space-y-5 border-t border-outline-variant/20 pt-8">
                                    <li className="flex items-start gap-3 text-on-surface">
                                        <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-primary">
                                            check_circle
                                        </span>
                                        <span className="leading-relaxed">
                                            Monitoring kegiatan belajar dan tugas secara berkala.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-on-surface">
                                        <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-primary">
                                            check_circle
                                        </span>
                                        <span className="leading-relaxed">
                                            Jalur prestasi dan penghargaan siswa yang terdokumentasi.
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-on-surface">
                                        <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-primary">
                                            check_circle
                                        </span>
                                        <span className="leading-relaxed">
                                            Arsip portofolio kegiatan untuk rapor dan evaluasi bersama orang tua.
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <div className="relative mx-auto w-full max-w-md flex-1 md:mx-0 md:max-w-none">
                                <div className="relative flex aspect-square w-full items-center justify-center rounded-full border border-outline-variant/20 p-10 md:p-12">
                                    <div className="absolute inset-0 rounded-full border-[28px] border-secondary-container/10 md:border-[40px]" />
                                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/5 to-secondary/10">
                                        <svg
                                            className="h-full w-full -rotate-90 transform"
                                            viewBox="0 0 220 220"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden
                                        >
                                            <circle
                                                className="text-outline-variant/30"
                                                cx="110"
                                                cy="110"
                                                r="70"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeWidth="1"
                                            />
                                            <circle
                                                className="text-primary"
                                                cx="110"
                                                cy="110"
                                                r="70"
                                                fill="transparent"
                                                stroke="currentColor"
                                                strokeDasharray="439.82"
                                                strokeDashoffset="105"
                                                strokeLinecap="round"
                                                strokeWidth="6"
                                            />
                                        </svg>
                                        <div className="absolute space-y-1 text-center">
                                            <span className="font-serif text-4xl italic text-primary">92%</span>
                                            <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-on-surface-variant">
                                                Penguasaan capaian
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="glass-card absolute right-0 top-8 rounded-xl px-5 py-3 shadow-lg md:top-10 md:px-6">
                                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                                        Bahasa &amp; Literasi
                                    </span>
                                </div>
                                <div className="glass-card absolute -left-4 bottom-16 rounded-xl px-5 py-3 shadow-lg md:-left-10 md:bottom-20 md:px-6">
                                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                                        Matematika &amp; IPA
                                    </span>
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
                                    Tim Pengajar SMP N 3 Batang
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
                        <img className="absolute inset-0 w-full h-full object-cover grayscale opacity-20" alt="Gedung SMP N 3 Batang" src={schoolImages.building} />
                        <div className="absolute inset-0 bg-primary/10"></div>
                        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
                            <h2 className="text-5xl md:text-7xl font-serif italic text-primary">Bergabung Bersama SMP N 3 Batang</h2>
                            <p className="text-xl text-on-surface-variant max-w-xl mx-auto">Pendaftaran siswa baru dibuka, mari wujudkan potensi akademik dan karakter di lingkungan sekolah kami.</p>
                            <div className="flex justify-center">
                                <Link href={route('register')} className="pearlescent-gradient text-on-primary px-16 py-6 rounded-xl text-sm uppercase tracking-[0.2em] font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                    Daftar Sekarang
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>
                <LandingFooter />
            </div>
        </>
    );
}
