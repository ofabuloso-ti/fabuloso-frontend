// src/api/djangoApi.js
import axios from 'axios';

// 🔧 API BASE (SEM /api)
const DEV_API = 'http://192.168.15.7:8000';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') || DEV_API;

console.log('🔗 Usando API:', API_BASE);

const djangoApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 🔴 OBRIGATÓRIO para sessão Django
});

// ================================
// API de ENTREGAS
// ================================
export const listarEntregas = () => {
  return djangoApi.get('/api/entregas/');
};

export const criarEntrega = (data) => {
  return djangoApi.post('/api/entregas/', data);
};

export const iniciarEntrega = (id) => {
  return djangoApi.post(`/api/entregas/${id}/iniciar/`);
};

export const concluirEntrega = (id) => {
  return djangoApi.post(`/api/entregas/${id}/concluir/`);
};

export default djangoApi;
