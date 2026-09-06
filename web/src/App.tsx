import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Methodology from './pages/Methodology';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import Encyclopedia from './pages/Encyclopedia';
import Simulator from './pages/Simulator';
import ScrollToTop from './components/ScrollToTop';
import { DEV_BYPASS_AUTH } from './lib/devAuth';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      {DEV_BYPASS_AUTH && (
        <div className="fixed bottom-3 left-3 z-[100] rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-950 shadow-lg">
          Auth bypass aktif — dev only
        </div>
      )}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/ensiklopedia" element={<Encyclopedia />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/login" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route element={<Layout />}>
          <Route path="/metodologi" element={<Methodology />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
