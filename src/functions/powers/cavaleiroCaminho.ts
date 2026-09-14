import CharacterSheet from '../../interfaces/CharacterSheet';
import { CAMINHO_OPTION_KEY } from '../../data/systems/tormenta20/classes/cavaleiro';

/**
 * Caminho do Cavaleiro (5º nível): Bastião ou Montaria.
 *
 * A escolha em si é um `chooseFromOptions` na habilidade — é ela que faz o
 * assistente perguntar e a ficha aleatória sortear. Esta função só ESPELHA o
 * resultado em `sheet.cavaleiroCaminho`, que é o campo que a RD do Bastião lê
 * (em `recalculateSheet`).
 *
 * O espelho existe porque o consumidor é antigo e lê o campo, não o histórico;
 * derivar aqui evita espalhar a leitura de `OptionChosen` pelo cálculo de RD.
 *
 * Chamada dos três fluxos que aplicam habilidades de classe — o laço de
 * habilidades novas do `levelUp`, o do level-up manual e a reconstrução do
 * `recalculateSheet` —, porque cada um aplica a habilidade por conta própria.
 */
export function syncCavaleiroCaminho(sheet: CharacterSheet): void {
  if (sheet.cavaleiroCaminho) return;

  const escolha = (sheet.sheetActionHistory ?? [])
    .flatMap((entry) => entry.changes)
    .find(
      (change) =>
        change.type === 'OptionChosen' &&
        change.optionKey === CAMINHO_OPTION_KEY
    );

  if (escolha && escolha.type === 'OptionChosen') {
    const nome = escolha.chosenName;
    if (nome === 'Bastião' || nome === 'Montaria') {
      // eslint-disable-next-line no-param-reassign
      sheet.cavaleiroCaminho = nome;
    }
  }
}

export default syncCavaleiroCaminho;
