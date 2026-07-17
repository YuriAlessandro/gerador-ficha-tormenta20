import Equipment from '../../../../../interfaces/Equipment';

/**
 * Armas do suplemento Heróis de Arton - Tormenta 20
 */

// ==========================================
// ARMAS SIMPLES
// ==========================================

// Corpo a Corpo — Leves
const BASTAO_LUDICO: Equipment = {
  nome: 'Bastão lúdico',
  weaponCategory: 'simple',
  dano: '1d6',
  critico: 'x2',
  spaces: 1,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 5,
};

// Ataque à Distância — Uma Mão
const BESTA_DE_MAO: Equipment = {
  nome: 'Besta de mão',
  weaponCategory: 'simple',
  dano: '1d6',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: 'Curto',
  group: 'Arma',
  preco: 30,
  ammoType: 'Virotes',
};

const VIROTES_BESTA_MAO: Equipment = {
  nome: 'Virotes (20)',
  dano: '-',
  critico: '-',
  spaces: 1,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 2,
  isAmmo: true,
  ammoType: 'Virotes',
  ammoPackSize: 20,
};

// ==========================================
// ARMAS MARCIAIS
// ==========================================

// Corpo a Corpo — Leves
const ADAGA_OPOSTA: Equipment = {
  nome: 'Adaga oposta',
  weaponCategory: 'martial',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 12,
};

const AGULHA_DE_AHLEN: Equipment = {
  nome: 'Agulha de Ahlen',
  weaponCategory: 'martial',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 10,
};

const CINQUEDEA: Equipment = {
  nome: 'Cinquedea',
  weaponCategory: 'martial',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 18,
};

const DIRK: Equipment = {
  nome: 'Dirk',
  weaponCategory: 'martial',
  dano: '1d4',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 15,
};

const MARTELO_LEVE: Equipment = {
  nome: 'Martelo leve',
  weaponCategory: 'martial',
  weaponTags: ['heredrimm'],
  dano: '1d4',
  critico: 'x4',
  spaces: 1,
  tipo: 'Impacto',
  alcance: 'Curto',
  arremesso: true,
  group: 'Arma',
  preco: 2,
  specialActions: [
    { id: 'corpo-a-corpo', label: 'Corpo a corpo', skill: 'Luta' },
    {
      id: 'arremessar',
      label: 'Arremessar',
      skill: 'Pontaria',
      damageAttribute: 'Força',
    },
  ],
};

// Corpo a Corpo — Uma Mão
const ESPADA_LARGA: Equipment = {
  nome: 'Espada larga',
  weaponCategory: 'martial',
  dano: '2d4',
  critico: 'x2',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 8,
};

const ESPADIM: Equipment = {
  nome: 'Espadim',
  weaponCategory: 'martial',
  dano: '1d8',
  critico: '20',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 300,
};

const MACA_ESTRELA: Equipment = {
  nome: 'Maça-estrela',
  weaponCategory: 'martial',
  dano: '2d4',
  critico: 'x2',
  spaces: 1,
  tipo: 'Impacto e perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 20,
};

const SERRILHEIRA: Equipment = {
  nome: 'Serrilheira',
  weaponCategory: 'martial',
  dano: '1d6',
  critico: '19',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 25,
};

// Corpo a Corpo — Duas Mãos
const BICO_DE_CORVO: Equipment = {
  nome: 'Bico de corvo',
  weaponCategory: 'martial',
  weaponTags: ['heredrimm'],
  dano: '1d8',
  critico: 'x3',
  spaces: 2,
  tipo: 'Impacto/perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 15,
  twoHanded: true,
};

const DESMONTADOR: Equipment = {
  nome: 'Desmontador',
  weaponCategory: 'martial',
  dano: '-',
  critico: '-',
  spaces: 2,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 20,
  twoHanded: true,
};

const ESPADA_DE_EXECUCAO: Equipment = {
  nome: 'Espada de execução',
  weaponCategory: 'martial',
  dano: '2d6',
  critico: '18/x4',
  spaces: 2,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 75,
  twoHanded: true,
};

const LANCA_DE_JUSTA: Equipment = {
  nome: 'Lança de justa',
  weaponCategory: 'martial',
  dano: '1d8',
  critico: 'x2',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 3,
  twoHanded: true,
};

const MALHO: Equipment = {
  nome: 'Malho',
  weaponCategory: 'martial',
  weaponTags: ['heredrimm'],
  dano: '1d10',
  critico: 'x2',
  spaces: 2,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 8,
  twoHanded: true,
};

const MARTELO_LONGO: Equipment = {
  nome: 'Martelo longo',
  weaponCategory: 'martial',
  weaponTags: ['heredrimm'],
  dano: '2d4',
  critico: 'x4',
  spaces: 2,
  tipo: 'Impacto/perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 12,
  twoHanded: true,
};

