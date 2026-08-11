import {
  getCapturablePowers,
  getMajorDeities,
  getPoderCapturadoDC,
  getPoderCapturadoSlots,
  isClassExclusivePower,
  isMajorDeity,
  resolveCapturedPower,
} from '../powers/poderCapturado';
import {
  PODER_CAPTURADO_KEY,
  getEffectiveDeityName,
  getPoderCapturadoDefinition,
} from '../powers/poderCapturadoEffects';
import { isPowerAvailable } from '../powers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import Divindade from '../../interfaces/Divindade';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import GRANTED_POWERS from '../../data/systems/tormenta20/powers/grantedPowers';
import DEUSES_MENORES_DIVINDADES from '../../data/systems/tormenta20/deuses-menores/divindades';

/**
 * Poder Capturado (Usurpador, 4º nível): um par deus maior + poder concedido
 * por nível, sem poderes exclusivos de classe e cumprindo os pré-requisitos.
 */
describe('Usurpador — Poder Capturado', () => {
  const SUPPLEMENTS: SupplementId[] = [
    SupplementId.TORMENTA20_CORE,
    SupplementId.TORMENTA20_HEROIS_ARTON,
  ];

  const usurpadorClass = (): ClassDescription => {
    const classe = dataRegistry
      .getClassesBySupplements(SUPPLEMENTS)
      .find((c) => c.name === 'Usurpador');
    if (!classe) throw new Error('Usurpador não encontrado no registry');
    return classe;
  };

  const buildUsurpador = (nivel: number): CharacterSheet => {
    const classe = usurpadorClass();
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    sheet.classe = {
      ...classe,
      abilities: classe.abilities.filter((a) => a.nivel <= nivel),
    };
    return sheet;
  };

  const findDeity = (name: string): Divindade => {
    const deity = getMajorDeities(SUPPLEMENTS).find((d) => d.name === name);
    if (!deity) throw new Error(`Divindade não encontrada: ${name}`);
    return deity;
  };

  it('só considera deuses maiores', () => {
    const maiores = getMajorDeities(SUPPLEMENTS);
    expect(maiores.length).toBeGreaterThanOrEqual(20);
    expect(maiores.every(isMajorDeity)).toBe(true);

    // Deuses menores carregam statusDivino e ficam de fora.
    const menor = DEUSES_MENORES_DIVINDADES[0];
    expect(menor.statusDivino).toBeDefined();
    expect(isMajorDeity(menor)).toBe(false);
    expect(maiores.some((d) => d.name === menor.name)).toBe(false);
  });

  it('identifica poderes exclusivos de classe pela cláusula CLASSE', () => {
    expect(isClassExclusivePower(GRANTED_POWERS.DOM_DA_IMORTALIDADE)).toBe(
      true
    );
    expect(isClassExclusivePower(GRANTED_POWERS.DOM_DA_RESSUREICAO)).toBe(true);
    expect(isClassExclusivePower(GRANTED_POWERS.ESPADA_JUSTICEIRA)).toBe(false);
    expect(isClassExclusivePower(GRANTED_POWERS.ARMAS_DA_AMBICAO)).toBe(false);
  });

  it('regressão: isPowerAvailable NÃO serve para o filtro de exclusividade', () => {
    // O Usurpador é variante de Clérigo, então `isClassOrVariantOf(classe,
    // 'Clérigo')` é TRUE para ele e Dom da Ressurreição (exclusivo de
    // Clérigo/Frade) passaria no teste de requisitos. É exatamente por isso
    // que existe um predicado separado.
    const sheet = buildUsurpador(10);
    const thyatis = findDeity('Thyatis');
    const comoDevoto: CharacterSheet = {
      ...sheet,
      devoto: { divindade: thyatis, poderes: [] },
    };
    expect(
      isPowerAvailable(comoDevoto, GRANTED_POWERS.DOM_DA_RESSUREICAO)
    ).toBe(true);

    // E o filtro real bloqueia.
    const capturaveis = getCapturablePowers(sheet, thyatis);
    const ressureicao = capturaveis.find(
      (c) => c.power.name === GRANTED_POWERS.DOM_DA_RESSUREICAO.name
    );
    expect(ressureicao?.available).toBe(false);
    expect(ressureicao?.reason).toBe('class-exclusive');
  });

  it('libera poderes que exigem DEVOTO via ficha sintética', () => {
    // Sem a ficha sintética, RequirementType.DEVOTO seria sempre falso num
    // Usurpador (que por regra não tem devoção) e NENHUM poder seria elegível.
    const sheet = buildUsurpador(10);
    expect(sheet.devoto).toBeUndefined();

    const capturaveis = getCapturablePowers(sheet, findDeity('Khalmyr'));
    expect(capturaveis.length).toBeGreaterThan(0);
    expect(capturaveis.some((c) => c.available)).toBe(true);
  });

  it('concede um par por nível, a partir do 4º', () => {
    expect(getPoderCapturadoSlots(buildUsurpador(3))).toBe(0);
    expect(getPoderCapturadoSlots(buildUsurpador(4))).toBe(4);
    expect(getPoderCapturadoSlots(buildUsurpador(10))).toBe(10);
    // No 20º são 20 — exatamente o número de deuses maiores.
    expect(getPoderCapturadoSlots(buildUsurpador(20))).toBe(20);
  });

  it('a CD de ativação sobe 5 por uso adicional no dia', () => {
    expect(getPoderCapturadoDC(0)).toBe(20);
    expect(getPoderCapturadoDC(1)).toBe(25);
    expect(getPoderCapturadoDC(3)).toBe(35);
  });

  it('resolve a escolha gravada pelo nome do deus e do poder', () => {
    const resolved = resolveCapturedPower(
      { divindade: 'Khalmyr', poder: GRANTED_POWERS.ESPADA_JUSTICEIRA.name },
      SUPPLEMENTS
    );
    expect(resolved?.deity.name).toBe('Khalmyr');
    expect(resolved?.power.name).toBe(GRANTED_POWERS.ESPADA_JUSTICEIRA.name);

    expect(
      resolveCapturedPower(
        { divindade: 'Khalmyr', poder: 'Poder Inexistente' },
        SUPPLEMENTS
      )
    ).toBeNull();
  });

  it('monta uma opção de efeito ativo por par escolhido', () => {
    const sheet = buildUsurpador(6);
    expect(getPoderCapturadoDefinition(sheet, SUPPLEMENTS)).toBeNull();

    sheet.poderesCapturados = [
      {
        divindade: 'Khalmyr',
        poder: GRANTED_POWERS.ESPADA_JUSTICEIRA.name,
        level: 4,
      },
      {
        divindade: 'Valkaria',
        poder: GRANTED_POWERS.ARMAS_DA_AMBICAO.name,
        level: 5,
      },
    ];

    const definition = getPoderCapturadoDefinition(sheet, SUPPLEMENTS);
    expect(definition?.key).toBe(PODER_CAPTURADO_KEY);
    expect(definition?.name).toBe('Poder Capturado');

    const options = definition?.getUsageOptions(sheet) ?? [];
    expect(options).toHaveLength(2);
    expect(options[0].id).toBe(
      `Khalmyr|${GRANTED_POWERS.ESPADA_JUSTICEIRA.name}`
    );
    expect(options[0].label).toContain('Khalmyr');
    // Os 3 PM da regra só saem na FALHA do teste, não no custo da opção.
    expect(options[0].pmCost).toBe(0);
    // Os bônus vêm do poder concedido, sem o `source` (reatribuído no recálculo).
    options.forEach((option) => {
      option.bonuses.forEach((bonus) => {
        expect(bonus).not.toHaveProperty('source');
      });
    });
  });

  it('conta como devoto do deus roubado enquanto o efeito está ativo', () => {
    const sheet = buildUsurpador(10);
    expect(getEffectiveDeityName(sheet)).toBeUndefined();

    sheet.activeEffects = [
      {
        instanceId: 'x',
        powerKey: PODER_CAPTURADO_KEY,
        name: 'Poder Capturado',
        sourceLabel: 'Usurpador · Poder Capturado',
        optionId: `Khalmyr|${GRANTED_POWERS.ESPADA_JUSTICEIRA.name}`,
        optionLabel: 'Espada Justiceira (Khalmyr)',
        bonuses: [],
        appliedAt: '2026-08-11T00:00:00.000Z',
      },
    ];
    expect(getEffectiveDeityName(sheet)).toBe('Khalmyr');

    // Sem efeito ativo, cai na devoção real.
    const devoto = buildUsurpador(10);
    devoto.devoto = { divindade: findDeity('Valkaria'), poderes: [] };
    expect(getEffectiveDeityName(devoto)).toBe('Valkaria');
  });
});
