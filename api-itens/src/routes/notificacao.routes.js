import express from "express";
import pool from "../database.js";
import { ensureMovementsTable } from "./movimentacoes.routes.js";

const router = express.Router();

async function ensureNotificationSettings() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notificacoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            estoque_baixo BOOLEAN NOT NULL DEFAULT TRUE,
            novas_entradas BOOLEAN NOT NULL DEFAULT TRUE,
            alertas_criticos BOOLEAN NOT NULL DEFAULT TRUE,
            resumo_diario BOOLEAN NOT NULL DEFAULT FALSE,
            email_notificacao VARCHAR(150) DEFAULT NULL,
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
    await pool.query("INSERT IGNORE INTO notificacoes (id) VALUES (1)");
}

router.get("/feed", async (_req, res) => {
    try {
        await ensureNotificationSettings();
        await ensureMovementsTable();
        const [[config]] = await pool.query("SELECT * FROM notificacoes WHERE id = 1");
        const notificacoes = [];
        if (config.estoque_baixo) {
            const [itens] = await pool.query("SELECT id, nome, quantidade, estoque_minimo, imagem FROM itens WHERE quantidade <= estoque_minimo ORDER BY quantidade ASC LIMIT 6");
            itens.forEach((item) => notificacoes.push({ id: `estoque-${item.id}`, tipo: Number(item.quantidade) === 0 ? "critico" : "estoque", titulo: Number(item.quantidade) === 0 ? "Produto sem estoque" : "Estoque baixo", mensagem: `${item.nome}: ${item.quantidade} unidade(s) restante(s)`, imagem: item.imagem, criadoEm: new Date().toISOString(), destino: "/estoque" }));
        }
        if (config.novas_entradas) {
            const [movimentos] = await pool.query("SELECT m.id, m.tipo, m.motivo, m.quantidade, m.criado_em, COALESCE(NULLIF(m.produto_nome,''),i.nome) produto_nome, COALESCE(NULLIF(m.produto_imagem,''),i.imagem) imagem FROM movimentacoes m LEFT JOIN itens i ON i.id=m.item_id ORDER BY m.criado_em DESC LIMIT 6");
            movimentos.forEach((item) => notificacoes.push({ id: `mov-${item.id}`, tipo: item.tipo === "entrada" ? "entrada" : "venda", titulo: item.tipo === "entrada" ? "Nova entrada de estoque" : "Nova saída ou venda", mensagem: `${item.produto_nome || "Produto"}: ${item.quantidade} unidade(s)`, imagem: item.imagem, criadoEm: item.criado_em, destino: "/movimentacoes" }));
            movimentos.forEach((movimento) => {
                if (movimento.tipo === "entrada") return;
                const notificacao = notificacoes.find((item) => item.id === `mov-${movimento.id}`);
                if (!notificacao) return;

                const produtoRemovido = String(movimento.motivo || "").toLowerCase().includes("produto removido");
                notificacao.tipo = produtoRemovido ? "removido" : "venda";
                notificacao.titulo = produtoRemovido ? "Produto removido do catálogo" : "Produto vendido";
                notificacao.imagem = produtoRemovido ? "/imagens/lixeira.png" : "/imagens/correto.png";
            });
        }
        try {
            const [pedidos] = await pool.query("SELECT id, usuario_nome, total, criado_em FROM pedidos WHERE status <> 'Cancelado' ORDER BY criado_em DESC LIMIT 5");
            pedidos.forEach((pedido) => notificacoes.push({ id: `pedido-${pedido.id}`, tipo: "venda", titulo: `Nova venda • Pedido #${pedido.id}`, mensagem: `${pedido.usuario_nome || "Cliente"} • R$ ${Number(pedido.total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, criadoEm: pedido.criado_em, destino: "/dashboard" }));
        } catch { /* ainda não há tabela de pedidos */ }
        notificacoes.forEach((notificacao) => {
            if (notificacao.tipo === "venda") notificacao.imagem = "/imagens/correto.png";
            if (notificacao.tipo === "removido") notificacao.imagem = "/imagens/lixeira.png";
        });
        notificacoes.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
        return res.json(notificacoes.slice(0, 12));
    } catch (error) { console.error(error); return res.status(500).json({ erro: "Erro ao carregar notificações." }); }
});


/* =====================================================
   BUSCAR CONFIGURAÇÕES DE NOTIFICAÇÕES
===================================================== */

router.get("/", async (req, res) => {
    try {
        await ensureNotificationSettings();

        const sql = `
            SELECT
                id,
                estoque_baixo,
                novas_entradas,
                alertas_criticos,
                resumo_diario,
                email_notificacao,
                criado_em,
                atualizado_em
            FROM notificacoes
            WHERE id = 1
        `;

        const [resultado] = await pool.query(sql);

        if (resultado.length === 0) {
            return res.status(404).json({
                erro: "Configurações de notificações não encontradas."
            });
        }

        return res.json(resultado[0]);

    } catch (error) {

        console.error(
            "Erro ao buscar configurações de notificações:",
            error
        );

        return res.status(500).json({
            erro: "Erro ao buscar configurações de notificações."
        });
    }
});

router.put("/", async (req, res) => {
    try {
        await ensureNotificationSettings();
        const { estoque_baixo, novas_entradas, alertas_criticos, resumo_diario, email_notificacao } = req.body;
        await pool.query(`
            UPDATE notificacoes SET estoque_baixo = ?, novas_entradas = ?, alertas_criticos = ?,
                resumo_diario = ?, email_notificacao = ? WHERE id = 1
        `, [Boolean(estoque_baixo), Boolean(novas_entradas), Boolean(alertas_criticos), Boolean(resumo_diario), email_notificacao || null]);
        const [resultado] = await pool.query("SELECT * FROM notificacoes WHERE id = 1");
        return res.json(resultado[0]);
    } catch (error) {
        console.error("Erro ao salvar configurações de notificações:", error);
        return res.status(500).json({ erro: "Erro ao salvar configurações de notificações." });
    }
});


export default router;
