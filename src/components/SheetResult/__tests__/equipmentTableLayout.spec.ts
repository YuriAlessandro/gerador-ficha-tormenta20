import { describe, expect, it } from 'vitest';
import {
  STAT_DANO,
  STAT_PENALIDADE,
  getStatsForGroup,
  statTrack,
} from '@/functions/equipmentStats';
import { getGroupMinWidth } from '@/components/SheetResult/EquipmentTable';
import {
  getRememberedSheetTab,
  rememberSheetTab,
} from '@/components/SheetResult/sheetTabMemory';

describe('trilhas do grid de equipamentos', () => {
  it('formata a trilha a partir dos limites numéricos', () => {
    expect(statTrack(STAT_DANO)).toBe('minmax(64px, 84px)');
    expect(statTrack(STAT_PENALIDADE)).toBe('minmax(72px, 96px)');
  });
});

describe('largura mínima da tabela', () => {
  // 572px é o número que estourava a coluna de ~360px do iPad em pé e fazia a
  // tabela vazar por cima das Perícias.
  it('mede o grupo Arma, o mais largo', () => {
    expect(getGroupMinWidth(getStatsForGroup('Arma'))).toBe(572);
  });

  it('mede grupos com menos colunas', () => {
    expect(getGroupMinWidth(getStatsForGroup('Armadura'))).toBe(364);
    expect(getGroupMinWidth(getStatsForGroup('Item Geral'))).toBe(220);
    expect(getGroupMinWidth([])).toBe(220);
  });

  it('exige mais espaço para armas do que para itens gerais', () => {
    expect(getGroupMinWidth(getStatsForGroup('Arma'))).toBeGreaterThan(
      getGroupMinWidth(getStatsForGroup('Item Geral'))
    );
  });
});

describe('memória da aba aberta', () => {
  it('não lembra nada antes da primeira escrita', () => {
    expect(getRememberedSheetTab('ficha-nova')).toBeUndefined();
  });

  it('devolve a última aba da ficha', () => {
    rememberSheetTab('ficha-a', 'equipamentos');
    expect(getRememberedSheetTab('ficha-a')).toBe('equipamentos');
  });

  it('não mistura fichas diferentes', () => {
    rememberSheetTab('ficha-b', 'magias');
    rememberSheetTab('ficha-c', 'poderes');
    expect(getRememberedSheetTab('ficha-b')).toBe('magias');
    expect(getRememberedSheetTab('ficha-c')).toBe('poderes');
  });

  it('ignora ficha sem id, para uma não herdar a aba da outra', () => {
    rememberSheetTab('', 'magias');
    expect(getRememberedSheetTab('')).toBeUndefined();
  });
});
