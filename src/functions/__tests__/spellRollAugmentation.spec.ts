import { describe, expect, test } from 'vitest';
import { DiceRoll } from '@/interfaces/DiceRoll';
import { Aprimoramento, Spell } from '@/interfaces/Spells';
import {
  executeMultipleDamageRolls,
  executeMultipleDiceRolls,
} from '@/utils/diceRoller';
import {
  spellsCircle1,
  spellsCircle2,
  spellsCircle3,
  spellsCircle4,
  spellsCircle5,
} from '@/data/systems/tormenta20/magias/generalSpells';
import DEUSES_ARTON_SPELLS from '@/data/systems/tormenta20/deuses-de-arton/spells';
import {
  AprimoramentoSelection,
  augmentSpellRolls,
  normalizeLabel,
  parseDamageBonusFromText,
} from '../spellRollAugmentation';

/**
 * Cobre o motor puro que conecta aprimoramentos às rolagens de dano/cura:
 * aumento automático (por label e por rolagem única), empilhamento por
 * contagem, merge de dados de lados diferentes, o fallback de texto e a
 * integridade das anotações em `generalSpells.ts`.
 */

const roll = (label: string, dice: string, id?: string): DiceRoll => ({
  id,
  label,
  dice,
});

const apr = (
  text: string,
  overrides: Partial<Aprimoramento> = {}
): Aprimoramento => ({
  addPm: 1,
  text,
  ...overrides,
});

const select = (
  aprimoramento: Aprimoramento,
  count: number
): AprimoramentoSelection => ({ aprimoramento, count });

