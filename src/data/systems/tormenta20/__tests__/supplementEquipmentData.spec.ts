import { dataRegistry } from '../../../registry';
import { SupplementId } from '../../../../types/supplement.types';
import Equipment from '../../../../interfaces/Equipment';
import { BonusConditionClause } from '../../../../interfaces/CharacterSheet';

/**
 * Invariantes do DADO de equipamento — não de item específico.
 *
 * A passada de cadastro dos suplementos toca centenas de objetos escritos à
 * mão; estes testes pegam a classe de erro que passa silenciosa: `equipmentName`
 * copiado do item vizinho, bônus que o motor descarta sem avisar, e bônus de
 * armadura que valeriam com a peça guardada na mochila.
 */
const ALL: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_DEUSES_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const catalog = dataRegistry.getEquipmentBySupplements(ALL);

const allItems: Equipment[] = [
  ...catalog.weapons,
  ...catalog.armors,
  ...catalog.shields,
  ...catalog.generalItems,
  ...catalog.esoteric,
  ...catalog.clothing,
  ...catalog.alchemy,
  ...catalog.food,
  ...catalog.animals,
];

const defenseItems: Equipment[] = [...catalog.armors, ...catalog.shields];

const clausesOf = (item: Equipment): BonusConditionClause[] =>
  (item.sheetBonuses ?? []).flatMap((b) => b.condition?.clauses ?? []);

describe('dados de equipamento', () => {
  it('todo sheetBonus de item credita o próprio item na origem', () => {
    const wrong = allItems.flatMap((item) =>
      (item.sheetBonuses ?? [])
        .filter(
          (bonus) =>
            bonus.source.type === 'equipment' &&
            bonus.source.equipmentName !== item.nome
        )
        .map(
          (bonus) =>
            `${item.nome} → ${
              bonus.source.type === 'equipment'
                ? bonus.source.equipmentName
                : '?'
            }`
        )
    );
    expect(wrong).toEqual([]);
  });

  it('nenhum item emite RD por sheetBonuses (é descartada em silêncio)', () => {
    // `applyEquipmentBonuses` filtra `DamageReduction` de propósito: a RD de
    // armadura sai de `getDefenseMaterialRd`, só da peça VESTIDA.
    const offenders = allItems
      .filter((item) =>
        (item.sheetBonuses ?? []).some(
          (bonus) => bonus.target.type === 'DamageReduction'
        )
      )
      .map((item) => item.nome);
    expect(offenders).toEqual([]);
  });

  it('toda condição wearingArmorNamed aponta para uma armadura existente', () => {
    const names = new Set(defenseItems.map((item) => item.nome));
    const dangling = allItems.flatMap((item) =>
      clausesOf(item)
        .filter(
          (clause) =>
            clause.kind === 'wearingArmorNamed' && !names.has(clause.value)
        )
        .map((clause) =>
          clause.kind === 'wearingArmorNamed'
            ? `${item.nome} → ${clause.value}`
            : ''
        )
    );
    expect(dangling).toEqual([]);
  });

  it('armadura/escudo com bônus só vale enquanto vestido/empunhado', () => {
    const unconditional = defenseItems
      .filter((item) => (item.sheetBonuses ?? []).length > 0)
      .filter((item) =>
        (item.sheetBonuses ?? []).some(
          (bonus) =>
            !bonus.condition ||
            !bonus.condition.clauses.some(
              (clause) =>
                clause.kind === 'wearingArmorNamed' ||
                clause.kind === 'wearingArmor' ||
                clause.kind === 'wieldingItemNamed' ||
                clause.kind === 'wieldingShield'
            )
        )
      )
      .map((item) => item.nome);
    expect(unconditional).toEqual([]);
  });

  it('a condição nomeia a própria peça, não a vizinha', () => {
    const mismatched = defenseItems.flatMap((item) =>
      clausesOf(item)
        .filter(
          (clause) =>
            clause.kind === 'wearingArmorNamed' && clause.value !== item.nome
        )
        .map(() => item.nome)
    );
    expect(mismatched).toEqual([]);
  });

  it('todas as armaduras e escudos dos suplementos têm descrição', () => {
    const supplementDefenses = defenseItems.filter((item) =>
      [
        'Armadura sensual',
        'Armadura de folhas',
        'Armadura de engenhoqueiro goblin',
        'Cota de moedas',
        'Colete fora da lei',
        'Brigantina',
        'Armadura de chumbo',
        'Armadura de justa',
        'Armadura de hussardo alado',
        'Armadura de pedra',
        'Broquel',
        'Escudo de vime',
        'Escudo torre',
        'Sagna',
        'Armadura de ossos',
        'Veste de teia de aranha',
        'Armadura de quitina',
        'Escudo de couro',
      ].includes(item.nome)
    );

    expect(supplementDefenses).toHaveLength(18);
    const semDescricao = supplementDefenses
      .filter((item) => !item.descricao)
      .map((item) => item.nome);
    expect(semDescricao).toEqual([]);
  });
});
