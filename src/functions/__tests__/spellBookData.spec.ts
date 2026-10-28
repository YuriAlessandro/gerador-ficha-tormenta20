import {
  manaExpenseByCircle,
  spellsCircle1,
  spellsCircle2,
  spellsCircle3,
} from '../../data/systems/tormenta20/magias/generalSpells';
import { HEROIS_ARTON_SPELLS } from '../../data/systems/tormenta20/herois-de-arton/spells';
import { Spell } from '../../interfaces/Spells';

/**
 * Dados de magias conferidos com o texto dos livros (varredura de out/2026).
 * Cada caso cita o livro e a página impressa da linha de estatísticas.
 */
describe('Dados de magias conforme o livro', () => {
  it('Orientação: execução padrão e duração 1 rodada (JdA p. 200)', () => {
    const { execucao, duracao, aprimoramentos } = spellsCircle1.orientacao;
    expect(execucao).toBe('Padrão');
    expect(duracao).toBe('1 rodada');
    // É o aprimoramento de +2 PM que muda a duração para cena.
    expect(aprimoramentos?.[0]).toMatchObject({ addPm: 2 });
    expect(aprimoramentos?.[0].text).toMatch(/^muda a duração para cena/);
  });

  it.each([
    ['Relâmpago', spellsCircle2.relampago],
    ['Raio Solar', spellsCircle2.raioSolar],
  ])(
    '%s: alcance pessoal, área linha de 30m (JdA p. 203)',
    (_nome, spell: Spell) => {
      expect(spell.alcance).toBe('Pessoal');
      // A linha sem medida herdava o alcance médio (30m); com alcance pessoal
      // o comprimento tem de estar na própria área.
      expect(spell.area).toBe('Linha de 30m');
    }
  );

  it('Voz Divina: alcance pessoal, alvo você (JdA p. 211)', () => {
    expect(spellsCircle2.vozDivina.alcance).toBe('Pessoal');
    expect(spellsCircle2.vozDivina.alvo).toBe('Você');
  });

  it('Desespero Esmagador: duração instantânea (JdA p. 190)', () => {
    expect(spellsCircle2.desesperoEsmagador.duracao).toBe('Instantânea');
  });

  it('Vidência: resistência Vontade anula (JdA p. 211)', () => {
    expect(spellsCircle3.videncia.resistencia).toBe('Vontade anula');
  });

  it('Discrição: alcance pessoal ou toque (Heróis de Arton p. 253)', () => {
    const discricao = HEROIS_ARTON_SPELLS.universal?.find(
      (s) => s.nome === 'Discrição'
    );
    expect(discricao?.alcance).toBe('Pessoal ou toque');
  });

  describe('Heroísmo (JdA p. 194)', () => {
    const { heroismo } = spellsCircle3;

    it('o aprimoramento custa +2 PM e muda o bônus para +6', () => {
      expect(heroismo.aprimoramentos).toEqual([
        { addPm: 2, text: 'muda o bônus para +6.' },
      ]);
    });

    it('lançar com o aprimoramento gasta 8 PM (6 do 3º círculo + 2)', () => {
      // Mesma conta do SpellCastDialog: custo do círculo + addPm × vezes.
      const base = manaExpenseByCircle[heroismo.spellCircle];
      const aprimoramento = heroismo.aprimoramentos?.[0].addPm ?? 0;
      expect(base).toBe(6);
      expect(base + aprimoramento).toBe(8);
    });
  });
});
