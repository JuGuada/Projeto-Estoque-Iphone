import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api.js";
import { formatarPrecoProduto } from "../utils/produto.js";
import styles from "../styles/PedidosAdmin.module.css";

const STATUS = ["Pedido realizado", "Em separação", "Preparando envio", "Em transporte", "Entregue", "Cancelado"];
const statusAtual = (status) => status === "Confirmado" ? "Preparando envio" : ["Concluído", "Concluido"].includes(status) ? "Entregue" : status || "Pedido realizado";
const data = (valor) => valor ? new Date(valor).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";
const nomePagamento = (tipo) => ({ cartao: "Cartão de crédito", pix: "Pix", boleto: "Boleto" }[tipo] || tipo || "Não informado");

export default function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [selecionado, setSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    apiRequest("/pedidos").then((resposta) => setPedidos(Array.isArray(resposta) ? resposta : []))
      .catch((error) => setErro(error.message)).finally(() => setCarregando(false));
  }, []);

  const resumo = useMemo(() => ({
    total: pedidos.length,
    novos: pedidos.filter((p) => ["Pedido realizado", "Confirmado"].includes(p.status)).length,
    logistica: pedidos.filter((p) => ["Preparando envio", "Em transporte"].includes(statusAtual(p.status))).length,
    faturamento: pedidos.filter((p) => statusAtual(p.status) !== "Cancelado").reduce((soma, p) => soma + Number(p.total || 0), 0),
  }), [pedidos]);

  const exibidos = useMemo(() => pedidos.filter((pedido) => {
    const conteudo = `${pedido.id} ${pedido.usuarioNome || ""} ${pedido.usuarioEmail || ""} ${nomePagamento(pedido.formaPagamento)}`.toLowerCase();
    return (filtro === "Todos" || statusAtual(pedido.status) === filtro) && conteudo.includes(busca.trim().toLowerCase());
  }), [busca, filtro, pedidos]);

  async function mudarStatus(pedido, status) {
    setSalvando(pedido.id); setErro("");
    try {
      await apiRequest(`/pedidos/${pedido.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setPedidos((lista) => lista.map((item) => item.id === pedido.id ? { ...item, status } : item));
      setSelecionado((item) => item?.id === pedido.id ? { ...item, status } : item);
    } catch (error) { setErro(error.message); } finally { setSalvando(null); }
  }

  return <div className={styles.page}>
    <header className={styles.header}><div><span>Administração</span><h1>Pedidos</h1><p>Controle clientes, pagamentos e entregas em um só lugar.</p></div></header>
    <section className={styles.stats}>
      <article><span>TOTAL DE PEDIDOS</span><strong>{resumo.total}</strong><small>pedidos registrados</small></article>
      <article><span>NOVOS PEDIDOS</span><strong>{resumo.novos}</strong><small>aguardando andamento</small></article>
      <article><span>EM LOGÍSTICA</span><strong>{resumo.logistica}</strong><small>preparo ou transporte</small></article>
      <article><span>FATURAMENTO</span><strong>{formatarPrecoProduto(resumo.faturamento)}</strong><small>exceto cancelados</small></article>
    </section>
    <section className={styles.panel}>
      <div className={styles.panelTop}><label className={styles.search}><span>⌕</span><input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pedido ou cliente" /></label><div className={styles.panelActions}><span>{exibidos.length} pedido(s)</span><select value={filtro} onChange={(e) => setFiltro(e.target.value)}><option>Todos</option>{STATUS.map((item) => <option key={item}>{item}</option>)}</select></div></div>
      {erro && <div className={styles.error}>{erro}</div>}
      {carregando ? <div className={styles.empty}>Carregando pedidos...</div> : exibidos.length === 0 ? <div className={styles.empty}>Nenhum pedido encontrado.</div> : <div className={styles.tableWrap}><table><thead><tr><th>Pedido</th><th>Cliente</th><th>Pagamento</th><th>Itens</th><th>Total</th><th>Status</th><th>Data</th><th></th></tr></thead><tbody>{exibidos.map((pedido) => <tr key={pedido.id}>
        <td><b>#{pedido.id}</b></td><td><strong>{pedido.usuarioNome || "Cliente"}</strong><small>{pedido.usuarioEmail || "Sem e-mail"}</small></td><td>{nomePagamento(pedido.formaPagamento)}{pedido.parcelas > 1 && <small>{pedido.parcelas}x</small>}</td><td>{(pedido.itens || []).reduce((n, item) => n + Number(item.quantidade || 1), 0)}</td><td><b>{formatarPrecoProduto(pedido.total)}</b></td><td><span className={`${styles.badge} ${statusAtual(pedido.status) === "Cancelado" ? styles.canceled : statusAtual(pedido.status) === "Entregue" ? styles.delivered : ""}`}>{statusAtual(pedido.status)}</span></td><td>{data(pedido.criadoEm)}</td><td><button className={styles.detailsButton} onClick={() => setSelecionado(pedido)}>Detalhes</button></td>
      </tr>)}</tbody></table></div>}
    </section>
    {selecionado && <div className={styles.overlay} onMouseDown={() => setSelecionado(null)}><section className={styles.modal} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
      <header className={styles.modalHeader}><div><span>DETALHES DO PEDIDO</span><h2>Pedido #{selecionado.id}</h2><p>Realizado em {data(selecionado.criadoEm)}</p></div><button onClick={() => setSelecionado(null)} aria-label="Fechar">×</button></header>
      <div className={styles.infoGrid}><article><span>CLIENTE</span><strong>{selecionado.usuarioNome || "Cliente"}</strong><small>{selecionado.usuarioEmail || "E-mail não informado"}</small><small>ID: {selecionado.usuarioId}</small></article><article><span>PAGAMENTO</span><strong>{nomePagamento(selecionado.formaPagamento)}</strong><small>{selecionado.parcelas > 1 ? `${selecionado.parcelas} parcelas` : "Pagamento à vista"}</small></article><article><span>ENTREGA</span><strong>{selecionado.endereco?.logradouro ? `${selecionado.endereco.logradouro}, ${selecionado.endereco.numero || "s/n"}` : "Não informado"}</strong><small>{selecionado.endereco?.bairro} · {selecionado.endereco?.cidade}/{selecionado.endereco?.estado}</small><small>CEP {selecionado.endereco?.cep || "—"}</small></article></div>
      <div className={styles.statusControl}><label>Status do pedido<select value={statusAtual(selecionado.status)} disabled={salvando === selecionado.id} onChange={(e) => mudarStatus(selecionado, e.target.value)}>{STATUS.map((item) => <option key={item}>{item}</option>)}</select></label><small>{salvando === selecionado.id ? "Salvando alteração..." : "O cliente verá esta atualização em Meus pedidos."}</small></div>
      <div className={styles.items}><h3>Itens do pedido</h3>{(selecionado.itens || []).map((item) => <article key={`${selecionado.id}-${item.id}`}><img src={item.imagem || "/imagens/produto.png"} alt="" /><div><strong>{item.nome}</strong><small>{item.cor || item.categoria || "Produto"}</small></div><span>{item.quantidade || 1} un.</span><b>{formatarPrecoProduto(Number(item.preco) * Number(item.quantidade || 1))}</b></article>)}</div>
      <footer className={styles.totals}><p><span>Subtotal</span><b>{formatarPrecoProduto(selecionado.subtotal)}</b></p><p><span>Frete</span><b>{Number(selecionado.frete) ? formatarPrecoProduto(selecionado.frete) : "Grátis"}</b></p>{Number(selecionado.desconto) > 0 && <p><span>Descontos{selecionado.cupom ? ` · cupom ${selecionado.cupom}` : ""}</span><b>− {formatarPrecoProduto(selecionado.desconto)}</b></p>}<p><span>Total</span><strong>{formatarPrecoProduto(selecionado.total)}</strong></p></footer>
    </section></div>}
  </div>;
}
