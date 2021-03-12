import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../interfaces/Poderes';

const combatPowers: Record<string, GeneralPower> = {
  ACUIDADE_COM_ARMA: {
    name: 'Acuidade com Arma',
    description:
      'Quando usa uma arma leve de corpo a corpo uma arma de arremesso, você pode usar seu modificador de Destreza em vez de Força nos testes de ataque e rolagens de dano.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 13 },
    ],
  },
  ARMA_SECUNDARIA_GRANDE: {
    name: 'Arma Secundária Grande',
    description:
      'Você pode usar duas armas de uma mão com o poder Estilo de Duas Armas.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'Estilo de Duas Armas' },
    ],
  },
  ARREMESSO_POTENTE: {
    name: 'Arremesso Potente',
    description:
      'Quando usa uma arma de arremesso, você pode usar seu modificador de Força em vez de Destreza nos testes de ataque. Se você possuir o poder Ataque Poderoso, poderá usá-lo com armas de arremesso. ',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'Estilo de Arremesso' },
      { type: RequirementType.ATRIBUTO, name: 'Força', value: 13 },
    ],
  },
  ATAQUE_PESADO: {
    name: 'Ataque pesado',
    description:
      'Quando faz um ataque corpo a corpo com uma arma de duas mãos, você pode pagar 1 PM. Se fizer isso e acertar o ataque, você faz uma manobra derrubar ou empurrar contra o alvo como uma ação livre (use o resultado do ataque como o teste de manobra).',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'Estilo de Duas Mãos' },
    ],
  },
  ATAQUE_PODEROSO: {
    name: 'Ataque poderoso',
    description:
      'Declare que está usando este poder antes de fazer um ataque corpo a corpo. Você sofre –2 no teste de ataque, mas recebe +5 na rolagem de dano. ',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Força', value: 13 },
    ],
  },
  ATAQUE_PRECISO: {
    name: 'Ataque preciso',
    description:
      'Se estiver usando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 na margem de ameaça e +1 no multiplicador de crítico.',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'Estilo de Uma Arma' }],
  },
  BLOQUEIO_COM_ESCUDO: {
    name: 'Bloqueio com Escudo',
    description:
      'Quando é atingido por um ataque, habilidade ou magia, você pode gastar 1 PM para receber resistência a dano contra este ataque igual ao bônus na Defesa que seu escudo fornece. Você só pode usar este poder se estiver usando um escudo.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'Estilo de Arma e Escudo' },
    ],
  },
  CARGA_DE_CAVALARIA: {
    name: 'Carga de Cavalaria',
    description:
      'Quando faz uma investida montada, você causa +2d8 pontos de dano. Além disso, pode continuar se movendo depois do ataque. Você deve se mover em linha reta e seu movimento máximo ainda é o dobro do seu deslocamento.',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'Ginete' }],
  },
  COMBATE_DEFENSIVO: {
    name: 'Combate Defensivo',
    description:
      'Quando usa a ação atacar, você pode usar este poder. Se fizer isso, até seu próximo turno, sofre –2 em todos os testes de ataque, mas recebe +5 na Defesa.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 },
    ],
  },
  DERRUBAR_APRIMORADO: {
    name: 'Derrubar Aprimorado',
    description:
      'Você recebe +2 em testes de ataque para derrubar. Quando derruba uma criatura com essa manobra, pode gastar 1 PM para fazer um ataque extra contra ela.',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'Combate Defensivo' }],
  },
  DESARMAR_APRIMORADO: {
    name: 'Desarmar Aprimorado',
    description:
      'Você recebe +2 em testes de ataque para desarmar. Quando desarma uma criatura, pode gastar 1 PM para arremessar a arma dela para longe. Para definir onde a arma cai, role 1d8 para a direção (sendo “1” diretamente à sua frente, “2” à frente e à direita e assim por diante, em sentido horário) e 1d6 para a distância (medida em quadrados de 1,5m a partir da criatura desarmada).',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'Combate Defensivo' }],
  },
  DISPARO_PRECISO: {
    name: 'Disparo Preciso',
    description:
      'Você pode fazer ataques à distância contra oponentes envolvidos em combate corpo a corpo sem sofrer a penalidade padrão de –5 no teste de ataque.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      {
        type: RequirementType.PODER,
        name: 'Estilo de Disparo ou Estilo de Arremesso.',
      },
    ],
  },
  DISPARO_RAPIDO: {
    name: 'Disparo Rápido',
    description:
      'Se estiver usando uma arma de ataque à distância e gastar uma ação completa para atacar, você pode fazer um ataque adicional com ela (se puder recarregá- -la como ação livre). Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 13 },
      {
        type: RequirementType.PODER,
        name: 'Estilo de Disparo ou Estilo de Arremesso',
      },
    ],
  },
  EMPUNHADURA_PODEROSA: {
    name: 'Empunhadura Poderosa',
    description:
      'Ao usar uma arma feita para uma categoria de tamanho maior que a sua, a penalidade que você sofre nos testes de ataque diminui para –2 (normalmente, uma criatura que use uma arma feita para uma categoria de tamanho maior sofre uma penalidade de –5 nos testes de ataque).',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Força', value: 17 },
    ],
  },
  ENCOURACADO: {
    name: 'Encouraçado',
    description:
      'Se estiver usando uma armadura pesada, você recebe +2 na Defesa. Esse bônus aumenta em +2 para cada outro poder que você possua que tenha Encouraçado como pré-requisito.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      {
        type: RequirementType.PODER,
        name: 'proficiência com armaduras pesadas',
      },
    ],
  },
  ESQUIVA: {
    name: 'Esquiva',
    description: 'Você recebe +2 em Defesa e Reflexos.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 13 },
    ],
  },
  ESTILO_DE_ARMA_E_ESCUDO: {
    name: 'Estilo de Arma e Escudo',
    description:
      'Se você estiver usando um escudo, o bônus na Defesa que ele fornece aumenta em +2.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      {
        type: RequirementType.PODER,
        name: 'treinado em Luta, proficiência com escudos',
      },
    ],
  },
  ESTILO_DE_ARREMESO: {
    name: 'Estilo de Arremesso',
    description:
      'Você pode sacar armas de arremesso como uma ação livre e recebe +2 nas rolagens de dano com elas.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'treinado em Pontaria' },
    ],
  },
  ESTILO_DE_DISPARO: {
    name: 'Estilo de Disparo',
    description:
      'Se estiver usando uma arma de disparo, você soma o bônus de Destreza nas rolagens de dano.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'treinado em Pontaria' },
    ],
  },
  ESTILO_DE_DUAS_ARMAS: {
    name: 'Estilo de Duas Armas',
    description:
      'Se estiver usando duas armas (e pelo menos uma delas for leve) e fizer a ação atacar, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno. Se você possuir Ambidestria, não sofre essa penalidade.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 15 },
      { type: RequirementType.PODER, name: 'Estilo de Uma Arma' },
    ],
  },
  ESTILO_DE_DUAS_MAOS: {
    name: 'Estilo de Duas Mãos',
    description:
      'Se estiver usando uma arma corpo a corpo com as duas mãos, você recebe +5 nas rolagens de dano. Este poder não pode ser usado com armas leves.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Força', value: 15 },
      { type: RequirementType.PODER, name: 'Treinado em Luta' },
    ],
  },
  ESTILO_DE_UMA_ARMA: {
    name: 'Estilo de Uma Arma',
    description:
      'Se estiver usando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 na Defesa e nos testes de ataque com essa arma (exceto ataques desarmados).',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'treinado em Luta' }],
  },
  ESTILO_DESARMADO: {
    name: 'Estilo Desarmado',
    description:
      'Seus ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou não letal (sem penalidades).',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'treinado em Luta' }],
  },
  PODER: {
    name: '',
    description: '',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'Estilo de Uma Arma' }],
  },
  FANATICO: {
    name: 'Fanático',
    description: 'Seu deslocamento não é reduzido por usar armaduras pesadas',
    type: GeneralPowerType.COMBATE,
    requirements: [
      {
        type: RequirementType.PODER,
        name: '12º nível de personagem, Encouraçado.',
      },
    ],
  },
  FINTA_APRIMORADA: {
    name: 'Finta Aprimorada',
    description:
      'Você recebe +2 em testes de Enganação para fintar e pode fintar como uma ação de movimento.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'treinado em Enganação e Luta' },
    ],
  },
  FOCO_EM_ARMA: {
    name: 'Foco em Arma',
    description:
      'Escolha uma arma. Você recebe +2 em testes de ataque com essa arma. Você pode escolher este poder outras vezes para armas diferentes.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'proficiência com a arma' },
    ],
  },
  GINETE: {
    name: 'Ginete',
    description:
      'Você passa automaticamente em testes de Cavalgar para não cair da montaria quando sofre dano. Além disso, não sofre penalidades para atacar à distância ou lançar magias quando montado.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'treinado em Cavalgar' },
    ],
  },
  INEXPUGNAVEL: {
    name: 'Inexpugnável',
    description:
      'Se estiver usando uma armadura pesada, você recebe +2 em todos os testes de resistência.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      {
        type: RequirementType.PODER,
        name: 'Encouraçado, 6º nível de personagem.',
      },
    ],
  },
  MIRA_APURADA: {
    name: 'Mira Apurada',
    description:
      'Você pode gastar uma ação de movimento para mirar. Se fizer isso, recebe +2 em testes de ataque e na margem de ameaça com ataques à distância até o fim do turno.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 13 },
      { type: RequirementType.PODER, name: 'Estilo de Uma Arma' },
    ],
  },
  PRESENCA_ATERRADORA: {
    name: 'Presença Aterradora',
    description:
      'Você pode gastar uma ação padrão e 1 PM para assustar todas as criaturas a sua escolha em alcance curto. Veja a perícia Intimidação para as regras de assustar.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'treinado em Intimidação.' },
    ],
  },
  PROFICIENCIA: {
    name: 'Proficiência',
    description:
      'Escolha uma proficiência: armas marciais, armas de fogo, armaduras pesadas ou escudos (se for proficiente em armas marciais, você também pode escolher armas exóticas). Você recebe essa proficiência. Você pode escolher este poder outras vezes para proficiências diferentes.',
    type: GeneralPowerType.COMBATE,
    requirements: [],
  },
  QUEBRAR_APRIMORADO: {
    name: 'Quebrar Aprimorado',
    description:
      'Você recebe +2 em testes de ataque para quebrar. Quando reduz os PV de uma arma para 0 ou menos, você pode gastar 1 PM para realizar um ataque extra contra o usuário dela. O ataque adicional usa os mesmos valores de ataque e dano, mas os dados devem ser rolados novamente.',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'Ataque Poderoso' }],
  },
  REFLEXOS_DE_COMBATE: {
    name: 'Reflexos de Combate',
    description:
      'Você ganha uma ação de movimento extra no seu primeiro turno de cada combate.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 13 },
    ],
  },
  SAQUE_RAPIDO: {
    name: 'Saque Rápido',
    description:
      'Você recebe +2 em Iniciativa e pode sacar ou guardar itens como uma ação livre (em vez de ação de movimento). Além disso, a ação que você gasta para recarregar uma arma de disparo diminui em uma categoria (ação completa para padrão, padrão para movimento, movimento para livre).',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.PODER, name: 'treinado em Iniciativa' },
    ],
  },
  TRESPASSAR: {
    name: 'Trespassar',
    description:
      'Quando você faz um ataque corpo a corpo e reduz os pontos de vida do alvo para 0 ou menos, pode gastar 1 PM para fazer um ataque adicional contra outra criatura dentro do seu alcance. O ataque adicional usa os mesmos valores de ataque e dano, mas os dados devem ser rolados novamente.',
    type: GeneralPowerType.COMBATE,
    requirements: [{ type: RequirementType.PODER, name: 'Ataque Poderoso' }],
  },
  VITALIDADE: {
    name: 'Vitalidade',
    description: 'Você recebe +1 PV por nível de personagem e +2 em Fortitude.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      { type: RequirementType.ATRIBUTO, name: 'Constituição', value: 13 },
    ],
  },
};
export default combatPowers;
