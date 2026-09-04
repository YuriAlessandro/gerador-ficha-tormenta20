/**
 * Novos Poderes de Montarias — Ameaças de Arton
 *
 * O livro publica quatro poderes montados: dois de Combate e dois de Destino.
 * `Combate Montado` é a raiz da cadeia (exige Ginete) e `Resistência Montada`
 * pende dele.
 */
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

export const AMEACAS_ARTON_MOUNT_COMBAT_POWERS: GeneralPower[] = [
  {
    name: 'Combate Montado',
    description:
      'Enquanto estiver montado, você recebe +2 em testes de ataque e rolagens de dano com armas.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PODER, name: 'Ginete' }]],
  },
  {
    name: 'Resistência Montada',
    description:
      'Enquanto estiver montado, sempre que precisar fazer um teste de resistência, você pode gastar 2 PM para usar Cavalgar no lugar da perícia exigida. Se o teste for contra um efeito que permite um teste para reduzir o dano à metade, você não sofre dano algum se passar. Você ainda sofre dano normal se falhar no teste.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PODER, name: 'Combate Montado' }]],
  },
];

export const AMEACAS_ARTON_MOUNT_DESTINY_POWERS: GeneralPower[] = [
  {
    name: 'Adestrar Montaria',
    description:
      'Você recebe +2 em Adestramento. Além disso, escolha um dos efeitos a seguir. Sua montaria se torna veterana ou recebe a habilidade de um outro tipo de parceiro iniciante, entre ajudante, assassino, besta de carga, combatente, fortão, guardião ou vigilante. No caso do ajudante, o mestre deve aprovar as perícias escolhidas. Você só pode ter uma montaria treinada desta forma por vez e, se perdê-la, pode aplicar um treinamento a outra com uma semana de trabalho.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.PERICIA, name: Skill.ADESTRAMENTO },
        { type: RequirementType.NIVEL, value: 7 },
      ],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Adestrar Montaria' },
        target: { type: 'Skill', name: Skill.ADESTRAMENTO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    name: 'Dois Como Um',
    description:
      'Quando faz um teste de Atletismo, Cavalgar, Iniciativa, Luta, Percepção, Pontaria ou Reflexos enquanto montado, você pode gastar 2 PM para rolar dois dados e usar o melhor resultado.',
    type: GeneralPowerType.DESTINO,
    requirements: [[{ type: RequirementType.PODER, name: 'Ginete' }]],
  },
];
