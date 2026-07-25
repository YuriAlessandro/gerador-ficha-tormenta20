/**
 * Aplicação de uma oferta de efeito ativo recebida da mesa.
 *
 * A mesma função atende os dois caminhos — o alerta em tempo real e o botão
 * "Ativar na minha ficha" do card do histórico. Como os dois podem cair sobre
 * a mesma oferta (o jogador aceita o modal e depois clica no card), a
 * operação precisa ser idempotente por `powerKey`; do contrário o PV/PM
 * temporário empilharia.
 */
import { describe, it, expect } from 'vitest';
import { applyEffectOfferToSheet } from '../../premium/functions/applyEffectOffer';
import type { EffectOfferInput } from '../../premium/functions/applyEffectOffer';
import CharacterSheet from '../../interfaces/CharacterSheet';
import { CharacterAttributes } from '../../interfaces/Character';
import { Atributo } from '../../data/systems/tormenta20/atributos';
import Bag from '../../interfaces/Bag';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';

const createSheet = (): CharacterSheet => {
  const [bardClass] = dataRegistry
    .getClassesBySupplements([SupplementId.TORMENTA20_CORE])
    .filter((c) => c.name === 'Bardo');
  const [humanoRace] = dataRegistry
    .getRacesBySupplements([SupplementId.TORMENTA20_CORE])
    .filter((r) => r.name === 'Humano');

  const atributos: CharacterAttributes = {
    [Atributo.FORCA]: { name: Atributo.FORCA, value: 0 },
    [Atributo.DESTREZA]: { name: Atributo.DESTREZA, value: 2 },
    [Atributo.CONSTITUICAO]: { name: Atributo.CONSTITUICAO, value: 1 },
    [Atributo.INTELIGENCIA]: { name: Atributo.INTELIGENCIA, value: 0 },
    [Atributo.SABEDORIA]: { name: Atributo.SABEDORIA, value: 0 },
    [Atributo.CARISMA]: { name: Atributo.CARISMA, value: 4 },
  };

  return {
    id: 'sheet-1',
    nome: 'Aliado',
    sexo: 'Masculino',
    nivel: 3,
    atributos,
    raca: humanoRace,
    classe: bardClass,
    skills: [],
    pv: 30,
    pm: 20,
    currentPM: 12,
    sheetBonuses: [],
    sheetActionHistory: [],
    defesa: 10,
    bag: new Bag(),
    devoto: undefined,
    origin: undefined,
    spells: [],
    displacement: 9,
    size: humanoRace.size!,
    maxSpaces: 10,
    generalPowers: [],
    classPowers: [],
    steps: [],
  };
};

const offer: EffectOfferInput = {
  powerKey: 'bardo:inspiracao',
  name: 'Inspiração',
  sourceLabel: 'Bardo · Inspiração',
  optionId: 'padrao',
  optionLabel: '+1d4 em testes',
  bonuses: [],
  grantsTempPV: 5,
  appliedBy: { playerName: 'Bardo da mesa', characterName: 'Lyra' },
};

describe('applyEffectOfferToSheet', () => {
  it('adiciona o efeito marcado como vindo da mesa, sem cobrar PM', () => {
    const sheet = createSheet();
    const result = applyEffectOfferToSheet(sheet, offer, 'instance-1');

    const applied = result.activeEffects ?? [];
    expect(applied).toHaveLength(1);
    expect(applied[0].powerKey).toBe('bardo:inspiracao');
    expect(applied[0].instanceId).toBe('instance-1');
    expect(applied[0].fromTable).toBe(true);
    expect(applied[0].appliedManually).toBeUndefined();
    expect(applied[0].appliedBy?.characterName).toBe('Lyra');
    // Quem paga o PM é quem usou o poder.
    expect(result.currentPM).toBe(sheet.currentPM);
  });

  it('reativar pelo próprio card marca como manual, não como vindo da mesa', () => {
    const sheet = createSheet();
    const result = applyEffectOfferToSheet(sheet, offer, 'instance-1', 'self');

    const applied = result.activeEffects ?? [];
    expect(applied[0].appliedManually).toBe(true);
    expect(applied[0].fromTable).toBeUndefined();
    // O PM já saiu na ativação original.
    expect(result.currentPM).toBe(sheet.currentPM);
  });

  it('soma o PV temporário concedido', () => {
    const result = applyEffectOfferToSheet(createSheet(), offer, 'instance-1');
    expect(result.tempPV).toBe(5);
  });

  it('reaplicar a mesma oferta não empilha efeito nem PV temporário', () => {
    const once = applyEffectOfferToSheet(createSheet(), offer, 'instance-1');
    const twice = applyEffectOfferToSheet(once, offer, 'instance-2');

    expect(twice.activeEffects).toHaveLength(1);
    expect(twice.activeEffects?.[0].instanceId).toBe('instance-2');
    expect(twice.tempPV).toBe(5);
  });

  it('não mexe em efeitos de outros poderes', () => {
    const first = applyEffectOfferToSheet(createSheet(), offer, 'instance-1');
    const second = applyEffectOfferToSheet(
      first,
      {
        ...offer,
        powerKey: 'clerigo:bencao',
        name: 'Bênção',
        grantsTempPV: 3,
      },
      'instance-2'
    );

    expect(second.activeEffects).toHaveLength(2);
    expect(second.tempPV).toBe(8);
  });

  it('mantém a Bag utilizável depois do recálculo', () => {
    const result = applyEffectOfferToSheet(createSheet(), offer, 'instance-1');
    expect(typeof result.bag.getEquipments).toBe('function');
  });
});
