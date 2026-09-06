import { useState } from 'react';
import { Store, ArrowRight, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DEV_BYPASS_AUTH } from '../lib/devAuth';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  
  // Form State
  // Saat bypass aktif, form diisi otomatis agar validasi `required` bawaan
  // browser lolos dan tombol Masuk cukup diklik sekali tanpa mengetik apa pun.
  const [email, setEmail] = useState(DEV_BYPASS_AUTH ? 'dev@nawasena.local' : '');
  const [password, setPassword] = useState(DEV_BYPASS_AUTH ? 'devpassword' : '');
  const [businessName, setBusinessName] = useState(DEV_BYPASS_AUTH ? 'Warteg Nawasena (Dev)' : '');
  const [fnbCategory, setFnbCategory] = useState('Warteg');
  const [referenceMarket, setReferenceMarket] = useState('Pasar Induk Kramat Jati');
  const [weeklyConsumption, setWeeklyConsumption] = useState(10);
  const [storageMethod, setStorageMethod] = useState('room');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mode development: lewati Supabase sepenuhnya, langsung ke dasbor.
    if (DEV_BYPASS_AUTH) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mode development: tidak memanggil signUp(), jadi tidak ada email
    // konfirmasi yang dikirim dan rate limit Supabase tidak tersentuh.
    if (DEV_BYPASS_AUTH) {
      setSuccess('Registrasi dilewati (mode development). Mengalihkan...');
      setTimeout(() => navigate('/dashboard'), 800);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Sign up user
      const { data, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      
      if (data.user) {
        // 2. Insert into profiles
        const decayRate = storageMethod === 'chiller' ? 0.015 : storageMethod === 'airtight' ? 0.005 : 0.03;
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { 
              id: data.user.id,
              business_name: businessName,
              fnb_category: fnbCategory,
              reference_market: referenceMarket,
              weekly_consumption_kg: weeklyConsumption,
              storage_method: storageMethod,
              daily_decay_rate: decayRate
            }
          ]);
          
        if (profileError) {
          console.error("Profile error:", profileError);
          // If insert fails, we might still have created the user, but we show error
          throw new Error("Gagal menyimpan profil usaha. Pastikan tabel profiles sudah dibuat di Supabase.");
        }
        
        setSuccess("Registrasi berhasil! Anda akan dialihkan...");
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-800/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-emerald-900/40 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-900/50 rounded-2xl border border-emerald-700/50 mb-4 shadow-xl">
            <Store className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Nawasena</h1>
          <p className="text-emerald-200/80 text-sm">Sistem Pendukung Keputusan Pengadaan F&B</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-xl text-emerald-200 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {isLogin ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Masuk ke Akun</h2>
                <p className="text-emerald-100/70 text-sm">Masuk untuk melihat Dasbor Pengadaan Anda.</p>
              </div>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400" placeholder="admin@usaha.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Masuk <ArrowRight className="w-4 h-4" /></>}
              </button>
              <div className="mt-6 text-center">
                <button type="button" onClick={() => { setIsLogin(false); setStep(1); setError(''); }} className="text-emerald-300/80 hover:text-emerald-300 text-sm font-medium">Belum punya akun? Daftar di sini.</button>
              </div>
            </form>
          ) : (
            /* ================= REGISTER WIZARD ================= */
            <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); setStep(step + 1); }}>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-bold text-white">Langkah {step} dari 3</h2>
                  <span className="text-xs font-mono bg-emerald-900/50 text-emerald-300 px-2 py-1 rounded">Registrasi UMKM</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-emerald-950/50 rounded-full h-1.5 mb-4">
                  <div className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }}></div>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <p className="text-emerald-100/70 text-sm mb-4">Buat akun untuk akses sistem.</p>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Email Pemilik Usaha</label>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Password</label>
                    <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400" minLength={6} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <p className="text-emerald-100/70 text-sm mb-4">Data spesifik ini akan digunakan untuk kalibrasi.</p>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Nama Usaha / Warung</label>
                    <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400" placeholder="Cth: Ayam Geprek Bu Siti" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Kategori F&B</label>
                    <select value={fnbCategory} onChange={e => setFnbCategory(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400 appearance-none">
                      <option value="Warteg">Warteg</option>
                      <option value="Ayam Geprek">Ayam Geprek</option>
                      <option value="Restoran Padang">Restoran Padang</option>
                      <option value="Katering">Katering</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Pasar Acuan Belanja</label>
                    <input type="text" required value={referenceMarket} onChange={e => setReferenceMarket(e.target.value)} className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400" placeholder="Cth: Pasar Induk Kramat Jati" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <p className="text-emerald-100/70 text-sm mb-4">Kebutuhan bahan baku utama (Cabai/Bawang/Sayur).</p>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Kebutuhan Rata-rata / Minggu (Kg)</label>
                    <input type="number" required min="1" value={weeklyConsumption} onChange={e => setWeeklyConsumption(Number(e.target.value))} className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Metode Penyimpanan Dapur</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 p-3 border border-emerald-700/50 rounded bg-emerald-950/50 cursor-pointer">
                        <input type="radio" name="storage" value="room" checked={storageMethod === 'room'} onChange={(e) => setStorageMethod(e.target.value)} className="accent-emerald-500" />
                        <span className="text-sm font-semibold text-white">Suhu Ruang (Tahan ~5 hari)</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border border-emerald-700/50 rounded bg-emerald-950/50 cursor-pointer">
                        <input type="radio" name="storage" value="chiller" checked={storageMethod === 'chiller'} onChange={(e) => setStorageMethod(e.target.value)} className="accent-emerald-500" />
                        <span className="text-sm font-semibold text-white">Kulkas/Chiller (Tahan ~12 hari)</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 border border-emerald-700/50 rounded bg-emerald-950/50 cursor-pointer">
                        <input type="radio" name="storage" value="airtight" checked={storageMethod === 'airtight'} onChange={(e) => setStorageMethod(e.target.value)} className="accent-emerald-500" />
                        <span className="text-sm font-semibold text-white">Kedap Udara + Tisu (Tahan ~20 hari)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="bg-emerald-900/50 hover:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl transition-all border border-emerald-700/50">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <button type="submit" disabled={loading} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-[0_0_20px_-5px_rgba(123,91,74,0.5)]">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{step === 3 ? 'Kirim Data & Selesai' : 'Lanjut'} {step < 3 && <ArrowRight className="w-4 h-4" />}</>}
                </button>
              </div>

              <div className="mt-6 text-center">
                <button type="button" onClick={() => { setIsLogin(true); setError(''); }} className="text-emerald-300/80 hover:text-emerald-300 text-sm font-medium">Sudah punya akun? Masuk.</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
