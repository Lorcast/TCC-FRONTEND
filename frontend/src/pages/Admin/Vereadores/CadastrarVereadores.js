import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { GoArrowLeft } from "react-icons/go";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";

const CadastrarVereadores = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Estado com os nomes corretos da tabela
  const [form, setForm] = useState({
    nome_completo: "",
    partido: "",
    email_contato: "",
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [mensagemErro, setMensagemErro] = useState(null);


  // Se tiver ID, carrega os dados do vereador
  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return; // se não tiver id, é cadastro novo

      try {
        const { data, error } = await supabase
          .from("vereadores")
          .select("nome_completo, partido, email_contato")
          .eq("id", id)
          .single();

        if (error) throw error;

         if (data) setForm(data);
      } catch (error) {
        console.error("Erro ao carregar vereador:", error);
        setMensagemErro("Erro ao carregar dados do vereador.");
      }
    };

    carregarDados();
  }, [id]);

 

  // Atualiza campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

 

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErros({});
    setMensagemErro(null);
    setMensagemSucesso(null);

    // Validação
    const novosErros = {};
    if (!form.nome_completo.trim()) novosErros.nome_completo = "Informe o nome do vereador.";
    if (!form.partido.trim()) novosErros.partido = "Informe o partido.";
    if (!form.email_contato.trim()) novosErros.email_contato = "Informe o e-mail de contato.";

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      setCarregando(false);
      return;
    }

    try {
      if (id) {
        // Atualiza vereador existente
        const { error } = await supabase
          .from("vereadores")
          .update(form)
          .eq("id", id);

        if (error) throw error;
        setMensagemSucesso("Vereador atualizado com sucesso!");
      } else {
        // Novo cadastro
        const { error } = await supabase.from("vereadores").insert([form]);
        if (error) throw error;
        setMensagemSucesso("Vereador cadastrado com sucesso!");
        setForm({ nome_completo: "", partido: "", email_contato: "" });
       
      }

      

    } catch (err) {
      console.error("Erro ao cadastrar vereador:", err);
      setMensagemErro("Ocorreu um erro ao tentar cadastrar o vereador. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
     <ProtecaoAdmin>
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded-lg shadow-md relative">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 text-gray-600 hover:text-blue-700 cursor-pointer text-2xl"
      >
        <GoArrowLeft />
      </button>

      <h2 className="text-2xl font-semibold mb-6 text-center" >Cadastrar Vereador </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div >
        <label className="block font-medium mb-1">
                Nome Vereador<span className="text-red-600"> *</span>
                  </label>
          <input
            type="text"
            name="nome_completo"
            value={form.nome_completo}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {erros.nome_completo && <p className="text-red-500 text-sm mt-1">{erros.nome_completo}</p>}
        </div>

        <div>
             <label className="block font-medium mb-1">
                Partido<span className="text-red-600"> *</span>
                  </label>
          <input
            type="text"
            name="partido"
            placeholder="Ex: PT, PSDB, MDB"
            value={form.partido}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {erros.partido && <p className="text-red-500 text-sm mt-1">{erros.partido}</p>}
        </div>

        <div>
             <label className="block font-medium mb-1">
                E-mail<span className="text-red-600"> *</span>
                  </label>
          <input
            type="email"
            name="email_contato"
            value={form.email_contato}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          {erros.email_contato && <p className="text-red-500 text-sm mt-1">{erros.email_contato}</p>}
        </div>
        <div>
             <label className="block font-medium mb-1">
                Legislatura<span className="text-red-600"> *</span>
                  </label>
        <input
            type="text"
            name="legislatura"
            placeholder="Ex: 2025–2028"
            className="w-full border rounded p-2"
             />         
        </div>

        <div>
 
  <div>
     <label className="block font-medium mb-1">
                Situação<span className="text-red-600"> *</span>
                  </label>
                  
    {["ativo", "inativo"].map((status) => (
      <label key={status} className="flex items-center gap-2">
        <input type="radio"
          name="situacao"
          value={status}
          checked={form.situacao === status}
          onChange={handleChange}
        />
        {status === "ativo" ? "Ativo" : "Inativo"}
      </label>
    ))}
  </div>
</div>
        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-wait"
        >
          {carregando ? "Salvando" : "Cadastrar"}
        </button>
      </form>
      

      {/* Mensagem de sucesso */}
      {mensagemSucesso && (
        <div className="  text-green-700 p-4 rounded-md mt-4 text-center">
          <p>{mensagemSucesso}</p>
        </div>
      )}

      {/* Mensagem de erro */}
      {mensagemErro && (
        <div className=" text-red-700 p-4 rounded-md mt-4 text-center">
          <p>{mensagemErro}</p>
        </div>
      )}
    </div>
    </ProtecaoAdmin>
  );
};

export default CadastrarVereadores;