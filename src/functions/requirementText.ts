import { Requirement, RequirementType } from '../interfaces/Poderes';

/**
 * Ponto único de formatação de pré-requisitos de poder.
 *
 * Antes disso o app tinha ~6 cópias quase idênticas desta lógica (tabelas do
 * banco de dados, drawer de poderes, wizard de nível, Alma Livre) e metade
 * delas ignorava a flag `not` — a Arma Sagrada do Paladino, que exige NÃO ser
 * devoto de Lena/Marah, aparecia exigindo exatamente o contrário.
 */

export interface FormatRequirementOptions {
  /**
   * Sufixo colado no requisito de nível. A Alma Livre conta o nível efetivo
   * como nível − 4 e explicita isso na UI.
   */
  levelSuffix?: string;
}

/** Texto do requisito ignorando a negação. */
function baseText(req: Requirement, options: FormatRequirementOptions): string {
  switch (req.type) {
    case RequirementType.ATRIBUTO:
      return `${req.name} ${req.value}`;
    case RequirementType.NIVEL:
      return `Nível ${req.value}${options.levelSuffix ?? ''}`;
    case RequirementType.PERICIA:
      return `Treinado em ${req.name}`;
    case RequirementType.PROFICIENCIA:
      return req.name === 'all'
        ? 'Proficiência em qualquer arma'
        : `Proficiência em ${req.name}`;
    case RequirementType.CLASSE:
      // O nome da classe fica em `name` nos dados (é o que o avaliador lê).
      return `Classe: ${req.name}`;
    case RequirementType.MAGIA:
      return `Magia: ${req.name}`;
    case RequirementType.RACA:
      return `Raça: ${req.name}`;
    case RequirementType.CHASSIS:
      return `Chassi: ${req.name}`;
    case RequirementType.HERANCA:
      return `Herança: ${req.name}`;
    case RequirementType.DEVOTO:
      if (!req.name) return 'Devoto de uma divindade';
      return req.name === 'any'
        ? 'Devoto de qualquer divindade'
        : `Devoto de ${req.name}`;
    case RequirementType.PODER_TORMENTA:
      return `Pelo menos ${req.value} ${
        (req.value || 0) > 1 ? 'poderes' : 'poder'
      } da Tormenta`;
    case RequirementType.TEXT:
      return req.text || '';
    default:
      return (req.name as string) || req.text || '';
  }
}

/** Frase natural para o requisito negado (`not: true`). */
function negatedText(req: Requirement, base: string): string {
  switch (req.type) {
    case RequirementType.DEVOTO:
      if (!req.name || req.name === 'any') return 'Não ser devoto';
      return `Não ser devoto de ${req.name}`;
    case RequirementType.PERICIA:
      return `Não ser treinado em ${req.name}`;
    case RequirementType.PROFICIENCIA:
      return req.name === 'all'
        ? 'Não ter proficiência em nenhuma arma'
        : `Não ter proficiência em ${req.name}`;
    case RequirementType.CLASSE:
    case RequirementType.RACA:
    case RequirementType.CHASSIS:
    case RequirementType.HERANCA:
    case RequirementType.ATRIBUTO:
    case RequirementType.NIVEL:
      return `Não: ${base}`;
    default:
      // PODER, HABILIDADE, MAGIA, TIPO_ARCANISTA, PODER_TORMENTA, TEXT...
      return `Não ter ${base}`;
  }
}

/** Texto de um único pré-requisito, já considerando negação (`not`). */
export function formatRequirement(
  req: Requirement,
  options: FormatRequirementOptions = {}
): string {
  const base = baseText(req, options);
  if (!base) return '';
  return req.not ? negatedText(req, base) : base;
}

interface FormatRequirementsOptions extends FormatRequirementOptions {
  /** Separador entre requisitos do mesmo grupo (E). Padrão: `' e '`. */
  andSeparator?: string;
  /** Texto usado quando não há nenhum pré-requisito. Padrão: `''`. */
  emptyText?: string;
}

/**
 * Texto completo dos pré-requisitos de um poder. Grupos são OU entre si;
 * requisitos dentro de um grupo são E.
 */
export function formatRequirements(
  requirements: Requirement[][] | undefined,
  options: FormatRequirementsOptions = {}
): string {
  const { andSeparator = ' e ', emptyText = '', levelSuffix } = options;

  const groups = (requirements ?? [])
    .map((group) =>
      group
        .map((req) => formatRequirement(req, { levelSuffix }))
        .filter((text) => text !== '')
        .join(andSeparator)
    )
    .filter((text) => text !== '');

  return groups.length > 0 ? groups.join(' OU ') : emptyText;
}
