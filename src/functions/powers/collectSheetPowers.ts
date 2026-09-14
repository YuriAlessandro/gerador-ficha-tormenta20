import CharacterSheet from '@/interfaces/CharacterSheet';
import { applyPowersOrder } from './applyPowersOrder';
import { getAutoridadeEclesiasticaDynamicText } from './frade-special';
import { PowerSourceArrays, SheetPower } from './powerOrigins';

/**
 * Montagem canônica da lista de poderes de uma ficha — o ponto ÚNICO onde as
 * oito fontes viram uma lista ordenada e sem duplicatas.
 *
 * Existe porque a aba Poderes e o gerador de PDF montavam essa lista cada um do
 * seu jeito e foram divergindo: o PDF lia só seis das oito fontes (deixando de
 * fora justamente `customPowers` e `customGrantedPowers`, os poderes criados à
 * mão pelo usuário), deduplicava por array em vez de sobre a lista concatenada e
 * não injetava o texto dinâmico de Autoridade Eclesiástica. Qualquer consumidor
 * novo deve entrar por aqui em vez de repetir a concatenação.
 */

const CAMINHO_DO_CAVALEIRO = 'Caminho do Cavaleiro';

/**
 * Recorta o texto da habilidade para o caminho escolhido.
 *
 * O texto do livro é "Escolha entre Bastião ou Montaria. Bastião: ... Montaria:
 * ...". Fatiar pelos rótulos evita duplicar a descrição aqui — se o texto do
 * dado mudar, o recorte acompanha. Sem casamento, devolve `undefined` e a
 * habilidade segue com o texto completo.
 */
function getCaminhoDoCavaleiroDynamicText(
  text: string,
  caminho: 'Bastião' | 'Montaria'
): string | undefined {
  const outro = caminho === 'Bastião' ? 'Montaria' : 'Bastião';
  const inicio = text.indexOf(`${caminho}:`);
  if (inicio < 0) return undefined;

  const fim = text.indexOf(`${outro}:`, inicio);
  const trecho = (fim > inicio ? text.slice(inicio, fim) : text.slice(inicio))
    .trim()
    .replace(/\s+$/, '');

  return `[${caminho}] ${trecho.slice(caminho.length + 1).trim()}`;
}

function filterUniqueByName<T extends { name: string }>(array: T[]): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

export interface CollectedPowers {
  /** Lista final: já deduplicada e na ordem manual do usuário. */
  powers: SheetPower[];
  /**
   * Quantas vezes cada nome aparecia ANTES da deduplicação, para o sufixo
   * `(xN)`. Contado sobre as fontes já filtradas, senão um poder que existe em
   * duas fontes distintas ganha um `(x2)` que não corresponde a nada.
   */
  counts: Record<string, number>;
  /** Fontes já normalizadas (dynamicText + habilidades filtradas). */
  sources: PowerSourceArrays;
}

/**
 * Deriva as oito fontes de poder a partir da ficha. Espelha o que
 * `Result.tsx` passa por props para `PowersDisplay`.
 */
export function buildPowerSources(sheet: CharacterSheet): PowerSourceArrays {
  return {
    classPowers: sheet.classPowers || [],
    raceAbilities: sheet.raca.abilities || [],
    classAbilities: sheet.classe.abilities || [],
    originPowers: sheet.origin?.powers || [],
    deityPowers: sheet.devoto?.poderes || [],
    generalPowers: sheet.generalPowers || [],
    customPowers: sheet.customPowers || [],
    customGrantedPowers: sheet.customGrantedPowers || [],
    className: sheet.classe.name,
    raceName: sheet.raca.name,
    cavaleiroCaminho: sheet.cavaleiroCaminho,
  };
}

/**
 * Normaliza + concatena + deduplica + ordena.
 *
 * @param sources     as oito fontes (ver `buildPowerSources`)
 * @param powersOrder ordem manual do usuário (`sheet.powersOrder`)
 * @param deityName   nome da divindade, para o texto dinâmico de Autoridade
 *                    Eclesiástica
 */
export function collectPowers(
  sources: PowerSourceArrays,
  powersOrder?: string[],
  deityName?: string
): CollectedPowers {
  // Texto dinâmico dos poderes que dependem da divindade.
  const processedClassPowers = sources.classPowers.map((power) => {
    if (power.name === 'Autoridade Eclesiástica') {
      const dynamicText = getAutoridadeEclesiasticaDynamicText(deityName);
      if (dynamicText) return { ...power, dynamicText };
    }
    return power;
  });

  // Caminho do Cavaleiro: o texto do livro descreve Bastião E Montaria. Só o
  // caminho escolhido interessa na ficha — mesmo tratamento de Autoridade
  // Eclesiástica, que também tem texto dependente de uma escolha.
  const processedClassAbilities = sources.classAbilities.map((ability) => {
    if (ability.name !== CAMINHO_DO_CAVALEIRO || !sources.cavaleiroCaminho) {
      return ability;
    }
    const dynamicText = getCaminhoDoCavaleiroDynamicText(
      ability.text,
      sources.cavaleiroCaminho
    );
    return dynamicText ? { ...ability, dynamicText } : ability;
  });

  // Habilidade de classe cujo nome já existe como poder de classe é a MESMA
  // coisa (ex.: a habilidade "Alquimista Iniciado" auto-concede o poder de
  // mesmo nome) — listar as duas duplicaria a linha.
  const classPowerNames = new Set(processedClassPowers.map((p) => p.name));
  const filteredClassAbilities = processedClassAbilities.filter(
    (ability) => !classPowerNames.has(ability.name)
  );

  const normalized: PowerSourceArrays = {
    ...sources,
    classPowers: processedClassPowers,
    classAbilities: filteredClassAbilities,
  };

  const all: SheetPower[] = [
    ...processedClassPowers,
    ...sources.raceAbilities,
    ...filteredClassAbilities,
    ...sources.originPowers,
    ...sources.deityPowers,
    ...sources.generalPowers,
    ...(sources.customPowers || []),
    ...(sources.customGrantedPowers || []),
  ];

  const counts: Record<string, number> = {};
  all.forEach((power) => {
    counts[power.name] = (counts[power.name] || 0) + 1;
  });

  // Dedupe SOBRE A LISTA CONCATENADA, não por array: um mesmo nome vindo de
  // duas fontes (poder concedido que também é poder geral) gerava duas linhas
  // com a mesma React key — e, no modo reordenar, dois `draggableId` iguais
  // dentro do mesmo Droppable, o que viola um invariant do react-beautiful-dnd.
  const powers = applyPowersOrder(filterUniqueByName(all), powersOrder);

  return { powers, counts, sources: normalized };
}

/** Atalho para quem tem a ficha inteira em mãos (ex.: o gerador de PDF). */
export function collectSheetPowers(sheet: CharacterSheet): CollectedPowers {
  return collectPowers(
    buildPowerSources(sheet),
    sheet.powersOrder,
    sheet.devoto?.divindade.name
  );
}

export default collectSheetPowers;
