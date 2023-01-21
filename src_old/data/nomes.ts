import { getRandomItemFromArray } from '../functions/randomUtils';
import Race from '../interfaces/Race';
import RACAS from './racas';

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
    Homem: [
      'Bozgo',
      'Gron',
      'Dhogglac',
      'Grann',
      'Bhamm',
      'Azahar',
      'Yislior',
      'Avi',
      'Machem',
      'Ayim',
      'Rher',
      'Grohn',
      'Bomm',
      'Vozlon',
      'Gragna',
      'Jalior',
      'Hilnah',
      'Zomar',
      'Nachin',
      'Levi',
    ],
    Mulher: [
      'Rerbod',
      'Drulahk',
      'Kheflahn',
      'Vor',
      'Lihar',
      'Olad',
      'Agam',
      'Amichem',
      'Omi',
      'Dhuc',
      'Buc',
      'Gerbahm',
      'Bhulgramm',
      'Ron',
      'Pinlior',
      'Gedam',
      'Abradeon',
      'Lelan',
      'Shitai',
    ],
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
    Homem: [
      'Yosston',
      'Gatix',
      'Horpos',
      'Jorzu',
      'Kelhim',
      'Ariryn',
      'Xaltix',
      'Briver',
      'Wreryn',
      'Corbar',
    ],
    Mulher: [
      'Xyrolin',
      'Banqaryn',
      'Tafyx',
      'Klotina',
      'Doceli',
      'Lorissa',
      'Rosibys',
      'Grenbi',
      'Jelsany',
      'Lilqys ',
    ],
  },
  Medusa: {
    Homem: [
      'Chrenthanes',
      'Phametus',
      'Chivos',
      'Koxetus',
      'Kodaestus',
      'Pheiariton',
      'Zothoteus',
      'Mistoeis',
      'Ruses',
      'Xulcon',
    ],
    Mulher: [
      'Chrula',
      'Thyada',
      'Huro',
      'Vokte',
      'Nuspa',
      'Kaerlixe',
      'Vyscaezo',
      'Xeulceno',
      'Vadaeva',
      'Chrumyldo',
    ],
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
    Homem: [
      'Qaspiel',
      'Charoum',
      'Ongkanon',
      'Gagallim',
      'Harahel',
      'Aarin',
      'Sarandiel',
      'Onoel',
      'Bariel',
      'Hadraniel',
    ],
    Mulher: [
      'Gadiel',
      'Amnayel',
      'Gadreel',
      'Theliel',
      'Mastema',
      'Umabel',
      'Mattia',
      'Hael',
      'Naomi',
      'Felice',
    ],
  },
  'Suraggel (Sulfure)': {
    Homem: [
      'Drongrorath',
      'Barnezuun',
      'Sugdreketh',
      'Sugdreketh',
      'Ellmen',
      "Jel'ginoth",
      'Gurkimog',
      'Tristramoth',
      'Rorzonoz',
      'Thegmazag',
      "Rar'giloz",
      'Tholmorath',
      'Ozgamak',
      'Trarromar',
      'Ogdruun',
      'Tronedoz',
      'Gikemod',
      'Sannomor',
      'Ired',
      'Gogmemar',
    ],
    Mulher: [
      'Drongrorath',
      'Barnezuun',
      'Sugdreketh',
      'Sugdreketh',
      'Ellmen',
      "Jel'ginoth",
      'Gurkimog',
      'Tristramoth',
      'Rorzonoz',
      'Thegmazag',
      "Rar'giloz",
      'Tholmorath',
      'Ozgamak',
      'Trarromar',
      'Ogdruun',
      'Tronedoz',
      'Gikemod',
      'Sannomor',
      'Ired',
      'Gogmemar',
    ],
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
  (race: Race, sex: 'Homem' | 'Mulher') => string
> = {
  Osteon: (race, sex) => {
    if (race.oldRace) {
      if (nameGenerators[race.oldRace.name]) {
        return nameGenerators[race.oldRace.name](race.oldRace, sex);
      }

      return nameGenerators.default(race.oldRace, sex);
    }

    const allRaces = [...Object.keys(nomes), 'Lefou'];
    const validRaces = allRaces.filter((element) => element !== 'Golem');
    const randomRaceName = getRandomItemFromArray(validRaces);
    const randomRace = RACAS.find(
      (element) => element.name === randomRaceName
    ) as Race;

    if (nameGenerators[randomRaceName]) {
      return nameGenerators[randomRaceName](randomRace, sex);
    }

    return nameGenerators.default(randomRace, sex);
  },
  Lefou: (race: Race, sex: 'Homem' | 'Mulher') => {
    const firstName = getRandomItemFromArray(lefouNames);
    const lastName = getRandomItemFromArray(lefouSurnames[sex]);

    return `${firstName} ${lastName}`;
  },
  default: (race: Race, sex) => getRandomItemFromArray(nomes[race.name][sex]),
};

export function generateRandomName(
  race: Race,
  sexo: 'Homem' | 'Mulher'
): string {
  if (nameGenerators[race.name]) {
    return nameGenerators[race.name](race, sexo);
  }

  return nameGenerators.default(race, sexo);
}
