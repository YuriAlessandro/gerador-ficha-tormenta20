import { recalculateSheet } from '../recalculateSheet';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import type { SheetAnimalCompanion } from '../../premium/interfaces/AnimalCompanion';
import {
  buildAnimalCompanionEffect,
  getAnimalCompanionActivatedPowers,
  getAnimalCompanionTier,
  getCompanionDisplayName,
  getCompanionSkillChoiceSlots,
  hasPendingSkillChoices,
  isAnimalCompanionPowerKey,
  reconcileAnimalCompanionEffects,
} from '../../premium/functions/animalCompanionEffects';
import { DRUID_COMPANION_ARCHETYPES } from '../../premium/data/animalCompanions';
import { getBuiltinPartnerById } from '../../premium/data/partners';

/**
 * Companheiro Animal do Druida: derivação do grau pelo nível, mesclagem dos
 * tipos, Lendário dobrando os bônus e idempotência do reconciler.
 */

function companion(
  overrides: Partial<SheetAnimalCompanion> = {}
): SheetAnimalCompanion {
  return {
    id: 'companion-1',
    name: 'Presa Ligeira',
    species: 'Lobo',
    archetype: 'perseguidor',
    ...overrides,
  };
}

function druidSheet(level: number, companions: SheetAnimalCompanion[] = []) {
  const sheet = createMockCharacterSheet();
  sheet.classe = { ...sheet.classe, name: 'Druida' };
  sheet.nivel = level;
  sheet.animalCompanions = companions;
  return sheet;
}

const skillOthers = (sheet: CharacterSheet, name: Skill): number =>
  sheet.completeSkills?.find((s) => s.name === name)?.others ?? 0;

describe('grau do companheiro', () => {
  it('segue a progressão do livro: iniciante → 7º veterano → 15º mestre', () => {
    expect(getAnimalCompanionTier(1)).toBe('iniciante');
    expect(getAnimalCompanionTier(6)).toBe('iniciante');
    expect(getAnimalCompanionTier(7)).toBe('veterano');
    expect(getAnimalCompanionTier(14)).toBe('veterano');
    expect(getAnimalCompanionTier(15)).toBe('mestre');
    expect(getAnimalCompanionTier(20)).toBe('mestre');
  });

  it('respeita o override manual', () => {
    const effect = buildAnimalCompanionEffect(
      companion({ tierOverride: 'mestre' }),
      1
    );
    // Mestre do Perseguidor tem Percepção às Cegas (informativo) além do passivo.
    expect(effect?.bonuses).toHaveLength(2);
  });
});

describe('catálogo de arquétipos do druida', () => {
  it('todos os tipos oferecidos existem nos três graus', () => {
    DRUID_COMPANION_ARCHETYPES.forEach((archetype) => {
      ['iniciante', 'veterano', 'mestre'].forEach((tier) => {
        expect(
          getBuiltinPartnerById(`builtin:${archetype}:${tier}`)
        ).toBeDefined();
      });
    });
  });
});

describe('construção do efeito passivo', () => {
  it('devolve null quando o companheiro está descansando', () => {
    expect(
      buildAnimalCompanionEffect(companion({ resting: true }), 5)
    ).toBeNull();
  });

  it('devolve null para tipos sem bônus numérico (montaria)', () => {
    // Montaria é toda informativa: o deslocamento só vale montado.
    expect(
      buildAnimalCompanionEffect(companion({ archetype: 'montaria' }), 5)
    ).toBeNull();
  });

  it('usa o id do companheiro como instanceId (determinístico)', () => {
    const effect = buildAnimalCompanionEffect(companion(), 5);
    expect(effect?.instanceId).toBe('companion-1');
    expect(isAnimalCompanionPowerKey(effect!.powerKey)).toBe(true);
  });

  it('Lendário dobra os bônus do tipo original', () => {
    const normal = buildAnimalCompanionEffect(companion(), 5);
    const lendario = buildAnimalCompanionEffect(
      companion({ legendary: true }),
      5
    );

    const valueOf = (eff: typeof normal) =>
      eff!.bonuses.map((b) =>
        b.modifier.type === 'Fixed' ? b.modifier.value : 0
      );

    expect(valueOf(normal)).toEqual([2, 2]);
    expect(valueOf(lendario)).toEqual([4, 4]);
  });

  it('Lendário NÃO dobra o segundo tipo', () => {
    const effect = buildAnimalCompanionEffect(
      companion({
        archetype: 'perseguidor',
        secondaryArchetype: 'guardiao',
        legendary: true,
      }),
      5
    );
    const values = effect!.bonuses.map((b) =>
      b.modifier.type === 'Fixed' ? b.modifier.value : 0
    );
    // Perseguidor dobrado (4, 4) + Guardião no valor normal.
    expect(values.slice(0, 2)).toEqual([4, 4]);
    expect(values.slice(2).every((v) => v <= 3)).toBe(true);
  });

  it('ignora um segundo tipo igual ao primário', () => {
    const single = buildAnimalCompanionEffect(companion(), 5);
    const duplicated = buildAnimalCompanionEffect(
      companion({ secondaryArchetype: 'perseguidor' }),
      5
    );
    expect(duplicated?.bonuses).toHaveLength(single!.bonuses.length);
  });
});

