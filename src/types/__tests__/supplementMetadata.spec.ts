import { describe, expect, it } from 'vitest';
import { TORMENTA20_SYSTEM } from '../../data/systems/tormenta20';
import { SUPPLEMENT_METADATA, SupplementId } from '../supplement.types';

/**
 * As contagens das descrições envelheciam em silêncio: Ameaças de Arton
 * adiciona 31 poderes e a descrição não mencionava nenhum, e o número de
 * equipamentos dela era o de outro suplemento.
 *
 * Aqui cada número declarado é conferido contra os dados que o suplemento de
 * fato registra — editar conteúdo sem atualizar a descrição quebra a suíte.
 */

type Contagens = {
  racas: number;
  classes: number;
  variantes: number;
  origens: number;
  divindades: number;
  poderes: number;
  poderesDeClasse: number;
  magias: number;
  equipamentos: number;
};

const tamanho = (valor: unknown): number => {
  if (Array.isArray(valor)) return valor.length;
  if (valor && typeof valor === 'object') return Object.keys(valor).length;
  return 0;
};

const somar = (grupo: unknown): number =>
  Object.values((grupo ?? {}) as Record<string, unknown>).reduce(
    (acc: number, valor) => acc + tamanho(valor),
    0
  );

const contar = (id: SupplementId): Contagens => {
  const s = TORMENTA20_SYSTEM.supplements[id] as unknown as Record<
    string,
    unknown
  >;

  return {
    racas: tamanho(s.races),
    classes: tamanho(s.classes),
    variantes: tamanho(s.variantClasses),
    origens: tamanho(s.origins),
    divindades: tamanho(s.divindades),
    poderes: somar(s.powers),
    poderesDeClasse: somar(s.classPowers),
    magias: somar(s.spells),
    equipamentos: somar(s.equipment),
  };
};

/** O que cada descrição AFIRMA, para ser conferido contra o dado. */
const DECLARADO: Partial<Record<SupplementId, Partial<Contagens>>> = {
  [SupplementId.TORMENTA20_AMEACAS_ARTON]: {
    racas: 29,
    poderes: 31,
    equipamentos: 64,
    magias: 7,
  },
  [SupplementId.TORMENTA20_ATLAS_ARTON]: { origens: 66, poderes: 1 },
  [SupplementId.TORMENTA20_DEUSES_ARTON]: {
    classes: 1,
    poderes: 75,
    magias: 29,
    equipamentos: 67,
  },
  [SupplementId.TORMENTA20_HEROIS_ARTON]: {
    racas: 5,
    classes: 1,
    variantes: 14,
    origens: 30,
    poderes: 149,
    poderesDeClasse: 288,
    magias: 22,
  },
  [SupplementId.TORMENTA20_DEUSES_MENORES]: {
    divindades: 63,
    poderes: 63,
  },
};

describe('descrições dos suplementos', () => {
  it.each(Object.keys(DECLARADO) as SupplementId[])(
    '%s declara contagens que batem com os dados',
    (id) => {
      const real = contar(id);
      const declarado = DECLARADO[id]!;

      Object.entries(declarado).forEach(([chave, valor]) => {
        expect(
          real[chave as keyof Contagens],
          `${id}: descrição diz ${valor} ${chave}`
        ).toBe(valor);
      });
    }
  );

  it('todo número da descrição está declarado aqui', () => {
    // Guarda contra descrição que ganha um número novo sem entrar na tabela
    // acima — aí ele voltaria a envelhecer sem ninguém perceber.
    Object.entries(SUPPLEMENT_METADATA).forEach(([id, meta]) => {
      // O core não declara contagem — o "20" da descrição dele é o nome do
      // sistema, não um número de conteúdo.
      if (id === SupplementId.TORMENTA20_CORE) return;

      const numeros = (meta?.description ?? '').match(/\d+/g) ?? [];
      if (numeros.length === 0) return;

      const declarado = Object.values(DECLARADO[id as SupplementId] ?? {});
      numeros.forEach((n) =>
        expect(declarado, `${id}: "${n}" não conferido`).toContain(Number(n))
      );
    });
  });
});
