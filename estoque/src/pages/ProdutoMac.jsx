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
import styles from "../styles/mac.module.css";
import { formatarPrecoProduto } from "../utils/produto.js";


/* =========================================================
   FALLBACK DO MAC
========================================================= */

export const macFallback = {
  id: 1,

  nome: "MacBook Neo",

  modelo: "MacBook Neo",

  categoria: "mac",

  preco: "R$ 7.299",

  video: "/videos/mac.mp4",

  descricao:
    "Um Mac pensado para acompanhar estudos, trabalho, criatividade e tudo o que acontece entre uma ideia e outra.",


  /* =======================================================
     CORES
  ======================================================= */

  cores: [
    {
      id: "azul",
      nome: "Azul",
      cor: "#8197ae",
      imagem: "/imagens/macAzul.png",
    },

    {
      id: "amarelo",
      nome: "Amarelo",
      cor: "#ddd07b",
      imagem: "/imagens/macAmarelo.png",
    },

    {
      id: "rosa",
      nome: "Rosa",
      cor: "#d8b8b7",
      imagem: "/imagens/macRosa.png",
    },

    {
      id: "prata",
      nome: "Prata",
      cor: "#d7d7d5",
      imagem: "/imagens/macBranco.png",
    },
  ],


  /* =======================================================
     DESTAQUES
  ======================================================= */

  destaques: [
    {
      id: 1,

      tag: "DESIGN",

      titulo:
        "Uma cor para cada ideia.",

      descricao:
        "Quatro acabamentos para deixar seu Mac ainda mais com a sua cara.",

      imagem:
        "/imagens/destaque-cores.jpg",
    },

    {
      id: 2,

      tag: "DESEMPENHO",

      titulo:
        "Feito para acompanhar seu ritmo.",

      descricao:
        "PotÃªncia para estudar, trabalhar e criar sem interromper o que importa.",

      imagem:
        "/imagens/destaque-estudos.jpg",
    },

    {
      id: 3,

      tag: "TELA",

      titulo:
        "Tudo ganha mais vida.",

      descricao:
        "Uma tela ampla e vibrante para projetos, entretenimento e criatividade.",

      imagem:
        "/imagens/destaque-tela.jpg",
    },

    {
      id: 4,

      tag: "BATERIA",

      titulo:
        "Pronto para o dia inteiro.",

      descricao:
        "Liberdade para continuar fazendo mais por muito mais tempo.",

      imagem:
        "/imagens/destaque-bateria.jpg",
    },
  ],


  /* =======================================================
     DETALHES
  ======================================================= */

  detalhes: [
    {
      id: "durabilidade",

      titulo: "Durabilidade",

      descricao:
        "ConstruÃ§Ã£o leve e resistente para acompanhar vocÃª todos os dias.",
    },

    {
      id: "tela",

      titulo: "Tela",

      descricao:
        "Uma experiÃªncia ampla e nÃ­tida para trabalhar, estudar, assistir e criar.",
    },

    {
      id: "teclado",

      titulo: "Teclado e trackpad",

      descricao:
        "PrecisÃ£o e conforto para digitar, navegar e criar com naturalidade.",
    },

    {
      id: "touchid",

      titulo: "Touch ID",

      descricao:
        "Desbloqueie seu Mac e proteja suas informaÃ§Ãµes com apenas um toque.",
    },

    {
      id: "camera",

      titulo: "CÃ¢mera",

      descricao:
        "Chamadas mais claras e uma imagem mais natural para reuniÃµes e conversas.",
    },

    {
      id: "audio",

      titulo:
        "Microfones e alto-falantes",

      descricao:
        "Som equilibrado e vozes mais claras em chamadas, filmes e mÃºsicas.",
    },

    {
      id: "conectividade",

      titulo: "Conectividade",

      descricao:
        "Conecte acessÃ³rios e mantenha tudo funcionando de forma simples.",
    },
  ],


  /* =======================================================
     PERFORMANCE
  ======================================================= */

  performance: [
    {
      id: 1,

      tituloColorido:
        "Produtividade todo dia.",

      titulo:
        "FaÃ§a tudo acontecer.",

      descricao:
        "Responda a e-mails, faÃ§a chamadas de vÃ­deo, navegue na internet, organize estudos e compartilhe arquivos. Com o MacBook Neo, nada fica para amanhÃ£.",

      cor: "#40a559",

      imagem:
        "/imagens/MacBook2.png",
    },

    {
      id: 2,

      tituloColorido:
        "Aprenda com quem sabe.",

      titulo:
        "Um companheiro para estudar.",

      descricao:
        "Pesquise antes das provas, resuma anotaÃ§Ãµes de aulas e transforme suas ideias em trabalhos, apresentaÃ§Ãµes e novos projetos.",

      cor: "#d347c4",

      imagem:
        "/imagens/MacBook2.png",
    },

    {
      id: 3,

      tituloColorido:
        "VocÃª trabalha brincando.",

      titulo:
        "Crie do seu jeito.",

      descricao:
        "CriaÃ§Ã£o de planilhas, apresentaÃ§Ãµes, ediÃ§Ã£o e organizaÃ§Ã£o de projetos. Tudo de forma rÃ¡pida, fluida e visual.",

      cor: "#4269e8",

      imagem:
        "/imagens/MacBook2.png",
    },
  ],
};


