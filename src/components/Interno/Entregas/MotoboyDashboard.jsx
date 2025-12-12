// src/components/Interno/Entregas/MotoboyDashboard.jsx
import React, { useEffect, useState } from 'react';
import djangoApi from '../../../api/djangoApi';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderMotoboy from '../HeaderMotoboy'; // ajuste caminho se necessário

export default function MotoboyDashboard({ user, onLogout }) {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [codigo, setCodigo] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  // VIEW controla qual aba mostrar: "dashboard" | "entregas"
  const [view, setView] = useState('dashboard');

  // sincroniza com query param ?view=
  useEffect(() => {
    const qp = new URLSearchParams(location.search);
    const v = qp.get('view');
    if (v === 'entregas' || v === 'dashboard') setView(v);
    else setView('dashboard');
  }, [location.search]);

  /* -------------------------------------------------------------------------- */
  /*                              CARREGAR ENTREGAS                              */
  /* -------------------------------------------------------------------------- */
  const loadEntregas = async () => {
    try {
      setLoading(true);
      const { data } = await djangoApi.get('/entregas/');

      // motoboy só vê entregas atribuídas a ele
      const minhas = data.filter((e) => String(e.motoboy) === String(user.id));

      // ordenar por status (pendente -> em_entrega -> concluida) e depois por data_criacao desc
      const ordemStatus = { pendente: 1, em_entrega: 2, concluida: 3 };
      minhas.sort((a, b) => {
        const s = ordemStatus[a.status] - ordemStatus[b.status];
        if (s !== 0) return s;
        // fallback: data_criacao desc
        return (b.data_criacao || '').localeCompare(a.data_criacao || '');
      });

      setEntregas(minhas);
    } catch (e) {
      console.error(e);
      setErro('Erro ao carregar entregas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntregas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                CRIAR ENTREGA                                 */
  /* -------------------------------------------------------------------------- */
  const criarEntrega = async () => {
    if (!codigo.trim()) return alert('Digite o código da entrega!');
    try {
      await djangoApi.post('/entregas/', {
        codigo_pedido: codigo,
        motoboy: user.id,
        loja: user.loja, // assumir loja do usuário
        status: 'pendente',
      });
      setCodigo('');
      setShowForm(false);
      loadEntregas();
      // garante que a aba de entregas esteja visível após criar
      navigate('/motoboy?view=entregas');
    } catch (err) {
      console.error(err);
      alert('Erro ao criar entrega.');
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                            INICIAR / FINALIZAR                               */
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

  /* -------------------------------------------------------------------------- */
  /*                                   RENDER                                     */
  /* -------------------------------------------------------------------------- */
  return (
    <>
      <HeaderMotoboy onLogout={onLogout} />

      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#d20000]">
            {view === 'dashboard' ? 'Painel' : 'Minhas Entregas'}
          </h1>

          {view === 'entregas' ? (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#d20000] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition"
            >
              + Nova
            </button>
          ) : (
            <div className="text-sm text-gray-600">
              Resumo rápido das suas entregas
            </div>
          )}
        </div>

        {/* ----------------------------- DASHBOARD VIEW ----------------------------- */}
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* cards simples */}
            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-sm text-gray-500">Pendentes</div>
              <div className="text-2xl font-bold text-[#d20000]">
                {entregas.filter((e) => e.status === 'pendente').length}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-sm text-gray-500">Em Entrega</div>
              <div className="text-2xl font-bold text-[#1e90ff]">
                {entregas.filter((e) => e.status === 'em_entrega').length}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow text-center">
              <div className="text-sm text-gray-500">Concluídas</div>
              <div className="text-2xl font-bold text-[#16a34a]">
                {entregas.filter((e) => e.status === 'concluida').length}
              </div>
            </div>
          </div>
        )}

        {/* --------------------------- FORMULARIO NOVA ENTREGA --------------------------- */}
        {showForm && view === 'entregas' && (
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

        {/* --------------------------- LISTA DE ENTREGAS --------------------------- */}
        {view === 'entregas' && (
          <>
            {loading ? (
              <p>Carregando...</p>
            ) : entregas.length === 0 ? (
              <p className="text-gray-600">Nenhuma entrega cadastrada.</p>
            ) : (
              <>
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
                        <td className="border px-4 py-2 capitalize">
                          {e.status}
                        </td>
                        <td className="border px-4 py-2">
                          {hora(e.hora_saida)}
                        </td>
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
          </>
        )}
      </div>
    </>
  );
}
