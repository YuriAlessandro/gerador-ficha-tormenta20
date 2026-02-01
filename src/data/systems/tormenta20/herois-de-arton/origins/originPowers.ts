import { OriginPower } from '../../../../../interfaces/Poderes';

export const ORIGIN_POWER_TYPE = 'ORIGEM';

/**
 * Poderes de origem do suplemento Heróis de Arton
 */
const heroisArtonOriginPowers: Record<string, OriginPower> = {
  BACHAREL: {
    name: 'Bacharel',
    description:
      'Você é treinado em Conhecimento, Diplomacia e Nobreza. Além disso, uma vez por cena pode usar Diplomacia para mudar atitude como uma ação livre.',
    type: ORIGIN_POWER_TYPE,
  },
  BOTICARIO: {
    name: 'Boticário',
    description:
      'Você é treinado em Cura e Ofício (alquimista). Além disso, pode fabricar poções de duas fórmulas de 1º círculo a sua escolha, como se tivesse o poder Alquimista Iniciado.',
    type: ORIGIN_POWER_TYPE,
  },
  CACADOR_DE_RATOS: {
    name: 'Caçador de Ratos',
    description:
      'Você é treinado em Furtividade, Investigação e Sobrevivência, e recebe +2 em testes de perícias contra criaturas de duas categorias de tamanho menor que a sua (mínimo Minúsculas).',
    type: ORIGIN_POWER_TYPE,
  },
  CAO_DE_BRIGA: {
    name: 'Cão de Briga',
    description:
      'Na primeira vez a cada cena em que você faz a ação agredir, pode fazer um ataque extra.',
    type: ORIGIN_POWER_TYPE,
  },
  CARCEREIRO: {
    name: 'Carcereiro',
    description:
      'Você recebe +2 em testes contra efeitos mentais, Enganação, Furtividade e Intimidação.',
    type: ORIGIN_POWER_TYPE,
  },
  CARPINTEIRO_DE_GUILDA: {
    name: 'Carpinteiro de Guilda',
    description:
      'Você é treinado em Ofício (artesão). Além disso, recebe redução de corte 2 e, em suas mãos, armas de corte ignoram 5 pontos de redução de dano.',
    type: ORIGIN_POWER_TYPE,
  },
  CATADOR_DA_CATASTROFE: {
    name: 'Catador da Catástrofe',
    description:
      'Você é treinado em Fortitude e Percepção. No início de cada aventura, pode fazer um teste de Percepção (CD 15 + metade do seu nível). Se passar, encontra um tesouro correspondente a seu próprio ND.',
    type: ORIGIN_POWER_TYPE,
  },
  CHEF_HYNNE: {
    name: 'Chef Hynne',
    description:
      'Você é treinado em Ofício (cozinheiro). Quando prepara um prato especial, seu benefício dura mais 1 dia (se for um benefício com um uso diário, ele pode ser usado novamente nesse dia).',
    type: ORIGIN_POWER_TYPE,
  },
  CIRURGIAO_BARBEIRO: {
    name: 'Cirurgião-Barbeiro',
    description:
      'Você é treinado em Cura e Ofício (barbeiro). Além disso, pode gastar uma ação completa e 2 PM para remover uma condição de uma criatura adjacente (abalado, alquebrado, apavorado, atordoado, cego, confuso, debilitado, enjoado, envenenado, esmorecido, exausto, fascinado, fatigado, fraco, frustrado, lento, ofuscado, paralisado, pasmo ou surdo). Contudo, a criatura também perde 1d6 pontos de vida.',
    type: ORIGIN_POWER_TYPE,
  },
  CITADINO_ABASTADO: {
    name: 'Citadino Abastado',
    description:
      'Você é treinado em Nobreza e em um Ofício a sua escolha. Se estiver em uma cidade grande, pode gastar T$ 10 x seu nível para aprender algum conhecimento local útil. Se fizer isso, escolha um poder de combate, de destino ou de uma de suas classes cujos pré-requisitos você cumpra. Até o fim da aventura, você pode usar o poder escolhido por uma cena.',
    type: ORIGIN_POWER_TYPE,
  },
  COCHEIRO: {
    name: 'Cocheiro',
    description:
      'Quando está conduzindo um veículo, você e o veículo recebem +2 na Defesa e em testes de resistência.',
    type: ORIGIN_POWER_TYPE,
  },
  CONSTRUTOR: {
    name: 'Construtor',
    description:
      'Você sabe encontrar pontos fracos em construções e estruturas. Pode pagar 2 PM para que você ou um aliado em alcance curto ignore 5 pontos da redução de dano de uma criatura ou objeto em alcance curto por uma cena.',
    type: ORIGIN_POWER_TYPE,
  },
  CONTRABANDISTA: {
    name: 'Contrabandista',
    description:
      'Você recebe +5 em testes de Ladinagem para ocultar itens em si mesmo ou em veículos. Além disso, sua capacidade de carga aumenta em 2 espaços.',
    type: ORIGIN_POWER_TYPE,
  },
  COUREIRO: {
    name: 'Coureiro',
    description:
      'Você pode gastar 10 minutos e T$ 10 para trabalhar em uma armadura de couro (incluindo couro batido, gibão de peles e brunea), aumentar a Defesa dela em +1 e reduzir sua penalidade de armadura em –2 por um dia.',
    type: ORIGIN_POWER_TYPE,
  },
  ESCRIBA: {
    name: 'Escriba',
    description:
      'Você recebe o poder de bardo Lendas e Histórias. Se receber esse poder novamente, em seu lugar recebe um bônus de +5 ao rolar novamente um teste usando seu efeito.',
    type: ORIGIN_POWER_TYPE,
  },
  ESPIAO: {
    name: 'Espião',
    description:
      'Escolha uma de suas perícias (exceto Luta ou Pontaria). Você pode usar Carisma como atributo-chave dessa perícia (em vez do atributo original).',
    type: ORIGIN_POWER_TYPE,
  },
  FERREIRO_MILITAR: {
    name: 'Ferreiro Militar',
    description:
      'Você recebe +2 em rolagens de dano com martelos e marretas de qualquer tipo.',
    type: ORIGIN_POWER_TYPE,
  },
  FREIRA: {
    name: 'Freira',
    description:
      'Quando faz um teste para ajudar, você pode gastar 1 PM para aumentar o bônus da ajuda em +1d4 e, quando usa um efeito de cura, pode gastar 1 PM para aumentar esse efeito em +1 dado do mesmo tipo.',
    type: ORIGIN_POWER_TYPE,
  },
  GORADISTA: {
    name: 'Goradista',
    description:
      'Quando prepara um prato especial, pode gastar T$ 10 a mais para adicionar cobertura de gorad a ele. Além de seus benefícios normais, um prato especial com cobertura de gorad fornece 2 PM temporários por patamar do comensal.',
    type: ORIGIN_POWER_TYPE,
  },
  INSCIENTE: {
    name: 'Insciente',
    description: 'Você recebe resistência a magia +5.',
    type: ORIGIN_POWER_TYPE,
  },
  INTERROGADOR: {
    name: 'Interrogador',
    description:
      'Você recebe +1 na margem de ameaça contra criaturas feridas (PV abaixo do total), pois aprendeu a bater onde mais dói.',
    type: ORIGIN_POWER_TYPE,
  },
  LADRAO_DE_TUMULOS: {
    name: 'Ladrão de Túmulos',
    description:
      'Você recebe +2 na Defesa e em testes de perícia contra mortos-vivos. Além disso, recebe redução de trevas 5 (ou, se for um morto-vivo, recupera +1 PV por dado de dano de trevas).',
    type: ORIGIN_POWER_TYPE,
  },
  MENESTREL: {
    name: 'Menestrel',
    description:
      'Você recebe um poder de Música de bardo, escolhido entre Balada Fascinante, Canção Assustadora e Melodia Curativa.',
    type: ORIGIN_POWER_TYPE,
  },
  MENSAGEIRO: {
    name: 'Mensageiro',
    description:
      'Você recebe +3m em seu deslocamento e +2 em testes de resistência.',
    type: ORIGIN_POWER_TYPE,
  },
  NAUFRAGO: {
    name: 'Náufrago',
    description:
      'Você recebe +5 PV e +2 PM. Além disso, uma vez por cena pode gastar 2 PM para receber um dos seguintes benefícios até o fim da cena: treinamento em uma perícia; proficiência com uma arma, armadura ou escudo; usar uma ferramenta no lugar de outra.',
    type: ORIGIN_POWER_TYPE,
  },
  PADEIRO: {
    name: 'Padeiro',
    description:
      'Sua profissão fortificou seus braços! Você recebe +1 em rolagens de dano com armas de impacto e pode substituir testes de Atletismo por testes de Ofício (cozinheiro).',
    type: ORIGIN_POWER_TYPE,
  },
  PEDINTE: {
    name: 'Pedinte',
    description:
      'Você é muito discreto, recebendo +2 em Enganação e Furtividade. Além disso, aprendeu a aproveitar o máximo de cada recurso. Quando você usa um alimento, preparado alquímico ou poção, pode rolar seu efeito duas vezes e usar o melhor resultado (se o efeito for aleatório), ou pode dividir o item com um aliado adjacente (ele também gasta a ação para consumi-lo e recebe o benefício normal, mas você gasta apenas um item).',
    type: ORIGIN_POWER_TYPE,
  },
  PESCADOR: {
    name: 'Pescador',
    description:
      'Você sabe aguardar o instante exato de puxar o anzol. Recebe +2 em Iniciativa e, sempre que prepara uma ação, recebe +2 em testes para executá-la.',
    type: ORIGIN_POWER_TYPE,
  },
  SERVO: {
    name: 'Servo',
    description:
      'Você recebe +2 em testes de Diplomacia e Enganação contra alvos que tenham status ou posição superior à sua (ou que acreditam ter), e pode substituir testes de Nobreza por testes de Ofício (serviçal).',
    type: ORIGIN_POWER_TYPE,
  },
  SUPORTE_DE_TROPAS: {
    name: 'Suporte de Tropas',
    description:
      'Sempre que você faz um teste para ajudar, o bônus que fornece aumenta em +2. Além disso, quando flanqueia um inimigo, o bônus que você e seus aliados recebem em testes de ataque aumenta para +4.',
    type: ORIGIN_POWER_TYPE,
  },
};

export default heroisArtonOriginPowers;
