import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../database.js";

const router = express.Router();

/* =====================================================
   LISTAR TODOS OS USUÁRIOS
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
        console.error("Erro ao listar usuários:", error);

        return res.status(500).json({
            erro: "Erro ao listar usuários."
        });
    }
});


/* =====================================================
   BUSCAR USUÁRIO POR ID
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
                erro: "Usuário não encontrado."
            });
        }

        return res.json(resultado[0]);

    } catch (error) {
        console.error("Erro ao buscar usuário:", error);

        return res.status(500).json({
            erro: "Erro ao buscar usuário."
        });
    }
});


/* =====================================================
   CADASTRAR USUÁRIO
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
           VALIDAÇÕES
        ----------------------------- */

        if (!nome || !email || !senha) {
            return res.status(400).json({
                erro: "Nome, email e senha são obrigatórios."
            });
        }

        /* 
           Se o frontend não enviar o tipo,
           será criado como usuário comum.
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
                erro: "Este email já está cadastrado."
            });
        }


        /* -----------------------------
           CRIPTOGRAFAR SENHA
        ----------------------------- */

        const senhaCriptografada =
            await bcrypt.hash(senha, 10);


        /* -----------------------------
           INSERIR USUÁRIO
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
           BUSCAR USUÁRIO CRIADO
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
        console.error("Erro ao cadastrar usuário:", error);

        return res.status(500).json({
            erro: "Erro ao cadastrar usuário."
        });
    }
});


/* =====================================================
   ATUALIZAR USUÁRIO
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
           VALIDAÇÕES
        ----------------------------- */

        if (!nome || !email) {
            return res.status(400).json({
                erro: "Nome e email são obrigatórios."
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
           VERIFICAR USUÁRIO
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
                erro: "Usuário não encontrado."
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
                erro: "Este email já está sendo usado por outro usuário."
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
           BUSCAR USUÁRIO ATUALIZADO
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
        console.error("Erro ao atualizar usuário:", error);

        return res.status(500).json({
            erro: "Erro ao atualizar usuário."
        });
    }
});


/* =====================================================
   DELETAR USUÁRIO
===================================================== */

router.patch("/:id/senha", async (req, res) => {
    try {
        const { id } = req.params;
        const { senhaAtual, novaSenha } = req.body;
        if (!senhaAtual || !novaSenha) return res.status(400).json({ erro: "Informe a senha atual e a nova senha." });
        if (String(novaSenha).length < 6) return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres." });

        const [usuarios] = await pool.query("SELECT id, senha FROM usuarios WHERE id = ?", [id]);
        const usuario = usuarios[0];
        if (!usuario) return res.status(404).json({ erro: "Usuário não encontrado." });
        const senhaCorreta = await bcrypt.compare(senhaAtual, usuario.senha);
        if (!senhaCorreta) return res.status(400).json({ erro: "A senha atual está incorreta." });
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
           VERIFICAR USUÁRIO
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
                erro: "Usuário não encontrado."
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
            mensagem: "Usuário deletado com sucesso."
        });

    } catch (error) {
        console.error("Erro ao deletar usuário:", error);

        return res.status(500).json({
            erro: "Erro ao deletar usuário."
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
           VALIDAÇÃO
        ----------------------------- */

        if (!email || !senha) {
            return res.status(400).json({
                erro: "Email e senha são obrigatórios."
            });
        }


        /* -----------------------------
           BUSCAR USUÁRIO
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
                erro: "Email ou senha inválidos."
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
                erro: "Email ou senha inválidos."
            });
        }


        /* -----------------------------
           DADOS DO USUÁRIO
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
