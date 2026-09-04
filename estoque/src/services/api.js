export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3333').replace(/\/$/, '');

export function resolverUrlArquivo(caminho) {
  if (!caminho) return '';
  if (caminho.startsWith('/imagens/')) return caminho;
  return caminho.startsWith('/') ? `${API_URL}${caminho}` : caminho;
}

export async function apiRequest(caminho, opcoes = {}) {
  const token = localStorage.getItem('token');
  const headers = new Headers(opcoes.headers || {});

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (opcoes.body && !(opcoes.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se a API está ativa.');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw new Error(data?.erro || data?.mensagem || `Erro ${response.status}.`);
  return data;
}
