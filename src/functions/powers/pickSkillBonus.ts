import { StatModifierTarget } from '@/interfaces/CharacterSheet';
import { GeneralPower } from '@/interfaces/Poderes';

/**
 * Alvo `PickSkill` de um poder, quando ele pede uma perícia para receber bônus
 * (ex.: Maravilha Mecânica: Caminho da Perfeição). Usado onde o poder é
 * escolhido dentro de outro seletor e a perícia precisa vir junto — o Chassi
 * Mashin escolhe a maravilha no próprio campo.
 */
export function getPickSkillBonusTarget(
  power: Pick<GeneralPower, 'sheetBonuses'> | undefined
): Extract<StatModifierTarget, { type: 'PickSkill' }> | undefined {
  const bonus = power?.sheetBonuses?.find(
    (b) => b.target.type === 'PickSkill' && b.target.pick > 0
  );
  return bonus?.target.type === 'PickSkill' ? bonus.target : undefined;
}
