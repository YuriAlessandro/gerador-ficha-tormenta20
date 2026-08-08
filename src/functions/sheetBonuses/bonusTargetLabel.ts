import { MovementTypes, StatModifierTarget } from '@/interfaces/CharacterSheet';
import { RACE_SIZES } from '@/data/systems/tormenta20/races/raceSizes/raceSizes';

/**
 * Rótulo legível do ALVO de um bônus de ficha.
 *
 * `numeric: false` marca alvo categórico — proficiência, troca de tamanho,
 * treinar perícia: a concessão é booleana e o `modifier` do bônus é irrelevante,
 * então exibir "+N" ao lado mentiria.
 */
export type BonusTargetLabel = { label: string; numeric: boolean };

const MOVEMENT_LABELS: Record<keyof Omit<MovementTypes, 'pairar'>, string> = {
  escalada: 'Escalada',
  escavar: 'Escavação',
  natacao: 'Natação',
  voo: 'Voo',
};

/**
 * Traduz um `StatModifierTarget` para texto de interface.
 *
 * A redação segue o `TARGET_OPTIONS` do editor de homebrew
 * (`SheetBonusBuilder.tsx`) para que o mesmo bônus não apareça com dois nomes
 * diferentes em telas diferentes.
 *
 * O `switch` é deliberadamente exaustivo e SEM `default`: um alvo novo no union
 * quebra o `tsc` aqui em vez de renderizar um rótulo vazio na ficha.
 */
export function describeBonusTarget(
  target: StatModifierTarget
): BonusTargetLabel {
  switch (target.type) {
    case 'Skill':
      return { label: target.name, numeric: true };
    case 'PickSkill':
      return { label: 'Perícia à escolha', numeric: true };
    case 'TrainSkill':
      return {
        label:
          target.pick >= target.skills.length
            ? `Treina ${target.skills.join(', ')}`
            : `Treina ${target.pick} perícia(s)`,
        numeric: false,
      };
    case 'ModifySkillAttribute':
      return {
        label: `${target.skill} passa a usar ${target.attribute}`,
        numeric: false,
      };
    case 'Attribute':
      return { label: target.attribute, numeric: true };
    case 'PickAttribute':
      return { label: 'Atributo à escolha', numeric: true };
    case 'PV':
      return { label: 'PV', numeric: true };
    case 'PM':
      return { label: 'PM', numeric: true };
    case 'Defense':
      return { label: 'Defesa', numeric: true };
    case 'Displacement':
      return { label: 'Deslocamento', numeric: true };
    case 'DisplacementOverride':
      return { label: 'Deslocamento (fixo)', numeric: true };
    case 'MaxSpaces':
      return { label: 'Espaços de carga', numeric: true };
    case 'ArmorPenalty':
      return { label: 'Penalidade de armadura', numeric: true };
    case 'SpellDC':
      return { label: 'CD de magias', numeric: true };
    case 'HPAttributeReplacement':
      return {
        label: `PV passa a usar ${target.newAttribute}`,
        numeric: false,
      };
    case 'DamageReduction':
      return { label: `RD contra ${target.damageType}`, numeric: true };
    case 'AllAttackBonus':
      return { label: 'Testes de ataque', numeric: true };
    case 'WeaponAttack':
      return { label: 'Ataque com armas', numeric: true };
    case 'WeaponDamage':
      return { label: 'Dano com armas', numeric: true };
    case 'WeaponDamageStep':
      return { label: 'Dano com armas (aumenta o dado)', numeric: true };
    case 'WeaponThreatMargin':
      return { label: 'Margem de ameaça', numeric: true };
    case 'WeaponCriticalMultiplier':
      return { label: 'Multiplicador de crítico', numeric: true };
    case 'Proficiency':
      return { label: `Proficiência: ${target.proficiency}`, numeric: false };
    case 'SizeOverride':
      return {
        label: `Tamanho: ${RACE_SIZES[target.size]?.name ?? target.size}`,
        numeric: false,
      };
    case 'SizeSteps': {
      const categorias =
        Math.abs(target.steps) === 1 ? 'categoria' : 'categorias';
      const direcao = target.steps >= 0 ? 'acima' : 'abaixo';
      return {
        label: `Tamanho: ${Math.abs(target.steps)} ${categorias} ${direcao}`,
        numeric: false,
      };
    }
    case 'MovementType':
      return { label: MOVEMENT_LABELS[target.movement], numeric: true };
    case 'ThrownAttackUseStrength':
      return { label: 'Força em armas de arremesso', numeric: false };
    default: {
      // Exaustividade: se um alvo novo entrar no union sem passar por aqui, o
      // `tsc` reclama nesta linha.
      const exhaustive: never = target;
      return { label: String(exhaustive), numeric: false };
    }
  }
}
