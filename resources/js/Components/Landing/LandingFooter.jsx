/**
 * Footer publik — sama dengan landing page (alamat, peta, hak cipta).
 */
export default function LandingFooter() {
    const year = new Date().getFullYear();

    return (
        <footer className="flex w-full flex-col items-start gap-20 bg-[#f4f3f1] px-12 pb-16 pt-32 md:px-24">
            <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2">
                <div className="space-y-10">
                    <div className="space-y-6">
                        <span className="font-serif text-4xl italic text-indigo-900">SMP N 3 Batang</span>
                        <p className="max-w-xs font-serif text-lg text-indigo-900">
                            Menjadi pusat pendidikan yang kuat dalam prestasi, karakter, dan kebanggaan daerah.
                        </p>
                    </div>
                    <div className="space-y-1 text-sm text-slate-700">
                        <p>
                            <span className="font-semibold text-indigo-900">Alamat:</span> Jl. Ki. Mangunsarkoro No. 6
                            Proyonanggan Selatan
                        </p>
                        <p>Batang - Jawa Tengah - Indonesia</p>
                        <p>
                            <span className="font-semibold text-indigo-900">Kode Pos:</span> 51211
                        </p>
                        <p>
                            <span className="font-semibold text-indigo-900">Telepon:</span> 0285-391422
                        </p>
                        <p>
                            <span className="font-semibold text-indigo-900">Fax:</span> 0285-391422
                        </p>
                        <p>
                            <span className="font-semibold text-indigo-900">Email:</span> smptigabatang@gmail.com
                        </p>
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
                    <p className="mb-4 font-sans text-sm tracking-tight text-slate-500">Lokasi Sekolah</p>
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
            <div className="flex w-full flex-col items-center justify-between gap-6 border-t border-outline-variant/20 pt-16 md:flex-row">
                <span className="font-sans text-sm tracking-tight text-slate-500">
                    © {year} SMP Negeri 3 Batang. Pendidikan untuk Generasi Emas.
                </span>
                <div className="flex gap-8">
                    <span className="material-symbols-outlined text-indigo-900/50">brush</span>
                    <span className="material-symbols-outlined text-indigo-900/50">book</span>
                    <span className="material-symbols-outlined text-indigo-900/50">school</span>
                </div>
            </div>
        </footer>
    );
}
