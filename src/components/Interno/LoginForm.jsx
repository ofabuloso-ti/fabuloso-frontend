// src/components/LoginForm.jsx
import React, { useState } from 'react';

const LoginForm = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onLogin(username, password);
    } finally {
      setLoading(false);
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

      <label className="block text-gray-700 font-semibold mb-2">Usuário</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        className="w-full px-4 py-2 mb-4 border rounded"
      />

      <label className="block text-gray-700 font-semibold mb-2">Senha</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-4 py-2 mb-4 border rounded"
      />

      {error && (
        <p className="text-red-600 text-sm mb-4 text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#d20000] text-white py-3 rounded"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
};

export default LoginForm;
