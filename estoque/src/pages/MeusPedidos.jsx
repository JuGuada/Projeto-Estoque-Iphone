import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";
import UserHeader from "../components/UserHeader";
import styles from "../styles/meusPedidos.module.css";
import { apiRequest } from "../services/api.js";
import { converterPrecoParaNumero, formatarPrecoProduto } from "../utils/produto.js";

const etapasPedido = ["Pedido realizado", "Em separaÃ§Ã£o", "Preparando envio", "Em transporte", "Entregue"];
const indicePorStatus = {
  "Pedido realizado": 0,
  "Em andamento": 0,
  "Em separaÃ§Ã£o": 1,
  Confirmado: 2,
  "Preparando envio": 2,
  "Em transporte": 3,
  Enviado: 3,
  Entregue: 4,
  ConcluÃ­do: 4,
  Concluido: 4,
};
const indiceEtapa = (status) => indicePorStatus[status] ?? 0;
const statusVisivel = (status) => status === "Cancelado" ? "Cancelado" : etapasPedido[indiceEtapa(status)];
const pedidoEmRascunho = (pedido) => String(pedido?.id).startsWith("rascunho-") && pedido?.status !== "Cancelado";
const statusDoPedido = (pedido) => pedidoEmRascunho(pedido) ? "Aguardando pagamento" : statusVisivel(pedido.status);
const formatarData = (data) => new Date(data).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });

function ProgressoPedido({ status }) {
  if (status === "Cancelado") return null;
  const atual = indiceEtapa(status);

  return <div className={styles.tracking} aria-label={`Acompanhamento do pedido: ${etapasPedido[atual]}`}>
    {etapasPedido.map((etapa, indice) => {
      const concluida = indice < atual;
      const ativa = indice === atual;
      return <div className={`${styles.trackingStep} ${concluida ? styles.trackingDone : ""} ${ativa ? styles.trackingActive : ""}`} key={etapa}>
        <span className={styles.trackingIcon} aria-hidden="true">{concluida ? "âœ“" : ativa ? "â—" : "â—‹"}</span>
        <span className={styles.trackingLabel}>{etapa}</span>
      </div>;
    })}
  </div>;
}

