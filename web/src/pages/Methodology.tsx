import { ShieldCheck, TrendingUp } from 'lucide-react';

export default function Methodology() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white p-8 lg:p-12 rounded-3xl border border-[#E8F5E9] shadow-sm">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E8F5E9] text-[#1B5E20] rounded-full text-sm font-bold mb-8">
          <ShieldCheck className="w-4 h-4" /> Transparansi Sistem
        </div>
        
        <h1 className="text-4xl font-black text-[#0D3311] mb-6 tracking-tight">Metodologi Nawasena</h1>
        
        {/* Resurrected Technical Details */}
        <div className="mt-8 bg-[#F8FCF8] p-8 lg:p-10 rounded-3xl border border-[#C8E6C9] shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0D3311] mb-4">Rapor Model & Evaluasi Kinerja</h2>
            <p className="text-[#4B6149] leading-relaxed">
              Sistem Nawasena menggunakan pendekatan <strong>Filtered Historical Simulation (FHS)</strong> untuk memproyeksikan batas risiko harga di masa depan (P10, P50, P90). Berbeda dengan aplikasi pencatat stok biasa, kami tidak menjanjikan prediksi yang sempurna. Fokus kami adalah <strong>kalibrasi ketidakpastian</strong>—mempersiapkan UMKM terhadap skenario terburuk.
            </p>
          </div>

          <div className="bg-white p-6 lg:p-8 rounded-2xl border border-[#C8E6C9]">
            <h3 className="text-lg font-bold text-[#1B5E20] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#66BB6A]" /> Hasil Walk-forward Backtest
            </h3>
            <p className="text-sm text-[#4B6149] mb-6">
              MASE (Mean Absolute Scaled Error) mengukur performa kami dibandingkan dengan tebakan naif (menebak harga besok sama dengan hari ini). MASE &lt; 1 berarti model lebih baik dari sekadar tebakan.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#25422A]">
                <thead className="text-xs text-[#1B5E20] uppercase tracking-wider bg-[#E8F5E9]">
                  <tr>
                    <th className="px-5 py-4 rounded-tl-xl font-bold">Komoditas</th>
                    <th className="px-5 py-4 font-bold">Horizon</th>
                    <th className="px-5 py-4 font-bold">Skor MASE</th>
                    <th className="px-5 py-4 rounded-tr-xl font-bold">Coverage (P10-P90)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8F5E9]">
                  <tr className="hover:bg-[#F8FCF8] transition-colors">
                    <td className="px-5 py-4 font-semibold text-[#0D3311]">Cabai Rawit Merah</td>
                    <td className="px-5 py-4 text-[#4B6149]">7 Hari</td>
                    <td className="px-5 py-4 font-bold text-[#1B5E20]">0.988</td>
                    <td className="px-5 py-4">77.4% <span className="text-xs text-[#6B7F69] ml-1">(Target 80%)</span></td>
                  </tr>
                  <tr className="hover:bg-[#F8FCF8] transition-colors">
                    <td className="px-5 py-4 font-semibold text-[#0D3311]">Cabai Rawit Merah</td>
                    <td className="px-5 py-4 text-[#4B6149]">14 Hari</td>
                    <td className="px-5 py-4 font-bold text-[#1B5E20]">0.992</td>
                    <td className="px-5 py-4">81.9% <span className="text-xs text-[#66BB6A] ml-1 font-bold">✓ Ideal</span></td>
                  </tr>
                  <tr className="hover:bg-[#FFF0F0] transition-colors bg-[#FFFAFA]">
                    <td className="px-5 py-4 font-semibold text-[#0D3311]">Cabai Rawit Hijau</td>
                    <td className="px-5 py-4 text-[#4B6149]">7 Hari</td>
                    <td className="px-5 py-4 font-bold text-[#D32F2F]">1.020</td>
                    <td className="px-5 py-4">81.0%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#6B7F69] mt-5 italic leading-relaxed">
              * Perhatikan pada Cabai Rawit Hijau, MASE kami 1.02. Ini berarti tebakan naif lebih baik secara titik (point estimate). Namun, karena sistem ini menggunakan pengoptimalan inventori berdasarkan batas distribusi (P90), aplikasi tetap mampu menyelamatkan UMKM dari risiko kerugian saat volatilitas meledak tiba-tiba.
            </p>
          </div>

          <div className="mt-10">
            <h3 className="text-xl font-bold text-[#0D3311] mb-3">Penanganan Data & Imputasi</h3>
            <p className="text-[#4B6149] text-sm leading-relaxed">
              Data harga pasar tradisional ditarik dari PIHPS Nasional. Ditemukan sekitar <strong>3.4% kelalaian pencatatan (lubang data)</strong> akibat hari libur nasional atau akhir pekan. Kami menyelesaikan masalah kelengkapan data ini dengan teknik <em>Forward-Fill</em> murni, tanpa manipulasi rata-rata bergerak (moving average), demi menjaga integritas perhitungan <em>log-return</em> harian.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
