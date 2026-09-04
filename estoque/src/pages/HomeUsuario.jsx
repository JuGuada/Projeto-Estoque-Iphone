import {
  useEffect,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import UserHeader from "../components/UserHeader";
import Footer from "../components/Footer";
import styles from "../styles/home.module.css";
import { API_URL, resolverUrlArquivo } from "../services/api.js";

let heroAnimationExecuted = false;
let ultimoLoginComHero = null;


/* =========================================================
   ÃCONES DOS FILTROS
========================================================= */

function MacIcon() {
  return (
    <svg
      viewBox="0 0 80 72"
      aria-hidden="true"
      className={styles.deviceSvg}
    >
      <rect
        x="9"
        y="8"
        width="62"
        height="41"
        rx="3"
      />

      <path d="M5 55h70" />
      <path d="M28 49v6" />
      <path d="M52 49v6" />
      <path d="M21 55h38" />
      <path d="M5 55c2 5 6 6 12 6h46c6 0 10-1 12-6" />
    </svg>
  );
}


function IphoneIcon() {
  return (
    <svg
      viewBox="0 0 54 76"
      aria-hidden="true"
      className={styles.deviceSvg}
    >
      <rect
        x="10"
        y="3"
        width="34"
        height="70"
        rx="9"
      />

      <path d="M21 8h12" />

      <circle
        cx="27"
        cy="66"
        r="1.2"
        className={styles.deviceDot}
      />
    </svg>
  );
}


function IpadIcon() {
  return (
    <svg
      viewBox="0 0 68 76"
      aria-hidden="true"
      className={styles.deviceSvg}
    >
      <rect
        x="8"
        y="4"
        width="52"
        height="68"
        rx="5"
      />

      <circle
        cx="34"
        cy="65"
        r="1.2"
        className={styles.deviceDot}
      />
    </svg>
  );
}


function AirpodsIcon() {
  return (
    <svg
      viewBox="0 0 82 78"
      aria-hidden="true"
      className={styles.deviceSvg}
    >
      <path
        d="
          M24 10
          C15 10 10 17 10 25
          C10 33 15 38 22 38
          C25 38 28 37 30 34
          L30 61
          C30 66 27 69 23 69
          C19 69 16 66 16 62
          L16 37
        "
      />

      <path
        d="
          M58 10
          C67 10 72 17 72 25
          C72 33 67 38 60 38
          C57 38 54 37 52 34
          L52 61
          C52 66 55 69 59 69
          C63 69 66 66 66 62
          L66 37
        "
      />

      <path d="M18 21c3-4 7-5 11-3" />
      <path d="M64 21c-3-4-7-5-11-3" />
    </svg>
  );
}


/* =========================================================
   FILTROS
========================================================= */

const categorias = [
  {
    id: "mac",
    nome: "Mac",
    Icone: MacIcon,
  },

  {
    id: "iphone",
    nome: "iPhone",
    Icone: IphoneIcon,
  },

  {
    id: "ipad",
    nome: "iPad",
    Icone: IpadIcon,
  },

  {
    id: "airpods",
    nome: "AirPods",
    Icone: AirpodsIcon,
  },
];


/* =========================================================
   PRODUTOS

   IMPORTANTE:
   futuramente esses ids devem ser os mesmos ids
   dos produtos vindos do seu banco/API.
========================================================= */

const familiaInicial = [
  {
    id: 1,

    nome: "MacBook Pro",

    categoria: "mac",

    descricao:
      "Desempenho profissional para transformar grandes ideias em realidade.",

    preco:
      "A partir de R$ 1.416,58/mÃªs",

    total:
      "ou R$ 16.999**",

    cor: "black",

    imagem:
      "/imagens/macbook.png",
  },

  {
    id: 2,

    nome: "MacBook Air",

    categoria: "mac",

    descricao:
      "Leve, rÃ¡pido e poderoso para acompanhar vocÃª durante todo o dia.",

    preco:
      "A partir de R$ 833,25/mÃªs",

    total:
      "ou R$ 9.999**",

    cor: "blue",

    imagem:
      "/imagens/macbook.png",
  },

  {
    /*
      Esse id 2 Ã© o id que aparece no seu
      cadastro administrativo do iPhone 16 Pro.

      Quando ligarmos o Carrinho diretamente
      Ã  API, nÃ£o serÃ¡ necessÃ¡rio manter isso
      manualmente.
    */

    id: 2,

    nome: "iPhone 16 Pro",

    categoria: "iphone",

    descricao:
      "Tecnologia avanÃ§ada, cÃ¢mera poderosa e desempenho extraordinÃ¡rio.",

    preco:
      "A partir de R$ 833,25/mÃªs",

    total:
      "ou R$ 9.999**",

    cor: "black",

    imagem:
      "/imagens/16Preto.png",
  },

  {
    id: 4,

    nome: "iPhone 16",

    categoria: "iphone",

    descricao:
      "Uma experiÃªncia completa em um design moderno e elegante.",

    preco:
      "A partir de R$ 666,58/mÃªs",

    total:
      "ou R$ 7.999**",

    cor: "light",

    imagem:
      "/imagens/16Preto.png",
  },

  {
    id: 5,

    nome: "iPad Pro",

    categoria: "ipad",

    descricao:
      "A experiÃªncia definitiva em iPad com a mais avanÃ§ada tecnologia.",

    preco:
      "A partir de R$ 1.416,58/mÃªs",

    total:
      "ou R$ 16.999**",

    cor: "black",

    imagem:
      "/imagens/IpadPreto.png",
  },

  {
    id: 6,

    nome: "iPad Air",

    categoria: "ipad",

    descricao:
      "Desempenho poderoso em um design fino, leve e versÃ¡til.",

    preco:
      "A partir de R$ 833,25/mÃªs",

    total:
      "ou R$ 9.999**",

    cor: "blue",

    imagem:
      "/imagens/IpadPrata.png",
  },

  {
    id: 7,

    nome: "AirPods Pro",

    categoria: "airpods",

    descricao:
      "Som envolvente e cancelamento de ruÃ­do para ouvir cada detalhe.",

    preco:
      "A partir de R$ 208,25/mÃªs",

    total:
      "ou R$ 2.499**",

    cor: "light",

    imagem:
      "/imagens/airpods.png",
  },

  {
    id: 8,

    nome: "AirPods",

    categoria: "airpods",

    descricao:
      "Ãudio incrÃ­vel e conexÃ£o simples para acompanhar todos os momentos.",

    preco:
      "A partir de R$ 133,25/mÃªs",

    total:
      "ou R$ 1.599**",

    cor: "blue",

    imagem:
      "/imagens/airpods.png",
  },
];

function normalizarCategoria(categoria) {
  const valor = categoria?.toString().trim().toLowerCase();

  if (valor === "tablet") return "ipad";
  if (valor === "airpod") return "airpods";

  return valor;
}

function normalizarPreco(valor) {
  if (typeof valor === "number") return valor;

  const numero = Number(String(valor || "")
    .replace(/R\$\s?/gi, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.-]/g, ""));

  return Number.isFinite(numero) ? numero : 0;
}

