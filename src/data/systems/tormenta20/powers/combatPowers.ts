import { v4 as uuid } from 'uuid';
import Skill from '@/interfaces/Skills';
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../interfaces/Poderes';
import PROFICIENCIAS from '../proficiencias';

const combatPowers: Record<string, GeneralPower> = {
  ACUIDADE_COM_ARMA: {
    name: 'Acuidade com Arma',
    description:
      'Quando usa uma arma corpo a corpo leve ou uma arma de arremesso, você pode usar sua Destreza em vez de Força nos testes de ataque e rolagens de dano.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 1 }],
    ],
  },
  ARMA_SECUNDARIA_GRANDE: {
    name: 'Arma Secundária Grande',
    description:
      'Você pode empunhar duas armas de uma mão com o poder Estilo de Duas Armas.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Duas Armas' }],
    ],
  },
  ARREMESSO_POTENTE: {
    name: 'Arremesso Potente',
    description:
      'Quando usa uma arma de arremesso, você pode usar sua Força em vez de Destreza nos testes de ataque. Se você possuir o poder Ataque Poderoso, poderá usá-lo com armas de arremesso.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.PODER, name: 'Estilo de Arremesso' },
        { type: RequirementType.ATRIBUTO, name: 'Força', value: 1 },
      ],
    ],
  },
  ARREMESSO_MULTIPLO: {
    name: 'Arremesso Múltiplo',
    description:
      'Uma vez por rodada, quando faz um ataque com uma arma de arremesso, você pode gastar 1 PM para fazer um ataque adicional contra o mesmo alvo, arremessando outra arma de arremesso.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 1 },
        { type: RequirementType.PODER, name: 'Estilo de Arremesso' },
      ],
    ],
  },
  ATAQUE_COM_ESCUDO: {
    name: 'Ataque com Escudo',
    description:
      'Uma vez por rodada, quando faz um ataque com uma arma de arremesso, você pode gastar 1 PM para fazer um ataque adicional contra o mesmo alvo, arremessando outra arma de arremesso.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Arma e Escudo' }],
    ],
  },
  ATAQUE_PESADO: {
    name: 'Ataque pesado',
    description:
      'Quando faz um ataque corpo a corpo com uma arma de duas mãos, você pode pagar 1 PM. Se fizer isso e acertar o ataque, além do dano você faz uma manobra derrubar ou empurrar contra o alvo como uma ação livre (use o resultado do ataque como o teste de manobra).',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Duas Mãos' }],
    ],
  },
  ATAQUE_PODEROSO: {
    name: 'Ataque poderoso',
    description:
      'Sempre que faz um ataque corpo a corpo, você pode sofrer –2 no teste de ataque para receber +5 na rolagem de dano.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Força', value: 1 }],
    ],
  },
  ATAQUE_PRECISO: {
    name: 'Ataque preciso',
    description:
      'Se estiver empunhando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 na margem de ameaça e +1 no multiplicador de crítico.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Uma Arma' }],
    ],
  },
  BLOQUEIO_COM_ESCUDO: {
    name: 'Bloqueio com Escudo',
    description:
      'Quando sofre dano, você pode gastar 1 PM para receber redução de dano igual ao bônus na Defesa que seu escudo fornece contra este dano. Você só pode usar este poder se estiver usando um escudo.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Arma e Escudo' }],
    ],
  },
  CARGA_DE_CAVALARIA: {
    name: 'Carga de Cavalaria',
    description:
      'Quando faz uma investida montada, você causa +2d8 pontos de dano. Além disso, pode continuar se movendo depois do ataque. Você deve se mover em linha reta e seu movimento máximo ainda é o dobro do seu deslocamento.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PODER, name: 'Ginete' }]],
    rolls: [
      {
        id: uuid(),
        label: 'Dano Adicional (Investida)',
        dice: '2d8',
      },
    ],
  },
  COMBATE_DEFENSIVO: {
    name: 'Combate Defensivo',
    description:
      'Quando usa a ação agredir, você pode usar este poder. Se fizer isso, até seu próximo turno, sofre –2 em todos os testes de ataque, mas recebe +5 na Defesa.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
    ],
  },
  DERRUBAR_APRIMORADO: {
    name: 'Derrubar Aprimorado',
    description:
      'Você recebe +2 em testes de ataque para derrubar. Quando derruba uma criatura com essa manobra, pode gastar 1 PM para fazer um ataque extra contra ela.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Combate Defensivo' }],
    ],
  },
  DESARMAR_APRIMORADO: {
    name: 'Desarmar Aprimorado',
    description:
      'Você recebe +2 em testes de ataque para desarmar. Quando desarma uma criatura, pode gastar 1 PM para arremessar a arma dela para longe. Para definir onde a arma cai, role 1d8 para a direção (sendo “1” diretamente à sua frente, “2” à frente e à direita e assim por diante) e 1d6 para a distância (medida em quadrados de 1,5m a partir da criatura desarmada).',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Combate Defensivo' }],
    ],
  },
  DISPARO_PRECISO: {
    name: 'Disparo Preciso',
    description:
      'Você pode fazer ataques à distância contra oponentes envolvidos em combate corpo a corpo sem sofrer a penalidade de –5 no teste de ataque.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        {
          type: RequirementType.PODER,
          name: 'Estilo de Disparo',
        },
      ],
      [
        {
          type: RequirementType.PODER,
          name: 'Estilo de Arremesso',
        },
      ],
    ],
  },
  DISPARO_RAPIDO: {
    name: 'Disparo Rápido',
    description:
      'Se estiver empunhando uma arma de disparo que possa recarregar como ação livre e gastar uma ação completa para agredir, pode fazer um ataque adicional com ela. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 1 },
        {
          type: RequirementType.PODER,
          name: 'Estilo de Disparo',
        },
      ],
    ],
  },
  EMPUNHADURA_PODEROSA: {
    name: 'Empunhadura Poderosa',
    description:
      'Ao usar uma arma feita para uma categoria de tamanho maior que a sua, a penalidade que você sofre nos testes de ataque diminui para –2 (normalmente, usar uma arma de uma categoria de tamanho maior impõe –5 nos testes de ataque)',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Força', value: 3 }],
    ],
  },
  ENCOURACADO: {
    name: 'Encouraçado',
    description:
      'Se estiver usando uma armadura pesada, você recebe +2 na Defesa. Esse bônus aumenta em +2 para cada outro poder que você possua que tenha Encouraçado como pré-requisito',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        {
          type: RequirementType.PROFICIENCIA,
          name: 'Armaduras Pesadas',
        },
      ],
    ],
  },
  ESQUIVA: {
    name: 'Esquiva',
    description: 'Você recebe +2 na Defesa e Reflexos.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 1 }],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Esquiva' },
        target: {
          type: 'Defense',
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: { type: 'power', name: 'Esquiva' },
        target: {
          type: 'Skill',
          name: Skill.REFLEXOS,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  ESTILO_DE_ARMA_E_ESCUDO: {
    name: 'Estilo de Arma e Escudo',
    description:
      'Se você estiver usando um escudo, o bônus na Defesa que ele fornece aumenta em +2.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        {
          type: RequirementType.PERICIA,
          name: 'Luta',
        },
        {
          type: RequirementType.PROFICIENCIA,
          name: 'Escudos',
        },
      ],
    ],
  },
  ESTILO_DE_ARMA_LONGA: {
    name: 'Estilo de Arma Longa',
    description:
      'Você recebe +2 em testes de ataque com armas alongadas e pode atacar alvos adjacentes com essas armas.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        {
          type: RequirementType.PERICIA,
          name: 'Luta',
        },
        {
          type: RequirementType.ATRIBUTO,
          name: 'Força',
          value: 1,
        },
      ],
    ],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Estilo de Arma Longa',
        },
        target: {
          type: 'WeaponAttack',
          weaponTags: ['alongada'],
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  ESTILO_DE_ARREMESO: {
    name: 'Estilo de Arremesso',
    description:
      'Você pode sacar armas de arremesso como uma ação livre e recebe +2 nas rolagens de dano com elas. Se também possuir o poder Saque Rápido, também recebe +2 nos testes de ataque com essas armas.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: 'Pontaria' }]],
  },
  ESTILO_DE_DISPARO: {
    name: 'Estilo de Disparo',
    description:
      'Se estiver usando uma arma de disparo, você soma sua Destreza nas rolagens de dano',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: 'Pontaria' }]],
  },
  ESTILO_DE_DUAS_ARMAS: {
    name: 'Estilo de Duas Armas',
    description:
      'Se estiver empunhando duas armas (e pelo menos uma delas for leve) e fizer a ação agredir, você pode fazer dois ataques, um com cada arma. Se fizer isso, sofre –2 em todos os testes de ataque até o seu próximo turno. Se possuir Ambidestria, em vez disso não sofre penalidade para usá-lo.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 2 },
        { type: RequirementType.PODER, name: 'Estilo de Uma Arma' },
      ],
    ],
  },
  ESTILO_DE_DUAS_MAOS: {
    name: 'Estilo de Duas Mãos',
    description:
      'Se estiver usando uma arma corpo a corpo com as duas mãos, você recebe +5 nas rolagens de dano. Este poder não pode ser usado com armas leves.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Força', value: 2 },
        { type: RequirementType.PERICIA, name: 'Luta' },
      ],
    ],
  },
  ESTILO_DE_UMA_ARMA: {
    name: 'Estilo de Uma Arma',
    description:
      'Se estiver usando uma arma corpo a corpo em uma das mãos e nada na outra, você recebe +2 na Defesa e nos testes de ataque com essa arma (exceto ataques desarmados).',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: 'Luta' }]],
  },
  ESTILO_DESARMADO: {
    name: 'Estilo Desarmado',
    description:
      'Seus ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou não letal (sem penalidades).',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: 'Luta' }]],
    rolls: [
      {
        id: uuid(),
        label: 'Dano Desarmado',
        dice: '1d6',
      },
    ],
  },
  FANATICO: {
    name: 'Fanático',
    description: 'Seu deslocamento não é reduzido por usar armaduras pesadas.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        {
          type: RequirementType.NIVEL,
          value: 12,
        },
        {
          type: RequirementType.PODER,
          name: 'Encouraçado',
        },
      ],
    ],
  },
  FINTA_APRIMORADA: {
    name: 'Finta Aprimorada',
    description:
      'Você recebe +2 em testes de Enganação para fintar e pode fintar como uma ação de movimento.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: 'Enganação ' }]],
  },
  FOCO_EM_ARMA: {
    name: 'Foco em Arma',
    description:
      'Escolha uma arma. Você recebe +2 em testes de ataque com essa arma. Você pode escolher este poder outras vezes para armas diferentes.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PROFICIENCIA, name: 'all' }]],
  },
  GINETE: {
    name: 'Ginete',
    description:
      'Você passa automaticamente em testes de Cavalgar para não cair da montaria quando sofre dano. Além disso, não sofre penalidades para atacar à distância ou lançar magias quando montado.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: 'Cavalgar' }]],
  },
  INEXPUGNAVEL: {
    name: 'Inexpugnável',
    description:
      'Se estiver usando uma armadura pesada, você recebe +2 em todos os testes de resistência.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        {
          type: RequirementType.PODER,
          name: 'Encouraçado',
        },
        {
          type: RequirementType.NIVEL,
          value: 6,
        },
      ],
    ],
  },
  MIRA_APURADA: {
    name: 'Mira Apurada',
    description:
      'Quando usa a ação mirar, você recebe +2 em testes de ataque e na margem de ameaça com ataques à distância até o fim do turno.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 1 },
        { type: RequirementType.PODER, name: 'Disparo Preciso' },
      ],
    ],
  },
  PIQUEIRO: {
    name: 'Piqueiro',
    description:
      'Uma vez por rodada, se estiver empunhando uma arma alongada e um inimigo entrar voluntariamente em seu alcance corpo a corpo, você pode gastar 1 PM para fazer um ataque corpo a corpo contra este oponente com esta arma. Se o oponente tiver se aproximado fazendo uma investida, seu ataque causa dois dados de dano extra do mesmo tipo.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.PODER, name: 'Estilo de Arma Longa' }],
    ],
  },
  PRESENCA_ATERRADORA: {
    name: 'Presença Aterradora',
    description:
      'Você pode gastar uma ação padrão e 1 PM para assustar todas as criaturas a sua escolha em alcance curto. Veja a perícia Intimidação para as regras de assustar.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: 'Intimidação' }]],
  },
  PROFICIENCIA: {
    name: 'Proficiência',
    description:
      'Escolha uma proficiência: armas marciais, armas de fogo, armaduras pesadas ou escudos (se for proficiente em armas marciais, você também pode escolher armas exóticas). Você recebe essa proficiência. Você pode escolher este poder outras vezes para proficiências diferentes.',
    type: GeneralPowerType.COMBATE,
    requirements: [],
    allowSeveralPicks: true,
    sheetActions: [
      {
        source: { type: 'power', name: 'Proficiência' },
        action: {
          type: 'addProficiency',
          availableProficiencies: [
            PROFICIENCIAS.MARCIAIS,
            PROFICIENCIAS.FOGO,
            PROFICIENCIAS.PESADAS,
            PROFICIENCIAS.ESCUDOS,
            PROFICIENCIAS.EXOTICAS,
          ],
          pick: 1,
        },
      },
    ],
  },
  QUEBRAR_APRIMORADO: {
    name: 'Quebrar Aprimorado',
    description:
      'Você recebe +2 em testes de ataque para quebrar. Quando reduz os PV de uma arma para 0 ou menos, você pode gastar 1 PM para realizar um ataque extra contra o usuário dela. O ataque adicional usa os mesmos valores de ataque e dano, mas os dados devem ser rolados novamente.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PODER, name: 'Ataque Poderoso' }]],
  },
  REFLEXOS_DE_COMBATE: {
    name: 'Reflexos de Combate',
    description:
      'Você ganha uma ação de movimento extra no seu primeiro turno de cada combate.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 1 }],
    ],
  },
  SAQUE_RAPIDO: {
    name: 'Saque Rápido',
    description:
      'Você recebe +2 em Iniciativa e pode sacar ou guardar itens como uma ação livre (em vez de ação de movimento). Além disso, a ação que você gasta para recarregar armas de disparo diminui em uma categoria (ação completa para padrão, padrão para movimento, movimento para livre).',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PERICIA, name: 'Iniciativa' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Saque Rápido' },
        target: {
          type: 'Skill',
          name: Skill.INICIATIVA,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  TRESPASSAR: {
    name: 'Trespassar',
    description:
      'Quando você faz um ataque corpo a corpo e reduz os pontos de vida do alvo para 0 ou menos, pode gastar 1 PM para fazer um ataque adicional contra outra criatura dentro do seu alcance.',
    type: GeneralPowerType.COMBATE,
    requirements: [[{ type: RequirementType.PODER, name: 'Ataque Poderoso' }]],
  },
  VITALIDADE: {
    name: 'Vitalidade',
    description: 'Você recebe +1 PV por nível de personagem e +2 em Fortitude.',
    type: GeneralPowerType.COMBATE,
    requirements: [
      [{ type: RequirementType.ATRIBUTO, name: 'Constituição', value: 1 }],
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Vitalidade' },
        target: {
          type: 'Skill',
          name: Skill.FORTITUDE,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: { type: 'power', name: 'Vitalidade' },
        target: {
          type: 'PV',
        },
        modifier: {
          type: 'LevelCalc',
          formula: '{level}',
        },
      },
    ],
  },
};
export default combatPowers;
