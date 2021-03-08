import { OriginPower } from '../../interfaces/Poderes';

const originPowers: Record<string, OriginPower> = {
  MEMBRODAIGREJA: {
    name: 'Membro da Igreja',
    description:
      'Você consegue hospedagem e informação em qualquer templo de sua divindade, para você e seus aliados.',
  },
  AMIGOESPECIAL: {
    name: 'Amigo Especial',
    description:
      'Você recebe +5 em testes de Adestramento com animais comuns. Além disso, possui um animal de estimação que o auxilia e o acompanha em suas aventuras. Em termos de jogo, é um aliado que fornece +2 em uma perícia a sua escolha (exceto Luta ou Pontaria e aprovada pelo mestre) e não conta em seu limite de aliados.',
  },
  LEMBRANCASGRADUAIS: {
    name: 'Lembranças Graduais',
    description:
      'Durante suas aventuras, em determinados momentos a critério do mestre, você pode fazer um teste de Sabedoria (CD 10) para reconhecer pessoas, criaturas ou lugares que tenha encontrado antes de perder a memória.',
  },
  SANGUEAZUL: {
    name: 'Sangue Azul',
    description:
      'Você tem alguma influência política, suficiente para ser tratado com mais leniência pela guarda, conseguir uma audiência com o nobre local etc.',
  },
  FRUDOSDOTRABALHO: {
    name: 'Frutos do Trabalho',
    description:
      'Quando passa em um teste de Ofício para sustento, você recebe o dobro do dinheiro.',
  },
  DOMARTISTICO: {
    name: 'Dom artístico',
    description:
      'Quando usa a perícia Atuação para fazer uma apresentação e passa no teste, você ganha o dobro de tibares.',
  },
  ESSECHEIRO: {
    name: 'Esse Cheiro...',
    description:
      'Você recebe +2 em Fortitude e passa automaticamente em testes de Ofício (alquimia) para identificar itens alquímicos.',
  },
  PROVADETUDO: {
    name: 'À Prova de Tudo',
    description:
      'Você não sofre penalidade em deslocamento e Sobrevivência por clima ruim e por terreno difícil natural.',
  },
  CONFISSAO: {
    name: 'Confissão',
    description:
      'Você pode usar Intimidação para obter informação sem custo (veja Investigação).',
  },
  ALPINISTASOCIAL: {
    name: 'Alpinista Social',
    description:
      'Você pode substituir testes de Diplomacia por testes de Enganação.',
  },
  PODER: {
    name: '',
    description: '',
  },
};

export default originPowers;
