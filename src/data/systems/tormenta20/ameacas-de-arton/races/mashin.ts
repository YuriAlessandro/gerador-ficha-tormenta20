import Race from '../../../../../interfaces/Race';
import MECHANICAL_MARVELS from '../powers/mechanicalMarvels';

// Habilidades fixas do Mashin (compartilhadas com Golem)
const CANALIZAR_REPAROS = {
  name: 'Canalizar Reparos',
  description:
    'Como uma ação completa, você pode gastar pontos de mana para recuperar pontos de vida, à taxa de 5 PV por PM.',
};

const CRIATURA_ARTIFICIAL = {
  name: 'Criatura Artificial',
  description:
    'Você é uma criatura do tipo construto. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, não recupera pontos de vida por descanso e não se beneficia de habilidades de cura e itens ingeríveis (comidas, poções etc.). Você precisa ficar inerte por oito horas por dia para recarregar sua fonte de energia. Se fizer isso, recupera PM por descanso em condições normais (golens não são afetados por condições boas ou ruins de descanso).',
  sheetActions: [
    {
      source: { type: 'power' as const, name: 'Criatura Artificial' },
      action: {
        type: 'addSense' as const,
        sense: 'Visão no escuro',
      },
    },
    {
      source: { type: 'power' as const, name: 'Criatura Artificial' },
      action: {
        type: 'addSense' as const,
        sense: 'Imunidade a doenças, fadiga, sangramento, sono e venenos',
      },
    },
  ],
};

const SEM_ORIGEM = {
  name: 'Sem Origem',
  description:
    'Como uma criatura artificial, você já foi construído "pronto". Não teve uma infância — portanto, não tem direito a escolher uma origem e receber benefícios por ela.',
};

// Habilidade específica do Mashin
const MASHIN_CHASSI = {
  name: 'Mashin (chassi)',
  description:
    '+1 em dois atributos a sua escolha. Você se torna treinado em duas perícias a sua escolha e pode substituir uma dessas perícias por uma maravilha mecânica. Entretanto, você é sempre Médio.',
  sheetActions: [
    {
      source: { type: 'power' as const, name: 'Mashin (chassi)' },
      action: {
        type: 'addProficiency' as const,
        availableProficiencies: [
          'Acrobacia',
          'Adestramento',
          'Atletismo',
          'Atuação',
          'Cavalgar',
          'Conhecimento',
          'Cura',
          'Diplomacia',
          'Enganação',
          'Furtividade',
          'Guerra',
          'Iniciativa',
          'Intimidação',
          'Intuição',
          'Investigação',
          'Jogatina',
          'Ladinagem',
          'Luta',
          'Misticismo',
          'Navegação',
          'Nobreza',
          'Ofício',
          'Percepção',
          'Pilotagem',
          'Pontaria',
          'Reflexos',
          'Religião',
          'Sobrevivência',
          'Vontade',
        ],
        pick: 2,
      },
    },
  ],
};

// Habilidade de Maravilha Mecânica
const MARAVILHA_MECANICA = {
  name: 'Maravilha Mecânica',
  description:
    'Você pode escolher uma Maravilha Mecânica. Você só pode escolher uma Maravilha Mecânica por patamar de nível (Iniciante: 1º ao 4º, Veterano: 5º ao 10º, Campeão: 11º ao 16º, Herói: 17º ao 20º).',
  sheetActions: [
    {
      source: { type: 'power' as const, name: 'Maravilha Mecânica' },
      action: {
        type: 'getGeneralPower' as const,
        availablePowers: MECHANICAL_MARVELS,
        pick: 1,
      },
    },
  ],
};

// DEPRECATED: Mashin foi reimplementado como chassi do Golem Desperto.
// Esta definição é mantida apenas para compatibilidade com fichas existentes.
const MASHIN: Race = {
  name: 'Mashin',
  deprecated: true,

  // Atributos: +1 em dois à escolha
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },

  // Divindades compatíveis (similar ao Golem)
  faithProbability: {
    AHARADAK: 1,
    TANNATOH: 1,
    WYNNA: 1,
  },

  // Habilidades da raça
  abilities: [
    CRIATURA_ARTIFICIAL,
    SEM_ORIGEM,
    MASHIN_CHASSI,
    MARAVILHA_MECANICA,
    CANALIZAR_REPAROS,
  ],

  // Deslocamento padrão: 9m
  getDisplacement: () => 9,
};

export default MASHIN;
