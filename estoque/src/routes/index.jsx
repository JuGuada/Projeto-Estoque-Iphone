// src/routes/index.jsx

import {
  Navigate,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import { useAuth } from "../contexts/authContext.jsx";

import RotasPublicas from "./RotasPublicas";
import RotasPrivadas from "./RotasPrivadas";

import VisaoGeral from "../pages/VisaoGeral.jsx";
import Movimentacoes from "../pages/Movimentacoes.jsx";
import Configuracao from "../pages/Configuracao.jsx";
import Produtos from "../pages/Produtos.jsx";
import Carrinho from "../pages/Carrinho.jsx";
import HomeUsuario from "../pages/HomeUsuario.jsx";
import Login from "../pages/Login.jsx";
import Cadastro from "../pages/Cadastro.jsx";
import CadastroUsuario from "../pages/CadastroUsuario.jsx";
import ProdutoIphone from "../pages/ProdutoIphone.jsx";
import ProdutoMac from "../pages/ProdutoMac.jsx";
import ProdutoIpad from "../pages/ProdutoIpad.jsx";
import ProdutoAirpods from "../pages/ProdutoAirpods.jsx";
import Estoque from "../pages/Estoque.jsx";
import Editar from "../pages/Editar.jsx";
import MeusPedidos from "../pages/MeusPedidos.jsx";
import Perfil from "../pages/Perfil.jsx";
import FinalizarCompra from "../pages/FinalizarCompra.jsx";
import GestaoUsuarios from "../pages/GestaoUsuarios.jsx";

const layoutsPorCategoria = {
  iphone: ProdutoIphone,
  mac: ProdutoMac,
  ipad: ProdutoIpad,
  tablet: ProdutoIpad,
  airpods: ProdutoAirpods,
  airpod: ProdutoAirpods,
};

function ProdutoPorCategoria() {
  const { categoria: categoriaParam } = useParams();
  const categoria = categoriaParam?.toLowerCase();
  const Layout = layoutsPorCategoria[categoria];

  if (!Layout) {
    return <Navigate to="/carrinho" replace />;
  }

  return <Layout />;
}

function HomePorPerfil() {
  const { usuario } = useAuth();

  return usuario?.tipo === "usuario" ? <HomeUsuario /> : <VisaoGeral />;
}

function PedidosPorPerfil() {
  const { usuario } = useAuth();
  return usuario?.tipo === "usuario" ? <MeusPedidos /> : <Navigate to="/usuario?aba=pedidos" replace />;
}


export function AppRoutes() {

  return (

    <Routes>

      {/* ================================
          ROTAS PÚBLICAS
      ================================= */}

      <Route element={<RotasPublicas />}>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/cadastrar"
          element={<CadastroUsuario />}
        />

      </Route>


      {/* ================================
          ROTAS PRIVADAS
      ================================= */}

      <Route element={<RotasPrivadas />}>

        <Route
          path="/"
          element={<HomePorPerfil />}
        />

        <Route
          path="/dashboard"
          element={<VisaoGeral />}
        />

        <Route
          path="/movimentacoes"
          element={<Movimentacoes />}
        />

        <Route
          path="/configuracoes"
          element={<Configuracao />}
        />

        <Route
          path="/produtos"
          element={<Produtos />}
        />
        <Route
          path="/estoque"
          element={<Estoque />}
        />

        <Route
          path="/editar/:id"
          element={<Editar />}
        />

         <Route
          path="/cadastro"
          element={<Cadastro />}
        />

        <Route
          path="/usuario"
          element={<GestaoUsuarios />}
        />

        <Route
          path="/carrinho"
          element={<Carrinho />}
        />

        <Route
          path="/finalizar-compra"
          element={<FinalizarCompra />}
        />

        <Route
          path="/pedidos"
          element={<PedidosPorPerfil />}
        />

        <Route
          path="/meus-pedidos"
          element={<MeusPedidos />}
        />

        <Route
          path="/perfil"
          element={<Perfil />}
        />


        <Route
          path="/produto/:categoria/:id"
          element={<ProdutoPorCategoria />}
        />

      </Route>

      {/* ================================
          404
      ================================= */}

      <Route
        path="*"
        element={
          <h1>
            Página não encontrada
          </h1>
        }
      />

    </Routes>

  );

}
