import { describe, expect, it } from 'vitest';
import generateRandomSheet from '../general';
import { recalculateSheet } from '../recalculateSheet';
import SelectOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';

/**
 * `deduplicateHistory` chaveava entradas de `levelUp` só pelo NÍVEL. Um mesmo
 * nível, porém, registra mais de uma concessão: o poder escolhido e as
 * habilidades de classe que entram ali. Todas colapsavam na primeira, e a
 * habilidade perdia a origem — o card exibia "Vindo de: Origem não
 * identificada".
 *
 * Só aparecia depois do recálculo, que é o que roda ao editar ou reabrir a
 * ficha; a geração em si registrava tudo certo.
 */

const SUPPS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const gerar = (classe: string, nivel: number) =>
  generateRandomSheet({
    nivel,
    classe,
    raca: '',
    origin: '',
    devocao: { label: 'Não devoto', value: '--' },
    supplements: SUPPS,
  } as unknown as SelectOptions);

const temOrigem = (
  sheet: ReturnType<typeof gerar>,
  powerName: string
): boolean =>
  sheet.sheetActionHistory.some((entry) =>
    entry.changes.some(
      (change) => change.type === 'PowerAdded' && change.powerName === powerName
    )
  );

describe('histórico de concessões por nível', () => {
  it('habilidades de nível mantêm a origem após o recálculo', () => {
    const sheet = recalculateSheet(gerar('Vassalo', 5));

    [
      'Valete',
      'Escudeiro Aprendiz',
      'Guarda do Castelo',
      'Vigilante de Estradas',
    ].forEach((nome) => {
      expect(temOrigem(sheet, nome), `${nome} perdeu a origem`).toBe(true);
    });
  });

  it('vale para outra classe, não só o Vassalo', () => {
    const sheet = recalculateSheet(gerar('Cavaleiro', 5));

    expect(temOrigem(sheet, 'Caminho do Cavaleiro')).toBe(true);
  });

  it('recalcular duas vezes não multiplica as entradas', () => {
    // O dedup continua fazendo o trabalho dele: a chave ficou mais específica,
    // não inexistente.
    const uma = recalculateSheet(gerar('Vassalo', 5));
    const duas = recalculateSheet(uma);

    expect(duas.sheetActionHistory.length).toBe(uma.sheetActionHistory.length);
  });
});
