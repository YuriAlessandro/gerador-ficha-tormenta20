import { getRandomItemFromArray } from '../functions/randomUtils';
import Race from '../interfaces/Race';

export const nomes: {
  [key: string]: Record<'Homem' | 'Mulher', string[]>;
} = {
  Humano: {
    Homem: [
      'Aldor',
      'Aran',
      'Beren',
      'Cyriac',
      'Darik',
      'Dravor',
      'Drystan',
      'Eldred',
      'Ghart',
      'Gryffen',
      'Evass',
    ],
    Mulher: [
      'Alysia',
      'Avelin',
      'Catryn',
      'Darna',
      'Elenya',
      'Emeria',
      'Glenda',
      'Gylda',
      'Isolda',
      'Noita',
    ],
  },
  Anão: {
    Homem: [
      'Arduramm',
      'Bartarinn',
      'Doragramm',
      'Dastoroc',
      'Hardrumm',
      'Guldaramm',
      'Hortroc',
      'Kradug',
      'Khovarinn',
      'Thardaramm',
    ],
    Mulher: [
      'Atrudda',
      'Burgala',
      'Dorotha',
      'Durdala',
      'Gadrina',
      'Ragardda',
      'Thratilga',
      'Thorkala',
      'Thundrila',
      'Undresia',
    ],
  },
  Dahllan: {
    Homem: [
      'Asterius',
      'Aulus',
      'Caelus',
      'Glabus',
      'Jartus',
      'Kargan',
      'Orgun',
      'Tiberius',
      'Tyraxus',
      'Vobius',
    ],
    Mulher: [
      'Aster',
      'Azalia',
      'Celandine',
      'Dhala',
      'Galya',
      'Lhyria',
      'Lura',
      'Tulipa',
      'Tyka',
      'Violeta',
    ],
  },
  Elfo: {
    Homem: [
      'Avoldar',
      'Ellandor',
      'Felarin',
      'Glorandal',
      'Farandhil',
      'Kirrion',
      'Lurienthel',
      'Myrthallar',
      'Thassarion',
      'Zharian',
    ],
    Mulher: [
      'Allora',
      'Auruel',
      'Calaena',
      'Eloen',
      'Faunalyn',
      'Kethryllia',
      'Laurena',
      'Merethy',
      'Thassalya',
      'Yathanallia',
    ],
  },
  Goblin: {
    Homem: [
      'Ark',
      'Barg',
      'Buduc',
      'Crag',
      'Krig',
      'Rasg',
      'Tabo',
      'Ulerc',
      'Vrix',
      'Vrug',
    ],
    Mulher: [
      'Ashi',
      'Floba',
      'Grin',
      'Iga',
      'Mikhi',
      'Prixa',
      'Pylda',
      'Shug',
      'Sizz',
      'Vruga',
    ],
  },
  Minotauro: {
    Homem: [
      'Moufen',
      'Emsia Bravestriker',
      'Faster',
      'Moufen',
      'Emsia',
      'Erana',
      'Iassia',
      'Hirgiran',
      'Tirmaruk',
      'Brangajan',
      'Zamfuran',
      'Djundrin',
    ],
    Mulher: [
      'Winafa',
      'Hilaken',
      'Viafen',
      'Erazara',
      'Oenkane',
      'Muuvin',
      'Seora',
      'Laankane',
      'Raasnas',
      'Aneris',
    ],
  },
  Qareen: {
    Homem: [
      'Ahad',
      'Barakat',
      'Dawud',
      'Hossam',
      'Jaffah',
      'Kirud',
      'Nizur',
      'Sulid',
      'Tariq',
      'Wassim',
    ],
    Mulher: [
      'Aliyah',
      'Batuhla',
      'Hanifa',
      'Jahira',
      'Lalyla',
      'Mhyla',
      'Nirad',
      'Safirah',
      'Sahla',
      'Zakiya',
    ],
  },
  Golem: {
    Homem: ['Golenzin'],
    Mulher: ['Gola'],
  },
  Hynne: {
    Homem: [
      'Frodo',
      'Arno',
      'Flippo',
      'Gleppin',
      'Guido',
      'Haldo',
      'Meric',
      'Pippo',
      'Saruc',
    ],
    Mulher: [
      'Arabella',
      'Ghyla',
      'Joly',
      'Lili',
      'Lobelia',
      'Malva',
      'Prinna',
      'Nyra',
    ],
  },
  Kliren: {
    Homem: ['Kliren'],
    Mulher: ['Klirena'],
  },
  Medusa: {
    Homem: ['Meduso'],
    Mulher: ['Medusa'],
  },
  Sereia: {
    Homem: [
      'Alon',
      'Dalax',
      'Kairus',
      'Malik',
      'Nereus',
      'Octopian',
      'Orin',
      'Tempestus',
    ],
    Mulher: [
      'Alda',
      'Darya',
      'Layna',
      'Meri',
      'Murgen',
      'Nerissa',
      'Onna',
      'Sedna',
    ],
  },
  Sílfide: {
    Homem: [
      'Cecil',
      'Burble',
      'Flax',
      'Ginko',
      'Novus',
      'Olmo',
      'Pingo',
      'Rolyn',
    ],
    Mulher: [
      'Céu',
      'Bedra',
      'Flama',
      'Gerânia',
      'Liri',
      'Luriel',
      'Marly',
      'Pétala',
    ],
  },
  Trog: {
    Homem: [
      'Atszo',
      'Bhaz',
      'Crosk',
      'Drurg',
      'Glulg',
      'Orzok',
      'Qrux',
      'Truusz',
    ],
    Mulher: [
      'Arxsa',
      'Bakzha',
      'Chask',
      'Darsza',
      'Shuruh',
      'Thuji',
      'Urla',
      'Jacha',
    ],
  },
  'Suraggel (Aggelus)': {
    Homem: ['Aggelus'],
    Mulher: ['Aggelas'],
  },
  'Suraggel (Sulfure)': {
    Homem: ['Sulfeto'],
    Mulher: ['Sulfata'],
  },
};

