import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';

const EIRADAAN: Race = {
  name: 'Eiradaan',
  attributes: {
    attrs: [
      { attr: Atributo.SABEDORIA, mod: 2 },
      { attr: Atributo.CARISMA, mod: 1 },
      { attr: Atributo.FORCA, mod: -1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    LENA: 1,
    THYATIS: 1,
    WYNNA: 1,
  },
  abilities: [
    {
      name: 'Essência Feérica',
      description:
        'Você é uma criatura do tipo espírito, recebe visão na penumbra e pode falar com animais livremente.',
    },
    {
      name: 'Magia Instintiva',
      description:
        'Você pode usar Sabedoria no lugar de seu atributo-chave de magias arcanas e Misticismo. Além disso, quando lança uma magia, você recebe +1 PM para gastar em seus aprimoramentos (não cumulativo com outros efeitos que fornecem PM para aprimoramentos, como bolsa de pó).',
    },
    {
      name: 'Sentidos Místicos',
      description:
        'Você está sempre sob o efeito básico da magia Visão Mística.',
    },
    {
      name: 'Canção da Melancolia',
      description:
        'Quando faz um teste de Vontade contra efeitos mentais, você rola dois dados e usa o pior resultado.',
    },
  ],
};

export default EIRADAAN;
