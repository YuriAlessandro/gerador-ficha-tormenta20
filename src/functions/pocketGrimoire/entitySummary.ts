import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import { encyclopediaIds } from '../encyclopediaSearch';
import { ClassDescription } from '../../interfaces/Class';
import Race, { RaceAttributeAbility } from '../../interfaces/Race';

/**
 * Resumo de uma classe, raça, origem ou divindade inteira, montado a partir
 * dos dados de regras do app (não do texto descritivo do livro). Serve para a
 * carta/card dessas entidades não ficar vazia no grimório.
 */
export interface EntityFact {
  label: string;
  value: string;
}

const ALL_SUPPLEMENTS = Object.values(SupplementId);

const signed = (mod: number) => (mod >= 0 ? `+${mod}` : `–${Math.abs(mod)}`);

const joinNames = (names: string[]) => names.filter(Boolean).join(', ');

function classFacts(classe: ClassDescription): EntityFact[] {
  const basics = classe.periciasbasicas
    .map((group) => group.list.join(group.type === 'or' ? ' ou ' : ' e '))
    .join(', ');
  const { qtd, list } = classe.periciasrestantes;
  const skills = [basics, qtd > 0 ? `mais ${qtd} entre ${list.join(', ')}` : '']
    .filter(Boolean)
    .join(', ');
  const abilities = [...classe.abilities]
    .sort((a, b) => (a.nivel ?? 0) - (b.nivel ?? 0))
    .map((ability) =>
      ability.nivel ? `${ability.name} (${ability.nivel}º)` : ability.name
    );

  return [
    {
      label: 'Pontos de vida',
      value: `${classe.pv} + Constituição no 1º nível; +${classe.addpv} + Constituição por nível`,
    },
    {
      label: 'Pontos de mana',
      value:
        classe.pm === classe.addpm
          ? `${classe.pm} por nível`
          : `${classe.pm} no 1º nível; +${classe.addpm} por nível`,
    },
    { label: 'Perícias', value: skills },
    {
      label: 'Proficiências',
      value: joinNames(classe.proficiencias) || 'Nenhuma além das básicas',
    },
    { label: 'Habilidades', value: joinNames(abilities) },
  ];
}

const COUNT_WORDS = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis'];

/** "+1 Inteligência, +1 em três atributos à escolha, –1 Força". */
const formatAttributes = (attrs: RaceAttributeAbility[]) => {
  const groups: {
    attr: RaceAttributeAbility['attr'];
    mod: number;
    count: number;
  }[] = [];
  attrs.forEach(({ attr, mod }) => {
    const same = groups.find((g) => g.attr === attr && g.mod === mod);
    if (same) same.count += 1;
    else groups.push({ attr, mod, count: 1 });
  });
  return groups
    .map(({ attr, mod, count }) => {
      if (attr !== 'any') return `${signed(mod)} ${attr}`;
      return count === 1
        ? `${signed(mod)} em um atributo à escolha`
        : `${signed(mod)} em ${
            COUNT_WORDS[count] ?? count
          } atributos à escolha`;
    })
    .join(', ');
};

function raceFacts(race: Race): EntityFact[] {
  const facts: EntityFact[] = [];
  const variants = race.attributeVariants ?? [];
  const attributes =
    variants.length > 1
      ? variants.map((variant) => formatAttributes(variant.attrs)).join(' ou ')
      : formatAttributes(race.attributes.attrs);
  if (attributes) facts.push({ label: 'Atributos', value: attributes });

  const abilities = joinNames(race.abilities.map((ability) => ability.name));
  if (abilities) facts.push({ label: 'Habilidades', value: abilities });

  const heritages = joinNames(
    Object.values(race.heritages ?? {}).map((heritage) => heritage.name)
  );
  if (heritages) facts.push({ label: 'Heranças', value: heritages });
  return facts;
}

let factsById: Map<string, EntityFact[]> | null = null;

function buildFacts(): Map<string, EntityFact[]> {
  const map = new Map<string, EntityFact[]>();
  const set = (id: string, facts: EntityFact[]) => {
    if (!map.has(id)) map.set(id, facts);
  };

  dataRegistry
    .getClassesWithSupplementInfo(ALL_SUPPLEMENTS)
    .forEach((classe) =>
      set(encyclopediaIds.class(classe), classFacts(classe))
    );

  dataRegistry
    .getRacesWithSupplementInfo(ALL_SUPPLEMENTS)
    .forEach((race) => set(encyclopediaIds.race(race.name), raceFacts(race)));

  dataRegistry.getOriginsBySupplements(ALL_SUPPLEMENTS).forEach((origin) => {
    const facts: EntityFact[] = [];
    const skills = joinNames(origin.pericias);
    if (skills) facts.push({ label: 'Perícias', value: skills });
    const powers = joinNames(origin.poderes.map((power) => power.name));
    if (powers) facts.push({ label: 'Poderes', value: powers });
    const items = joinNames(
      origin.getItems().map(({ equipment, qtd }) => {
        const name = typeof equipment === 'string' ? equipment : equipment.nome;
        return qtd && qtd > 1 ? `${qtd}x ${name}` : name;
      })
    );
    if (items) facts.push({ label: 'Itens', value: items });
    set(encyclopediaIds.origin(origin.name), facts);
  });

  dataRegistry
    .getDeitiesWithSupplementPowers(ALL_SUPPLEMENTS)
    .forEach((deity) => {
      const facts: EntityFact[] = [];
      if (deity.energy) facts.push({ label: 'Energia', value: deity.energy });
      if (deity.preferredWeapon) {
        facts.push({ label: 'Arma preferida', value: deity.preferredWeapon });
      }
      const powers = joinNames(deity.poderes.map((power) => power.name));
      if (powers) facts.push({ label: 'Poderes concedidos', value: powers });
      set(encyclopediaIds.deity(deity.name), facts);
    });

  return map;
}

/** Fatos da entidade com esse id do índice, ou `[]` se não for entidade. */
export function entityFacts(id: string): EntityFact[] {
  if (!factsById) factsById = buildFacts();
  return factsById.get(id) ?? [];
}
