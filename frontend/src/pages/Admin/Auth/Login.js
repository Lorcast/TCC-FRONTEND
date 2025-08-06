import { useState } from "react";

const Login = () => {
  const [formularioLogin, setFormularioLogin] = useState({
    email: "",
    senha: "",
  });
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErros({});
    setLoading(true);

    const { email, senha } = formularioLogin;

    try {
      const res = await fetch(
        `http://localhost:3001/usuarios?email=${email}&senha=${senha}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const usuario = data[0];

        // Simular token
        const fakeToken = btoa(`${usuario.email}:${new Date().getTime()}`);

        // Salvar no localStorage
        localStorage.setItem("token", fakeToken);
        localStorage.setItem("usuario", JSON.stringify(usuario));

        alert("Login realizado com sucesso!");
        // Redirecionar ou atualizar estado global, se necessário
      } else {
        setErros({ mensagem: "E-mail ou senha inválidos." });
      }
    } catch (err) {
      console.error(err);
      setErros({ mensagem: "Erro ao conectar com o servidor." });
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

        {erros.mensagem && (
          <p className="text-red-600 text-center">{erros.mensagem}</p>
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