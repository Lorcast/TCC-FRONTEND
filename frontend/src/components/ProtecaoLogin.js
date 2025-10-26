import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtecaoLogin = ({ children }) => {
  // Pega user e isInitializing do hook useAuth atualizado
  const { user, isInitializing } = useAuth();

  // Se ainda estiver verificando a sessão, não renderiza nada
  if (isInitializing) {
     // Você pode mostrar um spinner/loading aqui se preferir
    return <div className="text-center mt-10">Verificando autenticação...</div>;
  }

  // Se não estiver inicializando e JÁ HOUVER usuário, redireciona para o admin
  if (user) {
    // replace evita que o usuário volte para a página de login usando o botão "voltar" do navegador
    return <Navigate to="/admin" replace />;
  }

  // Se não houver usuário, renderiza a página de login (ou o conteúdo filho)
  return children;
};

export default ProtecaoLogin;