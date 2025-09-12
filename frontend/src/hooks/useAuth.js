import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("usuario");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      // Verificar se o token é válido (isso pode envolver um request ao servidor)
      // Aqui você pode validar o token se precisar
      setUser(JSON.parse(storedUser));
    }
    setIsInitializing(false);
  }, []);

  const login = async (email, senha) => {
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`http://localhost:3001/usuarios?email=${email}`);
      const data = await res.json();

      if (data.length === 0 || data[0].senha !== senha) {
        throw new Error("E-mail ou senha inválidos.");
      }

      const usuario = data[0];
      setUser(usuario);
      localStorage.setItem("usuario", JSON.stringify(usuario));

      const fakeToken = btoa(`${usuario.email}:${new Date().getTime()}`);
      localStorage.setItem("token", fakeToken);

      return usuario;
    } catch (error) {
      setAuthError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.reload(); // Força recarregar para atualizar o estado na UI
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, authError, isInitializing }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);