import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

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
