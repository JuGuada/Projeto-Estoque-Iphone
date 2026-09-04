import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api.js';

export const permissaoPorRota = {
  '/dashboard': 1, '/estoque': 2, '/editar': 2, '/produtos': 3,
  '/movimentacoes': 4, '/cadastro': 5, '/usuario': 6, '/configuracoes': 7,
};

export function usePermissoes(usuario) {
  const [permissoes, setPermissoes] = useState(usuario?.tipo === 'admin' ? [1,2,3,4,5,6,7] : null);
  useEffect(() => {
    if (!usuario || usuario.tipo === 'usuario') return;
    if (usuario.tipo === 'admin') return setPermissoes([1,2,3,4,5,6,7]);
    apiRequest('/permissoes').then((dados) => setPermissoes(dados[String(usuario.tipo).toLowerCase()] || [])).catch(() => setPermissoes([]));
  }, [usuario]);
  return permissoes;
}

export function idPermissaoDaRota(pathname) {
  const entrada = Object.entries(permissaoPorRota).find(([rota]) => pathname === rota || pathname.startsWith(`${rota}/`));
  return entrada?.[1] || 1;
}

