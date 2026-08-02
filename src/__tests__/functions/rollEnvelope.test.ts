/**
 * Envelope `||RG||` do histórico de rolagens.
 *
 * O payload de DICE_ROLL do backend é legado e descarta campos desconhecidos,
 * então rollGroups, nome do personagem e os metadados do poder/magia viajam
 * como JSON dentro do próprio `rollLabel`. Quebrar esse contrato faz a
 * rolagem chegar sem grupos (ou sem o botão de ativar efeito) nos outros
 * clientes — e o backend, que tem um decoder espelhado, deixa de persistir.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  decodeRollLabel,
  encodeRollLabel,
  normalizeDiceResultPayload,
  ENCODED_LABEL_MAX_LENGTH,
  ROLL_GROUPS_DELIMITER,
} from '../../premium/services/rollEnvelope';
import type {
  DiceRollPayload,
  RollGroup,
} from '../../premium/services/socket.service';

const groups: RollGroup[] = [
  {
    label: 'Dano',
    diceNotation: '8d6',
    rolls: [3, 4, 5, 2, 6, 1, 4, 3],
    modifier: 0,
    total: 28,
  },
];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('encode → decode', () => {
  it('preserva grupos, nome do personagem e habilidade', () => {
    const encoded = encodeRollLabel('Bola de Fogo', {
      rollGroups: groups,
      characterName: 'Tark',
      ability: {
        kind: 'spell',
        name: 'Bola de Fogo',
        description: 'Causa 8d6 de dano de fogo.',
        circle: '3º Circulo',
        pmCost: 6,
      },
    });

    const decoded = decodeRollLabel(encoded);
    expect(decoded.kind).toBe('ok');
    if (decoded.kind !== 'ok') return;

    expect(decoded.rollLabel).toBe('Bola de Fogo');
    expect(decoded.rollGroups).toEqual(groups);
    expect(decoded.characterName).toBe('Tark');
    expect(decoded.ability?.name).toBe('Bola de Fogo');
    expect(decoded.ability?.pmCost).toBe(6);
  });

  it('preserva a oferta de efeito ativo com os bônus intactos', () => {
    const bonuses = [
      {
        target: { type: 'Skill', name: 'Atletismo' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ];
    const encoded = encodeRollLabel('Inspiração', {
      rollGroups: [],
      ability: {
        kind: 'power',
        name: 'Inspiração',
        effectOffer: {
          powerKey: 'bardo:inspiracao',
          name: 'Inspiração',
          sourceLabel: 'Bardo · Inspiração',
          optionId: 'padrao',
          optionLabel: '+1d4',
          bonuses: bonuses as never,
          affectsAllies: true,
        },
      },
    });

    const decoded = decodeRollLabel(encoded);
    if (decoded.kind !== 'ok') throw new Error('esperava decode ok');
    expect(decoded.rollGroups).toEqual([]);
    expect(decoded.ability?.effectOffer?.bonuses).toEqual(bonuses);
    expect(decoded.ability?.effectOffer?.affectsAllies).toBe(true);
  });

  it('rolagem sem habilidade não ganha a chave (decoder antigo não muda de comportamento)', () => {
    const encoded = encodeRollLabel('Teste de Força', {
      rollGroups: groups,
      characterName: 'Tark',
    });
    expect(encoded).not.toContain('ability');

    const decoded = decodeRollLabel(encoded);
    if (decoded.kind !== 'ok') throw new Error('esperava decode ok');
    expect(decoded.ability).toBeUndefined();
  });
});

describe('teto de tamanho', () => {
  it('descarta a descrição antes de descartar a habilidade', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const encoded = encodeRollLabel('Poder Enorme', {
      rollGroups: groups,
      ability: {
        kind: 'power',
        name: 'Poder Enorme',
        description: 'x'.repeat(ENCODED_LABEL_MAX_LENGTH),
        sourceLabel: 'Poder de Classe',
      },
    });

    expect(encoded.length).toBeLessThanOrEqual(ENCODED_LABEL_MAX_LENGTH);
    const decoded = decodeRollLabel(encoded);
    if (decoded.kind !== 'ok') throw new Error('esperava decode ok');
    // Nome e origem sobrevivem; só a descrição cai.
    expect(decoded.ability?.name).toBe('Poder Enorme');
    expect(decoded.ability?.sourceLabel).toBe('Poder de Classe');
    expect(decoded.ability?.description).toBeUndefined();
    expect(decoded.rollGroups).toEqual(groups);
    expect(warn).not.toHaveBeenCalled();
  });

  it('descarta a habilidade inteira quando nem sem descrição cabe, mas nunca os grupos', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const encoded = encodeRollLabel('Poder', {
      rollGroups: groups,
      ability: {
        kind: 'power',
        name: 'n'.repeat(ENCODED_LABEL_MAX_LENGTH),
      },
    });

    const decoded = decodeRollLabel(encoded);
    if (decoded.kind !== 'ok') throw new Error('esperava decode ok');
    expect(decoded.ability).toBeUndefined();
    expect(decoded.rollGroups).toEqual(groups);
    expect(warn).toHaveBeenCalled();
  });
});

describe('compatibilidade com formatos antigos', () => {
  it('sem delimitador → kind none (cliente pré-envelope)', () => {
    expect(decodeRollLabel('Rolagem Rápida')).toEqual({ kind: 'none' });
  });

  it('JSON quebrado → kind invalid, preservando o rótulo limpo', () => {
    const decoded = decodeRollLabel(`Ataque${ROLL_GROUPS_DELIMITER}{quebrado`);
    expect(decoded).toEqual({ kind: 'invalid', rollLabel: 'Ataque' });
  });

  it('formato antigo (array direto de grupos) ainda decodifica', () => {
    const decoded = decodeRollLabel(
      `Ataque${ROLL_GROUPS_DELIMITER}${JSON.stringify(groups)}`
    );
    if (decoded.kind !== 'ok') throw new Error('esperava decode ok');
    expect(decoded.rollGroups).toEqual(groups);
    expect(decoded.characterName).toBeUndefined();
    expect(decoded.ability).toBeUndefined();
  });
});

/**
 * O `timestamp` é o que decide se a oferta de efeito ativo ainda está dentro
 * da janela de validade. O broadcast do backend não carregava o campo, então
 * TODA rolagem vinda de outro jogador chegava sem horário e a oferta era
 * descartada como antiga — o botão "Ativar na minha ficha" nunca aparecia.
 */
