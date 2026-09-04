import {
  Navigate,
  Outlet,
  useLocation
} from "react-router-dom";

import { useAuth } from "../contexts/authContext.jsx";

import Header from "../components/Header";
import Menu from "../components/Menu";
import { idPermissaoDaRota, usePermissoes } from "../hooks/usePermissoes.js";


export default function RotasPrivadas() {

  const {
    estaLogado,
    carregando,
    usuario
  } = useAuth();

  const location = useLocation();
  const permissoes = usePermissoes(usuario);


  /* =========================================================
     CARREGANDO AUTENTICAÇÃO
  ========================================================= */

  if (carregando) {
    return <p>Carregando....</p>;
  }


  /* =========================================================
     NÃO ESTÁ LOGADO
  ========================================================= */

  if (!estaLogado) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* As vitrines possuem o próprio UserHeader e devem manter o mesmo
     layout para clientes, administradores e para o monitor de preview. */
  const ehPaginaProduto = location.pathname.startsWith("/produto/");

  if (ehPaginaProduto) {
    return (
      <main className="cartContent">
        <Outlet />
      </main>
    );
  }


  /* =========================================================
     USUÁRIO COMUM
  ========================================================= */

  if (
    usuario &&
    usuario.tipo === "usuario"
  ) {

    /*
      Rotas que o cliente pode acessar.

      /
      /carrinho
      /pedidos
      /meus-pedidos
      /perfil
      /produto/iphone/:id
      /produto/mac/:id
      /produto/ipad/:id
      /produto/airpods/:id
    */

   const rotaPermitida =
  location.pathname === "/" ||

  location.pathname === "/carrinho" ||

  location.pathname === "/finalizar-compra" ||

  location.pathname === "/pedidos" ||

  location.pathname === "/meus-pedidos" ||

  location.pathname === "/perfil" ||

  location.pathname.startsWith(
    "/produto/iphone/"
  ) ||

  location.pathname.startsWith(
    "/produto/mac/"
  ) ||

  location.pathname.startsWith(
    "/produto/ipad/"
  ) ||

  location.pathname.startsWith(
    "/produto/airpods/"
  );

    /* se tentar acessar dashboard/admin */

    if (!rotaPermitida) {
      return (
        <Navigate
          to="/carrinho"
          replace
        />
      );
    }


    /*
      Carrinho e páginas de produto
      usam o próprio UserHeader,
      então NÃO colocamos Header/Menu
      administrativos aqui.
    */

    return (
      <main className="cartContent">
        <Outlet />
      </main>
    );

  }

  if (usuario?.tipo !== 'admin') {
    if (permissoes === null) return <p>Carregando permissões...</p>;
    const necessaria = idPermissaoDaRota(location.pathname);
    if (!permissoes.includes(necessaria)) {
      const destinos = [[1, '/dashboard'], [2, '/estoque'], [3, '/produtos'], [4, '/movimentacoes'], [5, '/cadastro'], [6, '/usuario'], [7, '/configuracoes']];
      const destino = destinos.find(([id]) => permissoes.includes(id))?.[1];
      return destino ? <Navigate to={destino} replace /> : <div style={{ padding: 40 }}>Seu cargo ainda não possui áreas liberadas. Solicite acesso ao administrador.</div>;
    }
  }


  /* =========================================================
     ADMINISTRADOR
  ========================================================= */

  return (
    <>
      <Header />

      <Menu />

      <main className="privateContent">
        <Outlet />
      </main>
    </>
  );

}
