import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-blue-900 text-white px-6 py-4 fixed w-full top-0 z-50 shadow-md">
      <div className="flex justify-between items-center">
        {/* Título */}
        <h1 className="text-xl font-bold">Ouvidoria - Manifestação</h1>

        {/* Botão menu mobile */}
        <button
          className="sm:hidden focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Navegação desktop */}
        <nav className="hidden sm:flex space-x-6">
          <button
            onClick={() => navigate("/perfil")}
            className="hover:underline"
          >
            Perfil
          </button>
          <button onClick={handleLogout} className="hover:underline">
            Sair
          </button>
        </nav>
      </div>

      {/* Navegação mobile */}
      {menuOpen && (
        <nav className="sm:hidden mt-2 flex flex-col space-y-2">
          <button
            onClick={() => {
              navigate("/perfil");
              setMenuOpen(false);
            }}
            className="hover:underline text-left"
          >
            Perfil
          </button>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="hover:underline text-left"
          >
            Sair
          </button>
        </nav>
      )}
    </header>
  );
};

export default NavBar;
