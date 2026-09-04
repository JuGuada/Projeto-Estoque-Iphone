import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/cadastroUsuario.module.css';
import { API_URL } from '../services/api.js';

export default function CadastroUsuario(){
  const navigate=useNavigate();
  const [form,setForm]=useState({nome:'',email:'',senha:''});
  const [mensagem,setMensagem]=useState('');
  const [salvando,setSalvando]=useState(false);
  async function cadastrar(event){event.preventDefault();setMensagem('');setSalvando(true);try{const response=await fetch(`${API_URL}/usuarios`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const data=await response.json();if(!response.ok)throw new Error(data.erro||'Não foi possível criar a conta.');navigate('/login',{replace:true,state:{mensagem:'Conta criada com sucesso. Faça login para continuar.'}});}catch(error){setMensagem(error.message);}finally{setSalvando(false);}}
  return <main className={styles.page}><section className={styles.shell}>
    <div className={styles.register}><form className={styles.form} onSubmit={cadastrar}>
      <div className={styles.formTitle}><span>NOVA CONTA</span><h1>Comece agora.</h1><p>Cadastre seus dados para acessar uma experiência feita para conectar pessoas, produtos e ideias.</p></div>
      <label>Nome completo<input name="nome" type="text" autoComplete="name" value={form.nome} onChange={(e)=>setForm({...form,nome:e.target.value})} required placeholder="Como podemos chamar você?" /></label>
      <label>E-mail<input name="email" type="email" autoComplete="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required placeholder="voce@exemplo.com" /></label>
      <label>Senha<input name="senha" type="password" autoComplete="new-password" minLength="6" value={form.senha} onChange={(e)=>setForm({...form,senha:e.target.value})} required placeholder="Mínimo de 6 caracteres" /></label>
      {mensagem&&<p className={styles.message} role="alert">{mensagem}</p>}
      <button type="submit" disabled={salvando}>{salvando?'Criando conta...':'Criar conta'}</button>
      <p className={styles.loginLink}>Já possui uma conta? <Link to="/login">Entrar</Link></p>
    </form></div>
    <div className={styles.visual}><img src="/imagens/login2.jpg" alt="Tecnologia e pessoas conectadas" /><div className={styles.gradient}/><div className={styles.visualCopy}><span>UMA EXPERIÊNCIA PARA TODOS</span><h2>Ideias que aproximam.<br />Tecnologia que transforma.</h2><p>Tenha tudo organizado em um só lugar e mantenha o foco no que realmente importa.</p></div></div>
  </section></main>;
}
