import generateRandomSheet from '../general';
import { recalculateSheet } from '../recalculateSheet';
import { dataRegistry } from '../../data/registry';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { SupplementId } from '../../types/supplement.types';
import { SCHOOL_LABELS } from '../../components/SpellPicker/schoolLabels';
import { computeSpellPmCost, resolveSpellCast } from '../spells/modifiers';
import { getSpellBasePm } from '../spells/engenhoca';

/**
 * Geração aleatória × motor de modificadores de magia, em massa: todas as
 * classes de todos os suplementos, vários níveis, raça sorteada. A ficha é
 * aleatória, então o teste afirma INVARIANTES (nada quebra, custos e escolhas
 * válidos), não valores.
 */
const ALL_SUPPLEMENTS = Object.values(SupplementId);
const LEVELS = [1, 5, 11, 20];
const RUNS_PER_LEVEL = 2;
const SCHOOL_OPTION_NAMES = Object.values(SCHOOL_LABELS);

const classNames = dataRegistry
  .getClassesBySupplements(ALL_SUPPLEMENTS)
  .map((classe) => classe.name);

const generate = (classe: string, nivel: number): CharacterSheet =>
  generateRandomSheet({
    nivel,
    raca: '',
    classe,
    origin: '',
    devocao: { label: '', value: '' },
    supplements: ALL_SUPPLEMENTS,
  });

function assertSpellInvariants(sheet: CharacterSheet, label: string): void {
  (sheet.spells ?? []).forEach((spell) => {
    const profile = resolveSpellCast(sheet, spell);
    const base = getSpellBasePm(spell);
    const cost = computeSpellPmCost(base, profile);
    if (base >= 1 && cost < 1) {
      throw new Error(
        `${label}: ${spell.nome} custa ${cost} PM (base ${base})`
      );
    }
    profile.spellChoices.forEach((slot) => {
      if (slot.used > slot.max) {
        throw new Error(
          `${label}: ${slot.source} com ${slot.used}/${slot.max}`
        );
      }
    });
    if (profile.esoterics.length > profile.esotericLimit) {
      throw new Error(`${label}: esotéricos acima do limite`);
    }
  });
  ['mestreEmEscola', 'especialistaEmEscola'].forEach((key) => {
    (sheet.optionChoices?.[key] ?? []).forEach((value) => {
      if (!SCHOOL_OPTION_NAMES.includes(value)) {
        throw new Error(`${label}: ${key} com escola inválida "${value}"`);
      }
    });
  });
}

describe('geração aleatória com o motor de modificadores de magia', () => {
  it('há classes para testar', () => {
    expect(classNames.length).toBeGreaterThan(10);
  });

  describe.each(classNames)('%s', (classe) => {
    it.each(LEVELS)('nível %i gera, recalcula e resolve as magias', (nivel) => {
      for (let run = 0; run < RUNS_PER_LEVEL; run += 1) {
        const label = `${classe} ${nivel} #${run}`;
        const sheet = generate(classe, nivel);
        assertSpellInvariants(sheet, label);
        // A ficha salva passa por recálculo a cada edição.
        assertSpellInvariants(recalculateSheet(sheet), `${label} (recalc)`);
      }
    });
  });
});
