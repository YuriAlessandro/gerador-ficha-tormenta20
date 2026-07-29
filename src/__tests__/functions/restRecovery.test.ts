/**
 * Regra "Recuperando PV e PM" (Tormenta20, p. 106).
 *
 * O caso de referência é o exemplo do próprio livro: Helior, caçador de 7º
 * nível, recupera 7 PV/PM numa estalagem (normal) e 3 PV/PM dormindo ao relento
 * (ruim). Ele trava tanto os multiplicadores quanto o arredondamento para baixo.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateRestRecovery,
  detectRestOptions,
  isCompanionImmuneToRestConditions,
  MANUAL_REST_OPTIONS,
  RestCondition,
  RestOption,
} from '../../functions/restRecovery';
import CharacterSheet from '../../interfaces/CharacterSheet';

const option = (
  id: string,
  effect: RestOption['effect'],
  extra: Partial<RestOption> = {}
): RestOption => ({
  id,
  label: id,
  description: '',
  effect,
  source: 'auto',
  defaultChecked: true,
  ...extra,
});

const manual = (id: string): RestOption => {
  const found = MANUAL_REST_OPTIONS.find((o) => o.id === id);
  if (!found) throw new Error(`opção manual desconhecida: ${id}`);
  return found;
};

/** Ficha "vazia o suficiente" — só o que o cálculo lê. */
const rest = (params: {
  level: number;
  condition: RestCondition;
  options?: RestOption[];
  outdoors?: boolean;
  currentPV?: number;
  maxPV?: number;
  currentPM?: number;
  maxPM?: number;
}) =>
  calculateRestRecovery({
    level: params.level,
    condition: params.condition,
    outdoors: params.outdoors ?? false,
    options: params.options ?? [],
    currentPV: params.currentPV ?? 0,
    maxPV: params.maxPV ?? 9999,
    currentPM: params.currentPM ?? 0,
    maxPM: params.maxPM ?? 9999,
  });

describe('calculateRestRecovery — exemplo canônico do livro', () => {
  it('Helior, 7º nível, numa estalagem comum recupera 7 PV e 7 PM', () => {
    const result = rest({ level: 7, condition: 'normal' });
    expect(result.pv).toBe(7);
    expect(result.pm).toBe(7);
  });

  it('Helior dormindo ao relento recupera 3 PV e 3 PM (arredonda para baixo)', () => {
    const result = rest({ level: 7, condition: 'ruim', outdoors: true });
    expect(result.pv).toBe(3);
    expect(result.pm).toBe(3);
  });
});

describe('calculateRestRecovery — multiplicadores das quatro condições', () => {
  it.each([
    ['ruim', 5, 2],
    ['normal', 5, 5],
    ['confortavel', 5, 10],
    ['luxuosa', 5, 15],
    ['ruim', 10, 5],
    ['confortavel', 10, 20],
    ['luxuosa', 20, 60],
  ] as [RestCondition, number, number][])(
    'condição %s no nível %i recupera %i',
    (condition, level, expected) => {
      const result = rest({ level, condition });
      expect(result.pv).toBe(expected);
      expect(result.pm).toBe(expected);
    }
  );

  it('nível 1 em condição ruim recupera 0 (metade de 1 arredondada para baixo)', () => {
    const result = rest({ level: 1, condition: 'ruim' });
    expect(result.pv).toBe(0);
    expect(result.pm).toBe(0);
  });
});

