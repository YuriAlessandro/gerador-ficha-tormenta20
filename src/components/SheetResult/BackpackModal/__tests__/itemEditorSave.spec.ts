import Equipment, { DefenseEquipment } from '../../../../interfaces/Equipment';
import { applyItemEnhancements } from '../../../../functions/itemEnhancements/applyEnhancements';
import {
  buildSavedItem,
  ItemEditorFormState,
  StatField,
} from '../itemEditorSave';

/**
 * Regressão do bug "Reforçada +2/+2" (e das demais mods numéricas na primeira
 * aplicação): o editor gravava os valores PREVIEWADOS (base+delta) do form nos
 * campos do item mesmo sem edição manual; `applyItemEnhancements` então
 * capturava o valor inflado como `base*` e somava o delta de novo. O fix
 * (gating por grupo em buildSavedItem) só grava os campos de stat quando o
 * usuário os editou manualmente.
 */
const mkForm = (
  overrides: Partial<ItemEditorFormState> = {}
): ItemEditorFormState => ({
  customDisplayName: '',
  quantityText: '1',
  spacesText: '',
  descricao: '',
  rolls: [],
  danoText: '',
  atkBonusText: '0',
  criticoText: 'x2',
  customSkill: '',
  damageAttribute: 'Nenhum',
  attackAttribute: '',
  weaponCategory: '',
  damageTypes: [],
  damageTypesTouched: false,
  purpose: 'melee',
  reach: 'Curto',
  ammoType: '',
  purposeTouched: false,
  ammoPackSizeText: '20',
  ammoUnitsPerSpaceText: '20',
  weaponTags: [],
  actionDamageAttributes: {},
  actionAttackAttributes: {},
  defenseBonusText: '0',
  armorPenaltyText: '0',
  isHeavyArmor: false,
  selectedModifications: [],
  selectedMaterial: '',
  selectedEnchantments: [],
  selectedConjuradoraSpell: '',
  userExtraDamage: [],
  ...overrides,
});

const save = (
  item: Equipment,
  form: ItemEditorFormState,
  manual: StatField[] = []
): Equipment =>
  applyItemEnhancements(buildSavedItem(item, form, new Set(manual)));

describe('buildSavedItem — Reforçada aplica +1/+1 (não +2/+2)', () => {
  const brunea: DefenseEquipment = {
    nome: 'Brunea',
    group: 'Armadura',
    defenseBonus: 5,
    armorPenalty: 3,
    spaces: 3,
  };

  it('armadura pristina + Reforçada sem edição manual → +1 Defesa / +1 penalidade', () => {
    // O form carrega os valores previewados (base+1) — devem ser IGNORADOS
    // porque o usuário não editou os campos manualmente.
    const form = mkForm({
      selectedModifications: [{ min: 0, max: 0, mod: 'Reforçada' }],
      defenseBonusText: '6',
      armorPenaltyText: '4',
    });
    const result = save(brunea, form) as DefenseEquipment;
    expect(result.defenseBonus).toBe(6);
    expect(result.armorPenalty).toBe(4);
    expect(result.baseDefenseBonus).toBe(5);
    expect(result.baseArmorPenalty).toBe(3);
  });
});

describe('buildSavedItem — mods de arma na primeira aplicação', () => {
  const espadaLonga: Equipment = {
    nome: 'Espada Longa',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
    atkBonus: 0,
    spaces: 1,
  };

  it('Certeira sem edição manual → +1 no atkBonus (não +2)', () => {
    const form = mkForm({
      selectedModifications: [{ min: 0, max: 0, mod: 'Certeira' }],
      atkBonusText: '1', // preview base+1
    });
    const result = save(espadaLonga, form);
    expect(result.atkBonus).toBe(1);
    expect(result.baseAtkBonus).toBe(0);
  });

  it('caso misto: dano editado manualmente + Certeira → dano manual preservado, +1 no atk', () => {
    const form = mkForm({
      selectedModifications: [{ min: 0, max: 0, mod: 'Certeira' }],
      danoText: '2d6', // edição manual
      atkBonusText: '1', // preview base+1 (campo não tocado)
      criticoText: 'x2',
    });
    const result = save(espadaLonga, form, ['dano']);
    expect(result.dano).toBe('2d6');
    expect(result.atkBonus).toBe(1);
    expect(result.hasManualEdits).toBe(true);
  });

  it('remover todos os mods restaura os valores base', () => {
    // Item que já passou pelo pipeline com Certeira (base capturada).
    const withCerteira: Equipment = {
      ...espadaLonga,
      atkBonus: 1,
      baseAtkBonus: 0,
      baseDano: '1d8',
      baseSheetBonuses: [],
      modifications: [{ mod: 'Certeira' }],
    };
    const form = mkForm({ selectedModifications: [] });
    const result = save(withCerteira, form);
    expect(result.atkBonus).toBe(0);
    expect(result.modifications).toBeUndefined();
  });
});

