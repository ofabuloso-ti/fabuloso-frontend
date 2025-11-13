// src/api/djangoApi.js
import axios from 'axios';

// 🔹 IP fixo da tua rede (não usa localhost, senão perde o cookie)
const DEV_API = 'http://192.168.15.7:8000/api';
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEV_API;

const djangoApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // garante que cookies sejam enviados/recebidos
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

// 🔹 Anexa automaticamente o CSRFToken se existir no cookie
djangoApi.interceptors.request.use((config) => {
  const csrfToken = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrftoken='))
    ?.split('=')[1];
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// 🔹 Garante que o cookie CSRF seja emitido pelo backend
export const ensureCsrf = async () => {
  if (document.cookie.includes('csrftoken=')) return;
  try {
    await djangoApi.get('/auth/current_user/'); // só para setar cookie
  } catch {
    // ignora erro, o objetivo é só forçar o Django a mandar csrftoken
  }
};

export default djangoApi;
