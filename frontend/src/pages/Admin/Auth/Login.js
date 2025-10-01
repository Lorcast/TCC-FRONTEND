// src/pages/Admin/Auth/Login.js
import { useState } from "react";
import { supabase } from "../../../supabaseClient"; // Importe o cliente Supabase
import { useNavigate } from "react-router-dom"; // Hook para fazer o redirecionamento

const Login = () => {
  const [formularioLogin, setFormularioLogin] = useState({
    email: "",
    senha: "",
  });
  const [erro, setErro] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormularioLogin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);

    const { email, senha } = formularioLogin;

    try {
      // Autenticação com Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: senha,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        console.log("Login realizado com sucesso!", data.session);
        // Redireciona para a página de dashboard do admin
        navigate("/admin/dashboard");
      } else {
        setErro("Ocorreu um erro inesperado durante o login.");
      }

    } catch (err) {
      console.error("Erro no login:", err.message);
      if (err.message.includes("Invalid login credentials")) {
        setErro("E-mail ou senha inválidos.");
      } else {
        setErro("Erro ao conectar com o servidor. Verifique sua conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login de Administrador</h2>
        
        <div>
          <label className="block font-medium mb-1">
            E-mail <span className="text-red-600">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="Digite seu E-mail"
            value={formularioLogin.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">
            Senha <span className="text-red-600">*</span>
          </label>
          <input
            type="password"
            name="senha"
            required
            placeholder="Digite sua Senha"
            value={formularioLogin.senha}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        {erro && (
          <p className="text-red-600 text-center bg-red-100 p-3 rounded-md">{erro}</p>
        )}

        <div className="flex justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-10 rounded-md w-full text-center disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;