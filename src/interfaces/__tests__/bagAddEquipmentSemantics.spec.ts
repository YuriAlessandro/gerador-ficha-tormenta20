import Bag from '../Bag';
import Equipment from '../Equipment';
import Skill from '../Skills';

/**
 * `addEquipment` funde por `nome` e o item NOVO vence — é o que permite a um
 * poder atualizar a arma que concede. O efeito colateral era apagar as escolhas
 * do jogador (perícia rolada, atributos de ataque/dano, nome customizado)
 * sempre que a guarda de idempotência do `sheetActionHistory` falhava: ficha
 * importada, histórico truncado, homebrew recompilado com outro `source`.
 */
describe('Bag.addEquipment — campos semânticos do jogador', () => {
  const mordidaEditada: Equipment = {
    nome: 'Mordida',
    group: 'Arma',
    dano: '1d4',
    critico: 'x2',
    spaces: 0,
    customSkill: Skill.MISTICISMO,
    attackAttribute: 'Sabedoria',
    damageAttribute: 'Destreza',
    customDisplayName: 'Presas de Sombra',
    weaponCategory: 'exotic',
  };

  /** Como o poder a concede: limpa, direto do dado. */
  const mordidaDoCatalogo: Equipment = {
    nome: 'Mordida',
    group: 'Arma',
    dano: '1d4',
    critico: 'x2',
    spaces: 0,
  };

  const reAdd = (existing: Equipment, incoming: Equipment): Equipment => {
    const bag = new Bag({ Arma: [existing] });
    bag.addEquipment({ Arma: [incoming] });
    const found = bag.equipments.Arma.find((w) => w.nome === incoming.nome);
    if (!found) throw new Error('Arma não encontrada após addEquipment');
    return found;
  };

  test('reaplicar o poder preserva as escolhas do jogador', () => {
    const result = reAdd(mordidaEditada, mordidaDoCatalogo);
    expect(result.customSkill).toBe(Skill.MISTICISMO);
    expect(result.attackAttribute).toBe('Sabedoria');
    expect(result.damageAttribute).toBe('Destreza');
    expect(result.customDisplayName).toBe('Presas de Sombra');
    expect(result.weaponCategory).toBe('exotic');
  });

  // O ponto do merge continua valendo: o catálogo manda nos stats.
  test('stats continuam vindo do item novo', () => {
    const result = reAdd(
      { ...mordidaEditada, dano: '1d4' },
      { ...mordidaDoCatalogo, dano: '1d6', critico: '19' }
    );
    expect(result.dano).toBe('1d6');
    expect(result.critico).toBe('19');
  });

  test('quando o catálogo declara o campo, ele vence', () => {
    const result = reAdd(mordidaEditada, {
      ...mordidaDoCatalogo,
      damageAttribute: 'Nenhum',
    });
    expect(result.damageAttribute).toBe('Nenhum');
    // Os que ele não declara continuam vindo do antigo.
    expect(result.attackAttribute).toBe('Sabedoria');
  });

  test('item de nome diferente não herda nada', () => {
    const bag = new Bag({ Arma: [mordidaEditada] });
    bag.addEquipment({
      Arma: [{ ...mordidaDoCatalogo, nome: 'Garras' }],
    });
    const garras = bag.equipments.Arma.find((w) => w.nome === 'Garras');
    expect(garras?.attackAttribute).toBeUndefined();
    expect(garras?.customSkill).toBeUndefined();
    // E a arma antiga continua lá, intacta.
    expect(
      bag.equipments.Arma.find((w) => w.nome === 'Mordida')?.attackAttribute
    ).toBe('Sabedoria');
  });

  test('sem colisão o item novo passa sem cópia', () => {
    const bag = new Bag({ Arma: [] });
    bag.addEquipment({ Arma: [mordidaDoCatalogo] });
    expect(bag.equipments.Arma).toHaveLength(1);
    expect(bag.equipments.Arma[0].nome).toBe('Mordida');
  });
});

/**
 * Espaço editado à mão é escolha do jogador, como os campos semânticos acima —
 * mas fica fora da allow-list porque a regra dela ("só copia o que o novo não
 * define") nunca dispararia: o catálogo sempre traz um espaço.
 */
describe('Bag.addEquipment — espaço editado à mão', () => {
  const arcoZerado: Equipment = {
    nome: 'Arco longo',
    group: 'Arma',
    dano: '1d8',
    critico: 'x3',
    spaces: 0,
    hasManualSpaces: true,
  };

  const arcoDoCatalogo: Equipment = {
    nome: 'Arco longo',
    group: 'Arma',
    dano: '1d8',
    critico: 'x3',
    spaces: 2,
  };

  test('reconceder o item preserva o espaço zerado pelo jogador', () => {
    const bag = new Bag({ Arma: [arcoZerado] });
    bag.addEquipment({ Arma: [arcoDoCatalogo] });
    const arco = bag.equipments.Arma.find((w) => w.nome === 'Arco longo');
    expect(arco?.spaces).toBe(0);
    expect(arco?.hasManualSpaces).toBe(true);
  });

  test('sem edição manual o espaço do catálogo vence', () => {
    const bag = new Bag({
      Arma: [{ ...arcoZerado, hasManualSpaces: undefined }],
    });
    bag.addEquipment({ Arma: [arcoDoCatalogo] });
    expect(
      bag.equipments.Arma.find((w) => w.nome === 'Arco longo')?.spaces
    ).toBe(2);
  });
});
