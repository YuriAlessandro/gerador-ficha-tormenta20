import Race, { RaceAbility } from '../interfaces/Race';

export interface SelectableRaceAbility {
  ability: RaceAbility;
  heritageKey?: string; // ex.: 'Lobo' — apenas para raças com heranças
  value: string; // valor único exibido/armazenado: 'Faro (Lobo)' ou 'Faro'
}

/**
 * Lista as habilidades selecionáveis de uma raça. Raças com heranças (ex.:
 * Moreau) têm `abilities` vazio na raça base — as habilidades vivem em cada
 * herança, então a lista é achatada e cada opção rotulada pela herança.
 */
export function getSelectableRaceAbilities(
  race: Race
): SelectableRaceAbility[] {
  if (race.abilities.length > 0) {
    return race.abilities.map((ability) => ({ ability, value: ability.name }));
  }
  if (race.heritages) {
    return Object.entries(race.heritages)
      .flatMap(([heritageKey, heritage]) =>
        heritage.abilities.map((ability) => ({
          ability,
          heritageKey,
          value: `${ability.name} (${heritageKey})`,
        }))
      )
      .sort((a, b) => a.value.localeCompare(b.value));
  }
  return [];
}

export function findSelectableRaceAbility(
  race: Race,
  storedValue: string
): SelectableRaceAbility | undefined {
  const options = getSelectableRaceAbilities(race);
  return (
    options.find((o) => o.value === storedValue) ??
    // Legado: fichas antigas armazenam só o nome da habilidade
    options.find((o) => o.ability.name === storedValue)
  );
}
