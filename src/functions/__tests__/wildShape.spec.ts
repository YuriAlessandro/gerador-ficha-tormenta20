import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import { RACE_SIZES } from '../../data/systems/tormenta20/races/raceSizes/raceSizes';
import type { ActiveEffect } from '../../premium/interfaces/ActiveEffect';
import ACTIVE_POWERS_DRUIDA from '../../premium/data/activePowers/druida';
import {
  WILD_SHAPE_FALLBACK_EMOJI,
  WILD_SHAPE_FORMS,
  WILD_SHAPE_POWER_KEY,
  buildWildShapeOptionId,
  describeWildShapeChanges,
  getWildShapeAnimalEmoji,
  getWildShapeAnimals,
  getWildShapeLabel,
  resolveWildShapeOptionId,
} from '../../premium/data/wildShapes';
import {
  getActiveWildShape,
  getWildShapeNaturalWeapons,
} from '../../premium/functions/wildShape';

/**
 * Forma Selvagem do Druida: aplicação e REVERSÃO dos efeitos que precisaram de
 * encanamento novo no motor (tamanho, deslocamentos secundários) e as armas
 * naturais virtuais.
 */

const FORMA_SELVAGEM = ACTIVE_POWERS_DRUIDA.find(
  (p) => p.key === WILD_SHAPE_POWER_KEY
);

const mkPower = (name: string) => ({ name, text: '' });

/** Ficha de druida com os poderes pedidos. */
function druidSheet(powers: string[] = ['Forma Selvagem']): CharacterSheet {
  const sheet = createMockCharacterSheet();
  sheet.classe = { ...sheet.classe, name: 'Druida' };
  sheet.classPowers = powers.map(mkPower);
  return sheet;
}

/** Constrói o `ActiveEffect` de uma forma como o diálogo de uso faria. */
function wildShapeEffect(
  formId: string,
  tierId: string,
  variantId?: string
): ActiveEffect {
  const optionId = buildWildShapeOptionId(
    formId as never,
    tierId as never,
    variantId
  );
  const options = FORMA_SELVAGEM?.getUsageOptions(druidSheet(), {
    ignoreRequirements: true,
  });
  const option = options?.find((o) => o.id === optionId);
  if (!option) throw new Error(`Opção não encontrada: ${optionId}`);

  return {
    instanceId: `wild-${optionId}`,
    powerKey: WILD_SHAPE_POWER_KEY,
    name: 'Forma Selvagem',
    sourceLabel: 'Druida · Forma Selvagem',
    optionId,
    optionLabel: option.label,
    bonuses: option.bonuses,
    appliedAt: '2026-01-01T00:00:00.000Z',
  };
}

const skillOthers = (sheet: CharacterSheet, name: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === name)?.others ?? 0;

describe('catálogo de formas selvagens', () => {
  it('tem as 5 formas × 3 graus do livro', () => {
    expect(WILD_SHAPE_FORMS).toHaveLength(5);
    WILD_SHAPE_FORMS.forEach((form) => {
      expect(form.tiers.map((t) => t.id)).toEqual([
        'basica',
        'aprimorada',
        'superior',
      ]);
      expect(form.tiers.map((t) => t.pmCost)).toEqual([3, 6, 10]);
    });
  });

  it('resolve optionId de volta para forma/grau/variante', () => {
    const resolved = resolveWildShapeOptionId('wildshape:veloz:superior:voo');
    expect(resolved?.form.id).toBe('veloz');
    expect(resolved?.tier.id).toBe('superior');
    expect(resolved?.variant?.id).toBe('voo');
    expect(getWildShapeLabel(resolved!)).toBe('Forma Veloz Superior (voo 24m)');
  });

  it('devolve null para ids desconhecidos ou corrompidos', () => {
    expect(resolveWildShapeOptionId(undefined)).toBeNull();
    expect(resolveWildShapeOptionId('outra-coisa:agil:basica')).toBeNull();
    expect(resolveWildShapeOptionId('wildshape:inexistente:basica')).toBeNull();
    expect(resolveWildShapeOptionId('wildshape:agil:lendaria')).toBeNull();
    // Variante declarada que não existe naquele grau: não adivinha.
    expect(resolveWildShapeOptionId('wildshape:feroz:basica:voo')).toBeNull();
  });
});

