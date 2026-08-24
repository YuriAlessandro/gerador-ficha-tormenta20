/**
 * Nomes curados para árvores que têm mais de uma entrada.
 *
 * Uma árvore com raiz única se identifica sozinha pelo nome do poder. Quando
 * várias entradas convergem para o mesmo lugar, o padrão é listá-las por
 * extenso — só que as famílias grandes ficam ilegíveis assim ("Armadilha:
 * Arataca · Armadilha: Espinhos · Armadilha: Laço · Armadilha: Rede"). Para
 * essas, um nome coletivo diz mais.
 *
 * A chave é o conjunto de raízes ordenado, então uma variante que herda a
 * mesma árvore (Seteiro herda a do Caçador) pega o nome de graça. Só vale a
 * pena curar nomes que já aparecem literalmente nos poderes — nada de inventar
 * terminologia que não está no livro.
 */
const POWER_TREE_LABELS: Record<string, string> = {
  [[
    'Armadilha: Arataca',
    'Armadilha: Espinhos',
    'Armadilha: Laço',
    'Armadilha: Rede',
  ].join('|')]: 'Armadilhas',
  [[
    'Missa: Bênção da Vida',
    'Missa: Chamado às Armas',
    'Missa: Elevação do Espírito',
    'Missa: Escudo Divino',
    'Missa: Superar as Limitações',
  ].join('|')]: 'Missas',
};

/** Ordenação única usada tanto para montar a chave quanto para exibir. */
export function sortRootNames(rootIds: string[]): string[] {
  return [...rootIds].sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/** Nome coletivo da árvore, ou `undefined` se não houver um curado. */
export function getPowerTreeLabel(rootIds: string[]): string | undefined {
  return POWER_TREE_LABELS[sortRootNames(rootIds).join('|')];
}

export default POWER_TREE_LABELS;