describe('augmentSpellRolls — vínculo estruturado', () => {
  test('rolagem única + bônus sem alvo aumenta empilhando por contagem', () => {
    const base = [roll('Dano de Fogo', '6d6')];
    const bonus = apr('aumenta o dano em +2d6.', {
      addPm: 2,
      damageBonus: [{ dicePerActivation: '2d6' }],
    });

    const once = augmentSpellRolls(base, [select(bonus, 1)]);
    expect(once[0].dice).toBe('8d6');
    expect(once[0].isAugmented).toBe(true);
    expect(once[0].baseDice).toBe('6d6');
    expect(once[0].addedSummary).toBe('+2d6');

    const twice = augmentSpellRolls(base, [select(bonus, 2)]);
    expect(twice[0].dice).toBe('10d6');
    expect(twice[0].addedSummary).toBe('+4d6');
  });

  test('Flecha Ácida: um aprimoramento aumenta as duas rolagens', () => {
    const base = [
      roll('Dano de Ácido inicial', '4d6'),
      roll('Dano de Ácido por rodada', '2d6'),
    ];
    const bonus = apr('aumenta o dano inicial e o dano por rodada em +1d6.', {
      addPm: 2,
      damageBonus: [
        { targetRollLabel: 'inicial', dicePerActivation: '1d6' },
        { targetRollLabel: 'por rodada', dicePerActivation: '1d6' },
      ],
    });

    const once = augmentSpellRolls(base, [select(bonus, 1)]);
    expect(once[0].dice).toBe('5d6');
    expect(once[1].dice).toBe('3d6');

    const twice = augmentSpellRolls(base, [select(bonus, 2)]);
    expect(twice[0].dice).toBe('6d6');
    expect(twice[1].dice).toBe('4d6');
  });

  test('alvo único entre várias rolagens deixa as demais intactas', () => {
    const base = [roll('Dano de Frio', '4d6'), roll('Dano de Impacto', '2d6')];
    const bonus = apr('aumenta o dano de frio em +2d6.', {
      damageBonus: [{ targetRollLabel: 'frio', dicePerActivation: '2d6' }],
    });

    const result = augmentSpellRolls(base, [select(bonus, 1)]);
    expect(result[0].dice).toBe('6d6');
    expect(result[0].isAugmented).toBe(true);
    expect(result[1].dice).toBe('2d6');
    expect(result[1].isAugmented).toBe(false);
  });

  test('merge de dados de lados diferentes', () => {
    const base = [roll('Dano', '6d6')];
    const bonus = apr('aumenta o dano em +1d8+2.', {
      damageBonus: [{ dicePerActivation: '1d8+2' }],
    });

    const once = augmentSpellRolls(base, [select(bonus, 1)]);
    expect(once[0].dice).toBe('6d6+1d8+2');

    const twice = augmentSpellRolls(base, [select(bonus, 2)]);
    expect(twice[0].dice).toBe('6d6+2d8+4');
  });

  test('modificador base é preservado ao aumentar', () => {
    const base = [roll('Dano', '6d6+1')];
    const bonus = apr('aumenta o dano em +2d6.', {
      damageBonus: [{ dicePerActivation: '2d6' }],
    });
    const result = augmentSpellRolls(base, [select(bonus, 1)]);
    expect(result[0].dice).toBe('8d6+1');
  });

  test('substitui a notação base sem somar a versão anterior', () => {
    const base = [roll('Dano de Luz', '2d8+2')];
    const variant = apr('muda os dados de dano para d10.', {
      damageBonus: [{ replaceWith: '2d10+2' }],
    });
    const result = augmentSpellRolls(base, [select(variant, 1)]);

    expect(result[0].dice).toBe('2d10+2');
    expect(result[0].baseDice).toBe('2d8+2');
    expect(result[0].replacementDice).toBe('2d10+2');
    expect(result[0].isAugmented).toBe(true);
  });

  test('usa o dado substituído para aumentos por quantidade de dados', () => {
    const base = [roll('Dano de Luz', '2d8+2')];
    const replacement = apr('muda os dados de dano para d10.', {
      damageBonus: [{ replaceWith: '2d10+2' }],
    });
    const increase = apr('aumenta o dano em um dado e +1.', {
      damageBonus: [{ diceCount: 1, flatPerActivation: 1 }],
    });
    const result = augmentSpellRolls(base, [
      select(replacement, 1),
      select(increase, 1),
    ]);

    expect(result[0].dice).toBe('3d10+3');
  });

  test('usa o dado substituído mesmo quando o aumento foi selecionado antes', () => {
    const base = [roll('Dano de Luz', '2d8+2')];
    const replacement = apr('muda os dados de dano para d10.', {
      damageBonus: [{ replaceWith: '2d10+2' }],
    });
    const increase = apr('aumenta o dano em um dado e +1.', {
      damageBonus: [{ diceCount: 1, flatPerActivation: 1 }],
    });
    const result = augmentSpellRolls(base, [
      select(increase, 1),
      select(replacement, 1),
    ]);

    expect(result[0].dice).toBe('3d10+3');
  });

  test('mantém suporte ao aumento literal quando necessário', () => {
    const base = [roll('Dano', '2d10')];
    const bonus = apr('aumenta o dano em +1d8+2.', {
      damageBonus: [{ dicePerActivation: '1d8+2' }],
    });
    const result = augmentSpellRolls(base, [select(bonus, 1)]);

    expect(result[0].dice).toBe('2d10+1d8+2');
  });

  test('substitui o tipo de dano mantendo a notação', () => {
    const base = [{ ...roll('Dano', '3d6'), damageType: 'corte' }];
    const variant = apr('muda o tipo de dano para luz.', {
      damageBonus: [{ replaceDamageType: 'luz' }],
    });
    const result = augmentSpellRolls(base, [select(variant, 1)]);

    expect(result[0].dice).toBe('3d6');
    expect(result[0].damageType).toBe('luz');
    expect(result[0].isAugmented).toBe(true);
  });

  test('substitui o rótulo da rolagem junto com dano e tipo', () => {
    const base = [{ ...roll('Dano de Corte', '4d6'), damageType: 'corte' }];
    const variant = apr('muda o dano de corte para impacto.', {
      damageBonus: [
        {
          replaceWith: '3d6',
          replaceDamageType: 'impacto',
          replaceLabel: 'Dano de Impacto',
        },
      ],
    });
    const result = augmentSpellRolls(base, [select(variant, 1)]);

    expect(result[0].dice).toBe('3d6');
    expect(result[0].damageType).toBe('impacto');
    expect(result[0].label).toBe('Dano de Impacto');
  });

  test('adiciona uma rolagem extra criada pelo aprimoramento', () => {
    const base = [roll('Dano Base', '1d6')];
    const bonus = apr('adiciona um efeito que causa 3d8.', {
      damageBonus: [
        {
          additionalRoll: {
            id: 'extra-roll',
            label: 'Dano Extra',
            dice: '3d8',
          },
        },
      ],
    });
    const result = augmentSpellRolls(base, [select(bonus, 1)]);

    expect(result.map((r) => r.dice)).toEqual(['1d6', '3d8']);
    expect(result[1].label).toBe('Dano Extra');
  });

  test('bônus sem label continua mirando a rolagem base com um additionalRoll ativo', () => {
    const base = [roll('Dano de Fogo', '4d6')];
    const extra = apr('além do normal, cria um efeito que causa 2d8.', {
      damageBonus: [
        {
          additionalRoll: {
            id: 'extra-roll',
            label: 'Dano Extra',
            dice: '2d8',
          },
        },
      ],
    });
    // Sem `targetRollLabel`: o alvo tem que continuar sendo a única rolagem
    // BASE, sem contar as criadas por `additionalRoll`.
    const bonus = apr('aumenta o dano em +2d6.', {
      damageBonus: [{ diceCount: 2 }],
    });

    expect(augmentSpellRolls(base, [select(bonus, 1)])[0].dice).toBe('6d6');

    const comExtra = augmentSpellRolls(base, [
      select(extra, 1),
      select(bonus, 1),
    ]);
    expect(comExtra.map((r) => r.dice)).toEqual(['6d6', '2d8']);
  });

  test('flatPerActivation soma modificador fixo', () => {
    const base = [roll('Dano', '6d6')];
    const bonus = apr('aumenta o dano em 10.', {
      damageBonus: [{ dicePerActivation: '', flatPerActivation: 10 }],
    });
    const once = augmentSpellRolls(base, [select(bonus, 1)]);
    expect(once[0].dice).toBe('6d6+10');
    expect(once[0].addedSummary).toBe('+10');

    const twice = augmentSpellRolls(base, [select(bonus, 2)]);
    expect(twice[0].dice).toBe('6d6+20');
  });

  test('preserva id, label e não altera a string quando não aumentada', () => {
    const base = [roll('Dano', '2d10+5', 'roll-x')];
    const result = augmentSpellRolls(base, []);
    expect(result[0].id).toBe('roll-x');
    expect(result[0].label).toBe('Dano');
    expect(result[0].dice).toBe('2d10+5'); // string original intacta
    expect(result[0].isAugmented).toBe(false);
  });

  test('bônus sem alvo em magia com várias rolagens não é aplicado (nunca chuta)', () => {
    const base = [roll('Dano A', '4d6'), roll('Dano B', '2d6')];
    const bonus = apr('aumenta o dano em +2d6.', {
      damageBonus: [{ dicePerActivation: '2d6' }],
    });
    const result = augmentSpellRolls(base, [select(bonus, 1)]);
    expect(result[0].isAugmented).toBe(false);
    expect(result[1].isAugmented).toBe(false);
  });

  test('count <= 0 não aplica bônus', () => {
    const base = [roll('Dano', '6d6')];
    const bonus = apr('aumenta o dano em +2d6.', {
      damageBonus: [{ dicePerActivation: '2d6' }],
    });
    const result = augmentSpellRolls(base, [select(bonus, 0)]);
    expect(result[0].dice).toBe('6d6');
    expect(result[0].isAugmented).toBe(false);
  });
});

