import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const tenguAbilities: RaceAbility[] = [
  {
    name: 'Asas Desorientadoras',
    description:
      'Quando estão livres, suas asas podem ser usadas para distrair seus oponentes. Se não estiver usando-as para voar, você recebe os benefícios de Finta Aprimorada. Se tiver esse poder, em vez disso o bônus em Enganação para fintar aumenta para +5.',
  },
  {
    name: 'Caminhante do Céu',
    description:
      'Você pode pairar a 1,5m do chão com deslocamento 9m. Isso permite que você ignore terreno difícil e o torna imune a dano por queda (a menos que esteja inconsciente). Você pode gastar 1 PM por rodada para voar com deslocamento de 12m. Você precisa de espaço para abrir suas asas; quando paira ou voa, ocupa o espaço de uma criatura de uma categoria de tamanho maior que a sua.',
  },
  {
    name: 'Espírito Corvino',
    description:
      'Você é uma criatura do tipo espírito e recebe visão no escuro e +2 em Percepção.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Espírito Corvino' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
];

const TENGU: Race = {
  name: 'Tengu',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.INTELIGENCIA, mod: 1 },
    ],
  },
  faithProbability: {
    ARSENAL: 1,
    KHALMYR: 1,
    LINWU: 1,
    TANNATOH: 1,
    VALKARIA: 1,
    WYNNA: 1,
  },
  abilities: tenguAbilities,
};

export default TENGU;
