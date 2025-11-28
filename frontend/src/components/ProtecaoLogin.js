import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtecaoLogin = ({ children }) => {
  
  const { user, isInitializing } = useAuth();

  
  if (isInitializing) {
      return <div className="text-center mt-10">Verificando autenticação...</div>;
  }

  
  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtecaoLogin;