import React from 'react';
import _ from 'lodash';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PowerEffectSelectionStep from '@/components/CharacterCreationWizard/steps/PowerEffectSelectionStep';
import generateRandomSheet, { applyManualLevelUp } from '@/functions/general';
import { recalculateSheet } from '@/functions/recalculateSheet';
import { normalizeSheet } from '@/functions/sheetNormalizer';
import { revertLastLevel } from '@/functions/revertLevel';
import { findClassDescription } from '@/functions/multiclass';
import {
  getFilteredAvailableOptions,
  getPowerSelectionRequirements,
  resolvePowerRequirements,
  countRequirementSelections,
} from '@/functions/powers/manualPowerSelection';
import CharacterSheet from '@/interfaces/CharacterSheet';
import {
  ManualPowerSelections,
  SelectionOptions,
} from '@/interfaces/PowerSelections';
import { Spell, spellsCircles } from '@/interfaces/Spells';
import Skill from '@/interfaces/Skills';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { SupplementId } from '@/types/supplement.types';

/**
 * Vassalo 16, 17 e 20: o assistente pedia 1 ponto de atributo (o resto a ficha
 * decidia sozinha) e só oferecia magias divinas de 1º círculo.
 */
const supplements = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];
const VASSALO = findClassDescription('Vassalo')!;
const ability = (name: string) =>
  (VASSALO.originalAbilities ?? VASSALO.abilities).find(
    (a) => a.name === name
  )!;

const levelUp = (
  sheet: CharacterSheet,
  level: number,
  abilityEffectSelections: Record<string, SelectionOptions> = {}
) =>
  recalculateSheet(
    applyManualLevelUp(sheet, {
      level,
      powerChoice: 'class',
      abilityEffectSelections,
    })
  );

const vassaloAt = (nivel: number, path: string): CharacterSheet => {
  let sheet = recalculateSheet(
    generateRandomSheet({
      nivel: 1,
      raca: 'Anão',
      classe: 'Vassalo',
      origin: 'Aleatório',
      devocao: { label: '--', value: '--' },
      supplements,
    })
  );
  _.range(2, nivel + 1).forEach((level) => {
    sheet = levelUp(
      sheet,
      level,
      level === 9 ? { Lorde: { chosenOption: [path] } } : {}
    );
  });
  return sheet;
};

const SOLDADO = vassaloAt(16, 'Caminho do Soldado');
const GOVERNANTE = vassaloAt(16, 'Caminho do Governante');

const gains = (before: CharacterSheet, after: CharacterSheet) =>
  _.pickBy(
    _.mapValues(
      after.atributos,
      (attr, name) => attr.value - before.atributos[name as Atributo].value
    ),
    (diff) => diff !== 0
  );

describe('Rei Mercenário (17º)', () => {
  it.each([
    [
      [Atributo.FORCA, Atributo.FORCA, Atributo.DESTREZA],
      { Força: 2, Destreza: 1 },
    ],
    [
      [Atributo.CONSTITUICAO, Atributo.CONSTITUICAO, Atributo.CONSTITUICAO],
      { Constituição: 3 },
    ],
  ])('aplica os 3 pontos escolhidos e reverte: %s', (attributes, expected) => {
    const after = levelUp(SOLDADO, 17, { 'Rei Mercenário': { attributes } });
    expect(gains(SOLDADO, after)).toEqual(expected);
    expect(gains(SOLDADO, revertLastLevel(after))).toEqual({});
  });

  it('cada ponto em Inteligência concede a perícia escolhida', () => {
    const base = _.cloneDeep(GOVERNANTE);
    base.atributos[Atributo.INTELIGENCIA].value = 1;
    const skills = [Skill.PILOTAGEM, Skill.JOGATINA];
    base.skills = base.skills.filter((s) => !skills.includes(s));
    const attributes = [
      Atributo.INTELIGENCIA,
      Atributo.INTELIGENCIA,
      Atributo.CARISMA,
    ];

    const req = getPowerSelectionRequirements(ability('Rei Mercenário'))!
      .requirements[1];
    // Incompleto enquanto as duas perícias não forem escolhidas
    expect(countRequirementSelections(req, { attributes }, 1)).toBe(0);
    expect(
      countRequirementSelections(
        req,
        { attributes, intelligenceSkills: skills },
        1
      )
    ).toBe(3);

    const after = applyManualLevelUp(base, {
      level: 17,
      powerChoice: 'class',
      abilityEffectSelections: {
        'Rei Mercenário': { attributes, intelligenceSkills: skills },
      },
    });
    expect(after.skills).toEqual(expect.arrayContaining(skills));
  });
});

