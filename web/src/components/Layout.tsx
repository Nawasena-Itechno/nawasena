import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { auth } from '../lib/auth';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Auth Guard
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/register-umkm';
    const isPublicRoute = location.pathname === '/' || location.pathname === '/encyclopedia' || location.pathname === '/simulator' || location.pathname === '/methodology';
    
    const token = auth.getToken();

    if (!token && !isAuthRoute && !isPublicRoute) {
      navigate('/login');
    } else if (token && isAuthRoute) {
      navigate('/dashboard');
    }
  }, [location.pathname, navigate]);

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
