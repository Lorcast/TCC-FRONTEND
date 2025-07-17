import './App.css';

//Router 
import {BrowserRouter, Routes, Route, Navigate, Router} from 'react-router-dom'

//pages
import ConsultaProtocolo from './pages/ConsultaProtocolo/ConsultaProtocolo';
import HomePage from './pages/HomePage/HomePage';
import DenunciaForm from './pages/DenunciaForm/DenunciaForm';



function App() {
  return (
    <BrowserRouter>
     <Routes>
        <Route path="/denuncia" element={<DenunciaForm />} />
        <Route path="/consulta" element={<ConsultaProtocolo />} />
        <Route path="/" element={<HomePage/>} />
               </Routes>
    </BrowserRouter>
   
  );
}

export default App;
