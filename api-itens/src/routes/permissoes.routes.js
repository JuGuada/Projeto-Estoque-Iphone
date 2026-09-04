import express from "express";
import pool from "../database.js";

const router = express.Router();
const padroes = {
  vendedor: [1, 2, 3],
  gerente: [1, 2, 3, 4, 5, 6],
  estoquista: [1, 2, 3, 4, 5],
};

async function garantirTabela() {
  await pool.query(`CREATE TABLE IF NOT EXISTS permissoes_cargos (
    cargo VARCHAR(40) PRIMARY KEY,
    permissoes_json LONGTEXT NOT NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`);
  for (const [cargo, permissoes] of Object.entries(padroes)) {
    await pool.query("INSERT IGNORE INTO permissoes_cargos (cargo, permissoes_json) VALUES (?, ?)", [cargo, JSON.stringify(permissoes)]);
  }
}

router.get("/", async (_req, res) => {
  try {
    await garantirTabela();
    const [linhas] = await pool.query("SELECT cargo, permissoes_json FROM permissoes_cargos");
    const resposta = { admin: [1, 2, 3, 4, 5, 6, 7] };
    linhas.forEach((linha) => { try { resposta[linha.cargo] = JSON.parse(linha.permissoes_json); } catch { resposta[linha.cargo] = []; } });
    return res.json(resposta);
  } catch (error) { console.error(error); return res.status(500).json({ erro: "Erro ao carregar permissÃµes." }); }
});

router.put("/:cargo", async (req, res) => {
  try {
    await garantirTabela();
    const cargo = String(req.params.cargo || "").toLowerCase();
    const permissoes = [...new Set((req.body.permissoes || []).map(Number).filter((id) => id >= 1 && id <= 7))];
    if (!Object.keys(padroes).includes(cargo)) return res.status(400).json({ erro: "Cargo invÃ¡lido ou nÃ£o editÃ¡vel." });
    await pool.query("INSERT INTO permissoes_cargos (cargo, permissoes_json) VALUES (?, ?) ON DUPLICATE KEY UPDATE permissoes_json = VALUES(permissoes_json)", [cargo, JSON.stringify(permissoes)]);
    return res.json({ cargo, permissoes });
  } catch (error) { console.error(error); return res.status(500).json({ erro: "Erro ao salvar permissÃµes." }); }
});

export default router;

