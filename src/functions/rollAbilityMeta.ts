import type {
  PowerEffectBonusPayload,
  RollAbilityEffectOffer,
  RollAbilityMeta,
} from '@/premium/services/socket.service';
import type {
  ActiveEffectUsageOption,
  ActivePowerDefinition,
} from '@/premium/interfaces/ActiveEffect';
import type { Spell } from '../interfaces/Spells';
import {
  getPowerDisplayName,
  getPowerDisplayText,
  PowerDisplaySource,
} from './powers/powerText';

/**
 * Metadados que acompanham uma entrada do histórico de rolagens quando ela
 * representa o uso de um poder ou de uma magia.
 *
 * Existem porque o alerta em tempo real de efeito ativo não alcança todo
 * mundo: no mobile o jogador que está na aba "Encontro" (e quem estava com a
 * tela apagada) perde a oferta. O card do histórico vira o registro durável
 * do que foi usado — com nome, descrição e um botão para ativar o efeito
 * depois.
 */

// Descrições completas de poder/magia chegam a milhares de caracteres e o
// card só mostra as primeiras linhas. Truncar na origem evita trafegar (e
// persistir) texto que ninguém vai ler.
export const ABILITY_DESCRIPTION_MAX_LENGTH = 600;

export function truncateAbilityDescription(raw?: string): {
  description?: string;
  descriptionTruncated?: boolean;
} {
  const text = raw?.trim();
  if (!text) return {};
  if (text.length <= ABILITY_DESCRIPTION_MAX_LENGTH)
    return { description: text };

  const hardCut = text.slice(0, ABILITY_DESCRIPTION_MAX_LENGTH);
  const lastSpace = hardCut.lastIndexOf(' ');
  // Só corta na palavra quando isso não devora metade do texto (descrições
  // sem espaço nenhum são raras, mas existem em conteúdo homebrew).
  const cut =
    lastSpace > ABILITY_DESCRIPTION_MAX_LENGTH * 0.5
      ? hardCut.slice(0, lastSpace)
      : hardCut;

  return { description: `${cut.trimEnd()}…`, descriptionTruncated: true };
}

export function buildPowerAbilityMeta(
  power: PowerDisplaySource,
  sourceLabel?: string
): RollAbilityMeta {
  return {
    kind: 'power',
    name: getPowerDisplayName(power),
    sourceLabel,
    ...truncateAbilityDescription(getPowerDisplayText(power)),
  };
}

export function buildSpellAbilityMeta(
  spell: Spell,
  pmCost: number
): RollAbilityMeta {
  return {
    kind: 'spell',
    name: spell.nome,
    circle: spell.spellCircle,
    school: spell.school,
    pmCost: pmCost > 0 ? pmCost : undefined,
    ...truncateAbilityDescription(spell.description),
  };
}

/**
 * Congela a opção de uso JÁ RESOLVIDA (o `ActivePowerUseDialog` expande os
 * tiers com `scale` antes de confirmar) numa oferta auto-contida. Sem isso,
 * quem recebe precisaria ter a definição no próprio registry — o que não
 * acontece com efeitos homebrew do jogador que usou o poder.
 */
export function buildEffectOffer(
  definition: ActivePowerDefinition,
  option: ActiveEffectUsageOption
): RollAbilityEffectOffer {
  return {
    powerKey: definition.key,
    name: definition.name,
    sourceLabel: definition.sourceLabel,
    optionId: option.id,
    optionLabel: option.label,
    bonuses: option.bonuses as unknown as PowerEffectBonusPayload[],
    grantsTempPM: option.grantsTempPM,
    grantsTempPV: option.grantsTempPV,
    affectsAllies: definition.affectsAllies,
  };
}
