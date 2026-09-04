import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";

import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import styles from "../styles/iphone.module.css";
import { formatarPrecoProduto } from "../utils/produto.js";
import { API_URL } from "../services/api.js";

const urlMidia = (caminho) => caminho?.startsWith('/uploads/') ? `${API_URL}${caminho}` : caminho;
const urlVideo = (caminho = "") => {
  const valor = String(caminho).trim().replace(/\\/g, "/");
  if (!valor) return "";
  if (/^(https?:|blob:|data:)/i.test(valor) || valor.startsWith("/uploads/")) return urlMidia(valor);
  const semPublic = valor.replace(/^\.?\/?public\//i, "").replace(/^\//, "");
  return semPublic.startsWith("videos/") ? `/${semPublic}` : `/videos/${semPublic}`;
};


/* =========================================================
   FALLBACK

   Esse produto aparece caso ainda nÃ£o exista
   produto salvo no localStorage.

   Depois podemos trocar por fetch da API.
========================================================= */

export const iphoneFallback = {
  id: 1,

  nome: "iPhone 17",

  modelo: "iPhone 17",

  categoria: "iphone",

  preco: "R$ 7.999",

  cor: "#8c6fc7",

  video: "/videos/apple.mp4",

  descricao:
    "Um novo iPhone pensado para oferecer desempenho, cÃ¢meras incrÃ­veis e um design ainda mais resistente.",

  detalhes: {
    titulo: "Ainda mais durÃ¡vel.",
    subtitulo: "Ainda mais adorÃ¡vel.",
  },

  cores: [
    {
      id: "lavanda",
      nome: "Lavanda",
      cor: "#dfcfef",
      imagem: "/imagens/iphone-lavanda.jpg",
    },
    {
      id: "verde",
      nome: "Verde",
      cor: "#a7b58b",
      imagem: "/imagens/iphone-verde.jpg",
    },
    {
      id: "azul",
      nome: "Azul",
      cor: "#8ca9cf",
      imagem: "/imagens/iphone-azul.jpg",
    },
    {
      id: "branco",
      nome: "Branco",
      cor: "#eeeeee",
      imagem: "/imagens/iphone-branco.jpg",
    },
    {
      id: "preto",
      nome: "Preto",
      cor: "#333333",
      imagem: "/imagens/iphone-preto.jpg",
    },
  ],

  informacoes: [
    {
      id: 1,
      nome: "Nome do Produto",
      valor: "iPhone 17",
    },
    {
      id: 2,
      nome: "Modelo",
      valor: "iPhone 17",
    },
    {
      id: 3,
      nome: "Armazenamento",
      valor: "256 GB",
    },
    {
      id: 4,
      nome: "MemÃ³ria RAM",
      valor: "8 GB",
    },
  ],

  destaques: [
    {
      id: 1,
      label: "iPhone",
      titulo: "Ainda mais durÃ¡vel.",
      texto:
        "Um design resistente e elegante para acompanhar vocÃª em todos os momentos.",
      imagem: "/imagens/primeira.png",
    },
    {
      id: 2,
      label: "iPhone",
      titulo: "Ainda mais adorÃ¡vel.",
      texto:
        "Detalhes cuidadosamente desenvolvidos para deixar o iPhone ainda mais bonito.",
      imagem: "/imagens/segunda.png",
    },
  ],

  camera: {
    label: "CÃ¢meras.",

    titulo: "CÃ¢mera frontal",

    subtitulo:
      "Center Stage de 18 MP. Uma grande virada.",

    texto:
      "A nova cÃ¢mera frontal traz mais flexibilidade para enquadrar fotos e vÃ­deos. Toque para ampliar o campo de visÃ£o e mudar da vertical para a horizontal sem girar o iPhone.",

    tabs: [
      {
        id: 1,
        label: "VisÃ£o geral",
        titulo: "Uma cÃ¢mera feita para vocÃª.",
        texto:
          "Capture seus melhores momentos com mais detalhes, qualidade e flexibilidade.",
        imagem: "/imagens/camera1.png",
      },
      {
        id: 2,
        label: "Enquadramento",
        titulo: "Enquadre do seu jeito.",
        texto:
          "Tenha mais liberdade para escolher o enquadramento ideal para suas fotos.",
        imagem: "/imagens/camera2.png",
      },
      {
        id: 3,
        label: "VÃ­deo",
        titulo: "VÃ­deos ainda mais incrÃ­veis.",
        texto:
          "Registre seus momentos com movimento suave e qualidade impressionante.",
        imagem: "/imagens/camera3.png",
      },
    ],
  },
};


/* =========================================================
   NORMALIZA O PRODUTO

   Serve para garantir que a pÃ¡gina continue funcionando
   mesmo se algum campo nÃ£o estiver salvo ainda.
========================================================= */

function normalizarProduto(produto) {
  const ehProdutoModelo = Number(produto?.id) === Number(iphoneFallback.id)
    && `${produto?.nome || ""} ${produto?.modelo || ""}`.toLowerCase().includes("iphone 17");

  if (ehProdutoModelo) {
    return {
      ...iphoneFallback,
      ...produto,
      categoria: produto?.categoria || "iphone",
      detalhes: { ...iphoneFallback.detalhes, ...(produto?.detalhes || {}) },
      cores: Array.isArray(produto?.cores) ? produto.cores : iphoneFallback.cores,
      informacoes: Array.isArray(produto?.informacoes) ? produto.informacoes : iphoneFallback.informacoes,
      destaques: Array.isArray(produto?.destaques) ? produto.destaques : iphoneFallback.destaques,
      camera: {
        ...iphoneFallback.camera,
        ...(produto?.camera || {}),
        tabs: Array.isArray(produto?.camera?.tabs) ? produto.camera.tabs : iphoneFallback.camera.tabs,
      },
    };
  }

  return {
    ...produto,
    nome: produto?.nome || "",
    modelo: produto?.modelo || "",
    descricao: produto?.descricao || "",
    preco: produto?.preco || "",
    cor: produto?.cor || "#d9d9de",
    video: produto?.video || "",
    categoria: produto?.categoria || "iphone",
    detalhes: {
      ...(produto?.detalhes || {}),
      titulo: produto?.detalhes?.titulo || iphoneFallback.detalhes.titulo,
      subtitulo: produto?.detalhes?.subtitulo || iphoneFallback.detalhes.subtitulo,
    },
    cores: Array.isArray(produto?.cores) ? produto.cores : [],
    informacoes: Array.isArray(produto?.informacoes) ? produto.informacoes : [],
    destaques: Array.isArray(produto?.destaques) ? produto.destaques : [],
    camera: {
      label: iphoneFallback.camera.label || "CÃ¢meras.",
      texto: "", imagem: "", tabs: [],
      ...(produto?.camera || {}),
      titulo: produto?.camera?.titulo || iphoneFallback.camera.titulo,
      subtitulo: produto?.camera?.subtitulo || iphoneFallback.camera.subtitulo,
      tabs: Array.isArray(produto?.camera?.tabs) ? produto.camera.tabs : [],
    },
  };
}


/* =========================================================
   PÃGINA
========================================================= */

export default function ProdutoIphone() {

  const { id } = useParams();

  const navigate = useNavigate();
  const emPreview = window.self !== window.top;


  const [produto, setProduto] =
    useState(null);


  const [corSelecionada, setCorSelecionada] =
    useState(0);


  const [infoAberta, setInfoAberta] =
    useState(null);


  const [cameraSelecionada, setCameraSelecionada] =
    useState(0);

  const [destaqueIndex, setDestaqueIndex] =
    useState(0);


  const [mostrarCompra, setMostrarCompra] =
    useState(false);


  /* =========================================================
     BUSCA PRODUTO SALVO PELO ADMIN
  ========================================================= */

  useEffect(() => {

    try {

      const produtosSalvos =
        localStorage.getItem(
          "produtos-personalizados"
        );


      if (!produtosSalvos) {

        setProduto(
          normalizarProduto(
            iphoneFallback
          )
        );

        return;
      }


      const produtos =
        JSON.parse(produtosSalvos);


      const idNumerico =
        Number(id);


      const encontrado =
        produtos.find(
          (item) => {
            const categoria = item.categoria
              ?.toString()
              .toLowerCase();

            return (
              Number(item.id) === idNumerico &&
              categoria === "iphone"
            );
          }
        );


      if (encontrado) {

        setProduto(
          normalizarProduto(
            encontrado
          )
        );

      } else {

        setProduto(
          normalizarProduto(
            iphoneFallback
          )
        );

      }

    } catch (error) {

      console.error(
        "Erro ao carregar produto:",
        error
      );


      setProduto(
        normalizarProduto(
          iphoneFallback
        )
      );

    }

  }, [id]);


  /* =========================================================
     REINICIA INTERAÃ‡Ã•ES
  ========================================================= */

  useEffect(() => {

    setCorSelecionada(0);

    setCameraSelecionada(0);

    setInfoAberta(null);

    setDestaqueIndex(0);

  }, [produto?.id]);


  /* =========================================================
     COR ATUAL
  ========================================================= */

  const corAtual =
    useMemo(() => {

      if (!produto) {
        return null;
      }

      return (
        produto.cores[
          corSelecionada
        ] ||
        produto.cores[0]
      );

    }, [
      produto,
      corSelecionada
    ]);

  const informacaoAtual = useMemo(() => produto?.informacoes?.find((item) => item.id === infoAberta), [produto, infoAberta]);
  const imagemDesignAtual = informacaoAtual?.imagem || corAtual?.imagem;


  /* =========================================================
     CÃ‚MERA ATUAL
  ========================================================= */

  const cameraAtual =
    useMemo(() => {

      if (!produto) {
        return null;
      }

      return (
        produto.camera.tabs[
          cameraSelecionada
        ] ||
        produto.camera.tabs[0]
      );

    }, [
      produto,
      cameraSelecionada
    ]);


  /* =========================================================
     DESTAQUES
  ========================================================= */

  const maxDestaqueIndex =
    Math.max(
      0,
      produto?.destaques?.length - 1
    );


  function destaqueAnterior() {

    setDestaqueIndex(
      (atual) =>
        Math.max(
          0,
          atual - 1
        )
    );

  }


  function destaqueProximo() {

    setDestaqueIndex(
      (atual) =>
        Math.min(
          maxDestaqueIndex,
          atual + 1
        )
    );

  }


  /* =========================================================
     BARRA DE COMPRA

     Aparece somente depois que o hero sai da tela.
  ========================================================= */

  useEffect(() => {

    function controlarBarra() {

      const hero =
        document.querySelector(
          `.${styles.hero}`
        );

      if (!hero) {
        return;
      }

      const heroBottom =
        hero
          .getBoundingClientRect()
          .bottom;

      setMostrarCompra(
        heroBottom <= 0
      );

    }

    controlarBarra();

    window.addEventListener(
      "scroll",
      controlarBarra,
      {
        passive: true
      }
    );

    window.addEventListener(
      "resize",
      controlarBarra
    );

    return () => {

      window.removeEventListener(
        "scroll",
        controlarBarra
      );

      window.removeEventListener(
        "resize",
        controlarBarra
      );

    };

  }, []);


  /* =========================================================
     CARRINHO
  ========================================================= */

  function adicionarAoCarrinho() {

    try {

      const carrinho =
        JSON.parse(
          localStorage.getItem(
            "carrinho"
          ) || "[]"
        );

      const existente =
        carrinho.find(
          (item) =>
            Number(item.id) ===
              Number(produto.id) &&
            item.categoria ===
              "iphone"
        );

      let novoCarrinho;

      if (existente) {

        novoCarrinho =
          carrinho.map(
            (item) => {

              const igual =
                Number(item.id) ===
                  Number(produto.id) &&
                item.categoria ===
                  "iphone";

              if (!igual) {
                return item;
              }

              return {
                ...item,

                quantidade:
                  (
                    item.quantidade ||
                    1
                  ) + 1,
              };

            }
          );

      } else {

        novoCarrinho = [
          ...carrinho,
          {
            id:
              produto.id,

            nome:
              produto.nome,

            modelo:
              produto.modelo,

            preco:
              produto.preco,

            categoria:
              "iphone",

            quantidade:
              1,

            cor:
              corAtual?.nome,

            cores:
              produto.cores || [],

            imagem:
              corAtual?.imagem,
          },
        ];

      }

      localStorage.setItem(
        "carrinho",
        JSON.stringify(
          novoCarrinho
        )
      );
      window.dispatchEvent(new Event("carrinhoAtualizado"));

    } catch (error) {

      console.error(
        "Erro ao adicionar iPhone:",
        error
      );

    }

  }


  function comprarAgora() {

    adicionarAoCarrinho();

    navigate(
      "/finalizar-compra"
    );

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (!produto) {

    return (
      <div className={styles.loading}>
        Carregando produto...
      </div>
    );

  }


  return (

    <div className={styles.page}>

      {!emPreview && <UserHeader />}

      {!emPreview && (
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate('/')}
          aria-label="Voltar para a Home"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          <span>Voltar</span>
        </button>
      )}


      {/* =====================================================
          SUBMENU DO PRODUTO
      ===================================================== */}

    


      <main>


        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          id="visao-geral"
          className={styles.hero}
        >

          <div className={styles.heroVideo}>

            {produto.video ? <video
              src={urlVideo(produto.video)}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            /> : <div className={styles.emptyMedia}>Adicione o vÃ­deo principal deste produto</div>}

          </div>

        </section>

        <section className={styles.productIntro}>
          <div>
            <span>{produto.modelo}</span>
            <h1>{produto.nome}</h1>
            <p>{produto.descricao}</p>
          </div>
          <strong>{formatarPrecoProduto(produto.preco)}</strong>
        </section>


        {/* =====================================================
            DESTAQUES
        ===================================================== */}

        <section
          id="destaques"
          className={styles.highlights}
        >

          <div className={styles.highlightsContainer}>

            <div className={styles.highlightsTop}>

              <div>

                <span>
                  DESTAQUES
                </span>

                <h2>
                  {produto.textosVitrine?.destaquesTitulo || "Comece pelos destaques."}
                </h2>

              </div>


              <div className={styles.carouselButtons}>

                <button
                  type="button"
                  onClick={destaqueAnterior}
                  disabled={destaqueIndex === 0}
                  aria-label="Destaque anterior"
                >
                  â€¹
                </button>

                <button
                  type="button"
                  onClick={destaqueProximo}
                  disabled={
                    destaqueIndex >=
                    maxDestaqueIndex
                  }
                  aria-label="PrÃ³ximo destaque"
                >
                  â€º
                </button>

              </div>

            </div>


            <div className={styles.carouselViewport}>

              <div
                className={styles.highlightTrack}
                style={{
                  transform:
                    `translateX(calc(-${destaqueIndex} * (66vw + 18px)))`
                }}
              >

                {produto.destaques.map(
                  (destaque) => (

                    <article
                      key={destaque.id}
                      className={styles.highlightCard}
                    >

                      <img
                        src={urlMidia(destaque.imagem)}
                        alt={destaque.titulo}
                      />

                      <div className={styles.highlightCopy}>

                        <span>
                          {destaque.label || "iPhone"}
                        </span>

                        <h3>
                          {destaque.titulo}
                        </h3>

                        <p>
                          {destaque.texto}
                        </p>

                      </div>

                    </article>

                  )
                )}

              </div>

            </div>


            <div className={styles.carouselDots}>

              {produto.destaques.map(
                (destaque, index) => (

                  <button
                    key={destaque.id}
                    type="button"
                    aria-label={`Ir para destaque ${index + 1}`}
                    className={
                      destaqueIndex === index
                        ? styles.carouselDotActive
                        : ""
                    }
                    onClick={() =>
                      setDestaqueIndex(index)
                    }
                  />

                )
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            DESIGN
        ===================================================== */}

        <section
          id="design"
          className={styles.design}
        >

          <div className={styles.designContainer}>

            <div className={styles.designIntro}>



              <h2>
                {produto.detalhes.titulo}
              </h2>


              <h3>
                {produto.detalhes.subtitulo}
              </h3>


              <p>
                {produto.descricao}
              </p>

            </div>


            {/* ===============================================
                CARD DE CONFIGURAÃ‡ÃƒO
            =============================================== */}

            <div
              className={styles.designCard}
            >

              {/* MENU ESQUERDO */}

              <div
                className={
                  styles.designOptions
                }
              >

                {/* CORES */}

                <div
                  className={
                    styles.colorOption
                  }
                >

                  <div
                    className={
                      styles.colorLabel
                    }
                  >

                    <span
                      className={
                        styles.colorPreview
                      }
                      style={{
                        background:
                          corAtual?.cor,
                      }}
                    />

                    <strong>
                      Cores
                    </strong>

                  </div>


                  <div
                    className={
                      styles.colorsList
                    }
                  >

                    {produto.cores.map(
                      (cor, index) => (

                        <button
                          key={cor.id}
                          type="button"
                          aria-label={
                            cor.nome
                          }
                          title={cor.nome}
                          className={`
                            ${styles.colorButton}
                            ${
                              index ===
                              corSelecionada
                                ? styles.colorButtonActive
                                : ""
                            }
                          `}
                          style={{
                            backgroundColor:
                              cor.cor,
                          }}
                          onClick={() =>
                            setCorSelecionada(
                              index
                            )
                          }
                        />

                      )
                    )}

                  </div>

                </div>


                {/* INFORMAÃ‡Ã•ES */}

                {produto.informacoes.map(
                  (informacao) => (

                    <div
                      key={informacao.id}
                      className={
                        styles.infoWrapper
                      }
                    >

                      <button
                        type="button"
                        className={
                          styles.infoButton
                        }
                        onClick={() =>
                          setInfoAberta(
                            (atual) =>
                              atual ===
                              informacao.id
                                ? null
                                : informacao.id
                          )
                        }
                      >

                        <span
                          className={
                            styles.infoPlus
                          }
                        >
                          {infoAberta ===
                          informacao.id
                            ? "âˆ’"
                            : "+"}
                        </span>


                        <span>
                          {informacao.nome}
                        </span>

                      </button>


                      {infoAberta ===
                        informacao.id && (

                        <div
                          className={
                            styles.infoValue
                          }
                        >
                          {informacao.valor}
                        </div>

                      )}

                    </div>

                  )
                )}

              </div>


              {/* IMAGEM */}

              <div
                className={
                  styles.designProduct
                }
              >

                {imagemDesignAtual && (

                  <img
                    src={urlMidia(imagemDesignAtual)}
                    alt={informacaoAtual?.nome || `${produto.nome} ${corAtual?.nome || ""}`}
                  />

                )}

              </div>

            </div>

          </div>

        </section>





        {/* =====================================================
            CÃ‚MERAS
        ===================================================== */}

        <section
          id="cameras"
          className={styles.camera}
        >

          <div
            className={
              styles.cameraContainer
            }
          >

            {/* CABEÃ‡ALHO */}

            <div
              className={
                styles.cameraHeader
              }
            >

              <span>
                {produto.camera.label ||
                  "CÃ¢meras."}
              </span>


              <h2>

                {produto.camera.titulo}

                <br />

                <strong>
                  {
                    produto.camera
                      .subtitulo
                  }
                </strong>

              </h2>


              <p>
                {produto.camera.texto}
              </p>

            </div>


            {/* IMAGEM */}

            <div
              className={
                styles.cameraVisual
              }
            >

              {cameraAtual && (

                <img
                  src={
                    urlMidia(cameraAtual.imagem)
                  }
                  alt={
                    cameraAtual.titulo
                  }
                />

              )}

            </div>


            {/* TABS */}

            <div
              className={
                styles.cameraTabs
              }
            >

              {produto.camera.tabs.map(
                (tab, index) => (

                  <button
                    key={tab.id}
                    type="button"
                    className={
                      cameraSelecionada ===
                      index
                        ? styles.cameraTabActive
                        : ""
                    }
                    onClick={() =>
                      setCameraSelecionada(
                        index
                      )
                    }
                  >
                    {tab.label}
                  </button>

                )
              )}

            </div>


            {/* TEXTO */}

            {cameraAtual && (

              <div
                className={
                  styles.cameraDescription
                }
              >

                <span>
                  {String(
                    cameraSelecionada + 1
                  ).padStart(2, "0")}
                </span>


                <h3>
                  {cameraAtual.titulo}
                </h3>


                <p>
                  {cameraAtual.texto}
                </p>

              </div>

            )}

          </div>

        </section>




      </main>


      {/* =====================================================
          RODAPÃ‰ FIXO DE COMPRA
      ===================================================== */}

      <div
        className={`
          ${styles.buyBar}

          ${
            mostrarCompra
              ? styles.buyBarVisible
              : ""
          }
        `}
      >

        <div className={styles.buyBarContainer}>

          <div className={styles.buyBarInfo}>

            <strong>
              {produto.nome}
            </strong>

            <span>
              {corAtual?.nome}
            </span>

          </div>


          <div className={styles.buyBarActions}>

            <span className={styles.buyBarPrice}>
              {formatarPrecoProduto(produto.preco)}
            </span>


            <button
              type="button"
              className={styles.addCartButton}
              onClick={() => { adicionarAoCarrinho(); navigate("/carrinho"); }}
            >
              Adicionar ao carrinho
            </button>


            <button
              type="button"
              className={styles.buyNowButton}
              onClick={comprarAgora}
            >
              Comprar
            </button>

          </div>

        </div>

      </div>

      {!emPreview && <Footer />}
    </div>

  );
}

