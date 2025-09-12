import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import ProtecaoLogin from "../../../components/ProtecaoLogin";

const Login = () => {
  const [formularioLogin, setFormularioLogin] = useState({
    email: "",
    senha: "",
  });

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erros, setErros] = useState({});
  const { login, loading, authError, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      return;
    }
  }, [user]);

  const validarCampos = () => {
    const novosErros = {};

    if (!formularioLogin.email.trim()) {
      novosErros.email = "O e-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formularioLogin.email)) {
      novosErros.email = "Digite um e-mail válido.";
    }

    if (!formularioLogin.senha.trim()) {
      novosErros.senha = "A senha é obrigatória.";
    } else if (formularioLogin.senha.length < 6) {
      novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    }

    return novosErros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errosValidados = validarCampos();
    if (Object.keys(errosValidados).length > 0) {
      setErros(errosValidados);
      return;
    }

    const { email, senha } = formularioLogin;
    const usuario = await login(email, senha);

    if (usuario) {
      localStorage.setItem("usuario", JSON.stringify(usuario));
      const fakeToken = btoa(`${usuario.email}:${new Date().getTime()}`);
      localStorage.setItem("token", fakeToken);

      setMensagemSucesso("Login realizado com sucesso!");

      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    }
  };

  return (
    <ProtecaoLogin>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
        >
          <button
            onClick={() => navigate("/", { replace: true })}
            className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit"
          >
            ←
          </button>

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
              placeholder="Digite seu E-mail"
              value={formularioLogin.email}
              onChange={(e) =>
                setFormularioLogin({
                  ...formularioLogin,
                  email: e.target.value,
                })
              }
              className={`w-full p-2 border rounded ${erros.email ? "border-red-500" : "border-gray-300"}`}
              autoComplete="email"
            />
            {erros.email && <p className="text-red-500 text-sm mt-1">{erros.email}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Senha <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              name="senha"
              placeholder="Digite sua Senha"
              value={formularioLogin.senha}
              onChange={(e) =>
                setFormularioLogin({
                  ...formularioLogin,
                  senha: e.target.value,
                })
              }
              className={`w-full p-2 border rounded ${erros.senha ? "border-red-500" : "border-gray-300"}`}
              autoComplete="current-password"
            />
            {erros.senha && <p className="text-red-500 text-sm mt-1">{erros.senha}</p>}
          </div>

          {authError && <p className="text-red-600 text-center">{authError}</p>}

          {mensagemSucesso && <p className="text-green-600 text-center">{mensagemSucesso}</p>}

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
    </ProtecaoLogin>
  );
};

export default Login;