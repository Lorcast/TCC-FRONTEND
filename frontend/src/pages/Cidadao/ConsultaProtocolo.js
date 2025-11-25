// src/pages/Cidadao/ConsultaProtocolo.js
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
import { supabase } from '../../supabaseClient'; 
const ConsultaProtocolo = () => {

  // Estados da página

  const [protocoloDigitado, setProtocoloDigitado] = useState('');

  const [resultado, setResultado] = useState(null);

  const [carregando, setCarregando] = useState(false);

  const [error, setError] = useState(null);

  const navigate = useNavigate();


  // Função para formatar a data da resposta vinda do banco

  const formatarDataHoraResposta = (dataISO) => {

    if (!dataISO) return null;

    try {

      const data = new Date(dataISO);

      if (isNaN(data.getTime())) {

        console.error("Data de resposta inválida recebida:", dataISO);

        return null;

      }

      const dia = String(data.getDate()).padStart(2, '0');

      const mes = String(data.getMonth() + 1).padStart(2, '0');

      const ano = data.getFullYear();

      const hora = String(data.getHours()).padStart(2, '0');

      const minuto = String(data.getMinutes()).padStart(2, '0');

      return `Respondido em ${dia}/${mes}/${ano} às ${hora}:${minuto}`;

    } catch (e) {

      console.error("Erro ao formatar data_resposta:", dataISO, e);

      return null;

    }

  };


  // Função que busca os dados no Supabase

  const buscarManifestacao = async () => {

    setResultado(null);

    setError(null);

    if (!protocoloDigitado.trim()) {

      setError("Por favor, digite um número de protocolo.");

      return;

    }

    setCarregando(true);



    try {

      const { data, error: queryError } = await supabase

        .from('solicitacoes')

        .select(`

          protocolo,

          created_at,

          status,

          descricao,

          resposta_admin,

          data_resposta,   

          anexos ( caminho_arquivo, nome_original )

        `) 

        .eq('protocolo', protocoloDigitado.trim())

        .single();


      if (queryError && queryError.code !== 'PGRST116') {

        throw queryError;

      }



      if (data) {

        setResultado(data);

      } else {

        setResultado('not-found');

      }



    } catch (err) {

      console.error("Erro na busca da manifestação:", err);

      setError("Ocorreu um erro ao realizar a consulta. Verifique sua conexão e tente novamente.");

      console.error("Detalhe do erro Supabase:", err.message); // Mantém o log detalhado

    } finally {

      setCarregando(false);

    }

  };


  // Função para lidar com a tecla Enter no input

  const handleKeyPress = (e) => {

    if (e.key === 'Enter') {

      buscarManifestacao();

    }

  };

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---

  return (

    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">

      <div className="w-full max-w-xl text-center">

        <h2 className="text-2xl font-bold text-blue-900 mb-2">Consulta de Manifestação</h2>

        <p className="text-gray-600 mb-6">Digite o número do seu protocolo para ver o andamento.</p>

      </div>


      {/* Seta de Voltar */}

      <button

          type="button"

          onClick={() => navigate(-1)}

          className="absolute left-4 top-4 text-gray-600 hover:text-blue-700 cursor-pointer text-2xl"

          aria-label="Voltar"

        >

         <GoArrowLeft />

        </button>


      {/* Input e Botão de Consulta */}

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-xl">

        <input

          type="text"

          placeholder="Digite o número do protocolo"

          value={protocoloDigitado}

          onChange={(e) => setProtocoloDigitado(e.target.value)}

          onKeyPress={handleKeyPress}

          className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

          aria-label="Número do Protocolo"

        />

        <button

          onClick={buscarManifestacao}

          disabled={carregando}

          className="bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow hover:bg-blue-800 transition w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"

        >

          {carregando ? 'Consultando...' : 'Consultar'}

        </button>

      </div>


      {/* Área de Exibição de Resultados */}

      <div className="mt-8 w-full max-w-xl">

        {error && (

            <p className="text-red-600 text-center font-semibold">{error}</p>

        )}


        {resultado === 'not-found' && (

          <p className="text-yellow-700 bg-yellow-100 p-4 rounded-md text-center">

            Nenhuma manifestação encontrada com este número de protocolo.

          </p>

        )}


        {/* Exibição dos Detalhes */}

        {resultado && resultado !== 'not-found' && (

          <div className="bg-white p-6 rounded-lg shadow-md border w-full space-y-4 animate-fade-in">

            <h3 className="text-xl font-bold text-blue-800 border-b pb-2 mb-4">Detalhes da Manifestação</h3>



            {/* Informações Gerais */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-700">

                <div><strong>Protocolo:</strong> <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{resultado.protocolo}</span></div>

                <div><strong>Registrado em:</strong> {new Date(resultado.created_at).toLocaleString('pt-BR')}</div>

                <div className="sm:col-span-2">

                    <strong>Status:</strong> <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${resultado.status === 'Pendente' ? 'bg-yellow-200 text-yellow-800' : resultado.status === 'Em análise' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>{resultado.status}</span>

                </div>

            </div>



            {/* Descrição */}

            <div className="pt-2">

              <p className="font-semibold text-gray-800">Sua Mensagem:</p>

              <p className="mt-1 bg-gray-50 p-3 rounded-md border text-gray-700 whitespace-pre-wrap">{resultado.descricao}</p>

            </div>



            {/* Anexos */}

            <div>

              <span className="font-semibold text-gray-800">Anexo:</span>

              {resultado.anexos && resultado.anexos.length > 0 ? (

                <a

                  href={supabase.storage.from('anexos-ouvidoria').getPublicUrl(resultado.anexos[0].caminho_arquivo).data.publicUrl}

                  target="_blank"

                  rel="noopener noreferrer"

                  className="text-blue-600 underline hover:text-blue-800 ml-2"

                >

                  {resultado.anexos[0].nome_original || 'Visualizar anexo'}

                </a>

              ) : (

                <span className="text-gray-500 ml-2">Nenhum anexo enviado.</span>

              )}

            </div>



            {/* Resposta da Ouvidoria e Data da Resposta */}

            <div className="pt-2">

              <p className="font-semibold text-gray-800">Resposta da Ouvidoria:</p>

              <div className="mt-1 bg-blue-50 p-3 rounded-md border border-blue-200 text-blue-900">

                  {/* Mostra o texto da resposta */}

                  <p className="whitespace-pre-wrap">

                      {resultado.resposta_admin || 'Sua manifestação ainda não foi respondida.'}

                  </p>

                  {/* Mostra a data formatada SE existir data_resposta */}

                  {resultado.data_resposta && (

                    <p className="text-xs text-gray-500 mt-2">

                      {formatarDataHoraResposta(resultado.data_resposta)} {/* Chama a função de formatação */}

                    </p>

                  )}

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};

export default ConsultaProtocolo;