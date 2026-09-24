import type { Theme } from '@mui/material';
import type { PowerNodeKind } from '../../functions/powerTree';

/**
 * Marcas usadas pelo clique-fora do painel de detalhe. Ele não é modal no
 * desktop (senão o backdrop cobriria a árvore), então precisa distinguir na
 * mão o que é "dentro do painel", o que é "outro nó" e o que é fora de tudo.
 */
export const PANEL_CLASS = 'power-detail-panel';
/** O atributo em si é escrito literalmente no JSX do cartão. */
export const NODE_SELECTOR = '[data-power-node]';

export interface PowerNodeKindMeta {
  color: string;
  label: string;
  description: string;
}

/**
 * Cor e rótulo de cada tipo de nó. Poder de classe é a cor de destaque do
 * tema (o usuário escolhe o acento, então nada de vermelho fixo); os demais
 * tipos existem só para explicar de onde vem um pré-requisito que não é um
 * poder da própria classe.
 */
export function getNodeKindMeta(
  kind: PowerNodeKind,
  theme: Theme
): PowerNodeKindMeta {
  switch (kind) {
    case 'ability':
      return {
        color: theme.palette.warning.main,
        label: 'Habilidade de classe',
        description: 'Ganha automaticamente ao subir de nível.',
      };
    case 'abilityOption':
      return {
        color: theme.palette.warning.main,
        label: 'Escolha de habilidade',
        description:
          'Uma das opções oferecidas por uma habilidade de classe ao subir de nível.',
      };
    case 'general':
      return {
        color: theme.palette.info.main,
        label: 'Poder geral',
        description: 'Não é poder de classe — vem da lista de poderes gerais.',
      };
    case 'external':
      return {
        color: theme.palette.text.disabled,
        label: 'Pré-requisito externo',
        description:
          'Exigido por um poder desta classe, mas não consta entre os poderes e habilidades dela.',
      };
    default:
      return {
        color: theme.palette.primary.main,
        label: 'Poder de classe',
        description: 'Escolhido ao ganhar um poder de classe.',
      };
  }
}