describe('augmentSpellRolls — fallback de texto (sem damageBonus)', () => {
  test('usa o texto quando não há vínculo estruturado', () => {
    const base = [roll('Dano de Fogo', '6d6')];
    const bonus = apr('aumenta o dano em +2d6.', { addPm: 2 });
    const result = augmentSpellRolls(base, [select(bonus, 1)]);
    expect(result[0].dice).toBe('8d6');
  });
});

describe('parseDamageBonusFromText', () => {
  test('bônus simples sem alvo', () => {
    expect(parseDamageBonusFromText('aumenta o dano em +2d6.')).toEqual([
      { dicePerActivation: '2d6' },
    ]);
  });

  test('dado sem sinal de "+"', () => {
    expect(parseDamageBonusFromText('aumenta o dano em 1d8+1.')).toEqual([
      { dicePerActivation: '1d8+1' },
    ]);
  });

  test('bônus com tipo de dano', () => {
    expect(parseDamageBonusFromText('aumenta o dano de frio em +2d6.')).toEqual(
      [{ targetRollLabel: 'frio', dicePerActivation: '2d6' }]
    );
  });

  test('duas rolagens compartilhando o mesmo dado (inicial e por rodada)', () => {
    expect(
      parseDamageBonusFromText(
        'aumenta o dano inicial e o dano por rodada em +1d6.'
      )
    ).toEqual([
      { targetRollLabel: 'inicial', dicePerActivation: '1d6' },
      { targetRollLabel: 'por rodada', dicePerActivation: '1d6' },
    ]);
  });

  test('dois tipos com "de <tipo>" antes do "em"', () => {
    expect(
      parseDamageBonusFromText(
        'aumenta o dano de frio em +2d6 e o dano de corte em +2d6.'
      )
    ).toEqual([
      { targetRollLabel: 'frio', dicePerActivation: '2d6' },
      { targetRollLabel: 'corte', dicePerActivation: '2d6' },
    ]);
  });

  test('dois tipos com "de <tipo>" após o dado (impacto e fogo)', () => {
    expect(
      parseDamageBonusFromText(
        'aumenta o dano em +2d6 de impacto e +2d6 de fogo.'
      )
    ).toEqual([
      { targetRollLabel: 'impacto', dicePerActivation: '2d6' },
      { targetRollLabel: 'fogo', dicePerActivation: '2d6' },
    ]);
  });

  test('cura', () => {
    expect(parseDamageBonusFromText('aumenta a cura em +1d8+1.')).toEqual([
      { dicePerActivation: '1d8+1' },
    ]);
  });

  test('bônus fixo (sem dado)', () => {
    expect(parseDamageBonusFromText('aumenta o dano em 10.')).toEqual([
      { dicePerActivation: '', flatPerActivation: 10 },
    ]);
  });

  test('parênteses são ignorados (variante condicional)', () => {
    expect(
      parseDamageBonusFromText(
        'aumenta o dano em +1d6 (ou +1d12 contra mortos-vivos).'
      )
    ).toEqual([{ dicePerActivation: '1d6' }]);
  });

  test('aumento em passos não é dado → []', () => {
    expect(
      parseDamageBonusFromText('aumenta o dano em mais um passo.')
    ).toEqual([]);
  });

  test('texto sem aumento de dano/cura → []', () => {
    expect(parseDamageBonusFromText('muda o alcance para curto.')).toEqual([]);
    expect(
      parseDamageBonusFromText('aumenta a redução na Defesa em +1.')
    ).toEqual([]);
    expect(
      parseDamageBonusFromText('aumenta o número de alvos em +1.')
    ).toEqual([]);
  });
});

