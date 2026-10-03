import { describe, it, expect } from 'vitest';
import { entityFacts } from '../entitySummary';
import { getFullEncyclopediaIndex } from '../resolveItems';
import { prefixOf } from '../itemId';
import { dataRegistry } from '../../../data/registry';
import { SupplementId } from '../../../types/supplement.types';
import { encyclopediaIds } from '../../encyclopediaSearch';

const ALL = Object.values(SupplementId);
const labels = (id: string) => entityFacts(id).map((fact) => fact.label);

describe('entityFacts', () => {
  it('classe: PV, PM, perícias, proficiências e habilidades', () => {
    const arcanista = dataRegistry
      .getClassesWithSupplementInfo(ALL)
      .find((c) => c.name === 'Arcanista');
    if (!arcanista) throw new Error('Arcanista não encontrado');
    const facts = entityFacts(encyclopediaIds.class(arcanista));
    expect(facts.map((f) => f.label)).toEqual([
      'Pontos de vida',
      'Pontos de mana',
      'Perícias',
      'Proficiências',
      'Habilidades',
    ]);
    expect(facts[0].value).toContain(String(arcanista.pv));
    expect(facts[2].value).toMatch(/Misticismo/);
    expect(facts[4].value).toMatch(/1º/);
  });

  it('raça: atributos e habilidades', () => {
    expect(labels('race:Humano')).toContain('Atributos');
    expect(labels('race:Humano')).toContain('Habilidades');
  });

  it('raça com heranças lista as heranças', () => {
    expect(labels('race:Moreau')).toContain('Heranças');
  });

  it('atributos à escolha repetidos são agrupados', () => {
    const attrs = entityFacts('race:Moreau').find(
      (fact) => fact.label === 'Atributos'
    );
    expect(attrs?.value).toBe('+1 em três atributos à escolha');
  });

  it('id que não é entidade não tem fatos', () => {
    expect(entityFacts('spell:Bola de Fogo')).toEqual([]);
    expect(entityFacts('class:Classe Inexistente')).toEqual([]);
  });

  it('toda classe, raça, origem e divindade do índice tem ao menos um fato', () => {
    const empty = getFullEncyclopediaIndex()
      .filter((e) =>
        ['class', 'race', 'origin', 'deity'].includes(prefixOf(e.id))
      )
      .filter((e) => entityFacts(e.id).length === 0)
      .map((e) => e.id);
    expect(empty).toEqual([]);
  });
});
