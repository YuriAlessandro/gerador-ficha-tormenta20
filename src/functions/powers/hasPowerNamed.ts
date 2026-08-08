/**
 * Ponto único para "esta ficha possui o poder/habilidade chamado X?".
 *
 * Existia uma cópia deste check em cada arquivo do registry de efeitos ativos
 * (`src/premium/data/activePowers/`) e mais uma em `bonusConditions.ts`, todas
 * com coberturas diferentes de arrays. A consequência prática: poder concedido
 * de divindade vive em `devoto.poderes` e nenhuma cópia olhava lá, então os
 * efeitos ativos dos poderes concedidos nunca ficavam disponíveis para devotos.
 *
 * `classe.abilities` fica FORA de propósito: aquele array contém habilidades de
 * todos os níveis da classe e precisa do gate `nivel <= nívelDaClasse`, que é
 * específico de cada classe (e sensível a multiclasse). Quem precisa disso
 * compõe: `sheetHasPowerNamed(...) || abilities.some(a => ... && a.nivel <= n)`.
 */
import CharacterSheet from '../../interfaces/CharacterSheet';

/** Fontes de poder da ficha, exceto `classe.abilities` (ver comentário acima). */
function collectPowerNames(sheet: CharacterSheet): string[] {
  return [
    ...(sheet.generalPowers ?? []),
    ...(sheet.classPowers ?? []),
    ...(sheet.devoto?.poderes ?? []),
    ...(sheet.origin?.powers ?? []),
    ...(sheet.raca?.abilities ?? []),
    ...(sheet.customPowers ?? []),
    ...(sheet.customGrantedPowers ?? []),
  ].map((entry) => entry.name);
}

/**
 * Casa pelo `name` (identidade), nunca por `customName` — este último é só
 * um rótulo de exibição que o jogador pode trocar.
 */
export function sheetHasPowerNamed(
  sheet: CharacterSheet,
  name: string
): boolean {
  return collectPowerNames(sheet).includes(name);
}

export default sheetHasPowerNamed;