describe('buildSavedItem — categoria de proficiência (weaponCategory)', () => {
  const espadaLonga: Equipment = {
    nome: 'Espada Longa',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
    atkBonus: 0,
    spaces: 1,
    weaponCategory: 'martial',
  };

  it('categoria escolhida no form é persistida', () => {
    const result = save(espadaLonga, mkForm({ weaponCategory: 'exotic' }));
    expect(result.weaponCategory).toBe('exotic');
  });

  it("'' (Padrão) limpa o override — undefined herda do catálogo", () => {
    const result = save(espadaLonga, mkForm({ weaponCategory: '' }));
    expect(result.weaponCategory).toBeUndefined();
  });

  it('editar categoria não marca hasManualEdits', () => {
    const result = save(espadaLonga, mkForm({ weaponCategory: 'simple' }));
    expect(result.hasManualEdits).toBeUndefined();
  });
});

describe('buildSavedItem — atributo no ataque (attackAttribute)', () => {
  const mordida: Equipment = {
    nome: 'Mordida',
    group: 'Arma',
    dano: '1d4',
    critico: 'x2',
    spaces: 0,
    preco: 0,
    specialActions: [
      { id: 'corpo', label: 'Corpo a corpo', skill: 'Luta' },
      { id: 'bote', label: 'Bote', skill: 'Luta', dano: '1d6' },
    ],
  };

  it('atributo escolhido no form é persistido', () => {
    const result = save(mordida, mkForm({ attackAttribute: 'Sabedoria' }));
    expect(result.attackAttribute).toBe('Sabedoria');
  });

  it("'' (Padrão) limpa o override — undefined usa o atributo da perícia", () => {
    const result = save(
      { ...mordida, attackAttribute: 'Sabedoria' },
      mkForm({ attackAttribute: '' })
    );
    expect(result.attackAttribute).toBeUndefined();
  });

  it("'Nenhum' é um valor legítimo, não um 'limpar'", () => {
    const result = save(mordida, mkForm({ attackAttribute: 'Nenhum' }));
    expect(result.attackAttribute).toBe('Nenhum');
  });

  // Crítico: se `hasManualEdits` ligasse aqui, `applyWeaponBonuses` pararia de
  // bakear Fúria/encantos nesta arma e o jogador perderia bônus em silêncio.
  it('editar atributo de ataque NÃO marca hasManualEdits', () => {
    const result = save(mordida, mkForm({ attackAttribute: 'Destreza' }));
    expect(result.hasManualEdits).toBeUndefined();
  });

  it('override por modo de ataque é gravado e limpo de forma independente', () => {
    const result = save(
      mordida,
      mkForm({
        actionAttackAttributes: { corpo: 'Destreza', bote: '' },
      })
    );
    expect(result.specialActions?.[0].attackAttribute).toBe('Destreza');
    expect(result.specialActions?.[1].attackAttribute).toBeUndefined();
  });
});

/**
 * Regressão do bug "não consigo zerar o espaço de alguns itens": `applyDelta`
 * reescrevia `spaces` a partir de `baseSpaces` a cada passagem pelo pipeline,
 * fora do guard de edições manuais. Como o pipeline só roda em itens que já
 * tiveram alguma melhoria/encanto/dano extra, o valor digitado grudava em uns
 * itens e era revertido em outros — daí o "alguns".
 */
