import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { useAuth } from "../../../hooks/useAuth";
import ProtecaoLogin from "../../../components/ProtecaoLogin";

const Login = () => {
  const [formularioLogin, setFormularioLogin] = useState({
    email: "",
    senha: "",
  });

  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [erros, setErros] = useState({});
  const { login, loading, authError, user } = useAuth(); // pq esse não passa um paraemtro?
  const navigate = useNavigate();

  // useEffect pode ser mantido ou removido, mas não será usado se ProtecaoLogin redirecionar
  useEffect(() => {
    if (user) {
      navigate("/admin", { replace: true }); 
    }
  }, [user, navigate]);

  const validarCampos = () => {
    const novosErros = {};

    if (!formularioLogin.email.trim()) {
      novosErros.email = "O e-mail é obrigatório.";
    } else if (!/\S+@\S+\.\S+/.test(formularioLogin.email)) {
      novosErros.email = "Digite um e-mail válido.";
    }

    if (!formularioLogin.senha.trim()) {
      novosErros.senha = "A senha é obrigatória.";
    }

    return novosErros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemSucesso("");
    setErros({});

    const errosValidados = validarCampos();
    if (Object.keys(errosValidados).length > 0) {
      setErros(errosValidados);
      return;
    }

    const { email, senha } = formularioLogin;
    const usuarioLogado = await login(email, senha);

    if (usuarioLogado) {
      setMensagemSucesso("Login realizado com sucesso! Redirecionando...");
     
      setTimeout(() => {
        navigate("/admin", { replace: true });
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
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit"
            aria-label="Voltar"
          >
            <GoArrowLeft />
          </button>

          <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
          <p className="text-center text-gray-600">Faça o login para ver o que há de novo.</p>

          <div>
            <label htmlFor="email-input" className="block font-medium mb-1">
              E-mail <span className="text-red-600">*</span>
            </label>
            <input
              id="email-input"
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
              aria-invalid={!!erros.email}
              aria-describedby={erros.email ? "email-error" : undefined}
            />
            {erros.email && <p id="email-error" className="text-red-500 text-sm mt-1">{erros.email}</p>}
          </div>

          <div>
            <label htmlFor="senha-input" className="block font-medium mb-1">
              Senha <span className="text-red-600">*</span>
            </label>
            <input
              id="senha-input"
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
              aria-invalid={!!erros.senha}
              aria-describedby={erros.senha ? "senha-error" : undefined}
            />
            {erros.senha && <p id="senha-error" className="text-red-500 text-sm mt-1">{erros.senha}</p>}
          </div>

          {authError && <p className="text-red-600 text-center">{authError}</p>}
          {mensagemSucesso && <p className="text-green-600 text-center">{mensagemSucesso}</p>}

          <div className="flex justify-center">
            <button
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-10 rounded-md w-full text-center disabled:opacity-50"
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