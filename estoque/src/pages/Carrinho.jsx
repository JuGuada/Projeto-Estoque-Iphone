import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserHeader from "../components/UserHeader";
import styles from "../styles/carrinho.module.css";
import { converterPrecoParaNumero, formatarPrecoProduto } from "../utils/produto.js";

function converterPreco(valor) {
  return converterPrecoParaNumero(valor);
}

function formatarPreco(valor) {
  return formatarPrecoProduto(valor);
}

export default function Carrinho() {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState(() => {
    try {
      const itens = JSON.parse(localStorage.getItem("carrinho") || "[]");
      const produtosSalvos = JSON.parse(localStorage.getItem("produtos-personalizados") || "[]");
      if (!Array.isArray(itens)) return [];
      return itens.map((item) => {
        if (Array.isArray(item.cores) && item.cores.length) return item;
        const produtoSalvo = Array.isArray(produtosSalvos)
          ? produtosSalvos.find((produto) => Number(produto.id) === Number(item.id) && String(produto.categoria).toLowerCase() === String(item.categoria).toLowerCase())
          : null;
        return { ...item, cores: Array.isArray(produtoSalvo?.cores) ? produtoSalvo.cores : [] };
      });
    } catch {
      return [];
    }
  });

  const subtotal = useMemo(() => produtos.reduce(
    (totalAtual, item) => totalAtual + converterPreco(item.preco) * Number(item.quantidade || 1),
    0
  ), [produtos]);
  const total = subtotal;

  function salvarCarrinho(atualizados) {
    setProdutos(atualizados);
    localStorage.setItem("carrinho", JSON.stringify(atualizados));
    window.dispatchEvent(new Event("carrinhoAtualizado"));
  }

  function atualizarQuantidade(itemAtual, valor) {
    const novaQuantidade = Math.max(1, Number(valor));
    const atualizados = produtos.map((item) =>
      Number(item.id) === Number(itemAtual.id) && item.categoria === itemAtual.categoria
        ? { ...item, quantidade: novaQuantidade }
        : item
    );
    salvarCarrinho(atualizados);
  }

  function atualizarCor(itemAtual, corEscolhida) {
    const atualizados = produtos.map((item) =>
      Number(item.id) === Number(itemAtual.id) && item.categoria === itemAtual.categoria
        ? {
            ...item,
            cor: corEscolhida.nome,
            imagem: corEscolhida.imagem || item.imagem,
          }
        : item
    );
    salvarCarrinho(atualizados);
  }

  function removerProduto(itemAtual) {
    const atualizados = produtos.filter((item) => !(Number(item.id) === Number(itemAtual.id) && item.categoria === itemAtual.categoria));
    salvarCarrinho(atualizados);
  }

  function pagar() {
    if (produtos.length === 0) return;
    navigate("/finalizar-compra");
  }

  return (
    <div className={styles.page}>
      <UserHeader />
      <main className={styles.content}>
        <div className={styles.breadcrumb}><button type="button" onClick={() => navigate("/carrinho")}>Carrinho</button><span>/</span><strong>Resumo</strong></div>
        <header className={styles.heading}><h1>Seu carrinho</h1><p>Confira os produtos antes de finalizar sua compra.</p></header>

        {produtos.length > 0 ? (
          <section className={styles.cartCard}>
            {produtos.map((item) => (
              <div className={styles.productRow} key={`${item.categoria}-${item.id}`}>
                <div className={styles.productImage}><img src={item.imagem || "/imagens/produto.png"} alt={item.nome} /></div>
                <div className={styles.productInfo}>
                  <h2>{item.nome}</h2>
                  {Array.isArray(item.cores) && item.cores.length > 0 ? (
                    <div className={styles.colorSelector}>
                      <div className={styles.colorHeading}><span>Escolha a cor</span><strong>{item.cor || item.cores[0]?.nome}</strong></div>
                      <div className={styles.colorOptions} role="radiogroup" aria-label={`Cores disponíveis para ${item.nome}`}>
                        {item.cores.map((cor, indice) => {
                          const selecionada = (item.cor || item.cores[0]?.nome) === cor.nome;
                          return <button
                            type="button"
                            role="radio"
                            aria-checked={selecionada}
                            aria-label={cor.nome || `Cor ${indice + 1}`}
                            title={cor.nome || `Cor ${indice + 1}`}
                            className={`${styles.colorButton} ${selecionada ? styles.colorButtonSelected : ""}`}
                            key={cor.id || `${cor.nome}-${indice}`}
                            onClick={() => atualizarCor(item, cor)}
                          ><span style={{ backgroundColor: cor.cor || "#d9d9de" }} /></button>;
                        })}
                      </div>
                    </div>
                  ) : <p>{item.cor || item.modelo || "Produto"}</p>}
                  <label className={styles.quantityField}>Quantidade<select aria-label={`Quantidade de ${item.nome}`} value={item.quantidade || 1} onChange={(event) => atualizarQuantidade(item, event.target.value)}>{[1, 2, 3, 4, 5].map((valor) => <option key={valor} value={valor}>{valor}</option>)}</select></label>
                </div>
                <strong className={styles.productPrice}>{formatarPreco(item.preco)}</strong>
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removerProduto(item)}
                  aria-label={`Remover ${item.nome} do carrinho`}
                >
                  Remover produto
                </button>
              </div>
            ))}
            <div className={styles.shipping}><span className={styles.shippingIcon}>▣</span><strong>Em estoque, pronto para envio</strong></div>
            <div className={styles.summary}><p><span>Subtotal</span><strong>{formatarPreco(subtotal)}</strong></p><p><span>Envio</span><strong className={styles.free}>Grátis</strong></p></div>
            <div className={styles.total}><div><h2>Total</h2><p>Pagamento em até 12 vezes no cartão</p><span>Ou 3% de desconto pagando com Pix</span></div><strong>{formatarPreco(total)}</strong></div>
            <button type="button" className={styles.payButton} onClick={pagar}>Finalizar compra</button>
          </section>
        ) : (
          <section className={styles.empty}><h2>Seu carrinho está vazio</h2><button type="button" onClick={() => navigate("/")}>Explorar produtos</button></section>
        )}
      </main>
    </div>
  );
}
