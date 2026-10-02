import { Atributo } from '../../data/systems/tormenta20/atributos';
import CharacterSheet, {
  SheetBonus,
  SheetChangeSource,
} from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';

/**
 * Poderes cujo familiar é um PARCEIRO na ficha: o bônus mecânico vem do
 * parceiro (premium, `data/powerPartners`), e não do poder — vale enquanto o
 * familiar está ativo. Os demais usuários de `selectFamiliar` (Ex-Familiar dos
 * Kobolds, em que o bando É o ex-familiar) continuam recebendo pelo poder.
 *
 * Pelo nome do poder, e não por um campo na ação: fichas salvas guardam uma
 * cópia das `sheetActions` de quando o poder foi escolhido.
 */
export const FAMILIAR_BONUSES_VIA_PARTNER = new Set(['Familiar']);

/**
 * Bônus mecânicos por familiar (Tormenta20, p. 38). Apenas os familiares com
 * efeito modelável retornam bônus; os demais (Borboleta/Cobra/Lagarto +1 CD,
 * Coruja, Corvo, Falcão, Morcego) ficam só descritivos.
 */
export const buildFamiliarSheetBonuses = (
  familiarKey: string,
  sheet: CharacterSheet,
  source: SheetChangeSource
): SheetBonus[] => {
  // GATO: visão no escuro (narrativa) + +2 Furtividade
  if (familiarKey === 'GATO') {
    return [
      {
        source,
        target: { type: 'Skill', name: Skill.FURTIVIDADE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ];
  }
  // SAPO: soma o atributo-chave ao total de PV (cumulativo com CON, não substitui)
  if (familiarKey === 'SAPO') {
    return [
      {
        source,
        target: { type: 'PV' },
        modifier: { type: 'SpecialAttribute', attribute: 'spellKeyAttr' },
      },
    ];
  }
  // RATO: pode usar o atributo-chave em Fortitude no lugar de Constituição.
  // Por ser opcional ("você pode usar"), só troca quando for benéfico.
  if (familiarKey === 'RATO') {
    const keyAttr =
      sheet.classe.spellPath?.keyAttribute ??
      sheet.overrideKeyAttribute ??
      Atributo.CARISMA;
    if (
      (sheet.atributos[keyAttr]?.value ?? 0) >
      (sheet.atributos[Atributo.CONSTITUICAO]?.value ?? 0)
    ) {
      return [
        {
          source,
          target: {
            type: 'ModifySkillAttribute',
            skill: Skill.FORTITUDE,
            attribute: keyAttr,
          },
          modifier: { type: 'Fixed', value: 0 },
        },
      ];
    }
  }
  return [];
};
