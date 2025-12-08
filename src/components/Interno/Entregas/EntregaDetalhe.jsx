// src/components/Interno/Entregas/EntregaDetalhe.jsx
import React, { useEffect, useState } from "react";
import djangoApi from "../../../api/djangoApi";

function EntregaDetalhe({ entrega, onBack, onUpdated }) {
  const [dados, setDados] = useState(entrega);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // 🔄 Recarregar dados sempre que o detalhe abrir
  // ============================================================
  const carregar = async () => {
    try {
      const res = await djangoApi.get(`/entregas/${entrega.id}/`);
      setDados(res.data);
    } catch (err) {
      console.error("Erro ao carregar entrega:", err);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // ============================================================
  // 🔥 Atualizar status (pendente → em_entrega → concluída)
  // ============================================================
  const atualizarStatus = async (novoStatus) => {
    setLoading(true);
    try {
      await djangoApi.patch(`/entregas/${dados.id}/`, {
        status: novoStatus,
      });

      await carregar(); // recarrega detalhe
      onUpdated(); // recarrega lista no dashboard
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
    setLoading(false);
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (!dados)
    return (
      <p className="text-center text-gray-600 text-lg pt-10">
        Carregando detalhes...
      </p>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-md">
      <button
        onClick={onBack}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Voltar
      </button>

      <h1 className="text-3xl font-bold text-[#d20000] mb-4">
        Detalhes da Entrega
      </h1>

      {/* INFORMAÇÕES */}
      <div className="space-y-3 text-lg">
        <p>
          <strong>Código do Pedido:</strong> {dados.codigo_pedido}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          <span
            className={`font-semibold ${
              dados.status === "concluida"
                ? "text-green-700"
                : dados.status === "em_entrega"
                ? "text-blue-700"
                : "text-gray-700"
            }`}
          >
            {dados.status}
          </span>
        </p>

        <p>
          <strong>Loja:</strong>{" "}
          {dados.loja_nome || dados.loja || "— não informado —"}
        </p>

        <p>
          <strong>Motoboy:</strong>{" "}
          {dados.motoboy_nome || dados.motoboy || "— Não atribuído —"}
        </p>

        {dados.hora_saida && (
          <p>
            <strong>Hora de Saída:</strong>{" "}
            {new Date(dados.hora_saida).toLocaleString()}
          </p>
        )}

        {dados.hora_conclusao && (
          <p>
            <strong>Concluída em:</strong>{" "}
            {new Date(dados.hora_conclusao).toLocaleString()}
          </p>
        )}
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="mt-6 flex gap-4">
        {/* PENDENTE → EM ENTREGA */}
        {dados.status === "pendente" && (
          <button
            onClick={() => atualizarStatus("em_entrega")}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Iniciar Entrega
          </button>
        )}

        {/* EM ENTREGA → CONCLUÍDA */}
        {dados.status === "em_entrega" && (
          <button
            onClick={() => atualizarStatus("concluida")}
            disabled={loading}
            className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Finalizar Entrega
          </button>
        )}

        {/* FINALIZADA */}
        {dados.status === "concluida" && (
          <p className="text-green-700 font-semibold text-xl">
            ✔ Entrega concluída.
          </p>
        )}
      </div>
    </div>
  );
}

export default EntregaDetalhe;