describe('buildSavedItem — espaços editados à mão', () => {
  const espadaLonga: Equipment = {
    nome: 'Espada Longa',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
    atkBonus: 0,
    spaces: 1,
  };

  /** Arma que já passou pelo pipeline: tem os snapshots `base*` gravados. */
  const jaEnriquecida: Equipment = {
    ...espadaLonga,
    baseSpaces: 1,
    baseAtkBonus: 0,
    baseDano: '1d8',
    baseSheetBonuses: [],
    modifications: [{ mod: 'Certeira' }],
  };

  it('zerar o espaço de um item com melhoria persiste (não volta ao base)', () => {
    const result = save(jaEnriquecida, mkForm({ spacesText: '0' }), ['spaces']);
    expect(result.spaces).toBe(0);
    expect(result.hasManualSpaces).toBe(true);
  });

  it('espaço manual sobrevive a recálculos posteriores da ficha', () => {
    const saved = save(jaEnriquecida, mkForm({ spacesText: '0' }), ['spaces']);
    // `recalculateSheet` reaplica o pipeline em todo item da mochila.
    expect(applyItemEnhancements(saved).spaces).toBe(0);
    expect(applyItemEnhancements(applyItemEnhancements(saved)).spaces).toBe(0);
  });

  it('editar espaço NÃO congela os stats de combate', () => {
    const result = save(jaEnriquecida, mkForm({ spacesText: '0' }), ['spaces']);
    expect(result.hasManualEdits).toBeUndefined();
  });

  it('sem edição manual o espaço continua sendo recalculado do base', () => {
    const result = save(jaEnriquecida, mkForm({ spacesText: '1' }));
    expect(result.hasManualSpaces).toBeUndefined();
    expect(result.spaces).toBe(1);
  });

  it('texto inválido não grava NaN — cai no valor atual do item', () => {
    const result = save(espadaLonga, mkForm({ spacesText: 'abc' }), ['spaces']);
    expect(result.spaces).toBe(1);
    expect(Number.isNaN(result.spaces)).toBe(false);
  });

  it('valor negativo é aparado em 0', () => {
    const result = save(espadaLonga, mkForm({ spacesText: '-3' }), ['spaces']);
    expect(result.spaces).toBe(0);
  });
});

/**
 * `manualStatFields` diz QUAIS estatísticas o jogador digitou. `hasManualEdits`
 * continua congelando o grupo inteiro (é o que o motor lê), mas a ficha só
 * sublinha o campo de fato editado.
 */
describe('buildSavedItem — manualStatFields', () => {
  const espada: Equipment = {
    nome: 'Espada Longa',
    group: 'Arma',
    dano: '1d8',
    critico: 'x2',
    atkBonus: 0,
    spaces: 1,
  };

  it('grava só o campo digitado', () => {
    const result = buildSavedItem(
      espada,
      mkForm({ danoText: '1d10', criticoText: 'x2', atkBonusText: '0' }),
      new Set<StatField>(['dano'])
    );

    expect(result.hasManualEdits).toBe(true);
    expect(result.manualStatFields).toEqual(['dano']);
  });

  it('reabrir e salvar não promove o grupo inteiro a manual', () => {
    // Ao reabrir um item congelado o editor restaura o grupo em
    // `manualEditedFields` (para o preview não sobrescrever o valor gravado),
    // mas nada foi digitado desta vez.
    const jaEditada: Equipment = {
      ...espada,
      hasManualEdits: true,
      manualStatFields: ['dano'],
    };

    const result = buildSavedItem(
      jaEditada,
      mkForm({ danoText: '1d10' }),
      new Set<StatField>(['dano', 'atkBonus', 'critico']),
      new Set<StatField>()
    );

    expect(result.manualStatFields).toEqual(['dano']);
  });

  it('acumula o campo digitado numa segunda edição', () => {
    const jaEditada: Equipment = {
      ...espada,
      hasManualEdits: true,
      manualStatFields: ['dano'],
    };

    const result = buildSavedItem(
      jaEditada,
      mkForm({ danoText: '1d10', criticoText: '19/x2' }),
      new Set<StatField>(['dano', 'atkBonus', 'critico']),
      new Set<StatField>(['critico'])
    );

    expect(result.manualStatFields).toEqual(['dano', 'critico']);
  });

  it('item legado (flag sem lista) conta como grupo inteiro editado', () => {
    const legado: Equipment = { ...espada, hasManualEdits: true };

    const result = buildSavedItem(
      legado,
      mkForm({ danoText: '1d10' }),
      new Set<StatField>(['dano', 'atkBonus', 'critico']),
      new Set<StatField>()
    );

    expect(result.manualStatFields).toEqual(['dano', 'atkBonus', 'critico']);
  });

  it('sem edição manual nenhuma, o campo some do item', () => {
    const result = buildSavedItem(espada, mkForm(), new Set<StatField>());

    expect(result.hasManualEdits).toBeUndefined();
    expect(result.manualStatFields).toBeUndefined();
  });
});

