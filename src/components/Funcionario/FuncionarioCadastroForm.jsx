// src/components/Funcionario/FuncionarioCadastroForm.jsx
import React, { useState } from 'react';
import djangoApi from '../../api/djangoApi';

function FuncionarioCadastroForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    user_type: 'atendente', // padrão
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // Handle inputs
  // ---------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------
  // Submit
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.username || !formData.password) {
      setError('Preencha usuário e senha.');
      return;
    }

    setLoading(true);

    try {
      // BACKEND vai usar a loja do usuário logado automaticamente
      const { data } = await djangoApi.post(
        '/users/criar_usuario_loja/',
        formData,
      );

      onSave(data);
    } catch (err) {
      console.error('Erro ao criar usuário:', err.response?.data || err);
      const serverError = err.response?.data;

      if (serverError?.erro) {
        setError(serverError.erro);
      } else if (serverError?.error) {
        setError(serverError.error);
      } else {
        setError('Erro ao salvar. Verifique os dados.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#d20000] mb-6">
        Cadastrar Funcionário
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-600 text-red-800 px-4 py-3 mb-4 rounded relative">
          {error}
          <button
            className="absolute top-2 right-3 font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Username */}
        <div>
          <label className="text-gray-700 font-medium">Nome de Usuário *</label>
          <input
            type="text"
            name="username"
            className="w-full mt-1 border rounded-md px-3 py-2 focus:border-[#d20000]"
            placeholder="Digite o nome de usuário"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-gray-700 font-medium">Email (opcional)</label>
          <input
            type="email"
            name="email"
            className="w-full mt-1 border rounded-md px-3 py-2 focus:border-[#d20000]"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Senha */}
        <div>
          <label className="text-gray-700 font-medium">Senha *</label>
          <input
            type="password"
            name="password"
            className="w-full mt-1 border rounded-md px-3 py-2 focus:border-[#d20000]"
            placeholder="Digite a senha"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Tipo de funcionário */}
        <div>
          <label className="text-gray-700 font-medium">
            Tipo de Funcionário *
          </label>
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className="w-full mt-1 border rounded-md px-3 py-2 bg-white focus:border-[#d20000]"
          >
            <option value="atendente">Atendente</option>
            <option value="motoboy">Motoboy</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#28a745] text-white rounded-md hover:bg-green-600 transition"
          >
            {loading ? 'Salvando...' : 'Salvar Funcionário'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FuncionarioCadastroForm;
