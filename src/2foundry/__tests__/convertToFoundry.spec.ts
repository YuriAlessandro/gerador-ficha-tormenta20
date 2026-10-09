// `_id`/`_stats` são nomes de campo do Foundry, não escolha nossa.
/* eslint-disable no-underscore-dangle */
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import generateRandomSheet from '../../functions/general';
import { collectSheetPowers } from '../../functions/powers/collectSheetPowers';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { spellsCircles } from '../../interfaces/Spells';
import { SupplementId } from '../../types/supplement.types';
import { convertToFoundry } from '..';
import {
  ACTIVATION_TYPES,
  ATTRIBUTE_KEYS,
  DAMAGE_TYPES,
  DISTANCE_UNITS,
  EQUIPMENT_TYPES,
  HEALING_TYPES,
  POWER_TYPES,
  SPELL_SCHOOLS,
  SPELL_TYPES,
  TIME_PERIODS,
  WEAPON_GRIPS,
  WEAPON_PROFICIENCIES,
  WEAPON_PURPOSES,
} from '../enums';
import { parseCritical } from '../items/equipment';
import { FoundryData, FoundryItem, FoundryJSON, FoundryRoll } from '../types';

const generate = (classe: string, nivel: number): CharacterSheet =>
  generateRandomSheet({
    nivel,
    // Elfo: Humano sorteia um poder geral a cada recálculo.
    raca: 'Elfo',
    classe,
    origin: '',
    devocao: { label: '--', value: '--' },
    gerarItens: 'consumir-dinheiro',
    supplements: [SupplementId.TORMENTA20_CORE],
  });

const data = (value: FoundryData[string]): FoundryData =>
  (value ?? {}) as FoundryData;

const rollsOf = (item: FoundryItem): FoundryRoll[] =>
  (item.system.rolls ?? []) as unknown as FoundryRoll[];

const ROLL_PART_TYPES: string[] = ['', ...DAMAGE_TYPES, ...HEALING_TYPES];

/**
 * Invariantes do schema do sistema 1.6: o que o Foundry rejeita, renderiza em
 * branco ou aplica errado quando violado.
 */
function expectValidItems(items: FoundryItem[]) {
  const effectIds = new Set<string>();
  const itemIds = new Set<string>();

  items.forEach((item) => {
    expect(item._id).toMatch(/^[A-Za-z0-9]{16}$/);
    expect(itemIds.has(item._id)).toBe(false);
    itemIds.add(item._id);

    const rolls = rollsOf(item);
    expect(new Set(rolls.map((roll) => roll.key)).size).toBe(rolls.length);
    rolls.forEach((roll) => {
      expect(['ataque', 'dano', 'formula']).toContain(roll.type);
      roll.parts.forEach((part) => expect(part).toHaveLength(3));
      if (roll.type === 'dano') {
        roll.parts.forEach((part) =>
          expect(ROLL_PART_TYPES).toContain(part[1])
        );
      }
    });

    item.effects.forEach((effect) => {
      expect(effectIds.has(effect._id)).toBe(false);
      effectIds.add(effect._id);
      expect(effect.type).toBe('base');
      // Formato anterior à 1.6, que o sistema ignora sem migrar.
      expect(effect).not.toHaveProperty('changes');
      expect(data(effect.flags.tormenta20)).not.toHaveProperty('onuse');
      expect(Array.isArray(effect.system.changes)).toBe(true);
    });

    const { system } = item;
    if (system.duracao !== undefined) {
      expect(TIME_PERIODS).toContain(data(system.duracao).units);
    }
    if (system.ativacao !== undefined) {
      expect(ACTIVATION_TYPES).toContain(data(system.ativacao).execucao);
    }

    if (item.type === 'magia') {
      expect(typeof system.circulo).toBe('number');
      expect(SPELL_SCHOOLS).toContain(system.escola);
      expect(SPELL_TYPES).toContain(system.tipo);
      expect(DISTANCE_UNITS).toContain(system.alcance);
    }
    if (item.type === 'poder') {
      expect(POWER_TYPES).toContain(system.tipo);
      expect(typeof system.subtipo).toBe('string');
    }
    if (item.type === 'arma') {
      expect(WEAPON_PROFICIENCIES).toContain(system.proficiencia);
      expect(WEAPON_PURPOSES).toContain(system.proposito);
      expect(WEAPON_GRIPS).toContain(system.empunhadura);
      expect([0, 1, 2]).toContain(system.equipado);
    }
    if (item.type === 'equipamento') {
      expect(EQUIPMENT_TYPES).toContain(system.tipo);
      expect(typeof system.equipado).toBe('boolean');
      expect(data(system.armadura).penalidade).toBeLessThanOrEqual(0);
    }
  });
}

