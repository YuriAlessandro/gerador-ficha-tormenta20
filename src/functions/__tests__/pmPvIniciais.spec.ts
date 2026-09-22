import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import {
  applyMaxPointsGainToCurrent,
  applyPower,
  addPointsOverflowingToTemp,
} from '../general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import PALADINO from '../../data/systems/tormenta20/classes/paladino';
import CLERIGO from '../../data/systems/tormenta20/classes/clerigo';
import ARCANISTA from '../../data/systems/tormenta20/classes/arcanista';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { SpellPath } from '../../interfaces/Class';

/**
 * Os PV/PM atuais de uma ficha nova têm que nascer iguais ao máximo. O máximo
 * só fica pronto depois que os bônus de atributo-chave entram (o Carisma do
 * "Abençoado" do paladino, a Inteligência das "Magias" do arcanista), então
 * inicializar o atual antes disso fazia o personagem nascer machucado — ou,
 * numa ficha que já vinha com o atual cheio, transformava a diferença em PM
 * temporário do nada.
 */
describe('PV/PM atuais na ficha nova', () => {
  const buildPaladino = (carisma: number, nivel = 1): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = nivel;
    sheet.classe = _.cloneDeep(PALADINO);
    sheet.atributos[Atributo.CARISMA].value = carisma;
    return sheet;
  };

  it('paladino nível 1 nasce com PM cheio, somando o Carisma', () => {
    const sheet = recalculateSheet(buildPaladino(4));

    // 3 de PM base da classe + 4 de Carisma (Abençoado).
    expect(sheet.pm).toBe(7);
    expect(sheet.currentPM).toBe(7);
    expect(sheet.tempPM).toBeUndefined();
  });

  it('não inventa PM temporário quando a ficha já vem com o PM cheio', () => {
    const sheet = buildPaladino(4);
    sheet.pm = 7;
    sheet.currentPM = 7;

    const recalculated = recalculateSheet(sheet);

    expect(recalculated.pm).toBe(7);
    expect(recalculated.currentPM).toBe(7);
    expect(recalculated.tempPM).toBeUndefined();
  });

  it('vale para outras classes conjuradoras (arcanista/Inteligência)', () => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 1;
    sheet.classe = _.cloneDeep(ARCANISTA);
    // O caminho (Mago/Bruxo/Feiticeiro) é escolhido no assistente; é ele que
    // define o atributo-chave que entra no PM.
    sheet.classe.spellPath = {
      ...(sheet.classe.spellPath as SpellPath),
      keyAttribute: Atributo.INTELIGENCIA,
    } as SpellPath;
    sheet.atributos[Atributo.INTELIGENCIA].value = 4;

    const recalculated = recalculateSheet(sheet);

    // 6 de PM base do arcanista + 4 de Inteligência (Magias).
    expect(recalculated.pm).toBe(10);
    expect(recalculated.currentPM).toBe(10);
    expect(recalculated.tempPM).toBeUndefined();
  });

  it('PV atual nasce cheio', () => {
    const sheet = recalculateSheet(buildPaladino(4));

    expect(sheet.currentPV).toBe(sheet.pv);
    expect(sheet.tempPV).toBeUndefined();
  });

  it('preserva PV/PM já gastos num recálculo', () => {
    const sheet = buildPaladino(4);
    sheet.currentPM = 2;
    sheet.currentPV = 5;

    const recalculated = recalculateSheet(sheet);

    expect(recalculated.currentPM).toBe(2);
    expect(recalculated.currentPV).toBe(5);
    expect(recalculated.tempPM).toBeUndefined();
  });

  it('apara o atual no máximo, sem virar pontos temporários', () => {
    const sheet = buildPaladino(4);
    sheet.currentPM = 9; // acima do máximo de 7
    sheet.currentPV = 999;

    const recalculated = recalculateSheet(sheet);

    expect(recalculated.pm).toBe(7);
    expect(recalculated.currentPM).toBe(7);
    expect(recalculated.tempPM).toBeUndefined();
    expect(recalculated.currentPV).toBe(recalculated.pv);
    expect(recalculated.tempPV).toBeUndefined();
  });

  it('não devolve PM gasto quando o máximo cai', () => {
    const cheia = recalculateSheet(buildPaladino(4));
    const gasta = { ...cheia, currentPM: 2 };

    // Carisma reduzido à mão: o máximo cai de 7 para 5, mas quem gastou
    // continua com 2.
    gasta.atributos[Atributo.CARISMA].value = 2;
    const recalculated = recalculateSheet(gasta, cheia);

    expect(recalculated.pm).toBe(5);
    expect(recalculated.currentPM).toBe(2);
  });

  it('edição manual de atributo mexe no máximo, não no atual', () => {
    const cheia = recalculateSheet(buildPaladino(4));
    const gasta = { ...cheia, currentPM: 4, currentPV: 10 };

    gasta.atributos[Atributo.CARISMA].value = 6;
    gasta.atributos[Atributo.CONSTITUICAO].value += 1;
    const recalculated = recalculateSheet(gasta, cheia);

    expect(recalculated.pm).toBe(9); // 3 de base + 6 de Carisma
    expect(recalculated.pv).toBeGreaterThan(cheia.pv);
    expect(recalculated.currentPM).toBe(4);
    expect(recalculated.currentPV).toBe(10);
  });
});