/**
 * `applyItemEnhancements` restaura `arremesso` e `specialActions` a partir de
 * `baseArremesso`/`baseSpecialActions`, congelados na PRIMEIRA passagem do
 * pipeline. Numa arma que já teve melhoria ou encanto esses snapshots já
 * existem, então trocar o tipo de ataque no editor sem reescrevê-los seria
 * revertido em silêncio no save.
 */
describe('buildSavedItem — tipo de ataque sobrevive ao pipeline de aprimoramentos', () => {
  const adagaEncantada: Equipment = {
    nome: 'Adaga',
    group: 'Arma',
    dano: '1d4',
    critico: '19',
    spaces: 1,
    alcance: 'Curto',
    arremesso: true,
    specialActions: [
      { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
      {
        id: 'arremessar',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Força',
      },
    ],
    // Snapshots já congelados por uma passagem anterior do pipeline.
    baseArremesso: true,
    baseSpecialActions: [
      { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
      {
        id: 'arremessar',
        label: 'Arremessar',
        skill: 'Pontaria',
        damageAttribute: 'Força',
      },
    ],
    baseSheetBonuses: [],
  };

  it('trocar arremesso → disparo não é revertido pelo pipeline', () => {
    const result = save(
      adagaEncantada,
      mkForm({
        purpose: 'firing',
        reach: 'Médio',
        ammoType: 'Flechas',
        purposeTouched: true,
      })
    );

    expect(result.alcance).toBe('Médio');
    expect(result.arremesso).toBeUndefined();
    expect(result.specialActions).toBeUndefined();
    expect(result.ammoType).toBe('Flechas');
    // Os snapshots acompanham, senão o próximo recálculo reverteria.
    expect(result.baseArremesso).toBe(false);
    expect(result.baseSpecialActions).toEqual([]);
  });

  it('trocar disparo → corpo a corpo também sobrevive', () => {
    const arco: Equipment = {
      nome: 'Arco Curto',
      group: 'Arma',
      dano: '1d6',
      alcance: 'Médio',
      ammoType: 'Flechas',
      baseArremesso: false,
      baseSpecialActions: [],
      baseSheetBonuses: [],
    };

    const result = save(
      arco,
      mkForm({ purpose: 'melee', purposeTouched: true })
    );

    expect(result.alcance).toBe('-');
    expect(result.arremesso).toBeUndefined();
    // Munição some junto: corpo a corpo não atira nada.
    expect(result.ammoType).toBeUndefined();
  });

  it('sem purposeTouched, a classificação da arma fica intacta', () => {
    const result = save(adagaEncantada, mkForm({ purpose: 'firing' }));

    expect(result.alcance).toBe('Curto');
    expect(result.arremesso).toBe(true);
    expect(result.specialActions).toHaveLength(2);
  });

  it('editar item de munição grava tipo e tamanho de pacote', () => {
    const flechas: Equipment = {
      nome: 'Flechas élficas',
      group: 'Arma',
      isAmmo: true,
      isCustom: true,
      ammoType: 'Flechas',
      ammoPackSize: 20,
    };

    const result = save(
      flechas,
      mkForm({
        ammoType: 'Virotes',
        ammoPackSizeText: '10',
        ammoUnitsPerSpaceText: '5',
        // Munição ignora o propósito mesmo se ele vier marcado.
        purpose: 'firing',
        purposeTouched: true,
      })
    );

    expect(result.ammoType).toBe('Virotes');
    expect(result.ammoPackSize).toBe(10);
    expect(result.ammoUnitsPerSpace).toBe(5);
    // Munição não vira arma de disparo.
    expect(result.alcance).toBeUndefined();
  });
});
