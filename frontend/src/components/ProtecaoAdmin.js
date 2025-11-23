// src/components/ProtecaoAdmin.js

import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtecaoAdmin = ({ children }) => {
 
  const { user, isInitializing } = useAuth();

  
  if (isInitializing) {
      return <div className="text-center mt-10">Verificando autenticação...</div>;
  }

 
  if (!user) {
      return <Navigate to="/login" replace />;
  }

  
  return children;
};

export default ProtecaoAdmin;