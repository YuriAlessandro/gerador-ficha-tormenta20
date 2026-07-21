import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';

/**
 * Rola a página para o topo a cada navegação para uma nova rota.
 *
 * Navegações do tipo POP (botão voltar/avançar do navegador) são ignoradas para
 * preservar a posição de scroll anterior. Também ignora mudanças que só alteram
 * query string ou hash — só o pathname conta como "nova página".
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  const history = useHistory();

  React.useEffect(() => {
    if (history.action === 'POP') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, history]);

  return null;
};

export default ScrollToTop;
