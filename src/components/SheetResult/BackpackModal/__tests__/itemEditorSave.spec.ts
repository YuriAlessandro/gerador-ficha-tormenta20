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
  weaponCategory: '',
  actionDamageAttributes: {},
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
