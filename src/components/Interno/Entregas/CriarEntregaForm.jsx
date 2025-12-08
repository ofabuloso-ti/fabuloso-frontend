// src/components/Interno/Entregas/CriarEntregaForm.jsx
import React, { useState, useEffect } from 'react';
import djangoApi from '../../../api/djangoApi';

function CriarEntregaForm({ onSave, onCancel, existingEntrega = null }) {
  const [formData, setFormData] = useState({
    codigo_pedido: '',
    loja: '',
    motoboy: '',
    status: 'pendente',
  });

  const [lojas, setLojas] = useState([]);
  const [motoboys, setMotoboys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================
  // 🔥 Carregar lojas + motoboys
  // ============================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        const lojasRes = await djangoApi.get('/lojas/');
        const usersRes = await djangoApi.get('/users/');

        // filtrar motoboys pelo user_type
        const motos = usersRes.data.filter((u) => u.user_type === 'motoboy');

        setLojas(lojasRes.data);
        setMotoboys(motos);

        // 🔥 Preencher form ao editar
        if (existingEntrega) {
          setFormData({
            codigo_pedido: existingEntrega.codigo_pedido || '',
            loja: existingEntrega.loja || '',
            motoboy: existingEntrega.motoboy || '',
            status: existingEntrega.status || 'pendente',
          });
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do formulário.');
      }

      setLoading(false);
    };

    loadData();
  }, [existingEntrega]);

  // ============================================================
  // 🔥 Handle Input
  // ============================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ============================================================
  // 🔥 Submit
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.codigo_pedido || !formData.loja) {
      setError('Código do pedido e loja são obrigatórios.');
      return;
    }

    const body = {
      codigo_pedido: formData.codigo_pedido,
      loja: formData.loja,
      motoboy: formData.motoboy || null,
      status: formData.status,
    };

    try {
      let response;

      if (existingEntrega) {
        response = await djangoApi.put(
          `/entregas/${existingEntrega.id}/`,
          body,
        );
      } else {
        response = await djangoApi.post('/entregas/', body);
      }

      onSave(response.data);
    } catch (err) {
      console.error(err.response?.data || err);
      setError('Erro ao salvar a entrega.');
    }
  };

  // ============================================================
  // 🔥 Loading
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-600">
        Carregando formulário...
      </div>
    );
  }

  // ============================================================
  // 🔥 Render Form
  // ============================================================
  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md font-sans">
      <h3 className="text-2xl font-bold mb-6 text-[#d20000]">
        {existingEntrega ? 'Editar Entrega' : 'Criar Nova Entrega'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="border border-gray-300 rounded-md p-6">
          <legend className="px-2 text-[#d20000] font-semibold text-lg">
            Dados da Entrega
          </legend>

          <div className="mt-4 space-y-4">
            {/* Código Pedido */}
            <label className="block">
              <span className="text-gray-700 font-medium">
                Código do Pedido *
              </span>
              <input
                type="text"
                name="codigo_pedido"
                value={formData.codigo_pedido}
                onChange={handleInputChange}
                className="mt-1 w-full border rounded-md px-3 py-2 shadow-sm"
              />
            </label>

            {/* Loja */}
            <label className="block">
              <span className="text-gray-700 font-medium">Loja *</span>
              <select
                name="loja"
                value={formData.loja}
                onChange={handleInputChange}
                className="mt-1 w-full border rounded-md px-3 py-2 bg-white shadow-sm"
              >
                <option value="">Selecione...</option>
                {lojas.map((loja) => (
                  <option key={loja.id} value={loja.id}>
                    {loja.nome}
                  </option>
                ))}
              </select>
            </label>

            {/* Motoboy */}
            <label className="block">
              <span className="text-gray-700 font-medium">Motoboy</span>
              <select
                name="motoboy"
                value={formData.motoboy}
                onChange={handleInputChange}
                className="mt-1 w-full border rounded-md px-3 py-2 bg-white shadow-sm"
              >
                <option value="">Nenhum</option>
                {motoboys.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.username}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        {/* MENSAGEM DE ERRO */}
        {error && (
          <div className="bg-red-100 border border-red-500 text-red-700 p-3 rounded-md relative">
            {error}
            <button
              onClick={() => setError(null)}
              type="button"
              className="absolute right-2 top-1 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* AÇÕES */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}

export default CriarEntregaForm;
