import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DonorDashboard from './pages/DonorDashboard';
import SeekerSOS from './pages/SeekerSOS';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <BrowserRouter basename="/blood-donation-pwa/">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blood-50 font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/donor" element={<DonorDashboard />} />
          <Route path="/sos" element={<SeekerSOS />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
