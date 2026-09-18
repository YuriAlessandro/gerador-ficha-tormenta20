/**
 * Anatomia dos ids do índice da enciclopédia (ver `buildEncyclopediaIndex`):
 * `<prefixo>:<nome>` para entidades e magias, `<prefixo>:<dono>:<nome>` para
 * poderes e habilidades. Nomes podem conter ":" ("Postura de Combate: …").
 */
export type GrimoireFilter =
  | 'all'
  | 'spells'
  | 'powers'
  | 'abilities'
  | 'others';

export type GrimoireCategory = Exclude<GrimoireFilter, 'all'>;

const TWO_PART_PREFIXES = ['spell', 'race', 'class', 'origin', 'deity'];

const CATEGORY_BY_PREFIX: Record<string, GrimoireCategory> = {
  spell: 'spells',
  power: 'powers',
  'class-power': 'powers',
  'origin-power': 'powers',
  'deity-power': 'powers',
  'class-ability': 'abilities',
  'race-ability': 'abilities',
  class: 'others',
  race: 'others',
  origin: 'others',
  deity: 'others',
};

export function prefixOf(id: string): string {
  const colon = id.indexOf(':');
  return colon === -1 ? '' : id.slice(0, colon);
}

/** Nome legível extraído do id, para itens que não estão mais no índice. */
export function nameFromId(id: string): string {
  const [prefix, ...rest] = id.split(':');
  if (rest.length === 0) return id;
  const nameParts = TWO_PART_PREFIXES.includes(prefix) ? rest : rest.slice(1);
  const name = nameParts.join(':').trim();
  return name.length > 0 ? name : id;
}

export function filterOfId(id: string): GrimoireCategory | null {
  return CATEGORY_BY_PREFIX[prefixOf(id)] ?? null;
}
