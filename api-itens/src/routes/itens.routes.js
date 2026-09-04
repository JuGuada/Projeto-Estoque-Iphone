import express from "express";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pool from "../database.js";

const router = express.Router();
const memoryItems = [];
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);
const uploadDirectory = path.resolve(currentDirectory, "../../uploads");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            return callback(null, true);
        }

        return callback(new Error("O arquivo precisa ser uma imagem ou um vídeo válido."));
    },
});

const EXTRA_COLUMNS = {
    imagem: "VARCHAR(255) DEFAULT NULL",
    preco_custo: "DECIMAL(10,2) DEFAULT NULL",
    estoque_minimo: "INT NOT NULL DEFAULT 5",
    modelo: "VARCHAR(150) DEFAULT NULL",
    cor: "VARCHAR(50) DEFAULT NULL",
    armazenamento: "VARCHAR(50) DEFAULT NULL",
    memoria_ram: "VARCHAR(50) DEFAULT NULL",
    sku: "VARCHAR(100) DEFAULT NULL",
    codigo_barras: "VARCHAR(100) DEFAULT NULL",
    categoria: "VARCHAR(100) DEFAULT NULL",
    ativo: "TINYINT(1) NOT NULL DEFAULT 1",
    status: "VARCHAR(30) NOT NULL DEFAULT 'Disponível'",
    desconto_percentual: "DECIMAL(5,2) NOT NULL DEFAULT 0",
    vitrine_config: "LONGTEXT DEFAULT NULL",
};

let itemSchemaPromise;

async function ensureItemSchema() {
    if (!itemSchemaPromise) {
        itemSchemaPromise = (async () => {
            const [columns] = await pool.query(`
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = 'itens'
            `);

            const existingColumns = new Set(columns.map(({ COLUMN_NAME }) => COLUMN_NAME));
            for (const [column, definition] of Object.entries(EXTRA_COLUMNS)) {
                if (!existingColumns.has(column)) {
                    await pool.query(`ALTER TABLE itens ADD COLUMN ${column} ${definition}`);
                }
            }
            await pool.query(`CREATE TABLE IF NOT EXISTS itens_historico (
                id INT AUTO_INCREMENT PRIMARY KEY, item_id INT NOT NULL,
                descricao VARCHAR(255) NOT NULL, autor VARCHAR(150) NOT NULL DEFAULT 'sistema',
                criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_historico_item (item_id)
            )`);
        })().catch((error) => {
            itemSchemaPromise = null;
            throw error;
        });
    }

    return itemSchemaPromise;
}

export async function getItemForFallback(itemId) {
    return memoryItems.find((item) => Number(item.id) === Number(itemId)) || null;
}

export function updateItemQuantityForFallback(itemId, quantidade) {
    const item = memoryItems.find((candidate) => Number(candidate.id) === Number(itemId));
    if (item) {
        item.quantidade = quantidade;
    }
}

router.get("/", async (req, res) => {
    try {
        await ensureItemSchema();
        const sql = `
        SELECT
            id,
            nome,
            descricao,
            preco,
            preco_custo,
            quantidade,
            estoque_minimo,
            imagem,
            modelo, cor, armazenamento, memoria_ram, sku,
            criado_em,
            categoria,
            status, desconto_percentual, vitrine_config,
            atualizado_em,
            COALESCE((
                SELECT SUM(m.quantidade)
                FROM movimentacoes m
                WHERE m.item_id = itens.id
                  AND m.tipo = 'saida'
                  AND LOWER(m.motivo) LIKE 'venda%'
            ), 0) AS vendas
        FROM itens
        ORDER BY id DESC
        `;

        const [itens] = await pool.query(sql);

        return res.json(itens);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao listar itens."
        });
    }
});

