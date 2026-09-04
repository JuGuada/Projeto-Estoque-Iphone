import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import styles from '../styles/VisaoGeral.module.css';
import AdminLayout from '../components/AdminLayout';
import { API_URL } from '../services/api.js';

const imagemProduto = (caminho) => caminho?.startsWith('/uploads/') ? `${API_URL}${caminho}` : (caminho || '/imagens/produto.png');

const imagemMovimentacao = (movimentacao) => {
  if (movimentacao?.produto_imagem) return imagemProduto(movimentacao.produto_imagem);
  const nome = String(movimentacao?.produto_nome || '').toLowerCase();
  if (nome.includes('airpod')) return '/imagens/airpods.png';
  if (nome.includes('ipad')) return '/imagens/tablet.png';
  if (nome.includes('mac')) return '/imagens/macbook.png';
  if (nome.includes('iphone')) return '/imagens/celular1.png';
  return '/imagens/produto.png';
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function VisaoGeral() {
  const [dashboard, setDashboard] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/dashboard`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.erro || 'Erro ao carregar dashboard.');
        setDashboard(data);
      })
      .catch((error) => setErro(error.message));
  }, []);

  const summary = dashboard?.summary || {};
  const movements = dashboard?.movements || [];
  const movementsOrdered = [...movements].sort((primeiro, segundo) => {
    const diferencaData = new Date(segundo.criado_em).getTime() - new Date(primeiro.criado_em).getTime();
    return diferencaData || Number(segundo.id || 0) - Number(primeiro.id || 0);
  });
  const alerts = dashboard?.alerts || [];
  const categories = (dashboard?.categories || []).filter(
    (item) => String(item.nome || '').trim().toLowerCase() !== 'watch'
  );
  const topProducts = dashboard?.topProducts || [];
  const monthlyRaw = dashboard?.monthly || [];
  const monthly = Array.from({ length: 12 }, (_, indice) => {
    const data = new Date();
    data.setMonth(data.getMonth() - (11 - indice));
    const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
    const registro = monthlyRaw.find((item) => String(item.mes || '').slice(0, 7) === chave);
    return { mes: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), saidas: Number(registro?.saidas || 0), entradas: Number(registro?.entradas || 0) };
  });
  // SÃ©rie demonstrativa usada exclusivamente no grÃ¡fico da VisÃ£o Geral.
  // Os cards, estoque, movimentaÃ§Ãµes e rankings continuam exibindo dados reais.
  const vendasDemonstracao = [24, 58, 31, 76, 43, 89, 52, 97, 68, 112, 74, 126];
  const colors = ['#84cc16', '#f97316', '#c026d3', '#ef4444', '#eab308', '#6366f1'];

  const lineChartData = {
    labels: monthly.map((item) => item.mes),
    datasets: [
      {
        label: 'Vendas',
        data: vendasDemonstracao,
        borderColor: '#10b981',
        borderWidth: 2.5,
        tension: 0.28,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, .10)',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: '#86868b', font: { size: 11 } }
      },
      y: {
        grid: { color: '#f2f2f7', drawBorder: false },
        ticks: {
          color: '#86868b',
          font: { size: 11 },
          callback: (val) => Number(val).toLocaleString('pt-BR'),
        },
      },
    },
  };

  const doughnutData = {
    labels: categories.map((item) => item.nome),
    datasets: [
      {
        data: categories.map((item) => Number(item.total || 0)),
        backgroundColor: categories.map((_, index) => colors[index % colors.length]),
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <AdminLayout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
        <div>
          <h1 className={styles.title}>VisÃ£o Geral do Estoque</h1>
          <p className={styles.subtitle}>Acompanhe mÃ©tricas, tendÃªncias e alertas em tempo real</p>
        </div>
      </div>
      {erro && <p role="alert">{erro}</p>}

      {/* Grid de Cards 1 */}
      <div className={styles.cardsGrid4}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>TOTAL DE PRODUTOS</span>
          <div className={styles.cardValue}>{summary.totalProdutos || 0}</div>
          <span className={styles.cardSubtext}>{summary.totalUnidades || 0} unidades</span>
          <div className={`${styles.cardTrend} ${styles.green}`}>
            <img src="/imagens/trend-up.png" className={styles.trendIcon} alt="" /> + 12 este mÃªs
          </div>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>VALOR EM ESTOQUE</span>
          <div className={styles.cardValue}>{Number(summary.valorEstoque || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <span className={styles.cardSubtext}>Valor calculado pelo estoque atual</span>
          <div className={`${styles.cardTrend} ${styles.green}`}>
            <img src="/imagens/trend-up.png" className={styles.trendIcon} alt="" /> + 12.5% este mÃªs
          </div>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>ALERTAS DE ESTOQUE</span>
          <div className={styles.cardValue}>{Number(summary.semEstoque || 0) + Number(summary.estoqueBaixo || 0)}</div>
          <span className={styles.cardSubtext}>{summary.semEstoque || 0} sem estoque</span>
          <div className={`${styles.cardTrend} ${styles.orange}`}>
            {summary.estoqueBaixo || 0} baixo estoque
          </div>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>VENDAS (30 DIAS)</span>
          <div className={styles.cardValue}>{Number(summary.faturamento30Dias || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <span className={styles.cardSubtext}>{summary.totalPedidos || 0} pedidos confirmados</span>
          <div className={`${styles.cardTrend} ${styles.green}`}>
            <img src="/imagens/trend-up.png" className={styles.trendIcon} alt="" /> + 18.5%
          </div>
        </div>
      </div>

      {/* Grid de Cards 2 */}
      <div className={styles.cardsGrid3}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>MOVIMENTAÃ‡Ã•ES</span>
          <div className={styles.cardValue}>{movements.length}</div>
          <span className={styles.cardSubtext}>Registros recentes carregados</span>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>ENTRADAS NO PERÃODO</span>
          <div className={styles.cardValue}>{monthly.reduce((total, item) => total + Number(item.entradas || 0), 0)}</div>
          <div className={`${styles.cardTrend} ${styles.green}`}>
            Unidades abastecidas
          </div>
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>PREÃ‡O MÃ‰DIO</span>
          <div className={styles.cardValue}>{summary.totalUnidades ? (Number(summary.valorEstoque || 0) / Number(summary.totalUnidades)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'}</div>
          <div className={`${styles.cardTrend} ${styles.green}`}>
            Valor mÃ©dio por unidade
          </div>
        </div>
      </div>

      {/* GrÃ¡fico Principal */}
      <div className={styles.cardLarge}>
        <div className={styles.chartHeader}>
          <h3>HISTÃ“RICO DE VENDAS</h3>
          <span>SimulaÃ§Ã£o mensal para apresentaÃ§Ã£o da VisÃ£o Geral</span>
        </div>
        <div className={styles.lineChartContainer}>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>
        <div className={styles.chartLegend}>
          <span><span className={styles.dotGreen}></span> Vendas</span>
        </div>
      </div>

      {/* Grid 3 Colunas */}
      <div className={styles.grid3Cols}>
        {/* DistribuiÃ§Ã£o */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>DistribuiÃ§Ã£o por Categorias</h3>
          <div className={styles.doughnutContainer}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className={styles.categoryGrid}>
            {categories.map((item, index) => (
              <div key={item.nome}><span style={{ background: colors[index % colors.length] }}></span> {item.nome} <strong>{item.total}</strong></div>
            ))}
          </div>
        </div>

        {/* Crescimento */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Crescimento por Categorias</h3>
          <div className={styles.progressList}>
            {categories.map((item, index) => (
              <div key={item.nome} className={styles.progressItem}>
                <div className={styles.progressHeader}>
                  <span style={{ color: colors[index % colors.length] }}>â— {item.nome}</span>
                </div>
                <div className={styles.progressBar}>
                  <div style={{ width: `${Math.min(Number(item.total || 0) * 20, 100)}%`, background: colors[index % colors.length] }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mais Vendidos (Produtos Atualizados e Variados) */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Mais Vendidos</h3>
          <div className={styles.productList}>
            {topProducts.map((produto) => (
              <div key={produto.id} className={styles.productRow}>
                <div className={styles.productThumb}>
                  <img src={imagemProduto(produto.imagem)} alt={produto.nome} />
                </div>
                <div className={styles.productInfo}>
                  <strong>{produto.nome}</strong>
                  <span className={styles.badgeGray}>{produto.vendas} saÃ­das</span>
                </div>
                <div className={styles.productPrice}>
                  <strong>{Number(produto.preco || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                  <small>{produto.quantidade} em estoque</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        {/* Grid Inferior (2 Colunas) */}
        <div className={styles.grid2Cols}>
          {/* Ãšltimas MovimentaÃ§Ãµes */}

          <div className={`${styles.card} ${styles.movementsCard}`}>
  <div className={styles.movementHeader}>
    <div><h3 className={styles.sectionTitle}>Ãšltimas MovimentaÃ§Ãµes</h3><p>Acompanhe as entradas e saÃ­das mais recentes</p></div>
    <span>{movementsOrdered.length} registros</span>
  </div>
  <div className={styles.movementList}>
    {movementsOrdered.map((movement, index) => (
      <div key={movement.id} className={styles.movementItem}>
        <span className={styles.movementNumber}>{String(index + 1).padStart(2, '0')}</span>
        <div className={styles.movementThumb}>
          <img
            src={imagemMovimentacao(movement)}
            alt={movement.produto_nome || 'Produto'}
            onError={(event) => { event.currentTarget.src = imagemMovimentacao({ produto_nome: movement.produto_nome }); }}
          />
        </div>
        <div className={styles.movementContent}>
          <div>
            <strong>{movement.produto_nome || 'Produto removido'}</strong>
            <p>{movement.motivo || 'Sem motivo informado'} â€¢ {movement.quantidade} unidade(s)</p>
          </div>
        </div>
        <span className={`${styles.tag} ${movement.tipo === 'entrada' ? styles.tagGreen : styles.tagRed}`}>
          {movement.tipo === 'entrada' ? 'Entrada' : 'SaÃ­da'}
        </span>
        <time className={styles.movementDate}>{movement.criado_em ? new Date(movement.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : ''}</time>
      </div>
    ))}
    {movements.length === 0 && <p>Nenhuma movimentaÃ§Ã£o registrada.</p>}

  </div>
</div>

          {/* Alertas de Estoque */}
          <div className={`${styles.card} ${styles.stockAlertCard}`}>
            <div className={styles.alertHeader}>
    <h3 className={styles.sectionTitleAlert}>
      <img src="/imagens/alerta.png" alt="" /> Alertas de Estoque
    </h3>
    <span className={styles.badgeAlert}>{alerts.length} alertas</span>
  </div>

            <div className={styles.alertBody}>
            {/* Sem Estoque */}
            <div className={styles.alertSection}>
    <span className={styles.alertRedTitle}>
      <img src="/imagens/x.png" alt="" /> Sem Estoque ({summary.semEstoque || 0})
    </span>
    {alerts.filter((item) => Number(item.quantidade) === 0).map((item) => (
      <div key={item.id} className={styles.alertRedCard}>
        <div className={styles.alertThumb}><img src={imagemProduto(item.imagem)} alt={item.nome} /></div>
        <div className={styles.alertInfo}><strong>{item.nome}</strong><p>{item.descricao || 'Sem descriÃ§Ã£o'}</p></div>
        <button className={styles.btnRepor} onClick={() => alert('Registre uma entrada em MovimentaÃ§Ãµes')}>Repor</button>
      </div>
    ))}
  </div>

            {/* Estoque Baixo */}
            <div className={styles.alertSection}>
    <span className={styles.alertOrangeTitle}>
      <img src="/imagens/alerta.png" alt="" /> Estoque Baixo ({summary.estoqueBaixo || 0})
    </span>

    <div className={styles.alertList}>
      {alerts.filter((item) => Number(item.quantidade) > 0).map((item) => (
        <div key={item.id} className={styles.alertCardBox}>
          <div className={styles.alertItemTop}>
            <div className={styles.alertThumb}>
              <img src={imagemProduto(item.imagem)} alt={item.nome} />
            </div>
            <div className={styles.alertInfo}>
              <strong>{item.nome}</strong>
              <p>{item.descricao || 'Sem descriÃ§Ã£o'}</p>
            </div>
            <div className={styles.alertCountBox}>
              <span className={styles.alertCountValue}>{item.quantidade}</span>
              <small className={styles.alertCountMin}>de {item.estoque_minimo} min</small>
            </div>
          </div>
          <div className={styles.alertBarContainer}>
            <div className={styles.alertBarFill} style={{ width: `${Math.min((Number(item.quantidade) / Math.max(Number(item.estoque_minimo), 1)) * 100, 100)}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  </div>
  </div>
</div>
        </div>
      </div>
    </AdminLayout>
  );
}

