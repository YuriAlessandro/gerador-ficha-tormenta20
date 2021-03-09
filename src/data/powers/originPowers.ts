import { OriginPower } from '../../interfaces/Poderes';

const originPowers: Record<string, OriginPower> = {
  MEMBRO_DA_IGREJA: {
    name: 'Membro da Igreja',
    description:
      'Você consegue hospedagem e informação em qualquer templo de sua divindade, para você e seus aliados.',
  },
  AMIGO_ESPECIAL: {
    name: 'Amigo Especial',
    description:
      'Você recebe +5 em testes de Adestramento com animais comuns. Além disso, possui um animal de estimação que o auxilia e o acompanha em suas aventuras. Em termos de jogo, é um aliado que fornece +2 em uma perícia a sua escolha (exceto Luta ou Pontaria e aprovada pelo mestre) e não conta em seu limite de aliados.',
  },
  LEMBRANCAS_GRADUAIS: {
    name: 'Lembranças Graduais',
    description:
      'Durante suas aventuras, em determinados momentos a critério do mestre, você pode fazer um teste de Sabedoria (CD 10) para reconhecer pessoas, criaturas ou lugares que tenha encontrado antes de perder a memória.',
  },
  SANGUE_AZUL: {
    name: 'Sangue Azul',
    description:
      'Você tem alguma influência política, suficiente para ser tratado com mais leniência pela guarda, conseguir uma audiência com o nobre local etc.',
  },
  FRUDOS_DO_TRABALHO: {
    name: 'Frutos do Trabalho',
    description:
      'Quando passa em um teste de Ofício para sustento, você recebe o dobro do dinheiro.',
  },
  DOM_ARTISTICO: {
    name: 'Dom artístico',
    description:
      'Quando usa a perícia Atuação para fazer uma apresentação e passa no teste, você ganha o dobro de tibares.',
  },
  ESSE_CHEIRO: {
    name: 'Esse Cheiro...',
    description:
      'Você recebe +2 em Fortitude e passa automaticamente em testes de Ofício (alquimia) para identificar itens alquímicos.',
  },
  PROVA_DE_TUDO: {
    name: 'À Prova de Tudo',
    description:
      'Você não sofre penalidade em deslocamento e Sobrevivência por clima ruim e por terreno difícil natural.',
  },
  CONFISSAO: {
    name: 'Confissão',
    description:
      'Você pode usar Intimidação para obter informação sem custo (veja Investigação).',
  },
  ALPINISTA_SOCIAL: {
    name: 'Alpinista Social',
    description:
      'Você pode substituir testes de Diplomacia por testes de Enganação.',
  },
  TRUQUE_DE_MAGICA: {
    name: 'Truque de Mágica',
    description:
      'Você pode lançar Explosão de Chamas, Hipnotismo e Transmutar Objetos, mas apenas com o aprimoramento Truque. Esta não é uma habilidade mágica — os efeitos provêm de truques e prestidigitação.',
  },
  PUNGUISTA: {
    name: 'Punguista',
    description:
      'Você pode fazer testes de Ladinagem para sustento, como a perícia Ofício.',
  },
  MEDICO_DE_CAMPO: {
    name: 'Médico de Campo',
    description:
      'Quando você faz primeiros socorros em um personagem com 0 ou menos PV, ele recupera 1d6 PV.',
  },
  BUSCA_INTERIOR: {
    name: 'Busca Interior',
    description:
      'Quando você e seus companheiros estão diante de um mistério, incapazes de prosseguir, você pode gastar 1 PM para meditar sozinho durante algum tempo e receber uma dica do mestre.',
  },
  DESEJO_DE_LIBERDADE: {
    name: 'Desejo de Liberdade',
    description:
      'Ninguém voltará a torná-lo um escravo! Você recebe +5 em testes contra efeitos que possam aprisioná-lo, como a manobra agarrar ou a magia Imobilizar.',
  },
  PALPITE_FUNDAMENTADO: {
    name: 'Palpite Fundamentado',
    description:
      'Você pode gastar 2 PM para substituir um teste de qualquer perícia originalmente baseada em Inteligência ou Sabedoria por um teste de Conhecimento.',
  },
  AGUA_NO_FEIJAO: {
    name: 'Água no Feijão',
    description:
      'Você gasta apenas metade da matéria-prima para testes de Ofício (cozinheiro).',
  },
  CULTURA_EXOTICA: {
    name: 'Cultura Exótica',
    description:
      'Por sua diferente visão de mundo, você encontra soluções inesperadas. Você pode gastar 1 PM para fazer um teste de perícia somente treinada, mesmo sem ser treinado na perícia.',
  },
  PAO_E_CIRCO: {
    name: 'Pão e Circo',
    description:
      'Por seu treino em combates de exibição, você sabe “bater sem machucar”. Pode escolher causar dano não letal sem sofrer a penalidade de –5.',
  },
  DETETIVE: {
    name: 'Detetive',
    description:
      'Você pode substituir testes de Percepção e Intuição por testes de Investigação.',
  },
  HERANCA: {
    name: 'Herança',
    description:
      'Você herdou um item de preço de até T$ 1.000. Você pode escolher este poder duas vezes, para um item de até T$ 2.000.',
  },
  AMIGO_DOS_PLEBEUS: {
    name: 'Amigo dos Plebeus',
    description:
      'Você consegue hospedagem gratuita, para você e seus aliados, em famílias ou comunidades plebeias.',
  },
  PASSAGEM_DE_NAVIO: {
    name: 'Passagem de Navio',
    description:
      'Você consegue transporte marítimo para você e seus companheiros, sem custos, desde que todos paguem com trabalho (passar em pelo menos um teste de perícia adequado durante a viagem).',
  },
  VENDEDOR_DE_CARCACAS: {
    name: 'Vendedor de Carcaças',
    description:
      'Você pode fazer testes de Sobrevivência para sustento, como a perícia Ofício.',
  },
  REDE_DE_CONTATOS: {
    name: 'Rede de Contatos',
    description:
      'Graças à influência de sua guilda, você pode usar Diplomacia para obter informação sem custo (veja Investigação).',
  },
  NEGOCIACAO: {
    name: 'Negociação',
    description:
      'Você pode vender itens 10% mais caro (não cumulativo com barganha).',
  },
  ESCAVADOR: {
    name: 'Escavador',
    description:
      'Você se torna proficiente em picareta e não sofre penalidade em deslocamento por terreno difícil em masmorras e subterrâneos.',
  },
  MOCHILEIRO: {
    name: 'Mochileiro',
    description:
      'Você não sofre a penalidade de armadura e a redução de deslocamento por transportar carga pesada.',
  },
  QUEBRA_GALHO: {
    name: 'Quebra-galho',
    description:
      'Em cidades ou metrópoles, você pode comprar qualquer item não superior ou mágico por metade do custo normal. Esses itens não podem ser vendidos (são velhos, sujos, furtados...).',
  },
  ESTOICO: {
    name: 'Estoico',
    description:
      'Sua recuperação de pontos de vida e pontos de mana com descanso aumenta em uma categoria: normal em condições ruins, confortável em condições normais e assim por diante. Veja as regras de recuperação na página 106.',
  },
  ANTIGO_MESTRE: {
    name: 'Antigo Mestre',
    description:
      'Você ainda mantém contato com o herói que costumava servir. A critério do mestre, em uma emergência, você pode receber alguma ajuda — ou então uma bela bronca por esperar que heróis poderosos resolvam o seu problema!',
  },
  VIDA_RUSTICA: {
    name: 'Vida Rústica',
    description:
      'Você come coisas que fariam um avestruz vomitar e também consegue descansar nos lugares mais desconfortáveis (mesmo dormindo ao relento, sua recuperação de PV e PM nunca é inferior a seu próprio nível).',
  },
  INFLUENCIA_MILITAR: {
    name: 'Influência Militar',
    description:
      'Você fez amigos nas forças armadas. Onde houver acampamentos ou bases militares, você pode conseguir hospedagem e informações para você e seus aliados.',
  },
  GOROROBA: {
    name: 'Gororoba',
    description:
      'Você prepara comidas em uma categoria de tempo menor (uma hora para comidas de até T$ 10, um dia para comidas de até T$ 100 etc.). Você ainda pode sofrer uma penalidade de –5 no teste de Ofício para diminuir o tempo em mais uma categoria (uma hora baixa para dez minutos).',
  },
  ESFORCADO: {
    name: 'Esforçado',
    description:
      'Você não teme trabalho duro, nem prazos apertados. Você recebe um bônus de +2 em todos os testes de perícias estendidos.',
  },
};

export default originPowers;
