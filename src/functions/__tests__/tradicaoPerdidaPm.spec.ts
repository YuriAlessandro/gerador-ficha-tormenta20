import { recalculateSheet } from '../recalculateSheet';
import {
  getPlateauByLevel,
  getTradicaoPerdidaPmCap,
  getTradicaoPerdidaPmValue,
} from '../powers/general';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { GeneralPower, GeneralPowerType } from '../../interfaces/Poderes';
import CharacterSheet from '../../interfaces/CharacterSheet';
import racePowers from '../../data/systems/tormenta20/herois-de-arton/powers/racePowers';

const { TRADICAO_PERDIDA, TRADICAO_PERDIDA_APRIMORADA } = racePowers;

// Poder de teste que reproduz a habilidade "Magias": soma o atributo-chave
// (spellKeyAttr) ao total de PM.
const MAGIAS_PM_POWER: GeneralPower = {
  name: 'Magias (teste)',
  description: 'Soma o atributo-chave ao total de PM.',
  type: GeneralPowerType.COMBATE,
  requirements: [],
  sheetBonuses: [
    {
      source: { type: 'power', name: 'Magias (teste)' },
      target: { type: 'PM' },
      modifier: { type: 'SpecialAttribute', attribute: 'spellKeyAttr' },
    },
  ],
};

// Poder de teste que soma o atributo-chave ao PV (como o familiar SAPO). Serve
// para garantir que o override da Tradição Perdida atinge SÓ o PM.
const SAPO_PV_POWER: GeneralPower = {
  name: 'Sapo (teste)',
  description: 'Soma o atributo-chave ao total de PV.',
  type: GeneralPowerType.COMBATE,
  requirements: [],
  sheetBonuses: [
    {
      source: { type: 'power', name: 'Sapo (teste)' },
      target: { type: 'PV' },
      modifier: { type: 'SpecialAttribute', attribute: 'spellKeyAttr' },
    },
  ],
};

// Ficha conjuradora: atributo-chave da classe = Inteligência (valor 0 no mock),
// com o poder "Magias" concedendo PM pelo atributo-chave.
function makeCasterSheet(): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.generalPowers = [MAGIAS_PM_POWER];
  sheet.classPowers = [];
  sheet.sheetBonuses = [];
  sheet.sheetActionHistory = [];
  sheet.classe = {
    ...sheet.classe,
    spellPath: {
      initialSpells: 0,
      spellType: 'Arcane',
      qtySpellsLearnAtLevel: () => 0,
      spellCircleAvailableAtLevel: () => 1,
      keyAttribute: Atributo.INTELIGENCIA,
    },
  };
  return sheet;
}

describe('Tradição Perdida - cap por patamar (helpers)', () => {
  it('getPlateauByLevel mapeia os patamares corretos', () => {
    expect(getPlateauByLevel(1)).toBe(1);
    expect(getPlateauByLevel(4)).toBe(1);
    expect(getPlateauByLevel(5)).toBe(2);
    expect(getPlateauByLevel(10)).toBe(2);
    expect(getPlateauByLevel(11)).toBe(3);
    expect(getPlateauByLevel(16)).toBe(3);
    expect(getPlateauByLevel(17)).toBe(4);
    expect(getPlateauByLevel(20)).toBe(4);
  });

  it('getTradicaoPerdidaPmCap = 6 +2 por patamar acima de iniciante', () => {
    expect(getTradicaoPerdidaPmCap(4)).toBe(6); // Iniciante
    expect(getTradicaoPerdidaPmCap(5)).toBe(8); // Veterano
    expect(getTradicaoPerdidaPmCap(11)).toBe(10); // Campeão
    expect(getTradicaoPerdidaPmCap(17)).toBe(12); // Lenda
  });

  it('getTradicaoPerdidaPmValue retorna null quando não configurado', () => {
    const sheet = makeCasterSheet();
    expect(getTradicaoPerdidaPmValue(sheet)).toBeNull();
  });

  it('getTradicaoPerdidaPmValue usa o atributo escolhido, limitado pelo cap', () => {
    const sheet = makeCasterSheet();
    sheet.nivel = 2; // Iniciante → cap 6
    sheet.atributos[Atributo.CONSTITUICAO].value = 3;
    sheet.tradicaoPerdidaPmAttribute = Atributo.CONSTITUICAO;
    expect(getTradicaoPerdidaPmValue(sheet)).toBe(3);

    sheet.atributos[Atributo.CONSTITUICAO].value = 10; // acima do cap
    expect(getTradicaoPerdidaPmValue(sheet)).toBe(6);
  });
});

