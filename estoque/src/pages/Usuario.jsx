import { useEffect, useMemo, useState } from "react";
import styles from "../styles/usuario.module.css";
import { API_URL as API_BASE_URL } from "../services/api.js";

const API_URL = `${API_BASE_URL}/usuarios`;

function gerarIniciais(nome = "") {
  const partes = nome.trim().split(/\s+/).filter(Boolean);

  if (partes.length === 0) {
    return "US";
  }

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  return (
    partes[0][0] +
    partes[partes.length - 1][0]
  ).toUpperCase();
}

function escolherCor(id) {
  const cores = [
    "verde",
    "laranja",
    "roxo",
    "rosa",
    "azul",
  ];

  return cores[(Number(id) || 0) % cores.length];
}

function formatarData(data) {
  if (!data) {
    return "Não informado";
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return data;
  }

  return dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatarDataCompleta(data) {
  if (!data) {
    return "Não informado";
  }

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return data;
  }

  return dataObj.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizarUsuario(usuario) {
  return {
    ...usuario,

    tipo: usuario.tipo || "usuario",

    iniciais: gerarIniciais(usuario.nome),

    cor: escolherCor(usuario.id),

    cadastroFormatado: formatarData(usuario.criado_em),

    atualizadoFormatado: formatarData(
      usuario.atualizado_em
    ),
  };
}

export default function Usuario() {
  /* =========================
     ESTADOS
  ========================= */

  const [usuarios, setUsuarios] = useState([]);

  const [carregando, setCarregando] = useState(true);

  const [erro, setErro] = useState("");

  const [busca, setBusca] = useState("");

  const [menuAberto, setMenuAberto] = useState(null);

  const [usuarioSelecionado, setUsuarioSelecionado] =
    useState(null);

  const [usuarioDetalhes, setUsuarioDetalhes] =
    useState(null);

  const [abaDetalhes, setAbaDetalhes] =
    useState("Visão geral");

  const [modalAdicionar, setModalAdicionar] =
    useState(false);

  const [modalEditar, setModalEditar] =
    useState(false);

  const [mensagem, setMensagem] = useState("");

  const [salvando, setSalvando] = useState(false);

  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "usuario",
  });

  /* =========================
     TOKEN
  ========================= */

  function getToken() {
    return localStorage.getItem("token");
  }

  function getHeaders() {
    const token = getToken();

    return {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  }

  /* =========================
     MENSAGEM
  ========================= */

  function mostrarMensagem(texto) {
    setMensagem(texto);

    setTimeout(() => {
      setMensagem("");
    }, 3000);
  }

  /* =========================
     CARREGAR USUÁRIOS
  ========================= */

  async function carregarUsuarios() {
    setCarregando(true);
    setErro("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "Erro ao carregar os usuários."
        );
      }

      if (!Array.isArray(data)) {
        throw new Error("A API retornou uma lista de usuários inválida.");
      }

      const usuariosFormatados = data
        .map(normalizarUsuario)
        .filter((usuario) => usuario.tipo === "usuario");

      setUsuarios(usuariosFormatados);
    } catch (error) {
      console.error(error);

      setErro(
        error.message ||
          "Erro ao conectar com o servidor."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const totalUsuarios = usuarios.length;
  const limiteRecentes = Date.now() - (7 * 24 * 60 * 60 * 1000);
  const novos = usuarios.filter((usuario) => new Date(usuario.criado_em).getTime() >= limiteRecentes).length;
  const atualizados = usuarios.filter((usuario) => new Date(usuario.atualizado_em).getTime() >= limiteRecentes).length;

  /* =========================
     FILTROS
  ========================= */

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const texto = busca
        .toLowerCase()
        .trim();

      const correspondeBusca =
        usuario.nome
          ?.toLowerCase()
          .includes(texto) ||
        usuario.email
          ?.toLowerCase()
          .includes(texto);

      return correspondeBusca;
    });
  }, [usuarios, busca]);

  /* =========================
     MODAL ADICIONAR
  ========================= */

  function abrirAdicionar() {
    setFormulario({
      nome: "",
      email: "",
      senha: "",
      tipo: "usuario",
    });

    setErro("");

    setModalAdicionar(true);
  }

  /* =========================
     MODAL EDITAR
  ========================= */

  function abrirEditar(usuario) {
    setUsuarioSelecionado(usuario);

    setFormulario({
      nome: usuario.nome || "",
      email: usuario.email || "",
      senha: "",
      tipo: usuario.tipo || "usuario",
    });

    setMenuAberto(null);

    setModalEditar(true);
  }

  /* =========================
     FECHAR MODAIS
  ========================= */

  function fecharModais() {
    setModalAdicionar(false);
    setModalEditar(false);
    setUsuarioSelecionado(null);

    setFormulario({
      nome: "",
      email: "",
      senha: "",
      tipo: "usuario",
    });
  }

  /* =========================
     FORMULÁRIO
  ========================= */

  function alterarFormulario(event) {
    const { name, value } = event.target;

    setFormulario((estado) => ({
      ...estado,
      [name]: value,
    }));
  }

  /* =========================
     ADICIONAR USUÁRIO
  ========================= */

  async function adicionarUsuario(event) {
    event.preventDefault();

    if (!formulario.nome.trim()) {
      mostrarMensagem(
        "Informe o nome do usuário."
      );
      return;
    }

    if (!formulario.email.trim()) {
      mostrarMensagem(
        "Informe o e-mail do usuário."
      );
      return;
    }

    if (!formulario.senha.trim()) {
      mostrarMensagem(
        "Informe uma senha."
      );
      return;
    }

    if (
      !["admin", "usuario"].includes(
        formulario.tipo
      )
    ) {
      mostrarMensagem(
        "Selecione um tipo válido."
      );
      return;
    }

    setSalvando(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",

        headers: getHeaders(),

        body: JSON.stringify({
          nome: formulario.nome.trim(),
          email: formulario.email.trim(),
          senha: formulario.senha,
          tipo: formulario.tipo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "Erro ao cadastrar usuário."
        );
      }

      const usuarioCriado =
        normalizarUsuario(data);

      setUsuarios((estado) => [
        usuarioCriado,
        ...estado,
      ]);

      fecharModais();

      mostrarMensagem(
        "Usuário cadastrado com sucesso!"
      );
    } catch (error) {
      console.error(error);

      mostrarMensagem(
        error.message ||
          "Erro ao cadastrar usuário."
      );
    } finally {
      setSalvando(false);
    }
  }

  /* =========================
     EDITAR USUÁRIO
  ========================= */

  async function salvarEdicao(event) {
    event.preventDefault();

    if (!usuarioSelecionado) {
      return;
    }

    if (!formulario.nome.trim()) {
      mostrarMensagem(
        "Informe o nome do usuário."
      );
      return;
    }

    if (!formulario.email.trim()) {
      mostrarMensagem(
        "Informe o e-mail do usuário."
      );
      return;
    }

    setSalvando(true);

    try {
      const corpo = {
        nome: formulario.nome.trim(),
        email: formulario.email.trim(),
        tipo: formulario.tipo,
      };

      if (formulario.senha.trim()) {
        corpo.senha = formulario.senha;
      }

      const response = await fetch(
        `${API_URL}/${usuarioSelecionado.id}`,
        {
          method: "PUT",

          headers: getHeaders(),

          body: JSON.stringify(corpo),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "Erro ao atualizar usuário."
        );
      }

      const usuarioAtualizado =
        normalizarUsuario(data);

      setUsuarios((estado) =>
        estado.map((usuario) =>
          usuario.id ===
          usuarioSelecionado.id
            ? usuarioAtualizado
            : usuario
        )
      );

      if (
        usuarioDetalhes &&
        usuarioDetalhes.id ===
          usuarioSelecionado.id
      ) {
        setUsuarioDetalhes(
          usuarioAtualizado
        );
      }

      fecharModais();

      mostrarMensagem(
        "Usuário atualizado com sucesso!"
      );
    } catch (error) {
      console.error(error);

      mostrarMensagem(
        error.message ||
          "Erro ao atualizar usuário."
      );
    } finally {
      setSalvando(false);
    }
  }

  /* =========================
     DETALHES
  ========================= */

  function abrirDetalhes(usuario) {
    setUsuarioDetalhes(usuario);

    setAbaDetalhes("Visão geral");

    setMenuAberto(null);
  }

  function fecharDetalhes() {
    setUsuarioDetalhes(null);
  }

  /* =========================
     REDEFINIR SENHA
  ========================= */

  async function redefinirSenha(usuario) {
    setMenuAberto(null);

    const novaSenha = window.prompt(
      `Digite a nova senha para ${usuario.nome}:`
    );

    if (novaSenha === null) {
      return;
    }

    if (novaSenha.trim().length < 6) {
      mostrarMensagem(
        "A senha deve ter pelo menos 6 caracteres."
      );
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${usuario.id}`,
        {
          method: "PUT",

          headers: getHeaders(),

          body: JSON.stringify({
            nome: usuario.nome,
            email: usuario.email,
            tipo: usuario.tipo,
            senha: novaSenha,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "Erro ao redefinir senha."
        );
      }

      mostrarMensagem(
        "Senha redefinida com sucesso."
      );
    } catch (error) {
      console.error(error);

      mostrarMensagem(
        error.message ||
          "Erro ao redefinir senha."
      );
    }
  }

  /* =========================
     EXCLUIR
  ========================= */

  async function excluirUsuario(usuario) {
    setMenuAberto(null);

    const confirmar = window.confirm(
      `Tem certeza que deseja excluir ${usuario.nome}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${usuario.id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.erro ||
            "Erro ao excluir usuário."
        );
      }

      setUsuarios((estado) =>
        estado.filter(
          (item) =>
            item.id !== usuario.id
        )
      );

      if (
        usuarioDetalhes &&
        usuarioDetalhes.id === usuario.id
      ) {
        setUsuarioDetalhes(null);
      }

      mostrarMensagem(
        "Usuário excluído com sucesso."
      );
    } catch (error) {
      console.error(error);

      mostrarMensagem(
        error.message ||
          "Erro ao excluir usuário."
      );
    }
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <main className={styles.page}>
      {/* TOAST */}

      {mensagem && (
        <div className={styles.toast}>
          <span></span>
          {mensagem}
        </div>
      )}

      {/* ERRO */}

      {erro && (
        <div className={styles.toast}>
          <span></span>
          {erro}
        </div>
      )}

      {/* =========================
          TOPO
      ========================= */}

      <section className={styles.topo}>
        <div>
          <span className={styles.breadcrumb}>
            Administração
          </span>

          <h1>Usuários</h1>

          <p>
            Consulte e atualize os dados das contas cadastradas.
          </p>
        </div>
      </section>

      {/* =========================
          CARDS
      ========================= */}

      <section className={styles.cards}>
        <div className={styles.card}>
          <span>Total de usuários</span>

          <strong>
            {totalUsuarios}
          </strong>

          <small>
            Cadastrados na plataforma
          </small>
        </div>

        <div className={styles.card}>
          <span>Contas atualizadas</span>

          <div className={styles.cardTitulo}>
            <strong>
              {atualizados}
            </strong>

            <span className={styles.badgeVerde}>
              últimos 7 dias
            </span>
          </div>

          <small>
            Alteradas recentemente
          </small>
        </div>

        <div className={styles.card}>
          <span>Novos cadastros</span>

          <div className={styles.cardTitulo}>
            <strong>
              {novos}
            </strong>

            <span className={styles.badgeRoxo}>
              +{novos} novos
            </span>
          </div>

          <small>
            Nos últimos 7 dias
          </small>
        </div>
      </section>

      {/* =========================
          TABELA
      ========================= */}

      <section className={styles.tabelaContainer}>
        <div className={styles.filtros}>
          <div className={styles.busca}>
            <img
              src="/imagens/busca.png"
              alt=""
            />

            <input
              type="text"
              placeholder="Buscar por nome ou e-mail"
              value={busca}
              onChange={(event) =>
                setBusca(event.target.value)
              }
            />
          </div>

        </div>

        <div className={styles.contador}>
          {carregando
            ? "Carregando..."
            : `${usuariosFiltrados.length} usuários`}
        </div>

        <div className={styles.tabelaWrapper}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Cadastro</th>
                <th>Atualizado</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {!carregando &&
                usuariosFiltrados.map(
                  (usuario) => (
                    <tr key={usuario.id}>
                      {/* USUÁRIO */}

                      <td>
                        <button
                          className={
                            styles.usuarioCelula
                          }
                          onClick={() =>
                            abrirDetalhes(
                              usuario
                            )
                          }
                          type="button"
                        >
                          <div
                            className={`${styles.avatar} ${styles[usuario.cor]}`}
                          >
                            {usuario.iniciais}
                          </div>

                          <div>
                            <strong>
                              {usuario.nome}
                            </strong>

                            <span>
                              {usuario.email}
                            </span>
                          </div>
                        </button>
                      </td>

                      {/* TIPO */}

                      {/* CADASTRO */}

                      <td>
                        <span
                          className={styles.data}
                        >
                          {
                            usuario.cadastroFormatado
                          }
                        </span>
                      </td>

                      {/* ATUALIZADO */}

                      <td>
                        <div
                          className={
                            styles.acesso
                          }
                        >
                          <strong>
                            {
                              usuario.atualizadoFormatado
                            }
                          </strong>

                          {usuario.atualizado_em && (
                            <span>
                              {formatarDataCompleta(
                                usuario.atualizado_em
                              )}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* AÇÕES */}

                      <td
                        className={
                          styles.acoesCelula
                        }
                      >
                        <button
                          className={
                            styles.botaoMais
                          }
                          onClick={(event) => {
                            event.stopPropagation();

                            setMenuAberto(
                              menuAberto ===
                                usuario.id
                                ? null
                                : usuario.id
                            );
                          }}
                          type="button"
                        >
                          <span></span>
                          <span></span>
                          <span></span>
                        </button>

                        {menuAberto ===
                          usuario.id && (
                          <div
                            className={
                              styles.menuAcoes
                            }
                          >
                            <span>
                              Ações rápidas
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                abrirEditar(
                                  usuario
                                )
                              }
                            >
                              <img
                                src="/imagens/editar.png"
                                alt=""
                              />

                              Editar dados
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                redefinirSenha(
                                  usuario
                                )
                              }
                            >
                              <img
                                src="/imagens/senha.png"
                                alt=""
                              />

                              Redefinir senha
                            </button>

                            <button
                              type="button"
                              className={
                                styles.excluir
                              }
                              onClick={() =>
                                excluirUsuario(
                                  usuario
                                )
                              }
                            >
                              <img
                                src="/imagens/excluir.png"
                                alt=""
                              />

                              Excluir usuário
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>

          {!carregando &&
            usuariosFiltrados.length ===
              0 && (
              <div
                className={
                  styles.semResultados
                }
              >
                Nenhum usuário encontrado.
              </div>
            )}

          {carregando && (
            <div
              className={
                styles.semResultados
              }
            >
              Carregando usuários...
            </div>
          )}
        </div>
      </section>

      {/* =========================
          MODAL ADICIONAR
      ========================= */}

      {modalAdicionar && (
        <div
          className={styles.overlay}
          onClick={fecharModais}
        >
          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <h2>
                  Adicionar usuário
                </h2>

                <p>
                  Cadastre um novo usuário
                  na plataforma.
                </p>
              </div>

              <button
                className={styles.fechar}
                onClick={fecharModais}
                type="button"
              >
                <img
                  src="/imagens/fechar.png"
                  alt=""
                />
              </button>
            </div>

            <form
              onSubmit={adicionarUsuario}
            >
              <div
                className={
                  styles.formulario
                }
              >
                <label>
                  Nome completo

                  <input
                    type="text"
                    name="nome"
                    value={
                      formulario.nome
                    }
                    onChange={
                      alterarFormulario
                    }
                    placeholder="Ex.: Maria Silva"
                    autoFocus
                  />
                </label>

                <label>
                  E-mail

                  <input
                    type="email"
                    name="email"
                    value={
                      formulario.email
                    }
                    onChange={
                      alterarFormulario
                    }
                    placeholder="nome@empresa.com"
                  />
                </label>

                <label>
                  Senha

                  <input
                    type="password"
                    name="senha"
                    value={
                      formulario.senha
                    }
                    onChange={
                      alterarFormulario
                    }
                    placeholder="Mínimo de 6 caracteres"
                  />
                </label>

                <label>
                  Tipo de usuário

                  <select
                    name="tipo"
                    value={
                      formulario.tipo
                    }
                    onChange={
                      alterarFormulario
                    }
                  >
                    <option value="usuario">
                      Usuário
                    </option>

                    <option value="admin">
                      Administrador
                    </option>
                  </select>
                </label>
              </div>

              <div
                className={
                  styles.modalFooter
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelar
                  }
                  onClick={fecharModais}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={
                    styles.confirmar
                  }
                  disabled={salvando}
                >
                  {salvando
                    ? "Cadastrando..."
                    : "Adicionar usuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          MODAL EDITAR
      ========================= */}

      {modalEditar && (
        <div
          className={styles.overlay}
          onClick={fecharModais}
        >
          <div
            className={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <h2>
                  Editar usuário
                </h2>

                <p>
                  Atualize os dados da conta do usuário.
                </p>
              </div>

              <button
                className={styles.fechar}
                onClick={fecharModais}
                type="button"
              >
                <img
                  src="/imagens/fechar.png"
                  alt=""
                />
              </button>
            </div>

            <form
              onSubmit={salvarEdicao}
            >
              <div
                className={
                  styles.formulario
                }
              >
                <label>
                  Nome completo

                  <input
                    type="text"
                    name="nome"
                    value={
                      formulario.nome
                    }
                    onChange={
                      alterarFormulario
                    }
                  />
                </label>

                <label>
                  E-mail

                  <input
                    type="email"
                    name="email"
                    value={
                      formulario.email
                    }
                    onChange={
                      alterarFormulario
                    }
                  />
                </label>

                <label>
                  Nova senha

                  <input
                    type="password"
                    name="senha"
                    value={
                      formulario.senha
                    }
                    onChange={
                      alterarFormulario
                    }
                    placeholder="Deixe vazio para manter"
                  />
                </label>

              </div>

              <div
                className={
                  styles.modalFooter
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelar
                  }
                  onClick={fecharModais}
                  disabled={salvando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={
                    styles.confirmar
                  }
                  disabled={salvando}
                >
                  {salvando
                    ? "Salvando..."
                    : "Salvar alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          PAINEL LATERAL
      ========================= */}

      {usuarioDetalhes && (
        <>
          <div
            className={
              styles.painelOverlay
            }
            onClick={
              fecharDetalhes
            }
          />

          <aside
            className={styles.painel}
          >
            <div
              className={
                styles.painelTopo
              }
            >
              <button
                className={
                  styles.fecharPainel
                }
                onClick={
                  fecharDetalhes
                }
                type="button"
              >
                <img
                  src="/imagens/fechar.png"
                  alt=""
                />
              </button>

              <div
                className={
                  styles.usuarioPainel
                }
              >
                <div
                  className={`${styles.avatarGrande} ${styles[usuarioDetalhes.cor]}`}
                >
                  {
                    usuarioDetalhes.iniciais
                  }
                </div>

                <div>
                  <h2>
                    {
                      usuarioDetalhes.nome
                    }
                  </h2>

                  <span
                    className={
                      styles.permissao
                    }
                  >
                    {usuarioDetalhes.tipo ===
                    "admin"
                      ? "Administrador"
                      : "Usuário"}
                  </span>
                </div>
              </div>

              <div
                className={
                  styles.botoesPainel
                }
              >
                <button
                  className={
                    styles.botaoEditarPainel
                  }
                  onClick={() =>
                    abrirEditar(
                      usuarioDetalhes
                    )
                  }
                  type="button"
                >
                  <img
                    src="/imagens/editar.png"
                    alt=""
                  />

                  Editar
                </button>

                <button
                  className={
                    styles.botaoSenhaPainel
                  }
                  onClick={() =>
                    redefinirSenha(
                      usuarioDetalhes
                    )
                  }
                  type="button"
                >
                  <img
                    src="/imagens/senha.png"
                    alt=""
                  />

                  Redefinir senha
                </button>
              </div>
            </div>

            <div
              className={
                styles.abasPainel
              }
            >
              <button
                className={
                  abaDetalhes ===
                  "Visão geral"
                    ? styles.abaAtiva
                    : ""
                }
                onClick={() =>
                  setAbaDetalhes(
                    "Visão geral"
                  )
                }
                type="button"
              >
                Visão geral
              </button>

              <button
                className={
                  abaDetalhes ===
                  "Atividades"
                    ? styles.abaAtiva
                    : ""
                }
                onClick={() =>
                  setAbaDetalhes(
                    "Atividades"
                  )
                }
                type="button"
              >
                Dados
              </button>
            </div>

            {/* VISÃO GERAL */}

            {abaDetalhes ===
              "Visão geral" && (
              <div
                className={
                  styles.detalhesLista
                }
              >
                <div>
                  <img
                    src="/imagens/email.png"
                    alt=""
                  />

                  <span>
                    E-mail
                  </span>

                  <strong>
                    {
                      usuarioDetalhes.email
                    }
                  </strong>
                </div>

                <div>
                  <img
                    src="/imagens/permissao.png"
                    alt=""
                  />

                  <span>
                    Tipo
                  </span>

                  <strong>
                    {usuarioDetalhes.tipo ===
                    "admin"
                      ? "Administrador"
                      : "Usuário"}
                  </strong>
                </div>

                <div>
                  <img
                    src="/imagens/calendario.png"
                    alt=""
                  />

                  <span>
                    Cadastro
                  </span>

                  <strong>
                    {
                      usuarioDetalhes.cadastroFormatado
                    }
                  </strong>
                </div>

                <div>
                  <img
                    src="/imagens/acesso.png"
                    alt=""
                  />

                  <span>
                    Última atualização
                  </span>

                  <strong>
                    {
                      usuarioDetalhes.atualizadoFormatado
                    }
                  </strong>
                </div>
              </div>
            )}

            {/* DADOS */}

            {abaDetalhes ===
              "Atividades" && (
              <div
                className={
                  styles.listaAtividades
                }
              >
                <div
                  className={
                    styles.atividade
                  }
                >
                  <div
                    className={
                      styles.atividadeIcon
                    }
                  >
                    <img
                      src="/imagens/usuario.png"
                      alt=""
                    />
                  </div>

                  <div>
                    <strong>
                      Dados da conta
                    </strong>

                    <p>
                      ID do usuário:{" "}
                      {
                        usuarioDetalhes.id
                      }
                    </p>

                    <small>
                      Criado em{" "}
                      {
                        usuarioDetalhes.cadastroFormatado
                      }
                    </small>
                  </div>
                </div>

              </div>
            )}
          </aside>
        </>
      )}
    </main>
  );
}
