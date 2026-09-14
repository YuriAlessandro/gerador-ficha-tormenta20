import CharacterSheet from '../../interfaces/CharacterSheet';
import { CAMINHO_OPTION_KEY } from '../../data/systems/tormenta20/classes/cavaleiro';

/**
 * O Caminho do Cavaleiro escolhido (5º nível). A escolha vive no histórico,
 * como qualquer `chooseFromOptions`; `sheet.cavaleiroCaminho` é o campo legado,
 * mantido como fallback para ficha antiga e edição manual.
 *
 * Quem lê: a RD do Bastião, em `recalculateSheet` e `general`.
 */
export function getCavaleiroCaminho(
  sheet: CharacterSheet
): 'Bastião' | 'Montaria' | undefined {
  const escolha = (sheet.sheetActionHistory ?? [])
    .flatMap((entry) => entry.changes)
    .find(
      (change) =>
        change.type === 'OptionChosen' &&
        change.optionKey === CAMINHO_OPTION_KEY
    );

  if (escolha?.type === 'OptionChosen') {
    const { chosenName } = escolha;
    if (chosenName === 'Bastião' || chosenName === 'Montaria') {
      return chosenName;
    }
  }

  return sheet.cavaleiroCaminho;
}

export default getCavaleiroCaminho;
