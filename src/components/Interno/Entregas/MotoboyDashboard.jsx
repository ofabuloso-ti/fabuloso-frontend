// src/components/Interno/Entregas/MotoboyDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import djangoApi from '../../../api/djangoApi';
import EntregaDetalhe from './EntregaDetalhe';

function MotoboyDashboard() {
  const [entregas, setEntregas] = useState([]);
  const [motoboy, setMotoboy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selecionada, setSelecionada] = useState(null);

  const navigate = useNavigate();

  // ============================================================
  // 🔐 PROTEGER ACESSO — só motoboy pode entrar
  // ============================================================
  useEffect(() => {
    const protegerAcesso = async () => {
      try {
        const response = await djangoApi.get('/auth/current_user/');
        const user = response.data;

        if (!user || user.user_type !== 'motoboy') {
          navigate('/login'); // expulsa quem não for motoboy
          return;
        }

        setMotoboy(user);
      } catch (err) {
        navigate('/login');
      }
    };

    protegerAcesso();
  }, [navigate]);

  // ============================================================
  // 🔥 Carrega entregas do motoboy logado
  // ============================================================
  const loadEntregas = async () => {
    if (!motoboy) return;

    try {
      const response = await djangoApi.get('/entregas/', {
        params: { motoboy: motoboy.id },
      });
      setEntregas(response.data);
    } catch (err) {
      console.error('Erro ao carregar entregas:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // 🔄 Atualiza status da entrega direto na lista
  // ============================================================
  const mudarStatus = async (id, novoStatus) => {
    try {
      await djangoApi.patch(`/entregas/${id}/`, { status: novoStatus });
      loadEntregas();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  // ============================================================
  // 📌 Effects
  // ============================================================
  useEffect(() => {
    if (motoboy) loadEntregas();

    // Atualização automática a cada 10s
    const interval = setInterval(() => {
      if (motoboy) loadEntregas();
    }, 10000);

    return () => clearInterval(interval);
  }, [motoboy]);

  // ============================================================
  // 🔥 Tela de detalhe
  // ============================================================
  if (selecionada) {
    return (
      <EntregaDetalhe
        entrega={selecionada}
        onBack={() => setSelecionada(null)}
        onUpdated={loadEntregas}
      />
    );
  }

  // ============================================================
  // 🔥 Tela de carregamento
  // ============================================================
  if (loading) {
    return (
      <div className="text-center text-lg font-semibold text-gray-600 pt-10">
        Carregando entregas...
      </div>
    );
  }

  // ============================================================
  // 🔥 Render do Dashboard
  // ============================================================
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#d20000] mb-6">
        Minhas Entregas
      </h1>

      {entregas.length === 0 ? (
        <p className="text-gray-600 text-lg">Nenhuma entrega atribuída.</p>
      ) : (
        <div className="space-y-4">
          {entregas.map((entrega) => (
            <div
              key={entrega.id}
              className="bg-white shadow-md rounded-md p-4 border border-gray-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    Pedido: {entrega.codigo_pedido}
                  </p>
                  <p className="text-gray-600">
                    Status:{' '}
                    <span
                      className={`font-bold ${
                        entrega.status === 'concluida'
                          ? 'text-green-700'
                          : entrega.status === 'em_entrega'
                          ? 'text-blue-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {entrega.status}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setSelecionada(entrega)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Detalhes
                </button>
              </div>

              {/* BOTÕES DE STATUS */}
              <div className="mt-4 flex gap-3">
                {entrega.status === 'pendente' && (
                  <button
                    onClick={() => mudarStatus(entrega.id, 'em_entrega')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Iniciar Entrega
                  </button>
                )}

                {entrega.status === 'em_entrega' && (
                  <button
                    onClick={() => mudarStatus(entrega.id, 'concluida')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Finalizar Entrega
                  </button>
                )}

                {entrega.status === 'concluida' && (
                  <p className="text-green-700 font-semibold">
                    ✔ Entrega concluída
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MotoboyDashboard;
