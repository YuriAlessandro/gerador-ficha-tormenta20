import type CharacterSheet from '../../interfaces/CharacterSheet';

/**
 * Opções limitadas às já escolhidas sob `optionKey` (Mestre em Escola só nas
 * escolas do Especialista em Escola). Sem escolha gravada (ficha antiga), não
 * restringe.
 */
export function filterOptionsChosenIn<T extends { name: string }>(
  sheet: Pick<CharacterSheet, 'optionChoices'>,
  optionKey: string,
  options: T[]
): T[] {
  const chosen = sheet.optionChoices?.[optionKey] ?? [];
  if (chosen.length === 0) return options;
  return options.filter((option) => chosen.includes(option.name));
}
