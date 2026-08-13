import { describe, expect, test } from 'vitest';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import SelectedOptions from '../../interfaces/SelectedOptions';
import { WizardSelections } from '../../interfaces/WizardSelections';
import { SupplementId } from '../../types/supplement.types';
import { generateEmptySheet } from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { getFilteredAvailableOptions } from '../powers/manualPowerSelection';
import type { PowerSelectionRequirement } from '../../interfaces/PowerSelections';
import type CharacterSheet from '../../interfaces/CharacterSheet';

const ZEROED: Record<Atributo, number> = {
  [Atributo.FORCA]: 0,
  [Atributo.DESTREZA]: 0,
  [Atributo.CONSTITUICAO]: 0,
  [Atributo.INTELIGENCIA]: 0,
  [Atributo.SABEDORIA]: 0,
  [Atributo.CARISMA]: 0,
};

// Elfo (e não Humano): Versátil sorteia um poder geral a cada recálculo e deixa
// o teste intermitente.
const BASE_OPTIONS: SelectedOptions = {
  nivel: 1,
  raca: 'Elfo',
  classe: 'Guerreiro',
  origin: '',
  devocao: { label: '--', value: '--' },
  supplements: [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ],
};

function buildSheet(selections: WizardSelections): CharacterSheet {
  return generateEmptySheet(BASE_OPTIONS, {
    baseAttributes: { ...ZEROED },
    ...selections,
  });
}

/** Modificador do atributo descontando o racial, para isolar o efeito da idade. */
function attributeDelta(
  withAge: CharacterSheet,
  baseline: CharacterSheet,
  attr: Atributo
): number {
  return withAge.atributos[attr].value - baseline.atributos[attr].value;
}

describe('Idades Variadas — gravação na ficha', () => {
  test('Jovem é a faixa padrão e não é gravada (equivale a regra desligada)', () => {
    const sheet = buildSheet({ ageBracket: 'jovem' });

    expect(sheet.age).toBeUndefined();
  });

  test('grava faixa, anos, complicações e níveis extras congelados', () => {
    const sheet = buildSheet({
      ageBracket: 'velho',
      ageYears: 250,
      ageComplications: [
        { name: 'Catarata', description: '' },
        { name: 'Melancólico', description: '' },
        { name: 'Teimoso', description: '' },
      ],
    });

    expect(sheet.age?.bracket).toBe('velho');
    expect(sheet.age?.years).toBe(250);
    expect(sheet.age?.complications.map((c) => c.name)).toEqual([
      'Catarata',
      'Melancólico',
      'Teimoso',
    ]);
    expect(sheet.age?.extraLevels).toBe(2);
  });

  test('registra um step de auditoria com a faixa etária', () => {
    const sheet = buildSheet({ ageBracket: 'maduro' });
    const step = sheet.steps.find((s) => s.label === 'Idade');

    expect(step).toBeDefined();
    expect(step?.value).toContainEqual({
      name: 'Faixa etária',
      value: 'Maduro',
    });
  });
});

