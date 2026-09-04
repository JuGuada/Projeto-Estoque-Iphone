import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from '../styles/movimentacoes.module.css';
import AdminLayout from '../components/AdminLayout';
import { API_URL, apiRequest } from '../services/api.js';
import { useAuth } from '../contexts/authContext.jsx';


function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function normalizarMovimentacao(item, operadorAtual = 'Administrador') {
  return {
    id: item.id,
    criadoEm: item.criado_em,
    dataHora: formatarData(item.criado_em),
    tipo: item.tipo === 'entrada' ? 'Entrada' : 'SaÃ­da',
    produto: item.produto_nome || 'Produto removido',
    imagem: item.produto_imagem?.startsWith('/uploads/') ? `${API_URL}${item.produto_imagem}` : (item.produto_imagem || '/imagens/produto.png'),
    detalhes: item.motivo || 'Sem motivo informado',
    sku: item.sku || item.numero_serie || 'SKU nÃ£o informado',
    qtd: Number(item.quantidade || 0),
    operador: String(item.responsavel || '').trim() || operadorAtual,
    tipoOperador: item.operador_tipo === 'cliente' || String(item.motivo || '').toLowerCase().includes('venda online') ? 'Cliente' : 'Operador administrativo'
  };
}

export default function Movimentacoes() {
  const { usuario } = useAuth();
  const operadorAtual = usuario?.nome || usuario?.email || 'Administrador';
  const [historico, setHistorico] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [tipoMovimentacao, setTipoMovimentacao] = useState('Saida');
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [responsavel, setResponsavel] = useState('');
  const [filtro, setFiltro] = useState('Todos');
  const [dataFiltro, setDataFiltro] = useState('');
  const [dataTemporaria, setDataTemporaria] = useState('');
  const [calendarioAberto, setCalendarioAberto] = useState(false);
  const [mesCalendario, setMesCalendario] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const calendarioRef = useRef(null);

  const diasCalendario = useMemo(() => {
    const ano = mesCalendario.getFullYear();
    const mes = mesCalendario.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    return [...Array(primeiroDia).fill(null), ...Array.from({ length: totalDias }, (_, indice) => indice + 1)];
  }, [mesCalendario]);

  useEffect(() => {
    function fecharCalendario(event) {
      if (calendarioRef.current && !calendarioRef.current.contains(event.target)) setCalendarioAberto(false);
    }
    document.addEventListener('mousedown', fecharCalendario);
    return () => document.removeEventListener('mousedown', fecharCalendario);
  }, []);

  function valorData(dia) {
    return `${mesCalendario.getFullYear()}-${String(mesCalendario.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  function aplicarData() {
    setDataFiltro(dataTemporaria);
    setCalendarioAberto(false);
  }

  function alternarCalendario() {
    if (!calendarioAberto && dataFiltro) {
      const selecionada = new Date(`${dataFiltro}T12:00:00`);
      setMesCalendario(new Date(selecionada.getFullYear(), selecionada.getMonth(), 1));
    }
    setDataTemporaria(dataFiltro);
    setCalendarioAberto((aberto) => !aberto);
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        const [movimentacoesResponse, produtosResponse] = await Promise.all([
          fetch(`${API_URL}/movimentacoes`),
          fetch(`${API_URL}/itens`)
        ]);
        const movimentacoes = await movimentacoesResponse.json();
        const produtosData = await produtosResponse.json();

        if (!movimentacoesResponse.ok || !produtosResponse.ok) {
          throw new Error('NÃ£o foi possÃ­vel carregar os dados de estoque.');
        }

        setHistorico(movimentacoes.map((item) => normalizarMovimentacao(item, operadorAtual)));
        setProdutos(Array.isArray(produtosData) ? produtosData : []);

        try {
          const [usuariosData, permissoesData] = await Promise.all([
            apiRequest('/usuarios'),
            apiRequest('/permissoes')
          ]);
          const usuariosComAcesso = (Array.isArray(usuariosData) ? usuariosData : []).filter((item) => {
            const tipo = String(item.tipo || '').toLowerCase();
            return tipo === 'admin' || (tipo !== 'usuario' && (permissoesData?.[tipo] || []).includes(4));
          });
          setOperadores(usuariosComAcesso);
        } catch {
          setOperadores([]);
        }
      } catch (error) {
        setErro(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [operadorAtual]);

  useEffect(() => {
    setResponsavel(operadorAtual);
  }, [operadorAtual]);

  const produtoEscolhido = produtos.find((produto) => Number(produto.id) === Number(produtoSelecionado));
  const skuSelecionado = produtoEscolhido?.sku || '';

  const handleRegistrar = (e) => {
    e.preventDefault();

    if (!produtoSelecionado) {
      setErro('Selecione um produto para registrar a movimentaÃ§Ã£o.');
      return;
    }

    fetch(`${API_URL}/movimentacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item_id: Number(produtoSelecionado),
        tipo: tipoMovimentacao === 'Entrada' ? 'entrada' : 'saida',
        quantidade: Number(quantidade),
        motivo: tipoMovimentacao === 'Entrada' ? 'Abastecimento' : 'Venda',
        sku: skuSelecionado,
        responsavel: responsavel.trim()
      })
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || 'Erro ao registrar movimentaÃ§Ã£o.');
        setHistorico((historicoAtual) => [normalizarMovimentacao(data, operadorAtual), ...historicoAtual]);
        setProdutos((produtosAtuais) => produtosAtuais.map((produto) => (
          produto.id === Number(produtoSelecionado)
            ? { ...produto, quantidade: data.estoque_atual }
            : produto
        )));
        setProdutoSelecionado('');
        setQuantidade(1);
        setErro('');
      })
      .catch((error) => setErro(error.message));
  };

  const totalRegistros = historico.length;
  const unidadesEntrada = historico.filter((h) => h.tipo === 'Entrada').reduce((acc, item) => acc + item.qtd, 0);
  const unidadesSaida = historico.filter((h) => h.tipo === 'SaÃ­da').reduce((acc, item) => acc + item.qtd, 0);

  const historicoFiltrado = historico.filter((item) => {
    if (filtro === 'Entradas') return item.tipo === 'Entrada';
    if (filtro === 'SaÃ­das') return item.tipo === 'SaÃ­da';
    return true;
  }).filter((item) => {
    if (!dataFiltro) return true;
    const dataMovimentacao = new Date(item.criadoEm);
    if (Number.isNaN(dataMovimentacao.getTime())) return false;
    const ano = dataMovimentacao.getFullYear();
    const mes = String(dataMovimentacao.getMonth() + 1).padStart(2, '0');
    const dia = String(dataMovimentacao.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}` === dataFiltro;
  });

  return (
    <AdminLayout>
      <div className={styles.container}>
      {/* ... (todo o resto do JSX permanece igual, incluindo banners, mÃ©tricas e formulÃ¡rio) ... */}
      <div className={styles.headerTitle}>
        <h1>MovimentaÃ§Ãµes</h1>
        <p>Registre vendas e entradas de estoque com rastreio pelo SKU cadastrado do produto.</p>
      </div>

      <div className={styles.bannersSection}>
        <div className={`${styles.bannerCard} ${styles.bannerPurple} ${styles.anim1}`}>
          <div className={styles.badgeBannerFull}>O campeÃ£o de bilheteria</div>
          <div className={styles.cardHeader}>
            <h2>AirPods<br />Pro 4</h2>
          </div>
          <div className={styles.centerProductImage}>
            <img src="/imagens/airpods2.png" alt="AirPods Pro 4" />
          </div>
          <p className={styles.bannerSubtitle}>
            Saindo mais rÃ¡pido do que<br />estoque em Black Friday
          </p>
        </div>

        <div className={`${styles.bannerCard} ${styles.bannerCyan} ${styles.anim2}`}>
          <div className={styles.badgeBannerFull}>Ritmo de vendas</div>
          <div className={styles.centerCyanContent}>
            <h2>Loja On<br />Fire!!</h2>
            <p className={styles.bannerSubtitle}>A equipe tÃ¡ voando<br />no atendimento</p>
          </div>
        </div>

        <div className={`${styles.bannerCard} ${styles.bannerImage} ${styles.anim3}`}>
          <div className={styles.textOverlay}>
            <p>Especialistas dedicados a garantir a melhor experiÃªncia para o cliente.</p>
          </div>
        </div>
      </div>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricNumber}>{totalRegistros}</span>
          <span className={styles.metricLabel}>Total de registros</span>
        </div>

        <div className={styles.metricCard}>
          <span className={`${styles.metricNumber} ${styles.blueText}`}>{unidadesEntrada}</span>
          <span className={styles.metricLabel}>Unidades em entrada</span>
        </div>

        <div className={styles.metricCard}>
          <span className={`${styles.metricNumber} ${styles.redText}`}>{unidadesSaida}</span>
          <span className={styles.metricLabel}>Unidades em saÃ­da</span>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.cardForm}>
          <h3>AÃ§Ã£o rÃ¡pida</h3>
          <p className={styles.formSubtitle}>Registre uma venda ou abastecimento de estoque.</p>

          <form onSubmit={handleRegistrar} className={styles.form}>
            <label className={styles.label}>Tipo de movimentaÃ§Ã£o</label>
            <div className={styles.tipoButtons}>
              <button type="button" className={`${styles.btnTipo} ${tipoMovimentacao === 'Saida' ? styles.btnSaidaActive : ''}`} onClick={() => setTipoMovimentacao('Saida')}>SaÃ­da / Venda</button>
              <button type="button" className={`${styles.btnTipo} ${tipoMovimentacao === 'Entrada' ? styles.btnEntradaActive : ''}`} onClick={() => setTipoMovimentacao('Entrada')}>Entrada / Abastecimento</button>
            </div>

            <div className={styles.inputGroup}>
              <label>Produto</label>
              <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)} className={styles.input}>
                <option value="">Selecionar produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} ({produto.quantidade} em estoque)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label>SKU do produto</label>
              <input type="text" value={skuSelecionado || 'Selecione um produto'} readOnly className={styles.input} aria-label="SKU do produto selecionado" />
            </div>

            <div className={styles.inputGroup}>
              <label>Quantidade</label>
              <input type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} className={styles.input} />
            </div>

            <div className={styles.inputGroup}>
              <label>Operador administrativo</label>
              <select value={responsavel} onChange={(e) => setResponsavel(e.target.value)} className={styles.input} aria-label="Selecionar operador administrativo">
                {!operadores.some((item) => (item.nome || item.email) === responsavel) && <option value={responsavel}>{responsavel}</option>}
                {operadores.map((item) => <option key={item.id} value={item.nome || item.email}>{item.nome || item.email}{item.email && item.nome ? ` â€” ${item.email}` : ''}</option>)}
              </select>
            </div>

            <button type="submit" className={styles.btnSubmit}>+ Registrar movimentaÃ§Ã£o</button>
            {erro && <p role="alert">{erro}</p>}
          </form>
        </div>

        <div className={styles.cardHistory}>
          <div className={styles.historyHeader}>
            <h3>HistÃ³rico</h3>
            <div className={styles.historyFilters}>
              <div className={styles.calendarArea} ref={calendarioRef}>
                <button type="button" className={`${styles.dateFilter} ${dataFiltro ? styles.dateFilterActive : ''}`} onClick={alternarCalendario}>
                  <span className={styles.calendarIcon}>â–¦</span>
                  <span>{dataFiltro ? new Date(`${dataFiltro}T12:00:00`).toLocaleDateString('pt-BR') : 'Selecionar data'}</span>
                </button>
                {dataFiltro && <button type="button" className={styles.clearDate} onClick={() => { setDataFiltro(''); setDataTemporaria(''); }} aria-label="Limpar filtro de data">Ã—</button>}
                {calendarioAberto && <div className={styles.calendarPopup}>
                  <div className={styles.calendarHeader}><button type="button" onClick={() => setMesCalendario((mes) => new Date(mes.getFullYear(), mes.getMonth() - 1, 1))}>â€¹</button><strong>{mesCalendario.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong><button type="button" onClick={() => setMesCalendario((mes) => new Date(mes.getFullYear(), mes.getMonth() + 1, 1))}>â€º</button></div>
                  <div className={styles.weekDays}>{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dia, indice) => <span key={`${dia}-${indice}`}>{dia}</span>)}</div>
                  <div className={styles.calendarDays}>{diasCalendario.map((dia, indice) => dia ? <button type="button" key={dia} className={dataTemporaria === valorData(dia) ? styles.selectedDay : ''} onClick={() => setDataTemporaria(valorData(dia))}>{dia}</button> : <span key={`vazio-${indice}`} />)}</div>
                  <div className={styles.calendarFooter}><button type="button" className={styles.todayButton} onClick={() => { const hoje = new Date(); setMesCalendario(new Date(hoje.getFullYear(), hoje.getMonth(), 1)); setDataTemporaria(`${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`); }}>Hoje</button><button type="button" className={styles.applyDate} disabled={!dataTemporaria} onClick={aplicarData}>Aplicar</button></div>
                </div>}
              </div>
              <div className={styles.filterTabs} aria-label="Filtrar por tipo">
                {['Todos', 'Entradas', 'SaÃ­das'].map((tab) => (
                  <button type="button" key={tab} className={`${styles.tabBtn} ${filtro === tab ? styles.tabActive : ''}`} onClick={() => setFiltro(tab)}>{tab}</button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>DATA / HORA</th>
                  <th>TIPO</th>
                  <th>PRODUTO</th>
                  <th>SKU</th>
                  <th style={{ textAlign: 'center' }}>QTD</th>
                  <th style={{ textAlign: 'right' }}>RESPONSÃVEL</th>
                </tr>
              </thead>
              <tbody>
                {carregando && (
                  <tr>
                    <td colSpan="6">Carregando movimentaÃ§Ãµes...</td>
                  </tr>
                )}
                {!carregando && historicoFiltrado.map((item) => (
                  <tr key={item.id} className={styles.tableRowAnim}>
                    <td className={styles.dateCell}>{item.dataHora}</td>
                    <td><span className={`${styles.tagType} ${item.tipo === 'Entrada' ? styles.tagEntrada : styles.tagSaida}`}>{item.tipo}</span></td>
                    <td><div className={styles.productCell}><img className={styles.productPhoto} src={item.imagem} alt={item.produto} /><span><strong>{item.produto}</strong><small>{item.detalhes}</small></span></div></td>
                    <td className={styles.skuCell}><code>{item.sku}</code></td>
                    <td style={{ textAlign: 'center' }}><strong>{item.qtd}</strong></td>
                    <td style={{ textAlign: 'right' }} className={styles.operatorCell}><strong>{item.operador}</strong><small>{item.tipoOperador}</small></td>
                  </tr>
                ))}
                {!carregando && historicoFiltrado.length === 0 && (
                  <tr><td colSpan="6" className={styles.emptyHistory}>Nenhuma movimentaÃ§Ã£o encontrada para este perÃ­odo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </AdminLayout>
  );
}

