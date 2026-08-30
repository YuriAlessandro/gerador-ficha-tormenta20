import Equipment from '../../../../../interfaces/Equipment';
import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import { RACE_SIZES } from '../../races/raceSizes/raceSizes';

const cascos: Equipment = {
  group: 'Arma',
  nome: 'Cascos',
  dano: '1d8',
  critico: 'x2',
  // Ameaças de Arton p. 105: "dano 1d8, crítico x2, impacto". Estava como
  // perfuração desde que a raça foi adicionada.
  tipo: 'Impac.',
  preco: 0,
  weaponTags: ['natural'],
};

// Os textos de Cascos e Ginete Natural foram escritos sem transcrever o livro:
// os dois terminavam com a MESMA frase incoerente, Cascos trocava seu efeito
// real (1 PM por um ataque extra) por um bypass de pré-requisito que não existe,
// e Ginete Natural citava o poder errado (Ataque em Sela em vez de Carga de
// Cavalaria). Transcritos de Ameaças de Arton, p. 105.
const CASCOS_DESCRIPTION =
  'Você possui uma arma natural de cascos (dano 1d8, crítico x2, impacto). Uma vez por rodada, quando usa a ação agredir para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com os cascos.';

const GINETE_NATURAL_DESCRIPTION =
  'Você é considerado montado para efeito de fazer investidas e para benefícios das armas que empunha, e pode escolher o poder Carga de Cavalaria mesmo sem cumprir seus pré-requisitos. Entretanto, não pode se beneficiar de uma montaria e, se estiver carregando um cavaleiro, sofre –2 em testes (além das penalidades de sobrecarga, se houver) e é considerado em condição ruim para lançar magias.';

/**
 * Fichas salvas embutem a cópia da habilidade da época em que a raça foi
 * escolhida, e abrir uma ficha não dispara recálculo — então a correção do texto
 * não alcançaria quem já é Centauro. Exportado para que `normalizeSheet`
 * refresque essas cópias.
 */
export const CENTAURO_REFRESHED_DESCRIPTIONS: Record<string, string> = {
  Cascos: CASCOS_DESCRIPTION,
  'Ginete Natural': GINETE_NATURAL_DESCRIPTION,
};

/**
 * O mesmo problema, mas para a automação de pré-requisitos — e aqui o refresh é
 * OBRIGATÓRIO, não cosmético: os valores errados não são inertes, eles liberam
 * poderes na ficha.
 *
 * `bypassPrereqForPowersNamed` casa por SUBSTRING (ver `isPowerAvailable`), então
 * o `['Carga', 'Investida']` que estava em Cascos ignorava todos os
 * pré-requisitos de 12 poderes (as 11 Investidas + Carga de Cavalaria). E o
 * `grantsPowerRequirements: ['Ginete']` de Ginete Natural fazia o Centauro
 * satisfazer o pré-requisito Ginete para qualquer poder, liberando também
 * Catafractário. O livro concede exatamente um poder: Carga de Cavalaria.
 *
 * Chave ausente = o campo deve ser APAGADO da cópia embutida.
 */
export const CENTAURO_REFRESHED_PREREQ_HOOKS: Record<
  string,
  { bypassPrereqForPowersNamed?: string[]; grantsPowerRequirements?: string[] }
> = {
  Cascos: {},
  'Ginete Natural': { bypassPrereqForPowersNamed: ['Carga de Cavalaria'] },
};

const CENTAURO: Race = {
  name: 'Centauro',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  // O livro também lista Hippion, que é deus MENOR (Guia de Deuses Menores):
  // `faithProbability` só aceita as 20 divindades de `DivindadeNames`.
  faithProbability: {
    ALLIHANNA: 1,
    MEGALOKK: 1,
  },
  size: RACE_SIZES.GRANDE,
  getDisplacement: () => 12,
  abilities: [
    {
      name: 'Avantajado',
      description: 'Seu tamanho é Grande e seu deslocamento é 12m.',
    },
    {
      name: 'Cascos',
      description: CASCOS_DESCRIPTION,
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Centauro',
          },
          action: {
            type: 'addEquipment',
            equipment: {
              Arma: [cascos],
            },
            description: 'Cascos pode ser usado como arma.',
          },
        },
      ],
    },
    {
      name: 'Ginete Natural',
      description: GINETE_NATURAL_DESCRIPTION,
      // "pode escolher o poder Carga de Cavalaria mesmo sem cumprir seus
      // pré-requisitos" — casamento exato, já que o único pré-requisito de Carga
      // de Cavalaria é o poder Ginete e nenhum outro poder do catálogo contém
      // essa substring.
      bypassPrereqForPowersNamed: ['Carga de Cavalaria'],
    },
    {
      name: 'Medo de Altura',
      description:
        'Se estiver adjacente a uma queda de 3m ou mais (como um buraco ou penhasco), você fica abalado.',
    },
  ],
};

export default CENTAURO;