const TAN_KORAK: Equipment = {
  nome: 'Tan-korak',
  weaponCategory: 'martial',
  dano: '1d8',
  critico: 'x2',
  spaces: 2,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 40,
  twoHanded: true,
};

// Ataque à Distância — Uma Mão
const TAI_TAI: Equipment = {
  nome: 'Tai-tai',
  weaponCategory: 'martial',
  dano: '2d4',
  critico: 'x2',
  spaces: 2,
  tipo: 'Impacto',
  alcance: 'Médio',
  group: 'Arma',
  preco: 60,
};

// Ataque à Distância — Duas Mãos
const ARCO_MONTADO: Equipment = {
  nome: 'Arco montado',
  weaponCategory: 'martial',
  dano: '1d6',
  critico: 'x3',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 45,
  twoHanded: true,
  ammoType: 'Flechas',
};

const FLECHAS: Equipment = {
  nome: 'Flechas (20)',
  dano: '-',
  critico: '-',
  spaces: 1,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 1,
  isAmmo: true,
  ammoType: 'Flechas',
  ammoPackSize: 20,
};

const BESTA_DUPLA: Equipment = {
  nome: 'Besta dupla',
  weaponCategory: 'martial',
  dano: '1d8',
  critico: '19',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 125,
  twoHanded: true,
  ammoType: 'Virotes',
};

const VIROTES: Equipment = {
  nome: 'Virotes (20)',
  dano: '-',
  critico: '-',
  spaces: 1,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 2,
  isAmmo: true,
  ammoType: 'Virotes',
  ammoPackSize: 20,
};

// ==========================================
// ARMAS EXÓTICAS
// ==========================================

// Corpo a Corpo — Leves
const KIMBATA: Equipment = {
  nome: 'Kimbata',
  weaponCategory: 'exotic',
  dano: '1d4',
  critico: '18',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 12,
};

// Corpo a Corpo — Uma Mão
const CLAVA_GRAO: Equipment = {
  nome: 'Clava-grão',
  weaponCategory: 'exotic',
  dano: '1d6',
  critico: 'x2',
  spaces: 1,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 90,
};

const ESPADA_CANORA: Equipment = {
  nome: 'Espada canora',
  weaponCategory: 'exotic',
  dano: '1d6',
  critico: '19',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 50,
};

const ESPADA_GADANHO: Equipment = {
  nome: 'Espada-gadanho',
  weaponCategory: 'exotic',
  dano: '1d6',
  critico: '18',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 40,
};

const KHOPESH: Equipment = {
  nome: 'Khopesh',
  weaponCategory: 'exotic',
  dano: '1d8',
  critico: '19/x3',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 20,
};

const LANCA_DE_FALANGE: Equipment = {
  nome: 'Lança de falange',
  weaponCategory: 'exotic',
  dano: '1d8',
  critico: 'x3',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: 'Curto',
  arremesso: true,
  group: 'Arma',
  preco: 15,
};

const MACHADO_DE_HASTE: Equipment = {
  nome: 'Machado de haste',
  weaponCategory: 'exotic',
  weaponTags: ['heredrimm'],
  dano: '1d8/1d10',
  critico: 'x3',
  spaces: 1,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 40,
};

const RAPIEIRA: Equipment = {
  nome: 'Rapieira',
  weaponCategory: 'exotic',
  dano: '1d8',
  critico: '18',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: '-',
  group: 'Arma',
  preco: 50,
};

// Corpo a Corpo — Duas Mãos
const MARRAO: Equipment = {
  nome: 'Marrão',
  weaponCategory: 'exotic',
  weaponTags: ['heredrimm'],
  dano: '4d4',
  critico: 'x2',
  spaces: 2,
  tipo: 'Impacto',
  alcance: '-',
  group: 'Arma',
  preco: 50,
  twoHanded: true,
};

const MONTANTE_CINETICO: Equipment = {
  nome: 'Montante cinético',
  weaponCategory: 'exotic',
  dano: '2d6',
  critico: '19/x4',
  spaces: 2,
  tipo: 'Corte',
  alcance: '-',
  group: 'Arma',
  preco: 3000,
  twoHanded: true,
};

// Ataque à Distância — Uma Mão
const BOLEADEIRA: Equipment = {
  nome: 'Boleadeira',
  weaponCategory: 'exotic',
  dano: '1d4',
  critico: 'x2',
  spaces: 1,
  tipo: 'Impacto',
  alcance: 'Curto',
  group: 'Arma',
  preco: 12,
};

const CHAKRAM: Equipment = {
  nome: 'Chakram',
  weaponCategory: 'exotic',
  dano: '1d6',
  critico: 'x3',
  spaces: 1,
  tipo: 'Corte',
  alcance: 'Curto',
  group: 'Arma',
  preco: 15,
};

