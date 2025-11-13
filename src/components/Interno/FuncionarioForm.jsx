// src/components/FuncionarioForm.jsx
import React, { useState, useEffect } from 'react';
import djangoApi from '../../api/djangoApi';

function FuncionarioForm({ onSave, onCancel, existingFuncionario = null }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    user_type: 'funcionario', // Default para novo funcionário
    loja: '', // ID da loja
  });
  const [lojas, setLojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const response = await djangoApi.get('/lojas/');
        setLojas(response.data);
      } catch (err) {
        console.error('Erro ao carregar lojas:', err.response?.data || err);
        setError('Erro ao carregar lista de lojas.');
      }
    };

    const initForm = () => {
      if (existingFuncionario) {
        setFormData({
          username: existingFuncionario.username || '',
          email: existingFuncionario.email || '',
          user_type: existingFuncionario.user_type || 'funcionario',
          loja: existingFuncionario.loja?.id || existingFuncionario.loja || '', // <- garante ID
          password: '',
        });
      }
    };

    Promise.all([fetchLojas()]).then(() => {
      initForm();
      setLoading(false);
    });
  }, [existingFuncionario]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.username ||
      !formData.user_type ||
      !formData.loja ||
      (!existingFuncionario && !formData.password)
    ) {
      setError(
        'Por favor, preencha todos os campos obrigatórios (Nome de usuário, Tipo de acesso, Loja, e Senha para novos usuários).',
      );
      return;
    }

    try {
      let response;
      if (existingFuncionario) {
        const dataToSubmit = { ...formData };
        if (!dataToSubmit.password) {
          delete dataToSubmit.password;
        }
        response = await djangoApi.put(
          `/users/${existingFuncionario.id}/`,
          dataToSubmit,
        );
      } else {
        response = await djangoApi.post('/users/', formData);
      }
      onSave(response.data);
    } catch (err) {
      console.error('Erro ao salvar funcionário:', err.response?.data || err);
      const serverErrors = err.response?.data;
      let errorMessage =
        'Erro ao salvar funcionário. Verifique os campos e tente novamente.';
      if (serverErrors) {
        if (serverErrors.detail) {
          errorMessage = `Erro: ${serverErrors.detail}`;
        } else if (serverErrors.non_field_errors) {
          errorMessage = `Erro: ${serverErrors.non_field_errors.join(', ')}`;
        } else {
          errorMessage = Object.keys(serverErrors)
            .map((field) => {
              const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
              return `${fieldName}: ${
                Array.isArray(serverErrors[field])
                  ? serverErrors[field].join(', ')
                  : serverErrors[field]
              }`;
            })
            .join('; ');
        }
      }
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-600 font-semibold text-lg">
        Carregando formulário...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md font-sans">
      <h3 className="text-2xl font-bold mb-6 text-[#d20000]">
        {existingFuncionario
          ? 'Editar Funcionário'
          : 'Cadastrar Novo Funcionário'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="border border-gray-300 rounded-md p-6">
          <legend className="px-2 text-[#d20000] font-semibold text-lg">
            Dados do Funcionário
          </legend>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="text-gray-700 font-medium">
                Nome de usuário<span className="text-red-600">*</span>:
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#d20000] focus:ring focus:ring-[#d20000]/50"
                placeholder="Digite o nome de usuário"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">Email:</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#d20000] focus:ring focus:ring-[#d20000]/50"
                placeholder="Digite o email (opcional)"
              />
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">
                Senha
                {!existingFuncionario && (
                  <span className="text-red-600">*</span>
                )}
                :
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!existingFuncionario}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#d20000] focus:ring focus:ring-[#d20000]/50"
                placeholder={
                  existingFuncionario
                    ? 'Deixe em branco para manter a senha atual'
                    : 'Digite a senha'
                }
                autoComplete={
                  existingFuncionario ? 'new-password' : 'current-password'
                }
              />
              {existingFuncionario && (
                <small className="text-gray-500 block mt-1">
                  Deixe em branco para não alterar a senha.
                </small>
              )}
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">
                Tipo de acesso<span className="text-red-600">*</span>:
              </span>
              <select
                name="user_type"
                value={formData.user_type}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-[#d20000] focus:ring focus:ring-[#d20000]/50"
              >
                <option value="funcionario">Funcionário</option>
                <option value="admin">Administrador</option>
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700 font-medium">
                Loja<span className="text-red-600">*</span>:
              </span>
              <select
                name="loja"
                value={formData.loja}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm bg-white focus:border-[#d20000] focus:ring focus:ring-[#d20000]/50"
              >
                <option value="">Selecione uma Loja</option>
                {lojas.map((loja) => (
                  <option key={loja.id} value={loja.id}>
                    {loja.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        {error && (
          <div className="relative rounded-md border border-red-500 bg-red-100 p-4 text-red-700">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="absolute top-2 right-2 text-red-700 font-bold hover:text-red-900"
              aria-label="Fechar mensagem de erro"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-6 py-2 rounded-md bg-[#28a745] text-white font-semibold hover:bg-green-600 transition"
          >
            Salvar Funcionário
          </button>
        </div>
      </form>
    </div>
  );
}

export default FuncionarioForm;
