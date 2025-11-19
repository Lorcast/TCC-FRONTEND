// src/components/ProtecaoAdmin.js

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtecaoAdmin = ({ children }) => {
  // Pega user e isInitializing do hook useAuth atualizado
  const { user, isInitializing } = useAuth();

  // Se ainda estiver verificando a sessão, não renderiza nada
  if (isInitializing) {
    // Você pode mostrar um spinner/loading aqui se preferir
    return <div className="text-center mt-10">Verificando autenticação...</div>;
  }

  // Se não estiver inicializando e NÃO houver usuário, redireciona para login
  if (!user) {
    // replace evita que o usuário volte para a página protegida usando o botão "voltar" do navegador
    return <Navigate to="/login" replace />;
  }

  // Se houver usuário, renderiza o conteúdo protegido
  return children;
};

export default ProtecaoAdmin;