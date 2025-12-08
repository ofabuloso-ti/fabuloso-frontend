import React, { useEffect, useState } from 'react';
import djangoApi from '../../api/djangoApi';
import dayjs from 'dayjs';

export default function MotoboyDashboard({ user, onLogout }) {
  const [entregas, setEntregas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Formulário
  const [showForm, setShowForm] = useState(false);
  const [codigo, setCodigo] = useState('');

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

  // ========== CRIAR ENTREGA ==========
  const criarEntrega = async () => {
    if (!codigo.trim()) {
      alert('Digite um código!');
      return;
    }

    try {
      await djangoApi.post('/entregas/', { codigo });
      setCodigo('');
      setShowForm(false);
      loadEntregas();
    } catch (e) {
      console.error('Erro ao criar entrega:', e);
      alert('Erro ao cadastrar entrega.');
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

  // ========== FORMATAR ==========
  const formatarHora = (h) => (h ? dayjs(h).format('HH:mm') : '--');

  if (loading) return <p className="p-4">Carregando entregas...</p>;
  if (erro) return <p className="p-4 text-red-600">{erro}</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#d20000]">Minhas Entregas</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-[#d20000] text-white px-4 py-2 rounded shadow hover:bg-red-700"
        >
          Nova Entrega
        </button>
      </div>

      {/* FORM CADASTRO */}
      {showForm && (
        <div className="bg-white p-4 rounded shadow mb-6 max-w-md">
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

      {/* LISTA */}
      {entregas.length === 0 ? (
        <p className="text-gray-600">Nenhuma entrega atribuída.</p>
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
