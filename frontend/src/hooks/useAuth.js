import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Importa o cliente Supabase

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Mantém o estado de loading
  const [authError, setAuthError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true); // Mantém a inicialização

  // Verifica a sessão ao carregar
  useEffect(() => {
    const checkSession = async () => {
      setIsInitializing(true);
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Erro ao pegar sessão:", error);
        setAuthError("Erro ao verificar a sessão.");
      } else {
        setUser(session?.user ?? null); // Define o usuário se houver sessão
      }
      setIsInitializing(false);
    };

    checkSession();

    // Ouve mudanças no estado de autenticação (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false); // Garante que o loading para após o evento (login bem sucedido)
      }
    );

    // Limpa o listener ao desmontar o componente
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Função de login com Supabase
  const login = async (email, senha) => {
    setLoading(true); // Inicia o loading
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) {
        // Trata erros específicos do Supabase Auth se necessário
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("E-mail ou senha inválidos.");
        }
        throw error; // Lança outros erros
      }

      // O listener onAuthStateChange deve cuidar da atualização do usuário,
      // mas retornamos o usuário para a lógica do handleSubmit se necessário.
      return data.user;

    } catch (error) {
      console.error("Erro no login:", error);
      setAuthError(error.message || "Ocorreu um erro ao tentar fazer login.");
      setUser(null);
      // setLoading(false); // <<<< CORREÇÃO: Resetar loading em caso de erro
      return null;
    } finally {
       // CORREÇÃO: Garante que o loading sempre termina, mesmo com erro ou sucesso
       setLoading(false);
    }
  };

  // Função de logout com Supabase
  const logout = async () => {
    setLoading(true); // Pode adicionar loading aqui se desejar
    setAuthError(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro no logout:", error);
      setAuthError("Erro ao sair.");
    }
    // O listener onAuthStateChange vai limpar o 'user'
    // Limpa o localStorage se ainda estiver usando para outros fins (talvez não precise mais)
    localStorage.removeItem("usuario"); // Pode remover se não usar mais
    localStorage.removeItem("token");   // Pode remover se não usar mais
    setLoading(false); // Para o loading aqui
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, authError, isInitializing }}
    >
      {!isInitializing && children} {/* Renderiza children apenas após inicializar */}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);