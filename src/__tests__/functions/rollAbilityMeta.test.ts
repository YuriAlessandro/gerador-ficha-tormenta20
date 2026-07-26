/**
 * Metadados de poder/magia no histórico de rolagens.
 *
 * O card do histórico é a segunda chance de quem perdeu o alerta em tempo
 * real de um efeito ativo (jogador na aba "Encontro" no mobile, tela apagada,
 * longe da mesa). Estes testes cobrem o que vai dentro dele: o texto truncado
 * que trafega no socket e a oferta AUTO-CONTIDA que permite ao outro cliente
 * aplicar o efeito sem ter a definição no próprio registry.
 */
import { describe, it, expect } from 'vitest';
import {
  ABILITY_DESCRIPTION_MAX_LENGTH,
  buildEffectOffer,
  buildPowerAbilityMeta,
  buildSpellAbilityMeta,
  truncateAbilityDescription,
} from '../../functions/rollAbilityMeta';
import { Spell, spellsCircles } from '../../interfaces/Spells';
import type {
  ActiveEffectUsageOption,
  ActivePowerDefinition,
} from '../../premium/interfaces/ActiveEffect';

describe('truncateAbilityDescription', () => {
  it('devolve vazio para texto ausente ou em branco', () => {
    expect(truncateAbilityDescription(undefined)).toEqual({});
    expect(truncateAbilityDescription('   ')).toEqual({});
  });

  it('mantém texto curto intacto e sem flag de truncado', () => {
    const result = truncateAbilityDescription('Você recebe +2 em Fortitude.');
    expect(result.description).toBe('Você recebe +2 em Fortitude.');
    expect(result.descriptionTruncated).toBeUndefined();
  });

  it('trunca texto longo na fronteira de palavra e sinaliza', () => {
    const long = `${'palavra '.repeat(200)}fim`;
    const result = truncateAbilityDescription(long);

    expect(result.descriptionTruncated).toBe(true);
    expect(result.description?.endsWith('…')).toBe(true);
    expect(result.description!.length).toBeLessThanOrEqual(
      ABILITY_DESCRIPTION_MAX_LENGTH + 1
    );
    // Cortou entre palavras: nada de "palav…"
    expect(result.description).not.toMatch(/palav…$/);
  });

  it('trunca mesmo sem espaços no texto', () => {
    const result = truncateAbilityDescription('x'.repeat(1200));
    expect(result.descriptionTruncated).toBe(true);
    expect(result.description!.length).toBe(ABILITY_DESCRIPTION_MAX_LENGTH + 1);
  });
});

describe('buildPowerAbilityMeta', () => {
  it('usa o texto do poder (campo `text`) e o rótulo de origem', () => {
    const meta = buildPowerAbilityMeta(
      { name: 'Inspiração', text: 'Aliados recebem +1d4 em testes.' },
      'Poder de Bardo'
    );

    expect(meta).toEqual({
      kind: 'power',
      name: 'Inspiração',
      sourceLabel: 'Poder de Bardo',
      description: 'Aliados recebem +1d4 em testes.',
    });
  });

  it('respeita nome e descrição customizados pelo usuário', () => {
    const meta = buildPowerAbilityMeta({
      name: 'Inspiração',
      text: 'Texto do livro.',
      customName: 'Canção de Guerra',
      customDescription: 'Minha versão.',
    });

    expect(meta.name).toBe('Canção de Guerra');
    expect(meta.description).toBe('Minha versão.');
  });
});

describe('buildSpellAbilityMeta', () => {
  const spell = {
    nome: 'Bola de Fogo',
    execucao: 'Padrão',
    alcance: 'Médio',
    duracao: 'Instantânea',
    description: 'Causa 8d6 pontos de dano de fogo.',
    spellCircle: spellsCircles.c3,
    school: 'Evoc',
  } as Spell;

  it('leva círculo, escola, descrição e PM gasto', () => {
    expect(buildSpellAbilityMeta(spell, 6)).toEqual({
      kind: 'spell',
      name: 'Bola de Fogo',
      circle: spellsCircles.c3,
      school: 'Evoc',
      pmCost: 6,
      description: 'Causa 8d6 pontos de dano de fogo.',
    });
  });

  it('omite o custo quando o jogador optou por não gastar PM', () => {
    expect(buildSpellAbilityMeta(spell, 0).pmCost).toBeUndefined();
  });
});

describe('buildEffectOffer', () => {
  const definition = {
    key: 'bardo:inspiracao',
    name: 'Inspiração',
    className: 'Bardo',
    sourceLabel: 'Bardo · Inspiração',
    affectsAllies: true,
    getUsageOptions: () => [],
  } as unknown as ActivePowerDefinition;

  const option: ActiveEffectUsageOption = {
    id: 'padrao',
    label: '+1d4 em testes',
    pmCost: 1,
    bonuses: [
      {
        target: { type: 'Skill', name: 'Atletismo' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ] as unknown as ActiveEffectUsageOption['bonuses'],
    grantsTempPV: 5,
  };

  it('congela a opção já resolvida numa oferta auto-contida', () => {
    const offer = buildEffectOffer(definition, option);

    expect(offer.powerKey).toBe('bardo:inspiracao');
    expect(offer.optionId).toBe('padrao');
    expect(offer.optionLabel).toBe('+1d4 em testes');
    expect(offer.grantsTempPV).toBe(5);
    expect(offer.affectsAllies).toBe(true);
    // Os bônus viajam inteiros: é isso que permite aplicar o efeito num
    // cliente que não tem a definição (efeito homebrew de outro jogador).
    expect(offer.bonuses).toEqual(option.bonuses);
  });

  it('propaga affectsAllies=false (efeito pessoal não vira botão pros outros)', () => {
    const personal = {
      ...definition,
      affectsAllies: false,
    } as unknown as ActivePowerDefinition;
    expect(buildEffectOffer(personal, option).affectsAllies).toBe(false);
  });
});
