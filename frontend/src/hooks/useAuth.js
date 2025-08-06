import { useState } from 'react';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);

  const login = async (email, senha) => {
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch(`http://localhost:3000/usuarios?email=${email}&senha=${senha}`);
      const data = await res.json();

      if (data.length > 0) {
        setUser(data[0]);
        return data[0];
      } else {
        throw new Error("E-mail ou senha inválidos.");
      }
    } catch (error) {
      setAuthError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { user, login, loading, authError };
}