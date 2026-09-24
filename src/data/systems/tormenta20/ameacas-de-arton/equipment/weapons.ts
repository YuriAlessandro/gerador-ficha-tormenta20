import Equipment from '../../../../../interfaces/Equipment';

/**
 * Novas armas do suplemento Ameaças de Arton - Tormenta 20
 * Apenas disponíveis quando o suplemento está ativo
 */

export const AMEACAS_ARTON_WEAPONS = {
  // ===== ARMAS SIMPLES =====
  PORRETE: {
    nome: 'Porrete',
    descricao:
      'Pedaço sólido de madeira coberto por lã grossa. Causa dano não letal.',
    weaponCategory: 'simple',
    dano: '1d6',
    critico: 'x2',
    spaces: 1,
    tipo: 'Impacto',
    alcance: '-',
    group: 'Arma',
    preco: 2,
  },
  ZARABATANA: {
    nome: 'Zarabatana',
    descricao:
      'Tubo oco para disparar dardos. Causa dano mínimo, mas é excelente para inocular venenos: a CD para resistir ao veneno dos dardos aumenta em +2. Um pacote de munição tem 20 dardos (T$ 2, 0,5 espaço).',
    weaponCategory: 'simple',
    dano: '1d3',
    critico: 'x2',
    spaces: 1,
    tipo: 'Perfuração',
    alcance: 'Curto',
    group: 'Arma',
    preco: 5,
  },

  // ===== ARMAS MARCIAIS =====
  NEKO_TE: {
    nome: 'Neko-te',
    descricao:
      'Luva com garras metálicas na palma e no dorso. Fornece +2 em testes de Atletismo para escalar e conta como mão livre para isso. Usando duas neko-te, seu deslocamento de escalada aumenta em +1,5m.',
    weaponCategory: 'martial',
    dano: '1d4',
    critico: '19',
    spaces: 1,
    tipo: 'Corte',
    alcance: '-',
    group: 'Arma',
    preco: 10,
  },
  GLADIO: {
    nome: 'Gládio',
    descricao:
      'Espada de lâmina curta e pesada, sem guarda, com ponta muito afiada. É uma das armas padrão dos legionários do Império de Tauron.',
    weaponCategory: 'martial',
    dano: '1d6',
    critico: '19/x3',
    spaces: 1,
    tipo: 'Perfuração',
    alcance: '-',
    group: 'Arma',
    preco: 12,
  },
  TETSUBO: {
    nome: 'Tetsubo',
    descricao:
      'Versão mais pesada e sofisticada do tacape, reforçada com anéis metálicos.',
    weaponCategory: 'martial',
    dano: '1d10',
    critico: 'x2',
    spaces: 2,
    tipo: 'Impacto',
    alcance: '-',
    group: 'Arma',
    preco: 20,
    twoHanded: true,
  },

  // ===== ARMAS DE FOGO =====
  TRAQUE: {
    nome: 'Traque',
    descricao:
      'Feita de sucata e materiais de segunda mão. Se você errar um ataque com resultado ímpar no d20, ela é avariada. Recarregar é uma ação padrão.',
    weaponCategory: 'firearm',
    dano: '2d6',
    critico: '19/x3',
    spaces: 1,
    tipo: 'Perfuração',
    alcance: 'Curto',
    group: 'Arma',
    preco: 75,
    ammoType: 'Balas',
  },
  ARCABUZ: {
    nome: 'Arcabuz',
    descricao:
      'Versão mais pesada e potente do mosquete. Por seu peso e recuo, é uma arma desbalanceada. Recarregar é uma ação padrão.',
    weaponCategory: 'firearm',
    dano: '2d10',
    critico: '19/x3',
    spaces: 2,
    tipo: 'Perfuração',
    alcance: 'Médio',
    group: 'Arma',
    preco: 800,
    twoHanded: true,
    ammoType: 'Balas',
  },
  BACAMARTE: {
    nome: 'Bacamarte',
    descricao:
      'Arma de fogo de boca larga, que espalha a munição num cone de 6m (seu alcance máximo). Faça um ataque à distância e compare com a Defesa de cada criatura na área. Recarregar exige uma ação completa e 2 balas.',
    weaponCategory: 'firearm',
    dano: '4d6',
    critico: '19/x3',
    spaces: 2,
    tipo: 'Perfuração',
    alcance: 'Especial',
    group: 'Arma',
    preco: 450,
    twoHanded: true,
    ammoType: 'Balas',
  },

  // ===== ARMAS EXÓTICAS =====
  ACOITE_FINNTROLL: {
    nome: 'Açoite finntroll',
    descricao:
      'Tiras de couro com farpas de aço, também usado como instrumento de tortura. Uma criatura que sofra dano do açoite fica com –2 em testes de perícia e rolagens de dano por 1 rodada (metabolismo).',
    weaponCategory: 'exotic',
    dano: '1d8',
    critico: 'x2',
    spaces: 1,
    tipo: 'Corte',
    alcance: '-',
    group: 'Arma',
    preco: 30,
  },
  ESPADA_VESPA: {
    nome: 'Espada vespa',
    descricao:
      'Três ferrões de vespas gigantes numa estrutura de ossos em “H”. Pressione a empunhadura para uni-los (dano de corte) ou separe-os (dano de perfuração).',
    weaponCategory: 'exotic',
    dano: '2d4',
    critico: '18',
    spaces: 1,
    tipo: 'Corte ou Perfuração',
    alcance: '-',
    group: 'Arma',
    preco: 75,
  },
  PISTOLA_PUNHAL: {
    nome: 'Pistola-punhal',
    descricao:
      'Arma híbrida: corpo a corpo ágil (1d6, crítico 18) ou arma de fogo (2d6, crítico 19/x3, alcance curto). No modo corpo a corpo você pode acionar o mecanismo para disparar a bala; se acertar, causa +2d8 de dano. No modo arma de fogo contra oponente adjacente, causa +1d8 de dano.',
    weaponCategory: 'exotic',
    dano: '1d6',
    critico: '18',
    spaces: 1,
    tipo: 'Perfuração',
    alcance: 'Curto',
    group: 'Arma',
    preco: 300,
    ammoType: 'Balas',
    specialActions: [
      {
        id: 'corpo-a-corpo',
        label: 'Corpo a corpo (ágil)',
        skill: 'Luta',
        dano: '1d6',
        critico: '18',
        damageAttribute: 'Força',
        skipAmmo: true,
        trigger: {
          label: 'Acionar mecanismo (consome 1 Bala, +2d6 se acertar)',
          extraDamage: '2d6',
          consumesAmmo: 'Balas',
        },
      },
      {
        id: 'tiro',
        label: 'Tiro (alcance curto)',
        skill: 'Pontaria',
        dano: '2d6',
        critico: '19/x3',
        damageAttribute: 'Nenhum',
      },
    ],
  },
  MORDIDA_DO_DIABO: {
    nome: 'Mordida do diabo',
    descricao:
      'Aparato em forma de mandíbula preso a uma empunhadura por uma longa corrente, capaz de se destacar e alcançar alvos a até 3m. Arma exótica, ágil e versátil, que fornece +2 em testes para agarrar e desarmar.',
    weaponCategory: 'exotic',
    dano: '1d4',
    critico: 'x2',
    spaces: 1,
    tipo: 'Perfuração',
    alcance: '-',
    group: 'Arma',
    preco: 30,
  },
  PRESA_DE_SERPENTE: {
    nome: 'Presa de serpente',
    descricao:
      'Espada de obsidiana, mais afiada que o aço. Em um acerto crítico, o dano aumenta em um passo (antes de ser multiplicado).',
    weaponCategory: 'exotic',
    dano: '1d8',
    critico: '17',
    spaces: 1,
    tipo: 'Corte',
    alcance: '-',
    group: 'Arma',
    preco: 1000,
  },
  LANCA_DE_FOGO: {
    nome: 'Lança de fogo',
    descricao:
      'Arma híbrida: corpo a corpo alongada (1d10, crítico x3) ou arma de fogo (2d8, crítico 19/x3, alcance médio). No modo corpo a corpo você pode acionar o mecanismo para disparar a bala; se acertar, causa +2d8 de dano. No modo arma de fogo contra oponente adjacente, causa +1d8 de dano.',
    weaponCategory: 'exotic',
    dano: '1d10',
    critico: 'x3',
    spaces: 2,
    tipo: 'Perfuração',
    alcance: 'Curto',
    group: 'Arma',
    preco: 1000,
    twoHanded: true,
    ammoType: 'Balas',
    specialActions: [
      {
        id: 'corpo-a-corpo',
        label: 'Corpo a corpo (alongada)',
        skill: 'Luta',
        dano: '1d10',
        critico: 'x3',
        damageAttribute: 'Força',
        skipAmmo: true,
        trigger: {
          label: 'Acionar mecanismo (consome 1 Bala, +2d8 se acertar)',
          extraDamage: '2d8',
          consumesAmmo: 'Balas',
        },
      },
      {
        id: 'tiro',
        label: 'Tiro (alcance médio)',
        skill: 'Pontaria',
        dano: '2d8',
        critico: '19/x3',
        damageAttribute: 'Nenhum',
      },
    ],
  },
  SHURIKEN: {
    nome: 'Shuriken',
    descricao:
      'Projéteis metálicos de arremesso. Uma vez por rodada, ao atacar com uma shuriken você pode gastar 1 PM para fazer um ataque adicional de shuriken contra o mesmo alvo. Com Arremesso Múltiplo, você não paga o PM.',
    weaponCategory: 'exotic',
    dano: '1d4',
    critico: 'x2',
    spaces: 0.5,
    tipo: 'Perfuração',
    alcance: 'Curto',
    group: 'Arma',
    preco: 1,
  },
  ARPAO: {
    nome: 'Arpão',
    descricao:
      'Haste com rebarbas numa ponta e corda na outra. Ao causar dano, o arpão fica preso no alvo: enquanto você segura a corda, sempre que ele se mover faça um teste de Força oposto — vencendo, ele só se move até o limite da corda (9m). Soltar-se custa uma ação de movimento e 1d10 PV.',
    weaponCategory: 'exotic',
    dano: '1d10',
    critico: 'x3',
    spaces: 1,
    tipo: 'Perfuração',
    alcance: 'Curto',
    group: 'Arma',
    preco: 30,
  },
} satisfies Record<string, Equipment>;

export default AMEACAS_ARTON_WEAPONS;