/**
 * Aumento de Atributo e nível novo entregam pontos de verdade: o ganho de
 * máximo entra cheio no atual, sem curar o que já estava gasto.
 */
describe('applyMaxPointsGainToCurrent', () => {
  const before = recalculateSheet(
    (() => {
      const sheet = createMockCharacterSheet();
      sheet.nivel = 1;
      sheet.classe = _.cloneDeep(PALADINO);
      sheet.atributos[Atributo.CARISMA].value = 4;
      return sheet;
    })()
  );

  it('soma ao atual o que o nível novo acrescentou ao máximo', () => {
    const after = { ...before, pv: before.pv + 6, pm: before.pm + 3 };

    const result = applyMaxPointsGainToCurrent(before, after);

    expect(result.pm).toBe(before.pm + 3);
    expect(result.currentPM).toBe(before.currentPM! + 3);
    expect(result.currentPV).toBe(before.currentPV! + 6);
  });

  it('mantém o dano já sofrido, somando só o ganho', () => {
    const damaged = { ...before, currentPV: 4, currentPM: 1 };
    const after = { ...damaged, pv: damaged.pv + 6, pm: damaged.pm + 3 };

    const result = applyMaxPointsGainToCurrent(damaged, after);

    expect(result.currentPV).toBe(10);
    expect(result.currentPM).toBe(4);
  });

  it('nunca ultrapassa o máximo', () => {
    const after = { ...before, pv: before.pv + 6, pm: before.pm + 3 };
    const result = applyMaxPointsGainToCurrent(
      { ...before, pm: 0, pv: 0 },
      after
    );

    expect(result.currentPM).toBe(after.pm);
    expect(result.currentPV).toBe(after.pv);
  });

  it('ignora máximo que diminuiu', () => {
    const after = { ...before, pm: before.pm - 2 };

    const result = applyMaxPointsGainToCurrent(before, after);

    expect(result.currentPM).toBe(before.currentPM);
  });
});

/**
 * Caminho real do editor de poderes: o Aumento de Atributo sobe o atributo, o
 * recálculo refaz os máximos e o ganho entra no atual.
 */
describe('Aumento de Atributo', () => {
  const buildNivel4 = (): CharacterSheet => {
    const sheet = createMockCharacterSheet();
    sheet.nivel = 4;
    sheet.classe = _.cloneDeep(PALADINO);
    sheet.atributos[Atributo.CARISMA].value = 4;
    sheet.atributos[Atributo.CONSTITUICAO].value = 2;
    return recalculateSheet(sheet);
  };

  const aumentoDeAtributo = CLERIGO.powers.find(
    (power) => power.name === 'Aumento de Atributo'
  )!;

  const aplicar = (base: CharacterSheet, atributo: Atributo) => {
    const [withPower] = applyPower(base, aumentoDeAtributo, {
      attributes: [atributo],
    });
    const recalculated = recalculateSheet(withPower, base);
    return applyMaxPointsGainToCurrent(base, recalculated);
  };

  it('+1 Constituição sobe o PV máximo e entrega o ganho no atual', () => {
    const base = buildNivel4();
    const result = aplicar(base, Atributo.CONSTITUICAO);

    // +1 de Constituição é retroativo: +1 PV por nível.
    expect(result.pv).toBe(base.pv + 4);
    expect(result.currentPV).toBe(base.currentPV! + 4);
  });

  it('+1 Carisma sobe o PM máximo do paladino e entrega o ganho no atual', () => {
    const base = buildNivel4();
    const result = aplicar(base, Atributo.CARISMA);

    expect(result.pm).toBe(base.pm + 1);
    expect(result.currentPM).toBe(base.currentPM! + 1);
  });

  it('não cura o que já estava gasto', () => {
    const base = { ...buildNivel4(), currentPV: 10, currentPM: 2 };
    const result = aplicar(base, Atributo.CONSTITUICAO);

    expect(result.currentPV).toBe(14);
    expect(result.currentPM).toBe(2);
  });
});

/**
 * Ponto adicionado acima do máximo vira temporário (é o que os botões de + da
 * ficha e o drawer de PV/PM fazem). O recálculo não participa disso: lá, atual
 * acima do máximo é só máximo que encolheu.
 */
describe('addPointsOverflowingToTemp', () => {
  it('abaixo do máximo, só soma no atual', () => {
    expect(addPointsOverflowingToTemp(2, 3, 7, 0)).toEqual({
      current: 5,
      temp: 0,
    });
  });

  it('cheio, +2 vira 2 temporários', () => {
    expect(addPointsOverflowingToTemp(2, 7, 7, 0)).toEqual({
      current: 7,
      temp: 2,
    });
  });

  it('divide entre atual e temporário quando atravessa o máximo', () => {
    expect(addPointsOverflowingToTemp(5, 6, 7, 0)).toEqual({
      current: 7,
      temp: 4,
    });
  });

  it('acumula sobre o temporário que já existia', () => {
    expect(addPointsOverflowingToTemp(2, 7, 7, 3)).toEqual({
      current: 7,
      temp: 5,
    });
  });

  it('com amount 0, normaliza um atual acima do máximo', () => {
    expect(addPointsOverflowingToTemp(0, 9, 7, 0)).toEqual({
      current: 7,
      temp: 2,
    });
  });
});
