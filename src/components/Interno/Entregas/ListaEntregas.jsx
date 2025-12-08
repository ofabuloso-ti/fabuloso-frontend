// src/components/Interno/Entregas/ListaEntregas.jsx
import React, { useEffect, useState } from 'react';
import djangoApi from '../../../api/djangoApi';
import CriarEntregaForm from './CriarEntregaForm';
import EntregaDetalhe from './EntregaDetalhe';
import HeaderFuncionario from '../HeaderFuncionario';

function ListaEntregas() {
  const [entregas, setEntregas] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [lojaFilter, setLojaFilter] = useState('');
  const [lojas, setLojas] = useState([]);

  const [selectedEntrega, setSelectedEntrega] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // ============================================================
  // 🔥 CARREGAR ENTREGAS + LOJAS INICIAIS
  // ============================================================
  <HeaderFuncionario
    activeTab="entregas"
    setActiveTab={() => {}}
    onLogout={() => {
      localStorage.removeItem('token');
      window.location.href = '/';
    }}
  />;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entregasRes = await djangoApi.get('/entregas/');
        const lojasRes = await djangoApi.get('/lojas/');

        setEntregas(entregasRes.data);
        setFiltered(entregasRes.data);
        setLojas(lojasRes.data);
      } catch (err) {
        console.error('Erro ao carregar entregas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ============================================================
  // 🔥 FILTRAGEM DINÂMICA
  // ============================================================
  useEffect(() => {
    let list = [...entregas];

    if (lojaFilter) {
      list = list.filter((e) => String(e.loja) === String(lojaFilter));
    }

    if (statusFilter) {
      list = list.filter((e) => e.status === statusFilter);
    }

    if (search.trim() !== '') {
      const txt = search.toLowerCase();
      list = list.filter((e) => e.codigo_pedido.toLowerCase().includes(txt));
    }

    setFiltered(list);
  }, [search, statusFilter, lojaFilter, entregas]);

  // ============================================================
  // 🔥 Atualizar lista após criar/editar
  // ============================================================
  const refreshEntregas = async () => {
    const res = await djangoApi.get('/entregas/');
    setEntregas(res.data);
  };

  // ============================================================
  // ❌ Exclusão
  // ============================================================
  const excluirEntrega = async (id) => {
    if (!window.confirm('Deseja excluir esta entrega?')) return;

    try {
      await djangoApi.delete(`/entregas/${id}/`);
      refreshEntregas();
    } catch (err) {
      console.error('Erro ao excluir entrega:', err);
    }
  };

  // ============================================================
  // 🔥 Tela de Detalhe
  // ============================================================
  if (selectedEntrega) {
    return (
      <EntregaDetalhe
        entrega={selectedEntrega}
        onBack={() => setSelectedEntrega(null)}
        onUpdated={refreshEntregas}
      />
    );
  }

  // ============================================================
  // 🔥 Tela de Criar Entrega
  // ============================================================
  if (isCreating) {
    return (
      <CriarEntregaForm
        onCancel={() => setIsCreating(false)}
        onSave={() => {
          refreshEntregas();
          setIsCreating(false);
        }}
      />
    );
  }

  // ============================================================
  // 🔥 LISTAGEM PRINCIPAL
  // ============================================================
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[#d20000] mb-6">
        Lista de Entregas
      </h1>

      {/* 🔥 FILTROS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Buscar */}
        <input
          type="text"
          placeholder="Buscar por código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded-md shadow-sm focus:border-[#d20000]"
        />

        {/* Loja */}
        <select
          value={lojaFilter}
          onChange={(e) => setLojaFilter(e.target.value)}
          className="px-3 py-2 border rounded-md shadow-sm"
        >
          <option value="">Todas as lojas</option>
          {lojas.map((loja) => (
            <option key={loja.id} value={loja.id}>
              {loja.nome}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md shadow-sm"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="em_entrega">Em entrega</option>
          <option value="concluida">Concluída</option>
        </select>

        {/* Criar */}
        <button
          className="bg-[#28a745] text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
          onClick={() => setIsCreating(true)}
        >
          + Criar Entrega
        </button>
      </div>

      {/* 🔥 TABELA */}
      {loading ? (
        <p className="text-center text-gray-600">Carregando...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma entrega encontrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 border">Código</th>
                <th className="p-3 border">Loja</th>
                <th className="p-3 border">Motoboy</th>
                <th className="p-3 border">Status</th>
                <th className="p-3 border text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((entrega) => (
                <tr key={entrega.id} className="hover:bg-gray-50">
                  <td className="p-3 border">{entrega.codigo_pedido}</td>

                  <td className="p-3 border">
                    {entrega.loja_nome || entrega.loja}
                  </td>

                  <td className="p-3 border">{entrega.motoboy_nome || '—'}</td>

                  <td className="p-3 border">{entrega.status}</td>

                  <td className="p-3 border text-center space-x-3">
                    <button
                      onClick={() => setSelectedEntrega(entrega)}
                      className="text-blue-600 hover:underline"
                    >
                      Detalhes
                    </button>

                    <button
                      onClick={() => excluirEntrega(entrega.id)}
                      className="text-red-600 hover:underline"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListaEntregas;
