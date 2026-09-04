import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext.jsx';
import styles from '../styles/login.module.css';

export default function Login(){
 const navigate=useNavigate(),location=useLocation();const{login,carregando}=useAuth();
 const[dados,setDados]=useState({email:'',senha:''});const[mensagem,setMensagem]=useState(location.state?.mensagem||'');
 async function entrar(e){e.preventDefault();setMensagem('');const r=await login(dados.email,dados.senha);if(r?.sucesso)return navigate(r.usuario?.tipo==='usuario'?'/':'/dashboard');setMensagem(r?.mensagem||'Erro ao efetuar login.');}
 return <div className={styles.container}>
  <div className={styles.left}><img className={styles.image} src="/imagens/login.jpg" alt="Tecnologia e pessoas conectadas"/><div className={styles.imageShade}/><div className={styles.overlay}><h1>Tecnologia<br/>que conecta pessoas.</h1><p>Gerencie produtos, vendas e estoque<br/>com precisão, segurança e<br/>experiência premium.</p></div></div>
  <div className={styles.right}><form className={styles.form} onSubmit={entrar}><h2>BEM-VINDO</h2><span>Acesse sua conta para continuar</span>
   <div className={styles.field}><label>Email</label><input type="email" value={dados.email} onChange={(e)=>setDados({...dados,email:e.target.value})} required/></div>
   <div className={styles.field}><label>Password</label><input type="password" value={dados.senha} onChange={(e)=>setDados({...dados,senha:e.target.value})} required/></div>
   {mensagem&&<p className={styles.message} role="alert">{mensagem}</p>}
   <button type="submit" className={styles.loginButton} disabled={carregando}>{carregando?'Carregando...':'Log in'}</button>
   <p className={styles.signupPrompt}>Não tem uma conta? <Link to="/cadastrar">Cadastre-se</Link></p>
   <small>Protegido com segurança empresarial.</small>
  </form></div>
 </div>;
}
