import { useEffect, useState } from 'react';
import styles from '../styles/RegrasNegocio.module.css';
import { apiRequest } from '../services/api.js';

export default function RegrasNegocio() {
  const [produtosEstoque, setProdutosEstoque] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    async function carregarEstoque() {
      try {
        const dados = await apiRequest('/itens');
        const produtos = Array.isArray(dados) ? dados : [];
        setProdutosEstoque(produtos.map((produto) => ({
          id: produto.id,
          nome: produto.nome || 'Produto sem nome',
          quantidade: Number(produto.quantidade || 0),
          minimo: Number(produto.estoque_minimo || 0),
        })).filter((produto) => produto.quantidade <= produto.minimo));
      } catch (error) {
        setMensagem(error.message);
      } finally {
        setCarregando(false);
      }
    }

    carregarEstoque();
  }, []);

  return (
    <div className={styles.fadeContainer}>
      <p className={styles.smallSectionTitle}>ALERTA DE ESTOQUE</p>

      <div className={styles.cardNoPadding}>
        <div className={styles.regrasHeaderItem}>
          <div className={styles.regrasInfoGroup}>
            <div className={`${styles.iconBox} ${styles.iconOrange}`}>
              <img src="/imagens/alerta.png" alt="" className={styles.cardIcon} />
            </div>
            <div>
              <p className={styles.ruleTitle}>Produtos com estoque baixo</p>
              <p className={styles.ruleDesc}>Acompanhamento em tempo real conforme o estoque mínimo de cada produto.</p>
            </div>
          </div>
          {!carregando && <span className={styles.alertCount}>{produtosEstoque.length}</span>}
        </div>

        <div className={styles.produtosEstoqueList}>
          {carregando && <p className={styles.emptyState}>Carregando estoque...</p>}
          {!carregando && mensagem && <p className={styles.emptyState} role="alert">{mensagem}</p>}
          {!carregando && !mensagem && produtosEstoque.length === 0 && (
            <p className={styles.emptyState}>Nenhum produto precisa de reposição no momento.</p>
          )}
          {!carregando && !mensagem && produtosEstoque.map((produto) => (
            <div key={produto.id} className={`${styles.produtoEstoqueItem} ${styles.itemCritico}`}>
              <span>{produto.nome}</span>
              <span className={styles.quantidadeTag}>{produto.quantidade} un · mínimo: {produto.minimo}</span>
            </div>
          ))}
        </div>
      </div>
      <p className={styles.helperText}>
        Os alertas usam o estoque mínimo definido no cadastro de cada produto.
      </p>
    </div>
  );
}
