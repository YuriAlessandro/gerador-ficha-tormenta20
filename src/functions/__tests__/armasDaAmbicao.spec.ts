import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { normalizeSheet } from '../sheetNormalizer';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';
import GRANTED_POWERS from '../../data/systems/tormenta20/powers/grantedPowers';
import VALKARIA from '../../data/systems/tormenta20/divindades/valkaria';

/**
 * Cobre o poder concedido "Armas da Ambição" (Valkaria): o +1 em testes de
 * ataque entra nas perícias Luta e Pontaria (AllAttackBonus) — onde o jogador
 * espera vê-lo — e o +1 na margem de ameaça continua bakeado na arma. Também
 * cobre o refresh de definições stale em fichas salvas (normalizeSheet).
 */
describe('Armas da Ambição', () => {
  const WID = 'ambicao-test-weapon';

  const mkDevotoSheet = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.bag = new Bag({
      Arma: [
        {
          id: WID,
          nome: 'Espada (teste)',
          group: 'Arma',
          dano: '1d8',
          critico: '19/x2',
        },
      ],
    });
    sheet.devoto = {
      divindade: _.cloneDeep(VALKARIA),
      poderes: [_.cloneDeep(GRANTED_POWERS.ARMAS_DA_AMBICAO)],
    };
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    return sheet;
  };

  const skillOthers = (sheet: CharacterSheet, skill: Skill): number =>
    sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

  it('aplica +1 em Luta e Pontaria (others) no recálculo', () => {
    const recalculated = recalculateSheet(mkDevotoSheet());

    expect(skillOthers(recalculated, Skill.LUTA)).toBe(1);
    expect(skillOthers(recalculated, Skill.PONTARIA)).toBe(1);
  });

  it('não duplica o bônus no atkBonus da arma', () => {
    const recalculated = recalculateSheet(mkDevotoSheet());
    const weapon = recalculated.bag.equipments.Arma.find((w) => w.id === WID);

    expect(weapon?.atkBonus ?? 0).toBe(0);
  });

  it('estreita a margem de ameaça da arma em 1 (19/x2 → 18/x2)', () => {
    const recalculated = recalculateSheet(mkDevotoSheet());
    const weapon = recalculated.bag.equipments.Arma.find((w) => w.id === WID);

    expect(weapon?.critico).toBe('18/x2');
  });

  it('normalizeSheet refresca a definição stale salva na ficha', () => {
    const sheet = mkDevotoSheet();
    // Simula uma ficha salva antes da correção: cópia do poder com o antigo
    // bônus WeaponAttack embutido.
    sheet.devoto = {
      divindade: _.cloneDeep(VALKARIA),
      poderes: [
        {
          ..._.cloneDeep(GRANTED_POWERS.ARMAS_DA_AMBICAO),
          description: 'descrição antiga',
          sheetBonuses: [
            {
              source: { type: 'power', name: 'Armas da Ambição' },
              target: { type: 'WeaponAttack', proficiencyRequired: true },
              modifier: { type: 'Fixed', value: 1 },
            },
          ],
        },
      ],
    };

    normalizeSheet(sheet);

    const targets = (sheet.devoto?.poderes[0].sheetBonuses ?? []).map(
      (b) => b.target.type
    );
    expect(targets).toContain('AllAttackBonus');
    expect(targets).toContain('WeaponThreatMargin');
    expect(targets).not.toContain('WeaponAttack');
    expect(sheet.devoto?.poderes[0].description).toBe(
      GRANTED_POWERS.ARMAS_DA_AMBICAO.description
    );
  });

  it('mantém intocado poder concedido fora do core (homebrew)', () => {
    const sheet = mkDevotoSheet();
    const homebrewPower = {
      name: 'Poder Homebrew da Ambição',
      description: 'não existe no core',
      type: GRANTED_POWERS.ARMAS_DA_AMBICAO.type,
      requirements: [],
      sheetBonuses: [
        {
          source: { type: 'power' as const, name: 'Poder Homebrew da Ambição' },
          target: { type: 'Defense' as const },
          modifier: { type: 'Fixed' as const, value: 2 },
        },
      ],
    };
    sheet.devoto = {
      divindade: _.cloneDeep(VALKARIA),
      poderes: [_.cloneDeep(homebrewPower)],
    };

    normalizeSheet(sheet);

    expect(sheet.devoto?.poderes[0]).toEqual(homebrewPower);
  });
});
