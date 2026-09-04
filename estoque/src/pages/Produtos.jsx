import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/produto.module.css";
import AdminLayout from '../components/AdminLayout';
import { API_URL, apiRequest } from '../services/api.js';
import { iphoneFallback } from './ProdutoIphone.jsx';
import { macFallback } from './ProdutoMac.jsx';
import { ipadFallback } from './ProdutoIpad.jsx';
import { airpodsFallback } from './ProdutoAirpods.jsx';
import { converterPrecoParaNumero, formatarPrecoProduto } from '../utils/produto.js';

const imagemProdutoLista = (item) => {
  if (item?.imagem) return item.imagem.startsWith('/uploads/') ? `${API_URL}${item.imagem}` : item.imagem;
  const categoria = String(item?.categoria || '').trim().toLowerCase();
  return {
    iphone: '/imagens/celular1.png',
    mac: '/imagens/macbook.png',
    ipad: '/imagens/tablet.png',
    airpods: '/imagens/airpods.png',
  }[categoria] || '/imagens/produto.png';
};

const produtosIniciais = [
  {
    id: 1,
    nome: "iPhone 17",
    categoria: "iphone",
    modelo: "iPhone 17",
    sku: "IPHONE17-256",
    status: "Em estoque",
    preco: "R$ 7.999",
    cor: "#8c6fc7",

    video: "/videos/apple.mp4",

    descricao:
      "Um novo iPhone pensado para oferecer desempenho, câmeras incríveis e um design ainda mais resistente.",

   destaques: [
  {
    id: 1,
    titulo: "Nova Câmera",
    texto:
      "Nova câmera frontal Center Stage. Flexibilidade para enquadrar. Selfies em grupo mais inteligentes. E muito mais.",
    imagem: "/imagens/primeira.png",
  },
  {
    id: 2,
    titulo: "Sistema",
    texto:
      "Sistema de câmera dupla Fusion de 48 MP. De perto ou de longe, as fotos ficam incríveis.",
    imagem: "/imagens/segunda.png",
  },
],

    detalhes: {
      titulo: "Ainda mais durável.",
      subtitulo: "Ainda mais adorável.",
    },

    camera: {
      titulo: "Câmera frontal",
      subtitulo: "Center Stage de 18 MP. Uma grande virada.",
      texto:
        "A nova câmera frontal traz mais flexibilidade para enquadrar fotos e vídeos. Toque para ampliar o campo de visão e mudar da vertical para a horizontal sem girar o iPhone.",
      imagem: "/imagem/camera-frontal.jpg",
      tabs: [
        {
          id: 1,
          label: "Visão geral",
          titulo: "Uma câmera feita para você.",
          texto: "Capture seus melhores momentos com mais detalhes, qualidade e flexibilidade.",
          imagem: "/imagem/camera-frontal.jpg",
        },
        {
          id: 2,
          label: "Enquadramento",
          titulo: "Enquadre do seu jeito.",
          texto: "Tenha mais liberdade para escolher o enquadramento ideal para suas fotos.",
          imagem: "/imagem/camera-enquadramento.jpg",
        },
        {
          id: 3,
          label: "Vídeo",
          titulo: "Vídeos ainda mais incríveis.",
          texto: "Registre seus momentos com movimento suave e qualidade impressionante.",
          imagem: "/imagem/camera-video.jpg",
        },
      ],
    },
  },

  {
    id: 2,
    nome: "iPhone 16 Pro",
    categoria: "iphone",
    modelo: "iPhone 16 Pro",
    sku: "IPHONE16P-256",
    status: "Em estoque",
    preco: "R$ 7.799",
    cor: "#7c91b8",

    video: "/videos/apple.mp4",

    descricao:
      "Desempenho profissional, acabamento sofisticado e tecnologia para todos os momentos.",

    destaques: [
      {
        id: 1,
        titulo: "Potência profissional.",
        texto:
          "Desempenho preparado para tarefas exigentes e experiências mais rápidas.",
      },
    ],

    detalhes: {
      titulo: "Ainda mais durável.",
      subtitulo: "Ainda mais adorável.",
    },

    camera: {
      titulo: "Câmeras Pro",
      subtitulo: "Detalhes em todos os momentos.",
      texto:
        "Um sistema de câmeras desenvolvido para capturar fotos e vídeos com muito mais detalhes.",
      imagem: "/imagem/camera-frontal.jpg",
      tabs: [
        {
          id: 1,
          label: "Visão geral",
          titulo: "Uma câmera feita para você.",
          texto: "Capture seus melhores momentos com mais detalhes, qualidade e flexibilidade.",
          imagem: "/imagens/camera1.png",
        },
        {
          id: 2,
          label: "Enquadramento",
          titulo: "Enquadre do seu jeito.",
          texto: "Tenha mais liberdade para escolher o enquadramento ideal para suas fotos.",
          imagem: "/imagens/camera2.png",
        },
        {
          id: 3,
          label: "Vídeo",
          titulo: "Vídeos ainda mais incríveis.",
          texto: "Registre seus momentos com movimento suave e qualidade impressionante.",
          imagem: "/imagens/camera3.png",
        },
      ],
    },
  },

  {
    id: 3,
    nome: "MacBook Neo",
    categoria: "mac",
    modelo: "MacBook Neo",
    sku: "MACBOOK-256",
    status: "Em estoque",
    preco: "R$ 7.299",
    cor: "#6f8e9f",

    video: "/videos/mac.mp4",

    descricao:
      "Um computador elegante, rápido e preparado para acompanhar sua rotina.",

    destaques: [
      {
        id: 1,
        titulo: "Feito para ir além.",
        texto:
          "Desempenho e mobilidade em um computador pensado para todos os dias.",
      },
    ],

    detalhes: {
      titulo: "Ainda mais durável.",
      subtitulo: "Ainda mais adorável.",
    },

    camera: {
      titulo: "Câmera integrada",
      subtitulo: "Sua imagem com mais qualidade.",
      texto:
        "Faça chamadas e reuniões com uma experiência mais clara e natural.",
      imagem: "/imagem/camera-frontal.jpg",
      tabs: [
        {
          id: 1,
          label: "Visão geral",
          titulo: "Uma câmera feita para você.",
          texto: "Capture seus melhores momentos com mais detalhes, qualidade e flexibilidade.",
          imagem: "/imagem/camera-frontal.jpg",
        },
        {
          id: 2,
          label: "Enquadramento",
          titulo: "Enquadre do seu jeito.",
          texto: "Tenha mais liberdade para escolher o enquadramento ideal para suas fotos.",
          imagem: "/imagem/camera-enquadramento.jpg",
        },
        {
          id: 3,
          label: "Vídeo",
          titulo: "Vídeos ainda mais incríveis.",
          texto: "Registre seus momentos com movimento suave e qualidade impressionante.",
          imagem: "/imagem/camera-video.jpg",
        },
      ],
    },
  },
];
const urlMidia = (caminho) => caminho?.startsWith('/uploads/') ? `${API_URL}${caminho}` : caminho;
const urlVideo = (caminho = "") => {
  const valor = String(caminho).trim().replace(/\\/g, "/");
  if (!valor) return "";
  if (/^(https?:|blob:|data:)/i.test(valor) || valor.startsWith("/uploads/")) return urlMidia(valor);
  const semPublic = valor.replace(/^\.?\/?public\//i, "").replace(/^\//, "");
  return semPublic.startsWith("videos/") ? `/${semPublic}` : `/videos/${semPublic}`;
};

const apresentacaoPorCategoria = {
  iphone: {
    nome: "iPhone", secao: "Câmeras.", classe: "previewIphone", imagem: "/imagens/camera1.png",
    cores: [
      { id: "lavanda", nome: "Lavanda", cor: "#8c6fc7", imagem: "/imagens/iphone-lavanda.jpg" },
      { id: "verde", nome: "Verde", cor: "#a7b58b", imagem: "/imagens/iphone-verde.jpg" },
      { id: "azul", nome: "Azul", cor: "#8ca9cf", imagem: "/imagens/iphone-azul.jpg" },
      { id: "branco", nome: "Branco", cor: "#f4f4f4", imagem: "/imagens/iphone-branco.jpg" },
      { id: "preto", nome: "Preto", cor: "#333333", imagem: "/imagens/iphone-preto.jpg" },
    ],
  },
  mac: {
    nome: "Mac", secao: "Desempenho.", classe: "previewMac", imagem: "/imagens/MacBook2.png",
    cores: [
      { id: "azul", nome: "Azul-céu", cor: "#8197ae", imagem: "/imagens/macAzul.png" },
      { id: "amarelo", nome: "Amarelo", cor: "#ddd07b", imagem: "/imagens/macAmarelo.png" },
      { id: "rosa", nome: "Rosa", cor: "#d8b8b7", imagem: "/imagens/macRosa.png" },
      { id: "prata", nome: "Prata", cor: "#d7d7d5", imagem: "/imagens/macBranco.png" },
    ],
  },
  ipad: {
    nome: "iPad", secao: "Tela.", classe: "previewIpad", imagem: "/imagens/IpadPreto.png",
    cores: [
      { id: "preto", nome: "Preto-espacial", cor: "#2f3033", imagem: "/imagens/IpadPreto.png" },
      { id: "prata", nome: "Prateado", cor: "#d8d9da", imagem: "/imagens/IpadPrata.png" },
    ],
  },
  airpods: {
    nome: "AirPods", secao: "Experiência.", classe: "previewAirpods", imagem: "/imagens/airpods.png",
    cores: [
      { id: "branco", nome: "Branco", cor: "#f4f4f2", imagem: "/imagens/airpods.png" },
      { id: "estojo", nome: "Com estojo", cor: "#dededb", imagem: "/imagens/airpods2.png" },
    ],
  },
};

function obterCategoria(produto) {
  const categoria = produto?.categoria?.toString().trim().toLowerCase();
  if (apresentacaoPorCategoria[categoria]) return categoria;

  const nome = `${produto?.nome || ""} ${produto?.modelo || ""}`.toLowerCase();
  if (nome.includes("mac")) return "mac";
  if (nome.includes("ipad") || nome.includes("tablet")) return "ipad";
  if (nome.includes("airpod") || nome.includes("fone")) return "airpods";
  return "iphone";
}

function criarMoldeVazio(item, categoria) {
  const imagemPrincipal = item.imagem || "";
  const corPrincipal = item.cor || "#d9d9de";
  const cores = imagemPrincipal ? [{ id: `principal-${item.id}`, nome: item.cor || "Principal", cor: corPrincipal, imagem: imagemPrincipal }] : [];
  const base = {
    video: "",
    cores,
    destaques: [],
    textosVitrine: { destaquesTitulo: "", detalhesTitulo: "", detalhesDescricao: "", extraTitulo: "", extraDescricao: "", overlayTitulo: "", overlayDescricao: "" },
  };
  if (categoria === "iphone") return {
    ...base,
    detalhes: { titulo: iphoneFallback.detalhes.titulo, subtitulo: iphoneFallback.detalhes.subtitulo },
    informacoes: [],
    camera: {
      label: iphoneFallback.camera.label || "Câmeras.",
      titulo: iphoneFallback.camera.titulo,
      subtitulo: iphoneFallback.camera.subtitulo,
      texto: "",
      imagem: "",
      tabs: [],
    },
    textosVitrine: {
      ...base.textosVitrine,
      destaquesTitulo: "Comece pelos destaques.",
      detalhesTitulo: "Conheça cada detalhe.",
    },
  };
  if (categoria === "mac") return { ...base, detalhesMac: [], performance: [] };
  if (categoria === "ipad") return { ...base, detalhesIpad: [] };
  return { ...base, detalhesAirpods: [], experienciaAirpods: [] };
}

function normalizarProduto(item) {
  let configuracaoSalva = {};
  try {
    configuracaoSalva = typeof item.vitrine_config === "string"
      ? JSON.parse(item.vitrine_config || "{}")
      : item.vitrine_config || {};
  } catch {
    configuracaoSalva = {};
  }
  item = { ...item, ...configuracaoSalva, ...item, ...configuracaoSalva };
  const categoria = obterCategoria(item);
  const fallback = { iphone: iphoneFallback, mac: macFallback, ipad: ipadFallback, airpods: airpodsFallback }[categoria];
  const nomeNormalizado = `${item.nome || ""} ${item.modelo || ""}`.toLowerCase();
  const ehProdutoModelo = (
    categoria === "iphone" && Number(item.id) === Number(iphoneFallback.id) && nomeNormalizado.includes("iphone 17")
  ) || (
    categoria === "mac" && (nomeNormalizado.includes("macbook pro") || nomeNormalizado.includes("macbook neo"))
  ) || (
    categoria === "ipad" && nomeNormalizado.includes("ipad pro")
  ) || (
    categoria === "airpods" && (nomeNormalizado.includes("airpods pro 3") || nomeNormalizado.includes("airpods 3 pro"))
  );
  const baseVisual = ehProdutoModelo ? fallback : criarMoldeVazio(item, categoria);
  const textosPadrao = {
    iphone: { destaquesTitulo: "Comece pelos destaques.", detalhesTitulo: "Conheça cada detalhe.", detalhesDescricao: "Explore o design, as cores e os recursos que tornam este iPhone único." },
    mac: { destaquesTitulo: "Comece pelos destaques.", detalhesTitulo: "Conheça cada detalhe.", detalhesDescricao: "Explore cores, tela, câmera, teclado e tudo o que faz parte da experiência do Mac.", extraTitulo: "Para você fazer e acontecer.", extraDescricao: "Potência para as tarefas do dia a dia, criatividade para transformar ideias e desempenho para acompanhar tudo o que você quiser fazer." },
    ipad: { destaquesTitulo: "Comece pelos destaques.", detalhesTitulo: "Explore os detalhes.", detalhesDescricao: "Conheça de perto os elementos que tornam o iPad tão versátil.", extraTitulo: "Possibilidades em todas as frentes.", extraDescricao: "Um espaço flexível para criar, trabalhar, estudar e transformar ideias em projetos.", overlayTitulo: "Um universo de possibilidades.", overlayDescricao: "Trabalhe com vários apps, crie projetos, organize ideias e transforme o iPad em um espaço para tudo o que você quiser fazer." },
    airpods: { destaquesTitulo: "Comece pelos destaques.", detalhesTitulo: "Explore os detalhes.", detalhesDescricao: "Descubra como cada detalhe foi pensado para tornar a experiência mais confortável, simples e envolvente.", extraTitulo: "Magia para seus ouvidos.", extraDescricao: "Uma experiência que aproxima você da música, das conversas e de tudo que merece ser ouvido." },
  }[categoria];
  const chaveDestaques = categoria === "iphone" ? "destaques" : `destaques${categoria === "airpods" ? "Airpods" : categoria === "ipad" ? "Ipad" : "Mac"}`;
  const destaquesOriginais = ehProdutoModelo && !(item[chaveDestaques]?.length || item.destaques?.length)
    ? fallback.destaques
    : Array.isArray(item[chaveDestaques])
    ? item[chaveDestaques]
    : Array.isArray(item.destaques)
      ? item.destaques
      : (baseVisual.destaques || []);
  const destaques = destaquesOriginais.map((destaque) => ({
    ...destaque,
    texto: destaque.texto ?? destaque.descricao ?? "",
    descricao: destaque.descricao ?? destaque.texto ?? "",
  }));

  const comum = {
    ...baseVisual,
    ...item,
    categoria,
    video: ehProdutoModelo ? (item.video || fallback.video) : (item.video ?? baseVisual.video ?? ""),
    cores: ehProdutoModelo && !item.cores?.length ? fallback.cores : (Array.isArray(item.cores) ? item.cores : (baseVisual.cores || [])),
    destaques,
    [chaveDestaques]: destaques,
    textosVitrine: Object.fromEntries(Object.entries({ ...(ehProdutoModelo ? textosPadrao : baseVisual.textosVitrine), ...(item.textosVitrine || {}) }).map(([chave, valor]) => [chave, ehProdutoModelo && !valor ? textosPadrao[chave] || "" : valor])),
  };

  if (categoria === "iphone") {
    return {
      ...comum,
      informacoes: ehProdutoModelo && !item.informacoes?.length ? iphoneFallback.informacoes : (Array.isArray(item.informacoes) ? item.informacoes : (baseVisual.informacoes || [])),
      detalhes: ehProdutoModelo ? { titulo: item.detalhes?.titulo || iphoneFallback.detalhes.titulo, subtitulo: item.detalhes?.subtitulo || iphoneFallback.detalhes.subtitulo } : { ...(item.detalhes || {}), titulo: item.detalhes?.titulo || baseVisual.detalhes?.titulo || "", subtitulo: item.detalhes?.subtitulo || baseVisual.detalhes?.subtitulo || "" },
      camera: {
        ...(ehProdutoModelo ? iphoneFallback.camera : baseVisual.camera),
        ...(item.camera || {}),
        titulo: ehProdutoModelo ? (item.camera?.titulo || iphoneFallback.camera.titulo) : (item.camera?.titulo || baseVisual.camera?.titulo || ""),
        subtitulo: ehProdutoModelo ? (item.camera?.subtitulo || iphoneFallback.camera.subtitulo) : (item.camera?.subtitulo || baseVisual.camera?.subtitulo || ""),
        texto: ehProdutoModelo ? (item.camera?.texto || iphoneFallback.camera.texto) : (item.camera?.texto || ""),
        imagem: ehProdutoModelo ? (item.camera?.imagem || iphoneFallback.camera.imagem) : (item.camera?.imagem || ""),
        tabs: ehProdutoModelo && !item.camera?.tabs?.length ? iphoneFallback.camera.tabs : (Array.isArray(item.camera?.tabs) ? item.camera.tabs : (baseVisual.camera?.tabs || [])),
      },
    };
  }

  if (categoria === "mac") {
    return {
      ...comum,
      detalhesMac: ehProdutoModelo && !item.detalhesMac?.length ? macFallback.detalhes : (Array.isArray(item.detalhesMac) ? item.detalhesMac : (baseVisual.detalhesMac || [])),
      performance: ehProdutoModelo && !item.performance?.length ? macFallback.performance : (Array.isArray(item.performance) ? item.performance : (baseVisual.performance || [])),
    };
  }

  if (categoria === "ipad") {
    return {
      ...comum,
      detalhesIpad: ehProdutoModelo && !item.detalhesIpad?.length ? ipadFallback.detalhes : (Array.isArray(item.detalhesIpad) ? item.detalhesIpad : (baseVisual.detalhesIpad || [])),
    };
  }

  return {
    ...comum,
    detalhesAirpods: !item.detalhesAirpods?.length
      ? airpodsFallback.detalhes
      : item.detalhesAirpods,
    experienciaAirpods: !item.experienciaAirpods?.length
      ? airpodsFallback.experiencia
      : item.experienciaAirpods,
  };
}

function MonitorDetalhesProduto({ produto }) {
const [corSelecionada, setCorSelecionada] = useState(0);
const [detalheSelecionado, setDetalheSelecionado] = useState(null);
const categoria = obterCategoria(produto);
const config = apresentacaoPorCategoria[categoria];
const cores = Array.isArray(produto.cores) ? produto.cores : [];

useEffect(() => {
  setCorSelecionada(0);
}, [produto.id, categoria]);

const corAtual = cores[corSelecionada] || cores[0];
const detalheAtual = (produto.informacoes || []).find((item) => item.id === detalheSelecionado);
const imagemAtual = detalheAtual?.imagem || corAtual?.imagem;

  return (
    <section className={styles.previewDetalhes}>
      <div className={styles.detalhesIntro}>
        <h2>{produto.detalhes?.titulo || ""}</h2>
        <h3>{produto.detalhes?.subtitulo || ""}</h3>
        <p>{produto.descricao}</p>
      </div>

      <div className={styles.detalhesCard}>
        <div className={styles.detalhesMenu}>
          <div className={styles.coresBox}>
            <strong>Cores.</strong>
            <span>Escolha a cor do produto.</span>
            <div className={styles.coresLista}>
             {cores.map((item, index) => (
  <button
    key={item.id}
    type="button"
    className={`${styles.corBolinha} ${
      corSelecionada === index
        ? styles.corSelecionada
        : ""
    }`}
    style={{
      backgroundColor: item.cor,
    }}
    onClick={() => {
      setCorSelecionada(index);
    }}
  />
))}
            </div>
          </div>

          {(produto.informacoes || []).map((informacao) => {
            const estaAberto = detalheSelecionado === informacao.id;

            return (
              <div key={informacao.id} className={styles.detalheItemInfo}>
                <button
                  type="button"
                  className={styles.detalheBotaoInfo}
                  onClick={() => setDetalheSelecionado((atual) => atual === informacao.id ? null : informacao.id)}
                >
                  <span className={styles.detalheMais}>{estaAberto ? "−" : "+"}</span>
                  <strong>{informacao.nome}</strong>
                </button>
                {estaAberto && informacao.valor && (
                  <p className={styles.detalheDescricaoInfo}>{informacao.valor}</p>
                )}
              </div>
            );
          })}
        </div>

        <div className={`${styles.detalhesImagem} ${styles[`detalhesImagem_${categoria}`] || ""}`}>
        {imagemAtual ? <img className={styles.detalhesProdutoImagem} src={urlMidia(imagemAtual)} alt={detalheAtual?.nome || `${produto.nome} - ${corAtual?.nome || "produto"}`} /> : <div className={styles.emptyMedia}>Adicione uma imagem para este detalhe</div>}
        </div>
      </div>
    </section>
  );
}

function PreviewProduto({ produto }) {
  const [secaoCamera, setSecaoCamera] = useState(0);

  const categoria = obterCategoria(produto);
  const config = apresentacaoPorCategoria[categoria];
  const dadosSecao = produto.camera || {};
  const cameraTabs = dadosSecao.tabs || [];
  const imagemSecao = cameraTabs[secaoCamera]?.imagem;
  const imagemValida = imagemSecao || dadosSecao.imagem || "";

  useEffect(() => {
    setSecaoCamera(0);
  }, [produto.id]);

  return (
    <div
      className={`${styles.previewPage} ${styles[config.classe]}`}
      style={{
        "--produto-cor": produto.cor || "#3974cc",
      }}
    >
      {/* NAVEGAÇÃO DA PÁGINA DO CLIENTE */}
      <nav className={styles.previewNav}>
        <div className={styles.previewBrand}>{produto.nome}</div>

        <div className={styles.previewLinks}>
          <a href="#comprar">Comprar</a>
          <a href="#destaques">Destaques</a>
          <a href="#cameras">{config.secao.replace(".", "")}</a>
        </div>

        <button className={styles.previewBuy}>Comprar</button>
      </nav>

      {/* ================= COMPRAR ================= */}
      <section id="comprar" className={styles.previewHero}>
        <div className={styles.heroVideo}>
          {produto.video ? <video
            src={urlVideo(produto.video)}
            autoPlay
            muted
            loop
            playsInline
          /> : <div className={styles.emptyMedia}>Adicione o vídeo principal deste produto</div>}

          <div className={styles.videoGradient}></div>
        </div>

        <div className={styles.heroInfo}>
          <span>{produto.modelo}</span>

          <h1>
            {produto.nome}
            <strong>.<br />{config.nome} para você.</strong>
          </h1>

          <p>{produto.descricao}</p>

          <div className={styles.heroBottom}>
            <strong>{produto.preco}</strong>
          </div>
        </div>
      </section>

      {/* ================= DETALHES DO PRODUTO ================= */}
      <MonitorDetalhesProduto produto={produto} />

      {/* ================= DESTAQUES ================= */}
      <section id="destaques" className={styles.previewDestaques}>
        <div className={styles.sectionLabel}>Destaques.</div>

        {produto.destaques.map((destaque, index) => (
          <div
            className={`${styles.destaqueItem} ${
              index % 2 !== 0 ? styles.destaqueReverse : ""
            }`}
            key={destaque.id}
          >
            <div className={styles.destaqueText}>
              <span>{config.nome}</span>

              <h2>{destaque.titulo}</h2>

              <p>{destaque.texto}</p>
            </div>

        <div
  className={styles.destaqueVisual}
  style={{
    background: `linear-gradient(135deg, ${produto.cor}, #f4f4f7)`,
  }}
>
  {destaque.imagem ? <img className={styles.destaqueImagem} src={urlMidia(destaque.imagem)} alt={destaque.titulo} /> : <div className={styles.emptyMedia}>Imagem do destaque</div>}
</div>
          </div>
        ))}
      </section>

      {/* ================= CÂMERAS ================= */}
      <section id="cameras" className={styles.previewCamera}>
        <div className={styles.cameraHeader}>
          <span>{config.secao}</span>
          <h2>
            {dadosSecao.titulo || ""}
            <br />
            <strong>{dadosSecao.subtitulo || ""}</strong>
          </h2>
          <p>{dadosSecao.texto || produto.descricao}</p>
        </div>

        <div className={styles.cameraVisual}>
  {imagemValida ? <img className={styles.cameraPhoneImage} src={urlMidia(imagemValida)} alt={config.secao} /> : <div className={styles.emptyMedia}>Adicione uma imagem para esta seção</div>}
</div>

        <div className={styles.cameraNavigation}>
          {cameraTabs.map((tab, index) => (
            <button
              key={tab.id || index}
              type="button"
              className={secaoCamera === index ? styles.cameraActive : ""}
              onClick={() => setSecaoCamera(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.cameraDescription}>
          {cameraTabs[secaoCamera] && (
            <>
              <span>{String(secaoCamera + 1).padStart(2, "0")}</span>
              <h3>{cameraTabs[secaoCamera].titulo}</h3>
              <p>{cameraTabs[secaoCamera].texto}</p>
            </>
          )}
        </div>
      </section>

      {/* FINAL DA PÁGINA */}
      <div className={styles.previewFooter}>
        <strong>{produto.nome}</strong>
        <span>Conheça todos os detalhes.</span>
      </div>
    </div>
  );
}

export default function Produtos() {
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState(() => {
    const salvo = localStorage.getItem("produtos-personalizados");

    if (salvo) {
      return JSON.parse(salvo).map(normalizarProduto);
    }

    return produtosIniciais.map(normalizarProduto);
  });

  const [produtoSelecionado, setProdutoSelecionado] = useState(1);

  const [abaEditor, setAbaEditor] = useState("geral");
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [erroProdutos, setErroProdutos] = useState("");
  const [previewRevision, setPreviewRevision] = useState(0);
  const [salvandoVitrine, setSalvandoVitrine] = useState(false);
  const [mensagemVitrine, setMensagemVitrine] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarProdutosDaApi() {
      try {
        const itens = await apiRequest('/itens');
        if (!ativo || !Array.isArray(itens)) return;

        const salvos = JSON.parse(localStorage.getItem("produtos-personalizados") || "[]");
        const personalizados = new Map(salvos.map((item) => [String(item.id), item]));
        const sincronizados = itens.map((item) => {
          const possuiVitrinePublicada = Boolean(item.vitrine_config && item.vitrine_config !== "{}");
          const personalizado = possuiVitrinePublicada ? (personalizados.get(String(item.id)) || {}) : {};
          return normalizarProduto({
            ...personalizado,
            ...item,
            destaques: personalizado.destaques,
            detalhes: personalizado.detalhes,
            informacoes: personalizado.informacoes,
            detalhesMac: personalizado.detalhesMac,
            detalhesIpad: personalizado.detalhesIpad,
            detalhesAirpods: personalizado.detalhesAirpods,
            camera: personalizado.camera,
            cores: personalizado.cores,
            performance: personalizado.performance,
            experiencia: personalizado.experiencia,
            textosVitrine: personalizado.textosVitrine,
          });
        });

        if (sincronizados.length === 0) return;
        localStorage.setItem("produtos-personalizados", JSON.stringify(sincronizados));
        setProdutos(sincronizados);
        setProdutoSelecionado((idAtual) =>
          sincronizados.some((item) => item.id === idAtual) ? idAtual : sincronizados[0]?.id
        );
      } catch (error) {
        if (ativo) setErroProdutos(error.message);
      } finally {
        if (ativo) setCarregandoProdutos(false);
      }
    }

    carregarProdutosDaApi();
    return () => { ativo = false; };
  }, []);

  const produto = useMemo(() => {
    return (
      produtos.find(
        (item) => item.id === produtoSelecionado
      ) || produtos[0]
    );
  }, [produtos, produtoSelecionado]);

  function abrirVitrine() {
    const categoria = produto ? obterCategoria(produto) : null;

    if (!produto?.id || !categoria) return;

    navigate(`/produto/${categoria}/${produto.id}`);
  }

  const urlVitrine = produto?.id
    ? `/produto/${obterCategoria(produto)}/${produto.id}`
    : '';

  useEffect(() => {
    if (carregandoProdutos) return;

    localStorage.setItem(
      "produtos-personalizados",
      JSON.stringify(produtos)
    );
  }, [produtos, carregandoProdutos]);

  useEffect(() => {
    if (carregandoProdutos) return undefined;
    const atualizacao = window.setTimeout(
      () => setPreviewRevision((revisao) => revisao + 1),
      450
    );
    return () => window.clearTimeout(atualizacao);
  }, [produtos, carregandoProdutos]);

  function atualizarProduto(campo, valor) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              [campo]: valor,
            }
          : item
      )
    );
  }

  function atualizarCamera(campo, valor) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              camera: {
                ...item.camera,
                [campo]: valor,
              },
            }
          : item
      )
    );
  }

  function atualizarCamera(campo, valor) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              camera: {
                ...item.camera,
                [campo]: valor,
              },
            }
          : item
      )
    );
  }

  function atualizarDetalhes(campo, valor) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((item) =>
        item.id === produto.id
          ? {
              ...item,
              detalhes: {
                ...item.detalhes,
                [campo]: valor,
              },
            }
          : item
      )
    );
  }

  function atualizarCameraTab(id, campo, valor) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((item) => {
        if (item.id !== produto.id) return item;

        return {
          ...item,
          camera: {
            ...item.camera,
            tabs: (item.camera.tabs || []).map((tab) =>
              tab.id === id ? { ...tab, [campo]: valor } : tab
            ),
          },
        };
      })
    );
  }

  function atualizarDestaque(id, campo, valor) {
    setProdutos((produtosAtuais) =>
      produtosAtuais.map((item) => {
        if (item.id !== produto.id) return item;

        const categoria = obterCategoria(item);
        const chave = categoria === "iphone" ? "destaques" : `destaques${categoria === "airpods" ? "Airpods" : categoria === "ipad" ? "Ipad" : "Mac"}`;
        const atualizados = item.destaques.map((destaque) =>
          destaque.id === id
            ? {
                ...destaque,
                [campo]: valor,
                ...(campo === "texto" ? { descricao: valor } : {}),
              }
            : destaque
        );

        return {
          ...item,
          destaques: atualizados,
          [chave]: atualizados,
        };
      })
    );
  }

  function adicionarDestaque() {
    const novoDestaque = {
      id: Date.now(),
      titulo: "Novo destaque.",
      texto:
        "Adicione aqui uma nova informação importante sobre o produto.",
      descricao: "Adicione aqui uma nova informação importante sobre o produto.",
      imagem: "",
    };

    novoDestaque.titulo = "";
    novoDestaque.texto = "";
    novoDestaque.descricao = "";
    const atualizados = [...produto.destaques, novoDestaque];
    const categoria = obterCategoria(produto);
    const chave = categoria === "iphone" ? "destaques" : `destaques${categoria === "airpods" ? "Airpods" : categoria === "ipad" ? "Ipad" : "Mac"}`;
    atualizarProduto(chave, atualizados);
    if (chave !== "destaques") atualizarProduto("destaques", atualizados);
  }

  function removerDestaque(id) {
    const atualizados = produto.destaques.filter((destaque) => destaque.id !== id);
    const categoria = obterCategoria(produto);
    const chave = categoria === "iphone" ? "destaques" : `destaques${categoria === "airpods" ? "Airpods" : categoria === "ipad" ? "Ipad" : "Mac"}`;
    atualizarProduto(chave, atualizados);
    if (chave !== "destaques") atualizarProduto("destaques", atualizados);
  }

  async function lerImagem(arquivo, callback) {
    if (!arquivo) return;
    const nomeArquivo = arquivo.name.replace(/\\/g, "/").split("/").pop();
    const pastasPossiveis = ["imagens", "iphone17"];
    let caminhoImagem = `/imagens/${nomeArquivo}`;

    for (const pasta of pastasPossiveis) {
      const caminhoCandidato = `/${pasta}/${nomeArquivo}`;
      try {
        const resposta = await fetch(encodeURI(caminhoCandidato), { method: "HEAD" });
        const tipoConteudo = resposta.headers.get("content-type") || "";
        if (resposta.ok && tipoConteudo.startsWith("image/")) {
          caminhoImagem = caminhoCandidato;
          break;
        }
      } catch {
        // Mantém /imagens como caminho padrão caso a verificação não esteja disponível.
      }
    }

    callback(caminhoImagem);
    setMensagemVitrine(`Caminho preenchido: ${caminhoImagem}. Clique em Salvar vitrine para publicar.`);
  }

  function enviarVideo(arquivo) {
    if (!arquivo) return;
    const nomeArquivo = arquivo.name.replace(/\\/g, "/").split("/").pop();
    atualizarProduto("video", `/videos/${nomeArquivo}`);
    setMensagemVitrine(`Caminho preenchido: /videos/${nomeArquivo}. Clique em Salvar vitrine para publicar.`);
  }

  function adicionarCameraTab() {
    atualizarProduto("camera", { ...produto.camera, tabs: [...(produto.camera?.tabs || []), { id: Date.now(), label: "", titulo: "", texto: "", imagem: "" }] });
  }

  function removerCameraTab(id) {
    atualizarProduto("camera", { ...produto.camera, tabs: (produto.camera?.tabs || []).filter((tab) => tab.id !== id) });
  }

  function adicionarItemSecao(chave, campos) {
    const novo = { id: Date.now() };
    campos.forEach((campo) => { novo[campo.id] = ""; });
    atualizarProduto(chave, [...(produto[chave] || []), novo]);
  }

  function removerItemSecao(chave, id) {
    atualizarProduto(chave, (produto[chave] || []).filter((item) => item.id !== id));
  }

  function adicionarCor() {
    atualizarProduto("cores", [...(produto.cores || []), { id: Date.now(), nome: "", cor: "#d9d9de", imagem: "" }]);
  }

  function atualizarCor(id, campo, valor) {
    atualizarProduto("cores", (produto.cores || []).map((cor) => cor.id === id ? { ...cor, [campo]: valor } : cor));
  }

  function removerCor(id) {
    atualizarProduto("cores", (produto.cores || []).filter((cor) => cor.id !== id));
  }

  function atualizarTextoVitrine(campo, valor) {
    setProdutos((atuais) => atuais.map((item) =>
      item.id === produto.id
        ? { ...item, textosVitrine: { ...item.textosVitrine, [campo]: valor } }
        : item
    ));
  }

  function atualizarItemSecao(chave, id, campo, valor) {
    atualizarProduto(
      chave,
      (produto[chave] || []).map((item) =>
        item.id === id ? { ...item, [campo]: valor } : item
      )
    );
  }

  async function salvarVitrine() {
    setSalvandoVitrine(true);
    setMensagemVitrine("");
    try {
      const precoNumerico = converterPrecoParaNumero(produto.preco);
      const formData = new FormData();
      formData.append("nome", produto.nome || "");
      formData.append("descricao", produto.descricao || "");
      formData.append("preco", Number.isFinite(precoNumerico) ? precoNumerico : 0);
      formData.append("quantidade", Number(produto.quantidade || 0));
      formData.append("categoria", produto.categoria || "");
      const { vitrine_config: _configAnterior, ...configuracaoPublicada } = produto;
      formData.append("vitrineConfig", JSON.stringify(configuracaoPublicada));
      formData.append("autor", "administrador");
      await apiRequest(`/itens/${produto.id}`, { method: "PUT", body: formData });
      localStorage.setItem("produtos-personalizados", JSON.stringify(produtos));
      setMensagemVitrine("Vitrine publicada com sucesso.");
    } catch (error) {
      setMensagemVitrine(error.message);
    } finally {
      setSalvandoVitrine(false);
    }
  }

  function limparConteudoDoModelo() {
    const categoria = obterCategoria(produto);
    const molde = criarMoldeVazio(produto, categoria);
    const chave = categoria === "iphone" ? "destaques" : `destaques${categoria === "airpods" ? "Airpods" : categoria === "ipad" ? "Ipad" : "Mac"}`;
    setProdutos((atuais) => atuais.map((item) => item.id === produto.id ? { ...item, ...molde, destaques: [], [chave]: [] } : item));
    setMensagemVitrine("Conteúdo limpo no editor. Clique em Salvar vitrine para confirmar.");
  }

  function renderListaEditavel(chave, titulo, campos) {
    return (
      <div className={styles.editorBlock}>
        <div className={styles.blockTitle}>
          <div>
            <h3>{titulo}</h3>
            <span>Edite os textos exibidos nesta seção da vitrine.</span>
          </div>
          <button type="button" className={styles.addButton} onClick={() => adicionarItemSecao(chave, campos)}>+ Adicionar detalhe</button>
        </div>
        <div className={styles.cameraTabsEditor}>
          {(produto[chave] || []).map((item, index) => (
            <div className={styles.cameraTabEditor} key={item.id || index}>
              <div className={styles.cameraTabNumber}>{String(index + 1).padStart(2, "0")}</div>
              <div className={styles.cameraTabFields}>
                {campos.map((campo) => (
                  <label key={campo.id}>
                    {campo.label}
                    {campo.id === "imagem" ? (<>
                      <input value={item.imagem || ""} onChange={(e) => atualizarItemSecao(chave, item.id, "imagem", e.target.value)} placeholder="/imagens/minha-imagem.png" />
                      <input type="file" accept="image/*" onChange={(e) => lerImagem(e.target.files?.[0], (valor) => atualizarItemSecao(chave, item.id, "imagem", valor))} />
                      {item.imagem && <button type="button" className={styles.removeMediaButton} onClick={() => atualizarItemSecao(chave, item.id, "imagem", "")}>Remover imagem</button>}
                    </>) : campo.textarea ? (
                      <textarea
                        value={item[campo.id] || ""}
                        onChange={(e) => atualizarItemSecao(chave, item.id, campo.id, e.target.value)}
                      />
                    ) : (
                      <input
                        value={item[campo.id] || ""}
                        onChange={(e) => atualizarItemSecao(chave, item.id, campo.id, e.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>
              <button type="button" className={styles.deleteButton} onClick={() => removerItemSecao(chave, item.id)}>×</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const categoriaEditor = obterCategoria(produto);
  const terceiraAba = {
    iphone: "Câmeras",
    mac: "Desempenho",
    ipad: "Detalhes",
    airpods: "Experiência",
  }[categoriaEditor];

  return (
    <AdminLayout>
      <section className={styles.page}>
      {/* ================= TÍTULO ================= */}
      <header className={styles.pageHeader}>
        <div>
          <span>Franquia autorizada • Painel administrativo</span>

          <h1>
            Personalização
            <br />
            da vitrine.
          </h1>

          <p>
            Selecione um produto e edite a página que seus
            clientes irão visualizar.
          </p>
        </div>

        <div className={styles.saveIndicator}>
          <span></span>
          Alterações salvas automaticamente
        </div>
      </header>

      {/* ================= SELEÇÃO DE PRODUTO ================= */}
      <section className={styles.produtosCard}>
        <div className={styles.cardTop}>
          <div>
            <span>Produtos cadastrados</span>
            <h2>Escolha o produto que deseja editar</h2>
          </div>

          <div className={styles.searchFake}>
            Buscar produto...
          </div>
        </div>

        {erroProdutos && <p className={styles.loadMessage}>{erroProdutos}</p>}
        {carregandoProdutos && <p className={styles.loadMessage}>Carregando produtos cadastrados...</p>}
        <div className={styles.produtosTabela}>
          <div className={styles.tabelaHeader}>
            <span>Produto</span>
            <span>SKU</span>
            <span>Preço</span>
            <span>Status</span>
            <span></span>
          </div>

          {produtos.map((item) => (
            <button
              key={item.id}
              className={`${styles.produtoLinha} ${
                produtoSelecionado === item.id
                  ? styles.produtoSelecionado
                  : ""
              }`}
              onClick={() => setProdutoSelecionado(item.id)}
            >
              <span className={styles.nomeProduto}>
                <div
                  className={styles.produtoIcon}
                >
                  <img
                    src={imagemProdutoLista(item)}
                    alt={item.nome}
                    onError={(event) => {
                      event.currentTarget.src = imagemProdutoLista({ categoria: item.categoria });
                    }}
                  />
                </div>

                <div>
                  <strong>{item.nome}</strong>
                  <small>{item.modelo}</small>
                </div>
              </span>

              <span>{item.sku}</span>

              <strong>{item.preco}</strong>

              <span>
                <b className={styles.status}>
                  {item.status}
                </b>
              </span>

              <span className={styles.arrow}>
                →
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ================= MONITOR / PREVIEW ================= */}
      <section className={styles.monitorSection}>
        <div className={styles.monitorTitle}>
          <div>
            <span>Pré-visualização</span>
            <h2>Página do cliente</h2>
          </div>

          <div className={styles.liveBadge}>
            <span></span>
            AO VIVO
          </div>
        </div>

       <div className={styles.monitor}>

  {/* PARTE SUPERIOR DO MONITOR */}
  <div className={styles.monitorTop}>



    <div className={styles.monitorUrl}>
      franquia.com/produto/
      {produto.categoria}/{produto.id}
    </div>

    <button
      type="button"
      className={styles.openVitrine}
      onClick={abrirVitrine}
    >
      Abrir vitrine
    </button>

  </div>


  {/* TELA */}
  <div className={styles.monitorScreen}>
    {urlVitrine ? (
      <iframe
        key={`${urlVitrine}-${previewRevision}`}
        className={styles.storePreviewFrame}
        src={urlVitrine}
        title={`Pré-visualização da página ${produto.nome}`}
      />
    ) : (
      <div className={styles.previewEmpty}>Selecione um produto para visualizar.</div>
    )}
  </div>


  {/* PARTE INFERIOR / MOLDURA */}
  <div className={styles.monitorBottom}>

    <div className={styles.monitorLogo}>
      <img
        src="/imagens/logoMonitor.png"
        alt="Logo"
      />
    </div>

  </div>


  {/* PÉ */}
  <div className={styles.monitorStand}>
    <div className={styles.monitorStandNeck}></div>

    <div className={styles.monitorStandBase}></div>
  </div>

</div>
      </section>

      {/* ================= EDITOR ================= */}
      <section className={styles.editorSection}>
        <div className={styles.editorHeader}>
          <div>
            <span>Editando agora</span>

            <h2>{produto.nome}</h2>

            <p>
              As alterações aparecem automaticamente no monitor.
            </p>
          </div>
          <div className={styles.publishArea}>
            {mensagemVitrine && <span>{mensagemVitrine}</span>}
            <button type="button" className={styles.clearTemplateButton} onClick={limparConteudoDoModelo}>Limpar conteúdo</button>
            <button type="button" onClick={salvarVitrine} disabled={salvandoVitrine}>
              {salvandoVitrine ? "Salvando..." : "Salvar vitrine"}
            </button>
          </div>
        </div>

        <div className={styles.editorLayout}>
          {/* MENU */}
          <aside className={styles.editorMenu}>
            <button
              className={
                abaEditor === "geral"
                  ? styles.menuActive
                  : ""
              }
              onClick={() => setAbaEditor("geral")}
            >
              <span>01</span>
              Informações gerais
            </button>

            <button
              className={
                abaEditor === "destaques"
                  ? styles.menuActive
                  : ""
              }
              onClick={() => setAbaEditor("destaques")}
            >
              <span>02</span>
              Destaques
            </button>

            <button
              className={
                abaEditor === "camera"
                  ? styles.menuActive
                  : ""
              }
              onClick={() => setAbaEditor("camera")}
            >
              <span>03</span>
              {terceiraAba}
            </button>

            <button
              className={abaEditor === "textos" ? styles.menuActive : ""}
              onClick={() => setAbaEditor("textos")}
            >
              <span>04</span>
              Textos da vitrine
            </button>
          </aside>

          {/* CAMPOS */}
          <div className={styles.editorContent}>
            {/* GERAL */}
            {abaEditor === "geral" && (
              <>
                <div className={styles.editorBlock}>
                  <div className={styles.blockTitle}>
                    <h3>Informações principais</h3>
                    <span>Visíveis na página inicial</span>
                  </div>

                  <div className={styles.formGrid}>
                    <label>
                      Nome do produto
                      <input
                        value={produto.nome}
                        onChange={(e) =>
                          atualizarProduto(
                            "nome",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Modelo
                      <input
                        value={produto.modelo}
                        onChange={(e) =>
                          atualizarProduto(
                            "modelo",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label>
                      Valor
                      <input
                        value={produto.preco ?? ""}
                        onChange={(e) => atualizarProduto("preco", e.target.value)}
                        onBlur={() => atualizarProduto("preco", formatarPrecoProduto(produto.preco))}
                        placeholder="Ex: R$ 2.699"
                      />
                    </label>


                    <label>
                      Cor principal
                      <div className={styles.colorInput}>
                        <input
                          type="color"
                          value={produto.cor}
                          onChange={(e) =>
                            atualizarProduto(
                              "cor",
                              e.target.value
                            )
                          }
                        />

                        <span>{produto.cor}</span>
                      </div>
                    </label>
                  </div>

                  <label className={styles.fullInput}>
                    Descrição
                    <textarea
                      value={produto.descricao}
                      onChange={(e) =>
                        atualizarProduto(
                          "descricao",
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>

                {categoriaEditor === "iphone" && <div className={styles.editorBlock}>
                  <div className={styles.blockTitle}>
                    <h3>Seção de cores</h3>
                    <span>Textos exibidos acima das cores do produto</span>
                  </div>

                  <div className={styles.formGrid}>
                    <label>
                      Título
                      <input
                        value={produto.detalhes?.titulo || ""}
                        onChange={(e) => atualizarDetalhes("titulo", e.target.value)}
                      />
                    </label>

                    <label>
                      Subtítulo
                      <input
                        value={produto.detalhes?.subtitulo || ""}
                        onChange={(e) => atualizarDetalhes("subtitulo", e.target.value)}
                      />
                    </label>
                  </div>
                </div>}

                {categoriaEditor === "iphone" && renderListaEditavel("informacoes", "Itens expansíveis dos detalhes", [
                  { id: "nome", label: "Nome do item" },
                  { id: "valor", label: "Descrição", textarea: true },
                  { id: "imagem", label: "Imagem exibida ao abrir" },
                ])}

                <div className={styles.editorBlock}>
                  <div className={styles.blockTitle}><div><h3>Fotos e cores do produto</h3><span>Cada variação pode ter sua própria imagem.</span></div><button type="button" className={styles.addButton} onClick={adicionarCor}>+ Adicionar foto</button></div>
                  <div className={styles.cameraTabsEditor}>{(produto.cores || []).map((cor, index) => <div className={styles.cameraTabEditor} key={cor.id || index}>
                    <div className={styles.cameraTabNumber}>{String(index + 1).padStart(2, "0")}</div>
                    <div className={styles.cameraTabFields}><label>Nome da cor<input value={cor.nome || ""} onChange={(e) => atualizarCor(cor.id, "nome", e.target.value)} /></label><label>Cor visual<input type="color" value={cor.cor || "#d9d9de"} onChange={(e) => atualizarCor(cor.id, "cor", e.target.value)} /></label><label>Caminho da imagem<input value={cor.imagem || ""} onChange={(e) => atualizarCor(cor.id, "imagem", e.target.value)} placeholder="/imagens/meu-produto.png" /></label><label>Escolher arquivo<input type="file" accept="image/*" onChange={(e) => lerImagem(e.target.files?.[0], (valor) => atualizarCor(cor.id, "imagem", valor))} /></label>{cor.imagem && <button type="button" className={styles.removeMediaButton} onClick={() => atualizarCor(cor.id, "imagem", "")}>Remover imagem</button>}</div>
                    <button type="button" className={styles.deleteButton} onClick={() => removerCor(cor.id)}>×</button>
                  </div>)}</div>
                  {(produto.cores || []).length === 0 && <p className={styles.emptyEditor}>Nenhuma foto cadastrada. Clique em “Adicionar foto”.</p>}
                </div>

                <div className={styles.editorBlock}>
                  <div className={styles.blockTitle}>
                    <h3>Vídeo principal</h3>
                    <span>
                      Cada produto pode ter seu próprio vídeo
                    </span>
                  </div>

                  <label className={styles.fullInput}>
                    Caminho do vídeo
                    <input
                      value={produto.video}
                      onChange={(e) =>
                        atualizarProduto(
                          "video",
                          e.target.value
                        )
                      }
                      placeholder="/videos/meu-video.mp4"
                    />
                  </label>

                  <label className={styles.fullInput}>Escolher arquivo de vídeo
                    <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={(e) => enviarVideo(e.target.files?.[0])} />
                  </label>

                  <div className={styles.videoHelp}>
                    Coloque o arquivo dentro de
                    <strong> public/videos </strong>
                    e informe o caminho acima.
                  </div>
                </div>

              </>
            )}

            {abaEditor === "textos" && (
                <div className={styles.editorBlock}>
                  <div className={styles.blockTitle}>
                    <h3>Textos das seções</h3>
                    <span>Títulos e descrições gerais exibidos entre os conteúdos.</span>
                  </div>
                  <label className={styles.fullInput}>
                    Título da seção de destaques
                    <input
                      value={produto.textosVitrine?.destaquesTitulo || ""}
                      onChange={(e) => atualizarTextoVitrine("destaquesTitulo", e.target.value)}
                    />
                  </label>
                  <label className={styles.fullInput}>
                    Título da seção de detalhes
                    <input
                      value={produto.textosVitrine?.detalhesTitulo || ""}
                      onChange={(e) => atualizarTextoVitrine("detalhesTitulo", e.target.value)}
                    />
                  </label>
                  <label className={styles.fullInput}>
                    Descrição da seção de detalhes
                    <textarea
                      value={produto.textosVitrine?.detalhesDescricao || ""}
                      onChange={(e) => atualizarTextoVitrine("detalhesDescricao", e.target.value)}
                    />
                  </label>
                  {categoriaEditor !== "iphone" && (
                    <>
                      <label className={styles.fullInput}>
                        Título da seção final
                        <input value={produto.textosVitrine?.extraTitulo || ""} onChange={(e) => atualizarTextoVitrine("extraTitulo", e.target.value)} />
                      </label>
                      <label className={styles.fullInput}>
                        Descrição da seção final
                        <textarea value={produto.textosVitrine?.extraDescricao || ""} onChange={(e) => atualizarTextoVitrine("extraDescricao", e.target.value)} />
                      </label>
                    </>
                  )}
                  {categoriaEditor === "ipad" && (
                    <>
                      <label className={styles.fullInput}>
                        Título da janela de possibilidades
                        <input value={produto.textosVitrine?.overlayTitulo || ""} onChange={(e) => atualizarTextoVitrine("overlayTitulo", e.target.value)} />
                      </label>
                      <label className={styles.fullInput}>
                        Descrição da janela de possibilidades
                        <textarea value={produto.textosVitrine?.overlayDescricao || ""} onChange={(e) => atualizarTextoVitrine("overlayDescricao", e.target.value)} />
                      </label>
                    </>
                  )}
                </div>
            )}

            {/* DESTAQUES */}
            {abaEditor === "destaques" && (
              <>
                <div className={styles.editorBlock}>
                  <div className={styles.blockTitle}>
                    <div>
                      <h3>Destaques do produto</h3>
                      <span>
                        Você pode adicionar quantos destaques
                        quiser.
                      </span>
                    </div>

                    <button
                      className={styles.addButton}
                      onClick={adicionarDestaque}
                    >
                      + Adicionar destaque
                    </button>
                  </div>

                  <div className={styles.destaquesEditor}>
                    {produto.destaques.map(
                      (destaque, index) => (
                        <div
                          className={styles.destaqueEditor}
                          key={destaque.id}
                        >
                          <div className={styles.destaqueNumber}>
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <div className={styles.destaqueFields}>
                            {categoriaEditor !== "iphone" && (
                              <label>
                                Etiqueta
                                <input
                                  value={destaque.tag || ""}
                                  onChange={(e) => atualizarDestaque(destaque.id, "tag", e.target.value)}
                                />
                              </label>
                            )}
                            <label>
                              Título
                              <input
                                value={destaque.titulo}
                                onChange={(e) =>
                                  atualizarDestaque(
                                    destaque.id,
                                    "titulo",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label>
                              Descrição
                              <textarea
                                value={destaque.texto}
                                onChange={(e) =>
                                  atualizarDestaque(
                                    destaque.id,
                                    "texto",
                                    e.target.value
                                  )
                                }
                              />
                            </label>

                            <label>
                              Imagem do destaque
                              <input
                                value={destaque.imagem || ""}
                                onChange={(e) => atualizarDestaque(destaque.id, "imagem", e.target.value)}
                                placeholder="/imagens/meu-destaque.jpg"
                                required
                              />
                            </label>
                            <label>Escolher nova imagem<input type="file" accept="image/*" onChange={(e) => lerImagem(e.target.files?.[0], (valor) => atualizarDestaque(destaque.id, "imagem", valor))} /></label>
                            {destaque.imagem && <button type="button" className={styles.removeMediaButton} onClick={() => atualizarDestaque(destaque.id, "imagem", "")}>Remover imagem</button>}
                          </div>

                          <button
                            className={styles.deleteButton}
                            onClick={() =>
                              removerDestaque(
                                destaque.id
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </>
            )}

            {/* CAMERA */}
            {abaEditor === "camera" && categoriaEditor === "iphone" && (
              <div className={styles.editorBlock}>
                <div className={styles.blockTitle}>
                  <h3>Seção de câmeras</h3>

                  <span>
                    Personalize o conteúdo da navegação
                  </span>
                </div>

                <div className={styles.formGrid}>
                  <label>
                    Título
                    <input
                      value={produto.camera.titulo}
                      onChange={(e) =>
                        atualizarCamera(
                          "titulo",
                          e.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Subtítulo
                    <input
                      value={produto.camera.subtitulo}
                      onChange={(e) =>
                        atualizarCamera(
                          "subtitulo",
                          e.target.value
                        )
                      }
                    />
                  </label>
                </div>

                <label className={styles.fullInput}>
                  Descrição
                  <textarea
                    value={produto.camera.texto}
                    onChange={(e) =>
                      atualizarCamera(
                        "texto",
                        e.target.value
                      )
                    }
                  />
                </label>

                <div className={styles.cameraTabsEditor}>
                  <button type="button" className={styles.addButton} onClick={adicionarCameraTab}>+ Adicionar detalhe</button>
                  {(produto.camera.tabs || []).map((tab, index) => (
                    <div className={styles.cameraTabEditor} key={tab.id}>
                      <div className={styles.cameraTabNumber}>
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className={styles.cameraTabFields}>
                        <label>
                          Texto da navegação
                          <input
                            value={tab.label}
                            onChange={(e) => atualizarCameraTab(tab.id, "label", e.target.value)}
                          />
                        </label>
                        <label>
                          Título do conteúdo
                          <input
                            value={tab.titulo}
                            onChange={(e) => atualizarCameraTab(tab.id, "titulo", e.target.value)}
                          />
                        </label>
                        <label>
                          Texto do conteúdo
                          <textarea
                            value={tab.texto}
                            onChange={(e) => atualizarCameraTab(tab.id, "texto", e.target.value)}
                          />
                        </label>
                        <label>
                          Imagem
                          <input
                            value={tab.imagem}
                            onChange={(e) => atualizarCameraTab(tab.id, "imagem", e.target.value)}
                            placeholder="/imagem/camera-frontal.jpg"
                          />
                        </label>
                        <label>Escolher arquivo<input type="file" accept="image/*" onChange={(e) => lerImagem(e.target.files?.[0], (valor) => atualizarCameraTab(tab.id, "imagem", valor))} /></label>
                        {tab.imagem && <button type="button" className={styles.removeMediaButton} onClick={() => atualizarCameraTab(tab.id, "imagem", "")}>Remover imagem</button>}
                      </div>
                      <button type="button" className={styles.deleteButton} onClick={() => removerCameraTab(tab.id)}>×</button>
                    </div>
                  ))}
                </div>

                <div className={styles.cameraNotice}>
                  <strong>Navegação da câmera</strong>
                  <p>
                    Cada botão possui seu próprio texto, título, descrição e imagem. Ao clicar no botão no monitor, a imagem correspondente é exibida.
                  </p>
                </div>
              </div>
            )}

            {abaEditor === "camera" && categoriaEditor === "mac" && (
              <>
                {renderListaEditavel("detalhesMac", "Detalhes do Mac", [
                  { id: "titulo", label: "Título" },
                  { id: "descricao", label: "Descrição", textarea: true },
                  { id: "imagem", label: "Imagem" },
                ])}
                {renderListaEditavel("performance", "Seção de desempenho", [
                  { id: "tituloColorido", label: "Chamada colorida" },
                  { id: "titulo", label: "Título" },
                  { id: "descricao", label: "Descrição", textarea: true },
                  { id: "imagem", label: "Imagem" },
                ])}
              </>
            )}

            {abaEditor === "camera" && categoriaEditor === "ipad" &&
              renderListaEditavel("detalhesIpad", "Detalhes do iPad", [
                { id: "titulo", label: "Título" },
                { id: "descricao", label: "Descrição", textarea: true },
                { id: "imagem", label: "Imagem" },
              ])}

            {abaEditor === "camera" && categoriaEditor === "airpods" && (
              <>
                {renderListaEditavel("detalhesAirpods", "Detalhes dos AirPods", [
                  { id: "titulo", label: "Título" },
                  { id: "descricao", label: "Descrição", textarea: true },
                  { id: "imagem", label: "Imagem" },
                ])}
                {renderListaEditavel("experienciaAirpods", "Seção de experiência", [
                  { id: "menu", label: "Texto da navegação" },
                  { id: "titulo", label: "Título" },
                  { id: "descricao", label: "Descrição", textarea: true },
                  { id: "imagem", label: "Imagem" },
                ])}
              </>
            )}
          </div>
        </div>
      </section>
      </section>
    </AdminLayout>
  );
}
