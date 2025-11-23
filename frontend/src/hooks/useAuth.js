// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [authError, setAuthError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); 

  
  useEffect(() => {
    const checkSession = async () => {
      setIsInitializing(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao pegar sessão:", error);
        setAuthError("Erro ao verificar a sessão.");
      } else {
        setUser(session?.user ?? null); 
      }
      setIsInitializing(false);
    };

    checkSession();

    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false); 
      }
    );

    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  
  const login = async (email, senha) => {
    setLoading(true); 
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) {
        
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("E-mail ou senha inválidos.");
        }
        throw error; 
      }

      
      return data.user;

    } catch (error) {
      console.error("Erro no login:", error);
      setAuthError(error.message || "Ocorreu um erro ao tentar fazer login.");
      setUser(null);
      
      return null;
    } finally {
        setLoading(false);
    }
  };

  
  const logout = async () => {
    setLoading(true); 
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro no logout:", error);
      setAuthError("Erro ao sair.");
    }
   
    localStorage.removeItem("usuario"); 
    localStorage.removeItem("token");   
    setLoading(false); 
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, authError, isInitializing }}
    >
      {!isInitializing && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);