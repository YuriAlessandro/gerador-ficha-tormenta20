import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const post = vi.fn((_url: string, _body: unknown) =>
  Promise.resolve({ data: {} })
);

vi.mock('../../services/api', () => ({
  default: { post: (url: string, body: unknown) => post(url, body) },
}));

// eslint-disable-next-line import/first
import {
  forwardPortraitRoll,
  setActivePortraitSheet,
  getActivePortraitSheetId,
  resetPortraitBridge,
} from '../portraitBridge';

interface PostBody {
  sheetId: string;
  roll: { label: string; at: number; groups: unknown[] };
}

const roll = (label: string) => ({
  rollLabel: label,
  characterName: 'Thorin',
  rollGroups: [
    {
      label,
      diceNotation: '1d20+7',
      rolls: [11],
      modifier: 7,
      total: 18,
    },
  ],
});

describe('portraitBridge', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    post.mockClear();
    resetPortraitBridge();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('não emite sem ficha ativa', () => {
    forwardPortraitRoll(roll('Ataque'));
    vi.runAllTimers();
    expect(post).not.toHaveBeenCalled();
  });

  it('emite para a ficha registrada', () => {
    setActivePortraitSheet('sheet-1');
    forwardPortraitRoll(roll('Ataque'));
    expect(post).toHaveBeenCalledTimes(1);
    const [url, body] = post.mock.calls[0];
    expect(url).toBe('/api/portrait/roll');
    expect(body).toMatchObject({ sheetId: 'sheet-1' });
  });

  it('para de emitir depois de limpar o registro', () => {
    setActivePortraitSheet('sheet-1');
    setActivePortraitSheet(null);
    expect(getActivePortraitSheetId()).toBeNull();
    forwardPortraitRoll(roll('Ataque'));
    vi.runAllTimers();
    expect(post).not.toHaveBeenCalled();
  });

  it('coalesce rolagens dentro da janela de throttle, mantendo a última', () => {
    // Ataque completo dispara publishRoll mais de uma vez em sequência (fase 1
    // e dados extras do crítico). O overlay tem que ver só o resultado final.
    setActivePortraitSheet('sheet-1');
    forwardPortraitRoll(roll('Ataque'));
    expect(post).toHaveBeenCalledTimes(1);

    forwardPortraitRoll(roll('Dano'));
    forwardPortraitRoll(roll('Dano extra do crítico'));
    expect(post).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200);
    expect(post).toHaveBeenCalledTimes(2);
    const [, body] = post.mock.calls[1];
    expect((body as PostBody).roll.label).toBe('Dano extra do crítico');
  });

  it('carimba `at` para o cliente descartar rolagem fora de ordem', () => {
    setActivePortraitSheet('sheet-1');
    forwardPortraitRoll(roll('Ataque'));
    const [, body] = post.mock.calls[0];
    expect(typeof (body as PostBody).roll.at).toBe('number');
  });

  it('engole falha de rede sem estourar unhandled rejection', () => {
    post.mockImplementationOnce(() => Promise.reject(new Error('403')));
    setActivePortraitSheet('sheet-1');
    expect(() => forwardPortraitRoll(roll('Ataque'))).not.toThrow();
  });

  it('sobrevive a payload sem rollGroups', () => {
    setActivePortraitSheet('sheet-1');
    forwardPortraitRoll({ rollLabel: undefined });
    const [, body] = post.mock.calls[0];
    expect((body as PostBody).roll.label).toBe('Rolagem');
    expect((body as PostBody).roll.groups).toEqual([]);
  });
});