function normalizarProduto(produto, index) {
  const imagemDoEstoque = produto.imagem;

  try {
    const configuracao = typeof produto.vitrine_config === "string"
      ? JSON.parse(produto.vitrine_config || "{}")
      : produto.vitrine_config || {};
    produto = {
      ...produto,
      ...configuracao,
      // A imagem atual do estoque deve prevalecer sobre uma configuraÃ§Ã£o antiga da vitrine.
      imagem: imagemDoEstoque || configuracao.imagem,
    };
  } catch {
    // MantÃ©m os dados principais quando uma configuraÃ§Ã£o antiga estiver invÃ¡lida.
  }
  const preco = normalizarPreco(produto.preco ?? produto.precoVenda);
  const categoria = normalizarCategoria(produto.categoria);
  const precoFormatado = preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const imagem = produto.imagem || produto.imagemProduto || "/imagens/produto.png";

  return {
    ...produto,
    id: produto.id ?? index + 1,
    categoria,
    preco: typeof produto.preco === "string" ? produto.preco : `A partir de ${precoFormatado}/mÃªs`,
    total: produto.total || `ou ${precoFormatado}`,
    descricao: produto.descricao || "ConheÃ§a todos os detalhes deste produto.",
    imagem: resolverUrlArquivo(imagem),
  };
}


/* =========================================================
   EXPERIÃŠNCIAS
========================================================= */

