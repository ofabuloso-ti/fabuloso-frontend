// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // login retorna o usuário logado!
      const usuario = await login(username, password);

      console.log('Usuário logado:', usuario);

      // REDIRECIONAMENTO POR TIPO DE USUÁRIO
      if (!usuario?.user_type) {
        console.warn('Usuário sem user_type, enviando para /interno');
        return navigate('/interno');
      }

      switch (usuario.user_type) {
        case 'admin':
          navigate('/admin');
          break;

        case 'motoboy':
          navigate('/motoboy');
          break;

        case 'funcionario':
        case 'atendente':
          navigate('/interno');
          break;

        default:
          navigate('/interno');
      }
    } catch (err) {
      console.error('Falha no login', err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center text-[#d20000] mb-6">
        Acesso
      </h2>

      <label
        htmlFor="username"
        className="block text-gray-700 font-semibold mb-2"
      >
        Usuário
      </label>
      <input
        id="username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        placeholder="Digite seu usuário"
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded"
      />

      <label
        htmlFor="password"
        className="block text-gray-700 font-semibold mb-2"
      >
        Senha
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Digite sua senha"
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded"
      />

      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-[#d20000] text-white py-3 rounded hover:bg-[#c70d0d] transition"
      >
        Entrar
      </button>
    </form>
  );
};

export default LoginForm;