describe('animal no optionId', () => {
  it('vai e volta com o nome intacto', () => {
    const id = buildWildShapeOptionId('feroz', 'aprimorada', undefined, 'Urso');
    expect(resolveWildShapeOptionId(id)?.animalName).toBe('Urso');
  });

  it('sobrevive a acentos, espaços e dois-pontos no nome', () => {
    // encodeURIComponent escapa `:`, senão o parser cortaria o nome ao meio.
    const nomes = ['Onça-pintada', 'Lobo das cavernas', 'Bicho: o Terrível'];
    nomes.forEach((nome) => {
      const id = buildWildShapeOptionId('agil', 'basica', undefined, nome);
      expect(resolveWildShapeOptionId(id)?.animalName).toBe(nome);
    });
  });

  it('carrega variante e animal juntos', () => {
    const id = buildWildShapeOptionId('veloz', 'superior', 'voo', 'Águia');
    const resolved = resolveWildShapeOptionId(id);
    expect(resolved?.variant?.id).toBe('voo');
    expect(resolved?.animalName).toBe('Águia');
  });

  it('usa o slot vazio quando há animal mas não há variante', () => {
    const id = buildWildShapeOptionId('feroz', 'basica', undefined, 'Javali');
    expect(id).toBe('wildshape:feroz:basica:-:Javali');
    const resolved = resolveWildShapeOptionId(id);
    expect(resolved?.variant).toBeUndefined();
    expect(resolved?.animalName).toBe('Javali');
  });

  it('continua resolvendo os ids curtos anteriores ao animal', () => {
    const semAnimal = resolveWildShapeOptionId('wildshape:feroz:aprimorada');
    expect(semAnimal?.tier.id).toBe('aprimorada');
    expect(semAnimal?.animalName).toBeUndefined();

    const comVariante = resolveWildShapeOptionId(
      'wildshape:veloz:basica:natacao'
    );
    expect(comVariante?.variant?.id).toBe('natacao');
    expect(comVariante?.animalName).toBeUndefined();
  });

  it('escape inválido perde o animal mas preserva a forma', () => {
    const resolved = resolveWildShapeOptionId(
      'wildshape:feroz:basica:-:%E0%A4%A'
    );
    expect(resolved?.tier.id).toBe('basica');
    expect(resolved?.animalName).toBeUndefined();
  });
});

describe('emoji do animal', () => {
  it('casa por nome exato do catálogo', () => {
    expect(getWildShapeAnimalEmoji('Urso')).toBe('🐻');
    expect(getWildShapeAnimalEmoji('Golfinho')).toBe('🐬');
  });

  it('ignora caixa e acento', () => {
    expect(getWildShapeAnimalEmoji('ONÇA-PINTADA')).toBe('🐆');
    expect(getWildShapeAnimalEmoji('onca pintada')).toBe('🐆');
  });

  it('casa um nome digitado que contém o animal do catálogo', () => {
    expect(getWildShapeAnimalEmoji('Urso das cavernas')).toBe('🐻');
  });

  it('cai no fallback para bicho desconhecido ou vazio', () => {
    expect(getWildShapeAnimalEmoji('Gorlogg')).toBe(WILD_SHAPE_FALLBACK_EMOJI);
    expect(getWildShapeAnimalEmoji('')).toBe(WILD_SHAPE_FALLBACK_EMOJI);
    expect(getWildShapeAnimalEmoji(undefined)).toBe(WILD_SHAPE_FALLBACK_EMOJI);
  });

  it('acha o animal mesmo vindo de outra forma', () => {
    // O jogador pode digitar "lobo" numa Forma Feroz; o 🐺 mora na Veloz.
    expect(getWildShapeAnimalEmoji('Lobo')).toBe('🐺');
  });
});

