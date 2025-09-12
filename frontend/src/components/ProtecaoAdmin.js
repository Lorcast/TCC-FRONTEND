import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtecaoAdmin = ({ children }) => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return null;
  }

  if (!user || !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtecaoAdmin;