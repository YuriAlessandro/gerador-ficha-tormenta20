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

/** Cada mil moedas, independentemente do tipo, ocupam 1 espaço. */
export function calculateCurrencySpaces(
  dinheiro = 0,
  dinheiroTC = 0,
  dinheiroTO = 0
): number {
  return (
    Math.floor(dinheiro / 1000) +
    Math.floor(dinheiroTC / 1000) +
    Math.floor(dinheiroTO / 1000)
  );
}

/** Espaços ocupados pelos itens carregados e pelas moedas. */
export function getUsedSpaces(sheet: CharacterSheet): number {
  // Após cloneDeep/serialização o Bag pode ter perdido os métodos de classe.
  const bagSpaces = sheet.bag?.getSpaces
    ? sheet.bag.getSpaces()
    : sheet.bag?.spaces ?? 0;
  return (
    bagSpaces +
    calculateCurrencySpaces(sheet.dinheiro, sheet.dinheiroTC, sheet.dinheiroTO)
  );
}

/** A carga passou do limite (JDA, "Usando & Carregando"). */
export function isOverloaded(sheet: CharacterSheet): boolean {
  return getUsedSpaces(sheet) > (sheet.customMaxSpaces ?? sheet.maxSpaces);
}

/**
 * A condição "Sobrecarregado" está ligada e já aplica os próprios bônus. É a
 * MESMA condição que o excesso de carga impõe, então os efeitos não acumulam.
 */
export function hasOverloadedCondition(sheet: CharacterSheet): boolean {
  return (sheet.sheetBonuses ?? []).some(
    (bonus) =>
      bonus.source?.type === 'condition' &&
      bonus.source.conditionId === 'sobrecarregado'
  );
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