describe('Imperador (20º)', () => {
  it('aplica os dois atributos escolhidos', () => {
    const before = levelUp(levelUp(levelUp(SOLDADO, 17), 18), 19);
    const after = levelUp(before, 20, {
      Imperador: { attributes: [Atributo.SABEDORIA, Atributo.DESTREZA] },
    });
    expect(gains(before, after)).toEqual({ Sabedoria: 1, Destreza: 1 });
  });
});

describe('magias divinas do 16º e do 20º', () => {
  it.each([
    ['Conselheiro Real', 4],
    ['Imperador', 5],
  ])('%s oferece do 1º ao %iº círculo', (name, maxCircle) => {
    const req = getPowerSelectionRequirements(ability(name))!.requirements.find(
      (r) => r.type === 'learnSpell'
    )!;
    const sheet = { ...SOLDADO, spells: [] };
    const spells: Spell[] = getFilteredAvailableOptions(
      req,
      sheet,
      supplements
    );
    const circles = new Set(spells.map((s) => s.spellCircle));
    expect(circles).toEqual(
      new Set(Object.values(spellsCircles).slice(0, maxCircle))
    );
    expect(_.uniqBy(spells, 'nome')).toHaveLength(spells.length);
  });

  it('lista de um círculo só continua restrita a ele', () => {
    const req = getPowerSelectionRequirements(
      ability('Conselheiro Real')
    )!.requirements.find((r) => r.type === 'learnSpell')!;
    const first = (req.availableOptions as Spell[]).filter(
      (s) => s.spellCircle === spellsCircles.c1
    );
    const spells: Spell[] = getFilteredAvailableOptions(
      { ...req, availableOptions: first },
      { ...SOLDADO, spells: [] },
      supplements
    );
    expect(new Set(spells.map((s) => s.spellCircle))).toEqual(
      new Set([spellsCircles.c1])
    );
  });

  it('a magia de 4º círculo escolhida entra com Carisma', () => {
    const req = getPowerSelectionRequirements(ability('Conselheiro Real'))!
      .requirements[0];
    const base = vassaloAt(15, 'Caminho do Soldado');
    const spell = (
      getFilteredAvailableOptions(req, base, supplements) as Spell[]
    ).find((s) => s.spellCircle === spellsCircles.c4)!;
    const after = levelUp(base, 16, {
      'Conselheiro Real': { spells: [spell] },
    });
    expect(after.spells.find((s) => s.nome === spell.nome)?.customKeyAttr).toBe(
      Atributo.CARISMA
    );
  });
});

