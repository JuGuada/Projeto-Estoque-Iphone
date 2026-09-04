import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from '../styles/Estoque.module.css';
import AdminLayout from '../components/AdminLayout';
import { apiRequest, resolverUrlArquivo } from '../services/api.js';
import { useAuth } from '../contexts/authContext.jsx';


export default function Estoque({
  produtos: produtosExternos,
  loading: loadingExterno,
  estoqueFilter: filtroExterno,
  setEstoqueFilter: setFiltroExterno
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario } = useAuth();
  const [ordenacao, setOrdenacao] = useState('maisVendidos');
  const [produtosApi, setProdutosApi] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [filtroLocal, setFiltroLocal] = useState('');
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState('');
  const [excluindoId, setExcluindoId] = useState(null);
  const [mensagemAcao, setMensagemAcao] = useState('');
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);
  const produtos = produtosExternos ?? produtosApi;
  const loading = loadingExterno ?? carregando;
  const estoqueFilter = filtroExterno ?? filtroLocal;
  const setEstoqueFilter = setFiltroExterno ?? setFiltroLocal;

  function abrirEdicao(produto) {
    setProdutoEditando(produto);
    setDadosEdicao({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco: produto.preco ?? '',
      quantidade: produto.quantidade ?? 0,
      precoCusto: produto.preco_custo ?? '',
      modelo: produto.modelo || '',
      cor: produto.cor || '',
      armazenamento: produto.armazenamento || '',
      memoriaRam: produto.memoria_ram || '',
      sku: produto.sku || '',
      categoria: produto.categoria || '',
      status: produto.status || 'DisponÃ­vel',
      descontoPercentual: produto.desconto_percentual ?? 0
    });
    setErroEdicao('');
  }

  function fecharEdicao() {
    if (salvandoEdicao) return;
    setProdutoEditando(null);
    setDadosEdicao(null);
    setErroEdicao('');
  }

  function alterarEdicao(campo) {
    return (event) => {
      setDadosEdicao((atual) => ({ ...atual, [campo]: event.target.value }));
    };
  }

  async function salvarEdicao(event) {
    event.preventDefault();
    setSalvandoEdicao(true);
    setErroEdicao('');

    try {
      const formData = new FormData();
      Object.entries(dadosEdicao).forEach(([campo, valor]) => {
        formData.append(campo, valor ?? '');
      });
      formData.append('autor', usuario?.email || usuario?.nome || 'Administrador');

      const itemAtualizado = await apiRequest(`/itens/${produtoEditando.id}`, {
        method: 'PUT',
        body: formData
      });

      setProdutosApi((atuais) =>
        atuais.map((item) =>
          Number(item.id) === Number(itemAtualizado.id) ? itemAtualizado : item
        )
      );
      setProdutoEditando(null);
      setDadosEdicao(null);
    } catch (error) {
      setErroEdicao(error.message);
    } finally {
      setSalvandoEdicao(false);
    }
  }

  async function excluirProduto(produto) {
    setExcluindoId(produto.id);
    setMensagemAcao('');
    setErro('');

    try {
      await apiRequest(`/itens/${produto.id}`, { method: 'DELETE', body: JSON.stringify({ responsavel: usuario?.email || usuario?.nome || 'Administrador' }) });
      setProdutosApi((atuais) =>
        atuais.filter((item) => Number(item.id) !== Number(produto.id))
      );

      const produtosLocais = JSON.parse(
        localStorage.getItem('produtos-personalizados') || '[]'
      ).filter((item) => Number(item.id) !== Number(produto.id));
      localStorage.setItem('produtos-personalizados', JSON.stringify(produtosLocais));
      setMensagemAcao(`Produto ${produto.nome} excluÃ­do com sucesso.`);
      setProdutoParaExcluir(null);
    } catch (error) {
      setErro(error.message);
    } finally {
      setExcluindoId(null);
    }
  }

  useEffect(() => {
    if (!produtoEditando) return undefined;

    function fecharComEscape(event) {
      if (event.key === 'Escape') fecharEdicao();
    }

    document.addEventListener('keydown', fecharComEscape);
    return () => document.removeEventListener('keydown', fecharComEscape);
  }, [produtoEditando, salvandoEdicao]);

  useEffect(() => {
    if (produtosExternos) return;
    apiRequest('/itens')
      .then((dados) => setProdutosApi(Array.isArray(dados) ? dados : []))
      .catch((error) => setErro(error.message))
      .finally(() => setCarregando(false));
  }, [produtosExternos]);

  useEffect(() => {
    setEstoqueFilter(searchParams.get('busca') || '');
  }, [searchParams, setEstoqueFilter]);

  const produtosExibidos = useMemo(() => {
    return [...produtos].sort((primeiro, segundo) => {
      if (ordenacao === 'menosEstoque') {
        return Number(primeiro.quantidade || 0) - Number(segundo.quantidade || 0);
      }

      if (ordenacao === 'maiorEstoque') {
        return Number(segundo.quantidade || 0) - Number(primeiro.quantidade || 0);
      }

      if (ordenacao === 'nome') {
        return (primeiro.nome || '').localeCompare(segundo.nome || '', 'pt-BR');
      }

      return Number(segundo.vendas || 0) - Number(primeiro.vendas || 0);
    });
  }, [produtos, ordenacao]);

  const filteredEstoque = useMemo(() => {
    if (!estoqueFilter) {
      return produtosExibidos;
    }

    const query = estoqueFilter.toLowerCase().trim();

    return produtosExibidos.filter((produto) =>
      `${produto.nome || ''} ${produto.categoria || ''} ${
        produto.descricao || ''
      } ${produto.sku || ''}`
        .toLowerCase()
        .includes(query)
    );
  }, [produtosExibidos, estoqueFilter]);

  const estoqueTotal = produtos.reduce(
    (total, produto) =>
      total + Number(produto.quantidade || 0),
    0
  );

  const valorTotal = produtos.reduce(
    (total, produto) =>
      total +
      Number(produto.preco || 0) *
        Number(produto.quantidade || 0),
    0
  );

  const vendasTotal = produtos.reduce(
    (total, produto) =>
      total + Number(produto.vendas || 0),
    0
  );

  const formatarPreco = (valor) => {
    return Number(valor || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getStatus = (produto) => {
    const quantidade = Number(produto.quantidade || 0);
    const minimo = Number(produto.estoque_minimo || 5);

    if (quantidade === 0) {
      return {
        texto: 'Sem estoque',
        classe: styles.semEstoque
      };
    }

    if (quantidade <= minimo) {
      return {
        texto: 'Baixo estoque',
        classe: styles.baixoEstoque
      };
    }

    return {
      texto: 'Em estoque',
      classe: styles.emEstoque
    };
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>InventÃ¡rio</h1>

          <p>
            Controle de estoque em tempo real
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l5 5" />
              </svg>
            </span>

            <input
              type="text"
              placeholder="Buscar produto..."
              value={estoqueFilter || ''}
              onChange={(event) =>
                setEstoqueFilter(event.target.value)
              }
            />
          </div>

          <button
            type="button"
            className={styles.newProductButton}
            onClick={() => navigate('/cadastro')}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>

            Novo produto
          </button>
        </div>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div
            className={`${styles.statIcon} ${styles.purple}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            >
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
              <path d="M4 7.5L12 12l8-4.5" />
              <path d="M12 12v9" />
            </svg>
          </div>

          <div className={styles.statInfo}>
            <span>PRODUTOS CADASTRADOS</span>
            <strong>{produtos.length}</strong>
            <small>produtos</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={`${styles.statIcon} ${styles.blue}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            >
              <path d="M12 3l8 4.5-8 4.5-8-4.5L12 3z" />
              <path d="M4 12l8 4.5 8-4.5" />
              <path d="M4 16.5l8 4.5 8-4.5" />
            </svg>
          </div>

          <div className={styles.statInfo}>
            <span>ESTOQUE TOTAL</span>
            <strong>{estoqueTotal}</strong>
            <small>unidades</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={`${styles.statIcon} ${styles.green}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="8.5" />
              <path d="M14.5 8.5h-3a1.8 1.8 0 0 0 0 3.6h1a1.8 1.8 0 0 1 0 3.6H9.5" />
              <path d="M12 6.8v10.4" />
            </svg>
          </div>

          <div className={styles.statInfo}>
            <span>VALOR TOTAL</span>
            <strong>{formatarPreco(valorTotal)}</strong>
            <small>custo total</small>
          </div>
        </div>

        <div className={styles.statCard}>
          <div
            className={`${styles.statIcon} ${styles.orange}`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h7.8a1.5 1.5 0 0 0 1.5-1.2L20 8H7" />
              <circle cx="10" cy="19" r="1.2" />
              <circle cx="17" cy="19" r="1.2" />
            </svg>
          </div>

          <div className={styles.statInfo}>
            <span>VENDAS (MÃŠS)</span>
            <strong>{vendasTotal}</strong>
            <small>unidades</small>
          </div>
        </div>
      </section>

      <div className={styles.stockHeader}>
        <h2>
          VisÃ£o rÃ¡pida do estoque
        </h2>

        <div className={styles.sortArea}>
          <span>
            Ordenar por:
          </span>

          <select value={ordenacao} onChange={(event) => setOrdenacao(event.target.value)}>
            <option value="maisVendidos">
              Mais vendidos
            </option>

            <option value="menosEstoque">
              Menor estoque
            </option>

            <option value="maiorEstoque">
              Maior estoque
            </option>

            <option value="nome">
              Nome
            </option>
          </select>
        </div>
      </div>

      <section className={styles.productGrid}>
        {mensagemAcao && <div className={styles.actionMessage} role="status">{mensagemAcao}</div>}
        {erro && <div className={styles.emptyState} role="alert">{erro}</div>}
        {loading ? (
          <div className={styles.emptyState}>
            Carregando produtos...
          </div>
        ) : filteredEstoque.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhum produto encontrado.
          </div>
        ) : (
          filteredEstoque.map((produto, index) => {
            const status = getStatus(produto);

            const quantidade =
              Number(produto.quantidade || 0);

            const minimo =
              Number(produto.estoque_minimo || 5);

            const capacidade =
              minimo * 4;

            const percentual =
              capacidade > 0
                ? Math.min(
                    (quantidade / capacidade) * 100,
                    100
                  )
                : 100;

            return (
              <article
                key={produto.id || index}
                className={styles.productCard}
              >
                <div className={styles.productTop}>
                  <div className={styles.imageContainer}>
                    <img
                      src={resolverUrlArquivo(produto.imagem) || '/imagens/produto.png'}
                      alt={produto.nome}
                      className={styles.productImage}
                    />
                  </div>

                  <div className={styles.productName}>
                    <h3>
                      {produto.nome}
                    </h3>

                    <p>
                      {produto.categoria || 'Produto'}
                      {' â€¢ '}
                      {produto.descricao || 'Sem descriÃ§Ã£o'}
                    </p>

                    <div className={styles.skuRow}>
                      <span>
                        SKU
                      </span>

                      <strong>
                        {produto.sku ||
                          `PROD-${produto.id}`}
                      </strong>
                    </div>
                  </div>

                  <span className={status.classe}>
                    {status.texto}
                  </span>
                </div>

                <hr className={styles.productDivider} />

                <div className={styles.productInfo}>
                  <div>
                    <span>
                      Vendas
                    </span>

                    <strong>
                      {Number(produto.vendas || 0)} un
                    </strong>
                  </div>

                  <div className={styles.stockInfo}>
                    <span>
                      Estoque
                    </span>

                    <strong>
                      {quantidade} / {capacidade}
                    </strong>

                    <div className={styles.stockBarContainer}>
                      <div
                        className={`
                          ${styles.stockBar}
                          ${
                            quantidade === 0
                              ? styles.stockRed
                              : quantidade <= minimo
                              ? styles.stockYellow
                              : styles.stockGreen
                          }
                        `}
                        style={{
                          width: `${percentual}%`
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <span>
                      PreÃ§o
                    </span>

                    <strong>
                      {formatarPreco(produto.preco)}
                    </strong>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => navigate(`/editar/${produto.id}`)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M4 20h4l11-11a2.8 2.8 0 0 0-4-4L4 16v4z" />
                      <path d="M13.5 6.5l4 4" />
                    </svg>
                    Editar
                  </button>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => setProdutoParaExcluir(produto)}
                    disabled={excluindoId === produto.id}
                  >
                    {excluindoId === produto.id ? (
                      'Excluindo...'
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M4 7h16" />
                          <path d="M9 7V4h6v3" />
                          <path d="M7 7l1 13h8l1-13" />
                          <path d="M10 11v5M14 11v5" />
                        </svg>
                        Excluir
                      </>
                    )}
                  </button>
                </div>

              </article>
            );
          })
        )}
      </section>

      {produtoEditando && dadosEdicao && (
        <div className={styles.modalOverlay} onMouseDown={fecharEdicao}>
          <form
            className={styles.modal}
            onSubmit={salvarEdicao}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-edicao-produto"
          >
            <div className={styles.modalHeader}>
              <div>
                <span>EDITAR PRODUTO</span>
                <h2 id="titulo-edicao-produto">{produtoEditando.nome}</h2>
              </div>
              <button type="button" onClick={fecharEdicao} aria-label="Fechar modal">Ã—</button>
            </div>

            <div className={styles.modalGrid}>
              <label className={styles.fieldWide}>Nome
                <input value={dadosEdicao.nome} onChange={alterarEdicao('nome')} required autoFocus />
              </label>
              <label>Modelo
                <input value={dadosEdicao.modelo} onChange={alterarEdicao('modelo')} />
              </label>
              <label>SKU
                <input value={dadosEdicao.sku} onChange={alterarEdicao('sku')} />
              </label>
              <label>Categoria
                <input value={dadosEdicao.categoria} onChange={alterarEdicao('categoria')} />
              </label>
              <label>Status
                <select value={dadosEdicao.status} onChange={alterarEdicao('status')}>
                  <option value="DisponÃ­vel">DisponÃ­vel</option>
                  <option value="IndisponÃ­vel">IndisponÃ­vel</option>
                  <option value="Descontinuado">Descontinuado</option>
                </select>
              </label>
              <label>PreÃ§o de venda
                <input type="number" min="0" step="0.01" value={dadosEdicao.preco} onChange={alterarEdicao('preco')} required />
              </label>
              <label>PreÃ§o de custo
                <input type="number" min="0" step="0.01" value={dadosEdicao.precoCusto} onChange={alterarEdicao('precoCusto')} />
              </label>
              <label>Quantidade
                <input type="number" min="0" value={dadosEdicao.quantidade} onChange={alterarEdicao('quantidade')} required />
              </label>
              <label>Desconto (%)
                <input type="number" min="0" max="100" step="0.1" value={dadosEdicao.descontoPercentual} onChange={alterarEdicao('descontoPercentual')} />
              </label>
              <label>Cor
                <input value={dadosEdicao.cor} onChange={alterarEdicao('cor')} />
              </label>
              <label>Armazenamento
                <input value={dadosEdicao.armazenamento} onChange={alterarEdicao('armazenamento')} />
              </label>
              <label>MemÃ³ria RAM
                <input value={dadosEdicao.memoriaRam} onChange={alterarEdicao('memoriaRam')} />
              </label>
              <label className={styles.fieldWide}>DescriÃ§Ã£o
                <textarea rows="3" value={dadosEdicao.descricao} onChange={alterarEdicao('descricao')} />
              </label>
            </div>

            {erroEdicao && <p className={styles.modalError} role="alert">{erroEdicao}</p>}

            <div className={styles.modalActions}>
              <button type="button" className={styles.cancelButton} onClick={fecharEdicao}>Cancelar</button>
              <button type="submit" className={styles.saveButton} disabled={salvandoEdicao}>
                {salvandoEdicao ? 'Salvando...' : 'Salvar alteraÃ§Ãµes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {produtoParaExcluir && (
        <div
          className={styles.confirmOverlay}
          onMouseDown={() => !excluindoId && setProdutoParaExcluir(null)}
        >
          <div
            className={styles.confirmModal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="titulo-confirmar-exclusao"
            aria-describedby="descricao-confirmar-exclusao"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.confirmContent}>
              <span>Confirmar exclusÃ£o</span>
              <h2 id="titulo-confirmar-exclusao">Tem certeza que deseja excluir?</h2>
              <p id="descricao-confirmar-exclusao">
                <strong>{produtoParaExcluir.nome}</strong> serÃ¡ removido do estoque, da pÃ¡gina de produtos e da loja do usuÃ¡rio. Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.
              </p>
            </div>

            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={() => setProdutoParaExcluir(null)}
                disabled={Boolean(excluindoId)}
              >
                Manter produto
              </button>
              <button
                type="button"
                className={styles.confirmDelete}
                onClick={() => excluirProduto(produtoParaExcluir)}
                disabled={Boolean(excluindoId)}
                autoFocus
              >
                {excluindoId ? 'Excluindo...' : 'Sim, excluir produto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

