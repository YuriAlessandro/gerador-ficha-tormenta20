import _ from 'lodash';
import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Bag from '../../interfaces/Bag';
import Equipment from '../../interfaces/Equipment';
import Skill from '../../interfaces/Skills';

/**
 * Os bônus cadastrados na passada dos suplementos precisam CHEGAR na ficha, não
 * só existir no dado. Este spec exercita o caminho inteiro (catálogo →
 * `applyEquipmentBonuses` → Step 8) para cada alvo distinto que a passada usou.
 */
const SUPPLEMENTS: SupplementId[] = [
  SupplementId.TORMENTA20_CORE,
  SupplementId.TORMENTA20_AMEACAS_ARTON,
  SupplementId.TORMENTA20_HEROIS_ARTON,
];

const fromCatalog = (nome: string): Equipment => {
  const catalog = dataRegistry.getEquipmentBySupplements(SUPPLEMENTS);
  const found = [
    ...catalog.clothing,
    ...catalog.generalItems,
    ...catalog.weapons,
    ...catalog.armors,
    ...catalog.shields,
  ].find((item) => item.nome === nome);
  if (!found) throw new Error(`${nome} não está no catálogo`);
  // O catálogo do registry é cache compartilhado — nunca usar a referência.
  return _.cloneDeep(found);
};

const others = (sheet: CharacterSheet, skill: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === skill)?.others ?? 0;

const withItems = (items: Equipment[]): CharacterSheet => {
  const sheet = createMockCharacterSheet();
  const byGroup: Record<string, Equipment[]> = {};
  items.forEach((item) => {
    byGroup[item.group] = [...(byGroup[item.group] || []), item];
  });
  sheet.bag = new Bag(byGroup as never);
  return sheet;
};

describe('bônus de itens dos suplementos chegam na ficha', () => {
  it('Óculos de aeronauta: +1 em Pilotagem', () => {
    const sheet = recalculateSheet(
      withItems([fromCatalog('Óculos de aeronauta')])
    );
    expect(others(sheet, Skill.PILOTAGEM)).toBe(1);
  });

  it('Apito de caça: +1 em Adestramento', () => {
    const sheet = recalculateSheet(withItems([fromCatalog('Apito de caça')]));
    expect(others(sheet, Skill.ADESTRAMENTO)).toBe(1);
  });

  it('Elmo pesado: –5 sem proficiência com armaduras pesadas', () => {
    const base = withItems([fromCatalog('Elmo pesado')]);
    base.classe.proficiencias = [];
    const sheet = recalculateSheet(base);
    expect(others(sheet, Skill.INICIATIVA)).toBe(-5);
    expect(others(sheet, Skill.PERCEPCAO)).toBe(-5);
  });

  it('Elmo pesado: –2 com proficiência (não –7)', () => {
    const base = withItems([fromCatalog('Elmo pesado')]);
    base.classe.proficiencias = ['Armaduras Pesadas'];
    const sheet = recalculateSheet(base);
    expect(others(sheet, Skill.INICIATIVA)).toBe(-2);
    expect(others(sheet, Skill.PERCEPCAO)).toBe(-2);
  });

  it('Elmo leve: proficiência com armaduras pesadas anula a penalidade', () => {
    const semProf = withItems([fromCatalog('Elmo leve')]);
    semProf.classe.proficiencias = [];
    expect(others(recalculateSheet(semProf), Skill.INICIATIVA)).toBe(-2);

    const comProf = withItems([fromCatalog('Elmo leve')]);
    comProf.classe.proficiencias = ['Armaduras Pesadas'];
    expect(others(recalculateSheet(comProf), Skill.INICIATIVA)).toBe(0);
  });

  it('Traje selako: +3m em deslocamento de natação', () => {
    const sheet = recalculateSheet(withItems([fromCatalog('Traje selako')]));
    expect(sheet.computedMovementTypes?.natacao).toBe(3);
  });

  it('Casaca de apetrechos: +4 espaços de carga', () => {
    const semCasaca = recalculateSheet(withItems([]));
    const comCasaca = recalculateSheet(
      withItems([fromCatalog('Casaca de apetrechos')])
    );
    expect(comCasaca.maxSpaces - semCasaca.maxSpaces).toBe(4);
  });

  it('Serrilheira só penaliza Diplomacia/Enganação quando empunhada', () => {
    const serrilheira = fromCatalog('Serrilheira');
    serrilheira.id = 'serr-1';

    // `equipStateMigrated` é obrigatório para testar "guardada": sem a flag,
    // `migrateEquipState` equipa sozinha a primeira arma da mochila.
    const naMochila = withItems([{ ...serrilheira }]);
    naMochila.equipStateMigrated = true;
    expect(others(recalculateSheet(naMochila), Skill.DIPLOMACIA)).toBe(0);

    const empunhando = withItems([{ ...serrilheira }]);
    empunhando.equipStateMigrated = true;
    empunhando.mainHandItemId = 'serr-1';
    const sheet = recalculateSheet(empunhando);
    expect(others(sheet, Skill.DIPLOMACIA)).toBe(-2);
    expect(others(sheet, Skill.ENGANACAO)).toBe(-2);
  });

  it('Armadura de ossos: +1 em Intimidação só quando vestida', () => {
    const armor = fromCatalog('Armadura de ossos');
    armor.id = 'ossos-1';

    const guardada = withItems([{ ...armor }]);
    guardada.wornArmorId = '__none__';
    expect(others(recalculateSheet(guardada), Skill.INTIMIDACAO)).toBe(0);

    const vestida = withItems([{ ...armor }]);
    vestida.wornArmorId = 'ossos-1';
    expect(others(recalculateSheet(vestida), Skill.INTIMIDACAO)).toBe(1);
  });

  it('Cota de moedas: +2 em Diplomacia quando vestida', () => {
    const armor = fromCatalog('Cota de moedas');
    armor.id = 'cota-1';
    const sheet = withItems([armor]);
    sheet.wornArmorId = 'cota-1';
    expect(others(recalculateSheet(sheet), Skill.DIPLOMACIA)).toBe(2);
  });

  it('Veste de teia de aranha: +5 em Furtividade quando vestida', () => {
    const armor = fromCatalog('Veste de teia de aranha');
    armor.id = 'teia-1';
    const sheet = withItems([armor]);
    sheet.wornArmorId = 'teia-1';
    expect(others(recalculateSheet(sheet), Skill.FURTIVIDADE)).toBe(5);
  });

  it('Favor da pessoa amada: +2 PM', () => {
    const sem = recalculateSheet(withItems([]));
    const com = recalculateSheet(
      withItems([fromCatalog('Favor da pessoa amada')])
    );
    expect(com.pm - sem.pm).toBe(2);
  });
});
