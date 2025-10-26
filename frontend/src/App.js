import './App.css';

//Router
// Removido Navigate e Router que não estavam sendo usados
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='login' element={<Login />} />

        {/* Rotas protegidas */}
        <Route path='admin' element={<ProtecaoAdmin> <AreaAdmin /> </ProtecaoAdmin>} />
        <Route path='admin/manifestacao/:protocolo' element={<ProtecaoAdmin> <VerDetalhes /> </ProtecaoAdmin>} />
        {/* As rotas de vereadores também precisam estar dentro de ProtecaoAdmin? Se sim, ajuste como abaixo */}
        <Route path='admin/vereadores' element={<ProtecaoAdmin> <PerfiVereadores /> </ProtecaoAdmin>} />
        <Route path='admin/vereadores/cadastro' element={<ProtecaoAdmin> <CadastrarVereadores /> </ProtecaoAdmin>} />
        <Route path="/admin/vereadores/cadastro/:id" element={<ProtecaoAdmin> <CadastrarVereadores /> </ProtecaoAdmin>} />

        {/* Rotas públicas */}
        <Route path="denuncia" element={<DenunciaForm />} />
        <Route path="consulta" element={<ConsultaProtocolo />} />
        <Route path="/" element={<HomePage />} />

        {/* Rota não encontrada */}
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;