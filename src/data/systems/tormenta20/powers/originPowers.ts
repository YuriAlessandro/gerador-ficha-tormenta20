import Skill from '@/interfaces/Skills';
import { OriginPower } from '../../../../interfaces/Poderes';

export const ORIGIN_POWER_TYPE = 'ORIGEM';

const originPowers: Record<string, OriginPower> = {
  MEMBRO_DA_IGREJA: {
    name: 'Membro da Igreja',
    description:
      'Você consegue hospedagem confortável e informação em qualquer templo de sua divindade, para você e seus aliados.',
    type: ORIGIN_POWER_TYPE,
  },
  AMIGO_ESPECIAL: {
    name: 'Amigo Especial',
    description:
      'Você recebe +5 em testes de Adestramento com animais. Além disso, possui um animal de estimação que o auxilia e o acompanha em suas aventuras. Em termos de jogo, é um parceiro que fornece +2 em uma perícia a sua escolha (exceto Luta ou Pontaria e aprovada pelo mestre) e não conta em seu limite de parceiros.',
    type: ORIGIN_POWER_TYPE,
  },
  LEMBRANCAS_GRADUAIS: {
    name: 'Lembranças Graduais',
    description:
      'Durante suas aventuras, em determinados momentos a critério do mestre, você pode fazer um teste de Sabedoria (CD 10) para reconhecer pessoas, criaturas ou lugares que tenha encontrado antes de perder a memória.',
    type: ORIGIN_POWER_TYPE,
  },
  SANGUE_AZUL: {
    name: 'Sangue Azul',
    description:
      'Você tem alguma influência política, suficiente para ser tratado com mais leniência pela guarda, conseguir uma audiência com o nobre local etc.',
    type: ORIGIN_POWER_TYPE,
  },
  FRUTOS_DO_TRABALHO: {
    name: 'Frutos do Trabalho',
    description:
      'No início de cada aventura, você recebe até 5 itens gerais que possa fabricar num valor total de até T$ 50. Esse valor aumenta para T$ 100 no patamar aventureiro, T$ 300 no heroico e T$ 500 no lenda.',
    type: ORIGIN_POWER_TYPE,
  },
  DOM_ARTISTICO: {
    name: 'Dom artístico',
    description:
      'Você recebe +2 em testes de Atuação, e recebe o dobro de tibares em apresentações.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Dom artístico' },
        target: { type: 'Skill', name: Skill.ATUACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  ESSE_CHEIRO: {
    name: 'Esse Cheiro...',
    description:
      'Você recebe +2 em Fortitude e passa automaticamente em testes de Ofício (alquimia) para identificar itens alquímicos em alcance curto.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Esse Cheiro...' },
        target: { type: 'Skill', name: Skill.FORTITUDE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  PROVA_DE_TUDO: {
    name: 'À Prova de Tudo',
    description:
      'Você não sofre penalidade em deslocamento e Sobrevivência por clima ruim e por terreno difícil natural.',
    type: ORIGIN_POWER_TYPE,
  },
  CONFISSAO: {
    name: 'Confissão',
    description:
      'Você pode usar Intimidação para interrogar sem custo e em uma hora (veja Investigação).',
    type: ORIGIN_POWER_TYPE,
  },
  ALPINISTA_SOCIAL: {
    name: 'Alpinista Social',
    description:
      'Você pode substituir testes de Diplomacia por testes de Enganação.',
    type: ORIGIN_POWER_TYPE,
  },
  TRUQUE_DE_MAGICA: {
    name: 'Truque de Mágica',
    description:
      'Você pode lançar Explosão de Chamas, Hipnotismo e Queda Suave, mas apenas com o aprimoramento Truque. Esta não é uma habilidade mágica — os efeitos provêm de prestidigitação.',
    type: ORIGIN_POWER_TYPE,
    sheetActions: [
      {
        source: {
          type: 'power',
          name: 'Truque de Mágica',
        },
        action: {
          type: 'addTruqueMagicSpells',
        },
      },
    ],
  },
  PUNGUISTA: {
    name: 'Punguista',
    description:
      'Você pode fazer testes de Ladinagem para sustento (como a perícia Ofício), mas em apenas um dia. Se passar, recebe o dobro do dinheiro, mas, se falhar, pode ter problemas com a lei (a critério do mestre).',
    type: ORIGIN_POWER_TYPE,
  },
  MEDICO_DE_CAMPO: {
    name: 'Médico de Campo',
    description:
      'Você soma sua Sabedoria aos PV restaurados por suas habilidades e itens mundanos de cura.',
    type: ORIGIN_POWER_TYPE,
  },
  BUSCA_INTERIOR: {
    name: 'Busca Interior',
    description:
      'Quando você e seus companheiros estão diante de um mistério, incapazes de prosseguir, você pode gastar 1 PM para meditar sozinho durante algum tempo e receber uma dica do mestre.',
    type: ORIGIN_POWER_TYPE,
  },
  DESEJO_DE_LIBERDADE: {
    name: 'Desejo de Liberdade',
    description:
      'Ninguém voltará a torná-lo um escravo! Você recebe +5 em testes contra a manobra agarrar e efeitos de movimento.',
    type: ORIGIN_POWER_TYPE,
  },
  PALPITE_FUNDAMENTADO: {
    name: 'Palpite Fundamentado',
    description:
      'Você pode gastar 2 PM para substituir um teste de qualquer perícia originalmente baseada em Inteligência ou Sabedoria por um teste de Conhecimento.',
    type: ORIGIN_POWER_TYPE,
  },
  AGUA_NO_FEIJAO: {
    name: 'Água no Feijão',
    description:
      'Você não sofre a penalidade de –5 e não gasta matéria prima adicional para fabricar pratos para cinco pessoas.',
    type: ORIGIN_POWER_TYPE,
  },
  CULTURA_EXOTICA: {
    name: 'Cultura Exótica',
    description:
      'Por sua diferente visão de mundo, você encontra soluções inesperadas. Você pode gastar 1 PM para fazer um teste de perícia somente treinada, mesmo sem ser treinado na perícia.',
    type: ORIGIN_POWER_TYPE,
  },
  PAO_E_CIRCO: {
    name: 'Pão e Circo',
    description:
      'Por seu treino em combates de exibição, você sabe “bater sem machucar”. Pode escolher causar dano não letal sem sofrer a penalidade de –5.',
    type: ORIGIN_POWER_TYPE,
  },
  DETETIVE: {
    name: 'Detetive',
    description:
      'Você pode gastar 1 PM para substituir testes de Percepção e Intuição por testes de Investigação até o fim da cena.',
    type: ORIGIN_POWER_TYPE,
  },
  HERANCA: {
    name: 'Herança',
    description:
      'Você herdou um item de preço de até T$ 1.000. Você pode escolher este poder duas vezes, para um item de até T$ 2.000.',
    type: ORIGIN_POWER_TYPE,
  },
  CORACAO_HEROICO: {
    name: 'Coração Heroico',
    description:
      'Você recebe +3 pontos de mana. Quando atinge um novo patamar (no 5º, 11º e 17º níveis), recebe +3 PM.',
    type: ORIGIN_POWER_TYPE,
  },
  PASSAGEM_DE_NAVIO: {
    name: 'Passagem de Navio',
    description:
      'Você consegue transporte marítimo para você e seus aliados, sem custos, desde que todos paguem com trabalho (passar em pelo menos um teste de perícia adequado durante a viagem).',
    type: ORIGIN_POWER_TYPE,
  },
  VENDEDOR_DE_CARCACAS: {
    name: 'Vendedor de Carcaças',
    description:
      'Você pode extrair recursos de criaturas em um minuto, em vez de uma hora, e recebe +5 no teste.',
    type: ORIGIN_POWER_TYPE,
  },
  REDE_DE_CONTATOS: {
    name: 'Rede de Contatos',
    description:
      'Graças à influência de sua guilda, você pode usar Diplomacia para interrogar sem custo e em uma hora (veja Investigação).',
    type: ORIGIN_POWER_TYPE,
  },
  NEGOCIACAO: {
    name: 'Negociação',
    description:
      'Você pode vender itens 10% mais caro (não cumulativo com barganha).',
    type: ORIGIN_POWER_TYPE,
  },
  ESCAVADOR: {
    name: 'Escavador',
    description:
      'Você se torna proficiente em picaretas, causa +1 de dano com elas e não é afetado por terreno difícil em masmorras e subterrâneos.',
    type: ORIGIN_POWER_TYPE,
  },
  MOCHILEIRO: {
    name: 'Mochileiro',
    description: 'Seu limite de carga aumenta em 5 espaços.',
    type: ORIGIN_POWER_TYPE,
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Mochileiro' },
        target: { type: 'MaxSpaces' },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  QUEBRA_GALHO: {
    name: 'Quebra-galho',
    description:
      'Em cidades ou metrópoles, você pode comprar qualquer item mundano não superior por metade do preço normal. Esses itens não podem ser matérias-primas e não podem ser revendidos (são velhos, sujos, furtados...).',
    type: ORIGIN_POWER_TYPE,
  },
  ESTOICO: {
    name: 'Estoico',
    description:
      'Sua condição de descanso é uma categoria acima do padrão pela situação (normal em condições ruins, confortável em condições normais e luxuosa em condições confortáveis ou melhores). Veja as regras de recuperação na página 106.',
    type: ORIGIN_POWER_TYPE,
  },
  ANTIGO_MESTRE: {
    name: 'Antigo Mestre',
    description:
      'Você ainda mantém contato com o herói que costumava servir. Uma vez por aventura, ele surge para ajudá-lo por uma cena. Ele é um parceiro mestre de um tipo a sua escolha (definido ao obter este poder) que não conta em seu limite de aliados.',
    type: ORIGIN_POWER_TYPE,
  },
  VIDA_RUSTICA: {
    name: 'Vida Rústica',
    description:
      'Você come coisas que fariam um avestruz vomitar (sendo imune a efeitos prejudiciais de itens ingeríveis) e também consegue descansar nos lugares mais desconfortáveis (mesmo dormindo ao relento, sua recuperação de PV e PM nunca é inferior a seu próprio nível).',
    type: ORIGIN_POWER_TYPE,
  },
  INFLUENCIA_MILITAR: {
    name: 'Influência Militar',
    description:
      'Você fez amigos nas forças armadas. Onde houver acampamentos ou bases militares, você pode conseguir hospedagem e informações para você e seus aliados.',
    type: ORIGIN_POWER_TYPE,
  },
  GOROROBA: {
    name: 'Gororoba',
    description:
      'Você não sofre a penalidade de –5 para fabricar um prato especial adiconal.',
    type: ORIGIN_POWER_TYPE,
  },
  ESFORCADO: {
    name: 'Esforçado',
    description:
      'Você não teme trabalho duro, nem prazos apertados. Você recebe um bônus de +2 em todos os testes de perícias estendidos (incluindo perigos complexos).',
    type: ORIGIN_POWER_TYPE,
  },
};

export default originPowers;