describe('calculateRestRecovery — deslocamento de categoria', () => {
  it('Estoico sobe uma categoria (ruim → normal)', () => {
    const result = rest({
      level: 6,
      condition: 'ruim',
      options: [
        option('estoico', { type: 'shiftCategory', steps: 1, scope: 'both' }),
      ],
    });
    expect(result.pv).toBe(6);
    expect(result.effectiveConditionPV).toBe('normal');
  });

  it('dois deslocamentos somam (ruim +1 +1 → confortável)', () => {
    const result = rest({
      level: 6,
      condition: 'ruim',
      options: [
        option('estoico', { type: 'shiftCategory', steps: 1, scope: 'both' }),
        option('pajem', { type: 'shiftCategory', steps: 1, scope: 'both' }),
      ],
    });
    expect(result.pv).toBe(12);
    expect(result.effectiveConditionPV).toBe('confortavel');
  });

  it('não passa de luxuosa', () => {
    const result = rest({
      level: 4,
      condition: 'luxuosa',
      options: [
        option('estoico', { type: 'shiftCategory', steps: 1, scope: 'both' }),
      ],
    });
    expect(result.pv).toBe(12);
    expect(result.effectiveConditionPV).toBe('luxuosa');
  });

  it('Herança de Vitalia sobe categoria só para PV', () => {
    const result = rest({
      level: 6,
      condition: 'normal',
      options: [
        option('vitalia', { type: 'shiftCategory', steps: 1, scope: 'pv' }),
      ],
    });
    expect(result.pv).toBe(12);
    expect(result.pm).toBe(6);
  });

  it('Descanso Natural só vale ao relento', () => {
    const descansoNatural = option(
      'descanso-natural',
      { type: 'shiftCategory', steps: 2, scope: 'both' },
      { requiresOutdoors: true }
    );

    const dentro = rest({
      level: 5,
      condition: 'ruim',
      options: [descansoNatural],
      outdoors: false,
    });
    expect(dentro.pv).toBe(2);

    const aoRelento = rest({
      level: 5,
      condition: 'ruim',
      options: [descansoNatural],
      outdoors: true,
    });
    expect(aoRelento.pv).toBe(10);
    expect(aoRelento.effectiveConditionPV).toBe('confortavel');
  });
});

describe('calculateRestRecovery — pisos', () => {
  it('Rato das Ruas garante o nível cheio em condição ruim', () => {
    const result = rest({
      level: 7,
      condition: 'ruim',
      options: [option('rato', { type: 'floorLevel', scope: 'both' })],
    });
    expect(result.pv).toBe(7);
    expect(result.pm).toBe(7);
  });

  it('o piso não reduz uma recuperação já maior que o nível', () => {
    const result = rest({
      level: 7,
      condition: 'luxuosa',
      options: [option('rato', { type: 'floorLevel', scope: 'both' })],
    });
    expect(result.pv).toBe(21);
  });

  it('Vida Rústica só vale ao relento', () => {
    const vidaRustica = option(
      'vida-rustica',
      { type: 'floorLevel', scope: 'both' },
      { requiresOutdoors: true }
    );
    expect(
      rest({ level: 8, condition: 'ruim', options: [vidaRustica] }).pv
    ).toBe(4);
    expect(
      rest({
        level: 8,
        condition: 'ruim',
        options: [vidaRustica],
        outdoors: true,
      }).pv
    ).toBe(8);
  });
});

describe('calculateRestRecovery — imunidade a condições', () => {
  it('Criatura Artificial recupera como normal mesmo em condição ruim', () => {
    const result = rest({
      level: 9,
      condition: 'ruim',
      options: [option('golem', { type: 'ignoreConditions' })],
    });
    expect(result.pv).toBe(9);
    expect(result.effectiveConditionPV).toBe('normal');
  });

  it('Criatura Artificial também anula condições boas e deslocamentos', () => {
    const result = rest({
      level: 9,
      condition: 'luxuosa',
      options: [
        option('golem', { type: 'ignoreConditions' }),
        option('estoico', { type: 'shiftCategory', steps: 1, scope: 'both' }),
      ],
    });
    expect(result.pv).toBe(9);
  });

  it('mas ainda soma bônus aditivos por nível', () => {
    const result = rest({
      level: 9,
      condition: 'ruim',
      options: [
        option('golem', { type: 'ignoreConditions' }),
        manual('prato-do-aventureiro'),
      ],
    });
    expect(result.pv).toBe(18);
    expect(result.pm).toBe(9);
  });
});

