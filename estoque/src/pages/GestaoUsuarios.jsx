import { useSearchParams } from "react-router-dom";
import Usuario from "./Usuario.jsx";
import PedidosAdmin from "./PedidosAdmin.jsx";
import styles from "../styles/GestaoUsuarios.module.css";

export default function GestaoUsuarios() {
  const [parametros, setParametros] = useSearchParams();
  const aba = parametros.get("aba") === "pedidos" ? "pedidos" : "usuarios";

  function mudarAba(novaAba) {
    setParametros(novaAba === "pedidos" ? { aba: "pedidos" } : {}, { replace: true });
  }

  return <div className={styles.area}>
    <nav className={styles.segmentedControl} aria-label="Navegação da gestão de usuários">
      <button type="button" className={aba === "usuarios" ? styles.active : ""} onClick={() => mudarAba("usuarios")}>Usuários</button>
      <button type="button" className={aba === "pedidos" ? styles.active : ""} onClick={() => mudarAba("pedidos")}>Pedidos</button>
    </nav>
    <div className={styles.content} key={aba}>
      {aba === "usuarios" ? <Usuario /> : <PedidosAdmin />}
    </div>
  </div>;
}
