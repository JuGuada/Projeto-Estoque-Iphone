import { useNavigate, useLocation } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../contexts/authContext.jsx';
import { permissaoPorRota, usePermissoes } from '../../hooks/usePermissoes.js';

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const permissoes = usePermissoes(usuario);

  const menuItems = [
    { name: 'Visão Geral', path: '/dashboard', icon: '/imagens/visao.png', activeIcon: '/imagens/visao-branco.png' },
    { name: 'Personalização de vitrine', path: '/produtos', icon: '/imagens/produto.png', activeIcon: '/imagens/produto-branco.png' },
    { name: 'Estoque', path: '/estoque', icon: '/imagens/estoque.png', activeIcon: '/imagens/estoque-branco.png' },
    { name: 'Movimentações', path: '/movimentacoes', icon: '/imagens/movimentacoes.png', activeIcon: '/imagens/movimentacoes-branco.png' },
    { name: 'Cadastro', path: '/cadastro', icon: '/imagens/cadastro.png', activeIcon: '/imagens/cadastro-branco.png' },
    { name: 'Configurações', path: '/configuracoes', icon: '/imagens/configuracao.png', activeIcon: '/imagens/configuracao-branca.png' },
    { name: 'Usuário', path: '/usuario', icon: '/imagens/usuario.png', activeIcon: '/imagens/usuario-branco.png' },
  ];
  
  return (  
    <aside className={styles.sidebar}>
      <span className={styles.sectionTitle}>MENU PRINCIPAL</span>

      <nav className={styles.navContainer}>
        {menuItems.filter((item) => permissoes?.includes(permissaoPorRota[item.path] || 1)).map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.name}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => navigate(item.path)} // 👈 Navega ao clicar!
              type="button"
            >
              <img
                src={isActive ? item.activeIcon : item.icon}
                alt={item.name}
                className={styles.navIcon}
              />
              <span className={styles.navLabel}>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
