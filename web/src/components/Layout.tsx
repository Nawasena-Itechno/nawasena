import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

const PUBLIC_PATHS = ['/', '/ensiklopedia', '/simulator', '/metodologi'];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const guard = (session: Session | null) => {
      if (!session && !PUBLIC_PATHS.includes(location.pathname)) navigate('/');
    };

    supabase.auth.getSession().then(({ data: { session } }) => guard(session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => guard(session));

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FCF8] text-[#25422A]">
      <SiteHeader variant="solid" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 lg:px-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
