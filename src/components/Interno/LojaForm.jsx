// src/components/LojaForm.jsx
import React, { useState, useEffect } from 'react';
import djangoApi from '../../api/djangoApi';

function LojaForm({ onSave, onCancel, existingLoja = null }) {
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingLoja) {
      setFormData({
        nome: existingLoja.nome,
        endereco: existingLoja.endereco || '',
      });
    }
  }, [existingLoja]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      let response;

      if (existingLoja) {
        // EDITAR LOJA
        response = await djangoApi.put(`/lojas/${existingLoja.id}/`, formData);
      } else {
        // CRIAR NOVA LOJA
        response = await djangoApi.post('/lojas/', formData);
      }

      if (onSave) onSave(response.data);
    } catch (err) {
      console.error('Erro ao salvar loja:', err);
      setError(
        'Não foi possível salvar a loja. Verifique os dados e tente novamente.',
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-[#d20000] mb-6">
        {existingLoja ? 'Editar Loja' : 'Cadastrar Nova Loja'}
      </h3>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded relative">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 font-bold"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Loja *
          </label>
          <input
            name="nome"
            type="text"
            value={formData.nome}
            onChange={handleInputChange}
            required
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço Completo
          </label>
          <textarea
            name="endereco"
            rows={4}
            value={formData.endereco}
            onChange={handleInputChange}
            className="w-full border rounded-md px-3 py-2"
          ></textarea>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-[#d20000] hover:bg-[#b00000] text-white px-6 py-2 rounded-md"
          >
            Salvar Loja
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 px-6 py-2 rounded-md"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default LojaForm;
