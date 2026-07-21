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
