import { useState } from "react";
import styles from "./styles.module.css";

const recursos = [
  {
    id: 1,
    titulo: "Center Stage",
    descricao:
      "Enquadre automaticamente as pessoas na cena. O enquadramento acompanha o grupo para que ninguém fique de fora.",
  },
  {
    id: 2,
    titulo: "Captura Dupla",
    descricao:
      "Grave usando a câmera frontal e traseira ao mesmo tempo para registrar diferentes perspectivas.",
  },
  {
    id: 3,
    titulo: "Vídeo",
    descricao:
      "Grave vídeos com mais estabilidade e qualidade, mesmo quando você estiver se movimentando.",
  },
  {
    id: 4,
    titulo: "Chamadas",
    descricao:
      "Durante chamadas de vídeo, o enquadramento acompanha automaticamente quem está falando.",
  },
];

export default function Camera() {
  const [recursoAtivo, setRecursoAtivo] = useState(1);

  const recursoSelecionado = recursos.find(
    (item) => item.id === recursoAtivo
  );

  return (
    <section className={styles.camera} id="camera">

      {/* =========================
          TÍTULO
      ========================= */}

      <div className={styles.conteudo}>

        <span className={styles.overline}>
          Câmeras.
        </span>

        <h2 className={styles.titulo}>
          Câmera frontal
          <br />

          <span>Center Stage de 18 MP.</span>

          <br />

          <span>Uma grande virada.</span>
        </h2>

        <p className={styles.texto}>
          A nova câmera frontal traz mais flexibilidade para
          enquadrar fotos e vídeos, entre outros recursos.
          Toque para ampliar o campo de visão e mudar da
          vertical para a horizontal sem girar o iPhone.
          E, quando mais gente entra na cena, o enquadramento
          se ajusta para ninguém ficar de fora.
        </p>

      </div>


      {/* =========================
          IMAGEM DO IPHONE
      ========================= */}

      <div className={styles.visual}>

        <img
          src="/img/iphone-camera.png"
          alt="iPhone demonstrando a câmera frontal"
        />

      </div>


      {/* =========================
          NAVEGAÇÃO
      ========================= */}

      <div className={styles.navegacao}>

        {recursos.map((item) => (

          <button
            key={item.id}
            type="button"
            className={
              recursoAtivo === item.id
                ? styles.ativo
                : ""
            }
            onClick={() => setRecursoAtivo(item.id)}
          >

            <span className={styles.icone}>
              {recursoAtivo === item.id ? "●" : "+"}
            </span>

            <span className={styles.nome}>
              {item.titulo}
            </span>

          </button>

        ))}

      </div>


      {/* =========================
          DESCRIÇÃO DA OPÇÃO
      ========================= */}

      <div className={styles.descricao}>

        <p>
          {recursoSelecionado?.descricao}
        </p>

      </div>

    </section>
  );
}