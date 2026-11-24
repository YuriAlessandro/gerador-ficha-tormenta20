import type Equipment from '../interfaces/Equipment';

/** Instrumentos do livro básico (fichas antigas não têm o marcador). */
const INSTRUMENT_NAMES = new Set([
  'Alaúde élfico',
  'Flauta mística',
  'Instrumento musical',
  'Tambor das profundezas',
]);

/**
 * O item é um instrumento musical (JdA, quadro "Instrumentos Musicais")? Pelo
 * marcador do dado, pelo nome do catálogo ou pela descrição ("Conta como
 * instrumento musical"), para valer também em itens copiados para fichas
 * antigas e em homebrew.
 */
export function isMusicalInstrument(item: Equipment): boolean {
  if (item.musicalInstrument) return true;
  if (item.group !== 'Item Geral') return false;
  return (
    INSTRUMENT_NAMES.has(item.nome) ||
    /instrumento musical/i.test(item.descricao ?? '')
  );
}
