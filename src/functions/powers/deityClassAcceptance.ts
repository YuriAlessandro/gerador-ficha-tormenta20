import CharacterSheet from '../../interfaces/CharacterSheet';
import {
  allDivindadeNames,
  divindadeDisplayNames,
  DivindadeNames,
} from '../../interfaces/Divindade';
import { normalizeDeityName } from '../deityName';
import { findClassDescription } from '../multiclass';
import { getSheetDeityNames } from './deityNames';

/** Nome exibido de deus do panteão -> chave do enum. */
const PANTHEON_KEY_BY_NORMALIZED_NAME = new Map<string, DivindadeNames>(
  allDivindadeNames.map((key) => [
    normalizeDeityName(divindadeDisplayNames[key]),
    key,
  ])
);

/** `undefined` para deuses de suplemento/homebrew (fora do panteão). */
export function pantheonKeyForDeity(name: string): DivindadeNames | undefined {
  return PANTHEON_KEY_BY_NORMALIZED_NAME.get(normalizeDeityName(name));
}

/**
 * A devoção ATUAL da ficha é aceita pela classe `className`?
 *
 * Espelha o filtro de divindade do formulário de criação:
 * - Devoções Abertas: qualquer deus aceita (Heróis de Arton, p. 281);
 * - deus de suplemento/homebrew: aceito (o formulário deixa o Paladino
 *   escolhê-lo);
 * - deus do panteão: `faithProbability[chave] !== 0`.
 *
 * Devoção Dupla satisfaz com QUALQUER um dos deuses.
 */
export function deityAcceptsClass(
  sheet: CharacterSheet,
  className: string
): boolean {
  const deityNames = getSheetDeityNames(sheet);
  if (deityNames.length === 0) return false; // precisa SER devoto
  if (sheet.optionalRules?.openDeities) return true;

  const faithProbability = findClassDescription(
    className,
    undefined,
    sheet.supplements
  )?.faithProbability;
  // Classe sem dado de devoção não restringe (mesmo fallback do formulário).
  if (!faithProbability) return true;

  return deityNames.some((name) => {
    const key = pantheonKeyForDeity(name);
    if (!key) return true; // suplemento/homebrew
    return faithProbability[key] !== 0;
  });
}
