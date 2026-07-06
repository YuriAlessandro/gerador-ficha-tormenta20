import _ from 'lodash';
import CharacterSheet from '../interfaces/CharacterSheet';
import { CharacterAttributes } from '../interfaces/Character';
import Bag from '../interfaces/Bag';
import { Atributo } from '../data/systems/tormenta20/atributos';
import { RACE_SIZES } from '../data/systems/tormenta20/races/raceSizes/raceSizes';

/**
 * Repara invariantes estruturais de uma ficha desserializada (nuvem,
 * localStorage, embed). Documentos antigos ou corrompidos podem chegar sem
 * campos que o restante do app assume como sempre presentes (ex.: um delta
 * update que fez `$unset` de `atributos`), e qualquer acesso quebra o render
 * inteiro via ErrorBoundary.
 *
 * Chamado por `restoreSpellPath`, que já é o chokepoint de todos os caminhos
 * de carga de ficha (MainScreen, SheetViewPage, Owlbear, páginas premium).
 *
 * Regra: só PREENCHE o que falta com defaults neutros — nunca sobrescreve
 * dados presentes. Não fabrica `classe`/`raca` inteiras (ficha sem elas é
 * lixo irrecuperável; quem protege o render nesses casos é o try/catch dos
 * consumidores).
 */
export function normalizeSheet(sheet: CharacterSheet): void {
  if (!sheet.atributos) {
    sheet.atributos = {} as CharacterAttributes;
  }
  Object.values(Atributo).forEach((attr) => {
    const current = sheet.atributos[attr];
    if (!current || typeof current.value !== 'number') {
      sheet.atributos[attr] = { name: attr, value: 0 };
    }
  });

  if (typeof sheet.nome !== 'string') sheet.nome = '';
  if (typeof sheet.nivel !== 'number' || sheet.nivel < 1) sheet.nivel = 1;
  if (typeof sheet.pv !== 'number') sheet.pv = 0;
  if (typeof sheet.pm !== 'number') sheet.pm = 0;
  if (typeof sheet.defesa !== 'number') sheet.defesa = 10;
  if (typeof sheet.displacement !== 'number') sheet.displacement = 9;
  if (typeof sheet.maxSpaces !== 'number') {
    sheet.maxSpaces = 10 + sheet.atributos[Atributo.FORCA].value * 2;
  }

  if (!sheet.size || typeof sheet.size.name !== 'string') {
    sheet.size = _.cloneDeep(RACE_SIZES.MEDIO);
  }

  if (!sheet.bag) sheet.bag = Bag.fromStored();

  if (!Array.isArray(sheet.skills)) sheet.skills = [];
  if (!Array.isArray(sheet.spells)) sheet.spells = [];
  if (!Array.isArray(sheet.generalPowers)) sheet.generalPowers = [];
  if (!Array.isArray(sheet.sheetBonuses)) sheet.sheetBonuses = [];
  if (!Array.isArray(sheet.sheetActionHistory)) sheet.sheetActionHistory = [];
  if (!Array.isArray(sheet.steps)) sheet.steps = [];

  // Todo o pipeline (setup do Arcanista, recalculateSheet, UI) assume esses
  // arrays dentro de classe/raça.
  if (sheet.classe && !Array.isArray(sheet.classe.abilities)) {
    sheet.classe.abilities = [];
  }
  if (sheet.raca && !Array.isArray(sheet.raca.abilities)) {
    sheet.raca.abilities = [];
  }
  if (sheet.raca && !Array.isArray(sheet.raca.attributes?.attrs)) {
    sheet.raca.attributes = { attrs: [] };
  }
}

export default normalizeSheet;
