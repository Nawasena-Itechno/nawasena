import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Database, BarChart3, Users, MapPin, Activity, TrendingUp } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* Top Bar (Pemerintah/Korporat style) */}
      <div className="bg-emerald-900 text-emerald-100 text-xs py-2 px-6 flex justify-between items-center">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <span>Sistem Informasi Strategis Pengadaan F&B Nasional</span>
          <div className="flex gap-4">
            <span className="hidden sm:inline">Layanan Informasi: 1500-NWS</span>
            <Link to="/metodologi" className="hover:text-white underline underline-offset-2">Transparansi Data</Link>
          </div>
        </div>
      </div>

      {/* Navbar (Solid, Formal) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-800 p-2 rounded flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">NAWASENA</h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 mt-1">Portal Pengadaan</p>
            </div>
          </div>
          <div className="flex gap-6 items-center">
            <Link to="/metodologi" className="text-sm font-semibold text-slate-600 hover:text-emerald-700 hidden md:block">Metodologi PIHPS</Link>
            <div className="h-6 w-px bg-slate-300 hidden md:block"></div>
            <Link to="/login" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Masuk Aplikasi</Link>
            <Link to="/login" className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold py-2.5 px-6 rounded transition-colors shadow-sm">
              Daftar Usaha
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (Corporate with Photography) */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        {/* Latar Belakang Foto Suasana Pasar */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
            alt="Suasana Pasar Tradisional" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-slate-900/70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/60 border border-emerald-500/30 rounded text-emerald-100 text-xs font-bold uppercase tracking-widest mb-6">
              <Activity className="w-4 h-4" /> Versi 2.0 Aktif
            </div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Sistem Pendukung Keputusan Pengadaan Komoditas Pangan
            </h2>
            <p className="text-slate-300 text-lg mb-10 leading-relaxed max-w-xl">
              Nawasena mengintegrasikan data harga historis dari Pusat Informasi Harga Pangan Strategis (PIHPS) Nasional untuk memberikan rekomendasi volume pembelian yang optimal bagi pelaku usaha F&B.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base py-3 px-8 rounded transition-colors flex justify-center items-center gap-2 border border-emerald-500">
                Akses Kalkulator <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/metodologi" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base py-3 px-8 rounded transition-all flex justify-center items-center backdrop-blur-sm">
                Lihat Metodologi
              </Link>
            </div>
          </div>

          {/* Corporate Dashboard Preview Widget */}
          <div className="hidden md:block">
            <div className="bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <div className="ml-4 text-xs font-mono text-slate-500">app.nawasena.go.id/dashboard</div>
              </div>
              <div className="p-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Rekomendasi Keputusan</p>
                <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Volume Pembelian: 15 Kg</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-emerald-50 rounded border border-emerald-100">
                    <span className="text-sm font-semibold text-slate-700">Potensi Penghematan</span>
                    <span className="text-sm font-bold text-emerald-700">Rp 450.000</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                    <span className="text-sm font-semibold text-slate-700">Risiko Fluktuasi (P90)</span>
                    <span className="text-sm font-bold text-red-700">82% Tinggi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Data & Statistics Panel */}
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-center">
            <div className="py-10 px-4">
              <Users className="w-8 h-8 text-emerald-700 mx-auto mb-3" />
              <h4 className="text-4xl font-black text-slate-900 mb-1">1.254</h4>
              <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Entitas Bisnis Terdaftar</p>
            </div>
            <div className="py-10 px-4">
              <TrendingUp className="w-8 h-8 text-emerald-700 mx-auto mb-3" />
              <h4 className="text-4xl font-black text-slate-900 mb-1">Rp 4.2M+</h4>
              <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Total Mitigasi Kerugian</p>
            </div>
            <div className="py-10 px-4">
              <MapPin className="w-8 h-8 text-emerald-700 mx-auto mb-3" />
              <h4 className="text-4xl font-black text-slate-900 mb-1">34</h4>
              <p className="text-slate-500 font-semibold text-sm uppercase tracking-wider">Cakupan Provinsi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Nilai Inti / Core Pillars (Corporate Style) */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Pilar Akuntabilitas dan Presisi</h2>
            <div className="w-20 h-1.5 bg-emerald-600 mb-6"></div>
            <p className="text-slate-600 text-lg">
              Nawasena dirancang dengan metodologi yang berfokus pada mitigasi risiko finansial akibat volatilitas harga pangan segar di Indonesia.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="w-7 h-7 text-emerald-700" />,
                title: "Integritas Data Historis",
                desc: "Sistem memproses jutaan baris data harga harian sejak 2017 untuk memproyeksikan rentang probabilitas harga (P10 - P90) secara real-time."
              },
              {
                icon: <BarChart3 className="w-7 h-7 text-emerald-700" />,
                title: "Kalkulasi Risiko Optimal",
                desc: "Memperhitungkan laju pembusukan bahan (shrinkage rate) terhadap potensi kenaikan harga pasar untuk mencegah penimbunan yang merugikan."
              },
              {
                icon: <ShieldCheck className="w-7 h-7 text-emerald-700" />,
                title: "Rekomendasi Berbasis Fakta",
                desc: "Memberikan keputusan instan yang terukur dan objektif kepada pelaku usaha untuk standardisasi operasional pengadaan barang."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 p-8 hover:shadow-lg transition-shadow border-t-4 border-t-emerald-600">
                <div className="bg-emerald-50 w-14 h-14 flex items-center justify-center rounded mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cara Kerja (Structured Process) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Prosedur Penggunaan Sistem</h2>
            <p className="text-slate-600">Alur operasional standar yang dirancang untuk efisiensi tinggi pada manajemen rantai pasok F&B.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Horizontal Line for Desktop */}
            <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-slate-200"></div>

            {[
              { step: "01", title: "Registrasi Entitas", desc: "Mendaftarkan profil usaha beserta spesifikasi lokasi operasional untuk kalibrasi harga regional." },
              { step: "02", title: "Input Kebutuhan Pokok", desc: "Memasukkan laju konsumsi mingguan atas komoditas spesifik (misal: Cabai, Daging, Beras)." },
              { step: "03", title: "Eksekusi Keputusan", desc: "Menerima panduan volume pembelian optimal beserta matriks probabilitas penghematan." }
            ].map((item, i) => (
              <div key={i} className="relative bg-white z-10 pt-4 md:pt-0">
                <div className="w-16 h-16 bg-slate-100 border-4 border-white rounded-full flex items-center justify-center text-xl font-black text-emerald-700 mx-auto mb-6 shadow-sm">
                  {item.step}
                </div>
                <div className="text-center px-4">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA (Corporate Style) */}
      <section className="bg-slate-900 py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Tingkatkan Efisiensi Rantai Pasok Anda Hari Ini</h2>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
            Kurangi beban kerugian finansial akibat fluktuasi harga pasar yang tidak dapat diprediksi melalui sistem berbasis data kami.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/login" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-10 rounded transition-colors text-sm">
              Buat Akun Usaha
            </Link>
            <Link to="/login" className="bg-transparent border border-slate-600 text-white hover:bg-slate-800 font-bold py-3 px-10 rounded transition-colors text-sm">
              Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* Formal Footer */}
      <footer className="bg-slate-950 pt-16 pb-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-emerald-500" />
              <span className="text-xl font-bold text-white tracking-tight">NAWASENA</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Sistem informasi pengadaan strategis berlandaskan data PIHPS untuk mendukung stabilitas dan marjin usaha mikro, kecil, dan menengah di sektor Makanan & Minuman.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Tautan Cepat</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/login" className="hover:text-emerald-400">Portal Aplikasi</Link></li>
              <li><Link to="/metodologi" className="hover:text-emerald-400">Metodologi Model</Link></li>
              <li><a href="#" className="hover:text-emerald-400">Pusat Bantuan</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Legalitas & Kepatuhan</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-emerald-400">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-emerald-400">Syarat Ketentuan</a></li>
              <li><a href="#" className="hover:text-emerald-400">Keamanan Data</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Tim Nawasena. Hak Cipta Dilindungi Undang-Undang.</p>
          <p>Disusun untuk Kompetisi ITechno Cup 2026.</p>
        </div>
      </footer>
    </div>
  );
}
