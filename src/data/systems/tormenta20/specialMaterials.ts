import { SpecialMaterial } from '../../../interfaces/SpecialMaterials';
import { AMEACAS_ARTON_SPECIAL_MATERIALS } from './ameacas-de-arton/specialMaterials';

export const specialMaterials: SpecialMaterial[] = [
  {
    name: 'aço rubi',
    esotericEffect: {
      material: 'Aço-rubi',
      type: 'Esotérico',
      effect:
        'Quando lança uma magia que causa dano, ela ignora 10 pontos de redução de dano, além de ignorar as imunidades a dano de lefeu',
    },
    weaponEffect: {
      material: 'Aço-rubi',
      type: 'Arma',
      effect:
        'A arma ignora 10 pontos de redução de dano; além de ignorar a imunidade a crítico de lefeu',
    },
    armorEffect: {
      material: 'Aço-rubi',
      type: 'Armadura e Escudo',
      effect:
        'Fornece uma chance de ignorar o dano extra de acertos críticos e ataques furtivos: armaduras leves e escudos 25% (1 em 1d4); armaduras pesadas 50% (qualquer valor par em qualquer dado); cumulativas entre si',
    },
  },
  {
    name: 'adamante',
    esotericEffect: {
      material: 'Adamante',
      type: 'Esotérico',
      effect:
        'Quando lança uma magia que causa dano, você pode pagar +1 PM para rolar novamente qualquer resultado 1 na rolagem de dano dela',
    },
    esotericSpellModifiers: [
      {
        filter: { damaging: true },
        effect: {
          type: 'CastOption',
          id: 'adamante',
          label: 'rola de novo os resultados 1 no dano',
          addPm: 1,
          effects: [{ type: 'RerollOnes' }],
        },
      },
    ],
    weaponEffect: {
      material: 'Adamante',
      type: 'Arma',
      effect: 'Aumenta o dano em um passo',
    },
    armorEffect: {
      material: 'Adamante',
      type: 'Armadura e Escudo',
      effect:
        'Fornece redução de dano: armaduras leves e escudos RD 2; armaduras pesadas RD 5',
    },
  },
  {
    name: 'gelo eterno',
    esotericEffect: {
      material: 'Gelo Eterno',
      type: 'Esotérico',
      effect:
        'Quando lança uma magia de frio que causa dano, você pode rolar novamente qualquer resultado 1 na rolagem de dano dela',
    },
    esotericSpellModifiers: [
      {
        filter: { damageTypes: ['frio'] },
        effect: { type: 'RerollOnes', damageTypes: ['frio'] },
      },
    ],
    weaponEffect: {
      material: 'Gelo Eterno',
      type: 'Arma',
      effect: 'Causa +2 pontos de dano por frio',
    },
    armorEffect: {
      material: 'Gelo Eterno',
      type: 'Armadura e Escudo',
      effect:
        'Fornece redução de fogo: armaduras leves e escudos resistência 5; armaduras pesadas resistência 10',
    },
  },
  {
    name: 'madeira Tollon',
    esotericEffect: {
      material: 'Madeira Tollon',
      type: 'Esotérico',
      effect: 'Fornece resistência a magia +2',
    },
    weaponEffect: {
      material: 'Madeira Tollon',
      type: 'Arma',
      effect:
        'Conta como mágica para vencer redução de dano. Além disso habilidades ativadas ao se fazer um ataque ou usar a ação gastam tem seu custo em PM reduzido em -1',
    },
    armorEffect: {
      material: 'Madeira Tollon',
      type: 'Escudo e Esotérico',
      effect: 'Fornece resistência a magia +2',
    },
  },
  {
    name: 'matéria vermelha',
    esotericEffect: {
      material: 'Matéria Vermelha',
      type: 'Esotérico',
      effect:
        'Você e todos os seus inimigos em alcance curto sofrem –2 em testes de resistência contra efeitos mágicos',
    },
    weaponEffect: {
      material: 'Matéria Vermelha',
      type: 'Arma',
      effect:
        'Causa +1d6 de dano extra. Porém sempre que você acerta um ataque com a arma perde 1 ponto de vida. Lefeu e lefeu são imunes tanto ao dano extra da matéria vermelha quanto à perda de vida por usar armas desse material',
    },
    armorEffect: {
      material: 'Matéria Vermelha',
      type: 'Armadura e Escudo',
      effect:
        'Por sua aparência "borrada" fornecem chance de falha para cada ataque: 10% para escudos e armaduras leves 25% para armaduras pesadas (cumulativas entre si). Lefeu ignoram este efeito',
    },
  },
  {
    name: 'mitral',
    esotericEffect: {
      material: 'Mitral',
      type: 'Esotérico',
      effect:
        'Permite que você pague +2 PM ao lançar uma magia para aumentar a CD dela em +2',
    },
    esotericSpellModifiers: [
      {
        filter: { resisted: true },
        effect: {
          type: 'CastOption',
          id: 'mitral',
          label: '+2 na CD da magia',
          addPm: 2,
          effects: [{ type: 'SpellDC', value: 2 }],
        },
      },
    ],
    weaponEffect: {
      material: 'Mitral',
      type: 'Arma',
      effect:
        'Aumenta sua margem de ameaça em 1. Por exemplo uma espada longa de mitral tem margem de ameaça 18-20',
    },
    armorEffect: {
      material: 'Mitral',
      type: 'Armadura e Escudo',
      effect:
        'Tem sua penalidade de armadura diminuída em 2. Armaduras pesadas de mitral permitem que você aplique até dois pontos de sua Destreza na Defesa',
    },
  },
];

/**
 * Todos os materiais conhecidos (core + suplementos). O lookup por nome busca
 * em todos, independente dos suplementos ativos — uma ficha pode carregar um
 * item com material de suplemento desativado e ainda precisa exibir o efeito.
 */
const allSpecialMaterials: SpecialMaterial[] = [
  ...specialMaterials,
  ...AMEACAS_ARTON_SPECIAL_MATERIALS,
];

export const getSpecialMaterialData = (
  materialName: string
): SpecialMaterial | undefined =>
  allSpecialMaterials.find((material) => material.name === materialName);
