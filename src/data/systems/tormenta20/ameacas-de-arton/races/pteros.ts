import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const pterosAbilities: RaceAbility[] = [
  {
    name: 'Ligação Natural',
    description:
      'Você possui uma ligação mental com uma criatura inteligente (Int -3 ou mais). Vocês podem se comunicar mentalmente em alcance longo e sempre sabem em que direção e distância podem encontrar o outro. Você pode trocar a criatura com a qual mantém o vínculo no início de cada aventura.',
  },
  {
    name: 'Mãos Rudimentares',
    description:
      'Suas mãos não permitem que você empunhe itens, a menos que sejam mágicos ou especialmente adaptados para você (o que demora um dia e custa 50% do preço do item, sem contar melhorias). Seus itens iniciais, e aqueles recebidos por sua origem ou habilidades, são adaptados para você.',
  },
  {
    name: 'Pés Rapinantes',
    description:
      'Seus pés são duas armas naturais de garras (dano 1d6 cada, crítico x2, corte). Uma vez por rodada, quando usa a ação aérea para aterrar com uma arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com uma das garras, desde que ela esteja livre e não tenha sido usada para atacar neste turno. Como alternativa, se tiver habilidades que exijam uma arma secundária (como Estilo de Duas Armas), você pode usá-las com suas garras.',
  },
  {
    name: 'Senhor dos Céus',
    description:
      'Você pode pairar a 1,5m do chão com deslocamento 9m. Isso permite que você ignore terreno difícil e o torna imune a dano por queda (a menos que esteja inconsciente). Se não estiver usando armadura pesada, você pode gastar 1 PM por rodada para voar com deslocamento de 12m. Quando abre suas asas para pairar ou voar, você ocupa o espaço de uma criatura de uma categoria de tamanho maior que a sua.',
  },
  {
    name: 'Sentidos Rapinantes',
    description:
      'Você recebe visão na penumbra e +2 em Percepção e Sobrevivência.',
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Sentidos Rapinantes' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Sentidos Rapinantes' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
];

const PTEROS: Race = {
  name: 'Pteros',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    LENA: 1,
    MARAH: 1,
    WYNNA: 1,
  },
  abilities: pterosAbilities,
};

export default PTEROS;
