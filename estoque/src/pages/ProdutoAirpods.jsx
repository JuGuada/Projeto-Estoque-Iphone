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
import styles from "../styles/airpods.module.css";
import { formatarPrecoProduto } from "../utils/produto.js";


/* =========================================================
   FALLBACK AIRPODS
========================================================= */

export const airpodsFallback = {
  id: 1,

  nome: "AirPods Pro 3",

  modelo: "AirPods Pro 3",

  categoria: "airpods",

  preco: "R$ 2.699",

  video: "/videos/airpods.mp4",

  descricao:
    "Som envolvente, conforto e tecnologia para transformar tudo o que você ouve.",


  /* =======================================================
     DESTAQUES
  ======================================================= */

  destaques: [
    {
      id: 1,

      tag: "SOM",

      titulo:
        "Uma experiência que envolve você.",

      descricao:
        "Áudio rico em detalhes para deixar músicas, filmes e chamadas ainda mais imersivos.",

      imagem:
        "/imagens/som.png",
    },

    {
      id: 2,

      tag: "SAÚDE",

      titulo:
        "Mais informação durante o seu dia.",

      descricao:
        "Recursos inteligentes ajudam você a acompanhar informações importantes enquanto continua ouvindo.",

      imagem:
        "/imagens/conforto.png",
    },

    {
      id: 3,

      tag: "CONFORTO",

      titulo:
        "Feitos para acompanhar você.",

      descricao:
        "Um design pensado para oferecer conforto em músicas, chamadas e momentos de concentração.",

      imagem:
        "/imagens/frequencia.png",
    },

    {
      id: 4,

      tag: "CONEXÃO",

      titulo:
        "Tudo simplesmente se conecta.",

      descricao:
        "Alterne entre seus dispositivos e continue ouvindo sem perder o ritmo.",

      imagem:
        "/imagens/abas.png",
    },
  ],


  /* =======================================================
     DETALHES

     Cada opção troca a imagem.
     Não existe seleção por cor.
  ======================================================= */

  detalhes: [
    {
      id: "som",

      titulo:
        "Qualidade de som",

      descricao:
        "Áudio equilibrado e definido para músicas, vídeos, chamadas e tudo o que você quiser ouvir.",

      imagem:
        "/imagens/som.png",
    },

    {
      id: "conforto",

      titulo:
        "Ajuste e conforto",

      descricao:
        "Um design pensado para oferecer encaixe confortável e estabilidade durante diferentes momentos do dia.",

      imagem:
        "/imagens/conforto.png",
    },

    {
      id: "frequencia",

      titulo:
        "Medição de frequência cardíaca",

      descricao:
        "Um sensor compacto acompanha suas métricas durante exercícios, treinos e outras atividades.",

      imagem:
        "/imagens/frequencia.png",
    },

    {
      id: "resistencia",

      titulo:
        "Resistência a poeira e água",

      descricao:
        "Projetados para acompanhar diferentes momentos da rotina, inclusive exercícios e atividades mais intensas.",

      imagem:
        "/imagens/resistencia.png",
    },

    {
      id: "controles",

      titulo:
        "Controles por toque",

      descricao:
        "Controle músicas, chamadas e outros recursos de maneira simples sem precisar pegar o iPhone.",

      imagem:
        "/imagens/toque.png",
    },

    {
      id: "estojo",

      titulo:
        "Estojo de recarga",

      descricao:
        "Leve seus AirPods com segurança e tenha energia extra sempre por perto.",

      imagem:
        "/imagens/carregar.png",
    },
  ],


  /* =======================================================
     EXPERIÊNCIAS
  ======================================================= */

  experiencia: [
    {
      id: "geral",

      menu:
        "Visão geral",

      indice:
        "01",

      titulo:
        "Som que parece estar ao seu redor.",

      descricao:
        "Uma experiência criada para aproximar você de cada detalhe das músicas, filmes e conversas.",

      imagem:
        "/imagens/musica.jpg",
    },

    {
      id: "cancelamento",

      menu:
        "Cancelamento",

      indice:
        "02",

      titulo:
        "Menos ruído. Mais do que você quer ouvir.",

      descricao:
        "Reduza distrações ao seu redor e mergulhe na sua música, nos estudos ou no trabalho.",

      imagem:
        "/imagens/escuta.jpg",
    },

    {
      id: "transparencia",

      menu:
        "Transparência",

      indice:
        "03",

      titulo:
        "Ouça o mundo quando quiser.",

      descricao:
        "Alterne para um modo mais aberto e mantenha contato com o ambiente sem tirar os AirPods.",

      imagem:
        "/imagens/chamada.jpg",
    },

    {
      id: "conexao",

      menu:
        "Conexão",

      indice:
        "04",

      titulo:
        "Do iPhone para o Mac. Sem complicação.",

      descricao:
        "Continue ouvindo e alterne entre seus dispositivos de forma natural durante o dia.",

      imagem:
        "/imagens/abas.png",
    },
  ],
};


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizarAirpods(produto) {

  const categoria =
    produto?.categoria
      ?.toString()
      .toLowerCase();


  const ehAirpods =
    categoria === "airpods" ||
    categoria === "airpod";


  const seguro =
    ehAirpods
      ? produto
      : {};


  return {

    ...airpodsFallback,

    ...seguro,

    categoria:
      "airpods",


    /*
      Proteção igual à página do Mac.

      Só aceita um vídeo salvo se ele
      realmente parecer ser do AirPods.
    */
    video:
      seguro.videoAirpods ||
      (
        seguro.video &&
        seguro.video
          .toString()
          .toLowerCase()
          .includes("airpods")
          ? seguro.video
          : airpodsFallback.video
      ),


    destaques:
      Array.isArray(seguro?.destaquesAirpods) &&
      seguro.destaquesAirpods.length > 0
        ? seguro.destaquesAirpods
        : airpodsFallback.destaques,


    detalhes:
      Array.isArray(seguro?.detalhesAirpods) &&
      seguro.detalhesAirpods.length > 0
        ? seguro.detalhesAirpods
        : airpodsFallback.detalhes,


    experiencia:
      Array.isArray(seguro?.experienciaAirpods) &&
      seguro.experienciaAirpods.length > 0
        ? seguro.experienciaAirpods
        : airpodsFallback.experiencia,

    cores:
      Array.isArray(seguro?.cores)
        ? seguro.cores
        : [],
  };

}


