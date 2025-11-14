// src/api/djangoApi.js
import axios from 'axios';

// 🔹 API local usada somente em desenvolvimento
const DEV_API = 'http://192.168.15.7:8000/api';

// 🔹 Base da API vinda do Vercel (.env)
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || DEV_API;

console.log('🔗 Usando API:', API_BASE);

const djangoApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

// 🔹 Adiciona automaticamente o CSRF do cookie
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

// 🔹 Garante que o Django envie o cookie CSRF
export const ensureCsrf = async () => {
  if (document.cookie.includes('csrftoken=')) return;
  try {
    await djangoApi.get('/auth/current_user/');
  } catch {
    // não precisa tratar erro
  }
};

export default djangoApi;