describe('nome exibido', () => {
  it('cai na espécie e depois num rótulo genérico', () => {
    expect(getCompanionDisplayName(companion())).toBe('Presa Ligeira');
    expect(getCompanionDisplayName(companion({ name: '  ' }))).toBe('Lobo');
    expect(getCompanionDisplayName(companion({ name: '', species: '' }))).toBe(
      'Companheiro Animal'
    );
  });
});

describe('reconciler', () => {
  it('cria o efeito quando o companheiro entra na ficha', () => {
    const sheet = druidSheet(5, [companion()]);
    const next = reconcileAnimalCompanionEffects(sheet);
    expect(next).toHaveLength(1);
    expect(next![0].instanceId).toBe('companion-1');
  });

  it('é idempotente — devolve null quando já está sincronizado', () => {
    const sheet = druidSheet(5, [companion()]);
    const first = reconcileAnimalCompanionEffects(sheet);
    const synced = { ...sheet, activeEffects: first! };
    expect(reconcileAnimalCompanionEffects(synced)).toBeNull();
  });

  it('remove o efeito quando o companheiro sai da ficha', () => {
    const sheet = druidSheet(5, [companion()]);
    const withEffect = {
      ...sheet,
      activeEffects: reconcileAnimalCompanionEffects(sheet)!,
    };
    const removed = { ...withEffect, animalCompanions: [] };
    expect(reconcileAnimalCompanionEffects(removed)).toEqual([]);
  });

  it('atualiza os bônus quando o grau muda com o nível', () => {
    const iniciante = druidSheet(5, [companion({ archetype: 'guardiao' })]);
    const effects = reconcileAnimalCompanionEffects(iniciante)!;

    // Mesmo companheiro, druida agora nível 15 → grau mestre, bônus diferentes.
    const mestre = {
      ...druidSheet(15, iniciante.animalCompanions),
      activeEffects: effects,
    };
    const updated = reconcileAnimalCompanionEffects(mestre);
    expect(updated).not.toBeNull();
    expect(JSON.stringify(updated![0].bonuses)).not.toBe(
      JSON.stringify(effects[0].bonuses)
    );
  });

  it('preserva efeitos que não são de companheiro', () => {
    const sheet = druidSheet(5, [companion()]);
    sheet.activeEffects = [
      {
        instanceId: 'outro',
        powerKey: 'druida:oraculo-natureza',
        name: 'Oráculo da Natureza',
        sourceLabel: 'Druida · Oráculo',
        optionId: 'oraculo',
        optionLabel: '+2 CD',
        bonuses: [],
        appliedAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    const next = reconcileAnimalCompanionEffects(sheet)!;
    expect(next.some((e) => e.powerKey === 'druida:oraculo-natureza')).toBe(
      true
    );
    expect(next).toHaveLength(2);
  });

  it('descansar suprime o bônus sem apagar o companheiro', () => {
    const acordado = druidSheet(5, [companion()]);
    const comEfeito = {
      ...acordado,
      activeEffects: reconcileAnimalCompanionEffects(acordado)!,
    };

    const dormindo = {
      ...comEfeito,
      animalCompanions: [companion({ resting: true })],
    };
    expect(reconcileAnimalCompanionEffects(dormindo)).toEqual([]);
    // O companheiro continua na ficha — só não gera efeito.
    expect(dormindo.animalCompanions).toHaveLength(1);

    // Ficha que já nasce sem efeito e sem companheiro ativo já está em dia.
    const nuncaTeve = druidSheet(5, [companion({ resting: true })]);
    expect(reconcileAnimalCompanionEffects(nuncaTeve)).toBeNull();
  });
});

describe('integração com o recálculo', () => {
  it('o bônus do parceiro chega às perícias da ficha', () => {
    const base = recalculateSheet(druidSheet(5));

    const sheet = druidSheet(5, [companion()]);
    sheet.activeEffects = reconcileAnimalCompanionEffects(sheet)!;
    const out = recalculateSheet(sheet);

    // Perseguidor iniciante: +2 em Percepção e Sobrevivência.
    expect(
      skillOthers(out, Skill.PERCEPCAO) - skillOthers(base, Skill.PERCEPCAO)
    ).toBe(2);
    expect(
      skillOthers(out, Skill.SOBREVIVENCIA) -
        skillOthers(base, Skill.SOBREVIVENCIA)
    ).toBe(2);
  });
});

describe('benefícios ativados', () => {
  it('vira ActivePowerDefinition virtual por benefício', () => {
    const sheet = druidSheet(5, [companion({ archetype: 'fortao' })]);
    const powers = getAnimalCompanionActivatedPowers(sheet);
    expect(powers).toHaveLength(1);
    expect(powers[0].sourceLabel).toBe('Companheiro · Presa Ligeira');
    expect(powers[0].getUsageOptions(sheet)).toHaveLength(1);
  });

  it('companheiro descansando não oferece ações', () => {
    const sheet = druidSheet(5, [
      companion({ archetype: 'fortao', resting: true }),
    ]);
    expect(getAnimalCompanionActivatedPowers(sheet)).toEqual([]);
  });
});

describe('Ajudante — perícias à escolha do jogador', () => {
  const ajudante = (skillChoices?: Record<string, string[]>) =>
    companion({ archetype: 'ajudante', skillChoices });

  it('expõe um slot de escolha com as perícias elegíveis', () => {
    const [slot, ...rest] = getCompanionSkillChoiceSlots(ajudante(), 5);
    expect(rest).toHaveLength(0);
    expect(slot.pick).toBe(2);
    expect(slot.selected).toEqual([]);
    // Bônus de perícia jamais em Luta/Pontaria.
    expect(slot.options).not.toContain(Skill.LUTA);
    expect(slot.options).not.toContain(Skill.PONTARIA);
    expect(slot.options).toContain(Skill.DIPLOMACIA);
  });

  it('sem escolha, nenhum bônus é aplicado (e o painel avisa)', () => {
    expect(buildAnimalCompanionEffect(ajudante(), 5)).toBeNull();
    expect(hasPendingSkillChoices(ajudante(), 5)).toBe(true);
  });

  it('a escolha vira bônus de perícia na ficha', () => {
    const slot = getCompanionSkillChoiceSlots(ajudante(), 5)[0];
    const chosen = ajudante({
      [slot.key]: [Skill.DIPLOMACIA, Skill.PERCEPCAO],
    });
    expect(hasPendingSkillChoices(chosen, 5)).toBe(false);

    const base = recalculateSheet(druidSheet(5));
    const sheet = druidSheet(5, [chosen]);
    sheet.activeEffects = reconcileAnimalCompanionEffects(sheet)!;
    const out = recalculateSheet(sheet);

    expect(
      skillOthers(out, Skill.DIPLOMACIA) - skillOthers(base, Skill.DIPLOMACIA)
    ).toBe(2);
    expect(
      skillOthers(out, Skill.PERCEPCAO) - skillOthers(base, Skill.PERCEPCAO)
    ).toBe(2);
  });

  it('a escolha sobrevive à subida de grau, que só muda quantidade/valor', () => {
    const slot = getCompanionSkillChoiceSlots(ajudante(), 5)[0];
    const chosen = ajudante({
      [slot.key]: [Skill.DIPLOMACIA, Skill.PERCEPCAO, Skill.FURTIVIDADE],
    });

    // Mestre: +4 em três perícias. Mesma chave, nada de reescolher.
    const [mestreSlot] = getCompanionSkillChoiceSlots(chosen, 15);
    expect(mestreSlot.key).toBe(slot.key);
    expect(mestreSlot.pick).toBe(3);
    expect(hasPendingSkillChoices(chosen, 15)).toBe(false);

    const effect = buildAnimalCompanionEffect(chosen, 15);
    expect(effect!.bonuses).toHaveLength(3);
    expect(
      effect!.bonuses.every(
        (b) => b.target.type === 'Skill' && b.modifier.type === 'Fixed'
      )
    ).toBe(true);
  });

  it('respeita o limite de escolhas do grau', () => {
    const slot = getCompanionSkillChoiceSlots(ajudante(), 5)[0];
    // Três perícias guardadas, mas iniciante só eleva duas.
    const chosen = ajudante({
      [slot.key]: [Skill.DIPLOMACIA, Skill.PERCEPCAO, Skill.FURTIVIDADE],
    });
    expect(buildAnimalCompanionEffect(chosen, 5)!.bonuses).toHaveLength(2);
  });

  it('Lendário dobra o bônus escolhido', () => {
    const slot = getCompanionSkillChoiceSlots(ajudante(), 5)[0];
    const effect = buildAnimalCompanionEffect(
      companion({
        archetype: 'ajudante',
        legendary: true,
        skillChoices: { [slot.key]: [Skill.DIPLOMACIA, Skill.PERCEPCAO] },
      }),
      5
    );
    expect(
      effect!.bonuses.map((b) =>
        b.modifier.type === 'Fixed' ? b.modifier.value : 0
      )
    ).toEqual([4, 4]);
  });

  it('como segundo tipo, tem chave própria', () => {
    const dual = companion({
      archetype: 'perseguidor',
      secondaryArchetype: 'ajudante',
    });
    const slots = getCompanionSkillChoiceSlots(dual, 5);
    expect(slots).toHaveLength(1);
    expect(slots[0].key.startsWith('ajudante:')).toBe(true);

    // Sem escolha, o companheiro ainda entrega os bônus do tipo primário.
    const effect = buildAnimalCompanionEffect(dual, 5);
    expect(effect!.bonuses).toHaveLength(2);
  });
});
