import CharacterSheet from '@/interfaces/CharacterSheet';
import { SheetPower } from './powerOrigins';

/**
 * Campos por-instância que o usuário edita num poder já na ficha.
 * `name`/`description`/`text` NÃO entram aqui: identidade é imutável.
 */
export type PowerUserPatch = Partial<
  Pick<
    SheetPower,
    'rolls' | 'customEffects' | 'customName' | 'customDescription'
  >
>;

/**
 * Poder personalizado tem `id` (uuid); o resto só tem nome. Quando os dois
 * lados têm `id`, ele manda — assim dois poderes personalizados de mesmo nome
 * não se sobrescrevem. Fora isso, o nome é a identidade.
 */
function matches(target: SheetPower, candidate: SheetPower): boolean {
  const targetId = 'id' in target ? target.id : undefined;
  const candidateId = 'id' in candidate ? candidate.id : undefined;
  if (targetId && candidateId) return targetId === candidateId;
  return candidate.name === target.name;
}

function patchList<T extends SheetPower>(
  list: T[] | undefined,
  target: SheetPower,
  patch: PowerUserPatch
): T[] | undefined {
  if (!list) return list;
  return list.map((item) =>
    matches(target, item) ? { ...item, ...patch } : item
  );
}

/**
 * Aplica um patch do usuário em TODAS as listas de poderes da ficha que contêm
 * aquele poder.
 *
 * A aba de Poderes deduplica por nome e mostra uma linha só, então um poder que
 * existe em dois arrays (ex: concedido pela divindade e também na lista de
 * poderes gerais) precisa receber a edição nos dois — gravar em apenas um
 * deixaria a ficha inconsistente conforme qual array o recálculo ler depois.
 */
export function updatePowerAcrossSheet(
  sheet: CharacterSheet,
  target: SheetPower,
  patch: PowerUserPatch
): CharacterSheet {
  const generalPowers = patchList(sheet.generalPowers, target, patch);
  const classPowers = patchList(sheet.classPowers, target, patch);
  const customPowers = patchList(sheet.customPowers, target, patch);
  const customGrantedPowers = patchList(
    sheet.customGrantedPowers,
    target,
    patch
  );
  const originPowers = patchList(sheet.origin?.powers, target, patch);
  const raceAbilities = patchList(sheet.raca?.abilities, target, patch);
  const classAbilities = patchList(sheet.classe?.abilities, target, patch);
  const deityPowers = patchList(sheet.devoto?.poderes, target, patch);

  return {
    ...sheet,
    generalPowers: generalPowers ?? sheet.generalPowers,
    classPowers,
    customPowers,
    customGrantedPowers,
    origin:
      sheet.origin && originPowers
        ? { ...sheet.origin, powers: originPowers }
        : sheet.origin,
    raca:
      sheet.raca && raceAbilities
        ? { ...sheet.raca, abilities: raceAbilities }
        : sheet.raca,
    classe:
      sheet.classe && classAbilities
        ? { ...sheet.classe, abilities: classAbilities }
        : sheet.classe,
    devoto:
      sheet.devoto && deityPowers
        ? { ...sheet.devoto, poderes: deityPowers }
        : sheet.devoto,
  };
}

export default updatePowerAcrossSheet;
