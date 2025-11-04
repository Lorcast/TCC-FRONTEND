// src/pages/Admin/Auth/Login.js
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
  // Usa o hook useAuth atualizado
  const { login, loading, authError, user } = useAuth();
  const navigate = useNavigate();

  // Redireciona se já estiver logado (efeito pode ser ajustado conforme necessidade)
  useEffect(() => {
    if (user) {
       // O componente ProtecaoLogin já faz isso, talvez possa remover este useEffect
       // ou adicionar um pequeno delay antes de redirecionar
       // setTimeout(() => navigate("/admin", { replace: true }), 100);
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
    // Pode remover a validação de 6 caracteres se o Supabase já a fizer
    // else if (formularioLogin.senha.length < 6) {
    //   novosErros.senha = "A senha deve ter pelo menos 6 caracteres.";
    // }
    return novosErros;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagemSucesso(""); // Limpa mensagem de sucesso anterior
    setErros({}); // Limpa erros anteriores

    const errosValidados = validarCampos();
    if (Object.keys(errosValidados).length > 0) {
      setErros(errosValidados);
      return;
    }

    const { email, senha } = formularioLogin;
    // Chama a função login do hook (que agora usa Supabase)
    const usuarioLogado = await login(email, senha);

    // Se o login for bem-sucedido (Supabase cuidará da sessão),
    // o listener onAuthStateChange no useAuth atualizará o estado 'user'
    // e o ProtecaoLogin/useEffect fará o redirecionamento.
    if (usuarioLogado) {
        setMensagemSucesso("Login realizado com sucesso! Redirecionando...");
        // O redirecionamento pode ser tratado pelo ProtecaoLogin ou pelo useEffect acima.
        // Se quiser um delay explícito:
        setTimeout(() => {
            navigate("/admin", { replace: true });
        }, 1500); // Mantém o delay se desejar
    }
    // Se não houver 'usuarioLogado', o hook useAuth já terá definido o authError
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
            type="button" // Evita submit do form
            onClick={() => navigate("/", { replace: true })}
            className="text-gray-600 hover:text-blue-700 cursor-pointer text-2xl w-fit"
            aria-label="Voltar" // Boa prática de acessibilidade
          >
           <GoArrowLeft />
          </button>

          <h2 className="text-2xl font-bold text-center text-gray-800">Login</h2>
          <p className="text-center text-gray-600">
            Faça o login para ver o que há de novo.
          </p>

          {/* Inputs de email e senha (sem alterações) */}
          <div>
            <label htmlFor="email-input" className="block font-medium mb-1"> {/* Adicionado htmlFor */}
              E-mail <span className="text-red-600">*</span>
            </label>
            <input
              id="email-input" // Adicionado id
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
              aria-invalid={!!erros.email} // Acessibilidade
              aria-describedby={erros.email ? "email-error" : undefined} // Acessibilidade
            />
            {erros.email && <p id="email-error" className="text-red-500 text-sm mt-1">{erros.email}</p>}
          </div>

          <div>
            <label htmlFor="senha-input" className="block font-medium mb-1"> {/* Adicionado htmlFor */}
              Senha <span className="text-red-600">*</span>
            </label>
            <input
              id="senha-input" // Adicionado id
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
              aria-invalid={!!erros.senha} // Acessibilidade
              aria-describedby={erros.senha ? "senha-error" : undefined} // Acessibilidade
            />
            {erros.senha && <p id="senha-error" className="text-red-500 text-sm mt-1">{erros.senha}</p>}
          </div>

          {/* Exibição de erros e sucesso (sem alterações) */}
          {authError && <p className="text-red-600 text-center">{authError}</p>}
          {mensagemSucesso && <p className="text-green-600 text-center">{mensagemSucesso}</p>}

          <div className="flex justify-center">
            <button
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-10 rounded-md w-full text-center disabled:opacity-50" // Melhorado estilo do disabled
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