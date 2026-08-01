import { StatModifierTarget } from '../../interfaces/CharacterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Skill from '../../interfaces/Skills';
import { describeBonusTarget } from '../sheetBonuses/bonusTargetLabel';

/**
 * Trava a tradução de `StatModifierTarget` para texto de interface, usada pela
 * seção "Aplicado na ficha" do card de poder.
 *
 * A tabela tem UMA amostra por membro do union: junto com o `never` exaustivo
 * do `describeBonusTarget`, é o que impede um alvo novo de aparecer como chip
 * em branco na ficha.
 */
describe('describeBonusTarget', () => {
  const SAMPLES: StatModifierTarget[] = [
    { type: 'Skill', name: Skill.LADINAGEM },
    { type: 'PV' },
    { type: 'PM' },
    { type: 'Defense' },
    { type: 'Displacement' },
    { type: 'MaxSpaces' },
    { type: 'ArmorPenalty' },
    { type: 'PickSkill', skills: [Skill.FURTIVIDADE], pick: 1 },
    { type: 'TrainSkill', skills: [Skill.GUERRA], pick: 1 },
    { type: 'PickAttribute', pick: 1 },
    {
      type: 'ModifySkillAttribute',
      skill: Skill.INICIATIVA,
      attribute: Atributo.SABEDORIA,
    },
    { type: 'WeaponDamage' },
    { type: 'WeaponAttack' },
    { type: 'WeaponThreatMargin' },
    { type: 'WeaponCriticalMultiplier' },
    { type: 'WeaponDamageStep' },
    { type: 'HPAttributeReplacement', newAttribute: Atributo.CARISMA },
    { type: 'SpellDC' },
    { type: 'DamageReduction', damageType: 'Fogo' },
    { type: 'Attribute', attribute: Atributo.FORCA },
    { type: 'DisplacementOverride' },
    { type: 'SizeOverride', size: 'MINUSCULO' },
    { type: 'MovementType', movement: 'voo' },
    { type: 'AllAttackBonus' },
    { type: 'Proficiency', proficiency: 'Armas Marciais' },
    { type: 'ThrownAttackUseStrength' },
  ];

  it('cobre todos os membros do union', () => {
    const covered = new Set(SAMPLES.map((target) => target.type));
    expect(covered.size).toBe(SAMPLES.length);
  });

  it.each(SAMPLES.map((target) => [target.type, target] as const))(
    'devolve rótulo não vazio para %s',
    (_type, target) => {
      const { label } = describeBonusTarget(target);
      expect(typeof label).toBe('string');
      expect(label.trim()).not.toBe('');
    }
  );

  it('marca como categóricos os alvos cujo modificador é irrelevante', () => {
    const categorical: StatModifierTarget[] = [
      { type: 'Proficiency', proficiency: 'Armas Marciais' },
      { type: 'SizeOverride', size: 'GRANDE' },
      { type: 'TrainSkill', skills: [Skill.GUERRA], pick: 1 },
      { type: 'HPAttributeReplacement', newAttribute: Atributo.CARISMA },
      { type: 'ThrownAttackUseStrength' },
    ];

    categorical.forEach((target) => {
      expect(describeBonusTarget(target).numeric).toBe(false);
    });
  });

  it('marca como numéricos os alvos que somam um valor', () => {
    const numeric: StatModifierTarget[] = [
      { type: 'Skill', name: Skill.LADINAGEM },
      { type: 'PV' },
      { type: 'Defense' },
      { type: 'DamageReduction', damageType: 'Fogo' },
      { type: 'AllAttackBonus' },
    ];

    numeric.forEach((target) => {
      expect(describeBonusTarget(target).numeric).toBe(true);
    });
  });

  it('usa o nome legível do tamanho, não a chave crua', () => {
    expect(
      describeBonusTarget({ type: 'SizeOverride', size: 'MINUSCULO' })
    ).toEqual({ label: 'Tamanho: Minúsculo', numeric: false });
  });
});
