/**
 * Regressão do softlock da Magia Inata no assistente de evolução.
 *
 * O passo de truque do parceiro dispara DOIS callbacks no mesmo evento (a
 * magia e o truque com `choices.spell`, ou o truque e a limpeza da magia).
 * Enquanto o `upsert` do LevelUpWizardModal partia do estado capturado no
 * render, a segunda chamada desfazia a primeira: a magia nunca era gravada
 * (botão "Próximo" travado para sempre) e desmarcar o truque o ressuscitava.
 *
 * Estes testes reproduzem as sequências reais de callbacks sobre o helper puro.
 */
import { describe, it, expect } from 'vitest';
import { applyCompanionTrickPatch } from '../../components/LevelUpWizard/companionTrickSelection';
import { getInnateSpellOptions } from '../../data/systems/tormenta20/herois-de-arton/companion/innateSpells';
import { LevelUpSelections } from '../../interfaces/WizardSelections';

const base: LevelUpSelections = {
  level: 2,
  selectedClassName: 'Treinador',
  powerChoice: 'class',
};

const [magia, outraMagia] = getInnateSpellOptions();
const magiaInata = { name: 'Magia Inata' };
const outroTruque = { name: 'Amigo Feroz' };

const entryDe = (sel: LevelUpSelections, reason: 'auto' | 'power' = 'power') =>
  sel.companionTrickSelections?.find((e) => e.reason === reason);

describe('applyCompanionTrickPatch', () => {
  it('mantém a magia escolhida quando o truque chega logo depois (Magia Inata)', () => {
    // 1) marcar o truque
    let sel = applyCompanionTrickPatch(base, 'power', { trick: magiaInata }, 0);
    // 2) clicar na magia: onSelectSpell + onSelectTrick no mesmo evento
    sel = applyCompanionTrickPatch(sel, 'power', { spell: magia }, 0);
    sel = applyCompanionTrickPatch(
      sel,
      'power',
      { trick: { name: 'Magia Inata', choices: { spell: magia.nome } } },
      0
    );

    const entry = entryDe(sel);
    expect(entry?.spell?.nome).toBe(magia.nome);
    expect(entry?.trick.choices?.spell).toBe(magia.nome);
  });

  it('desmarcar o truque não o ressuscita', () => {
    let sel = applyCompanionTrickPatch(base, 'power', { trick: magiaInata }, 0);
    sel = applyCompanionTrickPatch(sel, 'power', { spell: magia }, 0);
    // handleToggleTrick: onSelectTrick(undefined) + onSelectSpell(undefined)
    sel = applyCompanionTrickPatch(sel, 'power', { trick: undefined }, 0);
    sel = applyCompanionTrickPatch(sel, 'power', { spell: undefined }, 0);

    expect(sel.companionTrickSelections).toBeUndefined();
  });

  it('trocar de truque não volta para o anterior', () => {
    let sel = applyCompanionTrickPatch(base, 'power', { trick: magiaInata }, 0);
    sel = applyCompanionTrickPatch(sel, 'power', { spell: magia }, 0);
    // clicar em outro truque: onSelectTrick(outro) + onSelectSpell(undefined)
    sel = applyCompanionTrickPatch(sel, 'power', { trick: outroTruque }, 0);
    sel = applyCompanionTrickPatch(sel, 'power', { spell: undefined }, 0);

    expect(entryDe(sel)?.trick.name).toBe(outroTruque.name);
    expect(entryDe(sel)?.spell).toBeUndefined();
  });

  it('desselecionar a magia limpa só a magia', () => {
    let sel = applyCompanionTrickPatch(base, 'power', { trick: magiaInata }, 0);
    sel = applyCompanionTrickPatch(sel, 'power', { spell: magia }, 0);
    // clicar na magia já selecionada: onSelectSpell(undefined) + onSelectTrick(sem choices)
    sel = applyCompanionTrickPatch(sel, 'power', { spell: undefined }, 0);
    sel = applyCompanionTrickPatch(sel, 'power', { trick: magiaInata }, 0);

    expect(entryDe(sel)?.trick.name).toBe('Magia Inata');
    expect(entryDe(sel)?.spell).toBeUndefined();
  });

  it('não recria a entry a partir de um patch solto de magia', () => {
    const sel = applyCompanionTrickPatch(base, 'power', { spell: magia }, 0);
    expect(sel).toBe(base);
  });

  it('não mexe na entry do outro passo do mesmo nível (auto × power)', () => {
    let sel = applyCompanionTrickPatch(base, 'auto', { trick: magiaInata }, 1);
    sel = applyCompanionTrickPatch(sel, 'auto', { spell: outraMagia }, 1);
    sel = applyCompanionTrickPatch(sel, 'power', { trick: outroTruque }, 0);

    expect(sel.companionTrickSelections).toHaveLength(2);
    expect(entryDe(sel, 'auto')?.spell?.nome).toBe(outraMagia.nome);
    expect(entryDe(sel, 'auto')?.companionIndex).toBe(1);
    expect(entryDe(sel, 'power')?.trick.name).toBe(outroTruque.name);
  });

  it('preserva o companheiro escolhido quando o patch não o traz', () => {
    let sel = applyCompanionTrickPatch(base, 'power', { trick: magiaInata }, 0);
    sel = applyCompanionTrickPatch(sel, 'power', { companionIndex: 1 }, 0);
    sel = applyCompanionTrickPatch(sel, 'power', { spell: magia }, 0);

    expect(entryDe(sel)?.companionIndex).toBe(1);
  });
});
