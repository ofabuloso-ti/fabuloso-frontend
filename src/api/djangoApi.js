// src/api/djangoApi.js
import axios from 'axios';

// 🔹 API local (somente dev)
const DEV_API = 'http://192.168.15.7:8000/api';

// 🔹 Base da API configurada no .env
const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/$/, '') || DEV_API;

console.log('🔗 Usando API:', API_BASE);

const djangoApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // obrigatório para enviar cookies (sessionid)
});

// 🔹 NÃO precisamos mais de CSRF
// pois removemos CSRF do Django via @csrf_exempt

// ================================
// API de ENTREGAS
// ================================

export const listarEntregas = () => {
  return api.get('/entregas/');
};

export const criarEntrega = (data) => {
  return api.post('/entregas/', data);
};

export const iniciarEntrega = (id) => {
  return api.post(`/entregas/${id}/iniciar/`);
};

export const concluirEntrega = (id) => {
  return api.post(`/entregas/${id}/concluir/`);
};

export default djangoApi;