// Ataque à Distância — Duas Mãos
const ARCO_DE_GUERRA: Equipment = {
  nome: 'Arco de guerra',
  weaponCategory: 'exotic',
  dano: '1d12',
  critico: 'x3',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 200,
  twoHanded: true,
  ammoType: 'Flechas',
  damageAttribute: 'Força',
};

const BALESTRA: Equipment = {
  nome: 'Balestra',
  weaponCategory: 'exotic',
  dano: '1d12',
  critico: '19',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 180,
  twoHanded: true,
  ammoType: 'Virotes',
  damageAttribute: 'Força',
};

const BESTA_DE_REPETICAO: Equipment = {
  nome: 'Besta de repetição',
  weaponCategory: 'exotic',
  dano: '1d8',
  critico: '19',
  spaces: 2,
  tipo: 'Perfuração',
  alcance: 'Médio',
  group: 'Arma',
  preco: 250,
  twoHanded: true,
  ammoType: 'Virotes',
};

// ==========================================
// ARMAS DE FOGO
// ==========================================

// Ataque à Distância — Leve
const GARRUCHA: Equipment = {
  nome: 'Garrucha',
  weaponCategory: 'firearm',
  dano: '2d4',
  critico: '19/x3',
  spaces: 1,
  tipo: 'Perfuração',
  alcance: 'Curto',
  group: 'Arma',
  preco: 250,
  ammoType: 'Balas',
};

const BALAS: Equipment = {
  nome: 'Balas (20)',
  dano: '-',
  critico: '-',
  spaces: 1,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 20,
  isAmmo: true,
  ammoType: 'Balas',
  ammoPackSize: 20,
};

// Ataque à Distância — Duas Mãos
const CANHAO_PORTATIL: Equipment = {
  nome: 'Canhão portátil',
  weaponCategory: 'firearm',
  dano: '4d10',
  critico: '19/x3',
  spaces: 2,
  tipo: 'Impacto',
  alcance: 'Curto',
  group: 'Arma',
  preco: 3000,
  twoHanded: true,
  ammoType: 'Bola de Ferro',
};

const BOLA_DE_FERRO: Equipment = {
  nome: 'Bola de ferro (1)',
  dano: '-',
  critico: '-',
  spaces: 0.5,
  tipo: '-',
  alcance: '-',
  group: 'Arma',
  preco: 5,
  isAmmo: true,
  ammoType: 'Bola de Ferro',
  ammoPackSize: 1,
  ammoUnitsPerSpace: 2,
};

const SIFAO_CAUSTICO: Equipment = {
  nome: 'Sifão cáustico',
  weaponCategory: 'firearm',
  dano: '4d6',
  critico: 'x2',
  spaces: 2,
  tipo: 'Ácido',
  alcance: 'Especial',
  group: 'Arma',
  preco: 600,
  twoHanded: true,
};

export const HEROIS_ARTON_WEAPONS: Record<string, Equipment> = {
  // Armas Simples
  BASTAO_LUDICO,
  BESTA_DE_MAO,
  VIROTES_BESTA_MAO,
  // Armas Marciais - Leves
  ADAGA_OPOSTA,
  AGULHA_DE_AHLEN,
  CINQUEDEA,
  DIRK,
  MARTELO_LEVE,
  // Armas Marciais - Uma Mão
  ESPADA_LARGA,
  ESPADIM,
  MACA_ESTRELA,
  SERRILHEIRA,
  // Armas Marciais - Duas Mãos
  BICO_DE_CORVO,
  DESMONTADOR,
  ESPADA_DE_EXECUCAO,
  LANCA_DE_JUSTA,
  MALHO,
  MARTELO_LONGO,
  TAN_KORAK,
  // Armas Marciais - Distância
  TAI_TAI,
  ARCO_MONTADO,
  FLECHAS,
  BESTA_DUPLA,
  VIROTES,
  // Armas Exóticas - Leves
  KIMBATA,
  // Armas Exóticas - Uma Mão
  CLAVA_GRAO,
  ESPADA_CANORA,
  ESPADA_GADANHO,
  KHOPESH,
  LANCA_DE_FALANGE,
  MACHADO_DE_HASTE,
  RAPIEIRA,
  // Armas Exóticas - Duas Mãos
  MARRAO,
  MONTANTE_CINETICO,
  // Armas Exóticas - Distância
  BOLEADEIRA,
  CHAKRAM,
  ARCO_DE_GUERRA,
  BALESTRA,
  BESTA_DE_REPETICAO,
  // Armas de Fogo
  GARRUCHA,
  BALAS,
  CANHAO_PORTATIL,
  BOLA_DE_FERRO,
  SIFAO_CAUSTICO,
};