describe('Idades Variadas — efeitos na ficha', () => {
  test('Criança: For −2, Con −1, Sab −1 e uma categoria de tamanho a menos', () => {
    const baseline = buildSheet({});
    const crianca = buildSheet({ ageBracket: 'crianca' });

    expect(attributeDelta(crianca, baseline, Atributo.FORCA)).toBe(-2);
    expect(attributeDelta(crianca, baseline, Atributo.CONSTITUICAO)).toBe(-1);
    expect(attributeDelta(crianca, baseline, Atributo.SABEDORIA)).toBe(-1);
    // Elfo é Médio; Criança desce um degrau.
    expect(baseline.size?.name).toBe('Médio');
    expect(crianca.size?.name).toBe('Pequeno');
  });

  test('Criança: +2 de Defesa e +5 nas três resistências', () => {
    const baseline = buildSheet({});
    const crianca = buildSheet({ ageBracket: 'crianca' });

    expect(crianca.defesa - baseline.defesa).toBe(2);

    const resistances = ['Fortitude', 'Reflexos', 'Vontade'];
    resistances.forEach((name) => {
      const before = baseline.completeSkills?.find((s) => s.name === name);
      const after = crianca.completeSkills?.find((s) => s.name === name);
      expect((after?.others ?? 0) - (before?.others ?? 0)).toBe(5);
    });
  });

  test('Adolescente: Sab −1 e +3 PM (Ímpeto Juvenil)', () => {
    const baseline = buildSheet({});
    const adolescente = buildSheet({ ageBracket: 'adolescente' });

    expect(attributeDelta(adolescente, baseline, Atributo.SABEDORIA)).toBe(-1);
    expect(adolescente.pm - baseline.pm).toBe(3);
  });

  test('Ancião: −2 em cada atributo físico', () => {
    const baseline = buildSheet({});
    const anciao = buildSheet({ ageBracket: 'anciao' });

    expect(attributeDelta(anciao, baseline, Atributo.FORCA)).toBe(-2);
    expect(attributeDelta(anciao, baseline, Atributo.DESTREZA)).toBe(-2);
    expect(attributeDelta(anciao, baseline, Atributo.CONSTITUICAO)).toBe(-2);
    // Mentais ficam intactos.
    expect(attributeDelta(anciao, baseline, Atributo.INTELIGENCIA)).toBe(0);
  });

  test('complicação de idade com bônus numérico chega às perícias', () => {
    const baseline = buildSheet({ ageBracket: 'maduro' });
    const comCatarata = buildSheet({
      ageBracket: 'maduro',
      ageComplications: [
        { name: 'Catarata', description: '' },
        { name: 'Teimoso', description: '' },
      ],
    });

    const before = baseline.completeSkills?.find((s) => s.name === 'Percepção');
    const after = comCatarata.completeSkills?.find(
      (s) => s.name === 'Percepção'
    );
    expect((after?.others ?? 0) - (before?.others ?? 0)).toBe(-5);
  });

  test('poder de "Já Vi Coisas" entra na lista de poderes gerais do Adulto', () => {
    const sheet = buildSheet({
      ageBracket: 'adulto',
      ageComplications: [{ name: 'Teimoso', description: '' }],
      agePower: {
        name: 'Poder de Teste',
        description: '',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });

    expect(sheet.age?.grantedPowerName).toBe('Poder de Teste');
    expect(sheet.generalPowers.some((p) => p.name === 'Poder de Teste')).toBe(
      true
    );
  });
});

describe('Idades Variadas — recálculo', () => {
  test('recalcular várias vezes não duplica os modificadores de atributo', () => {
    const sheet = buildSheet({ ageBracket: 'anciao' });
    const força = sheet.atributos[Atributo.FORCA].value;

    let recalculated = recalculateSheet(sheet);
    recalculated = recalculateSheet(recalculated);
    recalculated = recalculateSheet(recalculated);

    expect(recalculated.atributos[Atributo.FORCA].value).toBe(força);
  });

  test('recalcular não duplica os bônus de perícia da idade', () => {
    const sheet = buildSheet({ ageBracket: 'crianca' });
    const before = sheet.completeSkills?.find((s) => s.name === 'Fortitude');

    const recalculated = recalculateSheet(recalculateSheet(sheet));
    const after = recalculated.completeSkills?.find(
      (s) => s.name === 'Fortitude'
    );

    expect(after?.others).toBe(before?.others);
  });

  test('remover a faixa etária tira os bônus, sem mexer nos atributos', () => {
    // Os modificadores de atributo são permanentes (como os raciais): quem
    // troca a faixa aplica o delta na hora, via `getAgeAttributeDelta`. O
    // recálculo sozinho não os desfaz — e não deve, senão desfaria os raciais
    // pelo mesmo argumento.
    const anciao = buildSheet({ ageBracket: 'crianca' });
    const defesaCrianca = anciao.defesa;

    const semIdade = recalculateSheet({ ...anciao, age: undefined }, anciao);

    expect(semIdade.defesa).toBe(defesaCrianca - 2);
    expect(semIdade.size?.name).toBe('Médio');
  });
});

describe('Idades Variadas — Aumento de Atributo bloqueado', () => {
  const requirement: PowerSelectionRequirement = {
    type: 'increaseAttribute',
    pick: 1,
    availableOptions: [],
    label: 'Aumento de Atributo',
  };

  test('Velho não pode escolher atributo físico', () => {
    const sheet = buildSheet({
      ageBracket: 'velho',
      ageComplications: [
        { name: 'Catarata', description: '' },
        { name: 'Teimoso', description: '' },
        { name: 'Tosse', description: '' },
      ],
    });

    const options = getFilteredAvailableOptions(requirement, sheet);

    expect(options).not.toContain(Atributo.FORCA);
    expect(options).not.toContain(Atributo.DESTREZA);
    expect(options).not.toContain(Atributo.CONSTITUICAO);
    expect(options).toContain(Atributo.INTELIGENCIA);
    expect(options).toContain(Atributo.SABEDORIA);
    expect(options).toContain(Atributo.CARISMA);
  });

  test('Maduro ainda pode — o bloqueio só começa em Velho', () => {
    const sheet = buildSheet({
      ageBracket: 'maduro',
      ageComplications: [
        { name: 'Catarata', description: '' },
        { name: 'Teimoso', description: '' },
      ],
    });

    expect(getFilteredAvailableOptions(requirement, sheet)).toContain(
      Atributo.FORCA
    );
  });

  test('ficha sem idade tem os seis atributos disponíveis', () => {
    const sheet = buildSheet({});

    expect(getFilteredAvailableOptions(requirement, sheet)).toHaveLength(6);
  });
});

describe('Idades Variadas — normalização de fichas antigas', () => {
  test('descarta idade com faixa etária desconhecida', () => {
    const sheet = buildSheet({ ageBracket: 'velho' });
    const corrupted = {
      ...sheet,
      age: { ...sheet.age!, bracket: 'inexistente' },
    } as unknown as CharacterSheet;

    normalizeSheet(corrupted);
    expect(corrupted.age).toBeUndefined();
  });

  test('refresca a descrição das complicações de idade pelo catálogo', () => {
    const sheet = buildSheet({
      ageBracket: 'maduro',
      ageComplications: [
        { name: 'Catarata', description: 'texto antigo e errado' },
        { name: 'Teimoso', description: 'texto antigo e errado' },
      ],
    });

    normalizeSheet(sheet);
    const catarata = sheet.age?.complications.find(
      (c) => c.name === 'Catarata'
    );

    expect(catarata?.description).toContain('Percepção');
  });

  test('sobrevive a complicações de idade malformadas', () => {
    const sheet = buildSheet({ ageBracket: 'maduro' });
    const corrupted = {
      ...sheet,
      age: { ...sheet.age!, complications: [null, { name: 'Catarata' }] },
    } as unknown as CharacterSheet;

    normalizeSheet(corrupted);
    expect(corrupted.age?.complications).toHaveLength(1);
  });
});
