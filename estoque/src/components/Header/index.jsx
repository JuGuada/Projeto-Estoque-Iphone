import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';
import { useAuth } from '../../contexts/authContext.jsx';
import { apiRequest, resolverUrlArquivo } from '../../services/api.js';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);
  const [busca, setBusca] = useState('');
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  function handleAvatarClick() {
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/login');
  }

  const avatarSrc = usuario && usuario.foto ? usuario.foto : '/imagens/usuario-branco.png';
  const chaveLidas = `notificacoes-lidas-${usuario?.id || usuario?.email || 'admin'}`;
  const [lidas, setLidas] = useState(() => { try { return JSON.parse(localStorage.getItem(chaveLidas) || '[]'); } catch { return []; } });

  useEffect(() => {
    apiRequest('/notificacoes/feed').then((dados) => setNotificacoes(Array.isArray(dados) ? dados : [])).catch(() => setNotificacoes([]));
  }, []);
  useEffect(() => {
    apiRequest('/itens').then((dados) => setProdutos(Array.isArray(dados) ? dados : [])).catch(() => setProdutos([]));
  }, []);
  const naoLidas = notificacoes.filter((item) => !lidas.includes(item.id)).length;
  const termoBusca = busca.trim().toLowerCase();
  const resultadosBusca = termoBusca
    ? produtos.filter((produto) => `${produto.nome || ''} ${produto.categoria || ''} ${produto.modelo || ''} ${produto.sku || ''}`.toLowerCase().includes(termoBusca)).slice(0, 6)
    : [];

  function abrirNotificacoes() {
    setNotificacoesAbertas((atual) => !atual);
    const ids = notificacoes.map((item) => item.id);
    setLidas(ids);
    localStorage.setItem(chaveLidas, JSON.stringify(ids));
  }

  function buscarProdutos(event) {
    event.preventDefault();
    if (resultadosBusca.length === 1) abrirProduto(resultadosBusca[0]);
  }

  function abrirProduto(produto) {
    const categoria = String(produto.categoria || '').trim().toLowerCase();
    setBusca('');

    if (produto.id && ['iphone', 'airpods', 'ipad', 'mac'].includes(categoria)) {
      navigate(`/produto/${categoria}/${produto.id}`);
      return;
    }

    navigate('/produtos');
  }

  return (
    <>
      <header className={styles.topHeader}>
        <div className={styles.headerBrand}>
          <img
            src="/imagens/logo.png"
            alt="Logo"
            className={styles.brandLogo}
          />

          <span className={styles.brandTitle}>Estoque</span>
          <span className={styles.brandSubtitle}>GestÃ£o de InventÃ¡rio</span>
        </div>

        <form className={styles.headerSearch} onSubmit={buscarProdutos}>
          <button type="submit" className={styles.searchSubmit} aria-label="Buscar produtos">
            <img
              src="/imagens/pesquisa.png"
              alt=""
              className={styles.searchIcon}
            />
          </button>

          <input
            type="text"
            placeholder="Buscar produtos..."
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
          />
          {termoBusca && (
            <div className={styles.searchResults} role="listbox" aria-label="Resultados da busca">
              {resultadosBusca.length ? resultadosBusca.map((produto) => (
                <button type="button" key={produto.id} className={styles.searchResult} onClick={() => abrirProduto(produto)}>
                  <img src={resolverUrlArquivo(produto.imagem) || '/imagens/produto.png'} alt="" />
                  <span>
                    <strong>{produto.nome}</strong>
                    <small>{produto.categoria || 'Produto'}{produto.modelo ? ` Â· ${produto.modelo}` : ''}</small>
                  </span>
                </button>
              )) : <p className={styles.searchEmpty}>Nenhum produto encontrado.</p>}
            </div>
          )}
        </form>

        <div className={styles.headerActions}>
          <button type="button" className={styles.notificationBadge} onClick={abrirNotificacoes} aria-label="Abrir notificaÃ§Ãµes">
            <img
              src="/imagens/notificacao.png"
              alt="NotificaÃ§Ãµes"
            />
            {naoLidas > 0 && <span className={styles.notificationCount}>{Math.min(naoLidas, 9)}</span>}
          </button>

          <button type="button" className={styles.userAvatar} onClick={handleAvatarClick} aria-label="Abrir menu do usuÃ¡rio">
            <img
              src={avatarSrc}
              alt="UsuÃ¡rio"
            />
          </button>
        </div>
      </header>
      {notificacoesAbertas && <div className={styles.notificationsPanel}>
        <div className={styles.notificationsHeader}><div><strong>NotificaÃ§Ãµes</strong><span>AtualizaÃ§Ãµes importantes da loja</span></div><button type="button" onClick={() => setNotificacoesAbertas(false)}>Ã—</button></div>
        <div className={styles.notificationsList}>{notificacoes.length ? notificacoes.map((item) => <button type="button" key={item.id} className={styles.notificationItem} onClick={() => { setNotificacoesAbertas(false); navigate(item.destino); }}><img src={item.imagem ? resolverUrlArquivo(item.imagem) : '/imagens/notificacao.png'} alt="" /><span><strong>{item.titulo}</strong><small>{item.mensagem}</small><time>{new Date(item.criadoEm).toLocaleString('pt-BR')}</time></span></button>) : <p className={styles.notificationsEmpty}>Nenhuma notificaÃ§Ã£o importante no momento.</p>}</div>
      </div>}

      {open && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalUser}>
              <span>Conta conectada</span>
              <strong>{usuario?.email || 'E-mail nÃ£o disponÃ­vel'}</strong>
            </div>
            <p className={styles.modalText}>Deseja desconectar?</p>
            <div className={styles.modalButtons}>
              <button className={styles.cancelBtn} onClick={handleClose}>Cancelar</button>
              <button className={styles.logoutBtn} onClick={handleLogout}>Desconectar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

