// src/hooks/useAuth.js
import { useState } from 'react';
import djangoApi from '../api/djangoApi';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // --- LOGIN ---
  const login = async (username, password) => {
    try {
      // 🔥 Removido ensureCsrf()

      // faz login -> backend cria o sessionid
      await djangoApi.post('/auth/login/', { username, password });

      // busca usuário autenticado usando o sessionid
      const userResp = await djangoApi.get('/auth/current_user/');
      setUser(userResp.data);

      setError(null);
      console.log('Login realizado com sucesso!');
      return userResp.data;
    } catch (err) {
      console.error('Erro no login:', err.response?.data || err.message);
      setError('Usuário ou senha inválidos');
      throw err;
    }
  };

  // --- LOGOUT ---
  const logout = async () => {
    try {
      await djangoApi.post('/auth/logout/');
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Erro no logout:', err);
    }
  };

  // --- PEGAR USUÁRIO ATUAL ---
  const fetchCurrentUser = async () => {
    try {
      const response = await djangoApi.get('/auth/current_user/');
      setUser(response.data);
      return response.data;
    } catch {
      setUser(null);
    }
  };

  return { user, error, login, logout, fetchCurrentUser };
};
