import { useState } from "react";
import { useAuth } from "../contexts/authContext.jsx";
import UserHeader from "../components/UserHeader";
import { apiRequest } from "../services/api.js";
import styles from "../styles/perfil.module.css";

export default function Perfil() {
    const { usuario } = useAuth();
    const [editando, setEditando] = useState(false);
    const [senhaAberta, setSenhaAberta] = useState(false);
    const [editandoEndereco, setEditandoEndereco] = useState(false);
    const [nome, setNome] = useState(usuario?.nome || "Usuário");
    const [email, setEmail] = useState(usuario?.email || "");
    const [senhas, setSenhas] = useState({ atual: "", nova: "", confirmar: "" });
    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);
    const chaveEndereco = `endereco_salvo_${usuario?.id || usuario?.email || "anonimo"}`;
    const [endereco, setEndereco] = useState(() => {
        const vazio = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "" };
        try {
            const salvo = JSON.parse(localStorage.getItem(`endereco_salvo_${usuario?.id || usuario?.email || "anonimo"}`) || "null");
            if (salvo) return { ...vazio, ...salvo };
            const rascunho = JSON.parse(localStorage.getItem("pedido_em_andamento") || "null");
            return { ...vazio, ...(rascunho?.endereco || {}) };
        } catch { return vazio; }
    });

    const alterarEndereco = (campo) => (event) => setEndereco((atual) => ({ ...atual, [campo]: event.target.value }));

    function salvarEndereco(event) {
        event.preventDefault();
        localStorage.setItem(chaveEndereco, JSON.stringify(endereco));
        setMensagem("Endereço salvo com sucesso.");
        setErro("");
        setEditandoEndereco(false);
    }

    async function salvarPerfil(event) {
        event.preventDefault();
        if (!usuario?.id) return setErro("Não foi possível identificar sua conta.");
        setSalvando(true); setErro(""); setMensagem("");
        try {
            const atualizado = await apiRequest(`/usuarios/${usuario.id}`, { method: "PUT", body: JSON.stringify({ nome, email, tipo: usuario.tipo }) });
            localStorage.setItem("usuario", JSON.stringify({ ...usuario, ...atualizado }));
            setMensagem("Perfil atualizado com sucesso.");
            setEditando(false);
        } catch (error) { setErro(error.message); }
        finally { setSalvando(false); }
    }

    async function alterarSenha(event) {
        event.preventDefault();
        setErro(""); setMensagem("");
        if (!usuario?.id) return setErro("Não foi possível identificar sua conta.");
        if (senhas.nova.length < 6) return setErro("A nova senha deve ter pelo menos 6 caracteres.");
        if (senhas.nova !== senhas.confirmar) return setErro("A confirmação da senha não confere.");
        setSalvando(true);
        try {
            const resposta = await apiRequest(`/usuarios/${usuario.id}/senha`, { method: "PATCH", body: JSON.stringify({ senhaAtual: senhas.atual, novaSenha: senhas.nova }) });
            setMensagem(resposta.mensagem || "Senha alterada com sucesso.");
            setSenhas({ atual: "", nova: "", confirmar: "" });
            setSenhaAberta(false);
        } catch (error) { setErro(error.message); }
        finally { setSalvando(false); }
    }

    return <div className={styles.page}><div className={styles.main}><UserHeader /><main className={styles.content}>
        <header className={styles.heading}><h1>Perfil</h1><p>Gerencie suas informações pessoais e a segurança da conta.</p></header>
        {(mensagem || erro) && <p className={erro ? styles.profileError : styles.profileSuccess} role="status">{erro || mensagem}</p>}
        <section className={styles.card}><div className={styles.cardHeader}><h2>Informações pessoais</h2><button type="button" className={styles.editButton} onClick={() => setEditando((atual) => !atual)}>{editando ? "Cancelar" : "Editar perfil"}</button></div><div className={styles.profileBody}>
            <div className={styles.profilePhoto} aria-label="Foto do perfil"><span className={styles.profileHead}></span><span className={styles.profileSilhouetteBody}></span></div>
            {editando ? <form className={styles.fields} onSubmit={salvarPerfil}><label>Nome<input required value={nome} onChange={(event) => setNome(event.target.value)} /></label><label>E-mail<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><button disabled={salvando} type="submit" className={styles.saveButton}>{salvando ? "Salvando..." : "Salvar alterações"}</button></form> : <div className={styles.fields}><div><span>Nome</span><strong>{nome}</strong></div><div><span>E-mail</span><strong>{email}</strong></div></div>}
        </div></section>
        <section className={styles.addressCard}>
            <div className={styles.addressHeader}><div><h2>Endereço salvo</h2><p>Use este endereço para preencher suas próximas compras.</p></div><button type="button" className={styles.editButton} onClick={() => setEditandoEndereco((atual) => !atual)}>{editandoEndereco ? "Cancelar" : endereco.logradouro ? "Editar endereço" : "Adicionar endereço"}</button></div>
            {editandoEndereco ? <form className={styles.addressForm} onSubmit={salvarEndereco}>
                <label>CEP<input required value={endereco.cep} onChange={alterarEndereco("cep")} placeholder="00000-000" maxLength="9" /></label><label className={styles.addressWide}>Endereço<input required value={endereco.logradouro} onChange={alterarEndereco("logradouro")} placeholder="Rua ou avenida" /></label><label>Número<input required value={endereco.numero} onChange={alterarEndereco("numero")} /></label><label>Complemento<input value={endereco.complemento} onChange={alterarEndereco("complemento")} placeholder="Opcional" /></label><label>Bairro<input required value={endereco.bairro} onChange={alterarEndereco("bairro")} /></label><label>Cidade<input required value={endereco.cidade} onChange={alterarEndereco("cidade")} /></label><label>Estado<input required value={endereco.estado} onChange={alterarEndereco("estado")} maxLength="2" placeholder="SP" /></label><button type="submit" className={styles.addressSave}>Salvar endereço</button>
            </form> : endereco.logradouro ? <div className={styles.savedAddress}><span className={styles.addressIcon}>⌂</span><div><strong>{endereco.logradouro}, {endereco.numero || "s/n"}</strong>{endereco.complemento && <small>{endereco.complemento}</small>}<p>{endereco.bairro} · {endereco.cidade}/{endereco.estado}</p><small>CEP {endereco.cep}</small></div></div> : <div className={styles.emptyAddress}><span>⌂</span><div><strong>Nenhum endereço salvo</strong><p>Adicione um endereço para agilizar sua próxima compra.</p></div></div>}
        </section>
        <section className={styles.cardSecurity}><h2>Segurança da conta</h2><button type="button" className={styles.securityRow} onClick={() => setSenhaAberta((atual) => !atual)}><span className={styles.securityIcon}>•••</span><span><strong>Alterar senha</strong><small>Confirme sua senha atual antes de cadastrar uma nova.</small></span><span className={styles.arrowRight}>›</span></button>
            {senhaAberta && <form className={styles.passwordForm} onSubmit={alterarSenha}><label>Senha atual<input required type="password" autoComplete="current-password" value={senhas.atual} onChange={(e) => setSenhas((s) => ({ ...s, atual: e.target.value }))} /></label><label>Nova senha<input required minLength="6" type="password" autoComplete="new-password" value={senhas.nova} onChange={(e) => setSenhas((s) => ({ ...s, nova: e.target.value }))} /></label><label>Confirmar nova senha<input required minLength="6" type="password" autoComplete="new-password" value={senhas.confirmar} onChange={(e) => setSenhas((s) => ({ ...s, confirmar: e.target.value }))} /></label><button type="submit" disabled={salvando}>{salvando ? "Alterando..." : "Alterar senha"}</button></form>}
        </section>
    </main></div></div>;
}
