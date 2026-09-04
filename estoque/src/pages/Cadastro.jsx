import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Cadastro.module.css';

import {
  FiDatabase,
  FiPackage,
} from 'react-icons/fi';

import backgroundCadastro from '/imagens/background-cadastro.png';
import { apiRequest } from '../services/api.js';
import { useAuth } from '../contexts/authContext.jsx';

export default function Cadastro({
  refreshData = async () => {},
  setCadastroMessage = () => {}
}) {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [cadastroData, setCadastroData] = useState({
    nome: '',
    modelo: '',
    descricao: '',
    categoria: 'iPhone',
    armazenamento: '',
    sku: '',
    codigoBarras: '',
    precoVenda: '',
    estoqueInicial: '',
    estoqueMinimo: '5',
    ativo: true,
    imagem: ''
  });
  const [imagemPreview, setImagemPreview] = useState('');
  const categoriasDisponiveis = ['iPhone', 'AirPods', 'iPad', 'Mac'];

  const handleChange = (field) => (event) => {
    setCadastroData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {

      const formData = new FormData();
      Object.entries({
        ...cadastroData,
        precoVenda: Number(cadastroData.precoVenda),
        estoqueInicial: Number(cadastroData.estoqueInicial),
        estoqueMinimo: Number(cadastroData.estoqueMinimo)
      }).forEach(([campo, valor]) => {
        if (campo !== 'imagem' && valor !== '') {
          formData.append(campo, valor);
        }
      });
      if (cadastroData.imagem instanceof File) {
        formData.append('imagem', cadastroData.imagem);
      }
      formData.append('autor', usuario?.email || usuario?.nome || 'Administrador');

      const data = await apiRequest('/itens', {
        method: 'POST',
        body: formData
      });

      const produtosPersonalizados = JSON.parse(
        localStorage.getItem('produtos-personalizados') || '[]'
      );
      localStorage.setItem(
        'produtos-personalizados',
        JSON.stringify([
          ...produtosPersonalizados.filter((produto) => Number(produto.id) !== Number(data.id)),
          data
        ])
      );


      setCadastroMessage(
        `Produto ${data.nome} cadastrado com sucesso.`
      );


      setCadastroData({
        nome: '',
        modelo: '',
        descricao: '',
        categoria: 'iPhone',
        armazenamento: '',
        sku: '',
        codigoBarras: '',
        precoVenda: '',
        estoqueInicial: '',
        estoqueMinimo: '5',
        ativo: true,
        imagem: ''
      });
      setImagemPreview('');


      await refreshData();
      navigate('/estoque');


    } catch (error) {

      setCadastroMessage(error.message);

    }
  };

  /* =========================================
     CANCELAR
  ========================================= */

  const handleCancel = () => {

    setCadastroData({
      nome: '',
      modelo: '',
      descricao: '',
      categoria: 'iPhone',
      armazenamento: '',
      sku: '',
      codigoBarras: '',
      precoVenda: '',
      estoqueInicial: '',
      estoqueMinimo: '5',
      ativo: true,
      imagem: ''
    });
    setImagemPreview('');

  };


  return (

    <div className={styles.page}>


      {/* =========================================
          HERO
      ========================================= */}

      <section className={styles.heroEstoque}>

        <div className={styles.heroConteudo}>

          <h1>
            Cadastre com precisão.
          </h1>


          <h2>
            Organize seu estoque com eficiência.
          </h2>


          <p>
            Mantenha as informações dos seus produtos
            <br />
            sempre atualizadas e padronizadas.
          </p>


          <div className={styles.heroCards}>


            {/* CARD 1 */}

            <div className={styles.heroCard}>

              <FiDatabase
                className={styles.heroIcon}
              />

              <div>

                <strong>
                  Dados organizados
                </strong>

                <small>
                  Mais controle
                </small>

              </div>

            </div>



            {/* CARD 2 */}

            <div className={styles.heroCard}>

              <FiPackage
                className={styles.heroIcon}
              />

              <div>

                <strong>
                  Estoque otimizado
                </strong>

                <small>
                  Mais precisão
                </small>

              </div>

            </div>



            {/* CARD 3 */}

            <div className={styles.heroCard}>

              <img
                src="/imagens/raio.png"
                alt=""
                className={styles.heroIcon}
              />

              <div>

                <strong>
                  Cadastro rápido
                </strong>

                <small>
                  Mais eficiência
                </small>

              </div>

            </div>


          </div>

        </div>


        {/* =========================================
            IPHONE
        ========================================= */}

        <img
          src={backgroundCadastro}
          alt="iPhone"
          className={styles.iphone}
        />

      </section>



      {/* =========================================
          TÍTULO
      ========================================= */}

      <h1 className={styles.title}>
        Cadastro de Produto
      </h1>



      {/* =========================================
          FORMULÁRIO
      ========================================= */}

      <form
        onSubmit={handleSubmit}
        className={styles.form}
      >



        {/* =========================================
            SEÇÃO 1
        ========================================= */}

        <div className={styles.card}>

          <h2 className={styles.sectionTitle}>
            1. Informações Básicas
          </h2>


          <div className={styles.grid2}>


            {/* NOME */}

            <label>

              Nome do produto

              <input
                type="text"
                value={cadastroData.nome}
                onChange={handleChange('nome')}
                placeholder="Ex: iPhone 15 Pro Max"
                required
              />

            </label>



            {/* CATEGORIA */}

            <label>

              Categoria

              <select
                value={cadastroData.categoria}
                onChange={handleChange('categoria')}
              >

                {categoriasDisponiveis.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}

              </select>

            </label>


          </div>



          {/* MODELO */}

          <label>

            Modelo

            <input
              type="text"
              value={cadastroData.modelo}
              onChange={handleChange('modelo')}
              placeholder="Ex: iPhone 15 Pro Max"
            />

          </label>



          {/* DESCRIÇÃO */}

          <label>

            Descrição

            <textarea
              value={cadastroData.descricao}
              onChange={handleChange('descricao')}
              maxLength={500}
              placeholder="Descreva as principais características do produto."
            />

            <span className={styles.charCount}>
              {cadastroData.descricao.length}/500
            </span>

          </label>


        </div>



        {/* =========================================
            SEÇÃO 2
        ========================================= */}

        <div className={styles.card}>

          <h2 className={styles.sectionTitle}>
            2. Especificações
          </h2>



          {/* ARMAZENAMENTO / COR */}

          <div className={styles.grid2}>

            <label>

              Armazenamento

              <input
                type="text"
                value={cadastroData.armazenamento}
                onChange={handleChange('armazenamento')}
              />

            </label>


          </div>



          {/* SKU / CÓDIGO DE BARRAS */}

          <div className={styles.grid2}>

            <label>

              SKU

              <input
                type="text"
                value={cadastroData.sku}
                onChange={handleChange('sku')}
              />

            </label>


            <label>

              Código de barras

              <input
                type="text"
                value={cadastroData.codigoBarras}
                onChange={handleChange('codigoBarras')}
              />

            </label>

          </div>



        </div>



        {/* =========================================
            SEÇÃO 3
        ========================================= */}

        <div className={styles.card}>

          <h2 className={styles.sectionTitle}>
            3. Preço e Estoque
          </h2>



          <div className={styles.grid2}>


            <label>

              Preço de venda (R$)

              <input
                type="number"
                step="0.01"
                value={cadastroData.precoVenda}
                onChange={handleChange('precoVenda')}
              />

            </label>


          </div>



          {/* ESTOQUE */}

          <div className={styles.grid3}>


            <label>

              Estoque inicial

              <input
                type="number"
                value={cadastroData.estoqueInicial}
                onChange={handleChange('estoqueInicial')}
              />

            </label>



            <label>

              Estoque mínimo

              <input
                type="number"
                value={cadastroData.estoqueMinimo}
                onChange={handleChange('estoqueMinimo')}
              />

            </label>


          </div>



          {/* PRODUTO ATIVO */}

          <div className={styles.ativoBox}>

            <div className={styles.ativoInfo}>

              <strong>
                Produto Ativo
              </strong>

              <small>
                Ative para disponibilizar o produto no sistema.
              </small>

            </div>


            <button
              type="button"
              className={`${styles.switch} ${
                cadastroData.ativo
                  ? styles.switchAtivo
                  : ""
              }`}
              onClick={() =>
                setCadastroData(prev => ({
                  ...prev,
                  ativo: !prev.ativo
                }))
              }
            >

              <span className={styles.bolinha}></span>

            </button>

          </div>


        </div>



        {/* =========================================
            SEÇÃO 4
        ========================================= */}

        <div className={styles.card}>

          <h2 className={styles.sectionTitle}>
            4. Imagens do Produto
          </h2>



          <div className={styles.uploadArea}>


            {/* UPLOAD */}

            <label className={styles.uploadBox}>

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {

                  const file = e.target.files?.[0];


                  if (file) {

                    setCadastroData(prev => ({
                      ...prev,
                      imagem: file
                    }));
                    setImagemPreview(URL.createObjectURL(file));

                  }

                }}
              />


              <div className={styles.uploadContent}>

                <span className={styles.plus}>
                  +
                </span>


                <p>
                  Imagem Principal
                </p>


                <small>
                  JPG, PNG, WEBP • Máx. 5MB
                </small>

              </div>

            </label>



            {/* PRÉ-VISUALIZAÇÃO */}

            {imagemPreview && (

              <img
                src={imagemPreview}
                alt="Pré-visualização"
                className={styles.previewImage}
              />

            )}


          </div>

        </div>



        {/* =========================================
            BOTÕES
        ========================================= */}

        <div className={styles.formButtons}>


          {/* CANCELAR */}

          <button
            type="button"
            className={styles.cancelButton}
            onClick={handleCancel}
          >
            Cancelar
          </button>



          {/* SALVAR E NOVO */}

          <button
            type="submit"
            className={styles.saveNewButton}
          >
            Salvar e novo
          </button>



          {/* SALVAR PRODUTO */}

          <button
            type="submit"
            className={styles.saveButton}
          >
            Salvar Produto
          </button>


        </div>


      </form>

    </div>

  );
}
