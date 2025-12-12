// src/components/Atendente/AtendenteDashboard.jsx
import React, { useEffect, useState } from 'react';
import djangoApi from '../../api/djangoApi';
import AtendenteHeader from './AtendenteHeader';
import { useLocation } from 'react-router-dom';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

function AtendenteDashboard({ user, onLogout, initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const [entregas, setEntregas] = useState([]);
  const [motoboys, setMotoboys] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [motoboyFilter, setMotoboyFilter] = useState('');

  const lojaID = user?.loja;

  /* -------------------------------------------------------------------------- */
  /*                           CARREGAR ENTREGAS E USERS                        */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        const ent = await djangoApi.get('/entregas/');
        const users = await djangoApi.get('/users/');

        setEntregas(ent.data);
        setMotoboys(users.data.filter((u) => u.user_type === 'motoboy'));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                                GRÁFICO                                     */
  /* -------------------------------------------------------------------------- */

  const entregasConcluidas = entregas.filter(
    (e) =>
      e.status === 'concluida' &&
      String(e.loja) === String(lojaID) &&
      e.data_criacao,
  );

  // Agrupamento por data e motoboy
  const dataAgrupada = {};

  entregasConcluidas.forEach((e) => {
    const dia = e.data_criacao;
    const motoboy = e.motoboy_nome || 'Motoboy';

    if (!dataAgrupada[dia]) dataAgrupada[dia] = {};

    if (!dataAgrupada[dia][motoboy]) {
      dataAgrupada[dia][motoboy] = 0;
    }

    dataAgrupada[dia][motoboy] += 1;
  });

  // Converte para array compatível com Recharts
  const chartData = Object.keys(dataAgrupada).map((dia) => ({
    date: dia,
    ...dataAgrupada[dia],
  }));

  // Lista de nomes dos motoboys que aparecerão como linhas
  const motoboysUnicos = [
    ...new Set(entregasConcluidas.map((e) => e.motoboy_nome)),
  ];

  // Cores fixas para não trocar a cada render
  const cores = [
    '#00bcd4',
    '#4caf50',
    '#ff9800',
    '#e91e63',
    '#3f51b5',
    '#009688',
    '#9c27b0',
    '#f44336',
  ];

  /* -------------------------------------------------------------------------- */
  /*                                FILTRAGENS                                  */
  /* -------------------------------------------------------------------------- */
  const entregasFiltradas = entregas
    .filter((e) => String(e.loja) === String(lojaID))
    .filter((e) =>
      search
        ? e.codigo_pedido.toLowerCase().includes(search.toLowerCase())
        : true,
    )
    .filter((e) => (statusFilter ? e.status === statusFilter : true))
    .filter((e) =>
      motoboyFilter ? String(e.motoboy) === String(motoboyFilter) : true,
    );

  /* -------------------------------------------------------------------------- */
  /*                Atualizar aba ao trocar rota (dashboard/entregas)          */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (location.pathname.includes('/atendente/entregas')) {
      setActiveTab('entregas');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  /* -------------------------------------------------------------------------- */
  /*                                INTERFACE                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <div>
      <AtendenteHeader onLogout={onLogout} />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#d20000] mb-6">
          {activeTab === 'dashboard'
            ? 'Painel do Atendente'
            : 'Lista de Entregas'}
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Carregando...</p>
        ) : (
          <>
            {/* ------------------------------ DASHBOARD ------------------------------ */}
            {activeTab === 'dashboard' && (
              <div className="bg-white p-6 rounded-xl shadow mb-8">
                <h2 className="text-xl font-bold mb-4 text-[#d20000]">
                  Entregas Concluídas por Dia
                </h2>

                {chartData.length === 0 ? (
                  <p className="text-gray-600 text-center pt-4">
                    Nenhuma entrega concluída ainda.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />

                      {motoboysUnicos.map((motoboy, index) => (
                        <Line
                          key={motoboy}
                          type="monotone"
                          dataKey={motoboy}
                          stroke={cores[index % cores.length]}
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}

            {/* ------------------------------- ENTREGAS ------------------------------ */}
            {activeTab === 'entregas' && (
              <div>
                {/* FILTROS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Buscar por código..."
                    className="border p-2 rounded"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <select
                    className="border p-2 rounded"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_entrega">Em entrega</option>
                    <option value="concluida">Concluída</option>
                  </select>

                  <select
                    className="border p-2 rounded"
                    value={motoboyFilter}
                    onChange={(e) => setMotoboyFilter(e.target.value)}
                  >
                    <option value="">Motoboy</option>
                    {motoboys.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.username}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TABELA */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-3 border">Código</th>
                        <th className="p-3 border">Loja</th>
                        <th className="p-3 border">Motoboy</th>
                        <th className="p-3 border">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {entregasFiltradas.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="p-3 border">{e.codigo_pedido}</td>
                          <td className="p-3 border">{e.loja_nome}</td>
                          <td className="p-3 border">
                            {e.motoboy_nome || '—'}
                          </td>
                          <td className="p-3 border">{e.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AtendenteDashboard;
