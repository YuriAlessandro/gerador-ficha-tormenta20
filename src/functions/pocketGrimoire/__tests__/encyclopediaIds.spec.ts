import { describe, it, expect } from 'vitest';
import { dataRegistry } from '../../../data/registry';
import { SupplementId } from '../../../types/supplement.types';
import { encyclopediaIds } from '../../encyclopediaSearch';
import { getGrimoireCatalog } from '../resolveItems';

const ALL = Object.values(SupplementId);

/**
 * As tabelas de Classes, Raças, Origens e Divindades montam o id do botão
 * "adicionar ao grimório" com `encyclopediaIds`. Para cada item que elas
 * exibem, o id precisa existir no índice E apontar para o texto daquele item
 * — um id repetido faria o grimório guardar o texto de outro item.
 */
describe('ids das tabelas da enciclopédia', () => {
  const { byId } = getGrimoireCatalog();
  const problems: string[] = [];
  const check = (id: string, text: string | undefined) => {
    const entry = byId.get(id);
    if (!entry) problems.push(`ausente: ${id}`);
    else if (entry.description !== (text || '')) {
      problems.push(`texto de outro item: ${id}`);
    }
  };

  it('raças e heranças', () => {
    problems.length = 0;
    dataRegistry.getRacesWithSupplementInfo(ALL).forEach((race) => {
      check(encyclopediaIds.race(race.name), '');
      (race.abilities || []).forEach((ability) =>
        check(
          encyclopediaIds.raceAbility(race.name, ability.name),
          ability.description
        )
      );
      Object.values(race.heritages || {}).forEach((heritage) =>
        (heritage.abilities || []).forEach((ability) =>
          check(
            encyclopediaIds.raceAbility(race.name, ability.name, heritage.name),
            ability.description
          )
        )
      );
    });
    expect(problems).toEqual([]);
  });

  it('classes, habilidades e poderes de classe', () => {
    problems.length = 0;
    dataRegistry.getClassesWithSupplementInfo(ALL).forEach((classe) => {
      check(encyclopediaIds.class(classe), '');
      (classe.abilities || []).forEach((ability) =>
        check(encyclopediaIds.classAbility(classe, ability.name), ability.text)
      );
      (classe.powers || []).forEach((power) =>
        check(
          encyclopediaIds.classPower(classe, power.name),
          power.dynamicText || power.text
        )
      );
    });
    expect(problems).toEqual([]);
  });

  it('origens e divindades', () => {
    problems.length = 0;
    dataRegistry.getOriginsBySupplements(ALL).forEach((origin) => {
      check(encyclopediaIds.origin(origin.name), '');
      (origin.poderes || []).forEach((power) =>
        check(
          encyclopediaIds.originPower(origin.name, power.name),
          power.description
        )
      );
    });
    dataRegistry.getDeitiesWithSupplementPowers(ALL).forEach((deity) => {
      check(encyclopediaIds.deity(deity.name), '');
      (deity.poderes || []).forEach((power) =>
        check(
          encyclopediaIds.deityPower(deity.name, power.name),
          power.description
        )
      );
    });
    expect(problems).toEqual([]);
  });
});
