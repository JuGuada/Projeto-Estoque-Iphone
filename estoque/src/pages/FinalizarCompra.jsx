import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import { useAuth } from "../contexts/authContext.jsx";
import { apiRequest } from "../services/api.js";
import { converterPrecoParaNumero, formatarPrecoProduto } from "../utils/produto.js";
import styles from "../styles/finalizarCompra.module.css";
import "../styles/finalizarCompraExtras.css";

export default function FinalizarCompra() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [itens] = useState(() => {
    try {
      const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
      if (Array.isArray(carrinho) && carrinho.length) return carrinho;
      const rascunho = JSON.parse(localStorage.getItem("pedido_em_andamento") || "null");
      return Array.isArray(rascunho?.itens) ? rascunho.itens : [];
    } catch { return []; }
  });
  const [enderecoSalvo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`endereco_salvo_${usuario?.id || usuario?.email || "anonimo"}`) || "null");
    } catch { return null; }
  });
  const [endereco, setEndereco] = useState(() => {
    try {
      const rascunho = JSON.parse(localStorage.getItem("pedido_em_andamento") || "null")?.endereco;
      return rascunho || enderecoSalvo || { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };
    }
    catch { return { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" }; }
  });
  const [pagamento, setPagamento] = useState("cartao");
  const [parcelas, setParcelas] = useState("1");
  const [cartao, setCartao] = useState({ nome: "", numero: "", validade: "", cvv: "" });
  const [aceitou, setAceitou] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erroCep, setErroCep] = useState("");
  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState(false);
  const [mensagemCupom, setMensagemCupom] = useState("");
  const [etapaPix, setEtapaPix] = useState(null);

  const subtotal = useMemo(() => itens.reduce((total, item) => total + converterPrecoParaNumero(item.preco) * Number(item.quantidade || 1), 0), [itens]);
  const frete = subtotal >= 500 ? 0 : 29.9;
  const descontoCupom = cupomAplicado ? subtotal * .1 : 0;
  const descontoPix = pagamento === "pix" ? subtotal * .03 : 0;
  const total = Math.max(0, subtotal - descontoCupom - descontoPix + frete);
  const codigoPix = `00020126PIX.FRANQUIA.APPLE.${(usuario?.id || "CLIENTE").toString().toUpperCase()}52040000530398654${total.toFixed(2)}5802BR5908FRANQUIA6009SAOPAULO62070503***6304A1B2`;

  const alterar = (setter, campo) => (event) => setter((atual) => ({ ...atual, [campo]: event.target.value }));

  function aplicarCupom() {
    if (cupom.trim().toLowerCase() !== "cupom") {
      setCupomAplicado(false);
      setMensagemCupom("Cupom inválido.");
      return;
    }
    setCupomAplicado(true);
    setMensagemCupom("Cupom aplicado: 10% de desconto.");
  }

  async function copiarPixEConfirmar() {
    try { await navigator.clipboard.writeText(codigoPix); } catch { /* a confirmação continua mesmo sem acesso à área de transferência */ }
    await criarPedido(true);
  }

  useEffect(() => {
    if (!itens.length) return;
    let anterior = null;
    try { anterior = JSON.parse(localStorage.getItem("pedido_em_andamento") || "null"); } catch { /* sem rascunho anterior */ }
    localStorage.setItem("pedido_em_andamento", JSON.stringify({
      id: anterior?.id || `rascunho-${Date.now()}`,
      usuarioId: usuario?.id || usuario?.email || "anonimo",
      status: "Em andamento",
      criadoEm: anterior?.criadoEm || new Date().toISOString(),
      itens, endereco, formaPagamento: pagamento, parcelas: Number(parcelas), subtotal, frete, descontoCupom, descontoPix, total,
    }));
  }, [descontoCupom, descontoPix, endereco, frete, itens, pagamento, parcelas, subtotal, total, usuario]);

  async function consultarCep() {
    const cep = endereco.cep.replace(/\D/g, "");
    if (cep.length !== 8) return setErroCep("Digite um CEP com 8 números.");
    setBuscandoCep(true);
    setErroCep("");
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await response.json();
      if (!response.ok || dados.erro) throw new Error("CEP não encontrado.");
      setEndereco((atual) => ({ ...atual, cep: cep.replace(/^(\d{5})(\d{3})$/, "$1-$2"), logradouro: dados.logradouro || atual.logradouro, bairro: dados.bairro || atual.bairro, cidade: dados.localidade || atual.cidade, estado: dados.uf || atual.estado }));
    } catch (error) {
      setErroCep(error.message || "Não foi possível consultar o CEP.");
    } finally {
      setBuscandoCep(false);
    }
  }

  async function finalizar(event) {
    event.preventDefault();
    setErro("");
    if (!itens.length) return setErro("Seu carrinho está vazio.");
    if (!aceitou) return setErro("Confirme os dados e os termos da compra.");
    if (pagamento === "pix") {
      setEtapaPix("gerando");
      window.setTimeout(() => setEtapaPix("qrcode"), 1400);
      return;
    }

    await criarPedido(false);
  }

  async function criarPedido(confirmacaoPix = false) {
    setProcessando(true);
    try {
      const identificador = usuario?.id || usuario?.email || "anonimo";
      const pedido = await apiRequest("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          usuarioId: identificador,
          usuarioNome: usuario?.nome || usuario?.name || "Cliente",
          usuarioEmail: usuario?.email || "",
          itens,
          formaPagamento: pagamento,
          parcelas: pagamento === "cartao" ? Number(parcelas) : 1,
          endereco,
          cupom: cupomAplicado ? "cupom" : "",
        }),
      });
      localStorage.setItem("carrinho", "[]");
      window.dispatchEvent(new Event("carrinhoAtualizado"));
      localStorage.removeItem("pedido_em_andamento");
      if (confirmacaoPix) {
        setEtapaPix("confirmado");
        window.setTimeout(() => navigate("/meus-pedidos", { replace: true, state: { pedidoCriado: pedido.id } }), 1800);
      } else {
        navigate("/meus-pedidos", { replace: true, state: { pedidoCriado: pedido.id } });
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setProcessando(false);
    }
  }

  if (!itens.length) {
    return <div className={styles.page}><UserHeader /><main className={styles.empty}><h1>Seu carrinho está vazio</h1><p>Adicione um produto antes de finalizar a compra.</p><button onClick={() => navigate("/")}>Voltar para a loja</button></main></div>;
  }

  return (
    <div className={styles.page}>
      <UserHeader />
      <main className={styles.container}>
        <button className={styles.back} type="button" onClick={() => navigate("/carrinho")}>← Voltar ao carrinho</button>
        <header className={styles.header}><span>CHECKOUT SEGURO</span><h1>Finalizar compra</h1><p>Revise seus dados e escolha como deseja pagar.</p></header>

        <form className={styles.layout} onSubmit={finalizar}>
          <div className={styles.formColumn}>
            <section className={styles.card}>
              <div className={styles.sectionTitle}><span>01</span><div><h2>Endereço de entrega</h2><p>Informe onde você deseja receber o pedido.</p></div></div>
              {enderecoSalvo?.logradouro && <div className={styles.savedAddressSuggestion}><span className={styles.savedAddressIcon}>⌂</span><div><small>ENDEREÇO SALVO</small><strong>{enderecoSalvo.logradouro}, {enderecoSalvo.numero || "s/n"}</strong><p>{enderecoSalvo.bairro} · {enderecoSalvo.cidade}/{enderecoSalvo.estado} · CEP {enderecoSalvo.cep}</p></div><button type="button" onClick={() => { setEndereco({ cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", ...enderecoSalvo }); setErroCep(""); }}>Usar este endereço</button></div>}
              <div className={styles.grid}>
                <label>CEP<div className="checkoutCepField"><input required inputMode="numeric" maxLength="9" value={endereco.cep} onChange={alterar(setEndereco, "cep")} onBlur={consultarCep} placeholder="00000-000" /><button type="button" onClick={consultarCep} disabled={buscandoCep}>{buscandoCep ? "Buscando..." : "Buscar"}</button></div>{erroCep && <small className="checkoutCepError">{erroCep}</small>}</label>
                <label className={styles.wide}>Endereço<input required value={endereco.logradouro} onChange={alterar(setEndereco, "logradouro")} placeholder="Rua ou avenida" /></label>
                <label>Número<input required value={endereco.numero} onChange={alterar(setEndereco, "numero")} /></label>
                <label>Complemento<input value={endereco.complemento} onChange={alterar(setEndereco, "complemento")} placeholder="Opcional" /></label>
                <label>Bairro<input required value={endereco.bairro} onChange={alterar(setEndereco, "bairro")} /></label>
                <label>Cidade<input required value={endereco.cidade} onChange={alterar(setEndereco, "cidade")} /></label>
                <label>Estado<input required maxLength="2" value={endereco.estado} onChange={alterar(setEndereco, "estado")} placeholder="SP" /></label>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.sectionTitle}><span>02</span><div><h2>Pagamento</h2><p>Escolha a opção mais conveniente.</p></div></div>
              <div className={styles.paymentOptions}>
                {[['cartao','Cartão de crédito','Em até 12x'],['pix','Pix','Aprovação imediata'],['boleto','Boleto','Vencimento em 2 dias']].map(([id,titulo,descricao]) => (
                  <button type="button" key={id} className={pagamento === id ? styles.paymentActive : styles.payment} onClick={() => setPagamento(id)}><strong>{titulo}</strong><span>{descricao}</span></button>
                ))}
              </div>
              {pagamento === "cartao" && <div className={styles.grid}>
                <label className={styles.wide}>Nome impresso no cartão<input value={cartao.nome} onChange={alterar(setCartao, "nome")} /></label>
                <label className={styles.wide}>Número do cartão<input inputMode="numeric" maxLength="19" value={cartao.numero} onChange={alterar(setCartao, "numero")} placeholder="0000 0000 0000 0000" /></label>
                <label>Validade<input value={cartao.validade} onChange={alterar(setCartao, "validade")} placeholder="MM/AA" /></label>
                <label>CVV<input inputMode="numeric" maxLength="4" value={cartao.cvv} onChange={alterar(setCartao, "cvv")} /></label>
                <label>Parcelas<select value={parcelas} onChange={(e) => setParcelas(e.target.value)}>{Array.from({ length: 12 }, (_, index) => index + 1).map((numero) => <option key={numero} value={numero}>{numero}x de {formatarPrecoProduto(total / numero)}</option>)}</select></label>
              </div>}
              {pagamento === "pix" && <div className={styles.notice}>Ao confirmar, o QR Code Pix será gerado em uma janela segura. Desconto de 3% já aplicado.</div>}
              {pagamento === "boleto" && <div className={styles.notice}>O boleto será gerado após a confirmação e enviado ao seu e-mail.</div>}
            </section>
          </div>

          <aside className={styles.summaryCard}>
            <h2>Resumo do pedido</h2>
            <div className={styles.items}>{itens.map((item) => <div className={styles.item} key={`${item.categoria}-${item.id}`}><img src={item.imagem || "/imagens/produto.png"} alt="" /><div><strong>{item.nome}</strong><span>{item.cor ? `${item.cor} · ` : ""}{item.quantidade || 1} unidade(s)</span></div><b>{formatarPrecoProduto(converterPrecoParaNumero(item.preco) * Number(item.quantidade || 1))}</b></div>)}</div>
            <div className={styles.coupon}><label htmlFor="cupom">Cupom de desconto</label><div><input id="cupom" value={cupom} onChange={(e) => { setCupom(e.target.value); setMensagemCupom(""); if (cupomAplicado) setCupomAplicado(false); }} placeholder="Digite seu cupom" /><button type="button" onClick={aplicarCupom}>Aplicar</button></div>{mensagemCupom && <small className={cupomAplicado ? styles.couponSuccess : styles.couponError}>{mensagemCupom}</small>}</div>
            <div className={styles.totals}><p><span>Subtotal</span><strong>{formatarPrecoProduto(subtotal)}</strong></p><p><span>Frete</span><strong>{frete === 0 ? "Grátis" : formatarPrecoProduto(frete)}</strong></p>{descontoCupom > 0 && <p className={styles.discount}><span>Cupom (10%)</span><strong>− {formatarPrecoProduto(descontoCupom)}</strong></p>}{descontoPix > 0 && <p className={styles.discount}><span>Desconto Pix (3%)</span><strong>− {formatarPrecoProduto(descontoPix)}</strong></p>}<p className={styles.grandTotal}><span>Total</span><strong>{formatarPrecoProduto(total)}</strong></p></div>
            <label className={styles.terms}><input type="checkbox" checked={aceitou} onChange={(e) => setAceitou(e.target.checked)} /><span>Confirmo que os dados estão corretos e aceito os termos da compra.</span></label>
            {erro && <p className={styles.error} role="alert">{erro}</p>}
            <button className={styles.finish} type="submit" disabled={processando}>{processando ? "Processando pedido..." : `Confirmar • ${formatarPrecoProduto(total)}`}</button>
            <small className={styles.security}>Compra protegida e dados enviados com segurança.</small>
          </aside>
        </form>
      </main>
      {etapaPix && <div className={styles.pixOverlay} role="dialog" aria-modal="true" aria-label="Pagamento via Pix"><section className={styles.pixModal}>
        {etapaPix === "gerando" && <div className={styles.pixLoading}><span className={styles.loader}></span><h2>Gerando seu QR Code</h2><p>Estamos preparando um pagamento Pix seguro...</p><div className={styles.loadingBar}><span></span></div></div>}
        {etapaPix === "qrcode" && <><div className={styles.pixModalHeader}><span>PIX · PAGAMENTO SEGURO</span><h2>Escaneie o QR Code</h2><p>Abra o aplicativo do seu banco ou copie o código abaixo.</p></div><div className={styles.pixModalBody}><div className={styles.qrCode} aria-label="QR Code Pix ilustrativo"><svg viewBox="0 0 120 120" role="img"><rect width="120" height="120" fill="white"/><path d="M6 6h34v34H6zm7 7v20h20V13zM80 6h34v34H80zm7 7v20h20V13zM6 80h34v34H6zm7 7v20h20V87zM50 8h8v8h-8zm12 0h8v16h-8zM48 26h10v10H48zm17 4h8v14h-8zM48 48h12v8H48zm18 0h8v18h-8zm14 0h9v9h-9zm14 0h18v8H94zM50 62h8v17h-8zm12 10h16v8H62zm22-10h8v18h-8zm14 0h14v9H98zM47 87h10v10H47zm15-3h9v20h-9zm14 1h12v8H76zm16-5h20v9H92zm-14 20h9v14h-9zm14-4h8v8h-8zm12 10h10v8h-10z" fill="#111"/></svg></div><strong className={styles.pixValue}>{formatarPrecoProduto(total)}</strong><span className={styles.pixDiscount}>Você economizou {formatarPrecoProduto(descontoPix)} com o Pix</span><code className={styles.pixCode}>{codigoPix}</code><button type="button" className={styles.copyPix} onClick={copiarPixEConfirmar} disabled={processando}>{processando ? "Confirmando pagamento..." : "Copiar código Pix"}</button><button type="button" className={styles.closePix} onClick={() => setEtapaPix(null)} disabled={processando}>Voltar ao checkout</button><small>Ambiente ilustrativo: copiar o código confirma o pagamento.</small></div></>}
        {etapaPix === "confirmado" && <div className={styles.pixConfirmed}><span>✓</span><h2>Pedido confirmado!</h2><p>Pagamento Pix identificado com sucesso.</p><small>Você será direcionado para acompanhar o pedido.</small></div>}
      </section></div>}
    </div>
  );
}
