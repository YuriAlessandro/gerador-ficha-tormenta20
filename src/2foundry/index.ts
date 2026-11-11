import CharacterSheet from '../interfaces/CharacterSheet';
import { buildActorSystem, buildClassItems } from './actor';
import { collectSheetPowers } from '../functions/powers/collectSheetPowers';
import {
  buildActorToggleEffects,
  buildAttributeLayerEffects,
  buildAutomations,
  findToggles,
} from './automations';
import { buildPassiveEffect } from './effects';
import { buildEquipmentItems } from './items/equipment';
import { buildPowerItems } from './items/powers';
import { buildRaceItem } from './items/race';
import { buildSpellItems } from './items/spells';
import { FoundryJSON } from './types';
import { FOUNDRY_SYSTEM_VERSION } from './version';

export { convertThreatToFoundry } from './threatExporter';
export { FOUNDRY_CORE_VERSION, FOUNDRY_SYSTEM_VERSION } from './version';
export type { FoundryItem, FoundryJSON } from './types';

/**
 * Ficha → ator `character` do sistema Tormenta20 do Foundry VTT, para o
 * "Importar Dados" do ator. Tudo é montado a partir dos dados da própria ficha,
 * inclusive as automações (`automations.ts`) — ver `README.md` desta pasta.
 */
export function convertToFoundry(sheet: CharacterSheet): FoundryJSON {
  const toggles = findToggles(
    sheet,
    collectSheetPowers(sheet).powers.map((power) => power.name)
  );
  const automations = buildAutomations(sheet, toggles);
  const powers = buildPowerItems(sheet, automations.groups);

  const items = [
    ...buildRaceItem(sheet),
    ...buildClassItems(sheet),
    ...powers.items,
    ...buildSpellItems(sheet),
    ...buildEquipmentItems(sheet),
  ];

  // Ativáveis: desligados, para o jogador ligar na aba de Efeitos do ator —
  // ligados quando a opção está ativa na ficha.
  const toggleEffects = buildActorToggleEffects(sheet, toggles);
  const effects = [
    // Bônus de raça, item, ajuste manual… — sem item de poder para carregá-los.
    ...powers.unclaimed.map((group) =>
      buildPassiveEffect(group.label, group.changes, false)
    ),
    ...toggleEffects,
    // O resto da camada de atributo efetivo, ligado como está na ficha.
    ...buildAttributeLayerEffects(sheet, toggleEffects),
  ];

  return {
    // O Foundry recusa documento sem nome.
    name: sheet.nome?.trim() || 'Personagem',
    type: 'character',
    system: buildActorSystem(sheet, items, effects, automations),
    items,
    effects,
    flags: { tormenta20: { lvlconfig: { manual: true } } },
    // Sem `systemVersion` o sistema trata o ator como anterior à edição Jogo
    // do Ano e converte os atributos como se fossem valores de 3 a 18.
    _stats: { systemId: 'tormenta20', systemVersion: FOUNDRY_SYSTEM_VERSION },
  };
}

/** Baixa o JSON exportado como arquivo. */
export function downloadFoundryJSON(json: object, name: string): void {
  const blob = new Blob([JSON.stringify(json)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${name}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}
