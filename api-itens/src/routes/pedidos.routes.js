import express from "express";
import pool from "../database.js";
import { ensureMovementsTable } from "./movimentacoes.routes.js";

const router = express.Router();

export async function ensurePedidosTables() {
  await ensureMovementsTable();
  await pool.query(`CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(150) NOT NULL,
    usuario_nome VARCHAR(150) DEFAULT '',
    usuario_email VARCHAR(180) DEFAULT '',
    status VARCHAR(40) NOT NULL DEFAULT 'Confirmado',
    subtotal DECIMAL(12,2) NOT NULL,
    frete DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    parcelas INT NOT NULL DEFAULT 1,
    endereco_json LONGTEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pedidos_usuario (usuario_id),
    INDEX idx_pedidos_data (criado_em)
  )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS pedido_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    item_id INT NOT NULL,
    nome VARCHAR(180) NOT NULL,
    categoria VARCHAR(100) DEFAULT '',
    cor VARCHAR(100) DEFAULT '',
    imagem VARCHAR(500) DEFAULT '',
    preco_unitario DECIMAL(12,2) NOT NULL,
    quantidade INT NOT NULL,
    INDEX idx_pedido_itens_pedido (pedido_id),
    INDEX idx_pedido_itens_item (item_id)
  )`);
  for (const comando of [
    "ALTER TABLE pedidos ADD COLUMN cupom VARCHAR(50) DEFAULT ''",
    "ALTER TABLE pedidos ADD COLUMN desconto DECIMAL(12,2) NOT NULL DEFAULT 0"
  ]) {
    try { await pool.query(comando); } catch (error) { if (error.code !== "ER_DUP_FIELDNAME") throw error; }
  }
}

function parseEndereco(valor) {
  try { return JSON.parse(valor || "{}"); } catch { return {}; }
}

router.get("/", async (req, res) => {
  try {
    await ensurePedidosTables();
    const usuarioId = req.query.usuario;
    const parametros = [];
    const filtro = usuarioId ? "WHERE p.usuario_id = ?" : "";
    if (usuarioId) parametros.push(usuarioId);
    const [pedidos] = await pool.query(`SELECT p.* FROM pedidos p ${filtro} ORDER BY p.criado_em DESC, p.id DESC`, parametros);
    if (!pedidos.length) return res.json([]);
    const ids = pedidos.map((pedido) => pedido.id);
    const [itens] = await pool.query("SELECT * FROM pedido_itens WHERE pedido_id IN (?) ORDER BY id", [ids]);
    return res.json(pedidos.map((pedido) => ({
      id: pedido.id,
      usuarioId: pedido.usuario_id,
      usuarioNome: pedido.usuario_nome,
      usuarioEmail: pedido.usuario_email,
      status: pedido.status,
      subtotal: Number(pedido.subtotal),
      frete: Number(pedido.frete),
      total: Number(pedido.total),
      formaPagamento: pedido.forma_pagamento,
      parcelas: pedido.parcelas,
      cupom: pedido.cupom || "",
      desconto: Number(pedido.desconto || 0),
      endereco: parseEndereco(pedido.endereco_json),
      criadoEm: pedido.criado_em,
      itens: itens.filter((item) => item.pedido_id === pedido.id).map((item) => ({
        id: item.item_id, nome: item.nome, categoria: item.categoria, cor: item.cor,
        imagem: item.imagem, preco: Number(item.preco_unitario), quantidade: item.quantidade,
      })),
    })));
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return res.status(500).json({ erro: "Erro ao listar pedidos." });
  }
});

router.patch("/:id/status", async (req, res) => {
  const permitidos = ["Pedido realizado", "Em separaÃ§Ã£o", "Preparando envio", "Em transporte", "Entregue", "Cancelado"];
  const id = Number(req.params.id);
  const { status } = req.body;
  if (!Number.isInteger(id) || id <= 0 || !permitidos.includes(status)) return res.status(400).json({ erro: "Pedido ou status invÃ¡lido." });
  try {
    await ensurePedidosTables();
    const [resultado] = await pool.query("UPDATE pedidos SET status = ? WHERE id = ?", [status, id]);
    if (!resultado.affectedRows) return res.status(404).json({ erro: "Pedido nÃ£o encontrado." });
    return res.json({ id, status });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    return res.status(500).json({ erro: "Erro ao atualizar status do pedido." });
  }
});

