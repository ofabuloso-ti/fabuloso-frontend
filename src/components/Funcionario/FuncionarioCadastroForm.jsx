// src/components/Funcionario/FuncionarioCadastroForm.jsx
import React, { useState, useEffect } from 'react';
import djangoApi from '../../api/djangoApi';

function FuncionarioCadastroForm({ onSave, onCancel, funcionario }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    user_type: 'atendente',
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===============================
  // PREENCHE AUTOMATICAMENTE AO EDITAR
  // ===============================
  useEffect(() => {
    if (funcionario) {
      setFormData({
        username: funcionario.username,
        email: funcionario.email || '',
        password: '',
        user_type: funcionario.user_type,
      });
    }
  }, [funcionario]);

  // ===============================
  // HANDLES
  // ===============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🚫 FUNCIONÁRIO NÃO PODE VIRAR ATENDENTE/MOTOBOY
    if (funcionario?.user_type === 'funcionario' && name === 'user_type') {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.username) {
      setError('Preencha o nome de usuário.');
      return;
    }

    if (!funcionario && !formData.password) {
      setError('Senha obrigatória para novo funcionário.');
      return;
    }

    setLoading(true);

    try {
      let resposta;

      if (funcionario) {
        // EDITAR
        resposta = await djangoApi.patch(`/users/${funcionario.id}/`, {
          username: formData.username,
          email: formData.email,
          user_type:
            funcionario.user_type === 'funcionario'
              ? 'funcionario' // 🔒 mantém funcionário fixo
              : formData.user_type,
        });
      } else {
        // CRIAR (APENAS ATENDENTE OU MOTOBOY)
        resposta = await djangoApi.post('/users/criar_usuario_loja/', {
          ...formData,
          user_type:
            formData.user_type === 'funcionario'
              ? 'atendente' // 🔒 segurança extra
              : formData.user_type,
        });
      }

      onSave(resposta.data);
    } catch (err) {
      console.error('Erro ao salvar funcionário:', err.response?.data || err);
      const serverError = err.response?.data;

      if (serverError?.erro) setError(serverError.erro);
      else if (serverError?.error) setError(serverError.error);
      else setError('Erro ao salvar. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#d20000] mb-6">
        {funcionario ? 'Editar Funcionário' : 'Cadastrar Funcionário'}
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
            className="w-full mt-1 border rounded-md px-3 py-2"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-gray-700 font-medium">Email</label>
          <input
            type="email"
            name="email"
            className="w-full mt-1 border rounded-md px-3 py-2"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Senha — só ao criar */}
        {!funcionario && (
          <div>
            <label className="text-gray-700 font-medium">Senha *</label>
            <input
              type="password"
              name="password"
              className="w-full mt-1 border rounded-md px-3 py-2"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
        )}

        {/* Tipo */}
        <div>
          <label className="text-gray-700 font-medium">Cargo *</label>
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            disabled={funcionario?.user_type === 'funcionario'} // 🔒 funcionário não troca cargo
            className={`w-full mt-1 border rounded-md px-3 py-2 bg-white ${
              funcionario?.user_type === 'funcionario' ? 'bg-gray-200' : ''
            }`}
          >
            <option value="atendente">Atendente</option>
            <option value="motoboy">Motoboy</option>
          </select>

          {funcionario?.user_type === 'funcionario' && (
            <p className="text-sm text-gray-500 mt-1">
              O cargo "funcionário" não pode ser alterado.
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 rounded-md"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#28a745] text-white rounded-md"
          >
            {loading ? 'Salvando...' : funcionario ? 'Salvar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FuncionarioCadastroForm;
