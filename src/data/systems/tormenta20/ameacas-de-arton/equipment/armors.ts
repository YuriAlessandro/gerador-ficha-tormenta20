import { DefenseEquipment } from '../../../../../interfaces/Equipment';
import { BonusCondition } from '../../../../../interfaces/CharacterSheet';
import Skill from '../../../../../interfaces/Skills';

/**
 * Novas armaduras e escudos do suplemento Ameaças de Arton - Tormenta 20
 * Apenas disponíveis quando o suplemento está ativo
 *
 * Bônus de armadura vêm com `wearingArmorNamed`: `applyEquipmentBonuses` varre a
 * mochila inteira, então sem a condição o bônus valeria com a armadura guardada.
 */
const worn = (nome: string): BonusCondition => ({
  combinator: 'AND',
  clauses: [{ kind: 'wearingArmorNamed', value: nome }],
});

export const AMEACAS_ARTON_ARMORS = {
  ARMADURA_DE_OSSOS: {
    nome: 'Armadura de ossos',
    defenseBonus: 3,
    armorPenalty: -2,
    spaces: 2,
    group: 'Armadura',
    preco: 120,
    descricao:
      'Fornece +1 em Intimidação e na CD de seus efeitos de medo (cumulativo com a melhoria macabra).',
    // A CD dos efeitos de medo não tem alvo de bônus correspondente — fica só
    // no texto.
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Armadura de ossos' },
        target: { type: 'Skill', name: Skill.INTIMIDACAO },
        modifier: { type: 'Fixed', value: 1 },
        condition: worn('Armadura de ossos'),
      },
    ],
  },
  VESTE_DE_TEIA_DE_ARANHA: {
    nome: 'Veste de teia de aranha',
    defenseBonus: 4,
    armorPenalty: 0,
    spaces: 2,
    group: 'Armadura',
    preco: 3000,
    descricao:
      'Fornece +5 em Furtividade, mas não pode receber a melhoria material especial.',
    sheetBonuses: [
      {
        source: { type: 'equipment', equipmentName: 'Veste de teia de aranha' },
        target: { type: 'Skill', name: Skill.FURTIVIDADE },
        modifier: { type: 'Fixed', value: 5 },
        condition: worn('Veste de teia de aranha'),
      },
    ],
  },
  ARMADURA_DE_QUITINA: {
    nome: 'Armadura de quitina',
    defenseBonus: 7,
    armorPenalty: -3,
    spaces: 5,
    group: 'Armadura',
    isHeavyArmor: true,
    preco: 350,
    // A isenção de redução de deslocamento precisa de um gancho no motor (como
    // o de Fanático em `recalculateSheet`), não de um bônus — fica só no texto.
    descricao:
      'Embora seja uma armadura pesada, não reduz o deslocamento do usuário.',
  },
  ESCUDO_DE_COURO: {
    nome: 'Escudo de couro',
    defenseBonus: 1,
    armorPenalty: -1,
    spaces: 1,
    group: 'Escudo',
    preco: 3,
    // Bônus de Defesa contextual (só contra ataques à distância): o motor não
    // distingue a origem do ataque ao calcular Defesa.
    descricao:
      'Amarrado ao braço, impede o uso dessa mão. Contra ataques à distância, seu bônus na Defesa aumenta em +2. É leve demais para ser usado como arma.',
  },
} satisfies Record<string, DefenseEquipment>;

export default AMEACAS_ARTON_ARMORS;
