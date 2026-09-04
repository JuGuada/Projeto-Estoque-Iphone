import { useEffect, useRef, useState } from "react";
import {
  NavLink,
  useNavigate
} from "react-router-dom";

import { useAuth } from "../../contexts/authContext.jsx";
import styles from "./styles.module.css";


export default function UserHeader() {

  const navigate = useNavigate();

const { logout } = useAuth();

function handleLogout() {
  logout();

  setMenuOpen(false);

  navigate("/login", {
    replace: true
  });
}

  const [menuOpen, setMenuOpen] = useState(false);
  const [quantidadeCarrinho, setQuantidadeCarrinho] = useState(0);

  const userMenuRef = useRef(null);

  useEffect(() => {
    function atualizarQuantidadeCarrinho() {
      try {
        const carrinho = JSON.parse(localStorage.getItem("carrinho") || "[]");
        const quantidade = Array.isArray(carrinho)
          ? carrinho.reduce((total, item) => total + Math.max(0, Number(item.quantidade) || 1), 0)
          : 0;

        setQuantidadeCarrinho(quantidade);
      } catch {
        setQuantidadeCarrinho(0);
      }
    }

    atualizarQuantidadeCarrinho();
    window.addEventListener("storage", atualizarQuantidadeCarrinho);
    window.addEventListener("carrinhoAtualizado", atualizarQuantidadeCarrinho);

    return () => {
      window.removeEventListener("storage", atualizarQuantidadeCarrinho);
      window.removeEventListener("carrinhoAtualizado", atualizarQuantidadeCarrinho);
    };
  }, []);


  function handleLogout() {
    logout();

    setMenuOpen(false);

    navigate("/login", {
      replace: true
    });
  }


  useEffect(() => {

    function handleClickOutside(event) {

      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }

    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };

  }, []);


  return (
    <header className={styles.header}>

      <div className={styles.container}>

        <NavLink
          to="/"
          className={styles.logo}
        >
          <img
            src="/imagens/logo.png"
            alt="Logo da Apple"
            className={styles.logoMark}
          />

          <span className={styles.logoTitle}>Franquia</span>
          <span className={styles.logoSubtitle}>Apple</span>
        </NavLink>


        <nav className={styles.navigation}>

          <NavLink
            to="/"
            className={({ isActive }) =>
              `${styles.link} ${
                isActive
                  ? styles.active
                  : ""
              }`
            }
          >
            Home
          </NavLink>


          <NavLink
            to="/pedidos"
            className={({ isActive }) =>
              `${styles.link} ${
                isActive
                  ? styles.active
                  : ""
              }`
            }
          >
            Pedidos
          </NavLink>


          <NavLink
            to="/carrinho"
            className={({ isActive }) =>
              `${styles.link} ${
                isActive
                  ? styles.active
                  : ""
              }`
            }
          >
            Carrinho
            {quantidadeCarrinho > 0 && (
              <span className={styles.cartBadge} aria-label={`${quantidadeCarrinho} itens no carrinho`}>
                {quantidadeCarrinho > 99 ? "99+" : quantidadeCarrinho}
              </span>
            )}
          </NavLink>

        </nav>


        <div className={styles.actions}>

          {/* PESQUISA */}

          <button
            type="button"
            className={styles.iconButton}
            aria-label="Pesquisar"
          >
            <svg viewBox="0 0 24 24">

              <circle
                cx="11"
                cy="11"
                r="6.5"
              />

              <path d="M16 16l5 5" />

            </svg>
          </button>


          {/* CARRINHO */}

          <NavLink
            to="/carrinho"
            className={`${styles.cart} ${styles.iconButton}`}
            aria-label="Carrinho"
          >
            <svg viewBox="0 0 24 24">

              <path d="M5 8h14l-1 11H6L5 8Z" />

              <path d="M9 8V6a3 3 0 0 1 6 0v2" />

            </svg>
          </NavLink>


          {/* USUÃRIO */}

          <div
            className={styles.userArea}
            ref={userMenuRef}
          >

            <button
              type="button"
              className={`${styles.iconButton} ${styles.userButton}`}
              aria-label="Abrir menu do usuÃ¡rio"
              aria-expanded={menuOpen}
              onClick={() =>
                setMenuOpen((open) => !open)
              }
            >
              <svg viewBox="0 0 24 24">

                <circle
                  cx="12"
                  cy="8"
                  r="3.5"
                />

                <path
                  d="
                    M5.5 19
                    c.7-3.3
                    3.1-5.2
                    6.5-5.2
                    s5.8 1.9
                    6.5 5.2
                  "
                />

              </svg>
            </button>


            {menuOpen && (

              <div className={styles.userMenu}>

                <div className={styles.userMenuHeader}>
                  <span>
                    Minha conta
                  </span>

                  <small>
                    SessÃ£o ativa
                  </small>
                </div>


                <div
                  className={styles.userMenuDivider}
                />

                <NavLink
                  to="/perfil"
                  className={styles.profileLink}
                  onClick={() => setMenuOpen(false)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5.5 19c.7-3.3 3.1-5.2 6.5-5.2s5.8 1.9 6.5 5.2" />
                  </svg>
                  <span>Meu perfil</span>
                </NavLink>


                <button
                  type="button"
                  className={styles.logoutButton}
                  onClick={handleLogout}
                >
                  <svg viewBox="0 0 24 24">

                    <path
                      d="
                        M10 5
                        H6.8
                        A1.8 1.8 0 0 0
                        5 6.8
                        v10.4
                        A1.8 1.8 0 0 0
                        6.8 19
                        H10
                      "
                    />

                    <path d="M14 8l4 4-4 4" />

                    <path d="M18 12H9" />

                  </svg>

                  <span>
                    Desconectar
                  </span>

                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </header>
  );
}

