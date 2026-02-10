export enum Atributo {
  FORCA = 'Força',
  DESTREZA = 'Destreza',
  CONSTITUICAO = 'Constituição',
  INTELIGENCIA = 'Inteligência',
  SABEDORIA = 'Sabedoria',
  CARISMA = 'Carisma',
}

export const ATTR_ABBREVIATIONS: Record<Atributo, string> = {
  [Atributo.FORCA]: 'For',
  [Atributo.DESTREZA]: 'Des',
  [Atributo.CONSTITUICAO]: 'Con',
  [Atributo.INTELIGENCIA]: 'Int',
  [Atributo.SABEDORIA]: 'Sab',
  [Atributo.CARISMA]: 'Car',
};
