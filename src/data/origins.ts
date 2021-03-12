import Origin from '../interfaces/Origin';
import PERICIAS from './pericias';
import originPowers from './powers/originPowers';
import { DestinyPowers } from './powers/destinyPowers';

export type origin =
  | 'Acólito'
  | 'Amigo dos Animais'
  | 'Amnésico'
  | 'Aristocrata'
  | 'Artesão'
  | 'Artista'
  | 'Assistente de Laboratório'
  | 'Batedor'
  | 'Capanga'
  | 'Charlatão'
  | 'Circense'
  | 'Criminoso'
  | 'Curandeiro'
  | 'Eremita'
  | 'Escravo'
  | 'Estudioso'
  | 'Fazendeiro'
  | 'Forasteiro'
  | 'Gladiador'
  | 'Guarda'
  | 'Herdeiro'
  | 'Herói Camponês'
  | 'Marujo'
  | 'Mateiro'
  | 'Membro de Guilda'
  | 'Mercador'
  | 'Minerador'
  | 'Nômade'
  | 'Pivete'
  | 'Refugiado'
  | 'Seguidor'
  | 'Selvagem'
  | 'Soldado'
  | 'Taverneiro'
  | 'Trabalhador';

const origins: Record<origin, Origin> = {
  Acólito: {
    name: 'Acólito',
    itens: [],
    pericias: [PERICIAS.CURA, PERICIAS.RELIGIAO, PERICIAS.VONTADE],
    poderes: [originPowers.MEMBRO_DA_IGREJA], // TODO: Adicionar Medicina, Vontade de Ferro
  },
  'Amigo dos Animais': {
    name: 'Amigo dos Animais',
    itens: [],
    pericias: [PERICIAS.ADESTRAMENTO, PERICIAS.CAVALGAR],
    poderes: [originPowers.AMIGO_ESPECIAL],
  },
  Amnésico: {
    name: 'Amnésico',
    itens: [],
    pericias: [],
    poderes: [originPowers.LEMBRANCAS_GRADUAIS],
  },
  Aristocrata: {
    name: 'Aristocrata',
    itens: [],
    pericias: [PERICIAS.DIPLOMACIA, PERICIAS.ENGANACAO, PERICIAS.NOBREZA],
    poderes: [originPowers.SANGUE_AZUL],
  },
  Artesão: {
    name: 'Artesão',
    itens: [],
    pericias: [PERICIAS.OFICIO, PERICIAS.VONTADE],
    poderes: [originPowers.FRUDOS_DO_TRABALHO],
  },
  Artista: {
    name: 'Artista',
    itens: [],
    pericias: [PERICIAS.ATUACAO, PERICIAS.ENGANACAO],
    poderes: [originPowers.DOM_ARTISTICO],
  },
  'Assistente de Laboratório': {
    name: 'Assistente de Laboratório',
    itens: [],
    pericias: [PERICIAS.OFICIO],
    poderes: [originPowers.ESSE_CHEIRO],
  },
  Batedor: {
    name: 'Batedor',
    itens: [],
    pericias: [PERICIAS.PERCEPCAO, PERICIAS.SOBREVIVENCIA],
    poderes: [originPowers.PROVA_DE_TUDO],
  },
  Capanga: {
    name: 'Capanga',
    itens: [],
    pericias: [PERICIAS.LUTA, PERICIAS.INTIMIDACAO],
    poderes: [originPowers.CONFISSAO],
  },
  Charlatão: {
    name: 'Charlatão',
    itens: [],
    pericias: [PERICIAS.ENGANACAO, PERICIAS.JOGATINA],
    poderes: [
      originPowers.ALPINISTA_SOCIAL,
      DestinyPowers.APARENCIA_INOFENSIVA,
      DestinyPowers.SORTUDO,
    ],
  },
  Circense: {
    name: 'Circense',
    itens: [],
    pericias: [PERICIAS.ACROBACIA, PERICIAS.ATUACAO, PERICIAS.REFLEXOS],
    poderes: [originPowers.TRUQUE_DE_MAGICA],
  },
  Criminoso: {
    name: 'Criminoso',
    itens: [],
    pericias: [PERICIAS.ENGANACAO, PERICIAS.FURTIVIDADE, PERICIAS.LADINAGEM],
    poderes: [originPowers.PUNGUISTA], // TODO: Adicionar Venefício
  },
  Curandeiro: {
    name: 'Curandeiro',
    itens: [],
    pericias: [PERICIAS.CURA, PERICIAS.VONTADE],
    poderes: [originPowers.MEDICO_DE_CAMPO], // TODO: Adicionar Medicina e Venfício
  },
  Eremita: {
    name: 'Eremita',
    itens: [],
    pericias: [PERICIAS.MISTICISMO, PERICIAS.RELIGIAO, PERICIAS.SOBREVIVENCIA],
    poderes: [originPowers.BUSCA_INTERIOR], // TODO: Adicionar Lobo Solitário
  },
  Escravo: {
    name: 'Escravo',
    itens: [],
    pericias: [PERICIAS.ATLETISMO, PERICIAS.FORTITUDE, PERICIAS.FURTIVIDADE],
    poderes: [originPowers.DESEJO_DE_LIBERDADE], // TODO: Adicionar Vitalidade
  },
  Estudioso: {
    name: 'Estudioso',
    itens: [],
    pericias: [PERICIAS.CONHECIMENTO, PERICIAS.GUERRA, PERICIAS.MISTICISMO],
    poderes: [
      originPowers.PALPITE_FUNDAMENTADO,
      DestinyPowers.APARENCIA_INOFENSIVA,
    ],
  },
  Fazendeiro: {
    name: 'Fazendeiro',
    itens: [],
    pericias: [PERICIAS.ADESTRAMENTO, PERICIAS.CAVALGAR, PERICIAS.OFICIO],
    poderes: [originPowers.AGUA_NO_FEIJAO],
  },
  Forasteiro: {
    name: 'Forasteiro',
    itens: [],
    pericias: [PERICIAS.CAVALGAR, PERICIAS.PILOTAGEM, PERICIAS.SOBREVIVENCIA],
    poderes: [originPowers.CULTURA_EXOTICA], // TODO: Adicionar Lobo Solitário
  },
  Gladiador: {
    name: 'Gladiador',
    itens: [],
    pericias: [PERICIAS.ATUACAO, PERICIAS.LUTA],
    poderes: [originPowers.PAO_E_CIRCO], // TODO: Adicionar Atraente, Torcida e um poder de combate Random
  },
  Guarda: {
    name: 'Guarda',
    itens: [],
    pericias: [PERICIAS.INVESTIGACAO, PERICIAS.LUTA, PERICIAS.PERCEPCAO],
    poderes: [originPowers.DETETIVE], // TODO: Adicionar Investigador e um poder de combate random
  },
  Herdeiro: {
    name: 'Herdeiro',
    itens: [],
    pericias: [PERICIAS.MISTICISMO, PERICIAS.NOBREZA, PERICIAS.OFICIO],
    poderes: [originPowers.HERANCA, originPowers.HERANCA], // TODO: Adicionar Comandar
  },
  'Herói Camponês': {
    name: 'Herói Camponês',
    itens: [],
    pericias: [PERICIAS.ADESTRAMENTO, PERICIAS.OFICIO],
    poderes: [originPowers.AMIGO_DOS_PLEBEUS], // TODO: Adicionar Sortudo, Surto Heróico, Torcida
  },
  Marujo: {
    name: 'Marujo',
    itens: [],
    pericias: [PERICIAS.ATLETISMO, PERICIAS.JOGATINA, PERICIAS.PILOTAGEM],
    poderes: [originPowers.PASSAGEM_DE_NAVIO], // TODO: Adicionar Acróbatico
  },
  Mateiro: {
    name: 'Mateiro',
    itens: [],
    pericias: [
      PERICIAS.ATLETISMO,
      PERICIAS.FURTIVIDADE,
      PERICIAS.SOBREVIVENCIA,
    ],
    poderes: [originPowers.VENDEDOR_DE_CARCACAS], // TODO: Adicionar Lobo Solitário, Sentidos Aguçados
  },
  'Membro de Guilda': {
    name: 'Membro de Guilda',
    itens: [],
    pericias: [
      PERICIAS.DIPLOMACIA,
      PERICIAS.ENGANACAO,
      PERICIAS.MISTICISMO,
      PERICIAS.OFICIO,
    ],
    poderes: [originPowers.REDE_DE_CONTATOS], // TODO: Adicionar Foco em Perícia
  },
  Mercador: {
    name: 'Mercador',
    itens: [],
    pericias: [PERICIAS.DIPLOMACIA, PERICIAS.INTUICAO, PERICIAS.OFICIO],
    poderes: [originPowers.NEGOCIACAO], // TODO: PROFICIENCIA, SORTUDO
  },
  Minerador: {
    name: 'Minerador',
    itens: [],
    pericias: [PERICIAS.ATLETISMO, PERICIAS.FORTITUDE, PERICIAS.OFICIO],
    poderes: [originPowers.ESCAVADOR], // TODO: Ataque Poderoso, Sentidos Aguçados
  },
  Nômade: {
    name: 'Nômade',
    itens: [],
    pericias: [PERICIAS.CAVALGAR, PERICIAS.PILOTAGEM, PERICIAS.SOBREVIVENCIA],
    poderes: [originPowers.MOCHILEIRO], // Todo: Sentidos Aguçados
  },
  Pivete: {
    name: 'Pivete',
    itens: [],
    pericias: [PERICIAS.FURTIVIDADE, PERICIAS.INICIATIVA, PERICIAS.LADINAGEM],
    poderes: [originPowers.QUEBRA_GALHO, DestinyPowers.APARENCIA_INOFENSIVA], // TODO: Adicionar Acrobático
  },
  Refugiado: {
    name: 'Refugiado',
    itens: [],
    pericias: [PERICIAS.FORTITUDE, PERICIAS.REFLEXOS, PERICIAS.VONTADE],
    poderes: [originPowers.ESTOICO], // TODO: Vontade de Ferro
  },
  Seguidor: {
    name: 'Seguidor',
    itens: [],
    pericias: [PERICIAS.ADESTRAMENTO, PERICIAS.OFICIO],
    poderes: [originPowers.ANTIGO_MESTRE], // TODO: Proficiencia, Surto Heróico
  },
  Selvagem: {
    name: 'Selvagem',
    itens: [],
    pericias: [PERICIAS.PERCEPCAO, PERICIAS.REFLEXOS, PERICIAS.SOBREVIVENCIA],
    poderes: [originPowers.VIDA_RUSTICA], // TODO: Lobo solitário, Vitalidade
  },
  Soldado: {
    name: 'Soldado',
    itens: [],
    pericias: [
      PERICIAS.FORTITUDE,
      PERICIAS.GUERRA,
      PERICIAS.LUTA,
      PERICIAS.PONTARIA,
    ],
    poderes: [originPowers.INFLUENCIA_MILITAR], // TODO: Um poder de combate random
  },
  Taverneiro: {
    name: 'Taverneiro',
    itens: [],
    pericias: [PERICIAS.DIPLOMACIA, PERICIAS.JOGATINA, PERICIAS.OFICIO],
    poderes: [originPowers.GOROROBA], // TODO: Proficiência, Vitalidade
  },
  Trabalhador: {
    name: 'Trabalhador',
    itens: [],
    pericias: [PERICIAS.ATLETISMO, PERICIAS.FORTITUDE],
    poderes: [originPowers.ESFORCADO], // TODO: Atlético
  },
};

export default origins;
