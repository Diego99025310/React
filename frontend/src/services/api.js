import { readSession, clearSession } from './session.js';

const API_BASE = '';

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (error) {
    return { message: text };
  }
};

export const apiFetch = async (endpoint, { method = 'GET', body, headers = {}, auth = true } = {}) => {
  const requestHeaders = { 'Content-Type': 'application/json', ...headers };

  if (auth) {
    const { token } = readSession();
    if (!token) {
      const error = new Error('Sessao expirada. Faca login novamente.');
      error.status = 401;
      throw error;
    }
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
    });
  } catch (networkError) {
    const error = new Error('Nao foi possivel conectar ao servidor.');
    error.cause = networkError;
    throw error;
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    const error = new Error(data?.error || data?.message || 'Erro inesperado.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
