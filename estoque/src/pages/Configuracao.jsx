import { useEffect, useState } from 'react';
import styles from '../styles/configuracao.module.css';
import AdminLayout from '../components/AdminLayout';
import RegrasNegocio from './RegrasNegocio';
import Notificacao from './Notificacao';
import { apiRequest } from '../services/api.js';

const permissoes = [
  { id: 1, nome: 'Visão geral', desc: 'Visualizar indicadores e resumo da loja' },
  { id: 2, nome: 'Visualizar estoque', desc: 'Consultar produtos e quantidades' },
  { id: 3, nome: 'Editar produtos e preços', desc: 'Alterar informações e valores' },
  { id: 4, nome: 'Movimentações', desc: 'Registrar entradas, saídas e vendas' },
  { id: 5, nome: 'Cadastrar produtos', desc: 'Adicionar novos itens ao catálogo' },
  { id: 6, nome: 'Gerenciar usuários', desc: 'Criar contas e definir cargos' },
  { id: 7, nome: 'Alterar configurações', desc: 'Modificar permissões, regras e notificações' },
];
const perfis = ['Administrador', 'Gerente', 'Vendedor', 'Estoquista'];
const icones = { Administrador: '/imagens/adm.png', Gerente: '/imagens/gerente.png', Vendedor: '/imagens/vendedor.png', Estoquista: '/imagens/estoquista.png' };
const cores = ['#0071e3', '#7c3aed', '#e85d35', '#12866f', '#b5488c', '#52751c'];
const cargoVisivel = (tipo) => tipo === 'admin' ? 'Administrador' : tipo.charAt(0).toUpperCase() + tipo.slice(1);
const iniciais = (nome = '') => nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
const corDoNome = (nome = '') => cores[[...nome].reduce((s, l) => s + l.charCodeAt(0), 0) % cores.length];
const resumo = (ids = []) => {
  if (!ids.length) return 'Nenhuma área liberada';
  if (ids.length === permissoes.length) return 'Acesso completo a todas as áreas';
  const nomes = permissoes.filter((p) => ids.includes(p.id)).map((p) => p.nome.toLowerCase());
  return nomes.length === 1 ? `Acesso somente a ${nomes[0]}` : `Acesso a ${nomes.slice(0, -1).join(', ')} e ${nomes.at(-1)}`;
};