describe('calculateRestRecovery — complicações que pioram o descanso', () => {
  it('Hedonista (−2): luxuosa recupera o nível', () => {
    const result = rest({
      level: 8,
      condition: 'luxuosa',
      options: [
        option('hedonista', {
          type: 'shiftCategory',
          steps: -2,
          scope: 'both',
        }),
      ],
    });
    expect(result.pv).toBe(8);
    expect(result.effectiveConditionPV).toBe('normal');
  });

  it('Hedonista: confortável recupera metade do nível', () => {
    const result = rest({
      level: 8,
      condition: 'confortavel',
      options: [
        option('hedonista', {
          type: 'shiftCategory',
          steps: -2,
          scope: 'both',
        }),
      ],
    });
    expect(result.pv).toBe(4);
  });

  it.each(['normal', 'ruim'] as RestCondition[])(
    'Hedonista: condição %s cai abaixo de ruim e recupera 1 fixo',
    (condition) => {
      const result = rest({
        level: 20,
        condition,
        options: [
          option('hedonista', {
            type: 'shiftCategory',
            steps: -2,
            scope: 'both',
          }),
        ],
      });
      expect(result.pv).toBe(1);
      expect(result.pm).toBe(1);
      expect(result.effectiveConditionPV).toBe('nenhuma');
    }
  );

  it('Paranoico (−1) em condição ruim cai para o piso fixo de 1', () => {
    const result = rest({
      level: 15,
      condition: 'ruim',
      options: [
        option('paranoico', {
          type: 'shiftCategory',
          steps: -1,
          scope: 'both',
        }),
      ],
    });
    expect(result.pv).toBe(1);
    expect(result.pm).toBe(1);
  });
});

describe('calculateRestRecovery — bônus aditivos e área de Tormenta', () => {
  it('Cuidados Prolongados soma +1 PV por nível e não toca em PM', () => {
    const result = rest({
      level: 10,
      condition: 'normal',
      options: [manual('cuidados-prolongados')],
    });
    expect(result.pv).toBe(20);
    expect(result.pm).toBe(10);
  });

  it('Sopa de Peixe soma +1 PM por nível e não toca em PV', () => {
    const result = rest({
      level: 10,
      condition: 'normal',
      options: [manual('sopa-de-peixe')],
    });
    expect(result.pv).toBe(10);
    expect(result.pm).toBe(20);
  });

  it('Galrasia soma nas duas trilhas', () => {
    const result = rest({
      level: 10,
      condition: 'normal',
      options: [manual('galrasia')],
    });
    expect(result.pv).toBe(20);
    expect(result.pm).toBe(20);
  });

  it('área de Tormenta divide DEPOIS dos bônus aditivos', () => {
    // Confortável (2×10=20) + Cuidados Prolongados (+10 PV) = 30 PV → metade = 15.
    // Se a divisão viesse antes do bônus, daria 10 + 10 = 20.
    const result = rest({
      level: 10,
      condition: 'confortavel',
      options: [manual('cuidados-prolongados'), manual('area-de-tormenta')],
    });
    expect(result.pv).toBe(15);
    expect(result.pm).toBe(10);
  });

  it('área de Tormenta arredonda a metade para baixo', () => {
    const result = rest({
      level: 7,
      condition: 'normal',
      options: [manual('area-de-tormenta')],
    });
    expect(result.pv).toBe(3);
  });
});

describe('calculateRestRecovery — teto do máximo', () => {
  it('nunca recupera mais do que foi perdido', () => {
    const result = rest({
      level: 10,
      condition: 'luxuosa',
      currentPV: 28,
      maxPV: 30,
      currentPM: 9,
      maxPM: 12,
    });
    expect(result.pv).toBe(2);
    expect(result.pm).toBe(3);
    expect(result.rawPV).toBe(30);
  });

  it('ficha cheia recupera 0', () => {
    const result = rest({
      level: 10,
      condition: 'luxuosa',
      currentPV: 30,
      maxPV: 30,
      currentPM: 12,
      maxPM: 12,
    });
    expect(result.pv).toBe(0);
    expect(result.pm).toBe(0);
  });

  it('PV negativo (personagem caído) recupera o valor cheio', () => {
    const result = rest({
      level: 5,
      condition: 'normal',
      currentPV: -4,
      maxPV: 40,
    });
    expect(result.pv).toBe(5);
  });
});

