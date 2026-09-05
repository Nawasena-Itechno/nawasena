import { FileText, AlertCircle, TrendingUp } from 'lucide-react';

export default function Methodology() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold mb-6">
          <FileText className="w-4 h-4" /> Alur D: Rapor Model & Transparansi
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Metodologi & Rapor Model</h1>
        
        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-emerald">
          <p className="text-lg text-slate-600 leading-relaxed">
            Sistem Nawasena menggunakan <strong>Filtered Historical Simulation (FHS)</strong> untuk memproyeksikan batas risiko harga di masa depan (P10, P50, P90). Berbeda dengan aplikasi pencatat harga biasa, kami tidak menjanjikan prediksi yang sempurna. Fokus kami adalah <strong>kalibrasi ketidakpastian</strong>—mempersiapkan UMKM terhadap skenario terburuk.
          </p>

          <div className="my-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Hasil Walk-forward Backtest
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              MASE (Mean Absolute Scaled Error) mengukur performa kami dibandingkan dengan tebakan naif (menebak harga besok sama dengan hari ini). MASE &lt; 1 berarti kami lebih baik dari tebakan naif.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="text-xs text-slate-500 uppercase tracking-wider bg-slate-100/50">
                  <tr>
                    <th className="px-4 py-4 rounded-tl-xl">Komoditas</th>
                    <th className="px-4 py-4">Horizon</th>
                    <th className="px-4 py-4">MASE</th>
                    <th className="px-4 py-4 rounded-tr-xl">Coverage (P10-P90)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-semibold text-slate-900">Cabai Rawit Merah</td>
                    <td className="px-4 py-4 text-slate-500">7 Hari</td>
                    <td className="px-4 py-4 font-bold text-emerald-600">0.988</td>
                    <td className="px-4 py-4">77.4% <span className="text-xs text-slate-400 ml-1">(Target 80%)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-semibold text-slate-900">Cabai Rawit Merah</td>
                    <td className="px-4 py-4 text-slate-500">14 Hari</td>
                    <td className="px-4 py-4 font-bold text-emerald-600">0.992</td>
                    <td className="px-4 py-4">81.9% <span className="text-xs text-emerald-500 ml-1">✓ Ideal</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors bg-red-50/30">
                    <td className="px-4 py-4 font-semibold text-slate-900">Cabai Rawit Hijau</td>
                    <td className="px-4 py-4 text-slate-500">7 Hari</td>
                    <td className="px-4 py-4 font-bold text-red-600">1.020</td>
                    <td className="px-4 py-4">81.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 mt-4 italic">
              * Perhatikan pada Cabai Rawit Hijau, MASE kami 1.02. Ini berarti tebakan naif lebih baik secara titik (point estimate). Namun, karena sistem ini menggunakan L3 Inventory Optimization berdasarkan batas distribusi (P90), aplikasi tetap mampu menyelamatkan UMKM dari risiko bangkrut saat volatilitas meledak tiba-tiba.
            </p>
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mt-8 mb-4">Penanganan Data & Imputasi</h3>
          <p className="text-slate-600">
            Data harga pasar tradisional ditarik dari PIHPS Nasional. Ditemukan sekitar <strong>3.4% kelalaian pencatatan (lubang data)</strong> akibat hari libur nasional atau akhir pekan. Kami menyelesaikan masalah kelengkapan data ini dengan teknik <em>Forward-Fill</em> murni, tanpa manipulasi rata-rata bergerak (moving average), demi menjaga integritas perhitungan <em>log-return</em> harian.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-8">
            <h4 className="flex items-center gap-2 font-bold text-amber-900 mb-2">
              <AlertCircle className="w-5 h-5" /> Keterbatasan Model
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-amber-800/80">
              <li>Model ini murni mengandalkan data harga tunggal (*univariate*). Kami belum memasukkan variabel iklim (El-Nino/La-Nina) atau sentimen berita panen raya.</li>
              <li>Akurasi coverage memburuk pada saat terjadi lonjakan harga yang belum pernah tercatat dalam sejarah 8 tahun terakhir.</li>
              <li>Keputusan jumlah persediaan mengasumsikan UMKM memiliki kapasitas penyimpanan (kulkas/chiller) yang memadai.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