describe('tela de escolha', () => {
  let current: ManualPowerSelections = {};
  const Harness = ({ level }: { level: number }) => {
    const [selections, setSelections] = React.useState<ManualPowerSelections>(
      {}
    );
    current = selections;
    return (
      <PowerEffectSelectionStep
        race={SOLDADO.raca}
        classe={VASSALO}
        selections={selections}
        onChange={setSelections}
        supplements={supplements}
        actualSheet={SOLDADO}
        skipRaceAbilities
        classAbilityLevel={level}
      />
    );
  };

  it('Rei Mercenário: põe mais de um ponto no mesmo atributo, até 3', () => {
    render(<Harness level={17} />);
    const add = (attr: string) =>
      screen.getByRole('button', { name: `Adicionar ponto em ${attr}` });

    // Só os atributos do caminho do Soldado
    expect(
      screen.queryByRole('button', { name: 'Adicionar ponto em Carisma' })
    ).toBeNull();

    fireEvent.click(add('Força'));
    fireEvent.click(add('Força'));
    fireEvent.click(add('Destreza'));
    expect(current['Rei Mercenário'].attributes).toEqual([
      'Força',
      'Força',
      'Destreza',
    ]);
    expect(add('Força')).toBeDisabled();

    fireEvent.click(
      screen.getByRole('button', { name: 'Remover ponto de Força' })
    );
    expect(current['Rei Mercenário'].attributes).toEqual(['Força', 'Destreza']);
    expect(
      resolvePowerRequirements(ability('Rei Mercenário'), current)[0]
        .requirement.pick
    ).toBe(3);
  });

  it('Imperador: marca dois atributos diferentes', () => {
    render(<Harness level={20} />);
    ['Força', 'Carisma'].forEach((attr) =>
      fireEvent.click(screen.getByRole('checkbox', { name: attr }))
    );
    expect(current.Imperador.attributes).toEqual(['Força', 'Carisma']);
    expect(screen.getByRole('checkbox', { name: 'Destreza' })).toBeDisabled();
  });
});

describe('Marquês (13º) na ficha', () => {
  const RESISTENCIAS = [Skill.FORTITUDE, Skill.REFLEXOS, Skill.VONTADE];
  const others = (sheet: CharacterSheet) =>
    RESISTENCIAS.map(
      (name) => sheet.completeSkills?.find((s) => s.name === name)?.others ?? 0
    );
  const rd = (sheet: CharacterSheet) => sheet.reducaoDeDano?.Geral ?? 0;

  const at12 = (path: string) => {
    const base = vassaloAt(12, path);
    base.atributos[Atributo.CARISMA].value = 3;
    return recalculateSheet(base);
  };

  it('Soldado: RD 5 e +2 na Defesa, sem mexer nas resistências', () => {
    const before = at12('Caminho do Soldado');
    const after = levelUp(before, 13);
    expect(rd(after) - rd(before)).toBe(5);
    expect(after.defesa - before.defesa).toBe(2);
    expect(others(after)).toEqual(others(before));
    // Recalcular de novo não acumula; desfazer o nível tira
    expect(rd(recalculateSheet(after))).toBe(rd(after));
    expect(rd(revertLastLevel(after))).toBe(rd(before));
  });

  it('Governante: Carisma nas três resistências, sem RD nem Defesa', () => {
    const before = at12('Caminho do Governante');
    const after = levelUp(before, 13);
    expect(others(after)).toEqual(others(before).map((value) => value + 3));
    expect(rd(after)).toBe(rd(before));
    expect(after.defesa).toBe(before.defesa);
    expect(others(recalculateSheet(after))).toEqual(others(after));
    expect(others(revertLastLevel(after))).toEqual(others(before));
  });

  it('ficha salva com a cópia antiga recebe os bônus ao ser aberta', () => {
    const current = levelUp(at12('Caminho do Soldado'), 13);
    const saved = _.cloneDeep(current);
    [saved.classe.abilities, saved.classe.originalAbilities ?? []].forEach(
      (list) =>
        list
          .filter((a) => a.name === 'Marquês')
          .forEach((a) => {
            a.sheetBonuses = a.sheetBonuses?.filter(
              (b) => b.target.type === 'Defense'
            );
          })
    );
    expect(rd(recalculateSheet(_.cloneDeep(saved)))).toBe(rd(current) - 5);

    normalizeSheet(saved);
    const opened = recalculateSheet(saved);
    expect(rd(opened)).toBe(rd(current));
    expect(opened.defesa).toBe(current.defesa);
  });
});