describe('animais sugeridos por forma/grau/variante', () => {
  const form = (id: string) => WILD_SHAPE_FORMS.find((f) => f.id === id)!;

  it('todas as formas têm sugestões', () => {
    WILD_SHAPE_FORMS.forEach((f) => {
      expect(f.animals.length).toBeGreaterThan(0);
    });
  });

  it('bichos Enormes só aparecem no grau superior', () => {
    const feroz = form('feroz');
    const nomes = (tier: 'basica' | 'aprimorada' | 'superior') =>
      getWildShapeAnimals(feroz, tier).map((a) => a.name);

    expect(nomes('basica')).not.toContain('Hipopótamo');
    expect(nomes('aprimorada')).not.toContain('Hipopótamo');
    expect(nomes('superior')).toContain('Hipopótamo');
  });

  it('a coruja só aparece no grau que tem voo', () => {
    const sorrateira = form('sorrateira');
    expect(
      getWildShapeAnimals(sorrateira, 'basica').map((a) => a.name)
    ).not.toContain('Coruja');
    expect(
      getWildShapeAnimals(sorrateira, 'superior').map((a) => a.name)
    ).toContain('Coruja');
  });

  it('a Forma Veloz filtra por variante', () => {
    const veloz = form('veloz');
    const nomes = (tier: 'basica' | 'superior', variant: string) =>
      getWildShapeAnimals(veloz, tier, variant).map((a) => a.name);

    expect(nomes('basica', 'natacao')).toEqual([
      'Golfinho',
      'Tubarão',
      'Lontra',
    ]);
    expect(nomes('basica', 'deslocamento')).toEqual([
      'Cervo',
      'Lobo',
      'Cavalo',
    ]);
    expect(nomes('superior', 'voo')).toEqual(['Águia', 'Falcão', 'Corvo']);
    // Sem variante escolhida não há sugestão coerente a dar.
    expect(getWildShapeAnimals(veloz, 'basica')).toEqual([]);
  });
});

describe('resumo do que a forma muda', () => {
  const tierOf = (formId: string, tierId: string) => {
    const form = WILD_SHAPE_FORMS.find((f) => f.id === formId)!;
    return form.tiers.find((t) => t.id === tierId)!;
  };

  it('Forma Feroz Aprimorada', () => {
    expect(describeWildShapeChanges(tierOf('feroz', 'aprimorada'))).toEqual([
      'FOR +5',
      'Defesa +4',
      'Grande',
      'Mordida 2d6',
    ]);
  });

  it('agrupa armas naturais repetidas', () => {
    expect(describeWildShapeChanges(tierOf('agil', 'superior'))).toContain(
      '2× Garra 1d10'
    );
  });

  it('Forma Resistente Superior mostra a RD', () => {
    expect(describeWildShapeChanges(tierOf('resistente', 'superior'))).toEqual(
      expect.arrayContaining(['RD 10', 'Defesa +10', 'Enorme'])
    );
  });

  it('inclui o benefício da variante', () => {
    const tier = tierOf('veloz', 'superior');
    const voo = tier.variants!.find((v) => v.id === 'voo');
    expect(describeWildShapeChanges(tier, voo)).toContain('Voo 24m');
  });

  it('cobre as 15 combinações sem produzir rótulo vazio', () => {
    WILD_SHAPE_FORMS.forEach((form) => {
      form.tiers.forEach((tier) => {
        const changes = describeWildShapeChanges(tier);
        expect(changes.length).toBeGreaterThan(0);
        changes.forEach((c) => expect(c.trim()).not.toBe(''));
      });
    });
  });
});