/* =========================================================
   NORMALIZAÃ‡ÃƒO
========================================================= */

function normalizarMac(produto) {

  const ehMac =
    produto?.categoria
      ?.toString()
      .toLowerCase() === "mac";


  const produtoSeguro =
    ehMac
      ? produto
      : {};


  return {

    ...macFallback,

    ...produtoSeguro,

    categoria: "mac",


    video:
      produtoSeguro.videoMac ||
      (
        produtoSeguro.video &&
        !produtoSeguro.video.includes(
          "apple.mp4"
        )
          ? produtoSeguro.video
          : macFallback.video
      ),


    cores:
      Array.isArray(produtoSeguro?.cores)
        ? produtoSeguro.cores
        : macFallback.cores,


    destaques:
      produtoSeguro
        ?.destaquesMac
        && Array.isArray(produtoSeguro.destaquesMac)
        ? produtoSeguro.destaquesMac
        : macFallback.destaques,


    detalhes:
      produtoSeguro
        ?.detalhesMac
        && Array.isArray(produtoSeguro.detalhesMac)
        ? produtoSeguro.detalhesMac
        : macFallback.detalhes,


    performance:
      produtoSeguro
        ?.performance
        && Array.isArray(produtoSeguro.performance)
        ? produtoSeguro.performance
        : macFallback.performance,
  };

}


/* =========================================================
   COMPONENTE
========================================================= */

