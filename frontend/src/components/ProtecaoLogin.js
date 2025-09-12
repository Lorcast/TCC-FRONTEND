import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtecaoLogin = ({ children }) => {
  const { user, isInitializing } = useAuth();

  
  if (isInitializing) {
    return null;
  }


  if (user && localStorage.getItem("token")) {
    return <Navigate to="/admin" replace />;
  }

  
  return children;
};

export default ProtecaoLogin;