describe('normalizeLabel', () => {
  test('remove acento e caixa', () => {
    expect(normalizeLabel('Dano de Ácido')).toBe('dano de acido');
    expect(normalizeLabel('  Frio  ')).toBe('frio');
  });
});

describe('executeMultipleDamageRolls — suporte a multi-grupo', () => {
  test('rola notação mesclada que o executor single-grupo descartaria', () => {
    const rolls = [roll('Dano', '6d6+1d8+2')];

    // O executor legado (single-grupo) descarta a notação mesclada.
    expect(executeMultipleDiceRolls(rolls)).toHaveLength(0);

    // O executor multi-grupo rola corretamente.
    const results = executeMultipleDamageRolls(rolls);
    expect(results).toHaveLength(1);
    expect(results[0].rolls).toHaveLength(7); // 6d6 + 1d8
    expect(results[0].modifier).toBe(2);
    const sum = results[0].rolls.reduce((a, b) => a + b, 0);
    expect(results[0].total).toBe(sum + 2);
  });
});

describe('integridade das anotações damageBonus em generalSpells', () => {
  const allSpells = [
    ...Object.values(spellsCircle1),
    ...Object.values(spellsCircle2),
    ...Object.values(spellsCircle3),
    ...Object.values(spellsCircle4),
    ...Object.values(spellsCircle5),
  ];

  test('todo damageBonus resolve para uma rolagem existente na magia', () => {
    const problems: string[] = [];

    allSpells.forEach((spell) => {
      // Rótulos das rolagens base + das criadas por `additionalRoll` de
      // qualquer aprimoramento da mesma magia (ex.: o raio da Tempestade
      // Divina), já que um bônus de outro aprimoramento pode mirar nelas.
      const rolls = [
        ...(spell.rolls ?? []),
        ...(spell.aprimoramentos ?? []).flatMap((a) =>
          (a.damageBonus ?? [])
            .map((b) => b.additionalRoll)
            .filter((r): r is DiceRoll => Boolean(r))
        ),
      ];

      (spell.aprimoramentos ?? []).forEach((aprimoramento) => {
        (aprimoramento.damageBonus ?? []).forEach((bonus) => {
          if (bonus.additionalRoll) return;
          if (bonus.targetRollLabel) {
            const needle = normalizeLabel(bonus.targetRollLabel);
            const matched = rolls.some((r) =>
              normalizeLabel(r.label).includes(needle)
            );
            if (!matched) {
              problems.push(
                `${spell.nome}: nenhum roll casa com "${bonus.targetRollLabel}"`
              );
            }
          } else if (rolls.length !== 1) {
            problems.push(
              `${spell.nome}: bônus sem targetRollLabel mas a magia tem ${rolls.length} rolagens`
            );
          }
        });
      });
    });

    expect(problems).toEqual([]);
  });
});