export default function ProdutoMac() {

  const { id } = useParams();

  const navigate = useNavigate();
  const emPreview = window.self !== window.top;


  const [
    produto,
    setProduto
  ] = useState(null);


  const [
    corSelecionada,
    setCorSelecionada
  ] = useState(0);


  const [
    detalheSelecionado,
    setDetalheSelecionado
  ] = useState(null);


  const [
    carouselIndex,
    setCarouselIndex
  ] = useState(0);


  const [
    mostrarPurchaseBar,
    setMostrarPurchaseBar
  ] = useState(false);


  /* =========================================================
     CARREGA PRODUTO
  ========================================================= */

  useEffect(() => {

    try {

      const produtosSalvos =
        localStorage.getItem(
          "produtos-personalizados"
        );


      if (!produtosSalvos) {

        setProduto(
          normalizarMac(
            macFallback
          )
        );

        return;
      }


      const produtos =
        JSON.parse(
          produtosSalvos
        );


      const encontrado =
        produtos.find(
          (item) => {

            const mesmoId =
              Number(item.id) ===
              Number(id);


            const categoria =
              item.categoria
                ?.toString()
                .toLowerCase();


            return (
              mesmoId &&
              categoria === "mac"
            );

          }
        );


      if (encontrado) {

        setProduto(
          normalizarMac(
            encontrado
          )
        );

      } else {

        setProduto(
          normalizarMac(
            macFallback
          )
        );

      }

    } catch (error) {

      console.error(
        "Erro ao carregar Mac:",
        error
      );


      setProduto(
        normalizarMac(
          macFallback
        )
      );

    }

  }, [id]);


  /* =========================================================
     RESETA INTERAÃ‡Ã•ES
  ========================================================= */

  useEffect(() => {

    setCorSelecionada(0);

    setDetalheSelecionado(null);

    setCarouselIndex(0);

  }, [produto?.id]);


  /* =========================================================
     MOSTRAR BARRA SÃ“ DEPOIS DO HERO
  ========================================================= */

  useEffect(() => {

    function controlarPurchaseBar() {

      const hero =
        document.querySelector(
          `.${styles.hero}`
        );


      if (!hero) {
        return;
      }


      const heroBottom =
        hero.getBoundingClientRect().bottom;


      setMostrarPurchaseBar(
        heroBottom <= 0
      );

    }


    controlarPurchaseBar();


    window.addEventListener(
      "scroll",
      controlarPurchaseBar,
      {
        passive: true
      }
    );


    window.addEventListener(
      "resize",
      controlarPurchaseBar
    );


    return () => {

      window.removeEventListener(
        "scroll",
        controlarPurchaseBar
      );


      window.removeEventListener(
        "resize",
        controlarPurchaseBar
      );

    };

  }, []);


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

  const detalheAtual = produto?.detalhes?.find(
    (detalhe) => detalhe.id === detalheSelecionado
  );

  const imagemDetalheAtual = detalheAtual?.imagem || corAtual?.imagem;
  const exibindoImagemDetalhe = Boolean(detalheAtual?.imagem);


  /* =========================================================
     CARROSSEL
  ========================================================= */

  const maxCarouselIndex =
    produto
      ? Math.max(
          0,
          produto.destaques.length - 1
        )
      : 0;


  function anterior() {

    setCarouselIndex(
      (atual) =>
        Math.max(
          0,
          atual - 1
        )
    );

  }


  function proximo() {

    setCarouselIndex(
      (atual) =>
        Math.min(
          maxCarouselIndex,
          atual + 1
        )
    );

  }


  /* =========================================================
     CARRINHO
  ========================================================= */

  function adicionarAoCarrinho() {

    try {

      const carrinhoAtual =
        JSON.parse(
          localStorage.getItem(
            "carrinho"
          ) || "[]"
        );


      const itemExistente =
        carrinhoAtual.find(
          (item) =>
            Number(item.id) ===
              Number(produto.id) &&
            item.categoria === "mac"
        );


      let novoCarrinho;


      if (itemExistente) {

        novoCarrinho =
          carrinhoAtual.map(
            (item) => {

              const mesmoProduto =
                Number(item.id) ===
                  Number(produto.id) &&
                item.categoria === "mac";


              if (!mesmoProduto) {
                return item;
              }


              return {

                ...item,

                quantidade:
                  (item.quantidade || 1) +
                  1,
              };

            }
          );

      } else {

        novoCarrinho = [
          ...carrinhoAtual,

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
              "mac",

            imagem:
              corAtual?.imagem,

            cor:
              corAtual?.nome,

            cores:
              produto.cores || [],

            quantidade:
              1,
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
        "Erro ao adicionar ao carrinho:",
        error
      );

    }

  }


  function comprarAgora() {

    adicionarAoCarrinho();

    navigate("/finalizar-compra");

  }


  /* =========================================================
     LOADING
  ========================================================= */

  if (!produto) {

    return (
      <div className={styles.loading}>
        Carregando Mac...
      </div>
    );

  }


  return (

    <div className={styles.page}>


      {/* =====================================================
          HEADER
      ===================================================== */}

      {!emPreview && <UserHeader />}


      {/* =====================================================
          VOLTAR
      ===================================================== */}

      {!emPreview && <button
        type="button"
        className={styles.backButton}
        onClick={() =>
          navigate("/")
        }
        aria-label="Voltar para produtos"
      >

        <svg viewBox="0 0 24 24">

          <path
            d="M15 5l-7 7 7 7"
          />

        </svg>


        <span>
          Voltar
        </span>

      </button>}


      <main>


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className={styles.hero}>

          <div className={styles.heroVideo}>

            <video
              key={produto.video}
              src={produto.video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />

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

        <section className={styles.highlights}>

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
                  onClick={anterior}
                  disabled={
                    carouselIndex === 0
                  }
                  aria-label="Destaque anterior"
                >
                  â€¹
                </button>


                <button
                  type="button"
                  onClick={proximo}
                  disabled={
                    carouselIndex >=
                    maxCarouselIndex
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
                    `translateX(calc(-${carouselIndex} * (66vw + 18px)))`
                }}
              >

                {produto.destaques.map(
                  (item) => (

                    <article
                      key={item.id}
                      className={styles.highlightCard}
                    >

                      <div className={styles.highlightCopy}>

                        <span>
                          {item.tag}
                        </span>


                        <h3>
                          {item.titulo}
                        </h3>


                        <p>
                          {item.descricao}
                        </p>

                      </div>


                      <img
                        src={item.imagem}
                        alt={item.titulo}
                      />

                    </article>

                  )
                )}

              </div>

            </div>


            <div className={styles.carouselDots}>

              {produto.destaques.map(
                (item, index) => (

                  <button
                    type="button"
                    key={item.id}
                    aria-label={
                      `Ir para destaque ${index + 1}`
                    }
                    className={
                      carouselIndex === index
                        ? styles.carouselDotActive
                        : ""
                    }
                    onClick={() =>
                      setCarouselIndex(index)
                    }
                  />

                )
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            DETALHES
        ===================================================== */}

        <section className={styles.details}>

          <div className={styles.detailsContainer}>


            <div className={styles.detailsIntro}>



              <h2>
                {produto.textosVitrine?.detalhesTitulo || "ConheÃ§a cada detalhe."}
              </h2>


              <p>
                {produto.textosVitrine?.detalhesDescricao || "Explore cores, tela, cÃ¢mera, teclado e tudo o que faz parte da experiÃªncia do Mac."}
              </p>

            </div>


            <div className={`${styles.detailsCard} ${exibindoImagemDetalhe ? styles.detailsCardWithDetail : ""}`}>


              <div className={styles.detailsMenu}>


                {/* CORES */}

                <div className={styles.colorBlock}>

                  <div className={styles.colorLabel}>

                    <span
                      className={styles.colorIndicator}
                      style={{
                        background:
                          corAtual?.cor,
                      }}
                    />


                    <strong>
                      Cores
                    </strong>

                  </div>


                  <div className={styles.colorsList}>

                    {produto.cores.map(
                      (cor, index) => (

                        <button
                          type="button"
                          key={cor.id}
                          aria-label={cor.nome}
                          title={cor.nome}
                          className={`
                            ${styles.colorCircle}
                            ${
                              corSelecionada ===
                              index
                                ? styles.colorCircleActive
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

                {produto.detalhes.map(
                  (detalhe) => (

                    <div
                      key={detalhe.id}
                      className={styles.detailItem}
                    >

                      <button
                        type="button"
                        className={`
                          ${styles.detailButton}
                          ${
                            detalheSelecionado ===
                            detalhe.id
                              ? styles.detailButtonActive
                              : ""
                          }
                        `}
                        onClick={() =>
                          setDetalheSelecionado(
                            (atual) =>
                              atual === detalhe.id
                                ? null
                                : detalhe.id
                          )
                        }
                      >

                        <span className={styles.detailPlus}>

                          {detalheSelecionado ===
                          detalhe.id
                            ? "âˆ’"
                            : "+"}

                        </span>


                        {detalhe.titulo}

                      </button>


                      {detalheSelecionado ===
                        detalhe.id && (

                        <div
                          className={
                            styles.detailDescription
                          }
                        >
                          {detalhe.descricao}
                        </div>

                      )}

                    </div>

                  )
                )}

              </div>


              {/* MAC */}

              <div className={styles.detailsVisual}>

                {imagemDetalheAtual && (

                  <img
                    src={imagemDetalheAtual}
                    className={exibindoImagemDetalhe ? styles.detailImage : styles.colorImage}
                    alt={
                      detalheAtual?.titulo || `${produto.nome} ${corAtual?.nome || ""}`
                    }
                  />

                )}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            PERFORMANCE
        ===================================================== */}

        <section className={styles.performance}>

          <div className={styles.performanceContainer}>


            <header className={styles.performanceHeader}>

              <span>
                Desempenho.
              </span>


              <h2>
                {produto.textosVitrine?.extraTitulo || "Para vocÃª fazer e acontecer."}
              </h2>


              <p>
                {produto.textosVitrine?.extraDescricao || "PotÃªncia para as tarefas do dia a dia, criatividade para transformar ideias e desempenho para acompanhar tudo o que vocÃª quiser fazer."}
              </p>

            </header>


            <div className={styles.performanceList}>

              {produto.performance.map(
                (item, index) => (

                  <article
                    key={item.id}
                    className={`
                      ${styles.performanceItem}
                      ${
                        index % 2 !== 0
                          ? styles.performanceItemReverse
                          : ""
                      }
                    `}
                  >

                    <div className={styles.performanceComputer}>

                      <img
                        src={item.imagem}
                        alt={item.titulo}
                      />

                    </div>


                    <div className={styles.performanceCopy}>

                      <strong
                        style={{
                          color: item.cor,
                        }}
                      >
                        {item.tituloColorido}
                      </strong>


                      <h3>
                        {item.titulo}
                      </h3>


                      <p>
                        {item.descricao}
                      </p>

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        </section>


      </main>


      {/* =====================================================
          BARRA FIXA DE COMPRA
      ===================================================== */}

      <div
        className={`
          ${styles.purchaseBar}
          ${
            mostrarPurchaseBar
              ? styles.purchaseBarVisible
              : ""
          }
        `}
      >

        <div className={styles.purchaseBarInner}>


          <div className={styles.purchaseInfo}>


            <div className={styles.purchaseProduct}>

              <strong>
                {produto.nome}
              </strong>


              <span>

                {corAtual?.nome
                  ? `${corAtual.nome} Â· `
                  : ""}

                Feito para acompanhar o seu dia.

              </span>

            </div>


            <div className={styles.purchasePrice}>

              <small>
                A partir de
              </small>


              <strong>
                {formatarPrecoProduto(produto.preco)}
              </strong>

            </div>

          </div>


          <div className={styles.purchaseActions}>

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

