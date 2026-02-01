import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';

/**
 * Poderes da Tormenta do suplemento Heróis de Arton
 */
const tormentaPowers: Record<string, GeneralPower> = {
  BOLSOES_INSANOS: {
    name: 'Bolsões Insanos',
    description:
      'Seu corpo possui espaços vazios sob sua pele ou carapaça, possibilitando que você carregue mais itens, em lugares nos quais eles dificilmente serão achados. Seu limite de carga aumenta em 2 espaços, mais 1 espaço para cada outro poder da Tormenta que você possui, e você recebe +5 em testes de Ladinagem para ocultar itens nesses espaços.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Bolsões Insanos' },
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  CARAPACA_CORROMPIDA: {
    name: 'Carapaça Corrompida',
    description:
      'As placas quitinosas que recobrem seu corpo são especialmente grossas, formadas por matéria vermelha que parece repelir os elementos físicos de Arton. Você recebe redução de dano 1. Essa RD aumenta em +1 para cada dois outros poderes da Tormenta que você possui.',
    type: GeneralPowerType.TORMENTA,
    requirements: [[{ type: RequirementType.PODER, name: 'Carapaça' }]],
  },
  REPULSIVO: {
    name: 'Repulsivo',
    description:
      'A presença da Tempestade Rubra em você é tão forte que é difícil olhar em sua direção. O primeiro ataque de cada inimigo contra você em cada cena sofre uma penalidade igual ao total de poderes da Tormenta que você possui (incluindo este). Após o primeiro ataque, os inimigos já se acostumaram com sua aparência atroz e não sofrem mais essa penalidade.',
    type: GeneralPowerType.TORMENTA,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Carisma', value: -1 }],
    ],
  },
  SECRECAO_CICATRIZANTE: {
    name: 'Secreção Cicatrizante',
    description:
      'Você pode gastar uma ação padrão e 2 PM para secretar um fluido rubro e viscoso sobre você mesmo ou uma criatura adjacente. O alvo recupera 2d6+2 PV mas fica enjoado por 1 rodada (Fort CD Con evita). Para cada dois outros poderes da Tormenta que você possui, a cura aumenta em +1d6+1 e a CD aumenta em +1.',
    type: GeneralPowerType.TORMENTA,
    requirements: [],
  },
  SIMETRIA_RADIAL: {
    name: 'Simetria Radial',
    description:
      'Aos poucos, seu físico se rearranjou, abandonando a anatomia artoniana quase que por completo. Seus olhos ficam em lados opostos da cabeça e sua boca fica no topo. Seu tórax adquiriu forma tubular e seus braços e pernas são distribuídos em seu corpo de forma que você não tem mais dois "lados". Você não pode ser flanqueado ou ficar caído e recebe um bônus de +5 para evitar ser agarrado.',
    type: GeneralPowerType.TORMENTA,
    requirements: [[{ type: RequirementType.PODER_TORMENTA, value: 4 }]],
  },
  TEMPO_MISTICO: {
    name: 'Tempo Místico',
    description:
      'Você é capaz de acessar uma pequena parte do controle dos lefeu sobre o tempo. Uma vez por rodada, quando você lança uma magia com execução de movimento, padrão ou completa, pode gastar 2 PM e perder 1d6, 1d8 ou 1d12 PV para diminuir o tempo de execução da magia em um, dois ou três passos, respectivamente (até um mínimo de ação livre). Essa perda de vida só pode ser curada com descanso.',
    type: GeneralPowerType.TORMENTA,
    requirements: [[{ type: RequirementType.PODER_TORMENTA, value: 2 }]],
  },
};

export default tormentaPowers;
