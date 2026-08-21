/**
 * Raças que cada raça TAMBÉM conta como para pré-requisitos de poderes de raça
 * (`RequirementType.RACA`). Fonte única de `Race.countsAsRaces`.
 *
 * Três origens distintas, todas resolvidas pelo mesmo mecanismo:
 *
 * 1. **Raças Variantes** (Ameaças de Arton). O livro define exatamente duas:
 *    - Soterrado (p. 354): "variante da raça osteon… use as habilidades de osteon"
 *    - Trog Anão (p. 39): "variante da raça trog… use as habilidades de trog"
 *
 * 2. **"é considerado um X para efeitos relacionados a raça"** — texto de regra
 *    da própria habilidade racial:
 *    - Meio-Orc, Sangue Orc (AdA p. 31)
 *    - Meio-Elfo, Sangue Élfico (HdA)
 *    - Moreau, Herança (AdA p. 303): "considerado também um humano para
 *      quaisquer fins"
 *
 * 3. **Apelidos do livro** que não batem com o nome do catálogo: os requisitos
 *    de HdA usam "Suraggel" (as duas heranças), "Aggelus"/"Sulfure" (os
 *    exclusivos de cada uma) e "Sereia/Tritão".
 *
 * A relação é de MÃO ÚNICA: um Osteon não conta como Soterrado.
 *
 * Este módulo não importa nada de propósito — é lido tanto pelos arquivos de
 * raça quanto pelo `sheetNormalizer`, que usa o mapa para curar fichas salvas
 * antes do campo existir.
 */
const RACE_COUNTS_AS: Record<string, string[]> = {
  // 1. Raças Variantes
  Soterrado: ['Osteon'],
  'Trog Anão': ['Trog'],

  // 2. "considerado um X para efeitos relacionados a raça"
  'Meio-Orc': ['Orc'],
  'Meio-Elfo': ['Elfo'],
  // A herança específica ("Moreau da Serpente", pré-requisito de Magia
  // Ofídica) é checada por `RequirementType.HERANCA`, não aqui.
  Moreau: ['Humano'],

  // 3. Apelidos usados nos requisitos de HdA
  'Suraggel (Aggelus)': ['Suraggel', 'Aggelus'],
  'Suraggel (Sulfure)': ['Suraggel', 'Sulfure'],
  Sereia: ['Sereia/Tritão'],
};

export default RACE_COUNTS_AS;
