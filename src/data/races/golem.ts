import { cloneDeep, merge } from 'lodash';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const GOLEM: Race = {
  name: 'Golem',
  attributes: {
    attrs: [
      { attr: Atributo.FORCA, mod: 4 },
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.CARISMA, mod: -2 },
    ],
    texts: [
      'Como uma ação completa, você pode gastar pontos de mana para recuperar pontos de vida, à taxa de 5 PV por PM.',
      'Seu corpo artificial é resistente, mas rígido. Você recebe +2 na Defesa (JÁ INCLUSO), mas possui penalidade de armadura –2 e seu deslocamento é 6m. Você leva um dia para vestir ou remover uma armadura (pois precisa acoplar as peças dela a seu chassi).',
      'Você é uma criatura do tipo construto. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, não recupera pontos de vida por descanso e não se beneficia de habilidades de cura e itens ingeríveis (comidas, poções etc.). Você precisa ficar inerte por oito horas por dia para recarregar sua fonte de energia. Se fizer isso, recupera PM por descanso em condições normais (golens não são afetados por condições boas ou ruins de descanso).',
      'Escolha entre água (frio), ar (eletricidade), fogo (fogo) e terra (ácido). Você é imune a dano causado por essa energia. Se fosse sofrer dano mágico dessa energia, em vez disso cura PV em quantidade igual à metade do dano. Por exemplo, se um golem com espírito elemental do fogo é atingido por uma Bola de Fogo que causa 30 pontos de dano, em vez de sofrer esse dano, ele recupera 15 PV.',
      'Como uma criatura artificial, você já foi construído “pronto”. Não teve uma infância — portanto, não tem direito a escolher uma origem e receber benefícios por ela.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    TANNATOH: 1,
    WYNNA: 1,
  },
  getDisplacement: () => 6,
  abilities: [
    {
      name: 'Canalizar Reparos',
      description:
        'Como uma ação completa, você pode gastar pontos de mana para recuperar pontos de vida, à taxa de 5 PV por PM.',
    },
    {
      name: 'Chassi',
      description:
        'Seu corpo artificial é resistente, mas rígido. Você recebe +2 na Defesa, mas possui penalidade de armadura –2 e seu deslocamento é 6m. Você leva um dia para vestir ou remover uma armadura (pois precisa acoplar as peças dela a seu chassi).',
      action(sheet: CharacterSheet): CharacterSheet {
        const sheetClone = cloneDeep(sheet);
        return merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          defesa: sheetClone.defesa + 2,
          extraArmorPenalty: sheetClone.extraArmorPenalty
            ? sheetClone.extraArmorPenalty + 2
            : 2,
        });
      },
    },
    {
      name: 'Criatura Artificial',
      description:
        'Você é uma criatura do tipo construto. Recebe visão no escuro e imuni- dade a doenças, fadiga, sangramento, sono e vene- nos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, não recupera pontos de vida por descanso e não se beneficia de habilidades de cura e itens ingeríveis (comidas, poções etc.). Você precisa ficar inerte por oito horas por dia para recarregar sua fonte de energia. Se fizer isso, recupera PM por descanso em condições nor- mais (golens não são afetados por condições boas ou ruins de descanso).Você é uma criatura do tipo construto. Recebe visão no escuro e imuni- dade a doenças, fadiga, sangramento, sono e vene- nos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, não recupera pontos de vida por descanso e não se beneficia de habilidades de cura e itens ingeríveis (comidas, poções etc.). Você precisa ficar inerte por oito horas por dia para recarregar sua fonte de energia. Se fizer isso, recupera PM por descanso em condições nor- mais (golens não são afetados por condições boas ou ruins de descanso).',
    },
    {
      name: 'Espírito Elemental',
      description:
        'Escolha entre água (frio), ar (eletricidade), fogo (fogo) e terra (ácido). Você é imune a dano causado por essa energia. Se fosse sofrer dano mágico dessa energia, em vez disso cura PV em quantida- de igual à metade do dano. Por exemplo, se um golem com espírito elemental do fogo é atingido por uma Bola de Fogo que causa 30 pontos de dano, em vez de sofrer esse dano, ele recupera 15 PV.',
    },
    {
      name: 'Sem Origem',
      description:
        'Como uma criatura artificial, você já foi construído “pronto”. Não teve uma infância — portanto, não tem direito a escolher uma origem e receber benefícios por ela.',
    },
  ],
};

export default GOLEM;
