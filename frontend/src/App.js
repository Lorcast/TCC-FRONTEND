import './App.css';

// Router 
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import ConsultaProtocolo from './pages/Cidadao/ConsultaProtocolo';
import HomePage from './pages/HomePage/HomePage';
import DenunciaForm from './pages/Cidadao/DenunciaForm';
import Login from './pages/Admin/Auth/Login';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/Admin/Dashboard/AdminDashboard'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/denuncia" element={<DenunciaForm />} />
        <Route path="/consulta" element={<ConsultaProtocolo />} />

        <Route path="/" element={<HomePage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;