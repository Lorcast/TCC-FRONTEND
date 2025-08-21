import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth"; 

const Login = () => {
  const [formularioLogin, setFormularioLogin] = useState({
    email: "",
    senha: "",
  });

  // Usa o hook
  const { login, loading, authError } = useAuth();
  const navigate = useNavigate();
  const [mensagemSucesso, setMensagemSucesso] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, senha } = formularioLogin;
    const usuario = await login(email, senha);

    if (usuario) {
      // Login OK - você pode salvar no localStorage aqui, se quiser
      localStorage.setItem("usuario", JSON.stringify(usuario));
      const fakeToken = btoa(`${usuario.email}:${new Date().getTime()}`);
      localStorage.setItem("token", fakeToken);

      setMensagemSucesso("Login realizado com sucesso!");
      
      setTimeout(() => {
        navigate("/admin"); // Redireciona após 1,5s
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
        <p className="text-center text-gray-600">
          Faça o login para ver o que há de novo.
        </p>

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
            onChange={(e) =>
              setFormularioLogin({
                ...formularioLogin,
                email: e.target.value,
              })
            }
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
            onChange={(e) =>
              setFormularioLogin({
                ...formularioLogin,
                senha: e.target.value,
              })
            }
            className="w-full p-2 border rounded"
          />
        </div>

        {authError && (
          <p className="text-red-600 text-center">{authError}</p>
        )}

        {mensagemSucesso && (
          <p className="text-green-600 text-center">{mensagemSucesso}</p>
        )}


        <div className="flex justify-center">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-10 rounded-md w-full text-center"
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