import { useState } from 'react';
import { Store, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Opsional: jika Supabase mewajibkan email konfirmasi, beri tahu pengguna
        if (!error && !isLogin) {
            setError("Berhasil daftar! Silakan cek email Anda untuk konfirmasi (jika diaktifkan), atau coba masuk.");
            setIsLogin(true);
            setLoading(false);
            return;
        }
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-800/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -left-20 w-80 h-80 bg-teal-900/40 rounded-full blur-3xl"></div>
      </div>

      <div className="z-10 w-full max-w-md animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-900/50 rounded-2xl border border-emerald-700/50 mb-4 shadow-xl">
            <Store className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Nawasena</h1>
          <p className="text-emerald-200/80 text-sm">Sistem Pendukung Keputusan Pengadaan F&B</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">
              {isLogin ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
            </h2>
            <p className="text-emerald-100/70 text-sm">Masuk untuk melihat skenario inventori hari ini.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                placeholder="email@warung.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-2">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-emerald-950/50 border border-emerald-700/50 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex justify-center items-center gap-2 shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>{isLogin ? 'Masuk' : 'Daftar Sekarang'} <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-emerald-300/80 hover:text-emerald-300 text-sm font-medium transition-colors"
            >
              {isLogin ? 'Belum punya akun? Daftar di sini.' : 'Sudah punya akun? Masuk.'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
