// src/components/Atendente/AtendenteDashboard.jsx
import React, { useEffect, useState } from 'react';
import djangoApi from '../../api/djangoApi';
import AtendenteHeader from './AtendenteHeader';

function AtendenteDashboard({ user, onLogout, initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

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
  /*                                INTERFACE                                   */
  /* -------------------------------------------------------------------------- */
  return (
    <div>
      <AtendenteHeader onLogout={onLogout} />

      <div className="p-6 max-w-5xl mx-auto">
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
            {activeTab === 'dashboard' && <p>Resumo do atendente aqui…</p>}

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
