import { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/auth';
import { fetchMetadata } from '../lib/api';
import type { MetadataResponse } from '../lib/api';
import LogoFull from '../assets/nawasena-logo-full.svg';

const STEPS = [
  { num: 1, title: 'Akun Login' },
  { num: 2, title: 'Profil Bisnis' },
  { num: 3, title: 'Operasional' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [fnbCategory, setFnbCategory] = useState('');
  const [referenceMarket, setReferenceMarket] = useState('');
  const [storageMethod, setStorageMethod] = useState('');
  const [commodities, setCommodities] = useState<{name: string, weekly_consumption_kg: number}[]>([]);
  
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  
  useEffect(() => {
    fetchMetadata().then(res => {
      setMetadata(res);
      if (res.categories.length) setFnbCategory(res.categories[0].name);
      if (res.markets.length) setReferenceMarket(res.markets[0].name);
      if (res.storage_methods.length) setStorageMethod(res.storage_methods[0].id);
    }).catch(console.error);
  }, []);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    try {
      const { token } = await auth.fetchAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password })
      });
      auth.setToken(token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const { token } = await auth.fetchAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
          business_name: businessName,
          fnb_category: fnbCategory,
          reference_market: referenceMarket,
          commodities: commodities.length > 0 ? commodities : (metadata?.commodities.length ? [{name: metadata.commodities[0].name, weekly_consumption_kg: 5}] : []),
          storage_method: storageMethod
        })
      });
      
      auth.setToken(token);
      setSuccess("Registrasi berhasil! Anda akan dialihkan...");
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col justify-center items-center p-6 relative overflow-hidden py-20">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#A5D6A7]/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -left-20 w-[500px] h-[500px] bg-[#66BB6A]/20 rounded-full blur-3xl"></div>
      </div>

      <div className={`z-10 w-full transition-all duration-500 animate-in fade-in zoom-in ${isLogin ? 'max-w-md' : 'max-w-3xl'}`}>
        <div className="text-center mb-10">
          <img src={LogoFull} alt="Logo Nawasena" className="h-12 mx-auto object-contain mb-4 drop-shadow-md" />
          <p className="text-[#1B5E20]/80 text-sm font-medium tracking-wide">Sistem Pendukung Keputusan Pengadaan F&B</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-[#A5D6A7] p-8 md:p-10 rounded-[2rem] shadow-2xl">
          
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-[#E8F5E9] border border-[#66BB6A] p-4 rounded-xl text-[#1B5E20] text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {isLogin ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLogin} className="max-w-sm mx-auto">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-[#1B5E20] mb-2">Masuk ke Akun</h2>
                <p className="text-[#1B5E20]/70 text-sm">Masuk untuk melihat Dasbor Pengadaan Anda.</p>
              </div>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-2">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-[#A5D6A7] rounded-xl px-4 py-3.5 text-[#1B5E20] outline-none focus:border-[#66BB6A] focus:ring-1 focus:ring-[#66BB6A] transition-all" placeholder="admin@usaha.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-2">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-[#A5D6A7] rounded-xl px-4 py-3.5 text-[#1B5E20] outline-none focus:border-[#66BB6A] focus:ring-1 focus:ring-[#66BB6A] transition-all" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-lg shadow-[#1B5E20]/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Masuk <ArrowRight className="w-4 h-4" /></>}
              </button>
              <div className="mt-8 text-center">
                <button type="button" onClick={() => { setIsLogin(false); setStep(1); setError(''); }} className="text-[#66BB6A] hover:text-[#1B5E20] text-sm font-bold transition-colors">Belum punya akun? Daftar di sini.</button>
              </div>
            </form>
          ) : (
            /* ================= REGISTER WIZARD ================= */
            <form onSubmit={step === 3 ? handleRegister : (e) => { e.preventDefault(); setStep(step + 1); }}>
              
              {/* Stepper Wizard */}
              <div className="mb-12 relative px-4 sm:px-10">
                <div className="absolute left-10 right-10 top-5 h-[2px] bg-[#A5D6A7]/60 -z-10" />
                <div 
                  className="absolute left-10 top-5 h-[2px] bg-[#66BB6A] -z-10 transition-all duration-500"
                  style={{ width: `calc(${((step - 1) / 2) * 100}% - 40px)` }}
                />
                
                <div className="flex justify-between items-start">
                  {STEPS.map((s) => (
                    <div key={s.num} className="flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 shadow-lg ${
                        step > s.num ? 'bg-[#66BB6A] text-[#1B5E20] shadow-[#66BB6A]/20' : 
                        step === s.num ? 'bg-[#66BB6A] text-[#1B5E20] ring-4 ring-[#66BB6A]/30 shadow-[#66BB6A]/30' : 
                        'bg-white border-2 border-[#A5D6A7] text-[#1B5E20]/50'
                      }`}>
                        {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                      </div>
                      <span className={`text-[11px] uppercase tracking-wider font-bold ${step >= s.num ? 'text-[#1B5E20]' : 'text-[#1B5E20]/50'}`}>
                        {s.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <div className="min-h-[220px]">
                {step === 1 && (
                  <div className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-500 max-w-lg mx-auto">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-[#1B5E20]">Buat Akun Nawasena</h3>
                      <p className="text-[#1B5E20]/70 text-sm mt-1">Akun ini akan menjadi pintu masuk Dasbor UMKM Anda.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-2">Email Pemilik Usaha</label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-[#A5D6A7] rounded-xl px-4 py-3.5 text-[#1B5E20] outline-none focus:border-[#66BB6A] focus:ring-1 focus:ring-[#66BB6A] transition-all" placeholder="Misal: admin@usaha.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-2">Password</label>
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-[#A5D6A7] rounded-xl px-4 py-3.5 text-[#1B5E20] outline-none focus:border-[#66BB6A] focus:ring-1 focus:ring-[#66BB6A] transition-all" minLength={6} placeholder="Minimal 6 karakter" />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold text-[#1B5E20]">Profil Bisnis Anda</h3>
                      <p className="text-[#1B5E20]/70 text-sm mt-1">Data spesifik ini akan digunakan AI untuk kalibrasi perhitungan pasar.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-2">Nama Usaha / Warung</label>
                        <input type="text" required value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-white border border-[#A5D6A7] rounded-xl px-4 py-3.5 text-[#1B5E20] outline-none focus:border-[#66BB6A] focus:ring-1 focus:ring-[#66BB6A] transition-all" placeholder="Cth: Ayam Geprek Bu Siti" />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-2">Kategori F&B</label>
                        <select value={fnbCategory} onChange={e => setFnbCategory(e.target.value)} className="w-full bg-white border border-[#A5D6A7] rounded-xl px-4 py-3.5 text-[#1B5E20] outline-none focus:border-[#66BB6A] focus:ring-1 focus:ring-[#66BB6A] transition-all">
                          {metadata?.categories.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-2">Pasar Acuan Belanja</label>
                        <select value={referenceMarket} onChange={e => setReferenceMarket(e.target.value)} className="w-full bg-white border border-[#A5D6A7] rounded-xl px-4 py-3.5 text-[#1B5E20] outline-none focus:border-[#66BB6A] focus:ring-1 focus:ring-[#66BB6A] transition-all">
                          {metadata?.markets.map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-500">
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-bold text-[#1B5E20]">Detail Operasional</h3>
                      <p className="text-[#1B5E20]/70 text-sm mt-1">Kebutuhan bahan baku utama (Cabai/Bawang/Sayur) dan cara simpannya.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-3">Kebutuhan Rutin Per Komoditas</label>
                        <div className="space-y-3 mb-6 bg-[#E8F5E9] p-4 rounded-xl border border-[#A5D6A7]/50 max-h-[400px] overflow-y-auto">
                          {metadata?.commodities.map(c => {
                            const isChecked = commodities.some(x => x.name === c.name);
                            const cons = commodities.find(x => x.name === c.name)?.weekly_consumption_kg || 5;
                            return (
                              <div key={c.id} className="flex flex-col gap-2 p-3 rounded-lg bg-white border border-[#A5D6A7]/50 hover:border-[#66BB6A] transition-colors">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) setCommodities([...commodities, { name: c.name, weekly_consumption_kg: 5 }]);
                                      else setCommodities(commodities.filter(x => x.name !== c.name));
                                    }}
                                    className="w-4 h-4 rounded accent-[#66BB6A] bg-white border-[#A5D6A7]" 
                                  />
                                  <span className="text-sm font-bold text-[#1B5E20]/80 group-hover:text-[#1B5E20] transition-colors">{c.name}</span>
                                </label>
                                {isChecked && (
                                  <div className="ml-7 mt-1 flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      min="0.1" 
                                      step="0.1"
                                      value={cons} 
                                      onChange={e => {
                                        setCommodities(commodities.map(x => x.name === c.name ? { ...x, weekly_consumption_kg: Number(e.target.value) } : x));
                                      }}
                                      className="w-24 bg-[#E8F5E9]/50 border border-[#A5D6A7]/50 rounded-lg px-3 py-1.5 text-[#1B5E20] text-sm font-bold outline-none focus:border-[#66BB6A]" 
                                    />
                                    <span className="text-xs text-[#66BB6A] font-bold">Kg / Minggu</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[#1B5E20]/50 text-xs mt-2">Centang komoditas yang sering Anda beli, lalu masukkan rata-rata pemakaian dapur per minggunya.</p>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-[#1B5E20] uppercase tracking-wider mb-3">Metode Penyimpanan Dapur</label>
                        <div className="space-y-3">
                          {metadata?.storage_methods.map(sm => (
                            <label key={sm.id} className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border ${storageMethod === sm.id ? 'bg-[#E8F5E9] border-[#66BB6A]' : 'bg-white border-[#A5D6A7]/50 hover:border-[#66BB6A]/50'}`}>
                              <input type="radio" name="storage" value={sm.id} checked={storageMethod === sm.id} onChange={(e) => setStorageMethod(e.target.value)} className="accent-[#66BB6A] w-4 h-4" />
                              <div>
                                <div className="text-sm font-bold text-[#1B5E20] leading-none mb-1">{sm.short_label}</div>
                                <div className="text-[10px] font-semibold text-[#66BB6A] uppercase tracking-wider">Tahan ~{sm.shelf_life_days} hari</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-10 flex gap-4 pt-6 border-t border-[#A5D6A7]/50">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="bg-[#E8F5E9] hover:bg-[#A5D6A7]/30 text-[#1B5E20] font-bold py-3.5 px-6 rounded-xl transition-all border border-[#A5D6A7]/50 flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5" /> Kembali
                  </button>
                )}
                <button type="submit" disabled={loading} className="flex-1 bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-lg shadow-[#1B5E20]/20">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{step === 3 ? 'Selesaikan Registrasi' : 'Langkah Selanjutnya'} {step < 3 && <ArrowRight className="w-5 h-5" />}</>}
                </button>
              </div>

              <div className="mt-8 text-center">
                <button type="button" onClick={() => { setIsLogin(true); setError(''); }} className="text-[#66BB6A] hover:text-[#1B5E20] text-sm font-bold transition-colors">Sudah punya akun? Masuk.</button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
