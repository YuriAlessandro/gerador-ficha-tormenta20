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

/**
 * O mínimo que os checadores consomem: o nome e a cláusula "conta como o poder
 * X para efeitos de pré-requisitos".
 */
export interface PowerLike {
  name: string;
  grantsPowerRequirements?: string[];
}

/** Fontes de poder da ficha, exceto `classe.abilities` (ver comentário acima). */
export function collectSheetPowers(sheet: CharacterSheet): PowerLike[] {
  return [
    ...(sheet.generalPowers ?? []),
    ...(sheet.classPowers ?? []),
    ...(sheet.devoto?.poderes ?? []),
    ...(sheet.origin?.powers ?? []),
    ...(sheet.raca?.abilities ?? []),
    ...(sheet.customPowers ?? []),
    ...(sheet.customGrantedPowers ?? []),
  ] as PowerLike[];
}

function collectPowerNames(sheet: CharacterSheet): string[] {
  return collectSheetPowers(sheet).map((entry) => entry.name);
}

/**
 * O personagem satisfaz um pré-requisito `PODER: name`? Casa pelo nome ou pela
 * cláusula `grantsPowerRequirements` de qualquer poder/habilidade que ele tenha
 * — é por aqui que "Ginete Altivo" (concedido de Hippion) vale como "Ginete".
 */
export function sheetSatisfiesPowerRequirement(
  sheet: CharacterSheet,
  name: string | undefined
): boolean {
  if (!name) return false;
  return collectSheetPowers(sheet).some(
    (power) =>
      power.name === name || !!power.grantsPowerRequirements?.includes(name)
  );
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
