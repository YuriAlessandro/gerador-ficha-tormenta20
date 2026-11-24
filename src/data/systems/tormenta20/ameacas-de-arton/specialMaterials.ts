import { SpecialMaterial } from '../../../../interfaces/SpecialMaterials';
import { SupplementId } from '../../../../types/supplement.types';

/**
 * Novos materiais especiais do suplemento Ameaças de Arton (cap. 3 — Bazar
 * Monstruoso). Os efeitos numéricos modeláveis são aplicados em
 * materialEffects.ts; o restante fica descritivo.
 */
export const AMEACAS_ARTON_SPECIAL_MATERIALS: SpecialMaterial[] = [
  {
    name: 'casco de monstro',
    esotericEffect: {
      material: 'Casco de Monstro',
      type: 'Esotérico',
      effect:
        'Quando lança uma magia, você recebe redução de dano 5 contra o próximo dano que sofrer até sua próxima rodada',
    },
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
    weaponEffect: {
      material: 'Casco de Monstro',
      type: 'Arma',
      effect:
        'Conta como uma arma primitiva para a magia Armamento da Natureza e efeitos semelhantes',
    },
    armorEffect: {
      material: 'Casco de Monstro',
      type: 'Armadura e Escudo',
      effect:
        'Têm sua penalidade de armadura diminuída em 1. Armaduras pesadas de casco permitem aplicar 1 ponto de Destreza na Defesa',
    },
  },
  {
    name: 'couraça de kaiju',
    esotericEffect: {
      material: 'Couraça de Kaiju',
      type: 'Esotérico',
      effect:
        'Exige uma peça. Quando lança uma magia que causa dano, você pode gastar 2 PM para ignorar efeitos dos alvos que reduzem o dano dessa magia, como Durão ou Evasão (exceto redução de dano e o efeito de passar no teste de resistência contra a magia)',
    },
    esotericSpellModifiers: [
      {
        filter: { damaging: true },
        effect: {
          type: 'CastOption',
          id: 'couraca-de-kaiju',
          label:
            'ignora efeitos dos alvos que reduzem o dano (Durão, Evasão), exceto RD',
          addPm: 2,
        },
      },
    ],
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
    weaponEffect: {
      material: 'Couraça de Kaiju',
      type: 'Arma',
      effect:
        'O dano aumenta um passo. Além disso, quando faz um ataque, se o alvo usar um efeito que reduz o dano desse ataque (como Durão ou Escamas Supremas), você pode gastar 2 PM para ignorar o efeito. Isso não se aplica a RD',
    },
    armorEffect: {
      material: 'Couraça de Kaiju',
      type: 'Armadura e Escudo',
      effect:
        'Armadura leve e escudo: RD 10/mágico. Armadura pesada: RD 20/mágico',
    },
  },
  {
    name: 'couro de bulette',
    esotericEffect: {
      material: 'Couro de Bulette',
      type: 'Esotérico',
      effect:
        'Exige uma peça. Quando lança uma magia de ácido que causa dano, você pode rolar novamente qualquer resultado 1 nas rolagens de dano (mesmo em rodadas subsequentes)',
    },
    esotericSpellModifiers: [
      {
        filter: { damageTypes: ['ácido'] },
        effect: { type: 'RerollOnes', damageTypes: ['ácido'] },
      },
    ],
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
    armorEffect: {
      material: 'Couro de Bulette',
      type: 'Armadura',
      effect:
        'Armadura leve: fornece deslocamento de escavação igual à metade de seu deslocamento normal e redução de ácido 5. Armadura pesada: como acima, mas a redução de ácido é 10',
    },
  },
  {
    name: 'cristal de sol',
    esotericEffect: {
      material: 'Cristal de Sol',
      type: 'Esotérico',
      effect:
        'Exige uma peça. Quando lança uma magia de fogo, você pode gastar 1 PM. Se fizer isso, criaturas que falhem em seu teste de resistência contra a magia ficam em chamas (se a magia já deixa a vítima em chamas, em vez disso o dano das chamas aumenta em +1d6 cumulativo)',
    },
    esotericSpellModifiers: [
      {
        filter: { damageTypes: ['fogo'], resisted: true },
        effect: {
          type: 'ExtraAprimoramento',
          addPm: 1,
          text: 'criaturas que falhem na resistência ficam em chamas (se a magia já deixa em chamas, o dano das chamas aumenta em +1d6, cumulativo)',
        },
      },
    ],
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
    weaponEffect: {
      material: 'Cristal de Sol',
      type: 'Arma',
      effect:
        'Só pode ser aplicado a armas de corte ou perfuração. A arma causa +2 pontos de dano por fogo',
    },
    armorEffect: {
      material: 'Cristal de Sol',
      type: 'Armadura e Escudo',
      effect:
        'Quando faz um teste de resistência contra um efeito de frio, você pode rolar dois dados e usar o melhor resultado',
    },
  },
  {
    name: 'lanajuste',
    esotericEffect: {
      material: 'Lanajuste',
      type: 'Esotérico',
      effect:
        'Quando lança uma magia que causa dano de corte, você pode rolar novamente qualquer resultado 1 na rolagem de dano',
    },
    esotericSpellModifiers: [
      {
        filter: { damageTypes: ['corte'] },
        effect: { type: 'RerollOnes', damageTypes: ['corte'] },
      },
    ],
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
    weaponEffect: {
      material: 'Lanajuste',
      type: 'Arma',
      effect:
        'Ataques com a arma ignoram penalidades por combate submerso. Além disso, pode ser utilizada por devotos do Oceano sem violar suas obrigações e restrições',
    },
    armorEffect: {
      material: 'Lanajuste',
      type: 'Armadura e Escudo',
      effect:
        'Fornece redução de corte: armaduras leves e escudos, redução 5; armaduras pesadas, redução 10',
    },
  },
  {
    name: 'pena de kraken',
    esotericEffect: {
      material: 'Pena de Kraken',
      type: 'Esotérico',
      effect:
        'Exige uma peça. Se o item fornece algum bônus numérico, ele aumenta em +1',
    },
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
    weaponEffect: {
      material: 'Pena de Kraken',
      type: 'Arma',
      effect:
        'Exige uma peça. Quando faz um acerto crítico, o dano aumenta dois passos (antes de ser multiplicado)',
    },
    armorEffect: {
      material: 'Pena de Kraken',
      type: 'Armadura e Escudo',
      effect:
        'Armadura leve e escudo: quando uma criatura erra um ataque corpo a corpo contra você, perde 5 pontos de vida. Armadura pesada: quando uma criatura erra um ataque corpo a corpo contra você, perde 10 pontos de vida',
    },
  },
  {
    name: 'prata',
    esotericEffect: {
      material: 'Prata',
      type: 'Esotérico',
      effect:
        'Suas magias causam +2 pontos de dano em espíritos e mortos-vivos',
    },
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
    weaponEffect: {
      material: 'Prata',
      type: 'Arma',
      effect:
        'Causa +2 pontos de dano em espíritos e mortos-vivos e é considerada mágica para atacar essas criaturas',
    },
    armorEffect: {
      material: 'Prata',
      type: 'Armadura e Escudo',
      effect:
        'Fornece redução de dano causado por espíritos e mortos-vivos: armaduras leves e escudos, RD 5; armaduras pesadas, RD 10',
    },
  },
  {
    name: 'quitina razza',
    esotericEffect: {
      material: 'Quitina Razza',
      type: 'Esotérico',
      effect:
        'Exige uma peça. Sempre que rolar o resultado máximo em um dado do dano básico da magia (sem contar aprimoramentos e outros efeitos), role um dado extra, repetindo o processo a cada resultado máximo',
    },
    supplementId: SupplementId.TORMENTA20_AMEACAS_ARTON,
    weaponEffect: {
      material: 'Quitina Razza',
      type: 'Arma',
      effect:
        'Exige uma peça. Sempre que rolar o resultado máximo em um dado do dano básico da arma, role um dado extra, repetindo o processo a cada resultado máximo',
    },
    armorEffect: {
      material: 'Quitina Razza',
      type: 'Armadura e Escudo',
      effect:
        'Armadura leve e escudo: concede +2 em Percepção e seu bônus na Defesa aumenta em 1. Armadura pesada: concede +5 em Percepção e seu bônus na Defesa aumenta em 2',
    },
  },
];

export default AMEACAS_ARTON_SPECIAL_MATERIALS;
