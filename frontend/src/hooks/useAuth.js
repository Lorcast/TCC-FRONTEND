import { useState } from 'react';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, senha) => {
    setLoading(true);
    setAuthError(null);

    try {
      // Busca usuário pelo e-mail
      const res = await fetch(`http://localhost:3001/usuarios?email=${email}`);
      const data = await res.json();

      // Verifica se existe e se a senha bate
      if (data.length === 0 || data[0].senha !== senha) {
        throw new Error("E-mail ou senha inválidos.");
      }

      const usuario = data[0];
      setUser(usuario);
      return usuario;

    } catch (error) {
      setAuthError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { user, login, loading, authError };
}