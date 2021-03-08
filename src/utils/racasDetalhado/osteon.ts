import { generateRandomName } from '../../functions/utils';
import { Race } from '../../interfaces/CharacterSheet';

export interface Osteon extends Race {
  oldRace?: Race;
  sortOldRace: (allRaces: Race[]) => Race;
}

const OSTEON: Osteon = {
  name: 'Osteon',
  habilites: {
    attrs: [
      { attr: 'Constituição', mod: -2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
      { attr: 'any', mod: 2 },
    ],
    other: [],
    texts: [
      'Você recebe resistência a corte, frio e perfuração 5.',
      'Você se torna treinado em uma perícia (não precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, você pode ser um osteon de outra raça humanoide que não humano. Neste caso, você ganha uma habilidade dessa raça a sua escolha. Se a raça era de tamanho diferente de Médio, você também possui sua categoria de tamanho (NÃO INCLUSO, ESCOLHA O DESEJADO E ADICIONE MANUALMENTE NA SUA FICHA).',
      'Você é uma criatura do tipo morto-vivo. Recebe visão no escuro e imunidade a doenças, fadiga, sangramento, sono e venenos. Além disso, não precisa respirar, alimentar-se ou dormir. Por fim, habilidades mágicas de cura causam dano a você e você não se beneficia de itens ingeríveis (comidas, poções etc.), mas dano de trevas recupera seus PV.',
    ],
  },
  sortOldRace(allRaces) {
    const races = allRaces.filter(
      (raca) => raca.name !== 'Osteon' && raca.name !== 'Golem'
    );

    return races[Math.floor(Math.random() * races.length)];
  },
  getName(sex, allRaces) {
    if (this.oldRace) {
      return generateRandomName(this.oldRace, sex, allRaces);
    }

    this.oldRace = this.sortOldRace(allRaces);

    return generateRandomName(this.oldRace, sex, allRaces);
  },
  setup(allRaces: Race[]) {
    this.oldRace = this.sortOldRace(allRaces);
  },
};
export default OSTEON;
