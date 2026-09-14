import CharacterSheet from '../../interfaces/CharacterSheet';
import { getRandomItemFromArray } from '../randomUtils';

/**
 * Caminho do Cavaleiro (5º nível): Bastião ou Montaria.
 *
 * A escolha vive em `sheet.cavaleiroCaminho` e é consumida pela RD do Bastião
 * (em `recalculateSheet`) e pelo texto exibido da habilidade (em
 * `collectSheetPowers`).
 *
 * Existe como função porque os fluxos que aplicam habilidades de classe são
 * mais de um — o laço de habilidades novas do `levelUp`, o do level-up manual
 * e a reconstrução do `recalculateSheet`. Antes havia um bloco solto em
 * `general.ts` que, por estar no laço errado, nunca chegava a rodar: aquele
 * caminho filtra `classe.abilities` por nível e a habilidade de 5º nível já
 * não estava lá na subida para o 5º.
 */
const CAMINHO_DO_CAVALEIRO = 'Caminho do Cavaleiro';

/**
 * Vassalo 5: "você recebe a habilidade Montaria (como Caminho do Cavaleiro)".
 * Não é escolha — o caminho vem determinado pela classe.
 */
const VIGILANTE_DE_ESTRADAS = 'Vigilante de Estradas';

/**
 * Define `cavaleiroCaminho` quando a habilidade aplicada for a que o concede.
 * Não sobrescreve escolha já feita. Muta a ficha recebida, como os demais
 * passos de aplicação de habilidade.
 */
export function resolveCavaleiroCaminho(
  sheet: CharacterSheet,
  abilityName: string
): 'Bastião' | 'Montaria' | undefined {
  if (sheet.cavaleiroCaminho) return undefined;

  if (abilityName === VIGILANTE_DE_ESTRADAS) {
    // eslint-disable-next-line no-param-reassign
    sheet.cavaleiroCaminho = 'Montaria';
    return sheet.cavaleiroCaminho;
  }

  if (abilityName === CAMINHO_DO_CAVALEIRO) {
    // eslint-disable-next-line no-param-reassign
    sheet.cavaleiroCaminho = getRandomItemFromArray([
      'Bastião',
      'Montaria',
    ] as const);
    return sheet.cavaleiroCaminho;
  }

  return undefined;
}

export default resolveCavaleiroCaminho;
