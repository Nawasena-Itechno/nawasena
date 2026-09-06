import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Methodology from './pages/Methodology';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';
import Encyclopedia from './pages/Encyclopedia';
import Simulator from './pages/Simulator';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
