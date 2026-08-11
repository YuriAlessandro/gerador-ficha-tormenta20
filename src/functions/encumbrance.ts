import CharacterSheet from '../interfaces/CharacterSheet';
import Race from '../interfaces/Race';

/**
 * "Devagar e Sempre" (Anão e Trog Anão), Golem e os chassis pesados do Golem
 * Desperto: o deslocamento não é reduzido por excesso de carga nem por uso de
 * armadura. A regra vive na raça (`ignoreEncumbrance`) porque não é um bônus —
 * ela cancela a penalidade dentro de `calcDisplacement`.
 *
 * Osteon, Soterrado e Yidishan herdam a isenção da raça original, como já fazem
 * com deslocamento e tamanho (`getDisplacement`/`getSize` delegam para
 * `oldRace`). Derivamos aqui em vez de copiar a flag no `setup()` porque a
 * raça original também pode ser escolhida no wizard, DEPOIS do setup rodar.
 */
export function raceIgnoresEncumbrance(race?: Race): boolean {
  if (!race) return false;
  if (race.ignoreEncumbrance === true) return true;

  return race.oldRace?.ignoreEncumbrance === true;
}

/**
 * Ponto único de leitura para que os motores de cálculo e os avisos de
 * sobrecarga da UI nunca divirjam (a UI anunciava "−3m" para o anão mesmo com
 * o cálculo, corretamente, não aplicando penalidade alguma).
 */
export function ignoresEncumbrance(sheet: CharacterSheet): boolean {
  return raceIgnoresEncumbrance(sheet.raca);
}

export default ignoresEncumbrance;
