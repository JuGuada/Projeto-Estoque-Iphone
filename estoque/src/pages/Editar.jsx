import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/Editar.module.css';
import { useAuth } from '../contexts/authContext.jsx';
import { API_URL, resolverUrlArquivo } from '../services/api.js';

const CATEGORIAS = ['iPhone', 'AirPods', 'iPad', 'Mac'];

function resolverImagem(caminho) {
  return caminho ? resolverUrlArquivo(caminho) : '';
}

export default function Editar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagemPreview, setImagemPreview] = useState('');
  const inputImagemRef = useRef(null);
  const [dados, setDados] = useState({
    nome: '', categoria: 'iPhone', modelo: '', descricao: '', armazenamento: '',
    sku: '', codigoBarras: '', precoVenda: '', estoqueInicial: '', estoqueMinimo: '5', ativo: true,
  });

  useEffect(() => {
    let paginaAtiva = true;

    async function carregarProduto() {
      try {
        setCarregando(true);
        setErro('');
        const response = await fetch(`${API_URL}/itens/${id}`);
        const item = await response.json();
        if (!response.ok) throw new Error(item.erro || 'Produto nÃ£o encontrado.');
        if (!paginaAtiva) return;

        setDados({
          nome: item.nome || '',
          categoria: CATEGORIAS.includes(item.categoria) ? item.categoria : 'iPhone',
          modelo: item.modelo || '',
          descricao: item.descricao || '',
          armazenamento: item.armazenamento || '',
          sku: item.sku || '',
          codigoBarras: item.codigo_barras || item.codigoBarras || '',
          precoVenda: item.preco ?? '',
          estoqueInicial: item.quantidade ?? 0,
          estoqueMinimo: item.estoque_minimo ?? 5,
          ativo: item.ativo === undefined ? item.status !== 'IndisponÃ­vel' : Boolean(Number(item.ativo)),
        });
        setImagemPreview(resolverImagem(item.imagem));
      } catch (error) {
        if (paginaAtiva) setErro(error.message);
      } finally {
        if (paginaAtiva) setCarregando(false);
      }
    }

    carregarProduto();
    return () => { paginaAtiva = false; };
  }, [id]);

  function handleChange(campo) {
    return (event) => setDados((atual) => ({ ...atual, [campo]: event.target.value }));
  }

  function handleImagem(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      setErro('Selecione um arquivo de imagem vÃ¡lido.');
      return;
    }

    setImagemArquivo(arquivo);
    setImagemPreview(URL.createObjectURL(arquivo));
    setErro('');
  }

  async function handleSalvar(event) {
    event.preventDefault();
    setSalvando(true);
    setErro('');
    setSucesso('');

    try {
      const formData = new FormData();
      formData.append('nome', dados.nome);
      formData.append('categoria', dados.categoria);
      formData.append('modelo', dados.modelo);
      formData.append('descricao', dados.descricao);
      formData.append('armazenamento', dados.armazenamento);
      formData.append('sku', dados.sku);
      formData.append('codigoBarras', dados.codigoBarras);
      formData.append('preco', Number(dados.precoVenda || 0));
      formData.append('quantidade', Number(dados.estoqueInicial || 0));
      formData.append('estoqueMinimo', Number(dados.estoqueMinimo || 0));
      formData.append('ativo', String(dados.ativo));
      formData.append('status', dados.ativo ? 'DisponÃ­vel' : 'IndisponÃ­vel');
      formData.append('autor', usuario?.email || usuario?.nome || 'Administrador');
      if (imagemArquivo) formData.append('imagem', imagemArquivo);

      const response = await fetch(`${API_URL}/itens/${id}`, { method: 'PUT', body: formData });
      const item = await response.json();
      if (!response.ok) throw new Error(item.erro || 'Falha ao salvar produto.');

      setImagemArquivo(null);
      setImagemPreview(resolverImagem(item.imagem));
      setSucesso('AlteraÃ§Ãµes salvas com sucesso.');
      navigate('/estoque');
    } catch (error) {
      setErro(error.message);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) return <div className={styles.page}>Carregando produto...</div>;
  if (erro && !dados.nome) return <div className={styles.page}><p className={styles.erro}>{erro}</p></div>;

  return (
    <form className={styles.page} onSubmit={handleSalvar}>
      <header className={styles.introRow}>
        <div>
          <span className={styles.introLabel}>EdiÃ§Ã£o de produto</span>
          <h1 className={styles.introTitulo}>{dados.nome || 'Editar produto'}</h1>
        </div>
      </header>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>1. InformaÃ§Ãµes BÃ¡sicas</h2>
        <div className={styles.grid2}>
          <label>Nome do produto<input value={dados.nome} onChange={handleChange('nome')} required /></label>
          <label>Categoria<select value={dados.categoria} onChange={handleChange('categoria')}>{CATEGORIAS.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}</select></label>
        </div>
        <label>Modelo<input value={dados.modelo} onChange={handleChange('modelo')} /></label>
        <label className={styles.descricaoLabel}>DescriÃ§Ã£o<textarea value={dados.descricao} onChange={handleChange('descricao')} maxLength="500" /></label>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>2. EspecificaÃ§Ãµes</h2>
        <label>Armazenamento<input value={dados.armazenamento} onChange={handleChange('armazenamento')} /></label>
        <div className={styles.grid2}>
          <label>SKU<input value={dados.sku} onChange={handleChange('sku')} /></label>
          <label>CÃ³digo de barras<input value={dados.codigoBarras} onChange={handleChange('codigoBarras')} /></label>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>3. PreÃ§o e Estoque</h2>
        <div className={styles.grid2}>
          <label>PreÃ§o de venda (R$)<input type="number" step="0.01" min="0" value={dados.precoVenda} onChange={handleChange('precoVenda')} required /></label>
          <label>Estoque inicial<input type="number" min="0" value={dados.estoqueInicial} onChange={handleChange('estoqueInicial')} required /></label>
        </div>
        <label>Estoque mÃ­nimo<input type="number" min="0" value={dados.estoqueMinimo} onChange={handleChange('estoqueMinimo')} required /></label>
        <div className={styles.ativoBox}>
          <div><strong>Produto Ativo</strong><small>Ative para disponibilizar o produto no sistema.</small></div>
          <button type="button" className={`${styles.switch} ${dados.ativo ? styles.switchAtivo : ''}`} onClick={() => setDados((atual) => ({ ...atual, ativo: !atual.ativo }))} aria-pressed={dados.ativo}><span /></button>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.sectionTitle}>4. Imagem do Produto</h2>
        <div className={styles.uploadArea}>
          <input ref={inputImagemRef} className={styles.fileInput} type="file" accept="image/*" onChange={handleImagem} />
          <button type="button" className={styles.uploadBox} onClick={() => inputImagemRef.current?.click()}>
            <span className={styles.uploadIcone}>+</span>
            <strong>{imagemArquivo ? 'Nova imagem selecionada' : 'Trocar imagem principal'}</strong>
            <small>{imagemArquivo ? imagemArquivo.name : 'JPG, PNG ou WEBP â€¢ MÃ¡x. 5MB'}</small>
          </button>
          {imagemPreview && <img src={imagemPreview} alt={`PrÃ©-visualizaÃ§Ã£o de ${dados.nome}`} className={styles.previewImage} />}
        </div>
      </section>

      {erro && <p className={styles.erro}>{erro}</p>}
      {sucesso && <p className={styles.sucesso}>{sucesso}</p>}
      <div className={styles.botoes}>
        <button type="button" className={styles.cancelarBotao} onClick={() => navigate('/estoque')}>Cancelar</button>
        <button type="submit" className={styles.salvarBotao} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar alteraÃ§Ãµes'}</button>
      </div>
    </form>
  );
}

