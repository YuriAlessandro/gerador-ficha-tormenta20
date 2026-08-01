import _ from 'lodash';
import generateRandomSheet from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { getSkillOthersBreakdown } from '../skills/skillBonusBreakdown';
import { getPowerAppliedBonuses } from '../sheetBonuses/appliedBonuses';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import Skill from '../../interfaces/Skills';
import GRANTED_POWERS from '../../data/systems/tormenta20/powers/grantedPowers';
import HYNINN from '../../data/systems/tormenta20/divindades/hyninn';
import TANNA_TOH from '../../data/systems/tormenta20/divindades/tanna-toh';
import { Armaduras } from '../../data/systems/tormenta20/equipamentos';
import { SupplementId } from '../../types/supplement.types';

/**
 * Cobre o poder concedido "Golpista Divino" (Hyninn): +2 em Enganação,
 * Jogatina e Ladinagem.
 *
 * Feedback de usuário reportou o bônus de Ladinagem como ausente. Ele é
 * aplicado — mas Ladinagem é a única das três perícias em
 * `SkillsWithArmorPenalty`, então a penalidade de armadura entra no MESMO campo
 * `others` e o número exibido fica menor que +2 (ou zero/negativo). Estes
 * testes travam as duas coisas: a soma continua correta, e o breakdown do
 * "Outros" mostra o +2 explicitamente.
 */
