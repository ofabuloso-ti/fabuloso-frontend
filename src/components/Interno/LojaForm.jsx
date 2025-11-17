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
    try {
      const userData = await login(username, password);

      console.log('Login OK:', userData);

      if (userData.user_type === 'admin') {
        navigate('/interno'); // painel do admin
      } else {
        navigate('/funcionario'); // painel do funcionário
      }
    } catch (err) {
      console.error('Falha no login');
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
            className="absolute top-2 right-2 text-red-700 font-bold hover:text-red-900"
            aria-label="Fechar mensagem de erro"
          >
            ×
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="nome"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nome da Loja <span className="text-red-500">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            value={formData.nome}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
            placeholder="Digite o nome da loja"
          />
        </div>
        <div>
          <label
            htmlFor="endereco"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Endereço Completo
          </label>
          <textarea
            id="endereco"
            name="endereco"
            rows={4}
            value={formData.endereco}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#d20000] focus:border-[#d20000]"
            placeholder="Digite o endereço completo"
          ></textarea>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-[#d20000] hover:bg-[#c70d0d] text-white px-6 py-2 rounded-md transition"
          >
            Salvar Loja
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default LojaForm;
