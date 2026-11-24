import CharacterSheet from '../../interfaces/CharacterSheet';
import { ATTRIBUTE_KEYS } from '../enums';
import { foundryId, textToHtml } from '../normalize';
import { FoundryItem } from '../types';

/**
 * Item `race` só para ocupar o slot de raça da ficha do Foundry. Sem ele, o
 * cabeçalho mostra um link "Raça" que abre o compêndio, e a raça arrastada de
 * lá grava os modificadores em `atributos.*.racial` e recria os poderes
 * raciais — em cima de um `base` que já inclui a raça.
 *
 * Por isso tudo vai zerado e sem concessões: os atributos raciais já estão no
 * `base` e as habilidades da raça já saem como itens `poder`.
 */
export function buildRaceItem(sheet: CharacterSheet): FoundryItem[] {
  const name = sheet.raca?.name;
  if (!name) return [];

  return [
    {
      _id: foundryId(),
      name,
      type: 'race',
      effects: [],
      flags: {},
      system: {
        description: {
          value: textToHtml(
            'Os modificadores de atributo da raça já estão nos atributos do ' +
              'personagem, e as habilidades raciais estão na lista de poderes.'
          ),
          unidentified: '',
        },
        atributos: Object.fromEntries(
          Object.values(ATTRIBUTE_KEYS).map((attribute) => [attribute, 0])
        ),
        atributosDinamicos: { value: [] },
        grants: [],
        skills: [],
      },
    },
  ];
}
