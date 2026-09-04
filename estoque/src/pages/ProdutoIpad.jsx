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
import styles from "../styles/ipad.module.css";
import { formatarPrecoProduto } from "../utils/produto.js";


/* =========================================================
   FALLBACK IPAD
========================================================= */

export const ipadFallback = {
  id: 1,

  nome: "iPad Pro",

  modelo: "iPad Pro",

  categoria: "ipad",

  preco: "R$ 16.999,00",

  /*
    VÃDEO DO HERO

    public/videos/ipad.mp4
  */
  video: "/videos/ipad.mp4",

  descricao:
    "PotÃªncia, precisÃ£o e liberdade para criar, estudar e trabalhar de novas formas.",


  /* =======================================================
     CORES

     public/imagens/IpadPreto.png
     public/imagens/IpadPrata.png
  ======================================================= */

  cores: [
    {
      id: "preto",

      nome:
        "Preto-espacial",

      cor:
        "#2f3033",

      imagem:
        "/imagens/IpadPreto.png",
    },

    {
      id: "prata",

      nome:
        "Prateado",

      cor:
        "#d8d9da",

      imagem:
        "/imagens/IpadPrata.png",
    },
  ],


  /* =======================================================
     DESTAQUES
  ======================================================= */

  destaques: [
    {
      id: 1,

      tag:
        "M5",

      titulo:
        "PotÃªncia para ir ainda mais longe.",

      descricao:
        "Desempenho para criaÃ§Ã£o, estudos, ediÃ§Ã£o e projetos que exigem muito mais.",

      imagem:
        "/imagens/ipad/destaque-m5.jpg",
    },

    {
      id: 2,

      tag:
        "IPADOS",

      titulo:
        "Mais espaÃ§o para fazer acontecer.",

      descricao:
        "Organize janelas, alterne entre tarefas e mantenha seus projetos sempre ao alcance.",

      imagem:
        "/imagens/ipad/destaque-ipados.jpg",
    },

    {
      id: 3,

      tag:
        "TELA",

      titulo:
        "Tudo fica mais impressionante.",

      descricao:
        "Uma experiÃªncia visual ampla e precisa para trabalhar, assistir, desenhar e criar.",

      imagem:
        "/imagens/ipad/destaque-tela.jpg",
    },

    {
      id: 4,

      tag:
        "DESIGN",

      titulo:
        "Fino. Leve. Pronto para ir.",

      descricao:
        "Toda essa potÃªncia em um design portÃ¡til que acompanha vocÃª em qualquer lugar.",

      imagem:
        "/imagens/ipad/destaque-design.jpg",
    },

    {
      id: 5,

      tag:
        "APPLE PENCIL",

      titulo:
        "Suas ideias ganham mais precisÃ£o.",

      descricao:
        "Escreva, desenhe e transforme uma ideia rÃ¡pida em algo muito maior.",

      imagem:
        "/imagens/ipad/destaque-pencil.jpg",
    },
  ],


  /* =======================================================
     EXPLORE OS DETALHES
  ======================================================= */

  detalhes: [
    {
      id:
        "design",

      titulo:
        "Design",

      descricao:
        "Fino de impressionar. PotÃªncia e portabilidade se encontram em um design leve, elegante e feito para acompanhar vocÃª.",

      /*
        public/imagens/expesura.png
      */
      imagem:
        "/imagens/expesura.png",
    },

    {
      id:
        "tela",

      titulo:
        "Tela Ultra Retina XDR",

      descricao:
        "Tudo ganha outra dimensÃ£o. Uma tela de alto contraste, brilho intenso e movimentos extremamente fluidos.",

      /*
        public/imagens/tela.png
      */
      imagem:
        "/imagens/tela.png",
    },

    {
      id:
        "m5",

      titulo:
        "Chip M5",

      descricao:
        "PotÃªncia para criar, editar, estudar e trabalhar com vÃ¡rios projetos sem perder o ritmo.",

      /*
        public/imagens/abas.png
      */
      imagem:
        "/imagens/abas.png",
    },

    {
      id:
        "pencil",

      titulo:
        "Apple Pencil Pro",

      descricao:
        "PrecisÃ£o para desenhar, escrever, marcar e transformar uma ideia rÃ¡pida em um projeto completo.",

      /*
        public/imagens/pencil1.png
      */
      imagem:
        "/imagens/pencil1.png",
    },
  ],
};


