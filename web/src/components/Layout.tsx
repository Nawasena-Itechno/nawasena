import { Database, LogOut } from 'lucide-react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session && location.pathname !== '/' && location.pathname !== '/metodologi') {
        navigate('/');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && location.pathname !== '/' && location.pathname !== '/metodologi') {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-200">
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200 py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link to={session ? "/dashboard" : "/"} className="text-xl font-black tracking-tight text-emerald-900 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-emerald-100 p-2 rounded-xl shadow-inner">
              <Database className="w-5 h-5 text-emerald-700"/>
            </div>
            NAWASENA
          </Link>
          <nav className="flex items-center gap-8 text-sm font-semibold">
            {session && (
              <Link to="/dashboard" className={`transition-all duration-300 ${isDashboard ? 'text-emerald-700 relative after:content-[\'\'] after:absolute after:-bottom-5 after:left-0 after:w-full after:h-0.5 after:bg-emerald-500' : 'text-slate-500 hover:text-emerald-600'}`}>
                Dasbor Keputusan
              </Link>
            )}
            <Link to="/metodologi" className={`transition-all duration-300 ${!isDashboard ? 'text-emerald-700 relative after:content-[\'\'] after:absolute after:-bottom-5 after:left-0 after:w-full after:h-0.5 after:bg-emerald-500' : 'text-slate-500 hover:text-emerald-600'}`}>
              Metodologi Lomba
            </Link>
            
            {session && (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                <span className="text-xs text-slate-400 font-normal hidden sm:inline-block">
                  {session.user.email}
                </span>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Keluar
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-6">
        <Outlet />
      </main>
    </div>
  );
}
