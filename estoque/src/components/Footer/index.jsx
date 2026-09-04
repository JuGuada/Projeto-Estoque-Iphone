import { FaApple, FaEnvelope, FaFacebookF, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaShieldAlt, FaTiktok, FaTruck, FaWhatsapp } from 'react-icons/fa';
import { SiAmericanexpress, SiPix } from 'react-icons/si';
import styles from './styles.module.css';

const discoveryLinks = ['Blog iPlace', 'Novidades Apple', 'LanÃ§amentos', 'Guia de Produtos', 'Compare Produtos'];
const supportLinks = ['Central de Ajuda', 'PolÃ­ticas da Loja', 'Trocas e DevoluÃ§Ãµes', 'Formas de Pagamento', 'Prazos e Entregas', 'Garantia dos Produtos', 'Fale Conosco'];

export default function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <div className={styles.footerTop}>
        <section className={styles.brandColumn}>
          <div className={styles.brand}><FaApple aria-hidden="true" /><strong>Apple Estoque</strong></div>
          <p className={styles.brandDescription}>Sua experiÃªncia Apple comeÃ§a aqui.<br />Qualidade, confianÃ§a e suporte especializado.</p>
          <ul className={styles.benefits}>
            <li><FaShieldAlt /><span><strong>Revenda oficial Apple</strong><small>Produtos 100% originais.</small></span></li>
            <li><b>â–­</b><span><strong>Parcele em atÃ© 12x</strong><small>Consulte condiÃ§Ãµes no checkout.</small></span></li>
            <li><FaTruck /><span><strong>Entrega para todo o Brasil</strong><small>Com seguranÃ§a e rastreamento.</small></span></li>
            <li><b>â†»</b><span><strong>Troca fÃ¡cil</strong><small>AtÃ© 7 dias apÃ³s o recebimento.</small></span></li>
          </ul>
        </section>
        <nav className={styles.linkColumn} aria-label="Descubra mais"><h2>Descubra mais</h2>{discoveryLinks.map((link) => <a href="#footer" key={link}>{link}</a>)}</nav>
        <nav className={styles.linkColumn} aria-label="Ajuda e suporte"><h2>Ajuda e suporte</h2>{supportLinks.map((link) => <a href="#footer" key={link}>{link}</a>)}</nav>
        <section className={styles.contactColumn}><h2>Fale conosco</h2>
          <a className={styles.contactItem} href="https://wa.me/551112345678"><FaWhatsapp /><span><strong>(11) 1234-5678</strong><small>Seg. a Sex. das 9h Ã s 18h</small></span></a>
          <a className={styles.contactItem} href="mailto:atendimento@appleestoque.com.br"><FaEnvelope /><span><strong>atendimento@appleestoque.com.br</strong></span></a>
          <a className={styles.contactItem} href="tel:+551108001234567"><FaPhoneAlt /><span><strong>0800 123 4567</strong><small>Seg. a Sex. das 9h Ã s 18h</small></span></a>
          <a className={styles.contactItem} href="#lojas"><FaMapMarkerAlt /><span><strong>Encontre uma loja</strong><small>Ver unidades</small></span></a>
        </section>
      </div>
      <div className={styles.footerBottom}>
        <section><h2>Formas de pagamento</h2><div className={styles.paymentIcons}><b>VISA</b><b>MC</b><b>elo</b><SiAmericanexpress /><b>ï£¿Pay</b><SiPix /></div><small className={styles.security}><FaShieldAlt /> Ambiente 100% seguro.<br />Seus dados protegidos com tecnologia SSL.</small></section>
        <section className={styles.socialSection}><h2>Redes sociais</h2><div className={styles.socialIcons}><a href="#instagram" aria-label="Instagram"><FaInstagram /></a><a href="#facebook" aria-label="Facebook"><FaFacebookF /></a><a href="#tiktok" aria-label="TikTok"><FaTiktok /></a></div><small>Acompanhe novidades, lanÃ§amentos e promoÃ§Ãµes exclusivas.</small></section>
        <section className={styles.newsletterSection}><h2>Receba novidades</h2><p>Cadastre-se e receba ofertas e conteÃºdos exclusivos da Apple Estoque.</p><form className={styles.newsletterForm} onSubmit={(event) => event.preventDefault()}><input type="email" placeholder="Seu e-mail" aria-label="Seu e-mail" required /><button type="submit">Cadastrar</button></form></section>
      </div>
      <div className={styles.copyright}>Â© 2026 Todos os direitos reservados.</div>
    </footer>
  );
}

