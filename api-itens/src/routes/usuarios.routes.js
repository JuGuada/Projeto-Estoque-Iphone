import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../database.js";

const router = express.Router();

/* =====================================================
   LISTAR TODOS OS USUÃRIOS
===================================================== */

router.get("/", async (req, res) => {
    try {
        const sql = `
            SELECT
                id,
                nome,
                email,
                tipo,
                criado_em,
                atualizado_em
            FROM usuarios
            ORDER BY id DESC
        `;

        const [usuarios] = await pool.query(sql);

        return res.json(usuarios);

    } catch (error) {
        console.error("Erro ao listar usuÃ¡rios:", error);

        return res.status(500).json({
            erro: "Erro ao listar usuÃ¡rios."
        });
    }
});


/* =====================================================
   BUSCAR USUÃRIO POR ID
===================================================== */

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT
                id,
                nome,
                email,
                tipo,
                criado_em,
                atualizado_em
            FROM usuarios
            WHERE id = ?
        `;

        const [resultado] = await pool.query(sql, [id]);

        if (resultado.length === 0) {
            return res.status(404).json({
                erro: "UsuÃ¡rio nÃ£o encontrado."
            });
        }

        return res.json(resultado[0]);

    } catch (error) {
        console.error("Erro ao buscar usuÃ¡rio:", error);

        return res.status(500).json({
            erro: "Erro ao buscar usuÃ¡rio."
        });
    }
});


/* =====================================================
   CADASTRAR USUÃRIO
===================================================== */

router.post("/", async (req, res) => {
    try {
        const {
            nome,
            email,
            senha,
            tipo
        } = req.body;

        /* -----------------------------
           VALIDAÃ‡Ã•ES
        ----------------------------- */

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: "Nome, email e senha sÃ£o obrigatÃ³rios."
            });
        }

        /* 
           Se o frontend nÃ£o enviar o tipo,
           serÃ¡ criado como usuÃ¡rio comum.
        */
    const tipoUsuario = tipo || "usuario";

const tiposPermitidos = [
    "admin",
    "usuario",
    "gerente",
    "vendedor",
    "estoquista"
];

if (!tiposPermitidos.includes(tipoUsuario)) {
    return res.status(400).json({
        erro: "O tipo deve ser 'admin', 'usuario', 'gerente', 'vendedor' ou 'estoquista'."
    });
}
        /* -----------------------------
           VERIFICAR EMAIL
        ----------------------------- */

        const [usuarioExistente] = await pool.query(
            `
            SELECT id
            FROM usuarios
            WHERE email = ?
            `,
            [email]
        );

        if (usuarioExistente.length > 0) {
            return res.status(400).json({
                erro: "Este email jÃ¡ estÃ¡ cadastrado."
            });
        }


        /* -----------------------------
           CRIPTOGRAFAR SENHA
        ----------------------------- */

        const senhaCriptografada =
            await bcrypt.hash(senha, 10);


        /* -----------------------------
           INSERIR USUÃRIO
        ----------------------------- */

        const sql = `
            INSERT INTO usuarios
            (
                nome,
                email,
                senha,
                tipo
            )
            VALUES (?, ?, ?, ?)
        `;

        const [resultado] = await pool.query(
            sql,
            [
                nome,
                email,
                senhaCriptografada,
                tipoUsuario
            ]
        );


        /* -----------------------------
           BUSCAR USUÃRIO CRIADO
        ----------------------------- */

        const [usuarioCriado] = await pool.query(
            `
            SELECT
                id,
                nome,
                email,
                tipo,
                criado_em,
                atualizado_em
            FROM usuarios
            WHERE id = ?
            `,
            [resultado.insertId]
        );

        return res.status(201).json(
            usuarioCriado[0]
        );

    } catch (error) {
        console.error("Erro ao cadastrar usuÃ¡rio:", error);

        return res.status(500).json({
            erro: "Erro ao cadastrar usuÃ¡rio."
        });
    }
});


/* =====================================================
   ATUALIZAR USUÃRIO
===================================================== */

router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nome,
            email,
            senha,
            tipo
        } = req.body;


        /* -----------------------------
           VALIDAÃ‡Ã•ES
        ----------------------------- */

        if (!nome || !email) {
            return res.status(400).json({
                erro: "Nome e email sÃ£o obrigatÃ³rios."
            });
        }

const tiposPermitidos = [
    "admin",
    "usuario",
    "gerente",
    "vendedor",
    "estoquista"
];

if (
    tipo !== undefined &&
    !tiposPermitidos.includes(tipo)
) {
   return res.status(400).json({
    erro: "O tipo deve ser 'admin', 'usuario', 'gerente', 'vendedor' ou 'estoquista'."
});
}

        /* -----------------------------
           VERIFICAR USUÃRIO
        ----------------------------- */

        const [usuarioExistente] =
            await pool.query(
                `
                SELECT *
                FROM usuarios
                WHERE id = ?
                `,
                [id]
            );

        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                erro: "UsuÃ¡rio nÃ£o encontrado."
            });
        }


        /* -----------------------------
           VERIFICAR EMAIL
        ----------------------------- */

        const [emailExistente] =
            await pool.query(
                `
                SELECT id
                FROM usuarios
                WHERE email = ?
                AND id != ?
                `,
                [email, id]
            );

        if (emailExistente.length > 0) {
            return res.status(400).json({
                erro: "Este email jÃ¡ estÃ¡ sendo usado por outro usuÃ¡rio."
            });
        }


        /* -----------------------------
           ATUALIZAR COM SENHA
        ----------------------------- */

        if (senha && senha.trim() !== "") {

            const senhaCriptografada =
                await bcrypt.hash(senha, 10);

            await pool.query(
                `
                UPDATE usuarios
                SET
                    nome = ?,
                    email = ?,
                    senha = ?,
                    tipo = COALESCE(?, tipo)
                WHERE id = ?
                `,
                [
                    nome,
                    email,
                    senhaCriptografada,
                    tipo ?? null,
                    id
                ]
            );

        }

        /* -----------------------------
           ATUALIZAR SEM SENHA
        ----------------------------- */

        else {

            await pool.query(
                `
                UPDATE usuarios
                SET
                    nome = ?,
                    email = ?,
                    tipo = COALESCE(?, tipo)
                WHERE id = ?
                `,
                [
                    nome,
                    email,
                    tipo ?? null,
                    id
                ]
            );
        }


        /* -----------------------------
           BUSCAR USUÃRIO ATUALIZADO
        ----------------------------- */

        const [usuarioAtualizado] =
            await pool.query(
                `
                SELECT
                    id,
                    nome,
                    email,
                    tipo,
                    criado_em,
                    atualizado_em
                FROM usuarios
                WHERE id = ?
                `,
                [id]
            );

        return res.json(
            usuarioAtualizado[0]
        );

    } catch (error) {
        console.error("Erro ao atualizar usuÃ¡rio:", error);

        return res.status(500).json({
            erro: "Erro ao atualizar usuÃ¡rio."
        });
    }
});


/* =====================================================
   DELETAR USUÃRIO
===================================================== */

router.patch("/:id/senha", async (req, res) => {
    try {
        const { id } = req.params;
        const { senhaAtual, novaSenha } = req.body;
        if (!senhaAtual || !novaSenha) return res.status(400).json({ erro: "Informe a senha atual e a nova senha." });
        if (String(novaSenha).length < 6) return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres." });

        const [usuarios] = await pool.query("SELECT id, senha FROM usuarios WHERE id = ?", [id]);
        const usuario = usuarios[0];
        if (!usuario) return res.status(404).json({ erro: "UsuÃ¡rio nÃ£o encontrado." });
        const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaCorreta) return res.status(400).json({ erro: "A senha atual estÃ¡ incorreta." });
        if (await bcrypt.compare(novaSenha, usuario.senha)) return res.status(400).json({ erro: "A nova senha deve ser diferente da senha atual." });

        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
        await pool.query("UPDATE usuarios SET senha = ? WHERE id = ?", [senhaCriptografada, id]);
        return res.json({ mensagem: "Senha alterada com sucesso." });
    } catch (error) {
        console.error("Erro ao alterar senha:", error);
        return res.status(500).json({ erro: "Erro ao alterar senha." });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;


        /* -----------------------------
           VERIFICAR USUÃRIO
        ----------------------------- */

        const [usuarioExistente] =
            await pool.query(
                `
                SELECT id
                FROM usuarios
                WHERE id = ?
                `,
                [id]
            );

        if (usuarioExistente.length === 0) {
            return res.status(404).json({
                erro: "UsuÃ¡rio nÃ£o encontrado."
            });
        }


        /* -----------------------------
           DELETAR
        ----------------------------- */

        await pool.query(
            `
            DELETE FROM usuarios
            WHERE id = ?
            `,
            [id]
        );


        return res.json({
            mensagem: "UsuÃ¡rio deletado com sucesso."
        });

    } catch (error) {
        console.error("Erro ao deletar usuÃ¡rio:", error);

        return res.status(500).json({
            erro: "Erro ao deletar usuÃ¡rio."
        });
    }
});


/* =====================================================
   LOGIN
===================================================== */

router.post("/login", async (req, res) => {
    try {

        const {
            email,
            senha
        } = req.body;


        /* -----------------------------
           VALIDAÃ‡ÃƒO
        ----------------------------- */

        if (!email || !senha) {
            return res.status(400).json({
                erro: "Email e senha sÃ£o obrigatÃ³rios."
            });
        }


        /* -----------------------------
           BUSCAR USUÃRIO
        ----------------------------- */

        const [resultado] =
            await pool.query(
                `
                SELECT *
                FROM usuarios
                WHERE email = ?
                `,
                [email]
            );

        const usuario = resultado[0];


        if (!usuario) {
            return res.status(401).json({
                erro: "Email ou senha invÃ¡lidos."
            });
        }


        /* -----------------------------
           COMPARAR SENHA
        ----------------------------- */

        const senhaValida =
            await bcrypt.compare(
                senha,
                usuario.senha
            );


        if (!senhaValida) {
            return res.status(401).json({
                erro: "Email ou senha invÃ¡lidos."
            });
        }


        /* -----------------------------
           DADOS DO USUÃRIO
        ----------------------------- */

        const {
            id,
            nome,
            tipo
        } = usuario;


        /* -----------------------------
           GERAR TOKEN
        ----------------------------- */

        const token = jwt.sign(
            {
                id,
                nome,
                email: usuario.email,
                tipo
            },
            process.env.JWT_SECRET || "queijada",
            {
                expiresIn: "1d"
            }
        );


        /* -----------------------------
           RESPOSTA
        ----------------------------- */

        return res.json({
            mensagem: "Login realizado com sucesso.",

            token,

            usuario: {
                id,
                nome,
                email: usuario.email,
                tipo
            }
        });

    } catch (error) {

        console.error("Erro ao fazer login:", error);

        return res.status(500).json({
            erro: "Erro ao fazer login."
        });
    }
});


export default router;

