import GRANTED_POWERS from '../../data/systems/tormenta20/powers/grantedPowers';
import { createMockCharacterSheet } from '../../__mocks__/characterSheet';
import { normalizeSheet } from '../sheetNormalizer';
import CharacterSheet from '../../interfaces/CharacterSheet';

/**
 * O refresh de poderes concedidos sobrescreve `description` pelo catálogo. Ele
 * espalha `...p` ANTES de sobrescrever, então campos de nome diferente (os
 * overrides do usuário) sobrevivem — este teste tranca essa ordem.
 */
describe('normalizeSheet x overrides de exibição', () => {
  test('o refresh de poderes concedidos preserva customName/customDescription', () => {
    const granted = Object.values(GRANTED_POWERS)[0];

    const sheet = createMockCharacterSheet();
    sheet.devoto = {
      divindade: { name: 'Khalmyr', poderes: [] },
      poderes: [
        {
          ...granted,
          description: 'texto antigo salvo na ficha',
          customName: 'Meu Poder Concedido',
          customDescription: 'Ganhei do mestre no ritual do capítulo 3.',
        },
      ],
    } as unknown as CharacterSheet['devoto'];

    normalizeSheet(sheet);
    const power = sheet.devoto!.poderes[0];

    // A descrição do livro foi refrescada...
    expect(power.description).toBe(granted.description);
    // ...mas o que o usuário escreveu continua lá.
    expect(power.customName).toBe('Meu Poder Concedido');
    expect(power.customDescription).toBe(
      'Ganhei do mestre no ritual do capítulo 3.'
    );
  });
});
