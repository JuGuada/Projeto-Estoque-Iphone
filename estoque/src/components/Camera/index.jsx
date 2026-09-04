import { useState } from "react";
import styles from "./styles.module.css";

const recursos = [
  {
    id: 1,
    titulo: "Center Stage",
    descricao:
      "Enquadre automaticamente as pessoas na cena. O enquadramento acompanha o grupo para que ninguÃ©m fique de fora.",
  },
  {
    id: 2,
    titulo: "Captura Dupla",
    descricao:
      "Grave usando a cÃ¢mera frontal e traseira ao mesmo tempo para registrar diferentes perspectivas.",
  },
  {
    id: 3,
    titulo: "VÃ­deo",
    descricao:
      "Grave vÃ­deos com mais estabilidade e qualidade, mesmo quando vocÃª estiver se movimentando.",
  },
  {
    id: 4,
    titulo: "Chamadas",
    descricao:
      "Durante chamadas de vÃ­deo, o enquadramento acompanha automaticamente quem estÃ¡ falando.",
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
          TÃTULO
      ========================= */}

      <div className={styles.conteudo}>

        <span className={styles.overline}>
          CÃ¢meras.
        </span>

        <h2 className={styles.titulo}>
          CÃ¢mera frontal
          <br />

          <span>Center Stage de 18 MP.</span>

          <br />

          <span>Uma grande virada.</span>
        </h2>

        <p className={styles.texto}>
          A nova cÃ¢mera frontal traz mais flexibilidade para
          enquadrar fotos e vÃ­deos, entre outros recursos.
          Toque para ampliar o campo de visÃ£o e mudar da
          vertical para a horizontal sem girar o iPhone.
          E, quando mais gente entra na cena, o enquadramento
          se ajusta para ninguÃ©m ficar de fora.
        </p>

      </div>


      {/* =========================
          IMAGEM DO IPHONE
      ========================= */}

      <div className={styles.visual}>

        <img
          src="/img/iphone-camera.png"
          alt="iPhone demonstrando a cÃ¢mera frontal"
        />

      </div>


      {/* =========================
          NAVEGAÃ‡ÃƒO
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
              {recursoAtivo === item.id ? "â—" : "+"}
            </span>

            <span className={styles.nome}>
              {item.titulo}
            </span>

          </button>

        ))}

      </div>


      {/* =========================
          DESCRIÃ‡ÃƒO DA OPÃ‡ÃƒO
      ========================= */}

      <div className={styles.descricao}>

        <p>
          {recursoSelecionado?.descricao}
        </p>

      </div>

    </section>
  );
}
