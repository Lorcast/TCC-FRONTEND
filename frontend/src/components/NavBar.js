// src/components/NavBar.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Importa o hook useAuth

const NavBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Pega a função logout do hook
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    // Chama a função logout do hook (que usa Supabase)
    await logout();
    // A navegação pode ser desnecessária se o ProtecaoAdmin já redirecionar
    // Mas pode manter por segurança ou se quiser redirecionar imediatamente
    navigate("/login", { replace: true });
    setMenuOpen(false); // Fecha o menu mobile se estiver aberto
  };

  // Restante do componente permanece igual...
  return (
    <header className="bg-blue-900 text-white px-6 py-4 fixed w-full top-0 z-50 shadow-md">
      <div className="flex justify-between items-center">
        {/* Título */}
        <h1 className="text-xl font-bold">Ouvidoria - Administrador</h1> {/* Ajustado título */}

        {/* Botão menu mobile */}
        <button
          className="sm:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} // Acessibilidade
          aria-expanded={menuOpen} // Acessibilidade
        >
          <svg /* Seu SVG ... */ >
             {/* ... path icons ... */}
          </svg>
        </button>

        {/* Navegação desktop */}
        <nav className="hidden sm:flex space-x-6">
          <button
            onClick={() => navigate("/admin/vereadores")}
            className="hover:underline"
          >
          Vereadores {/* Ajustado texto */}
          </button>
          
          <button onClick={handleLogout} className="hover:underline">
            Sair
          </button>
        </nav>
      </div>

      {/* Navegação mobile */}
      {menuOpen && (
        <nav className="sm:hidden mt-4 flex flex-col space-y-2 border-t border-blue-800 pt-2"> {/* Estilo adicionado */}
          <button
            onClick={() => {
              navigate("/admin/vereadores");
              setMenuOpen(false);
            }}
            className="hover:underline text-left py-1" // Padding adicionado
          >
            Vereadores {/* Ajustado texto */}
          </button>
          
          <button
            onClick={handleLogout} // A função handleLogout já fecha o menu
            className="hover:underline text-left py-1" // Padding adicionado
          >
            Sair
          </button>
        </nav>
      )}
    </header>
  );
};

export default NavBar;