describe('Golpista Divino', () => {
  const ARMOR_ID = 'golpista-test-armor';
  const SKILLS = [Skill.ENGANACAO, Skill.JOGATINA, Skill.LADINAGEM];

  const mkDevotoSheet = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.devoto = {
      divindade: _.cloneDeep(HYNINN),
      poderes: [_.cloneDeep(GRANTED_POWERS.GOLPISTA_DIVINO)],
    };
    sheet.sheetBonuses = [];
    sheet.sheetActionHistory = [];
    return sheet;
  };

  const wearCouroBatido = (sheet: CharacterSheet): CharacterSheet => {
    const worn = { ...Armaduras.COUROBATIDO, id: ARMOR_ID };
    sheet.bag = new Bag({ Armadura: [worn] });
    sheet.wornArmorId = ARMOR_ID;
    return sheet;
  };

  const skillOf = (sheet: CharacterSheet, skill: Skill) =>
    sheet.completeSkills?.find((s) => s.name === skill);

  const othersOf = (sheet: CharacterSheet, skill: Skill): number =>
    skillOf(sheet, skill)?.others ?? 0;

  const breakdownOf = (sheet: CharacterSheet, skill: Skill) => {
    const complete = skillOf(sheet, skill);
    if (!complete)
      throw new Error(`perícia ausente em completeSkills: ${skill}`);
    return getSkillOthersBreakdown(sheet, complete);
  };

  describe('caminho de recálculo (wizard / ficha editada)', () => {
    it('aplica +2 em Enganação, Jogatina e Ladinagem sem armadura', () => {
      const recalculated = recalculateSheet(mkDevotoSheet());

      SKILLS.forEach((skill) => {
        expect(othersOf(recalculated, skill)).toBe(2);
      });
    });

    it('não acumula o bônus em recálculos sucessivos', () => {
      const once = recalculateSheet(mkDevotoSheet());
      const twice = recalculateSheet(once);

      expect(othersOf(twice, Skill.LADINAGEM)).toBe(2);
    });

    it('penalidade de armadura reduz o "Outros" de Ladinagem, não o de Enganação', () => {
      const recalculated = recalculateSheet(wearCouroBatido(mkDevotoSheet()));

      // Couro batido: penalidade 1. Ladinagem está em SkillsWithArmorPenalty.
      expect(othersOf(recalculated, Skill.LADINAGEM)).toBe(1);
      expect(othersOf(recalculated, Skill.ENGANACAO)).toBe(2);
      expect(othersOf(recalculated, Skill.JOGATINA)).toBe(2);
    });
  });

  describe('breakdown do "Outros"', () => {
    it('mostra o +2 do poder mesmo quando a penalidade de armadura o mascara', () => {
      const recalculated = recalculateSheet(wearCouroBatido(mkDevotoSheet()));
      const entries = breakdownOf(recalculated, Skill.LADINAGEM);

      expect(entries).toEqual(
        expect.arrayContaining([
          { label: 'Golpista Divino', value: 2 },
          { label: 'Penalidade de armadura', value: -1 },
        ])
      );
    });

    it('fecha com o total exibido na coluna "Outros"', () => {
      const recalculated = recalculateSheet(wearCouroBatido(mkDevotoSheet()));

      SKILLS.forEach((skill) => {
        const sum = breakdownOf(recalculated, skill).reduce(
          (acc, entry) => acc + entry.value,
          0
        );
        expect(sum).toBe(othersOf(recalculated, skill));
      });
    });

    it('sem penalidade, lista só a parcela do poder', () => {
      const recalculated = recalculateSheet(mkDevotoSheet());

      expect(breakdownOf(recalculated, Skill.LADINAGEM)).toEqual([
        { label: 'Golpista Divino', value: 2 },
      ]);
    });
  });

  describe('caminho de geração aleatória (applyStatModifiers)', () => {
    // Nenhuma classe do core concede TODOS os poderes da divindade (Clérigo
    // sorteia 2 dos 4 de Hyninn), então não há como forçar Golpista Divino numa
    // única geração. Geramos até cair — com ~50% por tentativa, 30 tentativas
    // deixam a chance de falso negativo em ~1e-9, sem virar teste flaky.
    const MAX_TRIES = 30;

    const generateWithGolpistaDivino = (): CharacterSheet => {
      for (let i = 0; i < MAX_TRIES; i += 1) {
        const sheet = generateRandomSheet({
          nivel: 1,
          raca: 'Humano',
          classe: 'Clérigo',
          origin: '',
          devocao: { label: 'Hyninn', value: 'HYNINN' },
          supplements: [SupplementId.TORMENTA20_CORE],
        });

        expect(sheet.devoto?.divindade.name).toBe('Hyninn');

        if (
          (sheet.devoto?.poderes || []).some(
            (p) => p.name === 'Golpista Divino'
          )
        ) {
          return sheet;
        }
      }
      throw new Error(
        `Golpista Divino não foi sorteado em ${MAX_TRIES} gerações de Clérigo de Hyninn`
      );
    };

    it('registra o +2 nas três perícias', () => {
      const sheet = generateWithGolpistaDivino();

      // O equipamento aleatório pode trazer armadura, então o total de
      // Ladinagem não é determinístico — o que é determinístico (e é a
      // regressão que importa) é a parcela do poder aparecer no breakdown.
      SKILLS.forEach((skill) => {
        expect(breakdownOf(sheet, skill)).toEqual(
          expect.arrayContaining([{ label: 'Golpista Divino', value: 2 }])
        );
      });
    });
  });

  describe('passo-a-passo e histórico do recálculo', () => {
    const grantEntriesOf = (sheet: CharacterSheet) =>
      sheet.sheetActionHistory.filter(
        (entry) => entry.source.type === 'divinity' && !entry.powerName
      );

    const grantedStepsOf = (sheet: CharacterSheet) =>
      sheet.steps.filter((step) => step.label === 'Poderes Concedidos');

    it('registra PowerAdded para o poder divino (o "Vindo de" do card)', () => {
      const recalculated = recalculateSheet(mkDevotoSheet());
      const [entry] = grantEntriesOf(recalculated);

      expect(entry).toBeDefined();
      expect(entry.source).toMatchObject({
        type: 'divinity',
        divinityName: 'Hyninn',
      });
      expect(entry.changes).toContainEqual({
        type: 'PowerAdded',
        powerName: 'Golpista Divino',
      });
    });

    it('lista os bônus de perícia no step "Poderes Concedidos"', () => {
      const recalculated = recalculateSheet(mkDevotoSheet());
      const [step] = grantedStepsOf(recalculated);

      expect(step).toBeDefined();
      const values = step.value.map((sub) => sub.value);
      expect(values).toContain('+2 em Ladinagem');
      expect(values).toContain('+2 em Enganação');
      expect(values).toContain('+2 em Jogatina');
      expect(step.value.every((sub) => sub.name === 'Golpista Divino')).toBe(
        true
      );
    });

    it('não acumula entrada nem step em recálculos sucessivos', () => {
      const once = recalculateSheet(mkDevotoSheet());
      const thrice = recalculateSheet(recalculateSheet(once));

      expect(grantEntriesOf(thrice)).toHaveLength(1);
      expect(grantedStepsOf(thrice)).toHaveLength(1);
      expect(grantedStepsOf(thrice)[0].value).toHaveLength(
        grantedStepsOf(once)[0].value.length
      );
    });

    it('trocar de divindade não deixa a concessão antiga para trás', () => {
      const hyninn = recalculateSheet(mkDevotoSheet());

      const swapped = _.cloneDeep(hyninn);
      swapped.devoto = {
        divindade: _.cloneDeep(TANNA_TOH),
        poderes: [_.cloneDeep(GRANTED_POWERS.MENTE_ANALITICA)],
      };
      const recalculated = recalculateSheet(swapped);

      const entries = grantEntriesOf(recalculated);
      expect(entries).toHaveLength(1);
      expect(entries[0].source).toMatchObject({ divinityName: 'Tanna-Toh' });
      expect(entries[0].changes).not.toContainEqual({
        type: 'PowerAdded',
        powerName: 'Golpista Divino',
      });
    });

    it('deixar de ser devoto limpa a concessão e o step', () => {
      const devoto = recalculateSheet(mkDevotoSheet());

      const semDevoto = _.cloneDeep(devoto);
      semDevoto.devoto = undefined;
      const recalculated = recalculateSheet(semDevoto);

      expect(grantEntriesOf(recalculated)).toHaveLength(0);
      expect(grantedStepsOf(recalculated)).toHaveLength(0);
    });
  });

  describe('bônus aplicados no card do poder', () => {
    it('mostra +2 nas três perícias mesmo sob penalidade de armadura', () => {
      const recalculated = recalculateSheet(wearCouroBatido(mkDevotoSheet()));
      const applied = getPowerAppliedBonuses(
        recalculated,
        GRANTED_POWERS.GOLPISTA_DIVINO
      );

      // A tabela de perícias exibe "+1" em Ladinagem (o +2 líquido da
      // penalidade). O card mostra o valor DO PODER.
      expect(applied).toEqual([
        { key: 'Enganação', label: 'Enganação', value: '+2' },
        { key: 'Jogatina', label: 'Jogatina', value: '+2' },
        { key: 'Ladinagem', label: 'Ladinagem', value: '+2' },
      ]);
    });

    it('devolve vazio quando o poder não está na ficha', () => {
      const semPoder = createMockCharacterSheet();
      semPoder.sheetBonuses = [];

      expect(
        getPowerAppliedBonuses(semPoder, GRANTED_POWERS.GOLPISTA_DIVINO)
      ).toEqual([]);
    });
  });

  it('o requisito DEVOTO usa a grafia real da divindade ("Hyninn")', () => {
    // Com o typo 'Hynnin', checkRequirements reprovava devotos legítimos.
    const requirementNames = Object.values(GRANTED_POWERS).flatMap((power) =>
      (power.requirements || []).flatMap((group) =>
        group.map((rule) => rule.name)
      )
    );

    expect(requirementNames).toContain('Hyninn');
    expect(requirementNames).not.toContain('Hynnin');
  });
});
