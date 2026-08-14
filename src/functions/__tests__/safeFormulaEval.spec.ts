/**
 * Gate de segurança das fórmulas homebrew.
 *
 * O foco aqui é o placeholder `{tPowQtd}`: ele já era aceito como tipo de
 * modificador (`TormentaPowersCalc`) pela validação, mas a whitelist não o
 * conhecia — então toda fórmula que o usasse era reprovada, e o tipo era
 * inalcançável ponta a ponta.
 */
import { describe, it, expect } from 'vitest';
import {
  evaluateFormula,
  isFormulaSafe,
} from '../../premium/functions/safeFormulaEval';

const TPOW_FORMULA = 'Math.floor(({tPowQtd} - 1) / 2) + 1';

describe('isFormulaSafe', () => {
  it('aprova a fórmula canônica por poderes da Tormenta', () => {
    expect(isFormulaSafe(TPOW_FORMULA)).toBe(true);
    expect(isFormulaSafe('{tPowQtd}')).toBe(true);
    expect(isFormulaSafe('2 + ({tPowQtd} - 1)')).toBe(true);
  });

  it('continua aprovando as fórmulas por nível', () => {
    expect(isFormulaSafe('Math.floor({level} / 2)')).toBe(true);
    expect(isFormulaSafe('Math.floor(({classLevel} + 3) / 4)')).toBe(true);
  });

  it('continua reprovando identificadores fora da whitelist', () => {
    expect(isFormulaSafe('{tPowQtdX}')).toBe(false);
    expect(isFormulaSafe('process.exit(1)')).toBe(false);
    expect(isFormulaSafe('Math.random()')).toBe(false);
    expect(isFormulaSafe('sheet.atributos')).toBe(false);
  });
});

describe('evaluateFormula com {tPowQtd}', () => {
  it('substitui o total de poderes da Tormenta', () => {
    expect(evaluateFormula(TPOW_FORMULA, { tPowQtd: 1 })).toBe(1);
    expect(evaluateFormula(TPOW_FORMULA, { tPowQtd: 3 })).toBe(2);
    expect(evaluateFormula(TPOW_FORMULA, { tPowQtd: 5 })).toBe(3);
  });

  it('trata ausência do total como zero', () => {
    expect(evaluateFormula('{tPowQtd}', {})).toBe(0);
  });

  it('substitui TODAS as ocorrências do placeholder', () => {
    expect(evaluateFormula('{tPowQtd} + {tPowQtd}', { tPowQtd: 4 })).toBe(8);
  });
});
