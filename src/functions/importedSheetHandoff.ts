import type CharacterSheet from '../interfaces/CharacterSheet';

/**
 * Entrega de uma ficha pronta à tela de criação, entre rotas. Fica em memória
 * porque a ficha carrega métodos (`Bag`, `spellPath`), que o estado da
 * navegação não consegue clonar. Quem cria entrega e navega; o `MainScreen`
 * pega ao montar e finaliza como qualquer ficha nova.
 */
let pending: CharacterSheet | null = null;

export function handOffImportedSheet(sheet: CharacterSheet): void {
  pending = sheet;
}

/** Devolve a ficha entregue, uma vez só. */
export function takeImportedSheet(): CharacterSheet | null {
  const sheet = pending;
  pending = null;
  return sheet;
}
