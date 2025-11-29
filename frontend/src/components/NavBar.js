import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Importa o hook useAuth

const NavBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); 
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    
    await logout();
    navigate("/login", { replace: true });
    setMenuOpen(false); 
  };

  
  return (
    <header className="bg-blue-900 text-white px-6 py-4 fixed w-full top-0 z-50 shadow-md">
      <div className="flex justify-between items-center">
        {/* Título */}
       <button
  onClick={() => navigate("/")} // <-- Coloque o caminho da sua home
  className="text-xl font-bold hover:underline"
>
  Ouvidoria - Administrador
</button>

        
        <button
          className="sm:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} 
          aria-expanded={menuOpen}
        >
          <svg  >
            
          </svg>
        </button>

        {/* Navegação desktop */}

        <nav className="hidden sm:flex space-x-6">
      <button
        onClick={() => navigate("/admin/vereadores")}
        className="hover:underline"
      >
        Vereadores
      </button>

      <button
        onClick={() => navigate("/admin/ouvidor")}
        className="hover:underline"
      >
        Ouvidor
      </button>

      <button
        onClick={handleLogout}
        className="hover:underline"
      >
        Sair
      </button>
    </nav>
      </div>

      {/* Navegação mobile */}
      {menuOpen && (
        <nav className="sm:hidden mt-4 flex flex-col space-y-2 border-t border-blue-800 pt-2">
      <button
        onClick={() => {
          navigate("/admin/vereadores");
          setMenuOpen(false);
        }}
        className="hover:underline text-left py-1"
      >
        Vereadores
      </button>

      <button
        onClick={() => {
          navigate("/admin/ouvidor");
          setMenuOpen(false);
        }}
        className="hover:underline text-left py-1"
      >
        Ouvidor
      </button>

      <button
        onClick={handleLogout}
        className="hover:underline text-left py-1"
      >
        Sair
      </button>
    </nav>
      )}
    </header>
  );
};

export default NavBar;