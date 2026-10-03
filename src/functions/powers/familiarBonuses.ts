import { Atributo } from '../../data/systems/tormenta20/atributos';
import CharacterSheet, {
  SheetBonus,
  SheetChangeSource,
} from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';

/**
 * Bônus mecânicos por familiar (Tormenta20, p. 38). Compartilhado pelo poder
 * (`selectFamiliar`) e pelo parceiro Familiar (premium, `data/powerPartners`).
 * Apenas os familiares com efeito modelável retornam bônus; os demais
 * (Borboleta/Cobra/Lagarto +1 CD, Coruja, Corvo, Falcão, Morcego) ficam só
 * descritivos.
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
