import { describe, expect, it } from 'vitest';
import generateRandomSheet, { applyManualLevelUp } from '@/functions/general';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import { getCavaleiroCaminho } from '@/functions/powers/cavaleiroCaminho';
import SelectOptions from '@/interfaces/SelectedOptions';
import { findClassDescription } from '@/functions/multiclass';
import { SupplementId } from '@/types/supplement.types';

/**
 * Ficha ALEATÓRIA de Vassalo, ponta a ponta.
 *
 * A classe não concede poder em todo nível e não tem catálogo próprio, então
 * o sorteio por nível precisa consultar `powerGrants` — senão ela ou ganha
 * poder em nível que não deveria, ou não ganha nenhum.
 */

const SUPPS = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const VASSALO = findClassDescription('Vassalo', undefined, SUPPS);
const GRANTS = VASSALO?.powerGrants ?? [];

const gerar = (nivel: number) =>
  generateRandomSheet({
    nivel,
    classe: 'Vassalo',
    raca: '',
    origin: '',
    devocao: { label: 'Não devoto', value: '--' },
    supplements: SUPPS,
  } as unknown as SelectOptions);

/** Só os ESCOLHIDOS carregam a classe de origem; os automáticos, não. */
const escolhidos = (sheet: ReturnType<typeof gerar>) =>
  (sheet.classPowers ?? []).filter((power) => power.className);

const grantsAte = (nivel: number) =>
  GRANTS.filter((grant) => grant.level <= nivel).length;

describe('ficha aleatória de Vassalo', () => {
  it.each([1, 2, 3, 5, 7, 9, 12, 16, 20])('gera no nível %i', (nivel) => {
    const sheet = gerar(nivel);

    expect(sheet.classe.name).toBe('Vassalo');

    // Nenhum poder NÃO repetível duplicado. O nível 9 duplicava Autoridade
    // Feudal: ela era oferecida na escolha (é poder de Nobre) e concedida de
    // graça pelo Lorde. `Aumento de Atributo` e afins são `canRepeat` e podem
    // legitimamente aparecer mais de uma vez.
    const nomes = (sheet.classPowers ?? [])
      .filter((power) => !power.canRepeat)
      .map((power) => power.name);
    expect(nomes).toEqual([...new Set(nomes)]);

    // Nunca mais escolhas do que concessões até aquele nível. Pode ser menos:
    // a regra permite trocar o poder de classe por um poder geral.
    expect(escolhidos(sheet).length).toBeLessThanOrEqual(grantsAte(nivel));
  });

  it('não recebe poder de classe abaixo do 2º nível', () => {
    expect(gerar(1).classPowers ?? []).toEqual([]);
  });

  it('todo poder escolhido vem de uma classe declarada na concessão', () => {
    const permitidas = new Set(GRANTS.flatMap((grant) => grant.fromClasses));

    escolhidos(gerar(20)).forEach((power) =>
      expect(permitidas).toContain(power.className)
    );
  });

  it('no 8º nível ganha Golpe Divino, do Paladino', () => {
    // Entra como poder de classe, e não em `classe.abilities`: aquele array é
    // reconstruído da descrição da classe a cada recálculo.
    const nomes = (gerar(8).classPowers ?? []).map((power) => power.name);
    expect(nomes).toContain('Golpe Divino (Paladino)');
  });

  it('no 5º nível o Caminho do Cavaleiro resolve como Montaria', () => {
    // Não é escolha: "você recebe a habilidade Montaria (como Caminho do
    // Cavaleiro)". A habilidade tem uma opção só.
    expect(getCavaleiroCaminho(gerar(5))).toBe('Montaria');
    expect(getCavaleiroCaminho(gerar(4))).toBeUndefined();
  });

  it('no 16º nível já aprendeu uma magia divina', () => {
    // O Vassalo não é conjurador: a magia só pode vir das concessões de 16/20.
    expect(gerar(16).spells.length).toBeGreaterThan(0);
  });

  it('no 20º nível os pontos de atributo do 17 e do 20 foram aplicados', () => {
    const sheet = gerar(20);
    const aumentos = sheet.sheetActionHistory.filter((entry) =>
      entry.changes.some(
        (change) => change.type === 'AttributeIncreasedByAumentoDeAtributo'
      )
    );

    // 3 pontos do Rei Mercenário (17) + 2 do Imperador (20). Pode haver mais,
    // vindos do poder Aumento de Atributo escolhido nas concessões.
    expect(aumentos.length).toBeGreaterThanOrEqual(5);
  });

  it.each([
    [8, 'Escudeiro'],
    [9, 'Autoridade Feudal'],
    [10, 'Título'],
  ])('no nível %i já tem %s, concedido automaticamente', (nivel, powerName) => {
    const nomes = (gerar(nivel).classPowers ?? []).map((power) => power.name);
    expect(nomes).toContain(powerName);
  });

  describe('subindo de nível a partir de uma ficha pronta', () => {
    // Gerar direto no nível e subir até ele são fluxos DIFERENTES: o primeiro
    // passa por `levelUp`, o segundo por `applyManualLevelUp`. Uma concessão
    // ligada só no primeiro passa despercebida até o jogador subir de nível.
    const subir = (sheet: ReturnType<typeof gerar>) =>
      applyManualLevelUp(sheet, {} as unknown as LevelUpSelections);

    it.each([
      [7, 'Escudeiro'],
      [8, 'Autoridade Feudal'],
      [9, 'Título'],
    ])(
      'subindo do %iº nível, tem %s ao chegar no seguinte',
      (nivelAnterior, powerName) => {
        // Sem pré-condição de ausência: os três são poderes de Cavaleiro e o
        // Vassalo pode tê-los ESCOLHIDO antes, nas concessões de 2 a 7. Nesse
        // caso a concessão automática vira no-op — o que importa é o estado
        // final, e que ela não duplique.
        const depois = subir(gerar(nivelAnterior));

        expect(depois.nivel).toBe(nivelAnterior + 1);
        const nomes = (depois.classPowers ?? []).map((power) => power.name);
        expect(nomes).toContain(powerName);
        expect(nomes.filter((name) => name === powerName)).toHaveLength(1);
      }
    );

    it('subindo do 7º, ganha Golpe Divino do Paladino', () => {
      const nomes = (subir(gerar(7)).classPowers ?? []).map(
        (power) => power.name
      );
      expect(nomes).toContain('Golpe Divino (Paladino)');
    });

    it('subir para nível sem concessão não adiciona poder de classe', () => {
      // O 11º nível do Vassalo não concede poder nenhum.
      const nivel10 = gerar(10);
      const antes = (nivel10.classPowers ?? []).length;

      expect(subir(nivel10).classPowers ?? []).toHaveLength(antes);
    });
  });
});
