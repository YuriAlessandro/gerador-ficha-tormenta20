import Equipment from '../../../interfaces/Equipment';
import Skill from '../../../interfaces/Skills';

/**
 * Itens de ORIGEM com bônus fixo em perícia, escritos como texto nas origens.
 *
 * Item de origem em texto só ganha efeito quando há um item de mesmo nome no
 * índice de `buildCatalogIndex` (criação: `convertOriginItemsToBagEquipments`;
 * carga: `refreshBagItemsFromCatalog`). Estes não são vendidos — por isso
 * moram aqui, fora dos catálogos de loja, e só entram naquele índice.
 *
 * `aliases`: outros nomes com que o item já foi gravado em fichas (texto antigo
 * do dado e o prefixo "Nx " que a quantidade da origem põe no nome).
 *
 * Itens de origem com bônus condicional ou à escolha (Coleção de livros do
 * Estudioso, instrumento do Forasteiro, títulos do Barão Arruinado, fragmento do
 * Estandarte Vivo, lupa do Assistente Forense) ficam de fora: não são fixos.
 */
const skillBonusItem = (
  nome: string,
  skill: Skill,
  value: number
): Equipment => ({
  nome,
  group: 'Item Geral',
  sheetBonuses: [
    {
      source: { type: 'equipment', equipmentName: nome },
      target: { type: 'Skill', name: skill },
      modifier: { type: 'Fixed', value },
    },
  ],
});

export const ORIGIN_ITEMS_WITH_BONUS: {
  item: Equipment;
  aliases: string[];
}[] = [
  {
    // Capanga — Tormenta20 Jogo do Ano, p. 88.
    item: skillBonusItem(
      'Tatuagem ou outro adereço de sua gangue (+1 em Intimidação)',
      Skill.INTIMIDACAO,
      1
    ),
    aliases: [
      'Tatuagem ou outro adereço de sua gangue aprimorado (+1 em Intimidação)',
    ],
  },
  {
    // Circense — Tormenta20 Jogo do Ano, p. 89 ("três bolas coloridas para
    // malabarismo (+1 em Atuação)"). A origem concede com `qtd: 3`.
    item: skillBonusItem('Bola Colorida (+1 em Atuação)', Skill.ATUACAO, 1),
    aliases: ['3x Bola Colorida (+1 em Atuação)'],
  },
  {
    // Grumete Pirata — Atlas de Arton, p. 475. A origem concede com `qtd: 1`.
    item: skillBonusItem('Tatuagem de tripulação', Skill.INTIMIDACAO, 1),
    aliases: ['1x Tatuagem de tripulação'],
  },
];
