import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const SILFIDE: Race = {
  name: 'Sílfide',
  attributes: {
    attrs: [
      { attr: Atributo.CARISMA, mod: 4 },
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.FORCA, mod: -4 },
    ],
    texts: [
      'Seu tamanho é Minúsculo. Você pode pairar a 1,5m do chão com deslocamento 9m. Isso permite que você ignore terreno difícil e o torna imune a dano por queda (a menos que esteja inconsciente). Você pode gastar 1 PM por rodada para voar com deslocamento de 12m.',
      'Você é uma criatura do tipo espírito, recebe visão na penumbra e pode falar com animais livremente.',
      'Você pode lançar duas das magias a seguir (todas atributo- chave Carisma): Criar Ilusão, Enfeitiçar, Luz (como uma magia arcana) e Sono. Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM.',
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    ALLIHANNA: 1,
    HYNINN: 1,
    NIMB: 1,
    WYNNA: 1,
  },
  abilities: [
    {
      name: 'Asas de Borboleta',
      description:
        'Seu tamanho é Minúsculo. Você pode pairar a 1,5m do chão com deslocamento 9m. Isso permite que você ignore terreno difícil e o torna imune a dano por queda (a menos que esteja inconsciente). Você pode gastar 1 PM por rodada para voar com deslocamento de 12m.',
    },
    {
      name: 'Espírito da Natureza',
      description:
        'Você é uma criatura do tipo espírito, recebe visão na penumbra e pode falar com animais livremente.',
    },
    {
      name: 'Magia das Fadas',
      description:
        'Você pode lançar duas das magias a seguir (todas atributo- chave Carisma): Criar Ilusão, Enfeitiçar, Luz (como uma magia arcana) e Sono. Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM.',
    },
  ],
};

export default SILFIDE;
