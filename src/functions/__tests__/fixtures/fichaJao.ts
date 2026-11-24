/**
 * Ficha "Jão" — caso real de relato de bug (nov/2026), usado como caso de teste
 * das correções de cálculo de Sátiro, Acuidade com Arma e itens.
 *
 * Sátiro (Heróis de Arton), Magimarcialista (Bardo) 5, origem Capanga.
 * For 0 / Des 4 / Con 3 / Int 1 / Sab −2 / Car 4. Poder Acuidade com Arma (o
 * poder de combate do Capanga). Tatuagem da gangue (+1 em Intimidação). Couro
 * batido vestido (penalidade −1). Dois porretes com a melhoria Cruel.
 *
 * Montada pelo motor do ASSISTENTE (`generateEmptySheet`), que é por onde o
 * usuário criou a ficha. Tudo que o assistente sortearia e que muda as contas é
 * fixado em `WizardSelections`: perícias da classe (Atletismo treinada) e os
 * benefícios do Capanga (Intimidação + Acuidade com Arma).
 */
import _ from 'lodash';
import { generateEmptySheet } from '../../general';
import { recalculateSheet } from '../../recalculateSheet';
import SelectOptions from '../../../interfaces/SelectedOptions';
import CharacterSheet from '../../../interfaces/CharacterSheet';
import Equipment, { DefenseEquipment } from '../../../interfaces/Equipment';
import Bag from '../../../interfaces/Bag';
import Skill from '../../../interfaces/Skills';
import { WizardSelections } from '../../../interfaces/WizardSelections';
import { Atributo } from '../../../data/systems/tormenta20/atributos';
import { Armaduras } from '../../../data/systems/tormenta20/equipamentos';
import { AMEACAS_ARTON_WEAPONS } from '../../../data/systems/tormenta20/ameacas-de-arton/equipment/weapons';
import { SupplementId } from '../../../types/supplement.types';

export const JAO_OPTIONS: SelectOptions = {
  nivel: 1,
  raca: 'Sátiro',
  classe: 'Magimarcialista',
  origin: 'Capanga',
  devocao: { label: '--', value: '--' },
  supplements: [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
    SupplementId.TORMENTA20_AMEACAS_ARTON,
  ],
};

/**
 * Atributos ANTES da raça. Sátiro: Car +2, Des +1, Sab −1 (Heróis de Arton
 * p. 15) → For 0 / Des 4 / Con 3 / Int 1 / Sab −2 / Car 4.
 */
const BASE_ATTRIBUTES: Record<Atributo, number> = {
  [Atributo.FORCA]: 0,
  [Atributo.DESTREZA]: 3,
  [Atributo.CONSTITUICAO]: 3,
  [Atributo.INTELIGENCIA]: 1,
  [Atributo.SABEDORIA]: -1,
  [Atributo.CARISMA]: 2,
};

export const JAO_WIZARD: WizardSelections = {
  characterName: 'Jão',
  baseAttributes: BASE_ATTRIBUTES,
  classSkills: [
    Skill.ATLETISMO,
    Skill.ACROBACIA,
    Skill.ENGANACAO,
    Skill.INICIATIVA,
    Skill.REFLEXOS,
    Skill.DIPLOMACIA,
  ],
  originBenefits: [
    { type: 'skill', name: Skill.INTIMIDACAO },
    { type: 'power', name: 'Acuidade com Arma' },
  ],
};

export const porreteCruel = (): Equipment => ({
  ..._.cloneDeep(AMEACAS_ARTON_WEAPONS.PORRETE),
  modifications: [{ mod: 'Cruel' }],
});

/**
 * Ficha do Jão no 5º nível. `mochila` permite trocar o conteúdo de armas e
 * armadura (o resto da mochila — itens da origem — é o do assistente).
 */
export function buildJao(
  mochila: { armas?: Equipment[]; armaduras?: DefenseEquipment[] } = {}
): CharacterSheet {
  const level1 = generateEmptySheet(JAO_OPTIONS, JAO_WIZARD);
  const armas = mochila.armas ?? [porreteCruel(), porreteCruel()];
  const armaduras = mochila.armaduras ?? [_.cloneDeep(Armaduras.COUROBATIDO)];

  const sheet: CharacterSheet = {
    ...level1,
    nivel: 5,
    bag: new Bag(
      {
        ...level1.bag.equipments,
        // Mantém as armas que vieram da ficha (Marrada, quando houver) e troca
        // as compradas pelos porretes.
        Arma: [
          ...level1.bag.equipments.Arma.filter((arma) =>
            arma.weaponTags?.includes('natural')
          ),
          ...armas,
        ],
        Armadura: armaduras,
      },
      true
    ),
    mainHandItemId: undefined,
    offHandItemId: undefined,
  };
  const withArmor = recalculateSheet(sheet);
  withArmor.wornArmorId = withArmor.bag.equipments.Armadura[0]?.id;
  return recalculateSheet(withArmor);
}

export const skillTotal = (sheet: CharacterSheet, name: Skill): number => {
  const skill = sheet.completeSkills?.find((s) => s.name === name);
  if (!skill) throw new Error(`Perícia ${name} não está na ficha`);
  const attr = skill.modAttr ? sheet.atributos[skill.modAttr].value : 0;
  return (
    (skill.halfLevel ?? 0) + attr + (skill.training ?? 0) + (skill.others ?? 0)
  );
};
