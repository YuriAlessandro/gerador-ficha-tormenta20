import { Atributo } from '../data/atributos';
// eslint-disable-next-line
import CharacterSheet, { SubStep } from './CharacterSheet';

export enum GeneralPowerType {
  COMBATE = 'COMBATE',
  DESTINO = 'DESTINO',
  MAGIA = 'MAGIA',
  CONCEDIDOS = 'CONCEDIDOS',
  TORMENTA = 'TORMENTA',
}

export enum RequirementType {
  PODER = 'PODER',
  ATRIBUTO = 'ATRIBUTO',
  PERICIA = 'PERICIA',
  HABILIDADE = 'HABILIDADE',
  PODER_TORMENTA = 'PODER_TORMENTA',
  PROFICIENCIA = 'PROFICIENCIA',
  NIVEL = 'NIVEL',
  CLASSE = 'CLASSE',
  TIPO_ARCANISTA = 'TIPO_ARCANISTA',
  MAGIA = 'MAGIA',
  DEVOTO = 'DEVOTO',
}

export interface Requirement {
  type: RequirementType;
  name?: string | Atributo;
  value?: number;
  not?: boolean;
}

export interface GeneralPower {
  type: GeneralPowerType;
  description: string;
  name: string;
  requirements: Requirement[][];
  allowSeveralPicks?: boolean;
  action?: (
    sheet: CharacterSheet,
    subSteps: { name: string; value: string }[]
  ) => CharacterSheet;
}

export type GeneralPowers = {
  [key in GeneralPowerType]: GeneralPower[];
};

export interface OriginPower {
  name: string;
  description: string;
  type: string;
}

export type PowerGetter = (sheet: CharacterSheet, subSteps: SubStep[]) => void;

export type PowersGetters = Record<'Origem', PowerGetter[]>;

export type grantedPowers =
  | 'AFINIDADE_COM_A_TORMENTA'
  | 'ANFIBIO'
  | 'ARMAS_DA_AMBICAO'
  | 'ARSENAL_DAS_PROFUNDEZAS'
  | 'ASTUCIA_DA_SERPENTE'
  | 'ATAQUE_PIEDOSO'
  | 'AURA_DE_MEDO'
  | 'AURA_DA_PAZ'
  | 'AURA_RESTAURADORA'
  | 'BENCAO_DO_MANA'
  | 'CARICIA_SOMBRIA'
  | 'CENTELHA_MAGICA'
  | 'CONHECIMENTO_ENCICLOPEDICO'
  | 'CONJURAR_ARMA'
  | 'CORAGEM_TOTAL'
  | 'CURA_GENTIL'
  | 'CURANDEIRA_PERFEITA'
  | 'DEDO_VERDE'
  | 'DESCANSO_NATURAL'
  | 'DOM_DA_IMORTALIDADE'
  | 'DOM_DA_PROFECIA'
  | 'DOM_DA_RESSUREICAO'
  | 'DOM_DA_VERDADE'
  | 'ESCAMAS_DRACONICAS'
  | 'ESCUDO_MAGICO'
  | 'ESPADA_JUSTICEIRA'
  | 'ESPADA_SOLAR'
  | 'FARSA_DO_FINGIDOR'
  | 'FORMA_DE_MACACO'
  | 'FURIA_DIVINA'
  | 'GOLPISTA_DIVINO'
  | 'HABITANTE_DO_DESERTO'
  | 'INIMIGO_DE_TENEBRA'
  | 'KIAI_DIVINO'
  | 'LIBERDADE_DIVINA'
  | 'MANTO_DA_PENUMBRA'
  | 'MENTE_ANALITICA'
  | 'MENTE_VAZIA'
  | 'MESTRE_DOS_MARES'
  | 'OLHAR_AMEDRONTADOR'
  | 'PALAVRAS_DE_BONDADE'
  | 'PERCEPCAO_TEMPORAL'
  | 'PODER_OCULTO'
  | 'PRESAS_VENENOSAS'
  | 'REJEICAO_DIVINA'
  | 'SANGUE_DE_FERRO'
  | 'SANGUE_OFIDICO'
  | 'SERVOS_DO_DRAGAO'
  | 'SORTE_DOS_LOUCOS'
  | 'TALENTO_ARTISTICO'
  | 'TEURGISTA_MISTICO'
  | 'TRANSMISSAO_DA_LOUCURA'
  | 'TROPAS_DUYSHIDAKK'
  | 'URRO_DIVINO'
  | 'VISAO_NAS_TREVAS'
  | 'VOZ_DA_CIVILIZACAO'
  | 'VOZ_DA_NATUREZA'
  | 'VOZ_DOS_MONSTROS';