router.post("/", async (req, res) => {
  const { usuarioId, usuarioNome, usuarioEmail, itens, formaPagamento, parcelas, endereco, cupom } = req.body;
  if (!usuarioId || !Array.isArray(itens) || !itens.length || !formaPagamento || !endereco?.cep || !endereco?.logradouro) {
    return res.status(400).json({ erro: "Cliente, itens, pagamento e endereÃ§o completo sÃ£o obrigatÃ³rios." });
  }

  let connection;
  try {
    await ensurePedidosTables();
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const itensPedido = [];

    for (const itemSolicitado of itens) {
      const quantidade = Number(itemSolicitado.quantidade || 1);
      const [resultado] = await connection.query("SELECT id, nome, categoria, preco, quantidade, imagem FROM itens WHERE id = ? FOR UPDATE", [itemSolicitado.id]);
      const item = resultado[0];
      if (!item) throw new Error(`Produto ${itemSolicitado.nome || itemSolicitado.id} nÃ£o encontrado.`);
      if (!Number.isInteger(quantidade) || quantidade <= 0 || Number(item.quantidade) < quantidade) {
        throw new Error(`Estoque insuficiente para ${item.nome}.`);
      }
      itensPedido.push({ ...item, quantidadeCompra: quantidade, cor: itemSolicitado.cor || "", imagemCompra: itemSolicitado.imagem || item.imagem || "" });
    }

    const subtotal = itensPedido.reduce((total, item) => total + Number(item.preco) * item.quantidadeCompra, 0);
    const frete = subtotal >= 500 ? 0 : 29.9;
    const cupomValido = String(cupom || "").trim().toLowerCase() === "cupom";
    const descontoCupom = cupomValido ? subtotal * 0.10 : 0;
    const descontoPix = formaPagamento === "pix" ? subtotal * 0.03 : 0;
    const desconto = descontoCupom + descontoPix;
    const total = Math.max(0, subtotal - desconto + frete);
    const [pedidoResult] = await connection.query(
      `INSERT INTO pedidos (usuario_id, usuario_nome, usuario_email, subtotal, frete, desconto, cupom, total, forma_pagamento, parcelas, endereco_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [String(usuarioId), usuarioNome || "", usuarioEmail || "", subtotal, frete, desconto, cupomValido ? "cupom" : "", total, formaPagamento, Number(parcelas || 1), JSON.stringify(endereco)]
    );

    for (const item of itensPedido) {
      await connection.query(
        `INSERT INTO pedido_itens (pedido_id, item_id, nome, categoria, cor, imagem, preco_unitario, quantidade)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [pedidoResult.insertId, item.id, item.nome, item.categoria || "", item.cor, item.imagemCompra, item.preco, item.quantidadeCompra]
      );
      await connection.query("UPDATE itens SET quantidade = quantidade - ? WHERE id = ?", [item.quantidadeCompra, item.id]);
      await connection.query(
        "INSERT INTO movimentacoes (item_id, tipo, quantidade, motivo, numero_serie, responsavel, operador_tipo) SELECT ?, 'saida', ?, ?, COALESCE(sku, ''), ?, 'cliente' FROM itens WHERE id = ?",
        [item.id, item.quantidadeCompra, `Venda online â€¢ Pedido #${pedidoResult.insertId}`, usuarioNome || usuarioEmail || "Cliente", item.id]
      );
    }

    await connection.commit();
    return res.status(201).json({ id: pedidoResult.insertId, status: "Confirmado", subtotal, frete, desconto, total, criadoEm: new Date().toISOString() });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Erro ao finalizar pedido:", error);
    return res.status(400).json({ erro: error.message || "Erro ao finalizar pedido." });
  } finally {
    connection?.release();
  }
});

export default router;

