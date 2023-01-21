import { getRandomItemFromArray } from '../functions/randomUtils';
import Race from '../interfaces/Race';
import RACAS from './races';

export const nomes: {
  [key: string]: Record<'Masculino' | 'Feminino', string[]>;
} = {
  Humano: {
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
      'Alon',
      'Dalax',
      'Kairus',
      'Malik',
      'Nereus',
      'Octopian',
      'Orin',
      'Tempestus',
    ],
    Feminino: [
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
    Masculino: [
      'Cecil',
      'Burble',
      'Flax',
      'Ginko',
      'Novus',
      'Olmo',
      'Pingo',
      'Rolyn',
    ],
    Feminino: [
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
    Masculino: [
      'Atszo',
      'Bhaz',
      'Crosk',
      'Drurg',
      'Glulg',
      'Orzok',
      'Qrux',
      'Truusz',
    ],
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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
    Masculino: [
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
    Feminino: [
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

const lefouSurnames: Record<'Masculino' | 'Feminino', string[]> = {
  Masculino: [
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
  Feminino: [
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
  (race: Race, sex: 'Masculino' | 'Feminino') => string
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
  Lefou: (race: Race, sex: 'Masculino' | 'Feminino') => {
    const firstName = getRandomItemFromArray(lefouNames);
    const lastName = getRandomItemFromArray(lefouSurnames[sex]);

    return `${firstName} ${lastName}`;
  },
  default: (race: Race, sex) => getRandomItemFromArray(nomes[race.name][sex]),
};

export function generateRandomName(
  race: Race,
  sexo: 'Masculino' | 'Feminino'
): string {
  if (nameGenerators[race.name]) {
    return nameGenerators[race.name](race, sexo);
  }

  return nameGenerators.default(race, sexo);
}
