import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; // useNavigate importado corretamente
import { useAuth } from '../../hooks/useAuth'; // useAuth importado corretamente

const HomePage = () => {
  const navigate = useNavigate(); // Hook para navegação
  // Removemos isInitializing, já que não está sendo usado aqui
  const { user } = useAuth(); // Acessa o user do contexto de autenticação

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
        // Usa a imagem de fundo correta
        backgroundImage: "url('/fundo-camara.jpeg')",
      }}
    >
      {/* Sobreposição escura para o fundo */}
      <div className="absolute inset-0 bg-black bg-opacity-70 z-0"></div>

      {/* Conteúdo centralizado verticalmente */}
      <div className="relative z-10 flex flex-col items-center text-center text-white pt-32 sm:pt-40"> {/* Adicionado padding-top */}

        {/* LOGO posicionada */}
        <img
          src="/logo.png" // Usa a logo correta
          alt="Brasão do Município de Jussara" // Texto alternativo mais descritivo
          className="absolute top-6 sm:top-8 w-40 sm:w-48 drop-shadow-lg" // Ajustado tamanho e posição
        />

        {/* Título e Subtítulo */}
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-xl mb-2">
          OUVIDORIA
        </h1>
        <p className="text-xl md:text-2xl font-semibold mb-8">
          CÂMARA MUNICIPAL DE JUSSARA
        </p>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4">
          <NavLink
            to="/denuncia"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg text-lg shadow-md hover:bg-blue-700 transition transform hover:scale-105" // Ajustado rounded e adicionado shadow/hover scale
          >
            Registrar Manifestação
          </NavLink>

          <NavLink
            to="/consulta"
            className="bg-green-600 text-white py-3 px-6 rounded-lg text-lg shadow-md hover:bg-green-700 transition transform hover:scale-105" // Ajustado rounded e adicionado shadow/hover scale
          >
            Consultar Protocolo
          </NavLink>

          {/* Botão Área Admin */}
          <button
            onClick={handleAdminClick}
            className="bg-gray-700 text-white py-3 px-6 rounded-lg text-lg shadow-md hover:bg-gray-800 transition transform hover:scale-105" // Ajustado cor/rounded e adicionado shadow/hover scale
          >
            Área Administrativa {/* Texto ajustado */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;