const experiencias = [
  {
    categoria: "CRIATIVIDADE",

    titulo:
      "Ideias ganham forma.",

    descricao:
      "Crie, desenhe e transforme inspiraÃ§Ã£o em algo sÃ³ seu.",

    imagem:
      "/imagens/pintura.avif",

    alt:
      "Pessoa criando e desenhando em um iPad",
  },

  {
    categoria: "ESTUDOS",

    titulo:
      "Aprenda do seu jeito.",

    descricao:
      "Organize ideias, pesquise e desenvolva projetos em qualquer lugar.",

    imagem:
      "/imagens/estudo.webp",

    alt:
      "Estudante utilizando um MacBook",
  },

  {
    categoria: "MÃšSICA",

    titulo:
      "No seu ritmo.",

    descricao:
      "Sua mÃºsica com vocÃª, da concentraÃ§Ã£o aos momentos de pausa.",

    imagem:
      "/imagens/escuta.jpg",

    alt:
      "Pessoa ouvindo mÃºsica com AirPods",
  },

  {
    categoria: "CONEXÃƒO",

    titulo:
      "Perto, mesmo de longe.",

    descricao:
      "Compartilhe momentos e mantenha por perto quem importa.",

    imagem:
      "/imagens/chamada.jpg",

    alt:
      "Pessoa conversando pelo iPhone",
  },

  {
    categoria: "FOTOGRAFIA",

    titulo:
      "Um novo olhar.",

    descricao:
      "Registre detalhes e transforme momentos em lembranÃ§as.",

    imagem:
      "/imagens/foto.avif",

    alt:
      "Pessoa fotografando com iPhone",
  },
];


/* =========================================================
   COMPONENTE
========================================================= */

