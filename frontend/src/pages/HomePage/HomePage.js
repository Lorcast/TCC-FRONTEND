import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // useNavigate importado corretamente
import { useAuth } from '../../hooks/useAuth'; // useAuth importado corretamente

const HomePage = () => {
  const navigate = useNavigate(); // Hook para navegação
  const { user, isInitializing } = useAuth(); // Acessa o user do contexto de autenticação

  // Função para redirecionar conforme o login do usuário
  const handleAdminClick = () => {
    if (user) {
      navigate('/admin'); // Se estiver logado, vai para a área administrativa
    } else {
      navigate('/login'); // Se não estiver logado, vai para a tela de login
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/fundo-camara.jpeg')",
      }}
    >
      {/* Sobreposição escura para o fundo */}
      <div className="absolute inset-0 bg-black bg-opacity-70 z-0"></div>

      {/* Conteúdo centralizado verticalmente */}
      <div className="relative z-10 flex flex-col items-center text-center text-white">
        {/* LOGO fora do fluxo normal para não empurrar o conteúdo */}
        <img
          src="/logo.png"
          alt="Brasão do Município"
          className="absolute top-[-180px] w-80 md:w-96 drop-shadow-lg"
        />

        {/* Espaço reservado para que o conteúdo não suba por cima da logo */}
        <div className="h-32 md:h-40"></div>

        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-xl mb-2">
          OUVIDORIA
        </h1>
        <p className="text-xl md:text-2xl font-semibold mb-8">
          CÂMARA DE JUSSARA
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <NavLink
            to="/denuncia"
            className="bg-blue-600 text-white py-3 px-6 rounded-2xl text-lg shadow hover:bg-blue-700 transition"
          >
            Registrar Manifestação
          </NavLink>

          <NavLink
            to="/consulta"
            className="bg-green-600 text-white py-3 px-6 rounded-2xl text-lg shadow hover:bg-green-700 transition"
          >
            Consultar Protocolo
          </NavLink>

          {/* Agora é um botão, não mais um NavLink */}
          <button
            onClick={handleAdminClick}
            className="bg-gray-600 text-white py-3 px-6 rounded-2xl text-lg shadow hover:bg-gray-700 transition"
          >
            Área do Administrador
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;