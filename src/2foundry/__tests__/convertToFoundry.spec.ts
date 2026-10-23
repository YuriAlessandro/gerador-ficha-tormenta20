// `_id`/`_stats` são nomes de campo do Foundry, não escolha nossa.
/* eslint-disable no-underscore-dangle */
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import generateRandomSheet from '../../functions/general';
import { collectSheetPowers } from '../../functions/powers/collectSheetPowers';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
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
    if (item.type === 'arma' || item.type === 'equipamento') {
      // Slots de equipamento: `slot` 0 = guardado; o tipo diz qual grupo de
      // slots o item ocupa, e o item sempre declara um.
      const slots = data(system.equipado2);
      expect(['hand', 'body']).toContain(slots.type);
      expect(Boolean(system.equipado)).toBe(Number(slots.slot) > 0);
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
    const onUse = ofType(json, 'magia')
      .flatMap((item) => item.effects)
      .filter((effect) => effect.system.onuse);
    expect(onUse.length).toBeGreaterThan(0);
    onUse.forEach((effect) => {
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
    const applied = [
      ...json.effects,
      ...json.items
        .flatMap((item) => item.effects)
        .filter((effect) => effect.transfer),
    ]
      .filter((effect) => !effect.disabled && !effect.system.onuse)
      .flatMap((effect) => effect.system.changes)
      .filter((change) => change.key === 'system.attributes.defesa.bonus')
      .reduce((sum, change) => sum + Number(change.value), 0);
    const total =
      Number(defesa.base) +
      attributePart +
      worn.reduce(
        (sum, item) => sum + Number(data(item.system.armadura).value),
        0
      ) +
      applied +
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

  it('converte os bônus da ficha em efeitos passivos próprios', () => {
    const sheet = createMockCharacterSheet();
    sheet.generalPowers = [
      {
        ...generate('Guerreiro', 1).generalPowers[0],
        name: 'Poder de Teste',
        description: 'texto',
      } as CharacterSheet['generalPowers'][number],
    ];
    const fixed = (value: number) => ({ type: 'Fixed' as const, value });
    sheet.defesa = 17;
    sheet.sheetBonuses = [
      {
        source: { type: 'power', name: 'Poder de Teste' },
        target: { type: 'Defense' },
        modifier: fixed(2),
      },
      {
        source: { type: 'power', name: 'Poder de Teste' },
        target: { type: 'Skill', name: Skill.FURTIVIDADE },
        modifier: fixed(3),
      },
      {
        source: { type: 'race', raceName: 'Humano' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: fixed(1),
      },
      // Estado passageiro (condição): não vira efeito, vai no `outros`.
      {
        source: { type: 'condition', conditionId: 'abalado' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: fixed(-2),
      },
      // Alvo que já sai como total pronto no ator: sem efeito.
      {
        source: { type: 'power', name: 'Poder de Teste' },
        target: { type: 'PV' },
        modifier: fixed(10),
      },
    ];

    const json = convertToFoundry(sheet);
    expectValidItems(json.items);

    // Bônus de poder: efeito passivo no item do poder.
    const [power] = ofType(json, 'poder');
    expect(power.effects).toHaveLength(1);
    expect(power.effects[0]).toMatchObject({
      name: 'Poder de Teste',
      disabled: false,
      transfer: true,
      system: { onuse: false },
    });
    expect(power.effects[0].system.changes).toEqual([
      expect.objectContaining({
        key: 'system.attributes.defesa.bonus',
        value: 2,
        type: 'add',
      }),
      expect.objectContaining({
        key: 'system.pericias.furt.bonus',
        value: 3,
        type: 'add',
      }),
    ]);

    // Bônus de raça: sem item para carregá-lo, vira efeito do ator.
    expect(json.effects).toHaveLength(1);
    expect(json.effects[0]).toMatchObject({ name: 'Humano', disabled: false });
    expect(json.effects[0].system.changes).toEqual([
      expect.objectContaining({ key: 'system.pericias.perc.bonus', value: 1 }),
    ]);

    expect(json.system.pericias).toMatchObject({ vont: { outros: -2 } });
    // Defesa 17 = 10 (base) + 1 (Des) + 2 (efeito) + 4 (resto, em `outros`).
    expect(data(json.system.attributes).defesa).toMatchObject({ outros: 4 });
  });

  it('Esgrima Mágica vira opção de ataque que troca Luta por Atuação', () => {
    const sheet = createMockCharacterSheet();
    sheet.classPowers = [{ name: 'Esgrima Mágica', text: 'texto' }];

    const json = convertToFoundry(sheet);
    expectValidItems(json.items);

    const [power] = ofType(json, 'poder');
    expect(power.effects).toHaveLength(1);
    expect(power.effects[0]).toMatchObject({
      disabled: true,
      system: {
        onuse: true,
        abilityUse: { types: ['attack'], custo: null },
        changes: [{ key: 'pericia', value: 'atua', type: 'override' }],
      },
    });
  });

  it('arma leve sai como empunhadura leve, que o sistema usa na Acuidade', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag.getEquipments().Arma.push({
      nome: 'Adaga Leve',
      group: 'Arma',
      dano: '1d4',
      weaponTags: ['leve'],
    });
    sheet.bag.getEquipments().Arma.push({
      nome: 'Montante',
      group: 'Arma',
      dano: '2d6',
      twoHanded: true,
      weaponTags: ['leve'],
    });

    const armas = ofType(convertToFoundry(sheet), 'arma');
    const leve = armas.find((item) => item.name === 'Adaga Leve');
    const duas = armas.find((item) => item.name === 'Montante');

    expect(leve?.system.empunhadura).toBe('leve');
    // Duas mãos tem precedência: não existe arma de duas mãos "leve".
    expect(duas?.system.empunhadura).toBe('duas');
  });

  it('exporta as tags de arma que existem como propriedade no sistema', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag.getEquipments().Arma.push({
      nome: 'Lança Ágil',
      group: 'Arma',
      dano: '1d6',
      // `espada` é conceito nosso (elegibilidade de poder) e não tem par.
      weaponTags: ['agil', 'alongada', 'espada'],
    });

    const [weapon] = ofType(convertToFoundry(sheet), 'arma').filter(
      (item) => item.name === 'Lança Ágil'
    );
    expect(weapon.system.propriedades).toEqual({ agi: true, alo: true });
  });

  it('arma e escudo equipados disputam os slots de mão; armadura vai no corpo', () => {
    const sheet = createMockCharacterSheet();
    const bag = sheet.bag.getEquipments();
    bag.Arma.push({ nome: 'Espada', group: 'Arma', dano: '1d8', id: 'w1' });
    bag.Escudo.push({
      nome: 'Escudo',
      group: 'Escudo',
      defenseBonus: 2,
      armorPenalty: 0,
      id: 's1',
    });
    bag.Armadura.push({
      nome: 'Couro',
      group: 'Armadura',
      defenseBonus: 2,
      armorPenalty: 0,
      id: 'a1',
    });
    sheet.mainHandItemId = 'w1';
    sheet.offHandItemId = 's1';
    sheet.wornArmorId = 'a1';

    const json = convertToFoundry(sheet);
    const slotOf = (name: string) =>
      data(
        json.items.find((item) => item.name === name)?.system.equipado2 ?? null
      );

    // `.1` = grupo das mãos, `.2` = corpo; a parte inteira é o índice.
    expect(slotOf('Espada')).toMatchObject({ type: 'hand', slot: 1.1 });
    expect(slotOf('Escudo')).toMatchObject({ type: 'hand', slot: 2.1 });
    expect(slotOf('Couro')).toMatchObject({ type: 'body', slot: 1.2 });
  });

  it('arma de duas mãos equipada ocupa as duas mãos', () => {
    const sheet = createMockCharacterSheet();
    const bag = sheet.bag.getEquipments();
    bag.Arma.push({
      nome: 'Montante',
      group: 'Arma',
      dano: '2d6',
      twoHanded: true,
      id: 'w1',
    });
    sheet.mainHandItemId = 'w1';

    const json = convertToFoundry(sheet);
    const weapon = json.items.find((item) => item.name === 'Montante');
    // 12.1 é o slot que o sistema reserva para as duas mãos.
    expect(data(weapon?.system.equipado2 ?? null).slot).toBe(12.1);
  });

  it('respeita a perícia de ataque escolhida na arma', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag.getEquipments().Arma.push({
      nome: 'Florete',
      group: 'Arma',
      dano: '1d6',
      critico: '18',
      customSkill: Skill.ATUACAO,
    });

    const [weapon] = ofType(convertToFoundry(sheet), 'arma').filter(
      (item) => item.name === 'Florete'
    );
    expect(rollsOf(weapon)[0].parts[1][0]).toBe('atua');
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
