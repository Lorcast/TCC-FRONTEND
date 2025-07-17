import React from 'react';
import { NavLink } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-start py-10">
      {/* Cabeçalho com logo e título */}
      <header className="w-full max-w-2xl flex flex-col items-center justify-center mb-12">
        <img
          src="/logo.png"
          alt="Logo do Município"
          className="w-44 h-44 mb-4"
        />
        <h1 className="text-3xl font-bold text-blue-900">Sistema de Ouvidoria</h1>
        <p className="text-lg text-gray-600">Câmara Municipal de Jussara</p>
      </header>

      {/* Navegação */}
      <main className="w-full max-w-md px-4">
        <nav className="flex flex-col gap-6">
          <NavLink
            to="/denuncia"
            className="bg-blue-700 text-white py-3 px-6 rounded-2xl text-lg shadow hover:bg-blue-800 transition text-center"
          >
            Registrar Manifestação
          </NavLink>

          <NavLink
            to="/consulta"
            className="bg-green-600 text-white py-3 px-6 rounded-2xl text-lg shadow hover:bg-green-700 transition text-center"
          >
            Consultar Protocolo
          </NavLink>

          <NavLink
            to="/admin"
            className="bg-gray-600 text-white py-3 px-6 rounded-2xl text-lg shadow hover:bg-gray-700 transition text-center"
          >
            Área do Administrador
          </NavLink>
        </nav>
      </main>
    </div>
  );
};

export default HomePage;
