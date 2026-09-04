import express from "express";
import pool from "../database.js";
import { getItemForFallback, updateItemQuantityForFallback } from "./itens.routes.js";

const router = express.Router();
let memoryMovements = [];

export const ensureMovementsTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS movimentacoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            item_id INT NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            quantidade INT NOT NULL,
            motivo VARCHAR(255) DEFAULT '',
            numero_serie VARCHAR(100) DEFAULT '',
            responsavel VARCHAR(100) DEFAULT '',
            operador_tipo VARCHAR(30) DEFAULT 'administrador',
            produto_nome VARCHAR(180) DEFAULT '',
            produto_imagem VARCHAR(500) DEFAULT '',
            criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_movimentacoes_item_id (item_id),
            INDEX idx_movimentacoes_criado_em (criado_em)
        )
    `);

    const [columns] = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'movimentacoes'
    `);
    const existingColumns = new Set(columns.map(({ COLUMN_NAME }) => COLUMN_NAME));

    if (!existingColumns.has('numero_serie')) {
        await pool.query("ALTER TABLE movimentacoes ADD COLUMN numero_serie VARCHAR(100) DEFAULT ''");
    }

    if (!existingColumns.has('responsavel')) {
        await pool.query("ALTER TABLE movimentacoes ADD COLUMN responsavel VARCHAR(100) DEFAULT ''");
    }
    if (!existingColumns.has('operador_tipo')) {
        await pool.query("ALTER TABLE movimentacoes ADD COLUMN operador_tipo VARCHAR(30) DEFAULT 'administrador'");
    }
    if (!existingColumns.has('produto_nome')) {
        await pool.query("ALTER TABLE movimentacoes ADD COLUMN produto_nome VARCHAR(180) DEFAULT ''");
    }
    if (!existingColumns.has('produto_imagem')) {
        await pool.query("ALTER TABLE movimentacoes ADD COLUMN produto_imagem VARCHAR(500) DEFAULT ''");
    }

    const [itemColumns] = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'itens'
    `);

    if (!itemColumns.some(({ COLUMN_NAME }) => COLUMN_NAME === 'estoque_minimo')) {
        await pool.query("ALTER TABLE itens ADD COLUMN estoque_minimo INT NOT NULL DEFAULT 5");
    }

    await pool.query(`
        INSERT INTO movimentacoes (item_id, tipo, quantidade, motivo, numero_serie, responsavel, produto_nome, produto_imagem)
        SELECT i.id, 'entrada', i.quantidade, 'Estoque inicial do cadastro', '', 'sistema', i.nome, COALESCE(i.imagem, '')
        FROM itens i
        WHERE i.quantidade > 0
          AND NOT EXISTS (SELECT 1 FROM movimentacoes m WHERE m.item_id = i.id)
    `);

    await pool.query(`
        UPDATE movimentacoes m
        LEFT JOIN itens i ON i.id = m.item_id
        SET m.tipo = 'saida',
            m.motivo = 'Produto removido do catÃ¡logo',
            m.responsavel = CASE WHEN m.responsavel = '' OR m.responsavel = 'sistema' THEN 'admin@estoque.com' ELSE m.responsavel END
        WHERE i.id IS NULL
          AND m.tipo = 'entrada'
          AND m.motivo = 'Estoque inicial do cadastro'
    `);
};

const normalizeMovement = (movement) => {
    const estoqueAtual = Number(movement.estoque_atual || 0);
    const estoqueMinimo = Number(movement.estoque_minimo || 5);

    return {
        id: movement.id,
        item_id: movement.item_id,
        tipo: movement.tipo,
        quantidade: Number(movement.quantidade || 0),
        motivo: movement.motivo || "Sem motivo informado",
        responsavel: String(movement.responsavel || "Administrador").trim() || "Administrador",
        operador_tipo: movement.operador_tipo === "cliente" ? "cliente" : "administrador",
        sku: movement.sku || movement.numero_serie || "SKU nÃ£o informado",
        criado_em: movement.criado_em || new Date().toISOString(),
        produto_nome: movement.produto_nome || "Produto removido",
        produto_imagem: movement.produto_imagem || "",
        estoque_atual: estoqueAtual,
        estoque_minimo: estoqueMinimo,
        status: estoqueAtual <= estoqueMinimo ? "AtenÃ§Ã£o" : "Normal",
        descricao: `${movement.tipo === "entrada" ? "Entrada" : "SaÃ­da"} de ${Number(movement.quantidade || 0)} unidade(s) â€¢ ${movement.motivo || "Sem motivo informado"}`
    };
};

const getMovementsFromDatabase = async () => {
    try {
        await ensureMovementsTable();
        const [movimentacoes] = await pool.query(`
            SELECT
                movimentacoes.id,
                movimentacoes.item_id,
                movimentacoes.tipo,
                movimentacoes.quantidade,
                movimentacoes.motivo,
                movimentacoes.numero_serie,
                movimentacoes.responsavel,
                movimentacoes.operador_tipo,
                movimentacoes.criado_em,
                COALESCE(NULLIF(movimentacoes.produto_nome, ''), itens.nome) AS produto_nome,
                itens.quantidade AS estoque_atual,
                itens.estoque_minimo,
                COALESCE(NULLIF(movimentacoes.produto_imagem, ''), itens.imagem) AS produto_imagem,
                COALESCE(NULLIF(movimentacoes.numero_serie, ''), itens.sku, '') AS sku
            FROM movimentacoes
            LEFT JOIN itens ON itens.id = movimentacoes.item_id
            ORDER BY movimentacoes.criado_em DESC, movimentacoes.id DESC
        `);
        return movimentacoes.map(normalizeMovement);
    } catch (error) {
        return memoryMovements.map(normalizeMovement);
    }
};

router.get("/", async (req, res) => {
    return res.json(await getMovementsFromDatabase());
});

router.post("/", async (req, res) => {
    const { item_id, tipo, quantidade, motivo, sku, numero_serie, responsavel } = req.body;
    const itemId = Number(item_id);
    const quantidadeMovimentada = Number(quantidade);

    if (!itemId || !["entrada", "saida"].includes(tipo) || !Number.isInteger(quantidadeMovimentada) || quantidadeMovimentada <= 0) {
        return res.status(400).json({ erro: "Produto, tipo e uma quantidade inteira maior que zero sÃ£o obrigatÃ³rios." });
    }

    let connection;
    try {
        await ensureMovementsTable();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [itens] = await connection.query(
            "SELECT id, nome, sku, quantidade, estoque_minimo, imagem FROM itens WHERE id = ? FOR UPDATE",
            [itemId]
        );
        const item = itens[0];

        if (!item) {
            await connection.rollback();
            return res.status(404).json({ erro: "Produto nÃ£o encontrado." });
        }

        const estoqueAtual = Number(item.quantidade || 0);
        const novoEstoque = tipo === "entrada"
            ? estoqueAtual + quantidadeMovimentada
            : estoqueAtual - quantidadeMovimentada;

        if (novoEstoque < 0) {
            await connection.rollback();
            return res.status(400).json({ erro: "A saÃ­da nÃ£o pode ser maior que o estoque atual." });
        }

        await connection.query("UPDATE itens SET quantidade = ? WHERE id = ?", [novoEstoque, itemId]);
        const [resultado] = await connection.query(
            "INSERT INTO movimentacoes (item_id, tipo, quantidade, motivo, numero_serie, responsavel, operador_tipo, produto_nome, produto_imagem) VALUES (?, ?, ?, ?, ?, ?, 'administrador', ?, ?)",
            [itemId, tipo, quantidadeMovimentada, motivo || "Sem motivo informado", sku || numero_serie || item.sku || "", String(responsavel || "Administrador").trim() || "Administrador", item.nome, item.imagem || ""]
        );
        await connection.commit();

        return res.status(201).json(normalizeMovement({
            id: resultado.insertId,
            item_id: itemId,
            tipo,
            quantidade: quantidadeMovimentada,
            motivo,
            sku: sku || numero_serie || item.sku || "",
            responsavel: String(responsavel || "Administrador").trim() || "Administrador",
            operador_tipo: "administrador",
            produto_nome: item.nome,
            produto_imagem: item.imagem,
            estoque_atual: novoEstoque,
            estoque_minimo: item.estoque_minimo,
            criado_em: new Date().toISOString()
        }));
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        const item = await getItemForFallback(itemId);
        if (!item) {
            return res.status(404).json({ erro: "Produto nÃ£o encontrado." });
        }

        const estoqueAtual = Number(item.quantidade || 0);
        const novoEstoque = tipo === "entrada"
            ? estoqueAtual + quantidadeMovimentada
            : estoqueAtual - quantidadeMovimentada;

        if (novoEstoque < 0) {
            return res.status(400).json({ erro: "A saÃ­da nÃ£o pode ser maior que o estoque atual." });
        }

        updateItemQuantityForFallback(itemId, novoEstoque);
        const movement = normalizeMovement({
            id: Date.now(),
            item_id: itemId,
            tipo,
            quantidade: quantidadeMovimentada,
            motivo,
            sku: sku || numero_serie || item.sku || "",
            responsavel: String(responsavel || "Administrador").trim() || "Administrador",
            operador_tipo: "administrador",
            produto_nome: item.nome,
            estoque_atual: novoEstoque,
            estoque_minimo: item.estoque_minimo,
            criado_em: new Date().toISOString()
        });
        memoryMovements = [movement, ...memoryMovements];
        return res.status(201).json(movement);
    } finally {
        connection?.release();
    }
});

export default router;