router.post("/upload-vitrine", upload.single("imagem"), (req, res) => {
    if (!req.file) return res.status(400).json({ erro: "Selecione uma imagem ou vídeo válido." });
    return res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

router.get("/:id", async (req, res) => {
    try {
    await ensureItemSchema();
        const { id } = req.params;

        const sql = `
        SELECT
            *
        FROM itens
        WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [id]);

        // corrigido: lenght -> length
        if (resultado.length === 0) {
            return res.status(404).json({
                erro: "Item não encontrado."
            });
        }

        const [historico] = await pool.query(
            "SELECT id, descricao, autor, criado_em FROM itens_historico WHERE item_id = ? ORDER BY criado_em DESC, id DESC", [id]
        );
        return res.json({ ...resultado[0], historico });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao buscar item."
        });
    }
});

router.post("/", upload.single("imagem"), async (req, res) => {
    try {
        await ensureItemSchema();
        const {
            nome,
            descricao,
            preco,
            precoVenda,
            precoCusto,
            quantidade,
            estoqueInicial,
            estoqueMinimo,
            modelo, cor, armazenamento, memoriaRam, sku, codigoBarras,
            categoria,
            status, descontoPercentual, ativo, autor,
        } = req.body;
        const precoFinal = preco ?? precoVenda;
        const quantidadeFinal = quantidade ?? estoqueInicial ?? 0;

        if (!nome || precoFinal === undefined) {
            return res.status(400).json({
                erro: "Nome e preço são obrigatórios."
            });
        }

        const sql = `
        INSERT INTO itens
            (nome, descricao, preco, preco_custo, quantidade, estoque_minimo, modelo, cor, armazenamento, memoria_ram, sku, codigo_barras, categoria, ativo, status, desconto_percentual)
        VALUES
              (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const [resultado] = await pool.query(sql, [
            nome,
            descricao || null,
            precoFinal,
            precoCusto || null,
            quantidadeFinal,
            estoqueMinimo || 5,
            modelo || null, cor || null, armazenamento || null, memoriaRam || null, sku || null, codigoBarras || null,
            categoria || null,
            ativo === "false" || ativo === false || ativo === "0" ? 0 : 1,
            status || (ativo === "false" || ativo === false || ativo === "0" ? "Indisponível" : "Disponível"), descontoPercentual || 0,
        ]);

        if (req.file) {
            await pool.query("UPDATE itens SET imagem = ? WHERE id = ?", [`/uploads/${req.file.filename}`, resultado.insertId]);
        }
        if (Number(quantidadeFinal) > 0) {
            await pool.query(`CREATE TABLE IF NOT EXISTS movimentacoes (
                id INT AUTO_INCREMENT PRIMARY KEY, item_id INT NOT NULL, tipo VARCHAR(20) NOT NULL,
                quantidade INT NOT NULL, motivo VARCHAR(255) DEFAULT '', numero_serie VARCHAR(100) DEFAULT '',
                responsavel VARCHAR(100) DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_movimentacoes_item_id (item_id), INDEX idx_movimentacoes_criado_em (criado_em)
            )`);
            await pool.query(
                "INSERT INTO movimentacoes (item_id, tipo, quantidade, motivo, numero_serie, responsavel) VALUES (?, 'entrada', ?, 'Estoque inicial do cadastro', '', ?)",
                [resultado.insertId, Number(quantidadeFinal), autor || "sistema"]
            );
        }
        await pool.query("INSERT INTO itens_historico (item_id, descricao, autor) VALUES (?, ?, ?)", [
            resultado.insertId, `Produto criado por ${autor || "sistema"}`, autor || "sistema"
        ]);

        const [itemCriado] = await pool.query(
            `
            SELECT
                *
            FROM itens
            WHERE id = ?
            `,
            [resultado.insertId]
        );

        return res.status(201).json(itemCriado[0]);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao criar item."
        });
    }
});

router.put("/:id", upload.single("imagem"), async (req, res) => {
    try {
    await ensureItemSchema();

        const { id } = req.params;
        const { nome, descricao, preco, quantidade, precoCusto, estoqueMinimo, modelo, cor, armazenamento,
            memoriaRam, sku, codigoBarras, categoria, ativo, status, descontoPercentual, vitrineConfig, autor } = req.body;

        if (!nome || preco === undefined || quantidade === undefined) {
            return res.status(400).json({
                erro: "nome, preço e quantidade são obrigatórios"
            });
        }

        const [atuais] = await pool.query("SELECT * FROM itens WHERE id = ?", [id]);
        if (!atuais.length) return res.status(404).json({ erro: "Item não encontrado." });
        const atual = atuais[0];
        const sql = `
        UPDATE itens
        SET 
        nome = ?,
        descricao = ?,
        preco = ?,
        quantidade = ?,
        preco_custo = ?, estoque_minimo = ?, modelo = ?, cor = ?, armazenamento = ?, memoria_ram = ?, sku = ?, codigo_barras = ?,
            categoria = ?, ativo = ?, status = ?, desconto_percentual = ?, vitrine_config = ?
        
        WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [
            nome,
            descricao || null,
            preco,
            quantidade,
            precoCusto ?? atual.preco_custo, estoqueMinimo ?? atual.estoque_minimo, modelo ?? atual.modelo, cor ?? atual.cor,
            armazenamento ?? atual.armazenamento, memoriaRam ?? atual.memoria_ram, sku ?? atual.sku, codigoBarras ?? atual.codigo_barras,
            categoria ?? atual.categoria, ativo === undefined ? atual.ativo : (ativo === "false" || ativo === false || ativo === "0" ? 0 : 1),
            status ?? atual.status, descontoPercentual ?? atual.desconto_percentual,
            vitrineConfig ?? atual.vitrine_config,
            id
        ]);

        if (req.file) {
            await pool.query("UPDATE itens SET imagem = ? WHERE id = ?", [`/uploads/${req.file.filename}`, id]);
        }
        if (Number(preco) !== Number(atual.preco) || Number(quantidade) !== Number(atual.quantidade)) {
            await pool.query("INSERT INTO itens_historico (item_id, descricao, autor) VALUES (?, ?, ?)", [
                id, `Produto atualizado por ${autor || "sistema"}`, autor || "sistema"
            ]);
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "item não encontrado",
            });
        }


        const [itemAtualizado] = await pool.query(
            `
            SELECT
            *
            FROM itens
            WHERE id = ?

            
            `,
            [id]
        );




        const [historico] = await pool.query("SELECT id, descricao, autor, criado_em FROM itens_historico WHERE item_id = ? ORDER BY criado_em DESC, id DESC", [id]);
        return res.json({ ...itemAtualizado[0], historico });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao atualizar item :(",
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {

        const { id } = req.params;
        const responsavel = req.body?.responsavel || req.query?.responsavel || "sistema";

        await ensureItemSchema();
        const [itens] = await pool.query("SELECT id, nome, sku, imagem, quantidade FROM itens WHERE id = ?", [id]);
        const item = itens[0];
        if (!item) return res.status(404).json({ erro: "item não encontrado" });

        await pool.query(`CREATE TABLE IF NOT EXISTS movimentacoes (
            id INT AUTO_INCREMENT PRIMARY KEY, item_id INT NOT NULL, tipo VARCHAR(20) NOT NULL,
            quantidade INT NOT NULL, motivo VARCHAR(255) DEFAULT '', numero_serie VARCHAR(100) DEFAULT '',
            responsavel VARCHAR(100) DEFAULT '', produto_nome VARCHAR(180) DEFAULT '',
            produto_imagem VARCHAR(500) DEFAULT '', criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_movimentacoes_item_id (item_id), INDEX idx_movimentacoes_criado_em (criado_em)
        )`);
        const [colunasMovimentacao] = await pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'movimentacoes'`);
        const nomesColunas = new Set(colunasMovimentacao.map(({ COLUMN_NAME }) => COLUMN_NAME));
        if (!nomesColunas.has('produto_nome')) await pool.query("ALTER TABLE movimentacoes ADD COLUMN produto_nome VARCHAR(180) DEFAULT ''");
        if (!nomesColunas.has('produto_imagem')) await pool.query("ALTER TABLE movimentacoes ADD COLUMN produto_imagem VARCHAR(500) DEFAULT ''");
        await pool.query(
            "INSERT INTO movimentacoes (item_id, tipo, quantidade, motivo, numero_serie, responsavel, produto_nome, produto_imagem) VALUES (?, 'saida', ?, 'Produto removido do catálogo', ?, ?, ?, ?)",
            [id, Math.max(Number(item.quantidade || 0), 1), item.sku || "", responsavel, item.nome, item.imagem || ""]
        );

        const sql = `
         DELETE from itens
         WHERE id = ? 
         `



        const [resultado] = await pool.query(sql, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "item não encontrado",
            });
        }

        return res.status(200).json({
            mensagem: "Item excluido com sucesso!",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao excluir o item :(",
        });
    }
});

export default router;