describe('normalizeDiceResultPayload', () => {
  const RECEIVED_AT = 1_700_000_000_000;

  const legacyPayload = (rollLabel: string): DiceRollPayload => ({
    tableId: 'mesa-1',
    playerId: 'jogador-1',
    playerName: 'Yuri',
    rollLabel,
    diceNotation: '1d20+5',
    rolls: [12],
    modifier: 5,
    total: 17,
    isCritical: false,
    isFumble: false,
  });

  it('carimba receivedAt quando o payload não traz timestamp', () => {
    const encoded = encodeRollLabel('Inspiração', {
      rollGroups: [],
      ability: { kind: 'power', name: 'Inspiração' },
    });

    const normalized = normalizeDiceResultPayload(
      legacyPayload(encoded),
      RECEIVED_AT
    );
    expect(normalized.timestamp).toBe(RECEIVED_AT);
  });

  it('preserva o timestamp quando o backend manda um', () => {
    const encoded = encodeRollLabel('Inspiração', { rollGroups: [] });
    const normalized = normalizeDiceResultPayload(
      { ...legacyPayload(encoded), timestamp: 42 },
      RECEIVED_AT
    );
    expect(normalized.timestamp).toBe(42);
  });

  it('mantém a oferta de efeito ativo do envelope intacta', () => {
    const encoded = encodeRollLabel('Inspiração', {
      rollGroups: [],
      characterName: 'Tark',
      ability: {
        kind: 'power',
        name: 'Inspiração',
        effectOffer: {
          powerKey: 'bardo:inspiracao',
          name: 'Inspiração',
          sourceLabel: 'Bardo · Inspiração',
          optionId: 'padrao',
          optionLabel: '+1d4',
          bonuses: [],
          affectsAllies: true,
        },
      },
    });

    const normalized = normalizeDiceResultPayload(
      legacyPayload(encoded),
      RECEIVED_AT
    );
    expect(normalized.rollLabel).toBe('Inspiração');
    expect(normalized.characterName).toBe('Tark');
    expect(normalized.ability?.effectOffer?.powerKey).toBe('bardo:inspiracao');
    expect(normalized.timestamp).toBe(RECEIVED_AT);
  });

  it('envelope quebrado cai nos campos legados e ainda ganha timestamp', () => {
    const normalized = normalizeDiceResultPayload(
      legacyPayload(`Ataque${ROLL_GROUPS_DELIMITER}{quebrado`),
      RECEIVED_AT
    );
    expect(normalized.rollLabel).toBe('Ataque');
    expect(normalized.rollGroups).toHaveLength(1);
    expect(normalized.rollGroups[0].total).toBe(17);
    expect(normalized.timestamp).toBe(RECEIVED_AT);
  });

  it('payload legado sem envelope vira um grupo único com timestamp', () => {
    const normalized = normalizeDiceResultPayload(
      legacyPayload('Rolagem Rápida'),
      RECEIVED_AT
    );
    expect(normalized.rollLabel).toBe('Rolagem Rápida');
    expect(normalized.rollGroups).toEqual([
      {
        label: 'Rolagem Rápida',
        diceNotation: '1d20+5',
        rolls: [12],
        modifier: 5,
        total: 17,
        isCritical: false,
        isFumble: false,
      },
    ]);
    expect(normalized.timestamp).toBe(RECEIVED_AT);
  });

  it('payload já estendido preserva os grupos e ganha timestamp', () => {
    const normalized = normalizeDiceResultPayload(
      {
        tableId: 'mesa-1',
        playerId: 'jogador-1',
        playerName: 'Yuri',
        rollLabel: 'Ataque',
        rollGroups: groups,
      },
      RECEIVED_AT
    );
    expect(normalized.rollGroups).toEqual(groups);
    expect(normalized.timestamp).toBe(RECEIVED_AT);
  });
});