export default function Configuracao() {
  const [aba, setAba] = useState('equipe');
  const [membros, setMembros] = useState([]);
  const [perfil, setPerfil] = useState('Vendedor');
  const [acessos, setAcessos] = useState({ Administrador: [1, 2, 3, 4, 5, 6, 7], Gerente: [], Vendedor: [], Estoquista: [] });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cargo: 'Vendedor' });
  const [mensagem, setMensagem] = useState('');
  const [erroModal, setErroModal] = useState('');
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    Promise.all([apiRequest('/usuarios'), apiRequest('/permissoes')]).then(([usuarios, dados]) => {
      setMembros((Array.isArray(usuarios) ? usuarios : []).filter((u) => u.tipo !== 'usuario').map((u) => ({ ...u, cargo: cargoVisivel(u.tipo) })));
      setAcessos({ Administrador: [1, 2, 3, 4, 5, 6, 7], Gerente: dados.gerente || [], Vendedor: dados.vendedor || [], Estoquista: dados.estoquista || [] });
    }).catch((e) => setMensagem(e.message));
  }, []);

  function alternar(id) { if (perfil === 'Administrador') return; setAcessos((a) => ({ ...a, [perfil]: a[perfil].includes(id) ? a[perfil].filter((x) => x !== id) : [...a[perfil], id] })); }
  async function salvar() { if (perfil === 'Administrador') return setMensagem('O administrador sempre possui acesso total.'); try { await apiRequest(`/permissoes/${perfil.toLowerCase()}`, { method: 'PUT', body: JSON.stringify({ permissoes: acessos[perfil] }) }); setMensagem('Permissões salvas com sucesso.'); } catch (e) { setMensagem(e.message); } }
  async function criar(e) { e.preventDefault(); setErroModal(''); if (!form.nome.trim() || !form.email.trim()) return setErroModal('Preencha nome e e-mail.'); if (form.senha.length < 6) return setErroModal('A senha inicial precisa ter pelo menos 6 caracteres.'); setCriando(true); try { const tipo = form.cargo === 'Administrador' ? 'admin' : form.cargo.toLowerCase(); const criado = await apiRequest('/usuarios', { method: 'POST', body: JSON.stringify({ nome: form.nome.trim(), email: form.email.trim(), senha: form.senha, tipo }) }); setMembros((a) => [...a, { ...criado, cargo: form.cargo }]); setForm({ nome: '', email: '', senha: '', cargo: 'Vendedor' }); setModal(false); setMensagem('Usuário criado com sucesso.'); } catch (e) { setErroModal(e.message || 'Não foi possível criar o usuário.'); } finally { setCriando(false); } }
  async function remover(m) { if (m.tipo === 'admin') return setMensagem('A conta administradora não pode ser removida.'); try { await apiRequest(`/usuarios/${m.id}`, { method: 'DELETE' }); setMembros((a) => a.filter((x) => x.id !== m.id)); } catch (e) { setMensagem(e.message); } }

  return <AdminLayout><div className={styles.container}>
    <div className={styles.mainHeader}><h1>Configurações</h1><p>Gerencie equipe, acessos e regras do sistema</p></div>
    <div className={styles.segmentedControl}>{[['equipe', 'Equipe e permissões'], ['regras', 'Regras de negócio'], ['notificacoes', 'Notificações']].map(([id, n]) => <button type="button" key={id} className={`${styles.segmentBtn} ${aba === id ? styles.segmentActive : ''}`} onClick={() => setAba(id)}>{n}</button>)}</div>
    {mensagem && <p className={styles.feedback} role="status">{mensagem}</p>}
    {aba === 'equipe' && <div className={styles.fadeContainer}>
      <div className={styles.card}><div className={styles.cardHeader}><div className={styles.cardTitleGroup}><img src="/imagens/equipe.png" alt="" /><h3>Membros da equipe</h3></div><button type="button" className={styles.btnInvite} onClick={() => { setErroModal(''); setModal(true); }}>+ Criar usuário</button></div>
        <div className={styles.memberList}>{membros.map((m) => <div key={m.id} className={styles.memberItem}><div className={styles.memberInfo}><div className={styles.avatar} style={{ backgroundColor: corDoNome(m.nome) }}>{iniciais(m.nome)}</div><div><p className={styles.memberName}>{m.nome}</p><p className={styles.memberEmail}>{m.email}</p></div></div><div className={styles.memberActions}><span className={styles.cargoTag}>{m.cargo}</span>{m.tipo !== 'admin' && <button type="button" className={styles.btnDelete} onClick={() => remover(m)} title="Remover usuário">×</button>}</div></div>)}</div>
      </div>
      <h2 className={styles.sectionTitle}>Usuários e permissões</h2><p className={styles.sectionSubtitle}>Escolha um cargo e determine exatamente quais áreas ele pode acessar.</p>
      <div className={styles.cardNoPadding}><div className={styles.perfilList}>{perfis.map((nome) => <div key={nome} className={`${styles.perfilItem} ${perfil === nome ? styles.perfilSelected : ''}`} onClick={() => setPerfil(nome)}><div><p className={styles.perfilName}><img className={styles.perfilIcon} src={icones[nome]} alt="" />{nome}</p><p className={styles.perfilDesc}>{resumo(acessos[nome])}</p></div><span className={`${styles.statusTag} ${perfil === nome ? styles.tagBlue : styles.tagGray}`}>{acessos[nome].length === 7 ? 'Acesso total' : `${acessos[nome].length} acessos`}</span></div>)}</div></div>
      <p className={styles.smallSectionTitle}>PERMISSÕES PARA: <strong>{perfil.toUpperCase()}</strong></p>
      <div className={styles.cardNoPadding}><div className={styles.permissaoList}>{permissoes.map((p) => <div key={p.id} className={styles.permissaoItem}><div><p className={styles.permName}>{p.nome}</p><p className={styles.permDesc}>{p.desc}</p></div><label className={styles.switch}><input type="checkbox" disabled={perfil === 'Administrador'} checked={acessos[perfil].includes(p.id)} onChange={() => alternar(p.id)} /><span className={styles.slider} /></label></div>)}</div></div>
      <div className={styles.saveContainer}><button type="button" className={styles.btnSave} onClick={salvar}>Salvar alterações</button></div>
    </div>}
    {aba === 'regras' && <RegrasNegocio />}{aba === 'notificacoes' && <Notificacao />}
    {modal && <div className={styles.modalOverlay}><div className={styles.modalCard}><h3>Criar usuário da equipe</h3><p className={styles.modalSub}>A conta será criada com o cargo e as permissões escolhidas.</p><form onSubmit={criar}>{[['nome', 'Nome completo', 'text'], ['email', 'E-mail', 'email'], ['senha', 'Senha inicial', 'password']].map(([c, l, t]) => <div className={styles.formGroup} key={c}><label>{l}</label><input required minLength={c === 'senha' ? 6 : undefined} type={t} value={form[c]} onChange={(e) => setForm((f) => ({ ...f, [c]: e.target.value }))} /></div>)}<div className={styles.formGroup}><label>Cargo</label><select value={form.cargo} onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}>{perfis.map((n) => <option key={n}>{n}</option>)}</select></div>{erroModal && <p className={styles.modalError} role="alert">{erroModal}</p>}<div className={styles.modalActions}><button type="button" disabled={criando} className={styles.btnCancel} onClick={() => setModal(false)}>Cancelar</button><button type="submit" disabled={criando} className={styles.btnConfirm}>{criando ? 'Criando conta...' : 'Criar conta'}</button></div></form></div></div>}
  </div></AdminLayout>;
}
