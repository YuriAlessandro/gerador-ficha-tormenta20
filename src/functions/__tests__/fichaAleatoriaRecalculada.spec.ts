import { cloneDeep } from 'lodash';
import { afterEach, describe, expect, it, vi } from 'vitest';
import generateRandomSheet from '../general';
import { recalculateSheet } from '../recalculateSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import SelectOptions from '../../interfaces/SelectedOptions';
import { SupplementId } from '../../types/supplement.types';

/**
 * A ficha aleatória era exibida direto da saída de `generateRandomSheet`, cujo
 * `levelUp` é incremental: somava o PM de bônus `LevelCalc` a cada nível e de
 * novo no fim, deixava carga/Defesa/deslocamento com o atributo do nível 1,
 * não marcava como treinada a perícia aprendida no level-up etc. Na primeira
 * edição (que recalcula a ficha), os números mudavam sozinhos. A ficha gerada
 * tem que sair igual ao recálculo dela mesma.
 */

// PRNG determinístico (mulberry32) para a geração ser reproduzível.
/* eslint-disable no-bitwise */
const seedRandom = (seed: number) => {
  let a = seed >>> 0;
  vi.spyOn(Math, 'random').mockImplementation(() => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  });
};
/* eslint-enable no-bitwise */

const ALL_SUPPLEMENTS = Object.values(SupplementId);

const derivados = (sheet: CharacterSheet) => ({
  pv: sheet.pv,
  pm: sheet.pm,
  defesa: sheet.defesa,
  displacement: sheet.displacement,
  maxSpaces: sheet.maxSpaces,
  completeSkills: (sheet.completeSkills ?? [])
    .map((skill) => `${skill.name}:${skill.training ?? 0}/${skill.others ?? 0}`)
    .sort(),
  spells: (sheet.spells ?? []).map((spell) => spell.nome).sort(),
});

describe('Ficha aleatória sai recalculada', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Semente i gera nível (i % 20) + 1, raça e classe aleatórias, todos os
  // suplementos. Antes da correção, metade destas sementes divergia (PM,
  // carga, Defesa, perícias).
  it.each(Array.from({ length: 40 }, (_, i) => i))(
    'semente %i: PV/PM/Defesa/carga/deslocamento/perícias iguais aos do recálculo',
    (seed) => {
      seedRandom(seed);
      const sheet = generateRandomSheet({
        nivel: (seed % 20) + 1,
        raca: 'Aleatório',
        classe: 'Aleatório',
        origin: '',
        devocao: { label: '--', value: '--' },
        supplements: ALL_SUPPLEMENTS,
      });

      const recalculada = recalculateSheet(cloneDeep(sheet));

      expect(derivados(sheet)).toEqual(derivados(recalculada));
    }
  );

  /**
   * Guerreiro: "3 PM por nível" (Tormenta20 JdA, p. 65). Sangue Mágico (Elfo):
   * "Você recebe +1 ponto de mana por nível" (JdA, p. 22). Elfo Guerreiro 10
   * sem outra fonte de PM = 3 + 9×3 + 10 = 40. Antes saía 49 (o +1/nível do
   * Sangue Mágico somado a cada level-up e de novo no fim).
   */
  it('Elfo Guerreiro nível 10: PM = 3 por nível + 1 por nível do Sangue Mágico', () => {
    let conferidas = 0;
    for (let seed = 0; seed < 10; seed += 1) {
      seedRandom(seed);
      const sheet = generateRandomSheet({
        nivel: 10,
        raca: 'Elfo',
        classe: 'Guerreiro',
        origin: '',
        devocao: { label: '--', value: '--' },
        supplements: [SupplementId.TORMENTA20_CORE],
      });
      const fontesDePM = sheet.sheetBonuses.filter(
        (bonus) => bonus.target.type === 'PM'
      );
      const soSangueMagico =
        fontesDePM.length === 1 &&
        fontesDePM[0].source.type === 'power' &&
        fontesDePM[0].source.name === 'Sangue Mágico';
      if (soSangueMagico) {
        conferidas += 1;
        expect(sheet.pm).toBe(3 + 9 * 3 + 10);
      }
    }
    // Garante que o caso foi de fato exercitado.
    expect(conferidas).toBeGreaterThan(0);
  });

  /**
   * Rei Mercenário (Vassalo): "você recebe 3 pontos de atributo para
   * distribuir como quiser" (Heróis de Arton, p. 43). Dois pontos no mesmo
   * atributo gravavam entradas de histórico idênticas, e o recálculo (que agora
   * roda no fim da geração) descartava uma: o atributo ficava certo, mas o
   * histórico registrava 2 pontos em vez de 3.
   */
  it('Vassalo nível 20: os 3 pontos do Rei Mercenário sobrevivem ao recálculo', () => {
    seedRandom(0);
    const sheet = generateRandomSheet({
      nivel: 20,
      classe: 'Vassalo',
      raca: '',
      origin: '',
      devocao: { label: 'Não devoto', value: '--' },
      supplements: [
        SupplementId.TORMENTA20_CORE,
        SupplementId.TORMENTA20_HEROIS_ARTON,
      ],
    } as unknown as SelectOptions);
    const pontosDoReiMercenario = (ficha: CharacterSheet) =>
      ficha.sheetActionHistory
        .filter((entry) => entry.powerName === 'Rei Mercenário')
        .flatMap((entry) =>
          entry.changes.filter(
            (change) => change.type === 'AttributeIncreasedByAumentoDeAtributo'
          )
        ).length;

    expect(pontosDoReiMercenario(sheet)).toBe(3);
    expect(pontosDoReiMercenario(recalculateSheet(cloneDeep(sheet)))).toBe(3);
  });
});