/* =========================================================
   NORMALIZAÃ‡ÃƒO
========================================================= */

function normalizarIpad(produto) {

  const categoria =
    produto?.categoria
      ?.toString()
      .toLowerCase();


  const ehIpad =
    categoria === "ipad" ||
    categoria === "tablet";


  const seguro =
    ehIpad
      ? produto
      : {};


  return {

    ...ipadFallback,

    ...seguro,

    categoria:
      "ipad",


    /* =====================================================
       PROTEÃ‡ÃƒO DO VÃDEO
    ===================================================== */

    video:
      seguro.videoIpad ||
      (
        seguro.video &&
        seguro.video
          .toString()
          .toLowerCase()
          .includes("ipad")
          ? seguro.video
          : ipadFallback.video
      ),


    cores:
      Array.isArray(seguro?.cores)
        ? seguro.cores
        : ipadFallback.cores,


    destaques:
      Array.isArray(seguro?.destaquesIpad)
        ? seguro.destaquesIpad
        : ipadFallback.destaques,


    detalhes:
      Array.isArray(seguro?.detalhesIpad)
        ? seguro.detalhesIpad
        : ipadFallback.detalhes,
  };

}


/* =========================================================
   COMPONENTE
========================================================= */

export default function ProdutoIpad() {

  const { id } =
    useParams();


  const navigate =
    useNavigate();
  const emPreview = window.self !== window.top;


  const [
    produto,
    setProduto
  ] = useState(null);


  const [
    carouselIndex,
    setCarouselIndex
  ] = useState(0);


  const [
    corSelecionada,
    setCorSelecionada
  ] = useState(0);


  const [
    detalheSelecionado,
    setDetalheSelecionado
  ] = useState(null);


  const [
    ultimoDetalheSelecionado,
    setUltimoDetalheSelecionado
  ] = useState(null);


  /*
    NÃƒO EXISTE MAIS possibilitiesVisible.

    A imagem Groupo45.png ficarÃ¡ sempre
    visÃ­vel e parada.
  */

  const [
    possibilitiesOpen,
    setPossibilitiesOpen
  ] = useState(false);


  const [
    mostrarCompra,
    setMostrarCompra
  ] = useState(false);


  /* =========================================================
     CARREGAR PRODUTO
  ========================================================= */

  useEffect(() => {

    try {

      const salvo =
        localStorage.getItem(
          "produtos-personalizados"
        );


      if (!salvo) {

        setProduto(
          normalizarIpad(
            ipadFallback
          )
        );

        return;
      }


      const produtos =
        JSON.parse(
          salvo
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
              (
                categoria === "ipad" ||
                categoria === "tablet"
              )
            );

          }
        );


      setProduto(
        normalizarIpad(
          encontrado ||
          ipadFallback
        )
      );

    } catch (error) {

      console.error(
        "Erro ao carregar iPad:",
        error
      );


      setProduto(
        normalizarIpad(
          ipadFallback
        )
      );

    }

  }, [id]);


  /* =========================================================
     RESET
  ========================================================= */

  useEffect(() => {

    setCarouselIndex(0);

    setCorSelecionada(0);

    setDetalheSelecionado(
      null
    );

    setUltimoDetalheSelecionado(
      null
    );

    setPossibilitiesOpen(
      false
    );

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


  /* =========================================================
     DETALHE ATUAL
  ========================================================= */

  const detalheAtual =
    useMemo(() => {

      if (
        !produto ||
        !ultimoDetalheSelecionado
      ) {
        return null;
      }


      return (
        produto.detalhes.find(
          (item) =>
            item.id ===
            ultimoDetalheSelecionado
        ) ||
        null
      );

    }, [
      produto,
      ultimoDetalheSelecionado
    ]);


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
     DETALHES
  ========================================================= */

  function alternarDetalhe(
    detalhe
  ) {

    setUltimoDetalheSelecionado(
      detalhe.id
    );


    setDetalheSelecionado(
      (atual) =>
        atual === detalhe.id
          ? null
          : detalhe.id
    );

  }


  /* =========================================================
     COR
  ========================================================= */

  function selecionarCor(
    index
  ) {

    setCorSelecionada(
      index
    );


    /*
      Ao clicar em uma cor,
      volta para o iPad completo.
    */

    setUltimoDetalheSelecionado(
      null
    );


    setDetalheSelecionado(
      null
    );

  }


  /* =========================================================
     BLOQUEAR SCROLL COM OVERLAY ABERTO
  ========================================================= */

  useEffect(() => {

    if (
      possibilitiesOpen
    ) {

      document.body.style.overflow =
        "hidden";

    } else {

      document.body.style.overflow =
        "";

    }


    return () => {

      document.body.style.overflow =
        "";

    };

  }, [
    possibilitiesOpen
  ]);


  /* =========================================================
     ESC FECHA A TELA
  ========================================================= */

  useEffect(() => {

    function fecharComEsc(
      event
    ) {

      if (
        event.key ===
        "Escape"
      ) {

        setPossibilitiesOpen(
          false
        );

      }

    }


    window.addEventListener(
      "keydown",
      fecharComEsc
    );


    return () => {

      window.removeEventListener(
        "keydown",
        fecharComEsc
      );

    };

  }, []);


  /* =========================================================
     BARRA DE COMPRA
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
     ADICIONAR AO CARRINHO
  ========================================================= */

  function adicionarAoCarrinho() {

    try {

      const carrinho =
        JSON.parse(
          localStorage.getItem(
            "carrinho"
          ) ||
          "[]"
        );


      const existente =
        carrinho.find(
          (item) =>
            Number(item.id) ===
              Number(produto.id) &&
            item.categoria ===
              "ipad"
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
                  "ipad";


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
              "ipad",

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
        "Erro ao adicionar iPad:",
        error
      );

    }

  }


  /* =========================================================
     COMPRAR
  ========================================================= */

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

      <div
        className={
          styles.loading
        }
      >
        Carregando iPad...
      </div>

    );

  }


  return (

    <div
      className={
        styles.page
      }
    >


      {/* =====================================================
          HEADER
      ===================================================== */}

      {!emPreview && <UserHeader />}


      {/* =====================================================
          VOLTAR
      ===================================================== */}

      {!emPreview && <button
        type="button"
        className={
          styles.backButton
        }
        onClick={() =>
          navigate(
            "/"
          )
        }
        aria-label="Voltar"
      >

        <svg
          viewBox="0 0 24 24"
        >

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

        <section
          className={
            styles.hero
          }
        >

          <div
            className={
              styles.heroVideo
            }
          >

            <video
              key={
                produto.video
              }
              src={
                produto.video
              }
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

        <section
          className={
            styles.highlights
          }
        >

          <div
            className={
              styles.highlightsContainer
            }
          >


            <div
              className={
                styles.highlightsTop
              }
            >

              <div>

                <span>
                  DESTAQUES
                </span>


                <h2>
                  {produto.textosVitrine?.destaquesTitulo || "Comece pelos destaques."}
                </h2>

              </div>


              <div
                className={
                  styles.carouselButtons
                }
              >

                <button
                  type="button"
                  onClick={
                    anterior
                  }
                  disabled={
                    carouselIndex ===
                    0
                  }
                  aria-label="Anterior"
                >
                  â€¹
                </button>


                <button
                  type="button"
                  onClick={
                    proximo
                  }
                  disabled={
                    carouselIndex >=
                    maxCarouselIndex
                  }
                  aria-label="PrÃ³ximo"
                >
                  â€º
                </button>

              </div>

            </div>


            <div
              className={
                styles.carouselViewport
              }
            >

              <div
                className={
                  styles.highlightTrack
                }
                style={{
                  transform:
                    `translateX(calc(-${carouselIndex} * (66vw + 18px)))`
                }}
              >

                {produto.destaques.map(
                  (item) => (

                    <article
                      key={
                        item.id
                      }
                      className={
                        styles.highlightCard
                      }
                    >

                      <img
                        src={
                          item.imagem
                        }
                        alt={
                          item.titulo
                        }
                      />


                      <div
                        className={
                          styles.highlightCopy
                        }
                      >

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

                    </article>

                  )
                )}

              </div>

            </div>


            <div
              className={
                styles.carouselDots
              }
            >

              {produto.destaques.map(
                (
                  item,
                  index
                ) => (

                  <button
                    type="button"
                    key={
                      item.id
                    }
                    aria-label={
                      `Destaque ${index + 1}`
                    }
                    className={
                      carouselIndex ===
                      index
                        ? styles.carouselDotActive
                        : ""
                    }
                    onClick={() =>
                      setCarouselIndex(
                        index
                      )
                    }
                  />

                )
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            EXPLORE OS DETALHES
        ===================================================== */}

        <section
          className={
            styles.details
          }
        >

          <div
            className={
              styles.detailsContainer
            }
          >


            <header
              className={
                styles.detailsIntro
              }
            >



              <h2>
                {produto.textosVitrine?.detalhesTitulo || "Explore os detalhes."}
              </h2>


              <p>
                {produto.textosVitrine?.detalhesDescricao || "ConheÃ§a de perto os elementos que tornam o iPad tÃ£o versÃ¡til."}
              </p>

            </header>


            <div
              className={
                styles.detailsCard
              }
            >


              {/* ===============================================
                  MENU
              =============================================== */}

              <div
                className={
                  styles.detailsMenu
                }
              >


                {/* =============================================
                    CORES
                ============================================= */}

                <div
                  className={
                    styles.colorBlock
                  }
                >

                  <div
                    className={
                      styles.colorLabel
                    }
                  >

                    <span
                      className={
                        styles.colorIndicator
                      }
                      style={{
                        background:
                          corAtual?.cor
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
                      (
                        cor,
                        index
                      ) => (

                        <button
                          type="button"
                          key={
                            cor.id
                          }
                          title={
                            cor.nome
                          }
                          aria-label={
                            cor.nome
                          }
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
                              cor.cor
                          }}
                          onClick={() =>
                            selecionarCor(
                              index
                            )
                          }
                        />

                      )
                    )}

                  </div>

                </div>


                {/* =============================================
                    DETALHES
                ============================================= */}

                {produto.detalhes.map(
                  (detalhe) => {

                    const aberto =
                      detalheSelecionado ===
                      detalhe.id;


                    return (

                      <div
                        key={
                          detalhe.id
                        }
                        className={
                          styles.detailItem
                        }
                      >

                        <button
                          type="button"
                          className={`
                            ${styles.detailButton}

                            ${
                              aberto
                                ? styles.detailButtonActive
                                : ""
                            }
                          `}
                          onClick={() =>
                            alternarDetalhe(
                              detalhe
                            )
                          }
                        >

                          <span
                            className={
                              styles.detailPlus
                            }
                          >

                            {aberto
                              ? "âˆ’"
                              : "+"}

                          </span>


                          <span>
                            {detalhe.titulo}
                          </span>

                        </button>


                        {aberto && (

                          <div
                            className={
                              styles.detailDescription
                            }
                          >

                            {detalhe.descricao}

                          </div>

                        )}

                      </div>

                    );

                  }
                )}

              </div>


              {/* ===============================================
                  IMAGEM
              =============================================== */}

              <div
                className={
                  styles.detailsVisual
                }
              >

                {detalheAtual ? (

                  <img
                    key={
                      detalheAtual.id
                    }
                    src={
                      detalheAtual.imagem
                    }
                    alt={
                      detalheAtual.titulo
                    }
                    className={`
                      ${styles.detailImage}

                      ${
                        detalheAtual.id ===
                        "design"
                          ? styles.detailImageDesign
                          : ""
                      }

                      ${
                        detalheAtual.id ===
                        "tela"
                          ? styles.detailImageTela
                          : ""
                      }

                      ${
                        detalheAtual.id ===
                        "m5"
                          ? styles.detailImageM5
                          : ""
                      }

                      ${
                        detalheAtual.id ===
                        "pencil"
                          ? styles.detailImagePencil
                          : ""
                      }
                    `}
                  />

                ) : (

                  <img
                    key={
                      corAtual?.id
                    }
                    src={
                      corAtual?.imagem
                    }
                    alt={
                      `${produto.nome} ${corAtual?.nome}`
                    }
                    className={`
                      ${styles.detailImage}
                      ${styles.detailImageColor}

                      ${
                        corAtual?.id ===
                        "preto"
                          ? styles.detailImagePreto
                          : ""
                      }

                      ${
                        corAtual?.id ===
                        "prata"
                          ? styles.detailImagePrata
                          : ""
                      }
                    `}
                  />

                )}

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            POSSIBILIDADES
        ===================================================== */}

        <section
          className={
            styles.possibilities
          }
        >

          <div
            className={
              styles.possibilitiesContainer
            }
          >


            <header
              className={
                styles.possibilitiesHeader
              }
            >

              <span>
                IPADOS E APPS
              </span>


              <h2>
                {produto.textosVitrine?.extraTitulo || "Possibilidades em todas as frentes."}
              </h2>


              <p>
                {produto.textosVitrine?.extraDescricao || "Um espaÃ§o flexÃ­vel para criar, trabalhar, estudar e transformar ideias em projetos."}
              </p>

            </header>


            {/* ===============================================
                GROUPo45.PNG

                AGORA FICA SEMPRE PARADA.
            =============================================== */}

            <div
              className={
                styles.possibilitiesVisual
              }
            >

              <img
                src="/imagens/Groupo45.png"
                alt="Possibilidades do iPad"
                className={
                  styles.possibilitiesMainImage
                }
              />


              {/* =============================================
                  BOTÃƒO

                  AGORA SEMPRE APARECE.
              ============================================= */}

              <button
                type="button"
                className={
                  styles.exploreAppsButton
                }
                onClick={() =>
                  setPossibilitiesOpen(
                    true
                  )
                }
              >

                <span>
                  Explore mais possibilidades
                </span>


                <span
                  className={
                    styles.exploreAppsPlus
                  }
                >
                  +
                </span>

              </button>

            </div>

          </div>

        </section>


      </main>


      {/* =====================================================
          TELA QUE ABRE AO CLICAR
      ===================================================== */}

      {possibilitiesOpen && (

        <div
          className={
            styles.appsOverlay
          }
        >

          <div
            className={
              styles.appsOverlayContent
            }
          >


            {/* ===============================================
                CABEÃ‡ALHO
            =============================================== */}

            <header
              className={
                styles.appsOverlayHeader
              }
            >

              <span>
                IPADOS E APPS
              </span>


              <h2>
                {produto.textosVitrine?.overlayTitulo || "Um universo de possibilidades."}
              </h2>


              <p>
                {produto.textosVitrine?.overlayDescricao || "Trabalhe com vÃ¡rios apps, crie projetos, organize ideias e transforme o iPad em um espaÃ§o para tudo o que vocÃª quiser fazer."}
              </p>

            </header>


            {/* ===============================================
                TABLET.PNG

                public/imagens/tablet.png
            =============================================== */}

            <section
              className={
                styles.overlayTabletSection
              }
            >

              <div
                className={
                  styles.overlayTabletCopy
                }
              >


                

              </div>


              <div
                className={
                  styles.overlayTabletArea
                }
              >

                <img
                  src="/imagens/tablet.png"
                  alt="iPad com aplicativos"
                  className={
                    styles.overlayTabletImage
                  }
                />
                 
                 <p className={styles.paragrafo} >O iPadOS 26 deixa o iPad Pro ainda mais intuitivo e eficiente. Com um sistema de janelas novo e poderoso, vocÃª controla, organiza e gerencia seus fluxos de trabalho como nunca. E, com a Apple Intelligence integrada aos seus apps e experiÃªncias do dia a dia, vocÃª se comunica, cria e faz de tudo sem esforÃ§o.</p>

              </div>

            </section>


            {/* ===============================================
                VARIOS.PNG

                public/imagens/varios.png
            =============================================== */}

            <section
              className={
                styles.overlayVariosSection
              }
            >

              <div
                className={
                  styles.overlayVariosText
                }
              >

                <span>
                  MULTITAREFA
                </span>


                <h3>
                  Tudo aberto.
                  <br />
                  Tudo no lugar.
                </h3>


                <p>
                   maravilhas.
Os apps profissionais revelam a capacidade extraordinÃ¡ria do iPad Pro. E os mais de um milhÃ£o de apps da App Store desenvolvidos para os recursos Ãºnicos do iPad fazem do iPadOS a plataforma ideal para trabalhar, criar e se divertir.
                </p>

              </div>


              <div
                className={
                  styles.overlayVariosArea
                }
              >

                <img
                  src="/imagens/varios.png"
                  alt="VÃ¡rios aplicativos no iPad"
                  className={
                    styles.overlayVariosImage
                  }
                />

              </div>

            </section>


          </div>


          {/* ===============================================
              FECHAR
          =============================================== */}

          <button
            type="button"
            className={
              styles.appsOverlayClose
            }
            onClick={() =>
              setPossibilitiesOpen(
                false
              )
            }
            aria-label="Fechar"
          >
            Ã—
          </button>

        </div>

      )}


      {/* =====================================================
          BARRA DE COMPRA
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

