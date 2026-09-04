import express from "express";
import pool from "../database.js";
import { ensureMovementsTable } from "./movimentacoes.routes.js";
import { ensurePedidosTables } from "./pedidos.routes.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        await ensureMovementsTable();
        await ensurePedidosTables();

        const [[summary]] = await pool.query(`
            SELECT
                COUNT(*) AS total_produtos,
                COALESCE(SUM(quantidade), 0) AS total_unidades,
                COALESCE(SUM(preco * quantidade), 0) AS valor_estoque,
                SUM(CASE WHEN quantidade = 0 THEN 1 ELSE 0 END) AS sem_estoque,
                SUM(CASE WHEN quantidade > 0 AND quantidade <= estoque_minimo THEN 1 ELSE 0 END) AS estoque_baixo
            FROM itens
        `);

        const [alerts] = await pool.query(`
            SELECT id, nome, descricao, quantidade, estoque_minimo, preco, imagem
            FROM itens
            WHERE quantidade <= estoque_minimo
            ORDER BY quantidade ASC, nome ASC
            LIMIT 10
        `);

        const [movements] = await pool.query(`
            SELECT
                m.id, m.tipo, m.quantidade, m.motivo, m.numero_serie,
                m.responsavel, m.criado_em,
                COALESCE(NULLIF(m.produto_nome, ''), i.nome) AS produto_nome,
                COALESCE(NULLIF(m.produto_imagem, ''), i.imagem) AS produto_imagem
            FROM movimentacoes m
            LEFT JOIN itens i ON i.id = m.item_id
            ORDER BY m.criado_em DESC, m.id DESC
            LIMIT 8
        `);

        const [categories] = await pool.query(`
            SELECT c.nome, COUNT(i.id) AS total
            FROM categorias c
            LEFT JOIN itens i ON LOWER(i.categoria) = LOWER(c.nome)
            GROUP BY c.id, c.nome
            ORDER BY total DESC, c.nome ASC
        `);

        const [topProducts] = await pool.query(`
            SELECT i.id, i.nome, i.descricao, i.preco, i.quantidade, i.imagem,
                   COALESCE(SUM(CASE WHEN m.tipo = 'saida' THEN m.quantidade ELSE 0 END), 0) AS vendas
            FROM itens i
            LEFT JOIN movimentacoes m ON m.item_id = i.id
            GROUP BY i.id, i.nome, i.descricao, i.preco, i.quantidade, i.imagem
            ORDER BY vendas DESC, i.quantidade DESC, i.nome ASC
            LIMIT 5
        `);

        const [monthly] = await pool.query(`
            SELECT
                DATE_FORMAT(criado_em, '%Y-%m') AS mes,
                COALESCE(SUM(CASE WHEN tipo = 'saida' THEN quantidade ELSE 0 END), 0) AS saidas,
                COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN quantidade ELSE 0 END), 0) AS entradas
            FROM movimentacoes
            WHERE criado_em >= DATE_SUB(CURRENT_DATE, INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(criado_em, '%Y-%m')
            ORDER BY mes ASC
        `);

        const [[sales]] = await pool.query(`
            SELECT COUNT(*) AS total_pedidos, COALESCE(SUM(total), 0) AS faturamento
            FROM pedidos
            WHERE criado_em >= DATE_SUB(NOW(), INTERVAL 30 DAY)
              AND status <> 'Cancelado'
        `);

        return res.json({
            summary: {
                totalProdutos: Number(summary.total_produtos || 0),
                totalUnidades: Number(summary.total_unidades || 0),
                valorEstoque: Number(summary.valor_estoque || 0),
                semEstoque: Number(summary.sem_estoque || 0),
                estoqueBaixo: Number(summary.estoque_baixo || 0),
                totalPedidos: Number(sales.total_pedidos || 0),
                faturamento30Dias: Number(sales.faturamento || 0),
            },
            alerts,
            movements,
            categories,
            topProducts,
            monthly,
        });
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
        return res.status(500).json({ erro: "Erro ao carregar dados do dashboard." });
    }
});

export default router;

