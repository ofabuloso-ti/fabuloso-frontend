// src/components/Interno/Entregas/MotoboyDashboard.jsx
import React, { useEffect, useState } from 'react';
import djangoApi from '../../../api/djangoApi';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import HeaderMotoboy from './HeaderMotoboy.jsx';

export default function MotoboyDashboard({ user, onLogout }) {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();

  /* -------------------------------------------------------------------------- */
  /*                              🔥 CARREGAR ENTREGAS                          */
  /* -------------------------------------------------------------------------- */
  const loadEntregas = async () => {
    try {
      setLoading(true);
      const { data } = await djangoApi.get('/entregas/');

      // Motoboy só vê entregas dele
      const minhas = data.filter((e) => String(e.motoboy) === String(user.id));

      // organizar (pendente → em entrega → concluída)
      const ordenadas = [...minhas].sort((a, b) => {
        const ordem = { pendente: 1, em_entrega: 2, concluida: 3 };
        return ordem[a.status] - ordem[b.status];
      });

      setEntregas(ordenadas);
    } catch (e) {
      console.error(e);
      setErro('Erro ao carregar entregas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntregas();
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                             🔥 CRIAR ENTREGA                                */
  /* -------------------------------------------------------------------------- */
  const criarEntrega = async () => {
    if (!codigo.trim()) return alert('Digite o código da entrega!');
    try {
      await djangoApi.post('/entregas/', {
        codigo_pedido: codigo,
        motoboy: user.id, // 🔥 agora vincula ao motoboy
        loja: user.loja, // 🔥 entrega pertence à loja do motoboy
        status: 'pendente',
      });

      setCodigo('');
      setShowForm(false);
      loadEntregas();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar entrega.');
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                      🔥 INICIAR / FINALIZAR ENTREGA                         */
  /* -------------------------------------------------------------------------- */
  const iniciarEntrega = async (id) => {
    try {
      await djangoApi.post(`/entregas/${id}/iniciar/`);
      loadEntregas();
    } catch {
      alert('Erro ao iniciar entrega.');
    }
  };

  const concluirEntrega = async (id) => {
    try {
      await djangoApi.post(`/entregas/${id}/concluir/`);
      loadEntregas();
    } catch {
      alert('Erro ao concluir entrega.');
    }
  };

  const hora = (h) => (h ? dayjs(h).format('HH:mm') : '--');

  return (
    <>
      {/* HEADER */}
      <HeaderMotoboy onLogout={onLogout} />

      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        {/* ---------------------------------------------------------------------- */}
        {/*                               TÍTULO                                   */}
        {/* ---------------------------------------------------------------------- */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#d20000]">Minhas Entregas</h1>

          <button
            onClick={() => setShowForm(true)}
            className="bg-[#d20000] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition"
          >
            + Nova
          </button>
        </div>

        {/* FORM DE NOVA ENTREGA */}
        {showForm && (
          <div className="bg-white p-5 rounded-lg shadow mb-6 max-w-md">
            <h2 className="text-xl font-bold mb-3 text-[#d20000]">
              Cadastrar Entrega
            </h2>

            <input
              type="text"
              placeholder="Código da entrega"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-3"
            />

            <div className="flex gap-3">
              <button
                onClick={criarEntrega}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Salvar
              </button>

              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------- */}
        {/*                               LISTA                                    */}
        {/* ---------------------------------------------------------------------- */}
        {loading ? (
          <p>Carregando...</p>
        ) : entregas.length === 0 ? (
          <p className="text-gray-600">Nenhuma entrega cadastrada.</p>
        ) : (
          <>
            {/* --------------------------- MOBILE CARDS --------------------------- */}
            <div className="md:hidden space-y-4">
              {entregas.map((e) => (
                <div
                  key={e.id}
                  className="bg-white rounded-lg shadow p-4 border"
                >
                  <div className="flex justify-between">
                    <p className="font-bold text-lg text-[#d20000]">
                      {e.codigo_pedido}
                    </p>
                    <span
                      className={`text-sm font-semibold ${
                        e.status === 'pendente'
                          ? 'text-gray-700'
                          : e.status === 'em_entrega'
                          ? 'text-blue-600'
                          : 'text-green-600'
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>

                  <p className="mt-1 text-sm">
                    Saída: <strong>{hora(e.hora_saida)}</strong>
                  </p>
                  <p className="text-sm">
                    Conclusão: <strong>{hora(e.hora_conclusao)}</strong>
                  </p>

                  <div className="mt-3 flex gap-3">
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
                  </div>
                </div>
              ))}
            </div>

            {/* ----------------------------- DESKTOP ------------------------------ */}
            <table className="hidden md:table w-full bg-white shadow rounded border-collapse">
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
                    <td className="border px-4 py-2">{e.codigo_pedido}</td>
                    <td className="border px-4 py-2 capitalize">{e.status}</td>
                    <td className="border px-4 py-2">{hora(e.hora_saida)}</td>
                    <td className="border px-4 py-2">
                      {hora(e.hora_conclusao)}
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
          </>
        )}
      </div>
    </>
  );
}