describe('detectRestOptions', () => {
  const sheetWith = (patch: Partial<CharacterSheet>): CharacterSheet =>
    ({
      nivel: 5,
      raca: { abilities: [] },
      classe: { abilities: [] },
      generalPowers: [],
      ...patch,
    } as unknown as CharacterSheet);

  it('detecta Rato das Ruas na raça goblin', () => {
    const options = detectRestOptions(
      sheetWith({
        raca: { abilities: [{ name: 'Rato das Ruas' }] },
      } as unknown as Partial<CharacterSheet>)
    );
    expect(options.map((o) => o.id)).toContain('rato-das-ruas');
    expect(options[0].effect).toEqual({ type: 'floorLevel', scope: 'both' });
    expect(options[0].sourceLabel).toBe('Raça');
  });

  it('detecta Criatura Artificial como imunidade a condições', () => {
    const options = detectRestOptions(
      sheetWith({
        raca: { abilities: [{ name: 'Criatura Artificial' }] },
      } as unknown as Partial<CharacterSheet>)
    );
    expect(options[0].effect).toEqual({ type: 'ignoreConditions' });
  });

  it('detecta Estoico no poder de origem', () => {
    const options = detectRestOptions(
      sheetWith({
        origin: { name: 'Refugiado', powers: [{ name: 'Estoico' }] },
      } as unknown as Partial<CharacterSheet>)
    );
    expect(options.map((o) => o.id)).toContain('estoico');
    expect(options[0].defaultChecked).toBe(true);
  });

  it('detecta Vida Rústica e marca como dependente de relento', () => {
    const options = detectRestOptions(
      sheetWith({
        origin: { name: 'Selvagem', powers: [{ name: 'Vida Rústica' }] },
      } as unknown as Partial<CharacterSheet>)
    );
    const vidaRustica = options.find((o) => o.id === 'vida-rustica');
    expect(vidaRustica?.requiresOutdoors).toBe(true);
    expect(vidaRustica?.defaultChecked).toBe(false);
  });

  it('detecta Pajem nas habilidades de classe do cavaleiro', () => {
    const options = detectRestOptions(
      sheetWith({
        classe: { abilities: [{ name: 'Pajem' }] },
      } as unknown as Partial<CharacterSheet>)
    );
    expect(options.map((o) => o.label)).toContain('Pajem');
    expect(options[0].sourceLabel).toBe('Classe');
  });

  it('detecta Descanso Natural entre os poderes concedidos do devoto', () => {
    const options = detectRestOptions(
      sheetWith({
        devoto: {
          divindade: { name: 'Allihanna' },
          poderes: [{ name: 'Descanso Natural' }],
        },
      } as unknown as Partial<CharacterSheet>)
    );
    const descanso = options.find((o) => o.id === 'descanso-natural');
    expect(descanso?.requiresOutdoors).toBe(true);
    expect(descanso?.effect).toEqual({
      type: 'shiftCategory',
      steps: 2,
      scope: 'both',
    });
  });

  it('detecta a complicação Hedonista como −2 categorias', () => {
    const options = detectRestOptions(
      sheetWith({
        complication: { name: 'Hedonista' },
      } as unknown as Partial<CharacterSheet>)
    );
    expect(options[0].effect).toEqual({
      type: 'shiftCategory',
      steps: -2,
      scope: 'both',
    });
    expect(options[0].defaultChecked).toBe(true);
  });

  it('complicações dependentes de ambiente vêm desmarcadas', () => {
    const options = detectRestOptions(
      sheetWith({
        complication: { name: 'Matugo' },
      } as unknown as Partial<CharacterSheet>)
    );
    expect(options[0].defaultChecked).toBe(false);
  });

  it('ficha sem nenhum modificador devolve lista vazia', () => {
    expect(detectRestOptions(sheetWith({}))).toEqual([]);
  });
});

describe('isCompanionImmuneToRestConditions', () => {
  it('construtos e mortos-vivos ignoram condições de descanso', () => {
    expect(isCompanionImmuneToRestConditions('Construto')).toBe(true);
    expect(isCompanionImmuneToRestConditions('Morto-Vivo')).toBe(true);
  });

  it('os demais tipos são afetados normalmente', () => {
    expect(isCompanionImmuneToRestConditions('Animal')).toBe(false);
    expect(isCompanionImmuneToRestConditions('Espírito')).toBe(false);
    expect(isCompanionImmuneToRestConditions('Monstro')).toBe(false);
  });
});
