// src/components/Atendente/AtendenteDashboard.jsx
import React, { useEffect, useState } from 'react';
import djangoApi from '../../api/djangoApi';
import AtendenteHeader from './AtendenteHeader';

function AtendenteDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  const [entregas, setEntregas] = useState([]);
  const [motoboys, setMotoboys] = useState([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [motoboyFilter, setMotoboyFilter] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  const lojaID = user?.loja_id;

  // ===============================
  // 🔥 CARREGAR ENTREGAS + MOTOBÓYS
  // ===============================
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

  // ===============================
  // 🔥 FILTRAR ENTREGAS
  // ===============================
  const entregasFiltradas = entregas
    .filter((e) => String(e.loja) === String(lojaID))
    .filter((e) =>
      search
        ? e.codigo_pedido.toLowerCase().includes(search.toLowerCase())
        : true,
    )
    .filter((e) => (statusFilter ? e.status === statusFilter : true))
    .filter((e) =>
      motoboyFilter ? String(e.motoboy) === motoboyFilter : true,
    );

  // ===============================
  // 🔥 ESTATÍSTICAS DO DIA
  // ===============================
  const hoje = new Date().toISOString().split('T')[0];

  const entregasHoje = entregasFiltradas.filter((e) => e.data === hoje);

  const stats = {
    pendentes: entregasHoje.filter((e) => e.status === 'pendente').length,
    emEntrega: entregasHoje.filter((e) => e.status === 'em_entrega').length,
    concluidas: entregasHoje.filter((e) => e.status === 'concluida').length,
  };

  const entregasPorMotoboy = {};
  entregasHoje.forEach((e) => {
    const nome = e.motoboy_nome || 'Sem motoboy';
    entregasPorMotoboy[nome] = (entregasPorMotoboy[nome] || 0) + 1;
  });

  // ===============================
  // 🔥 INTERFACE
  // ===============================
  return (
    <div>
      <HeaderFuncionario
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        }}
      />

      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-[#d20000] mb-6">
          Painel do Atendente
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Carregando...</p>
        ) : (
          <>
            {/* ============================ */}
            {/* 🔥 DASHBOARD */}
            {/* ============================ */}
            {activeTab === 'dashboard' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Resumo de Hoje</h2>

                {/* CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-200 rounded shadow text-center">
                    <h3 className="font-bold text-lg">Pendentes</h3>
                    <p className="text-2xl">{stats.pendentes}</p>
                  </div>

                  <div className="p-4 bg-gray-200 rounded shadow text-center">
                    <h3 className="font-bold text-lg">Em Entrega</h3>
                    <p className="text-2xl">{stats.emEntrega}</p>
                  </div>

                  <div className="p-4 bg-gray-200 rounded shadow text-center">
                    <h3 className="font-bold text-lg">Concluídas</h3>
                    <p className="text-2xl">{stats.concluidas}</p>
                  </div>
                </div>

                {/* Motoboy ranking */}
                <h3 className="text-lg font-semibold mb-2">
                  Entregas por Motoboy
                </h3>
                <div className="bg-white border rounded p-4 shadow mb-6">
                  {Object.keys(entregasPorMotoboy).length === 0 ? (
                    <p>Nenhuma entrega hoje.</p>
                  ) : (
                    <ul>
                      {Object.entries(entregasPorMotoboy).map(([nome, qtd]) => (
                        <li key={nome} className="py-1 border-b">
                          <strong>{nome}:</strong> {qtd} entregas
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ============================ */}
            {/* 🔥 TABELA DE ENTREGAS */}
            {/* ============================ */}
            {activeTab === 'entregas' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Entregas</h2>

                {/* FILTROS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
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
                    <option value="">Status</option>
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
                        <th className="p-3 border">Status</th>
                        <th className="p-3 border">Saída</th>
                        <th className="p-3 border">Conclusão</th>
                        <th className="p-3 border">Data</th>
                        <th className="p-3 border">Motoboy</th>
                      </tr>
                    </thead>

                    <tbody>
                      {entregasFiltradas.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="p-3 border">{e.codigo_pedido}</td>
                          <td className="p-3 border">{e.status}</td>
                          <td className="p-3 border">{e.hora_saida || '—'}</td>
                          <td className="p-3 border">
                            {e.hora_conclusao || '—'}
                          </td>
                          <td className="p-3 border">{e.data}</td>
                          <td className="p-3 border">
                            {e.motoboy_nome || '—'}
                          </td>
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