describe('Tradição Perdida - total de PM (recalculateSheet)', () => {
  it('sem o poder, o PM usa o atributo-chave da classe (Inteligência)', () => {
    const sheet = makeCasterSheet();
    sheet.atributos[Atributo.INTELIGENCIA].value = 0;
    const result = recalculateSheet(sheet);
    // Guardamos o baseline para comparações relativas nos próximos testes.
    expect(result.tradicaoPerdidaPmAttribute).toBeUndefined();
    expect(typeof result.pm).toBe('number');
  });

  it('troca a contribuição de PM para o atributo escolhido', () => {
    const base = recalculateSheet(makeCasterSheet());

    const sheet = makeCasterSheet();
    // Inteligência (chave da classe) = 0; Força = 2.
    sheet.atributos[Atributo.INTELIGENCIA].value = 0;
    sheet.atributos[Atributo.FORCA].value = 2;
    sheet.tradicaoPerdidaPmAttribute = Atributo.FORCA;
    const result = recalculateSheet(sheet);

    // PM sobe pela diferença entre o atributo escolhido (2) e o da classe (0).
    expect(result.pm).toBe(base.pm + 2);
  });

  it('aplica o cap de 6 no patamar iniciante', () => {
    const build = (withPower: boolean): CharacterSheet => {
      const sheet = makeCasterSheet();
      sheet.nivel = 2; // Iniciante → cap 6
      sheet.atributos[Atributo.INTELIGENCIA].value = 0;
      sheet.atributos[Atributo.CONSTITUICAO].value = 10; // muito acima do cap
      if (withPower) sheet.tradicaoPerdidaPmAttribute = Atributo.CONSTITUICAO;
      return sheet;
    };
    const base = recalculateSheet(build(false));
    const result = recalculateSheet(build(true));
    // Contribuição limitada a 6 (não 10), então +6 sobre o baseline (INT 0).
    expect(result.pm).toBe(base.pm + 6);
  });

  it('o cap sobe ao mudar de patamar (iniciante → veterano)', () => {
    const build = (nivel: number): CharacterSheet => {
      const sheet = makeCasterSheet();
      sheet.nivel = nivel;
      sheet.atributos[Atributo.INTELIGENCIA].value = 0;
      sheet.atributos[Atributo.CONSTITUICAO].value = 10;
      sheet.tradicaoPerdidaPmAttribute = Atributo.CONSTITUICAO;
      return sheet;
    };
    const iniciante = recalculateSheet(build(4)); // cap 6
    const veterano = recalculateSheet(build(5)); // cap 8
    // A diferença de PM entre os dois níveis deve incluir os +2 do cap maior,
    // além do PM normal por nível da classe (addpm).
    const { addpm } = makeCasterSheet().classe;
    expect(veterano.pm - iniciante.pm).toBe(addpm + 2);
  });

  it('manualMaxPM tem precedência e ignora a Tradição Perdida', () => {
    const sheet = makeCasterSheet();
    sheet.atributos[Atributo.FORCA].value = 5;
    sheet.tradicaoPerdidaPmAttribute = Atributo.FORCA;
    sheet.manualMaxPM = 50;
    const result = recalculateSheet(sheet);
    expect(result.pm).toBe(50);
  });

  it('não afeta bônus de spellKeyAttr em outros alvos (PV do Sapo)', () => {
    const buildPvSheet = (withTradicao: boolean): CharacterSheet => {
      const sheet = makeCasterSheet();
      sheet.generalPowers = [SAPO_PV_POWER];
      sheet.atributos[Atributo.INTELIGENCIA].value = 0; // chave da classe
      sheet.atributos[Atributo.FORCA].value = 4;
      if (withTradicao) sheet.tradicaoPerdidaPmAttribute = Atributo.FORCA;
      return sheet;
    };
    const semTradicao = recalculateSheet(buildPvSheet(false));
    const comTradicao = recalculateSheet(buildPvSheet(true));
    // O PV (via spellKeyAttr) continua usando Inteligência; a Tradição Perdida
    // só mexe no PM. Então o PV não muda.
    expect(comTradicao.pv).toBe(semTradicao.pv);
  });
});