export default function MeusPedidos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [filtro, setFiltro] = useState("Todos");
  const [pedidos, setPedidos] = useState([]);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      const identificador = usuario?.id || usuario?.email || "anonimo";
      let remotos = [];
      try { const dados = await apiRequest(`/pedidos?usuario=${encodeURIComponent(identificador)}`); remotos = Array.isArray(dados) ? dados : []; }
      catch { try { remotos = JSON.parse(localStorage.getItem("pedidos") || "[]"); } catch { remotos = []; } }
      let rascunho = null, cancelados = [];
      try { rascunho = JSON.parse(localStorage.getItem("pedido_em_andamento") || "null"); } catch { /* vazio */ }
      try { cancelados = JSON.parse(localStorage.getItem("pedidos_cancelados") || "[]"); } catch { cancelados = []; }
      cancelados = Array.isArray(cancelados) ? cancelados.filter((p) => !p.usuarioId || String(p.usuarioId) === String(identificador)) : [];
      const lista = rascunho && (!rascunho.usuarioId || String(rascunho.usuarioId) === String(identificador)) ? [rascunho, ...remotos, ...cancelados] : [...remotos, ...cancelados];
      if (ativo) setPedidos(lista);
    }
    carregar();
    return () => { ativo = false; };
  }, [usuario]);

  const filtrados = useMemo(() => pedidos.filter((pedido) => filtro === "Todos" || statusDoPedido(pedido) === filtro), [filtro, pedidos]);
  const maiorNumeroConfirmado = useMemo(() => pedidos.reduce((maior, pedido) => {
    const numero = Number(pedido.id);
    return Number.isInteger(numero) && numero > maior ? numero : maior;
  }, 0), [pedidos]);
  const numeroPedido = (pedido) => String(pedido.id).startsWith("rascunho-") ? maiorNumeroConfirmado + 1 : pedido.id;

  function retomar(pedido) {
    localStorage.setItem("carrinho", JSON.stringify(pedido.itens || []));
    window.dispatchEvent(new Event("carrinhoAtualizado"));
    navigate("/finalizar-compra");
  }

  function cancelar(pedido) {
    if (!String(pedido.id).startsWith("rascunho-")) return;
    const cancelado = { ...pedido, status: "Cancelado", canceladoEm: new Date().toISOString() };
    let salvos = [];
    try { salvos = JSON.parse(localStorage.getItem("pedidos_cancelados") || "[]"); } catch { salvos = []; }
    localStorage.setItem("pedidos_cancelados", JSON.stringify([cancelado, ...(Array.isArray(salvos) ? salvos : [])]));
    localStorage.removeItem("pedido_em_andamento");
    localStorage.setItem("carrinho", "[]");
    window.dispatchEvent(new Event("carrinhoAtualizado"));
    setPedidos((atuais) => atuais.map((item) => item.id === pedido.id ? cancelado : item));
  }

  return <div className={styles.page}><div className={styles.main}><UserHeader /><main className={styles.content}>
    <header className={styles.heading}><h1>Meus pedidos</h1><p>Acompanhe, retome e consulte suas compras.</p></header>
    <div className={styles.toolbar}><div className={styles.filters} role="tablist">{["Todos", "Aguardando pagamento", "Pedido realizado", "Em separaÃ§Ã£o", "Preparando envio", "Em transporte", "Entregue", "Cancelado"].map((nome) => <button key={nome} type="button" role="tab" aria-selected={filtro === nome} className={filtro === nome ? styles.filterActive : styles.filter} onClick={() => setFiltro(nome)}>{nome}</button>)}</div></div>
    <div className={styles.ordersList}>{filtrados.length ? filtrados.map((pedido) => {
      const itens = pedido.itens || [];
      const rascunho = pedidoEmRascunho(pedido);
      const status = statusDoPedido(pedido);
      return <section className={`${styles.orderCard} ${styles.clickableCard}`} key={pedido.id} onClick={() => setSelecionado(pedido)}>
        <div className={styles.orderHeader}><div><h2>{rascunho ? "Compra nÃ£o finalizada" : `Pedido #${numeroPedido(pedido)}`}</h2><p>Iniciado em {formatarData(pedido.criadoEm)}</p></div><span className={`${styles.status} ${rascunho ? styles.statusPending : ""} ${status === "Cancelado" ? styles.statusCanceled : status === "Entregue" ? styles.statusDone : ""}`}>{status}</span></div>
        {rascunho ? <div className={styles.finishNotice}><strong>Finalize o seu pedido</strong><span>O pagamento ainda nÃ£o foi realizado. Continue a compra para confirmar o pedido e iniciar o acompanhamento da entrega.</span></div> : <ProgressoPedido status={pedido.status} />}
        <div className={styles.itemsHeader}><strong>Itens do pedido ({itens.length})</strong><button type="button">Abrir detalhes</button></div>
        <div className={styles.items}>{itens.map((item) => <div className={styles.item} key={`${pedido.id}-${item.id}`}><div className={styles.productImage}><img src={item.imagem || "/imagens/produto.png"} alt={item.nome} /></div><div className={styles.itemDescription}><strong>{item.nome}</strong><span>{item.cor || item.modelo || "Produto"}</span></div><span className={styles.quantity}>Quantidade: {item.quantidade || 1}</span><strong className={styles.price}>{formatarPrecoProduto(item.preco)}</strong></div>)}</div>
        <footer className={styles.orderFooter}><p>{status === "Entregue" ? <>Detalhes e comprovante da compra disponÃ­veis<br /><b>{usuario?.email || "E-mail nÃ£o informado"}</b></> : status === "Cancelado" ? "Pedido cancelado. Nenhuma alteraÃ§Ã£o foi feita no estoque." : rascunho ? "Finalize a compra para transformar este rascunho em pedido." : `Acompanhe aqui cada etapa atÃ© a entrega do seu pedido.`}</p>{rascunho && <div className={styles.orderActions}><button type="button" onClick={(e) => { e.stopPropagation(); cancelar(pedido); }}>Cancelar</button><button type="button" className={styles.primaryAction} onClick={(e) => { e.stopPropagation(); retomar(pedido); }}>Finalizar pedido</button></div>}</footer>
      </section>;
    }) : <div className={styles.empty}>Nenhum pedido encontrado nessa categoria.</div>}</div>
  </main></div>
  {selecionado && <div className={styles.detailsOverlay} onMouseDown={() => setSelecionado(null)}><section className={styles.detailsModal} role="dialog" aria-modal="true" aria-labelledby="titulo-detalhes" onMouseDown={(e) => e.stopPropagation()}>
    <header className={styles.detailsHeader}><div><span>DETALHES DA COMPRA</span><h2 id="titulo-detalhes">{pedidoEmRascunho(selecionado) ? "Compra nÃ£o finalizada" : `Pedido #${numeroPedido(selecionado)}`}</h2><p>{formatarData(selecionado.criadoEm)}</p></div><button type="button" onClick={() => setSelecionado(null)} aria-label="Fechar">Ã—</button></header>
    <div className={styles.detailsStatus}><span>Status atual</span><strong>{statusDoPedido(selecionado)}</strong></div>
    {pedidoEmRascunho(selecionado) ? <div className={styles.detailsFinishNotice}><strong>Finalize o seu pedido</strong><span>O pagamento ainda estÃ¡ pendente e o acompanhamento comeÃ§arÃ¡ apÃ³s a confirmaÃ§Ã£o.</span></div> : <div className={styles.detailsTracking}><ProgressoPedido status={selecionado.status} /></div>}
    <div className={styles.detailsItems}>{(selecionado.itens || []).map((item) => <div key={`${selecionado.id}-detalhe-${item.id}`}><img src={item.imagem || "/imagens/produto.png"} alt={item.nome} /><span><strong>{item.nome}</strong><small>{item.cor || item.modelo || "Produto"} â€¢ {item.quantidade || 1} unidade(s)</small></span><b>{formatarPrecoProduto(converterPrecoParaNumero(item.preco) * Number(item.quantidade || 1))}</b></div>)}</div>
    <div className={styles.detailsGrid}><div><span>Forma de pagamento</span><strong>{selecionado.formaPagamento || "Ainda nÃ£o definida"}{selecionado.parcelas > 1 ? ` â€¢ ${selecionado.parcelas}x` : ""}</strong></div><div><span>Cliente</span><strong>{selecionado.usuarioNome || usuario?.nome || "Cliente"}</strong><small>{selecionado.usuarioEmail || usuario?.email || "E-mail nÃ£o informado"}</small></div><div className={styles.detailsAddress}><span>EndereÃ§o de entrega</span><strong>{selecionado.endereco?.logradouro ? `${selecionado.endereco.logradouro}, ${selecionado.endereco.numero || "s/n"}` : "Ainda nÃ£o informado"}</strong><small>{selecionado.endereco?.bairro ? `${selecionado.endereco.bairro} â€¢ ${selecionado.endereco.cidade}/${selecionado.endereco.estado} â€¢ CEP ${selecionado.endereco.cep}` : "Complete o endereÃ§o ao finalizar a compra"}</small></div></div>
    <div className={styles.detailsTotals}><p><span>Subtotal</span><strong>{formatarPrecoProduto(selecionado.subtotal)}</strong></p><p><span>Frete</span><strong>{Number(selecionado.frete || 0) === 0 ? "GrÃ¡tis" : formatarPrecoProduto(selecionado.frete)}</strong></p><p><span>Total da compra</span><strong>{formatarPrecoProduto(selecionado.total)}</strong></p></div>
  </section></div>}
  </div>;
}

