import React from 'react';
import ReactDOM from 'react-dom';
import { PortraitPage } from '../premium/components/Portrait/PortraitPage';

/**
 * Ponto de montagem do overlay de stream (`/portrait/:token`).
 *
 * Import por CAMINHO DIRETO, e não pelo barrel `src/premium/index.ts`: o barrel
 * re-exporta o módulo premium inteiro, e passar por ele arrastaria tudo para o
 * mesmo grafo — inviabilizando o code-splitting desta rota no dia em que der
 * para validar um build. O `premiumStubPlugin` resolve caminhos diretos sob
 * `src/premium` do mesmo jeito, então o build público continua funcionando.
 *
 * Sem `React.StrictMode`: o duplo mount abriria duas conexões SSE em dev e
 * queimaria o limite de 3 por token. O `usePortraitStream` já se protege com um
 * ref, mas não há razão para pagar por isso numa página de um componente só.
 */
export default function mountPortrait(): void {
  ReactDOM.render(<PortraitPage />, document.getElementById('root'));
}