describe('opções de uso da Forma Selvagem', () => {
  it('não oferece nada sem o poder Forma Selvagem', () => {
    const sheet = druidSheet([]);
    expect(FORMA_SELVAGEM?.getUsageOptions(sheet)).toEqual([]);
  });

  it('só oferece o grau básico com apenas Forma Selvagem', () => {
    const options = FORMA_SELVAGEM?.getUsageOptions(druidSheet()) ?? [];
    // 4 formas sem variante + 3 variantes da Veloz.
    expect(options).toHaveLength(7);
    expect(options.every((o) => o.pmCost === 3)).toBe(true);
  });

  it('destrava o grau aprimorado com o poder correspondente', () => {
    const sheet = druidSheet(['Forma Selvagem', 'Forma Selvagem Aprimorada']);
    const options = FORMA_SELVAGEM?.getUsageOptions(sheet) ?? [];
    expect(options).toHaveLength(14);
    expect(options.some((o) => o.pmCost === 10)).toBe(false);
  });

  it('oferece as 20 opções com os três poderes', () => {
    const sheet = druidSheet([
      'Forma Selvagem',
      'Forma Selvagem Aprimorada',
      'Forma Selvagem Superior',
    ]);
    const options = FORMA_SELVAGEM?.getUsageOptions(sheet) ?? [];
    // 4 formas × 3 graus = 12, mais as variantes da Forma Veloz: 3 no básico,
    // 3 no aprimorado e 2 no superior (o livro só dá natação 18m ou voo 24m).
    expect(options).toHaveLength(20);
  });

  it('avisa quem não tem Magia Natural', () => {
    expect(FORMA_SELVAGEM?.getWarning?.(druidSheet())).toContain(
      'Magia Natural'
    );
    expect(
      FORMA_SELVAGEM?.getWarning?.(
        druidSheet(['Forma Selvagem', 'Magia Natural'])
      )
    ).toBeNull();
  });
});

describe('aplicação e reversão no recálculo', () => {
  it('Forma Feroz Aprimorada dá Força +5, Defesa +4 e tamanho Grande', () => {
    const base = recalculateSheet(druidSheet());

    const sheet = druidSheet();
    sheet.activeEffects = [wildShapeEffect('feroz', 'aprimorada')];
    const out = recalculateSheet(sheet);

    expect(out.defesa - base.defesa).toBe(4);
    expect(out.size.name).toBe('Grande');
    // Força +5 se propaga para as perícias de Força.
    expect(skillOthers(out, Skill.LUTA) - skillOthers(base, Skill.LUTA)).toBe(
      5
    );
    // Tamanho Grande = −2 em Furtividade (aplicado no render, via size.modifiers).
    expect(out.size.modifiers.stealth).toBe(-2);
  });

  it('reverte tamanho, Defesa e movimento ao remover o efeito', () => {
    const base = recalculateSheet(druidSheet());

    const sheet = druidSheet();
    sheet.activeEffects = [wildShapeEffect('sorrateira', 'superior')];
    const transformed = recalculateSheet(sheet);
    expect(transformed.size.name).toBe('Minúsculo');
    expect(transformed.computedMovementTypes?.voo).toBe(18);
    expect(transformed.baseSize).toBeDefined();

    const reverted = recalculateSheet({ ...transformed, activeEffects: [] });
    expect(reverted.size.name).toBe(base.size.name);
    expect(reverted.defesa).toBe(base.defesa);
    expect(reverted.computedMovementTypes).toBeUndefined();
    // O snapshot é descartado junto: nada de lixo na ficha salva.
    expect(reverted.baseSize).toBeUndefined();
  });

  it('trocar de forma sem reverter troca o tamanho, não empilha', () => {
    const sheet = druidSheet();
    sheet.activeEffects = [wildShapeEffect('feroz', 'superior')];
    const enorme = recalculateSheet(sheet);
    expect(enorme.size.name).toBe('Enorme');

    // Mesmo powerKey → o handler substitui a instância anterior.
    const trocada = recalculateSheet({
      ...enorme,
      activeEffects: [wildShapeEffect('sorrateira', 'basica')],
    });
    expect(trocada.size.name).toBe('Pequeno');

    const revertida = recalculateSheet({ ...trocada, activeEffects: [] });
    expect(revertida.size.name).toBe(RACE_SIZES.MEDIO.name);
  });

  it('customSize manual continua vencendo depois de reverter', () => {
    const sheet = druidSheet();
    sheet.customSize = RACE_SIZES.PEQUENO;
    sheet.activeEffects = [wildShapeEffect('feroz', 'superior')];

    const transformed = recalculateSheet(sheet);
    expect(transformed.size.name).toBe('Enorme');

    const reverted = recalculateSheet({ ...transformed, activeEffects: [] });
    expect(reverted.size.name).toBe('Pequeno');
  });

  it('ficha sem efeito de forma não é tocada pelo Step 11.5', () => {
    const sheet = druidSheet();
    const out = recalculateSheet(sheet);
    expect(out.baseSize).toBeUndefined();
    expect(out.computedMovementTypes).toBeUndefined();
    expect(out.size).toEqual(sheet.size);
  });

  it('Forma Resistente Superior aplica RD 10', () => {
    const sheet = druidSheet();
    sheet.activeEffects = [wildShapeEffect('resistente', 'superior')];
    const out = recalculateSheet(sheet);
    expect(out.reducaoDeDano?.Geral).toBe(10);
  });

  it('Forma Veloz fixa o deslocamento na variante terrestre', () => {
    const sheet = druidSheet();
    sheet.activeEffects = [wildShapeEffect('veloz', 'basica', 'deslocamento')];
    const out = recalculateSheet(sheet);
    expect(out.displacement).toBe(15);
  });

  it('deslocamento secundário manual não é sobrescrito, só mesclado', () => {
    const sheet = druidSheet();
    sheet.movementTypes = { escalada: 6, voo: 30 };
    sheet.activeEffects = [wildShapeEffect('sorrateira', 'superior')];
    const out = recalculateSheet(sheet);

    // O campo manual segue intacto...
    expect(out.movementTypes).toEqual({ escalada: 6, voo: 30 });
    // ...e o derivado mantém o MAIOR entre manual (30m) e forma (18m).
    expect(out.computedMovementTypes).toEqual({ escalada: 6, voo: 30 });
  });

  it('Destreza da forma se propaga para Defesa e perícias', () => {
    const base = recalculateSheet(druidSheet());
    const sheet = druidSheet();
    sheet.activeEffects = [wildShapeEffect('agil', 'superior')];
    const out = recalculateSheet(sheet);

    expect(
      skillOthers(out, Skill.ACROBACIA) - skillOthers(base, Skill.ACROBACIA)
    ).toBe(6);
    // DES +6 entra na Defesa; o tamanho Grande não mexe em Defesa em T20.
    expect(out.defesa - base.defesa).toBe(6);
  });
});

