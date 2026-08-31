/**
 * Sugestões de tags conhecidas do sistema para o seletor de `weaponTags`. O
 * campo aceita qualquer valor livre (freeSolo) — esta lista só preenche o
 * autocomplete com as tags já usadas mecanicamente no catálogo (ver grep por
 * `weaponTags:` em `/data`). `twoHanded` fica de fora de propósito: já tem
 * checkbox dedicado (`Arma de duas mãos`) em `CustomItemForm`.
 */
export interface WeaponTagSuggestion {
  value: string;
  label: string;
}

export const WEAPON_TAG_SUGGESTIONS: WeaponTagSuggestion[] = [
  { value: 'natural', label: 'Natural' },
  { value: 'desarmado', label: 'Desarmado' },
  { value: 'heredrimm', label: 'Heredrimm' },
  { value: 'alongada', label: 'Alongada' },
  { value: 'armaDeMar', label: 'Arma de Mar' },
  { value: 'armaDeFogo', label: 'Arma de Fogo' },
];

const LABEL_BY_VALUE: Record<string, string> = WEAPON_TAG_SUGGESTIONS.reduce(
  (acc, t) => {
    acc[t.value] = t.label;
    return acc;
  },
  {} as Record<string, string>
);

/** Rótulo de exibição de uma tag — usa o rótulo conhecido, ou o valor cru digitado pelo jogador. */
export const weaponTagLabel = (tag: string): string =>
  LABEL_BY_VALUE[tag] ?? tag;