/* =========================================================
   COMPONENTE
========================================================= */

export default function ProdutoAirpods() {

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


  /*
    Item atualmente aberto.
    null = todos fechados.
  */
  const [
    detalheSelecionado,
    setDetalheSelecionado
  ] = useState(null);


  /*
    Guarda qual imagem deve continuar
    aparecendo mesmo depois de fechar
    a descrição.
  */
  const [
    ultimoDetalheSelecionado,
    setUltimoDetalheSelecionado
  ] = useState("som");


  const [
    experienciaSelecionada,
    setExperienciaSelecionada
  ] = useState(0);


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
          normalizarAirpods(
            airpodsFallback
          )
        );

        return;
      }


      const produtos =
        JSON.parse(salvo);


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
                categoria === "airpods" ||
                categoria === "airpod"
              )
            );

          }
        );


      setProduto(
        normalizarAirpods(
          encontrado ||
          airpodsFallback
        )
      );

    } catch (error) {

      console.error(
        "Erro ao carregar AirPods:",
        error
      );


      setProduto(
        normalizarAirpods(
          airpodsFallback
        )
      );

    }

  }, [id]);


  /* =========================================================
     RESET
  ========================================================= */

  useEffect(() => {

    setCarouselIndex(0);

    setDetalheSelecionado(null);

    setUltimoDetalheSelecionado("som");

    setExperienciaSelecionada(0);

  }, [produto?.id]);


  /* =========================================================
     BARRA DE COMPRA

     Aparece somente depois que o hero
     já saiu da tela.
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
        hero
          .getBoundingClientRect()
          .bottom;


      setMostrarCompra(
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
     DETALHE ATUAL
  ========================================================= */

  const detalheAtual =
    useMemo(() => {

      if (!produto) {
        return null;
      }


      return (
        produto.detalhes.find(
          (item) =>
            item.id ===
            ultimoDetalheSelecionado
        ) ||
        produto.detalhes[0]
      );

    }, [
      produto,
      ultimoDetalheSelecionado
    ]);


  /* =========================================================
     EXPERIÊNCIA ATUAL
  ========================================================= */

  const experienciaAtual =
    useMemo(() => {

      if (!produto) {
        return null;
      }


      return (
        produto.experiencia[
          experienciaSelecionada
        ] ||
        produto.experiencia[0]
      );

    }, [
      produto,
      experienciaSelecionada
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
     ABRIR DETALHE
  ========================================================= */

  function alternarDetalhe(
    detalhe
  ) {

    /*
      A imagem troca sempre que clicar.
    */
    setUltimoDetalheSelecionado(
      detalhe.id
    );


    /*
      Clicar duas vezes no mesmo
      fecha a descrição.
    */
    setDetalheSelecionado(
      (atual) =>
        atual === detalhe.id
          ? null
          : detalhe.id
    );

  }


  /* =========================================================
     ADICIONAR AO CARRINHO
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
              "airpods"
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
                  "airpods";


              if (!igual) {
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
              "airpods",

            quantidade:
              1,

            cor:
              produto.cores?.[0]?.nome || produto.cor || "",

            cores:
              produto.cores || [],

            imagem:
              detalheAtual?.imagem,
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
        "Erro ao adicionar AirPods:",
        error
      );

    }

  }


  /* =========================================================
     COMPRAR AGORA
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
        Carregando AirPods...
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
        className={
          styles.backButton
        }
        onClick={() =>
          navigate(
            "/"
          )
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

            Vídeo local:
            public/videos/airpods.mp4
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
                    carouselIndex === 0
                  }
                  aria-label="Destaque anterior"
                >
                  ‹
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
                  aria-label="Próximo destaque"
                >
                  ›
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
                      key={item.id}
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
                      `Ir para destaque ${index + 1}`
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
                {produto.textosVitrine?.detalhesDescricao || "Descubra como cada detalhe foi pensado para tornar a experiência mais confortável, simples e envolvente."}
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
                              ? "−"
                              : "+"}

                          </span>


                          <span>
                            {detalhe.titulo}
                          </span>

                        </button>


                        {/* =====================================
                            TEXTO ABRE LOGO ABAIXO
                        ===================================== */}

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

            <div className={styles.detailsVisual}>

  {detalheAtual && (

    <img
      key={detalheAtual.id}
      src={detalheAtual.imagem}
      alt={detalheAtual.titulo}
      className={`
        ${styles.detailImage}
        ${
          detalheAtual.id === "som"
            ? styles.detailImageSom
            : ""
        }
        ${
          detalheAtual.id === "conforto"
            ? styles.detailImageConforto
            : ""
        }
        ${
          detalheAtual.id === "frequencia"
            ? styles.detailImageFrequencia
            : ""
        }
        ${
          detalheAtual.id === "resistencia"
            ? styles.detailImageResistencia
            : ""
        }
        ${
          detalheAtual.id === "controles"
            ? styles.detailImageControles
            : ""
        }
        ${
          detalheAtual.id === "estojo"
            ? styles.detailImageEstojo
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
            EXPERIÊNCIA
        ===================================================== */}

        <section
          className={
            styles.magic
          }
        >

          <div
            className={
              styles.magicContainer
            }
          >


            <header
              className={
                styles.magicHeader
              }
            >

              <span>
                EXPERIÊNCIA
              </span>


              <h2>
                {produto.textosVitrine?.extraTitulo || "Magia para seus ouvidos."}
              </h2>


              <p>
                {produto.textosVitrine?.extraDescricao || "Uma experiência que aproxima você da música, das conversas e de tudo que merece ser ouvido."}
              </p>

            </header>


            {/* ===============================================
                IMAGEM GRANDE
            =============================================== */}

            <div
              className={
                styles.magicVisual
              }
            >

              {experienciaAtual && (

                <img
                  key={
                    experienciaAtual.id
                  }
                  src={
                    experienciaAtual.imagem
                  }
                  alt={
                    experienciaAtual.titulo
                  }
                />

              )}

            </div>


            {/* ===============================================
                NAVEGAÇÃO LOCAL
            =============================================== */}

            <div
              className={
                styles.localNavigation
              }
            >

              {produto.experiencia.map(
                (
                  item,
                  index
                ) => (

                  <button
                    type="button"
                    key={
                      item.id
                    }
                    className={
                      experienciaSelecionada ===
                      index
                        ? styles.localNavigationActive
                        : ""
                    }
                    onClick={() =>
                      setExperienciaSelecionada(
                        index
                      )
                    }
                  >

                    {item.menu}

                  </button>

                )
              )}

            </div>


            {/* ===============================================
                TEXTO
            =============================================== */}

            {experienciaAtual && (

              <div
                className={
                  styles.magicDescription
                }
              >

                <span>
                  {experienciaAtual.indice}
                </span>


                <h3>
                  {experienciaAtual.titulo}
                </h3>


                <p>
                  {experienciaAtual.descricao}
                </p>

              </div>

            )}

          </div>

        </section>


      </main>


      {/* =====================================================
          BARRA FIXA DE COMPRA

          Só aparece depois do hero.
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

        <div
          className={
            styles.buyBarContainer
          }
        >

          <div
            className={
              styles.buyBarInfo
            }
          >

            <strong>
              {produto.nome}
            </strong>


            <span>
              Magia para seus ouvidos.
            </span>

          </div>


          <div
            className={
              styles.buyBarActions
            }
          >

            <span
              className={
                styles.buyBarPrice
              }
            >
              {formatarPrecoProduto(produto.preco)}
            </span>


            <button
              type="button"
              className={
                styles.addCartButton
              }
                onClick={() => { adicionarAoCarrinho(); navigate("/carrinho"); }}
            >
              Adicionar ao carrinho
            </button>


            <button
              type="button"
              className={
                styles.buyNowButton
              }
              onClick={
                comprarAgora
              }
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
