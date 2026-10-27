import {
  countEnchantments,
  countImprovements,
  getEnhancedItemPrice,
  getMaterialPrice,
} from '../pricing';
import Equipment, { DefenseEquipment } from '../../../interfaces/Equipment';

const longSword: Equipment = {
  nome: 'Espada Longa',
  group: 'Arma',
  dano: '1d8',
  critico: '19',
  spaces: 1,
  preco: 15,
};

const mods = (...names: string[]) => names.map((mod) => ({ mod }));

describe('getEnhancedItemPrice — exemplos do livro', () => {
  test('espada longa comum custa o preço base', () => {
    expect(getEnhancedItemPrice(longSword).total).toBe(15);
  });

  test('espada longa com uma melhoria custa T$ 315', () => {
    const item = { ...longSword, modifications: mods('Certeira') };
    expect(getEnhancedItemPrice(item).total).toBe(315);
  });

  test('espada longa com quatro melhorias custa T$ 18.015', () => {
    const item = {
      ...longSword,
      modifications: mods('Certeira', 'Cruel', 'Equilibrada', 'Maciça'),
    };
    expect(getEnhancedItemPrice(item).total).toBe(18015);
  });

  test('couraça com duas melhorias custa T$ 3.500', () => {
    const couraca: DefenseEquipment = {
      nome: 'Couraça',
      group: 'Armadura',
      defenseBonus: 5,
      armorPenalty: 4,
      isHeavyArmor: true,
      spaces: 2,
      preco: 500,
      modifications: mods('Ajustada', 'Reforçada'),
    };
    expect(getEnhancedItemPrice(couraca).total).toBe(3500);
  });

  test('espada longa com um encanto custa T$ 18.015', () => {
    const item = {
      ...longSword,
      enchantments: [{ enchantment: 'Formidável' }],
    };
    expect(getEnhancedItemPrice(item).total).toBe(18015);
  });

  test('quatro melhorias e três encantos custam T$ 90.015', () => {
    const item = {
      ...longSword,
      modifications: mods('Certeira', 'Cruel', 'Equilibrada', 'Maciça'),
      enchantments: [
        { enchantment: 'Formidável' },
        { enchantment: 'Flamejante' },
        { enchantment: 'Dilacerante' },
      ],
    };
    expect(getEnhancedItemPrice(item).total).toBe(90015);
  });
});

describe('contagem de melhorias e encantos duplos', () => {
  test('Pungente com Certeira conta 2 no total, sem cobrar Certeira de novo', () => {
    const item = { ...longSword, modifications: mods('Certeira', 'Pungente') };
    expect(countImprovements(item)).toBe(2);
  });

  test('Pungente sozinho embute o pré-requisito e conta 2', () => {
    const item = { ...longSword, modifications: mods('Pungente') };
    expect(countImprovements(item)).toBe(2);
  });

  test('Magnífica sem Formidável conta como dois encantos', () => {
    const item = { ...longSword, enchantments: [{ enchantment: 'Magnífica' }] };
    expect(countEnchantments(item)).toBe(2);
    expect(getEnhancedItemPrice(item).enchantments).toBe(36000);
  });

  test('Lancinante (com asterisco no dado) com Dilacerante conta 2', () => {
    const item = {
      ...longSword,
      enchantments: [
        { enchantment: 'Dilacerante' },
        { enchantment: 'Lancinante*' },
      ],
    };
    expect(countEnchantments(item)).toBe(2);
  });

  test('melhoria desconhecida (suplemento) conta 1', () => {
    const item = { ...longSword, modifications: mods('Melhoria Inventada') };
    expect(countImprovements(item)).toBe(1);
  });
});

describe('material especial', () => {
  test('adamante em arma soma a melhoria e o material', () => {
    const item = {
      ...longSword,
      modifications: [
        { mod: 'Material especial', specialMaterial: 'adamante' },
      ],
    };
    const price = getEnhancedItemPrice(item);
    expect(price.improvements).toBe(300);
    expect(price.materialPrice).toBe(3000);
    expect(price.total).toBe(3315);
  });

  test('o preço do material depende do porte da armadura', () => {
    const light = { nome: 'Couro', group: 'Armadura', spaces: 2 } as Equipment;
    const heavy = {
      ...light,
      isHeavyArmor: true,
    } as DefenseEquipment;
    expect(getMaterialPrice('mitral', light)).toBe(1500);
    expect(getMaterialPrice('mitral', heavy)).toBe(12000);
  });

  test('aceita grafia com hífen e acento (Aço-Rubi)', () => {
    expect(getMaterialPrice('Aço-Rubi', longSword)).toBe(6000);
  });

  test('madeira Tollon não se aplica a armadura', () => {
    const light = { nome: 'Couro', group: 'Armadura', spaces: 2 } as Equipment;
    expect(getMaterialPrice('madeira Tollon', light)).toBeNull();
  });

  test('material sem tabela fica sem preço e não entra no total', () => {
    const item = {
      ...longSword,
      modifications: [
        { mod: 'Material especial', specialMaterial: 'couraça de kaiju' },
      ],
    };
    const price = getEnhancedItemPrice(item);
    expect(price.materialPrice).toBeNull();
    expect(price.total).toBe(315);
  });
});