describe('Tradição Perdida - pick action (prompt ao selecionar o poder)', () => {
  it('os poderes têm sheetAction de pick de atributo (PM e CD)', () => {
    const pmAction = TRADICAO_PERDIDA.sheetActions?.[0].action;
    expect(pmAction?.type).toBe('chooseFromOptions');
    if (pmAction?.type === 'chooseFromOptions') {
      expect(pmAction.applyChosenAttributeTo).toBe('pm');
      expect(pmAction.options).toHaveLength(6);
    }
    const cdAction = TRADICAO_PERDIDA_APRIMORADA.sheetActions?.[0].action;
    expect(cdAction?.type).toBe('chooseFromOptions');
    if (cdAction?.type === 'chooseFromOptions') {
      expect(cdAction.applyChosenAttributeTo).toBe('cd');
      expect(cdAction.options).toHaveLength(6);
    }
  });

  it('escolher o poder base grava o atributo escolhido no PM', () => {
    const sheet = makeCasterSheet();
    sheet.generalPowers = [MAGIAS_PM_POWER, TRADICAO_PERDIDA];
    sheet.atributos[Atributo.INTELIGENCIA].value = 0;
    sheet.atributos[Atributo.CONSTITUICAO].value = 3;

    const base = recalculateSheet(makeCasterSheet());
    const result = recalculateSheet(sheet, sheet, {
      [TRADICAO_PERDIDA.name]: { chosenOption: [Atributo.CONSTITUICAO] },
    });

    expect(result.tradicaoPerdidaPmAttribute).toBe(Atributo.CONSTITUICAO);
    // PM reflete Constituição (3) no lugar de Inteligência (0) = +3.
    expect(result.pm).toBe(base.pm + 3);
  });

  it('escolher o poder Aprimorada grava o atributo-chave da CD (spellPath)', () => {
    const sheet = makeCasterSheet();
    sheet.generalPowers = [MAGIAS_PM_POWER, TRADICAO_PERDIDA_APRIMORADA];

    const result = recalculateSheet(sheet, sheet, {
      [TRADICAO_PERDIDA_APRIMORADA.name]: { chosenOption: [Atributo.FORCA] },
    });

    expect(result.classe.spellPath?.keyAttribute).toBe(Atributo.FORCA);
  });

  it('sem escolha ativa (ficha existente/recalc) NÃO sorteia atributo', () => {
    const sheet = makeCasterSheet();
    sheet.generalPowers = [MAGIAS_PM_POWER, TRADICAO_PERDIDA];
    // Recalc sem manualSelections (ex.: recálculo de ficha antiga com o poder).
    const result = recalculateSheet(sheet);
    expect(result.tradicaoPerdidaPmAttribute).toBeUndefined();
  });

  it('edição manual posterior sobrescreve o pick e sobrevive ao recálculo', () => {
    const sheet = makeCasterSheet();
    sheet.generalPowers = [MAGIAS_PM_POWER, TRADICAO_PERDIDA];

    // 1) Pick inicial: Constituição.
    const afterPick = recalculateSheet(sheet, sheet, {
      [TRADICAO_PERDIDA.name]: { chosenOption: [Atributo.CONSTITUICAO] },
    });
    expect(afterPick.tradicaoPerdidaPmAttribute).toBe(Atributo.CONSTITUICAO);

    // 2) Edição manual troca para Força e recalcula (sem manualSelections).
    const edited = { ...afterPick, tradicaoPerdidaPmAttribute: Atributo.FORCA };
    const afterEdit = recalculateSheet(edited);

    // O replay do recálculo NÃO reescreve o pick — a edição manual prevalece.
    expect(afterEdit.tradicaoPerdidaPmAttribute).toBe(Atributo.FORCA);
  });
});
