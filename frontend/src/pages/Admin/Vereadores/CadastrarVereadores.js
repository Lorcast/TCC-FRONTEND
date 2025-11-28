// src/pages/Admin/Vereadores/CadastrarVereadores.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import { GoArrowLeft } from "react-icons/go";
import ProtecaoAdmin from "../../../components/ProtecaoAdmin";

const CadastrarVereadores = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    nome_completo: "",
    partido: "",
    email_contato: "",
    legislatura: "",
    situacao: "",
  });

  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [mensagemErro, setMensagemErro] = useState(null);

  const validaremail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Carregar dados do vereador (edição)
  useEffect(() => {
    const carregarDados = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("vereadores")
          .select("nome_completo, partido, email_contato, legislatura, situacao")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (data) {
          // Limpa aspas extras na situacao, se houvers
          const situacaoTratada = data.situacao ? data.situacao.replace(/'/g, "") : "";
          setForm({ ...data, situacao: situacaoTratada });
        }
      } catch (error) {
        console.error("Erro ao carregar vereador:", error);//precis ter isso
        setMensagemErro("Erro ao carregar dados do vereador.");
      }
    };

    carregarDados();
  }, [id]);



  const handleChange = (e) => {
    const { name, value } = e.target;

if (name === "email_contato") {
      setForm((prev) => ({ ...prev, [name]: value }));

      if (!validaremail(value)) {
        setErros((prev) => ({
          ...prev,
          email_contato: "Digite um e-mail válido."
        }));
      } else {
        setErros((prev) => {
          const novo = { ...prev };
          delete novo.email_contato;
          return novo;
        });
      }

      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // pq tem isso?
    setCarregando(true);
    setErros({});
    setMensagemErro(null);
    setMensagemSucesso(null);

    const novosErros = {};
    if (!form.nome_completo?.trim()) novosErros.nome_completo = "Digite o nome do vereador.";
    if (!form.partido?.trim()) novosErros.partido = "Digite o partido.";
    if (!form.email_contato?.trim()) novosErros.email_contato = "Digite o e-mail de contato.";
    if (!form.legislatura?.trim()) novosErros.legislatura = "Digite a legislatura.";
    if (!form.situacao?.trim()) novosErros.situacao = "Escolha a situação.";

    

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      setCarregando(false);
      return;
    }

    // envio para o supabase 
    try {
      if (id) {
        const { error } = await supabase
          .from("vereadores")
          .update(form)
          .eq("id", id);
        if (error) throw error;
        setMensagemSucesso("Vereador atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("vereadores").insert([form]);
        if (error) throw error;
        setMensagemSucesso("Vereador cadastrado com sucesso!");
        setForm({ nome_completo: "", partido: "", email_contato: "", legislatura: "", situacao: "" });
      }
    } catch (err) {
      console.error("Erro ao cadastrar vereador:", err);
      setMensagemErro("erro ao cadastrar o vereador. Tente novamente.");
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

        <h2 className="text-2xl font-semibold mb-6 text-center">Cadastrar Vereador</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
             className={`w-full border rounded p-2 ${
                erros.email_contato ? "border-red-500" : "border-gray-300"
              }`}
            />

            {erros.email_contato && (
              <p className="text-red-500 text-sm mt-1">{erros.email_contato}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Legislatura<span className="text-red-600"> *</span>
            </label>
            <input
              type="text"
              name="legislatura"
              placeholder="Ex: 2025–2028"
              value={form.legislatura}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
            {erros.legislatura && <p className="text-red-500 text-sm mt-1">{erros.legislatura}</p>}
          </div>

          <div>
            <label className="block font-medium mb-1">
              Situação<span className="text-red-600"> *</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="situacao"
                value="Ativo"
                checked={form.situacao === "Ativo"}
                onChange={handleChange}
              />
              Ativo
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="situacao"
                value="Inativo"
                checked={form.situacao === "Inativo"}
                onChange={handleChange}
              />
              Inativo
            </label>
            {erros.situacao && <p className="text-red-500 text-sm mt-1">{erros.situacao}</p>}
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-wait"
          >
            {carregando ? "Salvando..." : id ? "Atualizar" : "Cadastrar"}
          </button>
        </form>

        {mensagemSucesso && (
          <div className="text-green-700 p-4 rounded-md mt-4 text-center">
            <p>{mensagemSucesso}</p>
          </div>
        )}

        {mensagemErro && (
          <div className="text-red-700 p-4 rounded-md mt-4 text-center">
            <p>{mensagemErro}</p>
          </div>
        )}
      </div>
    </ProtecaoAdmin>
  );
};

export default CadastrarVereadores;