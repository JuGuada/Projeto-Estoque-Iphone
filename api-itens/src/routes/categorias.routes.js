import express from "express";
import pool from "../database.js";

const router = express.Router();

// LISTAR CATEGORIAS
router.get("/", async (req, res) => {
    try {
        const sql = `
            SELECT *
            FROM categorias
            ORDER BY nome
        `;

        const [categorias] = await pool.query(sql);

        return res.json(categorias);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao listar categorias."
        });
    }
});

// BUSCAR CATEGORIA POR ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT *
            FROM categorias
            WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.length === 0) {
            return res.status(404).json({
                erro: "Categoria nÃ£o encontrada."
            });
        }

        return res.json(resultado[0]);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao buscar categoria."
        });
    }
});

export default router;
