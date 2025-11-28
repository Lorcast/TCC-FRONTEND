// src/App.js
import './App.css';

//Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

//pages
import ConsultaProtocolo from './pages/Cidadao/ConsultaProtocolo';
import HomePage from './pages/HomePage/HomePage';
import DenunciaForm from './pages/Cidadao/DenunciaForm';
import Login from './pages/Admin/Auth/Login';
import NotFound from './pages/NotFound';
import AreaAdmin from './pages/Admin/Dashboard/AreaAdmin';
import ProtecaoAdmin from './components/ProtecaoAdmin';
import VerDetalhes from './pages/Admin/Manifestacoes/VerDetalhes';
import PerfiVereadores from './pages/Admin/Vereadores/PerfilVereadores';
import CadastrarVereadores from './pages/Admin/Vereadores/CadastrarVereadores';
import Ouvidor from './pages/Admin/Ouvidor/Ouvidor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
      
        {/* Rotas protegidas */}
        <Route path='admin' element={<ProtecaoAdmin> <AreaAdmin /> </ProtecaoAdmin>} />
        <Route path='admin/manifestacao/:protocolo' element={<ProtecaoAdmin> <VerDetalhes /> </ProtecaoAdmin>} />
        <Route path='admin/vereadores' element={<ProtecaoAdmin> <PerfiVereadores /> </ProtecaoAdmin>} />
        <Route path='admin/vereadores/cadastro' element={<ProtecaoAdmin> <CadastrarVereadores /> </ProtecaoAdmin>} />
        <Route path="/admin/vereadores/cadastro/:id" element={<ProtecaoAdmin> <CadastrarVereadores /> </ProtecaoAdmin>} />
        <Route path="/admin/ouvidor" element={<ProtecaoAdmin> <Ouvidor/> </ProtecaoAdmin>} />

        {/* Rotas públicas */}
        <Route path="denuncia" element={<DenunciaForm />} />
        <Route path="consulta" element={<ConsultaProtocolo />} />
        <Route path='login' element={<Login />} />
        <Route path="/" element={<HomePage />} />

        {/* Rota não encontrada */}
        <Route path='*' element={<NotFound />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;