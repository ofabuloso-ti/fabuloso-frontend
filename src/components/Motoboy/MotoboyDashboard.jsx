// src/components/Motoboy/MotoboyDashboard.jsx

import React, { useEffect, useState } from 'react';
import djangoApi from '../../api/djangoApi';
import dayjs from 'dayjs';

export default function MotoboyDashboard({ user, onLogout }) {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // FORM de criação
  const [codigoEntrega, setCodigoEntrega] = useState('');
  const [criando, setCriando] = useState(false);

  // ========== CARREGAR ENTREGAS ==========
  const loadEntregas = async () => {
    try {
      setLoading(true);
      const { data } = await djangoApi.get('/entregas/');
      setEntregas(data);
    } catch (e) {
      console.error('Erro ao carregar entregas:', e);
      setErro('Erro ao carregar entregas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntregas();
  }, []);

  // ========== CADASTRAR ENTREGA ==========
  const criarEntrega = async (e) => {
    e.preventDefault();
    if (!codigoEntrega.trim()) return alert('Digite um código!');

    try {
      setCriando(true);

      const { data } = await djangoApi.post('/entregas/', {
        codigo: codigoEntrega,
      });

      console.log('Entrega criada:', data);
      setCodigoEntrega('');
      await loadEntregas();
      alert('Entrega cadastrada!');
    } catch (e) {
      console.error('Erro ao criar entrega:', e);
      alert('Erro ao criar entrega.');
    } finally {
      setCriando(false);
    }
  };

  // ========== INICIAR ==========
  const iniciarEntrega = async (id) => {
    try {
      await djangoApi.post(`/entregas/${id}/iniciar/`);
      loadEntregas();
    } catch (e) {
      alert('Erro ao iniciar entrega.');
    }
  };

  // ========== CONCLUIR ==========
  const concluirEntrega = async (id) => {
    try {
      await djangoApi.post(`/entregas/${id}/concluir/`);
      loadEntregas();
    } catch (e) {
      alert('Erro ao concluir entrega.');
    }
  };

  const formatarHora = (h) => (h ? dayjs(h).format('HH:mm') : '--');

  // ========== RENDER ==========
  if (loading) return <p className="p-4">Carregando entregas...</p>;
  if (erro) return <p className="p-4 text-red-600">{erro}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-[#d20000]">
        Minhas Entregas
      </h1>

      {/* FORM DE CADASTRO */}
      <form
        onSubmit={criarEntrega}
        className="bg-white p-4 rounded shadow mb-6 flex gap-3 items-end"
      >
        <div className="flex-1">
          <label className="block font-semibold mb-1">Código da Entrega</label>
          <input
            type="text"
            placeholder="Ex: 12345"
            value={codigoEntrega}
            onChange={(e) => setCodigoEntrega(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={criando}
          className="bg-[#d20000] text-white px-4 py-3 rounded hover:bg-red-700 transition"
        >
          {criando ? 'Salvando...' : 'Cadastrar'}
        </button>
      </form>

      {/* LISTA */}
      {entregas.length === 0 ? (
        <p>Nenhuma entrega encontrada.</p>
      ) : (
        <table className="w-full bg-white shadow rounded border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Código</th>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Saída</th>
              <th className="border px-4 py-2">Conclusão</th>
              <th className="border px-4 py-2 text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            {entregas.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{e.codigo || `#${e.id}`}</td>

                <td className="border px-4 py-2 capitalize">{e.status}</td>

                <td className="border px-4 py-2">
                  {formatarHora(e.hora_saida)}
                </td>

                <td className="border px-4 py-2">
                  {formatarHora(e.hora_conclusao)}
                </td>

                <td className="border px-4 py-2 text-center space-x-2">
                  {e.status === 'pendente' && (
                    <button
                      onClick={() => iniciarEntrega(e.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Iniciar
                    </button>
                  )}

                  {e.status === 'em_entrega' && (
                    <button
                      onClick={() => concluirEntrega(e.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Finalizar
                    </button>
                  )}

                  {e.status === 'concluida' && (
                    <span className="text-green-700 font-bold">
                      ✔ Finalizada
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={onLogout}
        className="mt-6 bg-[#d20000] text-white px-4 py-2 rounded"
      >
        Sair
      </button>
    </div>
  );
}
