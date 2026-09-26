import { TREASURE_DATASETS } from '@/data/treasure/treasureDatasets';
import { catalogItemInfo } from '../treasureItemInfo';
import {
  ND_ORDER,
  chooseTwoDice,
  createTreasureContext,
  rollTreasure,
} from '../treasureRoller';

describe('consulta ao catálogo (item-base)', () => {
  it('reconhece os nomes das tabelas', () => {
    expect(catalogItemInfo('Couro', 'armadura')).toMatchObject({
      armor: true,
      heavyArmor: false,
    });
    expect(catalogItemInfo('Completa', 'armadura')).toMatchObject({
      heavyArmor: true,
    });
    expect(catalogItemInfo('Escudo pesado', 'armadura')).toMatchObject({
      shield: true,
    });
    expect(catalogItemInfo('Arco curto', 'arma')).toMatchObject({
      firingNotSling: true,
    });
    expect(catalogItemInfo('Funda', 'arma')).toMatchObject({
      firingNotSling: false,
    });
    expect(catalogItemInfo('Balas (20)', 'arma')).toMatchObject({
      ammo: true,
    });
    expect(catalogItemInfo('Espada longa', 'arma')).toMatchObject({
      melee: true,
      cutOrPierce: true,
    });
  });

  it('nome desconhecido devolve undefined (vira aviso, não chute)', () => {
    expect(catalogItemInfo('Item que não existe', 'arma')).toBeUndefined();
  });
});

describe.each(Object.values(TREASURE_DATASETS))(
  'rolagens reais — $mode',
  (dataset) => {
    it('todo ND rola sem erro, inclusive escolhas 2D', () => {
      const ctx = createTreasureContext(dataset);
      ND_ORDER.forEach((nd) => {
        for (let i = 0; i < 150; i += 1) {
          const result = rollTreasure(ctx, nd, 'Dobro');
          result.items.forEach((item) => {
            if (item.choice && !item.detail) {
              const chosen = chooseTwoDice(ctx, item, item.choice.options[1]);
              expect(chosen.detail).toBeDefined();
            }
          });
        }
      });
    });
  }
);