const ofType = (json: FoundryJSON, type: string) =>
  json.items.filter((item) => item.type === type);

describe('convertToFoundry', () => {
  it('exporta todos os poderes e magias de um Arcanista', () => {
    const sheet = generate('Arcanista', 5);
    const json = convertToFoundry(sheet);

    expectValidItems(json.items);

    expect(sheet.spells.length).toBeGreaterThan(0);
    expect(ofType(json, 'magia')).toHaveLength(sheet.spells.length);
    expect(ofType(json, 'poder')).toHaveLength(
      collectSheetPowers(sheet).powers.length
    );

    // Aprimoramentos viram efeitos de uso no formato da 1.6: desligados até o
    // jogador marcá-los ao conjurar, valendo para a própria magia.
    const onUse = ofType(json, 'magia').flatMap((item) => item.effects);
    expect(onUse.length).toBeGreaterThan(0);
    onUse.forEach((effect) => {
      expect(effect.system.onuse).toBe(true);
      expect(effect.disabled).toBe(true);
      expect(effect.transfer).toBe(false);
      expect(effect.system.abilityUse?.types).toEqual(['self']);
    });

    // A CD é do conjurador: toda magia leva o atributo-chave da ficha.
    const keyAttribute = ATTRIBUTE_KEYS[sheet.classe.spellPath!.keyAttribute];
    expect(json.system.attributes).toMatchObject({ conjuracao: keyAttribute });
    ofType(json, 'magia').forEach((item) =>
      expect(data(item.system.resistencia).atributo).toBe(keyAttribute)
    );
  });

  it('exporta o inventário de um Guerreiro com armas e armadura', () => {
    const sheet = generate('Guerreiro', 4);
    const json = convertToFoundry(sheet);

    expectValidItems(json.items);

    const equipments = sheet.bag.getEquipments();
    expect(ofType(json, 'arma').length).toBeGreaterThan(0);
    expect(ofType(json, 'arma').length).toBeLessThanOrEqual(
      equipments.Arma.length
    );
    ofType(json, 'arma').forEach((weapon) => {
      const rolls = rollsOf(weapon);
      expect(rolls.map((roll) => roll.type)).toEqual(['ataque', 'dano']);
      expect(rolls[1].parts[0][0]).toMatch(/\d/);
    });

    expect(json.system.tracos).toMatchObject({
      profArmas: { value: expect.arrayContaining(['simples', 'marcial']) },
      profArmaduras: { value: expect.arrayContaining(['lev', 'pes', 'esc']) },
    });
  });

  it('manda os totais da ficha e deixa o Foundry derivar a Defesa até eles', () => {
    const sheet = generate('Guerreiro', 6);
    const json = convertToFoundry(sheet);
    const attributes = data(json.system.attributes);

    expect(attributes.pv).toMatchObject({ max: sheet.pv });
    expect(attributes.pm).toMatchObject({ max: sheet.pm });
    expect(json.flags).toMatchObject({
      tormenta20: { lvlconfig: { manual: true } },
    });
    expect(json._stats.systemId).toBe('tormenta20');

    // Reproduz `prepareDefense` do sistema sobre o JSON exportado.
    const defesa = data(attributes.defesa);
    const worn = ofType(json, 'equipamento').filter(
      (item) => item.system.equipado
    );
    const armor = worn.find((item) =>
      ['leve', 'pesada'].includes(String(item.system.tipo))
    );
    const attribute = Number(
      data(data(json.system.atributos)[String(defesa.atributo)]).base
    );
    const attributePart =
      armor?.system.tipo === 'pesada'
        ? Math.min(
            Math.max(attribute, 0),
            Number(data(armor.system.armadura).maxAtr)
          )
        : attribute;
    const total =
      Number(defesa.base) +
      attributePart +
      worn.reduce(
        (sum, item) => sum + Number(data(item.system.armadura).value),
        0
      ) +
      Number(defesa.outros);

    expect(total).toBe(sheet.defesa);
  });

  it('um item de classe por classe, somando o nível da ficha', () => {
    const sheet = generate('Clérigo', 3);
    const json = convertToFoundry(sheet);

    expectValidItems(json.items);
    const classes = ofType(json, 'classe');
    expect(classes).toHaveLength(1);
    expect(classes[0].system).toMatchObject({ inicial: true, niveis: 3 });
  });

  it('converte os campos de uma magia para as chaves do sistema', () => {
    const sheet = createMockCharacterSheet();
    sheet.spells = [
      {
        nome: 'Magia Que Não Existe',
        execucao: 'Padrão',
        alcance: 'Curto',
        alvo: '1 criatura',
        duracao: '1 dia',
        resistencia: 'Vontade anula',
        description: 'Primeira linha.\nSegunda <linha>.',
        spellCircle: spellsCircles.c2,
        school: 'Ilusão',
        rolls: [{ label: 'Dano', dice: '4d6', damageType: 'Fogo' }],
        aprimoramentos: [
          { trick: true, addPm: 0, text: 'vira truque.' },
          {
            addPm: 2,
            text: 'aumenta o dano em +1d6.',
            damageBonus: [{ dicePerActivation: '1d6' }],
          },
        ],
      },
    ];

    const json = convertToFoundry(sheet);
    expectValidItems(json.items);

    const [spell] = ofType(json, 'magia');
    expect(spell.system).toMatchObject({
      circulo: 2,
      escola: 'ilu',
      alcance: 'short',
      alvo: '1 criatura',
      ativacao: { execucao: 'action', custo: 3 },
      duracao: { units: 'day', value: 1 },
      resistencia: { txt: 'Vontade anula' },
      rolls: [{ key: 'dano0', parts: [['4d6', 'fogo', '']] }],
      description: {
        value: '<p>Primeira linha.</p><p>Segunda &lt;linha&gt;.</p>',
      },
    });

    const [trick, upgrade] = spell.effects;
    expect(trick.system.abilityUse).toMatchObject({ custo: null });
    expect(upgrade.system.abilityUse).toMatchObject({
      custo: 2,
      aumenta: true,
    });
    expect(upgrade.system.changes).toEqual([
      expect.objectContaining({ key: 'dano', value: '1d6' }),
    ]);
  });

  it('respeita nome e texto que o jogador reescreveu num poder', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      {
        ...generate('Guerreiro', 1).generalPowers[0],
        name: 'Ataque Poderoso',
        description: 'texto do livro',
        customName: 'Pancada',
        customDescription: 'meu texto',
      } as CharacterSheet['generalPowers'][number],
    ];

    const json = convertToFoundry(sheet);
    const [power] = ofType(json, 'poder');

    expect(power.name).toBe('Pancada');
    expect(data(power.system.description).value).toBe('<p>meu texto</p>');
    expect(power.system).toMatchObject({ tipo: 'geral' });
  });
});

describe('parseCritical', () => {
  it.each([
    ['19/x3', 19, 3],
    ['x3', 20, 3],
    ['19', 19, 2],
    ['-', 20, 2],
    [undefined, 20, 2],
  ])('%s', (text, criticoM, criticoX) => {
    expect(parseCritical(text)).toEqual({ criticoM, criticoX });
  });
});
