import CharacterSheet from '../../interfaces/CharacterSheet';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../../data/atributos';
import Anao from '../../data/races/anao';

export const inventor: CharacterSheet = {
  id: 'testid',
  maxWeight: 33,
  nome: 'Fulano',
  raca: Anao,
  sexo: 'Homem',
  steps: [],
  atributos: {
    Força: { name: Atributo.FORCA, value: 11, mod: 0 },
    Destreza: { name: Atributo.DESTREZA, value: 11, mod: 0 },
    Constituição: { name: Atributo.CONSTITUICAO, value: 13, mod: 1 },
    Inteligência: { name: Atributo.INTELIGENCIA, value: 14, mod: 2 },
    Sabedoria: { name: Atributo.SABEDORIA, value: 18, mod: 4 },
    Carisma: { name: Atributo.CARISMA, value: 16, mod: 3 },
  },
  bag: {
    equipments: {
      'Item Geral': [
        { nome: 'Mochila', group: 'Item Geral', peso: 1 },
        { nome: 'Saco de dormir', group: 'Item Geral', peso: 2.5 },
        { nome: 'Traje de viajante', group: 'Item Geral', peso: 2 },
      ],
      Alimentação: [],
      Alquimía: [],
      Animal: [],
      Arma: [
        {
          nome: 'Azagaia',
          dano: '1d6',
          critico: '2x',
          peso: 1,
          tipo: 'Perf.',
          alcance: 'Médio',
          group: 'Arma',
        },
      ],
      Armadura: [
        {
          nome: 'Couro batido',
          defenseBonus: 3,
          armorPenalty: 1,
          peso: 10,
          group: 'Armadura',
        },
      ],
      Escudo: [],
      Hospedagem: [],
      Serviço: [],
      Vestuário: [],
      Veículo: [],
    },
    weight: 16.5,
    armorPenalty: 1,
  },
  classe: {
    name: 'Inventor',
    pv: 12,
    addpv: 3,
    pm: 4,
    addpm: 4,
    periciasbasicas: [{ type: 'and', list: [Skill.OFICIO, Skill.VONTADE] }],
    periciasrestantes: {
      qtd: 4,
      list: [
        Skill.CONHECIMENTO,
        Skill.CURA,
        Skill.DIPLOMACIA,
        Skill.FORTITUDE,
        Skill.INICIATIVA,
        Skill.INVESTIGACAO,
        Skill.LUTA,
        Skill.MISTICISMO,
        Skill.OFICIO,
        Skill.PILOTAGEM,
        Skill.PONTARIA,
        Skill.PERCEPCAO,
      ],
    },
    proeficiencias: ['Armaduras Leves', 'Armas Simples'],
    abilities: [
      {
        name: 'Engenhosidade',
        text:
          'Quando faz um teste de perícia, você pode gastar 2 PM para receber um bônus igual ao seu modificador de Inteligência no teste. Você não pode usar esta habilidade em testes de ataque.',
        nivel: 1,
      },
      {
        name: 'Protótipo',
        text:
          'Você começa o jogo com um item superior com uma modificação ou 10 itens alquímicos, com preço total de até T$ 500. Veja o Capítulo 3: Equipamento para a lista de itens.',
        nivel: 1,
      },
    ],
    probDevoto: 0.3,
    faithProbability: {
      HYNINN: 1,
      NIMB: 1,
      SSZZAAS: 1,
      TANNATOH: 1,
      THYATIS: 1,
      VALKARIA: 1,
    },
  },
  defesa: 10,
  displacement: 9,
  nivel: 1,
  size: {
    modifiers: { maneuver: 0, stealth: 0 },
    naturalRange: 1.5,
    name: 'Médio',
  },
  origin: {
    name: 'Artista',
    powers: [
      {
        name: 'Dom artístico',
        description:
          'Quando usa a perícia Atuação para fazer uma apresentação e passa no teste, você ganha o dobro de tibares.',
        type: 'ORIGEM',
      },
    ],
  },
  skills: [
    Skill.OFICIO,
    Skill.VONTADE,
    Skill.ENGANACAO,
    Skill.PONTARIA,
    Skill.FORTITUDE,
    Skill.INICIATIVA,
    Skill.PILOTAGEM,
    Skill.PERCEPCAO,
    Skill.JOGATINA,
  ],
  spells: [],
  generalPowers: [],
  pv: 13,
  pm: 4,
};
