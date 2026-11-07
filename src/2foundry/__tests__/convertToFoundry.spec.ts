// `_id`/`_stats` são nomes de campo do Foundry, não escolha nossa.
/* eslint-disable no-underscore-dangle */
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { Armas } from '../../data/systems/tormenta20/equipamentos';
import generateRandomSheet from '../../functions/general';
import { getSkillTotal } from '../../functions/skills/skillTotal';
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
import { parseCritical, splitWeaponDamage } from '../items/equipment';
import { FOUNDRY_SKILLS, getTrainingBonus } from '../skills';
import {
  FoundryData,
  FoundryEffect,
  FoundryItem,
  FoundryJSON,
  FoundryRoll,
} from '../types';

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

/** Efeitos que o Foundry aplica ao ator: os dele e os transferidos dos itens. */
const appliedEffects = (json: FoundryJSON): FoundryEffect[] =>
  [
    ...json.effects,
    ...json.items.flatMap((item) => item.effects).filter((e) => e.transfer),
  ].filter((effect) => !effect.disabled && !effect.system.onuse);

const sumChanges = (json: FoundryJSON, keys: string[]): number =>
  appliedEffects(json)
    .flatMap((effect) => effect.system.changes)
    .filter((change) => keys.includes(change.key))
    .reduce((sum, change) => sum + Number(change.value), 0);

/** `prepareAtributos` do sistema: base + racial + bônus dos efeitos ligados. */
const foundryAttribute = (json: FoundryJSON, key: string): number => {
  const attribute = data(data(json.system.atributos)[key]);
  return (
    Number(attribute.base) +
    Number(attribute.racial) +
    sumChanges(json, [`system.atributos.${key}.bonus`])
  );
};

const SIZE_MODIFIERS: Record<string, number> = {
  min: 5,
  peq: 2,
  med: 0,
  gra: -2,
  eno: -5,
  col: -10,
};

/** `prepareSkill` do sistema sobre o JSON exportado. */
const foundrySkillTotal = (json: FoundryJSON, key: string): number => {
  const skill = data(data(json.system.pericias)[key]);
  const level = ofType(json, 'classe').reduce(
    (sum, item) => sum + Number(item.system.niveis),
    0
  );
  const armorPenalty = ofType(json, 'equipamento')
    .filter((item) => item.system.equipado)
    .reduce(
      (sum, item) => sum + Number(data(item.system.armadura).penalidade ?? 0),
      0
    );
  const size = String(data(json.system.tracos).tamanho);
  return (
    Math.floor(level / 2) +
    foundryAttribute(json, String(skill.atributo)) +
    (skill.treinado ? getTrainingBonus(level) : 0) +
    sumChanges(json, [
      `system.pericias.${key}.bonus`,
      'system.pericias.*.bonus',
    ]) +
    (skill.pda ? armorPenalty : 0) +
    (skill.size ? SIZE_MODIFIERS[size] ?? 0 : 0) +
    Number(skill.outros)
  );
};

