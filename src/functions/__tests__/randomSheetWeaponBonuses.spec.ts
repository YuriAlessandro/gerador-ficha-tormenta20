import generateRandomSheet from '../general';
import { recalculateSheet } from '../recalculateSheet';
import {
  evaluateSimpleModifier,
  isLiveWeaponBonus,
  weaponMatchesScope,
  WeaponBonusScope,
} from '../weaponBonusScope';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Equipment from '../../interfaces/Equipment';
import { SupplementId } from '../../types/supplement.types';

/**
 * Regressão: `generateRandomSheet` termina em `applyStatModifiers`, que não tem
 * ramo para alvos de arma — logo os bônus `WeaponDamage` de habilidades nunca
 * eram bakeados na string `dano`. Ficha pelo wizard ou com level-up funcionava;
 * ficha aleatória não. Sintoma relatado: Bárbaro 3+ aleatório sem o +1 de
 * Instinto Selvagem no dano (Percepção e Reflexos vinham certos).
 *
 * Sobre a montagem destes testes: a ficha é aleatória, então NÃO dá para fixar
 * o total de dano esperado. Duas fontes de variação quebravam a suíte de forma
 * intermitente:
 *
 *  1. o personagem podia começar com itens do grupo "Arma" que não causam dano
 *     (munição, Manopla — `dano: '-'`), e o filtro antigo (`w.dano` truthy) os
 *     incluía;
 *  2. o sorteio de poderes gerais podia trazer um que soma dano (Estilo de
 *     Disparo soma Destreza no dano de armas de disparo), inflando o total.
 *
 * Por isso o esperado é DERIVADO dos bônus da própria ficha, e o que cada teste
 * afirma sobre a classe é verificado direto em `sheet.sheetBonuses` — as duas
 * coisas são determinísticas.
 */
describe('Geração aleatória: bônus de arma bakeados no dano', () => {
  const gerar = (classe: string, nivel: number): CharacterSheet =>
    generateRandomSheet({
      nivel,
      raca: 'Humano',
      classe,
      origin: '',
      devocao: { label: '', value: '' },
      supplements: [SupplementId.TORMENTA20_CORE],
    });

  /** Bônus fixo somado ao final da string de dano ("1d8+3" → 3). */
  const flatBonusOf = (dano?: string): number => {
    const match = /([+-]\d+)\s*$/.exec(dano ?? '');
    return match ? parseInt(match[1], 10) : 0;
  };

  /**
   * Armas de dano de verdade, geradas automaticamente.
   *
   * O grupo "Arma" também guarda munição e a Manopla, que têm `dano: '-'`.
   * Elas nunca recebem bônus de dano, então incluí-las só produzia falha
   * intermitente conforme o sorteio do equipamento inicial.
   */
  const autoWeaponsOf = (sheet: CharacterSheet) =>
    sheet.bag.equipments.Arma.filter(
      (w) => !w.hasManualEdits && /\d+d\d+/.test(w.dano ?? '')
    );

  /**
   * Soma dos bônus de dano que a ficha declara para ESTA arma e que deveriam
   * estar bakeados na string `dano`.
   *
   * Reusa os mesmos predicados de escopo da produção (`weaponMatchesScope` /
   * `isLiveWeaponBonus`). Isso torna o teste cego a um bug de escopo — mas o
   * que ele guarda é outra coisa: que a geração aleatória bakeia alguma coisa.
   * Se o passo sumir de novo, o esperado continua > 0 e o real vira 0.
   */
  const expectedFlatBonus = (
    sheet: CharacterSheet,
    weapon: Equipment
  ): number =>
    (sheet.sheetBonuses ?? []).reduce((sum, bonus) => {
      if (bonus.target.type !== 'WeaponDamage') return sum;
      const scope = bonus.target as WeaponBonusScope;
      if (!weaponMatchesScope(weapon, scope)) return sum;
      // Bônus "vivos" são somados na hora de rolar, não bakeados no `dano`.
      if (isLiveWeaponBonus(weapon, scope, bonus.source.type)) return sum;
      return (
        sum +
        evaluateSimpleModifier(bonus.modifier, sheet.atributos, sheet.nivel)
      );
    }, 0);

  /** Bônus de dano que a habilidade Instinto Selvagem declara na ficha. */
  const instintoSelvagemDamageBonus = (sheet: CharacterSheet): number =>
    (sheet.sheetBonuses ?? [])
      .filter(
        (b) =>
          b.target.type === 'WeaponDamage' &&
          b.source.type === 'power' &&
          b.source.name === 'Instinto Selvagem'
      )
      .reduce(
        (sum, b) =>
          sum +
          evaluateSimpleModifier(b.modifier, sheet.atributos, sheet.nivel),
        0
      );

  it.each([
    [3, 1],
    [9, 2],
  ])(
    'Bárbaro nível %i: Instinto Selvagem concede +%i de dano',
    (nivel, esperado) => {
      const sheet = gerar('Bárbaro', nivel as number);
      // Afirmação sobre a CLASSE: determinística, não depende do sorteio.
      expect(instintoSelvagemDamageBonus(sheet)).toBe(esperado);
    }
  );

  it.each([[3], [9]])(
    'Bárbaro nível %i: os bônus de dano da ficha chegam bakeados nas armas',
    (nivel) => {
      const sheet = gerar('Bárbaro', nivel as number);
      const armas = autoWeaponsOf(sheet);
      expect(armas.length).toBeGreaterThan(0);

      armas.forEach((arma) => {
        const esperado = expectedFlatBonus(sheet, arma);
        // O bônus da classe entra em toda arma, então o esperado nunca é 0 —
        // é isso que faz este teste pegar a regressão original.
        expect(esperado).toBeGreaterThan(0);
        expect(flatBonusOf(arma.dano)).toBe(esperado);
      });
    }
  );

  it('Bárbaro nível 2: a habilidade ainda não existe', () => {
    const sheet = gerar('Bárbaro', 2);
    expect(instintoSelvagemDamageBonus(sheet)).toBe(0);

    autoWeaponsOf(sheet).forEach((arma) => {
      expect(flatBonusOf(arma.dano)).toBe(expectedFlatBonus(sheet, arma));
    });
  });

  it('Guerreiro nível 3: o novo passo não aplica bônus de outra classe', () => {
    const sheet = gerar('Guerreiro', 3);
    expect(instintoSelvagemDamageBonus(sheet)).toBe(0);

    autoWeaponsOf(sheet).forEach((arma) => {
      expect(flatBonusOf(arma.dano)).toBe(expectedFlatBonus(sheet, arma));
    });
  });

  it('ficha aleatória e recalculada concordam no dano', () => {
    // O invariante de verdade: os dois caminhos de derivação (geração aleatória
    // e recalculateSheet) não podem divergir.
    const sheet = gerar('Bárbaro', 9);
    const recalculada = recalculateSheet(sheet);

    const antes = sheet.bag.equipments.Arma.map((w) => `${w.nome}:${w.dano}`);
    const depois = recalculada.bag.equipments.Arma.map(
      (w) => `${w.nome}:${w.dano}`
    );
    expect(depois).toEqual(antes);
  });
});
