import { describe, expect, it } from 'vitest';
import generateRandomSheet, { generateEmptySheet } from '../general';
import { dataRegistry } from '../../data/registry';
import EQUIPAMENTOS from '../../data/systems/tormenta20/equipamentos';
import Origin, { Items } from '../../interfaces/Origin';
import SelectOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';

/**
 * Itens e dinheiro de origem conferidos com os livros (JdA cap. 1, Atlas de
 * Arton apêndice "Origens Regionais").
 */

const SUPPS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
  SupplementId.TORMENTA20_ATLAS_ARTON,
];

const origens = dataRegistry.getOriginsBySupplements(SUPPS);
const origem = (nome: string): Origin => {
  const found = origens.find((o) => o.name.startsWith(nome));
  if (!found) throw new Error(`origem ${nome} não encontrada`);
  return found;
};
const nome = (e: Items['equipment']) => (typeof e === 'string' ? e : e.nome);
const itens = (nomeOrigem: string) => origem(nomeOrigem).getItems();
const opcoes = (item: Items) => item.choice?.options.map(nome) ?? [];

describe('itens de origem conforme o livro', () => {
  it('Criminoso: estojo de disfarces OU gazua (JdA p. 89)', () => {
    const items = itens('Criminoso');
    expect(items).toHaveLength(1);
    expect(opcoes(items[0])).toEqual(['Estojo de disfarces', 'Gazua']);
  });

  it('Capanga: qualquer arma simples corpo a corpo (JdA p. 88)', () => {
    const arma = itens('Capanga').find((i) => i.choice?.key === 'arma');
    expect(opcoes(arma!)).toEqual([
      'Adaga',
      'Espada Curta',
      'Foice',
      'Clava',
      'Lança',
      'Maça',
      'Bordão',
      'Pique',
      'Tacape',
    ]);
  });

  it('Herói Camponês: instrumentos de ofício OU arma simples (JdA p. 91)', () => {
    const escolha = itens('Herói Camponês').find((i) => i.choice);
    expect(opcoes(escolha!)).toEqual([
      'Instrumentos de ofício',
      ...EQUIPAMENTOS.armasSimples.map((a) => a.nome),
    ]);
    expect(itens('Herói Camponês').map((i) => nome(i.equipment))).toContain(
      'Traje de Plebeu'
    );
  });

  it('Amigo dos Animais: cão de caça (JdA p. 85)', () => {
    expect(nome(itens('Amigo dos Animais')[0].equipment)).toMatch(
      /^Cão de caça/
    );
  });

  it.each(['Artesão', 'Refugiado', 'Seguidor'])(
    '%s: texto do item não perde a palavra "item"',
    (nomeOrigem) => {
      const textos = itens(nomeOrigem).map((i) => nome(i.equipment));
      expect(textos.some((t) => /\bitem\b/i.test(t))).toBe(true);
    }
  );

  it('Assistente Forense: lupa (Atlas p. 471)', () => {
    const items = itens('Assistente Forense');
    expect(items.map((i) => nome(i.equipment))).toEqual(['Lupa']);
  });

  it('nenhuma origem põe dinheiro na mochila como item', () => {
    origens.forEach((o) => {
      o.getItems().forEach((i) => {
        // "T$ 100 em itens alquímicos" é item; "T$ 44" sozinho é dinheiro.
        expect(nome(i.equipment)).not.toMatch(/^T\$ ?\d+( \(.*\))?$/);
      });
    });
  });
});

describe('dinheiro de origem conforme o livro', () => {
  const rolagens = (o: Origin) =>
    Array.from({ length: 200 }, () => o.getMoney!());

  it('Marujo: T$ 2d6 (JdA p. 92)', () => {
    const valores = rolagens(origem('Marujo'));
    expect(Math.min(...valores)).toBeGreaterThanOrEqual(2);
    expect(Math.max(...valores)).toBeLessThanOrEqual(12);
  });

  it('Rebelde Agitador: T$ 6d12 (Atlas p. 477)', () => {
    const valores = rolagens(origem('Rebelde Agitador'));
    expect(Math.min(...valores)).toBeGreaterThanOrEqual(6);
    expect(Math.max(...valores)).toBeLessThanOrEqual(72);
  });

  it('Sucateiro de Batalhas: T$ 4d6 (Atlas p. 478)', () => {
    const valores = rolagens(origem('Sucateiro de Batalhas'));
    expect(Math.min(...valores)).toBeGreaterThanOrEqual(4);
    expect(Math.max(...valores)).toBeLessThanOrEqual(24);
  });

  it('Barão Arruinado: o T$ 200 é o valor do anel, não dinheiro (Atlas p. 471)', () => {
    expect(origem('Barão Arruinado').getMoney).toBeUndefined();
  });

  const OPTIONS: SelectOptions = {
    nivel: 1,
    raca: 'Humano',
    classe: 'Guerreiro',
    origin: 'Marujo',
    devocao: { label: '--', value: '--' },
    supplements: [SupplementId.TORMENTA20_CORE],
  };

  const valorDoPasso = (sheet: ReturnType<typeof generateEmptySheet>) => {
    const passo = sheet.steps.find((s) => s.label === 'Dinheiro Inicial');
    return Number(String(passo?.value[0]?.value).match(/T\$ (\d+)/)?.[1]);
  };

  it('ficha aleatória soma o dinheiro de origem não regional', () => {
    let historicosConferidos = 0;
    for (let i = 0; i < 30; i += 1) {
      const sheet = generateRandomSheet(OPTIONS);
      const extra = (sheet.dinheiro ?? 0) - valorDoPasso(sheet);
      expect(extra).toBeGreaterThanOrEqual(2);
      expect(extra).toBeLessThanOrEqual(12);
      // O histórico da origem (quando o passo existe) mostra o mesmo valor
      // somado à ficha.
      const adicional = sheet.steps
        .flatMap((s) => s.value)
        .find((v) => v.name === 'Dinheiro adicional');
      if (adicional) {
        expect(adicional.value).toBe(`T$ ${extra}`);
        historicosConferidos += 1;
      }
    }
    expect(historicosConferidos).toBeGreaterThan(0);
  });

  it('assistente sem Mercado usa o dinheiro de origem já rolado', () => {
    const sheet = generateEmptySheet(OPTIONS, {
      initialMoneyRoll: { amount: 10 },
      originMoneyRoll: 7,
    });
    expect(sheet.dinheiro).toBe(17);
  });
});