describe('integração com dados reais (generalSpells)', () => {
  const findByNome = (record: Record<string, Spell>, nome: string): Spell => {
    const spell = Object.values(record).find((s) => s.nome === nome);
    if (!spell) throw new Error(`Magia "${nome}" não encontrada`);
    return spell;
  };

  const selectApr = (
    spell: Spell,
    predicate: (a: Aprimoramento) => boolean
  ): AprimoramentoSelection => {
    const aprimoramento = (spell.aprimoramentos ?? []).find(predicate);
    if (!aprimoramento)
      throw new Error(`Aprimoramento não encontrado em ${spell.nome}`);
    return { aprimoramento, count: 1 };
  };

  test('Bola de Fogo: +2d6 aumenta 6d6 → 8d6 (dado real anotado)', () => {
    const spell = findByNome(spellsCircle2, 'Bola de Fogo');
    const sel = selectApr(spell, (a) => /aumenta o dano/i.test(a.text));
    const result = augmentSpellRolls(spell.rolls ?? [], [sel]);
    expect(result[0].dice).toBe('8d6');
    expect(result[0].isAugmented).toBe(true);
  });

  test('Bola de Fogo: esfera flamejante substitui o dano por 3d6', () => {
    const spell = findByNome(spellsCircle2, 'Bola de Fogo');
    const sel = selectApr(spell, (a) => /esfera flamejante/.test(a.text));
    const result = augmentSpellRolls(spell.rolls ?? [], [sel]);
    expect(result[0].dice).toBe('3d6');
  });

  test('Seta de Talude: lanças substituem o dado das setas', () => {
    const spell = findByNome(spellsCircle1, 'Seta Infalível de Talude');
    const sel = selectApr(spell, (a) => /muda as setas/.test(a.text));
    const result = augmentSpellRolls(spell.rolls ?? [], [sel]);
    expect(result.map((r) => r.dice).sort()).toEqual(['1d8+1', '2d8+2']);
  });

  test('Enxame: formas maiores substituem a quantidade de dados', () => {
    const spell = findByNome(spellsCircle2, 'Enxame de Pestes');
    const larger = selectApr(spell, (a) => /criaturas maiores/.test(a.text));
    const elemental = selectApr(spell, (a) =>
      /criaturas elementais/.test(a.text)
    );

    expect(augmentSpellRolls(spell.rolls ?? [], [larger])[0].dice).toBe('3d12');
    expect(augmentSpellRolls(spell.rolls ?? [], [elemental])[0].dice).toBe(
      '5d12'
    );
  });

  test('Flecha Ácida: um aprimoramento aumenta as duas rolagens (dado real)', () => {
    const spell = findByNome(spellsCircle2, 'Flecha Ácida');
    const sel = selectApr(spell, (a) => (a.damageBonus?.length ?? 0) === 2);
    const result = augmentSpellRolls(spell.rolls ?? [], [sel]);
    const dice = result.map((r) => r.dice).sort();
    // 4d6 → 5d6 e 2d6 → 3d6
    expect(dice).toEqual(['3d6', '5d6']);
  });

  test('Raio Solar: o aumento acompanha o dado de cada variante', () => {
    const spell = findByNome(spellsCircle2, 'Raio Solar');
    const sel = selectApr(spell, (a) => /aumenta o dano/i.test(a.text));
    const result = augmentSpellRolls(spell.rolls ?? [], [sel]);

    expect(result.map((r) => r.dice).sort()).toEqual(['5d12', '5d8']);
  });

  test('Cólera de Azgher: o aumento acompanha o dado de mortos-vivos', () => {
    const spell = findByNome(spellsCircle4, 'Cólera de Azgher');
    const sel = selectApr(spell, (a) => /aumenta o dano/i.test(a.text));
    const result = augmentSpellRolls(spell.rolls ?? [], [sel]);

    expect(result.map((r) => r.dice).sort()).toEqual(['12d6', '12d8']);
  });

  test('Tempestade Divina: aprimoramentos adicionam rolagens opcionais', () => {
    const spell = findByNome(spellsCircle2, 'Tempestade Divina');
    const selections = (spell.aprimoramentos ?? [])
      .filter((a) => /fazer um raio|granizo|causar neve/.test(a.text))
      .map((aprimoramento) => ({ aprimoramento, count: 1 }));
    const result = augmentSpellRolls(spell.rolls ?? [], selections);

    expect(result.map((r) => r.dice).sort()).toEqual(['2d6', '2d6', '3d8']);
  });

  test('Tempestade Divina: "aumenta o dano de raios" alcança a rolagem criada pelo raio', () => {
    const spell = findByNome(spellsCircle2, 'Tempestade Divina');
    const raioSel = selectApr(spell, (a) => /fazer um raio/.test(a.text));
    const bonusSel = selectApr(spell, (a) =>
      /aumenta o dano de raios/.test(a.text)
    );

    const result = augmentSpellRolls(spell.rolls ?? [], [raioSel, bonusSel]);
    const raio = result.find((r) => /raio/i.test(r.label));

    expect(raio?.dice).toBe('4d8');
    expect(raio?.isAugmented).toBe(true);
  });

  test('Marca da Obediência e Controlar Madeira adicionam danos opcionais', () => {
    const mark = findByNome(spellsCircle2, 'Marca da Obediência');
    const wood = findByNome(spellsCircle2, 'Controlar Madeira');
    const markSelection = selectApr(mark, (a) =>
      /marca causa 3d6/.test(a.text)
    );
    const woodSelection = selectApr(wood, (a) => /vegetação.*1d6/.test(a.text));

    expect(
      augmentSpellRolls(mark.rolls ?? [], [markSelection]).at(-1)?.dice
    ).toBe('3d6');
    expect(
      augmentSpellRolls(wood.rolls ?? [], [woodSelection]).at(-1)?.dice
    ).toBe('1d6');
  });

  test('Chuva de Meteoros ganhou rolagens de dano', () => {
    const spell = findByNome(spellsCircle5, 'Chuva de Meteoros');
    expect((spell.rolls ?? []).length).toBeGreaterThan(0);
  });

  test('Siroco de Azgher: muda o tipo de dano das três rolagens para luz', () => {
    const spell = (DEUSES_ARTON_SPELLS.divine ?? []).find(
      (s) => s.nome === 'Siroco de Azgher'
    );
    if (!spell) throw new Error('Magia "Siroco de Azgher" não encontrada');
    const sel = selectApr(spell, (a) => /muda o tipo de dano/.test(a.text));

    const result = augmentSpellRolls(spell.rolls ?? [], [sel]);

    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r.damageType).toBe('luz'));
  });
});