const weaponNamed = (json: FoundryJSON, name: string) =>
  ofType(json, 'arma').find((item) => item.name === name) as FoundryItem;

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
    // O recálculo soma os bônus de perícia no `others` da ficha.
    const skillOthers: Partial<Record<Skill, number>> = {
      [Skill.FURTIVIDADE]: 3,
      [Skill.PERCEPCAO]: 1,
      [Skill.VONTADE]: -2,
    };
    sheet.completeSkills = sheet.completeSkills?.map((skill) => ({
      ...skill,
      others: skillOthers[skill.name] ?? 0,
    }));

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

    // Os bônus que viraram efeito não se repetem no `outros`; a condição, sem
    // efeito, fica nele.
    expect(json.system.pericias).toMatchObject({
      furt: { outros: 0 },
      perc: { outros: 0 },
      vont: { outros: -2 },
    });
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

  it.each([
    ['Guerreiro', 6],
    ['Arcanista', 5],
    ['Ladino', 8],
  ])(
    'perícias de um %s chegam ao Foundry com o total da ficha',
    (classe, nivel) => {
      const sheet = generate(classe, Number(nivel));
      const json = convertToFoundry(sheet);

      (sheet.completeSkills ?? []).forEach((skill) => {
        const key = FOUNDRY_SKILLS[skill.name];
        if (!key) return;
        expect([skill.name, foundrySkillTotal(json, key)]).toEqual([
          skill.name,
          getSkillTotal(sheet, skill),
        ]);
      });
    }
  );

  it('ocupa o slot de raça com um item zerado, sem somar a raça de novo', () => {
    const sheet = generate('Guerreiro', 1);
    const json = convertToFoundry(sheet);

    const races = ofType(json, 'race');
    expect(races).toHaveLength(1);
    expect(races[0]).toMatchObject({
      name: sheet.raca.name,
      system: {
        atributos: { for: 0, des: 0, con: 0, int: 0, sab: 0, car: 0 },
        grants: [],
        skills: [],
      },
    });
    // O atributo racial já está no `base`.
    Object.entries(ATTRIBUTE_KEYS).forEach(([name, key]) => {
      expect(foundryAttribute(json, key)).toBe(
        sheet.atributos[name as Atributo].value
      );
    });
  });

  it('o ajuste manual de atributos sai como efeito ligado no ator', () => {
    const sheet = createMockCharacterSheet();
    sheet.bonusAtributos = { [Atributo.FORCA]: 2 };
    sheet.atributosTemporarios = { [Atributo.FORCA]: 2 };

    const json = convertToFoundry(sheet);
    const manual = json.effects.find(
      (effect) => effect.name === 'Ajuste manual de atributos'
    );
    expect(manual).toMatchObject({ disabled: false });
    expect(manual?.system.changes).toEqual([
      expect.objectContaining({ key: 'system.atributos.for.bonus', value: 2 }),
    ]);
    expect(
      json.effects.find((effect) => effect.name === 'Efeitos ativos da ficha')
    ).toBeUndefined();
    expect(foundryAttribute(json, 'for')).toBe(
      sheet.atributos[Atributo.FORCA].value + 2
    );
  });

  it('delta de atributo de efeito ativo vira efeito e não entra na Defesa duas vezes', () => {
    const sheet = createMockCharacterSheet();
    const dex = sheet.atributos[Atributo.DESTREZA].value;
    sheet.atributosTemporarios = { [Atributo.DESTREZA]: 2 };
    sheet.defesa = 10 + dex + 2;

    const json = convertToFoundry(sheet);
    const active = json.effects.find(
      (effect) => effect.name === 'Efeitos ativos da ficha'
    );
    expect(active).toMatchObject({ disabled: false });
    expect(foundryAttribute(json, 'des')).toBe(dex + 2);
    // O Foundry soma o +2 pela Destreza: nada dele fica no `outros`.
    expect(data(json.system.attributes).defesa).toMatchObject({ outros: 0 });
  });

  it('a CD das magias leva os bônus da ficha; engenhoca usa Inteligência', () => {
    const sheet = createMockCharacterSheet();
    sheet.bonusSpellDC = 1;
    sheet.sheetBonuses = [
      {
        source: { type: 'power', name: 'Poder de Teste' },
        target: { type: 'SpellDC' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ];
    sheet.overrideKeyAttribute = Atributo.CARISMA;
    const base = {
      execucao: 'Padrão',
      alcance: 'Curto',
      alvo: '1 criatura',
      duracao: 'Instantânea',
      resistencia: 'Vontade anula',
      description: '',
      spellCircle: spellsCircles.c1,
      school: 'Evoc' as const,
    };
    sheet.spells = [
      { ...base, nome: 'Magia Comum' },
      {
        ...base,
        nome: 'Engenhoca',
        engenhoca: { aparatos: ['estabilizador'] },
      },
    ];

    const json = convertToFoundry(sheet);
    const spell = (name: string) =>
      data(
        ofType(json, 'magia').find((item) => item.name.startsWith(name))?.system
          .resistencia ?? null
      );
    expect(spell('Magia Comum')).toMatchObject({ atributo: 'car', bonus: 3 });
    // +2 do Estabilizador.
    expect(spell('Engenhoca')).toMatchObject({ atributo: 'int', bonus: 5 });
  });

  it('magias da lista derivada (Usurpar) também saem', () => {
    const sheet = createMockCharacterSheet();
    sheet.classe = {
      ...sheet.classe,
      spellPath: {
        initialSpells: 0,
        spellType: 'Divine',
        keyAttribute: Atributo.CARISMA,
        spellAccess: 'allOfType',
        qtySpellsLearnAtLevel: () => 0,
        spellCircleAvailableAtLevel: () => 1,
      },
    };

    const spells = ofType(convertToFoundry(sheet), 'magia');
    expect(spells.length).toBeGreaterThan(10);
    // Lista enorme: não vai para os favoritos.
    spells.forEach((item) => expect(item.flags).toEqual({}));
  });

  it('dano de uma e de duas mãos vira adaptável; dano igual, arma dupla', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag
      .getEquipments()
      .Arma.push(
        { ...Armas.ESPADA_BASTARDA },
        { nome: 'Bordão', group: 'Arma', dano: '1d6/1d6' }
      );

    const json = convertToFoundry(sheet);
    const bastarda = weaponNamed(json, 'Espada Bastarda');
    const [, damage] = rollsOf(bastarda);
    expect(damage.parts[0][0]).toBe('1d10');
    expect(damage.adaptavel).toBe('1d12');
    expect(bastarda.system.propriedades).toMatchObject({ ada: true });

    const bordao = weaponNamed(json, 'Bordão');
    expect(rollsOf(bordao)[1].parts[0][0]).toBe('1d6');
    expect(bordao.system.propriedades).toMatchObject({ dup: true });
  });

  it('arma sem proficiência leva −5 e o atributo de ataque nunca fica em branco', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag
      .getEquipments()
      .Arma.push(
        { ...Armas.ESPADA_BASTARDA, atkBonus: 1 },
        { nome: 'Adaga', group: 'Arma', dano: '1d4', weaponTags: ['leve'] }
      );

    const json = convertToFoundry(sheet);
    // A ficha de teste não tem proficiência com armas exóticas.
    expect(rollsOf(weaponNamed(json, 'Espada Bastarda'))[0].parts[2][0]).toBe(
      '-4'
    );
    ofType(json, 'arma').forEach((weapon) =>
      expect(rollsOf(weapon)[0].parts[1][1]).toMatch(
        /^(for|des|con|int|sab|car)$/
      )
    );
  });

  it('armas em mãos e magias vão para os favoritos da ficha', () => {
    const sheet = createMockCharacterSheet();
    sheet.bag
      .getEquipments()
      .Arma.push(
        { nome: 'Espada', group: 'Arma', dano: '1d8', id: 'w1' },
        { nome: 'Arco', group: 'Arma', dano: '1d6', id: 'w2' }
      );
    sheet.mainHandItemId = 'w1';
    sheet.spells = [
      {
        nome: 'Magia Que Não Existe',
        execucao: 'Padrão',
        alcance: 'Curto',
        alvo: '1 criatura',
        duracao: 'Instantânea',
        description: '',
        spellCircle: spellsCircles.c1,
        school: 'Evoc',
      },
    ];

    const json = convertToFoundry(sheet);
    const favorite = { tormenta20: { favorito: true } };
    expect(weaponNamed(json, 'Espada').flags).toEqual(favorite);
    expect(weaponNamed(json, 'Arco').flags).toEqual({});
    expect(ofType(json, 'magia')[0].flags).toEqual(favorite);
  });

  it('descrição de aprimoramento com várias linhas sai num elemento só', () => {
    const sheet = createMockCharacterSheet();
    sheet.spells = [
      {
        nome: 'Magia Que Não Existe',
        execucao: 'Padrão',
        alcance: 'Curto',
        alvo: '1 criatura',
        duracao: 'Instantânea',
        description: '',
        spellCircle: spellsCircles.c1,
        school: 'Evoc',
        aprimoramentos: [{ addPm: 1, text: 'linha um\nlinha <dois>' }],
      },
    ];

    const [effect] = ofType(convertToFoundry(sheet), 'magia')[0].effects;
    // Até a 1.6.5 o diálogo de uso quebra com mais de um elemento raiz.
    expect(effect.description).toBe('<p>linha um<br>linha &lt;dois&gt;</p>');
  });

  it('carimba a versão alvo, limita a carga e desliga as melhorias nas duas chaves', () => {
    const sheet = createMockCharacterSheet();
    sheet.maxSpaces = 0;
    sheet.nome = '  ';
    sheet.bag.getEquipments().Arma.push({
      nome: 'Espada',
      group: 'Arma',
      dano: '1d8',
      modifications: [{ mod: 'Certeira' }],
    } as unknown as (typeof Armas)['ESPADA_BASTARDA']);

    const json = convertToFoundry(sheet);
    expect(json._stats.systemVersion).toBe('1.6.6');
    expect(json.name).toBe('Personagem');
    expect(
      Number(data(data(json.system.attributes).carga).base)
    ).toBeGreaterThanOrEqual(1);
    expect(weaponNamed(json, 'Espada').system).toMatchObject({
      enableAutoUpgrades: false,
      upgrades: { enableAutoUpgrades: false },
    });
  });
});

describe('splitWeaponDamage', () => {
  it.each([
    ['1d8', { dice: '1d8', double: false }],
    ['1d10/1d12', { dice: '1d10', adaptable: '1d12', double: false }],
    ['2d4/2d4', { dice: '2d4', double: true }],
    [undefined, { dice: '', double: false }],
  ])('%s', (dano, expected) => {
    expect(splitWeaponDamage(dano)).toEqual(expected);
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