export default function Carrinho() {

  const navigate =
    useNavigate();
  const [animarHero] = useState(() => {
    const loginAtual = sessionStorage.getItem("home-hero-login");
    return !heroAnimationExecuted || loginAtual !== ultimoLoginComHero;
  });

  useEffect(() => {
    if (!animarHero) return undefined;

    const animationFrame = window.requestAnimationFrame(() => {
      heroAnimationExecuted = true;
      ultimoLoginComHero = sessionStorage.getItem("home-hero-login");
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [animarHero]);

  const [familia, setFamilia] = useState(familiaInicial);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await fetch(`${API_URL}/itens`);
        if (!resposta.ok) throw new Error("NÃ£o foi possÃ­vel carregar o catÃ¡logo.");

        const itens = await resposta.json();
        const salvos = JSON.parse(localStorage.getItem("produtos-personalizados") || "[]");
        const personalizados = new Map(salvos.map((produto) => [String(produto.id), produto]));
        const produtosSincronizados = itens
          .map((item) => ({
            ...(personalizados.get(String(item.id)) || {}),
            ...item,
          }))
          .filter((produto) => categorias.some(
            (categoria) => categoria.id === normalizarCategoria(produto.categoria)
          ));

        const produtosComVitrine = produtosSincronizados.map((item) => {
          try {
            const configuracao = typeof item.vitrine_config === "string"
              ? JSON.parse(item.vitrine_config || "{}")
              : item.vitrine_config || {};
            return {
              ...item,
              ...configuracao,
              // MantÃ©m a imagem que acabou de vir da API, mesmo com uma vitrine antiga salva.
              imagem: item.imagem || configuracao.imagem,
            };
          } catch {
            return item;
          }
        });
        localStorage.setItem("produtos-personalizados", JSON.stringify(produtosComVitrine));
        setFamilia(produtosComVitrine.map(normalizarProduto));
      } catch (error) {
        console.error("Erro ao carregar produtos da Home:", error);

        const produtosSalvos = JSON.parse(localStorage.getItem("produtos-personalizados") || "[]")
          .map(normalizarProduto)
          .filter((produto) => categorias.some((categoria) => categoria.id === produto.categoria));
        if (produtosSalvos.length > 0) setFamilia(produtosSalvos);
      }
    }

    carregarProdutos();
  }, []);


  const [
    categoriaSelecionada,
    setCategoriaSelecionada
  ] = useState(null);


  const [
    carouselIndex,
    setCarouselIndex
  ] = useState(0);


  /* =========================================================
     FILTRO DOS PRODUTOS
  ========================================================= */

  const produtosFiltrados =
    categoriaSelecionada
      ? familia.filter(
          (produto) =>
            produto.categoria ===
            categoriaSelecionada
        )
      : familia;


  const nomeCategoriaSelecionada =
    categorias.find(
      (categoria) =>
        categoria.id ===
        categoriaSelecionada
    )?.nome;


  function selecionarCategoria(id) {

    setCategoriaSelecionada(
      (categoriaAtual) =>
        categoriaAtual === id
          ? null
          : id
    );

  }


  /* =========================================================
     ABRIR DETALHES

     ESSA Ã‰ A PARTE NOVA.
  ========================================================= */

  function abrirDetalhesProduto(produto) {
    const categoria = produto.categoria?.toString().toLowerCase();

    if (!categoria || !produto.id) {
      console.warn("Produto sem categoria ou ID:", produto);
      return;
    }

    navigate(`/produto/${categoria}/${produto.id}`);

  }

  function comprarAgora(produto) {
    localStorage.setItem('carrinho', JSON.stringify([{
      id: produto.id,
      nome: produto.nome,
      modelo: produto.modelo,
      preco: produto.preco,
      categoria: produto.categoria,
      quantidade: 1,
      cor: produto.cor || '',
      imagem: produto.imagem || produto.capa || produto.imagemPrincipal || '/imagens/produto.png',
    }]));
    localStorage.removeItem('pedido_em_andamento');
    navigate('/finalizar-compra');
  }


  /* =========================================================
     REINICIA CARROSSEL AO FILTRAR
  ========================================================= */

  useEffect(() => {

    setCarouselIndex(0);

  }, [categoriaSelecionada]);


  /* =========================================================
     CARROSSEL
  ========================================================= */

  const produtosPorTela = 4;


  const maxCarouselIndex =
    Math.max(
      0,
      produtosFiltrados.length -
        produtosPorTela
    );


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


  return (

    <div className={styles.page}>

      <UserHeader />


      <main>


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className={`${styles.hero} ${animarHero ? '' : styles.heroReady}`}>

          <div className={styles.heroText}>

            <h1>
              Um lugar para exibir suas
              <br />
              melhores escolhas.
            </h1>

          </div>


          <div className={styles.heroAnimation}>


            <div
              className={`
                ${styles.artCard}
                ${styles.art1}
              `}
            >
              <img className={styles.heroCardImage} src="/imagens/card1.jpg" alt="Criatividade" />

            </div>


            <div
              className={`
                ${styles.artCard}
                ${styles.art2}
              `}
            >
              <img className={styles.heroCardImage} src="/imagens/card2.jpg" alt="Criatividade" />

            </div>


            <div
              className={`
                ${styles.artCard}
                ${styles.art3}
              `}
            >
              <img className={styles.heroCardImage} src="/imagens/card3.jpg" alt="Criatividade" />

            </div>


            <div
              className={`
                ${styles.artCard}
                ${styles.art4}
              `}
            >
              <img className={styles.heroCardImage} src="/imagens/card4.jpg" alt="Acessibilidade" />

            </div>


            <div
              className={`
                ${styles.artCard}
                ${styles.art5}
              `}
            >
              <img className={styles.heroCardImage} src="/imagens/card5.jpg" alt="Acessibilidade" />

            </div>


            <div
              className={`
                ${styles.artCard}
                ${styles.mainArt}
              `}
            >
              <img className={styles.heroCardImage} src="/imagens/card6.jpg" alt="Acessibilidade" />

            </div>


            <div
              className={`
                ${styles.comment}
                ${styles.commentLeft}
              `}
            >
              Criatividade
            </div>


            <div
              className={`
                ${styles.comment}
                ${styles.commentRight}
              `}
            >
              Acessibilidade
            </div>

          </div>


          <div className={styles.heroDescription}>

            <p>
              Descubra produtos, ideias e experiÃªncias feitas
              para transformar a sua forma de criar.
            </p>


            <div className={styles.heroButtons}>

              <a
                href="#produtos"
                className={styles.primaryButton}
              >
                Explorar produtos
              </a>


              <a
                href="#experiencias"
                className={styles.textButton}
              >
                Saiba mais
              </a>

            </div>

          </div>

        </section>


        {/* =====================================================
            FILTROS
        ===================================================== */}

        <section className={styles.categories}>

          <div className={styles.categoriesTitle}>

            <h2>
              O melhor jeito de
              <br />

              <span>
                comprar o que vocÃª ama.
              </span>
            </h2>


            <p>
              Escolha uma categoria para encontrar
              o produto ideal para vocÃª.
            </p>

          </div>


          <div className={styles.categoryList}>

            {categorias.map(
              (categoria) => {

                const Icone =
                  categoria.Icone;


                const selecionada =
                  categoriaSelecionada ===
                  categoria.id;


                return (

                  <button
                    type="button"
                    key={categoria.id}
                    aria-pressed={selecionada}
                    onClick={() =>
                      selecionarCategoria(
                        categoria.id
                      )
                    }
                    className={`
                      ${styles.category}
                      ${
                        selecionada
                          ? styles.categorySelected
                          : ""
                      }
                    `}
                  >

                    <div
                      className={
                        styles.categoryIconArea
                      }
                    >
                      <Icone />
                    </div>


                    <strong>
                      {categoria.nome}
                    </strong>

                  </button>

                );

              }
            )}

          </div>

        </section>


        {/* =====================================================
            PRODUTOS / CARROSSEL
        ===================================================== */}

        <section
          id="produtos"
          className={styles.familySection}
        >

          <div className={styles.familyContainer}>

            <div className={styles.familyHeading}>

              <div>

                <span
                  className={
                    styles.sectionEyebrow
                  }
                >
                  PRODUTOS
                </span>


                <h2>

                  {categoriaSelecionada
                    ? `ConheÃ§a ${nomeCategoriaSelecionada}.`
                    : "ConheÃ§a a famÃ­lia."}

                </h2>

              </div>


              <div
                className={
                  styles.familyHeadingRight
                }
              >

                {categoriaSelecionada && (

                  <button
                    type="button"
                    className={
                      styles.clearFilter
                    }
                    onClick={() =>
                      setCategoriaSelecionada(
                        null
                      )
                    }
                  >

                    Ver todos

                    <span>
                      Ã—
                    </span>

                  </button>

                )}

              </div>

            </div>


            {/* ===============================================
                VIEWPORT
            =============================================== */}

            <div className={styles.carouselViewport}>


              <div
                className={
                  styles.familyCarousel
                }
                style={{
                  transform:
                    `translateX(calc(-${carouselIndex} * (25% + 4.5px)))`
                }}
              >


                {produtosFiltrados.map(
                  (produto) => (

                    <article
                      className={
                        styles.familyCard
                      }
                      key={`${produto.categoria}-${produto.id}-${produto.nome}`}
                    >


                      {/* =====================================
                          IMAGEM
                      ===================================== */}

                      <div
                        className={`
                          ${styles.familyVisual}
                          ${styles[produto.cor]}
                        `}
                      >

                        <img
                          src={
                            produto.imagem
                          }
                          alt={
                            produto.nome
                          }
                          className={
                            styles.familyProductImage
                          }
                        />

                      </div>


                      {/* =====================================
                          CORES
                      ===================================== */}

                      <div
                        className={
                          styles.colorDots
                        }
                      >
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>


                      {/* =====================================
                          INFORMAÃ‡Ã•ES
                      ===================================== */}

                      <h3>
                        {produto.nome}
                      </h3>


                      <p
                        className={
                          styles.familyDescription
                        }
                      >
                        {produto.descricao}
                      </p>


                      <p
                        className={
                          styles.familyPrice
                        }
                      >

                        {produto.preco}

                        <br />

                        {produto.total}

                      </p>


                      {/* =====================================
                          AÃ‡Ã•ES
                      ===================================== */}

                      <div
                        className={
                          styles.familyActions
                        }
                      >


                        {/* NOVO BOTÃƒO */}

                        <button
                          type="button"
                          className={
                            styles.learnButton
                          }
                          onClick={() =>
                            abrirDetalhesProduto(
                              produto
                            )
                          }
                        >
                          Saiba mais
                        </button>


                        <button
                          type="button"
                          onClick={() => comprarAgora(produto)}
                          className={
                            styles.buyLink
                          }
                        >
                          Comprar â€º
                        </button>

                      </div>

                    </article>

                  )
                )}

              </div>

            </div>


            {/* ===============================================
                CONTROLES
            =============================================== */}

            <div
              className={
                styles.sliderControls
              }
            >

              <button
                type="button"
                onClick={anterior}
                disabled={
                  carouselIndex === 0
                }
                aria-label="Produto anterior"
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
                aria-label="PrÃ³ximo produto"
              >
                â€º
              </button>

            </div>

          </div>

        </section>


        {/* =====================================================
            EXPERIÃŠNCIAS
        ===================================================== */}

        <section
          id="experiencias"
          className={styles.community}
        >

          <div className={styles.communityContainer}>

            <div className={styles.communityHeading}>

              <div>

                <span
                  className={
                    styles.sectionEyebrow
                  }
                >
                  EXPERIÃŠNCIAS
                </span>


                <h2>
                  Feito para fazer parte
                  <br />

                  <span>
                    do seu dia.
                  </span>
                </h2>


                <p
                  className={
                    styles.communityDescription
                  }
                >
                  Tecnologia Ã© sÃ³ o comeÃ§o.
                  Ela acompanha suas ideias,
                  sua rotina e os momentos
                  que fazem parte de vocÃª.
                </p>

              </div>

            </div>


            <div className={styles.communityGrid}>

              {experiencias.map(
                (item) => (

                  <article
                    className={
                      styles.experienceCard
                    }
                    key={
                      item.categoria
                    }
                  >

                    <div
                      className={
                        styles.experienceText
                      }
                    >

                      <span>
                        {item.categoria}
                      </span>


                      <h3>
                        {item.titulo}
                      </h3>


                      <p>
                        {item.descricao}
                      </p>

                    </div>


                    <div
                      className={
                        styles.experienceImage
                      }
                    >

                      <img
                        src={
                          item.imagem
                        }
                        alt={
                          item.alt
                        }
                      />

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        </section>


        {/* =====================================================
            NOSSO JEITO
        ===================================================== */}

        <section className={styles.story}>

          <div className={styles.storyContainer}>


            {/* =========================
                TEXTO
            ========================== */}

            <div className={styles.storyText}>

              <span>
                NOSSO JEITO
              </span>


              <h2>

                Menos sobre ter.

                <br />


                <em>
                  Mais sobre
                  <br />
                  aproveitar.
                </em>

              </h2>


              <p>
                A melhor experiÃªncia vai alÃ©m do produto.
                EstÃ¡ no que vocÃª cria, descobre e vive
                com ele todos os dias.
              </p>

            </div>


            {/* =========================
                3 IMAGENS
            ========================== */}

            <div className={styles.storyGallery}>


              <div className={styles.storyMainCard}>

                <img
                  src="/imagens/amigos.jpg"
                  alt="Pessoas aproveitando tecnologia juntas"
                />

              </div>


              <div
                className={
                  styles.storySideCards
                }
              >

                <div
                  className={
                    styles.storySmallCard
                  }
                >

                  <img
                    src="/imagens/trabalho.webp"
                    alt="Tecnologia fazendo parte do trabalho"
                  />

                </div>


                <div
                  className={
                    styles.storySmallCard
                  }
                >

                  <img
                    src="/imagens/musica.jpg"
                    alt="MÃºsica fazendo parte do dia"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            DIFERENCIAL / HISTÃ“RIA
        ===================================================== */}

        <section className={styles.difference}>

          <div
            className={
              styles.differenceImageWrap
            }
          >

            <img
              src="/imagens/historia.png"
              alt="Nossa histÃ³ria"
              className={
                styles.differenceImage
              }
            />

          </div>


          <div
            className={
              styles.differenceText
            }
          >

            <span>
              NOSSA HISTÃ“RIA
            </span>


            <h2>

              Uma ideia que
              <br />

              ganhou forma.

              <br />


              <em>
                E continua evoluindo.
              </em>

            </h2>


            <p>
              ComeÃ§amos com a vontade de criar algo
              simples, cuidadoso e prÃ³ximo das pessoas.
              Aos poucos, cada detalhe encontrou seu
              lugar e transformou uma ideia em uma
              experiÃªncia que continua crescendo.
            </p>

          </div>

        </section>


      </main>

      <Footer />

    </div>

  );

}

