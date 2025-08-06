import './App.css';

//Router 
import {BrowserRouter, Routes, Route, Navigate, Router} from 'react-router-dom'

//pages
import ConsultaProtocolo from './pages/Cidadao/ConsultaProtocolo';
import HomePage from './pages/HomePage/HomePage';
import DenunciaForm from './pages/Cidadao/DenunciaForm';
import Login from './pages/Admin/Auth/Login';
import NotFound from'./pages/NotFound';



function App() {
  return (
    <BrowserRouter>
     <Routes>
        <Route path='login' element={<Login/>} />

        <Route path="denuncia" element={<DenunciaForm />} />
        <Route path="consulta" element={<ConsultaProtocolo />} />

        <Route path="/" element={<HomePage/>} />

        <Route path='*' element={<NotFound/>} />
    </Routes>
    </BrowserRouter>
   
  );
}

export default App;
