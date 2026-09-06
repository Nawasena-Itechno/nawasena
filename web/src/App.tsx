import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Methodology from './pages/Methodology';
import Onboarding from './pages/Onboarding';
import Landing from './pages/Landing';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route element={<Layout />}>
          <Route path="/metodologi" element={<Methodology />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
