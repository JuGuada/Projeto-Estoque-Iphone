import express from "express";
import itensRoutes from "./itens.routes.js";
import usuariosRoutes from "./usuarios.routes.js";
import categoriasRoutes from "./categorias.routes.js";
import notificacoesRoutes from "./notificacao.routes.js";
import movimentacoesRoutes from "./movimentacoes.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import pedidosRoutes from "./pedidos.routes.js";
import permissoesRoutes from "./permissoes.routes.js";

const routes = express.Router();

routes.get("/", (req, res) => {
    return res.json({
        mensagem: "api funcionando!",
    });
});

routes.use("/itens", itensRoutes);
routes.use("/usuarios", usuariosRoutes);
routes.use("/categorias", categoriasRoutes);
routes.use("/notificacoes", notificacoesRoutes);
routes.use("/movimentacoes", movimentacoesRoutes);
routes.use("/dashboard", dashboardRoutes);
routes.use("/pedidos", pedidosRoutes);
routes.use("/permissoes", permissoesRoutes);

export default routes;
