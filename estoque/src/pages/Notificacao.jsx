import React, { useEffect, useState } from 'react';
import styles from '../styles/notificacao.module.css';
import { apiRequest } from '../services/api.js';

export default function Notificacao() {
  const [notificacoes, setNotificacoes] = useState({
    estoqueBaixo: true,
    novasEntradas: true,
    alertasCriticos: true,
    resumoDiario: false,
  });

  const [emailNotificacao, setEmailNotificacao] = useState('admin@estoque.com');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    apiRequest('/notificacoes').then((data) => {
      setNotificacoes({ estoqueBaixo: Boolean(data.estoque_baixo), novasEntradas: Boolean(data.novas_entradas),
        alertasCriticos: Boolean(data.alertas_criticos), resumoDiario: Boolean(data.resumo_diario) });
      setEmailNotificacao(data.email_notificacao || '');
    }).catch((error) => setMensagem(error.message));
  }, []);

  async function salvar() {
    try {
      await apiRequest('/notificacoes', { method: 'PUT', body: JSON.stringify({
        estoque_baixo: notificacoes.estoqueBaixo, novas_entradas: notificacoes.novasEntradas,
        alertas_criticos: notificacoes.alertasCriticos, resumo_diario: notificacoes.resumoDiario,
        email_notificacao: emailNotificacao }) });
      setMensagem('ConfiguraÃ§Ãµes salvas com sucesso.');
    } catch (error) { setMensagem(error.message); }
  }

  const handleToggle = (key) => {
    setNotificacoes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className={styles.fadeContainer}>
      {/* SeÃ§Ã£o 1: Alertas do Sistema */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={`${styles.iconBadge} ${styles.blueBadge}`}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0071e3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3>Alertas do Sistema</h3>
        </div>

        <div className={styles.itemList}>
          <div className={styles.item}>
            <div className={styles.itemText}>
              <p className={styles.title}>Alerta de estoque baixo</p>
              <p className={styles.description}>
                Notificar quando produtos atingirem estoque mÃ­nimo.
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificacoes.estoqueBaixo}
                onChange={() => handleToggle('estoqueBaixo')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.item}>
            <div className={styles.itemText}>
              <p className={styles.title}>Novas entradas de estoque</p>
              <p className={styles.description}>
                Notificar quando produtos forem recebidos
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificacoes.novasEntradas}
                onChange={() => handleToggle('novasEntradas')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.item}>
            <div className={styles.itemText}>
              <p className={styles.title}>Alertas crÃ­ticos</p>
              <p className={styles.description}>
                NotificaÃ§Ãµes urgentes de sem estoque
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificacoes.alertasCriticos}
                onChange={() => handleToggle('alertasCriticos')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
      </div>

      {/* SeÃ§Ã£o 2: NotificaÃ§Ãµes por Email */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={`${styles.iconBadge} ${styles.greenBadge}`}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34c759"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <h3>NotificaÃ§Ãµes por Email</h3>
        </div>

        <div className={styles.itemList}>
          <div className={styles.item}>
            <div className={styles.itemText}>
              <p className={styles.title}>Resumo diÃ¡rio por email</p>
              <p className={styles.description}>
                Receber relatÃ³rio diÃ¡rio de movimentaÃ§Ãµes
              </p>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificacoes.resumoDiario}
                onChange={() => handleToggle('resumoDiario')}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.inputSection}>
            <p className={styles.title}>Email para notificaÃ§Ãµes</p>
            <input
              type="email"
              className={styles.emailInput}
              value={emailNotificacao}
              onChange={(e) => setEmailNotificacao(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className={styles.saveArea}>
        <button type="button" className={styles.saveButton} onClick={salvar}>
          Salvar alteraÃ§Ãµes
        </button>
        <p className={styles.saveHint}>
          Suas preferÃªncias serÃ£o aplicadas aos prÃ³ximos alertas enviados pelo sistema.
        </p>
        {mensagem && <p className={styles.saveFeedback} role="status">{mensagem}</p>}
      </div>
    </div>
  );
}

