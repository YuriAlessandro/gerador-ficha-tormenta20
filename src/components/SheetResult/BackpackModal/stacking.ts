import Equipment from '../../../interfaces/Equipment';

/**
 * Um item só pode empilhar com outro de mesmo nome quando os dois são
 * realmente intercambiáveis — caso contrário o merge (que mantém `existing` e
 * apenas soma `quantity`) descarta silenciosamente o item adicionado.
 *
 * O bug que isso evita: uma adaga com os encantamentos Formidável + Tumular e
 * apelido "Adaga da Tormenta" continua com `nome: 'Adaga'` e sem `isCustom`
 * (editar um item de catálogo só marca `hasManualEdits`). Adicionar uma adaga
 * comum empilhava nela e devolvia DUAS adagas encantadas; na ordem inversa, os
 * encantamentos eram perdidos.
 *
 * Qualquer uma destas marcas torna o item único na mochila:
 * - `enchantments` / `modifications`: alteram dano, ataque, crítico e bônus
 * - `customDisplayName`: o jogador deu identidade própria ao item
 * - `hasManualEdits`: estatísticas editadas à mão, que o merge sobrescreveria
 *
 * `isCustom` é checado à parte por quem chama, junto da comparação de nome.
 */
export function isStackable(item: Equipment): boolean {
  if (item.enchantments && item.enchantments.length > 0) return false;
  if (item.modifications && item.modifications.length > 0) return false;
  if (item.customDisplayName && item.customDisplayName.trim() !== '')
    return false;
  if (item.hasManualEdits) return false;
  return true;
}
