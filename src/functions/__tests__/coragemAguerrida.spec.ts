import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { GeneralPowerType } from '../../interfaces/Poderes';
import type { GeneralPower } from '../../interfaces/Poderes';
import { reconcileAutoPowerEffects } from '../../premium/functions/autoPowerEffects';
import { getActivePowerForSheetEntry } from '../../premium/data/activePowers';

/**
 * Integração de Coragem Aguerrida: o poder era só texto no dado (nenhum bônus
 * chegava na ficha). Agora o reconciliador liga um `ActiveEffect` conforme o
 * PV, e o bônus entra pelo caminho normal do motor (Step 7.45 -> Steps 8/10).
 */

const CORAGEM: GeneralPower = {
  name: 'Coragem Aguerrida',
  description: '',
  type: GeneralPowerType.COMBATE,
  requirements: [],
};

const skillOthers = (sheet: CharacterSheet, name: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === name)?.others ?? 0;

const rawSheet = (): CharacterSheet => ({
  ...createMockCharacterSheet(),
  generalPowers: [CORAGEM],
  activeEffects: [],
});

// `recalculateSheet` recomputa o PV máximo a partir da classe/nível/CON, então
// o limiar tem que sair do PV que o MOTOR produz — não de um número fixo. Em
// produção o reconciliador também sempre vê uma ficha já recalculada (o
// `currentSheet` do Result.tsx), então a fixture parte do mesmo estado.
const MAX_PV = recalculateSheet(rawSheet()).pv;
const HALF_PV = Math.floor(MAX_PV / 2);

const withCoragem = (currentPV: number): CharacterSheet => ({
  ...recalculateSheet(rawSheet()),
  currentPV,
  activeEffects: [],
});

/** Roda o reconciliador e recalcula, como faz o `useEffect` do Result.tsx. */
const reconcileAndRecalculate = (sheet: CharacterSheet): CharacterSheet => {
  const next = reconcileAutoPowerEffects(sheet);
  return recalculateSheet(next ? { ...sheet, activeEffects: next } : sheet);
};

describe('Coragem Aguerrida', () => {
  it('está registrado como poder ativo geral (casa por nome)', () => {
    expect(
      getActivePowerForSheetEntry('Geral', 'Coragem Aguerrida')
    ).toBeDefined();
  });

  it('não soma nada com o personagem acima de metade dos PV', () => {
    const base = recalculateSheet(withCoragem(MAX_PV));
    const out = reconcileAndRecalculate(withCoragem(MAX_PV));

    expect(out.defesa).toBe(base.defesa);
    expect(skillOthers(out, Skill.ATLETISMO)).toBe(
      skillOthers(base, Skill.ATLETISMO)
    );
  });

  it('soma +2 na Defesa e nas perícias com metade ou menos dos PV', () => {
    const base = recalculateSheet(withCoragem(MAX_PV));
    const out = reconcileAndRecalculate(withCoragem(HALF_PV));

    expect(out.defesa - base.defesa).toBe(2);
    [Skill.ATLETISMO, Skill.PERCEPCAO, Skill.VONTADE, Skill.INICIATIVA].forEach(
      (skill) => {
        expect(skillOthers(out, skill) - skillOthers(base, skill)).toBe(2);
      }
    );
  });

  it('aplica o bônus UMA vez só quando a ficha é recalculada de novo', () => {
    const base = recalculateSheet(withCoragem(MAX_PV));
    const once = reconcileAndRecalculate(withCoragem(HALF_PV));
    const twice = reconcileAndRecalculate(once);

    expect(twice.defesa).toBe(once.defesa);
    expect(twice.defesa - base.defesa).toBe(2);
    expect(skillOthers(twice, Skill.ATLETISMO)).toBe(
      skillOthers(once, Skill.ATLETISMO)
    );
  });

  it('remove o bônus ao curar acima da metade', () => {
    const base = recalculateSheet(withCoragem(MAX_PV));
    const wounded = reconcileAndRecalculate(withCoragem(HALF_PV));
    const healed = reconcileAndRecalculate({ ...wounded, currentPV: MAX_PV });

    expect(healed.defesa).toBe(base.defesa);
    expect(skillOthers(healed, Skill.ATLETISMO)).toBe(
      skillOthers(base, Skill.ATLETISMO)
    );
  });
});
