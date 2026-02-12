import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import BUCANEIRO from '../../classes/bucaneiro';

const insolencia = BUCANEIRO.abilities.find((a) => a.name === 'Insolência')!;
const esquivaSagaz = BUCANEIRO.abilities.find(
  (a) => a.name === 'Esquiva Sagaz'
)!;

const DUELISTA: VariantClassOverrides = {
  name: 'Duelista',
  isVariant: true,
  baseClassName: 'Bucaneiro',
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ACROBACIA,
      Skill.ATLETISMO,
      Skill.ATUACAO,
      Skill.DIPLOMACIA,
      Skill.FORTITUDE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PILOTAGEM,
      Skill.PONTARIA,
    ],
  },
  abilities: [
    {
      name: 'Duelo',
      text: 'Você pode gastar 2 PM para escolher um oponente em alcance curto e receber +2 em testes de ataque e rolagens de dano contra ele até o fim da cena. Se atacar outro oponente, o bônus termina. A cada cinco níveis, você pode gastar +1 PM para aumentar o bônus em +1.',
      nivel: 1,
    },
    insolencia,
    {
      name: 'Escola de Duelo',
      text: 'No 2º nível, escolha uma escola de duelo. Uma vez feita, essa escolha não pode ser mudada.',
      nivel: 2,
      sheetActions: [
        {
          source: { type: 'class', className: 'Duelista' },
          action: {
            type: 'chooseFromOptions',
            optionKey: 'escolaDeDuelo',
            options: [
              {
                name: 'Escola Ambidestra',
                text: 'Se estiver empunhando duas armas (e pelo menos uma delas for leve), você recebe +2 na Defesa e em Reflexos.',
              },
              {
                name: 'Escola Clássica',
                text: 'Se estiver usando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 em rolagens de dano com essa arma.',
              },
              {
                name: 'Escola de Tiro',
                text: 'Você recebe proficiência com armas de fogo leves e de uma mão. Caso receba essa proficiência novamente, com essas armas você pode usar suas habilidades de bucaneiro normalmente usadas com armas corpo a corpo leves ou ágeis.',
              },
            ],
          },
        },
      ],
    },
    esquivaSagaz,
    {
      name: 'Truques de Capa',
      text: 'A partir do 4º nível, se estiver usando uma capa esvoaçante (ou outro item semelhante aprovado pelo mestre), você pode gastar 2 PM e a ação indicada para gerar um dos efeitos a seguir.',
      nivel: 4,
      sheetActions: [
        {
          source: { type: 'class', className: 'Duelista' },
          action: {
            type: 'chooseFromOptions',
            optionKey: 'truqueDeCapa',
            options: [
              {
                name: 'Capa Inoportuna',
                text: '(Livre). Reduz a ação necessária para fintar em um passo até o fim do seu turno.',
              },
              {
                name: 'Distração Oportuna',
                text: '(Reação). Quando faz um teste de Reflexos ou Vontade, você recebe +5 nesse teste.',
              },
              {
                name: 'Efeito Dramático',
                text: '(Livre). Você recebe +5 em um teste de perícia baseada em Carisma feito nesse turno.',
              },
              {
                name: 'Impulso',
                text: '(Livre). Você recebe deslocamento +9m e +5 em Acrobacia e Atletismo por 1 rodada.',
              },
              {
                name: 'Paraquedas',
                text: '(Reação). Quando cai, você reduz o dano da queda em 6d6.',
              },
              {
                name: 'Rasgar a Capa',
                text: '(Reação). Quando sofre dano, você reduz esse dano à metade. Fazer isso destrói a capa.',
              },
            ],
          },
        },
      ],
    },
    {
      name: 'Técnica Avançada',
      text: 'No 10º nível, você aprende uma técnica de combate conforme sua escola de duelo. Você só pode usar esta habilidade se estiver usando sua escola.',
      nivel: 10,
      sheetActions: [
        {
          source: { type: 'class', className: 'Duelista' },
          action: {
            type: 'chooseFromOptions',
            optionKey: 'tecnicaAvancada',
            linkedTo: 'escolaDeDuelo',
            options: [
              {
                name: 'Escola Ambidestra',
                text: 'Uma vez por rodada, se uma criatura atacá-lo e errar, você pode gastar 1 PM para fazer um ataque corpo a corpo contra essa criatura (desde que ela esteja em seu alcance).',
              },
              {
                name: 'Escola Clássica',
                text: 'O dano de sua escola aumenta para +5. Além disso, uma vez por rodada, quando usa a ação agredir, você pode gastar 1 PM. Se fizer isso e pelo menos um de seus ataques for um acerto crítico, você pode fazer um ataque adicional nessa ação.',
              },
              {
                name: 'Escola de Tiro',
                text: 'Seu dano com armas de fogo aumenta em um passo e seu alcance com essas armas aumenta em uma categoria (de curto para médio, de médio para longo).',
              },
            ],
          },
        },
      ],
    },
    {
      name: 'Duelista Lendário',
      text: 'No 20º nível, seu domínio de sua escola atinge o ápice. Quando faz um ataque utilizando sua escola de duelo, você pode gastar 1 PM para rolá-lo novamente. Quando um oponente o ataca enquanto você está usando sua escola de duelo, você pode gastar 1 PM para forçá-lo a rolar o teste novamente (apenas uma vez por ataque).',
      nivel: 20,
    },
  ],
};

export default DUELISTA;