describe('armas naturais virtuais', () => {
  it('não devolve nada fora de forma', () => {
    expect(getWildShapeNaturalWeapons(druidSheet())).toEqual([]);
    expect(getWildShapeNaturalWeapons(undefined)).toEqual([]);
  });

  it('Forma Ágil Superior devolve duas garras 1d10 margem 19', () => {
    const sheet = druidSheet();
    sheet.activeEffects = [wildShapeEffect('agil', 'superior')];

    const weapons = getWildShapeNaturalWeapons(sheet);
    expect(weapons).toHaveLength(2);
    weapons.forEach((weapon) => {
      expect(weapon.dano).toBe('1d10');
      expect(weapon.critico).toBe('19');
      expect(weapon.group).toBe('Arma');
      expect(weapon.weaponTags).toContain('natural');
      expect(weapon.preco).toBe(0);
    });
    // Ids estáveis e distintos entre si — o React não remonta as linhas.
    expect(weapons[0].id).not.toBe(weapons[1].id);
    expect(getWildShapeNaturalWeapons(sheet)[0].id).toBe(weapons[0].id);
  });

  it('não entram na mochila', () => {
    const sheet = druidSheet();
    sheet.activeEffects = [wildShapeEffect('feroz', 'basica')];
    const out = recalculateSheet(sheet);
    expect(
      (out.bag.equipments.Arma ?? []).some((w) => w.nome.includes('Forma'))
    ).toBe(false);
  });

  it('optionId desconhecido não quebra a leitura da forma', () => {
    const sheet = druidSheet();
    sheet.activeEffects = [
      {
        ...wildShapeEffect('feroz', 'basica'),
        optionId: 'wildshape:forma-que-nao-existe:basica',
      },
    ];
    expect(getActiveWildShape(sheet)).toBeNull();
    expect(getWildShapeNaturalWeapons(sheet)).toEqual([]);
  });
});

describe('atributos exibidos', () => {
  it('o motor NÃO muta atributos[attr].value', () => {
    const sheet = druidSheet();
    const baseForca = sheet.atributos[Atributo.FORCA].value;
    sheet.activeEffects = [wildShapeEffect('feroz', 'superior')];
    const out = recalculateSheet(sheet);
    // +10 de Força vive só nos bônus derivados — o valor persistido é o base.
    expect(out.atributos[Atributo.FORCA].value).toBe(baseForca);
  });
});
