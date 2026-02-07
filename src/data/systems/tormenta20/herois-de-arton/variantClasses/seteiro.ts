import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import PROFICIENCIAS from '../../proficiencias';
import CACADOR from '../../classes/cacador';

const marcaDaPresa = CACADOR.abilities.find(
  (a) => a.name === 'Marca da Presa'
)!;

const SETEIRO: VariantClassOverrides = {
  name: 'Seteiro',
  isVariant: true,
  baseClassName: 'Caçador',
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.PONTARIA, Skill.SOBREVIVENCIA],
    },
  ],
  periciasrestantes: {
    qtd: 6,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.CURA,
      Skill.FORTITUDE,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INVESTIGACAO,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.REFLEXOS,
    ],
  },
  proficiencias: [PROFICIENCIAS.MARCIAIS],
  abilities: [
    {
      name: 'Caminho do Atirador',
      text: 'Você abriu mão do treinamento convencional de um caçador para abraçar o caminho do atirador. Suas habilidades de seteiro relacionadas a ataques e armas só funcionam com arcos e bestas.',
      nivel: 1,
    },
    marcaDaPresa,
    {
      name: 'Tiro de Supressão',
      text: 'Sempre que você causa dano com um arco ou besta em uma criatura que esteja sob efeito de sua Marca da Presa, essa criatura sofre uma penalidade cumulativa de –1 em rolagens de dano, até um valor igual à quantidade de PM gasta em Marca da Presa, até o fim da cena.',
      nivel: 1,
    },
    {
      name: 'Evasão',
      text: 'A partir do 3° nível, quando sofre um efeito que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar. Você ainda sofre dano normal se falhar no teste de Reflexos. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 3,
    },
    {
      name: 'Disparo Constritor',
      text: 'No 5° nível, quando usa a ação mirar, você pode pagar 2 PM. Se fizer isso, pode executar uma manobra entre desarmar, empurrar ou quebrar com um de seus ataques à distância feitos até o fim desse turno.',
      nivel: 5,
    },
    {
      name: 'Rajada de Flechas',
      text: 'A partir do 10° nível, você pode gastar uma ação completa e 2 PM para alvejar uma área com seus disparos. Escolha um ponto no alcance de sua arma, então faça um ataque à distância e compare-o com a Defesa de cada inimigo num raio de 3m dele. Então faça uma rolagem de dano, com um bônus cumulativo de +2 para cada acerto, e aplique-a em cada inimigo atingido. Você gasta apenas uma munição, independente de quantos inimigos atacou.',
      nivel: 10,
    },
    {
      name: 'Evasão Aprimorada',
      text: 'No 13º nível, quando sofre um efeito que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar e sofre apenas metade do dano se falhar. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 13,
    },
    {
      name: 'Sentinela',
      text: 'No 15° nível, uma vez por rodada, quando uma criatura sob efeito de sua Marca da Presa acerta um ataque contra um aliado, você pode gastar 1 PM para fazer um ataque contra essa criatura.',
      nivel: 15,
    },
    {
      name: 'Mestre do Disparo',
      text: 'No 20° nível, você pode usar sua Marca da Presa como uma ação livre. Além disso, uma vez por rodada, quando faz um ataque com um arco ou besta contra um alvo de sua Marca da Presa, você pode fazer um ataque adicional contra ele.',
      nivel: 20,
    },
  ],
};

export default SETEIRO;