const lefouNames = [
  'Alma',
  'Eco',
  'Estrela',
  'Fulgor',
  'Furacão',
  'Sol',
  'Tempestade',
  'Tremor',
  'Uivo',
  'Zênite',
];

const lefouSurnames: Record<'Homem' | 'Mulher', string[]> = {
  Homem: [
    'Afiado',
    'Cadavérico',
    'da Perdição',
    'do Ocaso',
    'Eterno',
    'Herege',
    'Imortal',
    'Maldito',
    'Rubro',
    'Serrilhado',
  ],
  Mulher: [
    'Afiada',
    'Cadavérica',
    'da Perdição',
    'do Ocaso',
    'Eterna',
    'Herege',
    'Imortal',
    'Maldita',
    'Rubra',
    'Serrilhada',
  ],
};

export const lefou = {
  names: lefouNames,
  surnames: lefouSurnames,
};

export const nameGenerators: Record<
  string,
  (raceName: string, sex: 'Homem' | 'Mulher') => string
> = {
  Osteon: (raceName, sex) => {
    const allRaces = [...Object.keys(nomes), 'Lefou'];
    const validRaces = allRaces.filter((race) => race !== 'Golem');
    const randomRace = getRandomItemFromArray(validRaces);

    if (nameGenerators[randomRace]) {
      return nameGenerators[randomRace](randomRace, sex);
    }

    return nameGenerators.default(randomRace, sex);
  },
  Lefou: (raceName, sex) => {
    const firstName = getRandomItemFromArray(lefouNames);
    const lastName = getRandomItemFromArray(lefouSurnames[sex]);

    return `${firstName} ${lastName}`;
  },
  default: (raceName, sex) => getRandomItemFromArray(nomes[raceName][sex]),
};

export function generateRandomName(
  raca: Race,
  sexo: 'Homem' | 'Mulher'
): string {
  if (nameGenerators[raca.name]) {
    return nameGenerators[raca.name](raca.name, sexo);
  }

  return nameGenerators.default(raca.name, sexo);
}
