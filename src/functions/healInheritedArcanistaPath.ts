import CharacterSheet from '../interfaces/CharacterSheet';
import { ClassAbility, ClassDescription } from '../interfaces/Class';
import {
  arcanistaSpellPaths,
  classAbilities,
  createLinhagemAbencoada,
  feiticeiroPaths,
} from '../data/systems/tormenta20/classes/arcanista';

/**
 * Habilidades que só o `setup()` do Arcanista coloca na ficha: o caminho e a
 * linhagem do Feiticeiro. O deus passado a `createLinhagemAbencoada` não
 * importa aqui — só os nomes são usados.
 */
const ARCANISTA_PATH_ABILITY_NAMES = new Set<string>([
  ...Object.values(classAbilities).map((a) => a.name),
  ...feiticeiroPaths.map((a) => a.name),
  ...createLinhagemAbencoada('').map((a) => a.name),
]);

/**
 * `true` quando a classe é o Arcanista ou uma variante que ainda herda o
 * `setup()` dele — ou seja, quando o caminho (Bruxo/Mago/Feiticeiro) faz parte
 * da classe. Variantes com conjuração própria (Necromante, homebrews) declaram
 * `setup: undefined` e ficam de fora.
 */
export function classUsesArcanistaPath(
  classDesc: ClassDescription | undefined,
  className: string
): boolean {
  if (className === 'Arcanista') return true;
  return (
    !!classDesc && classDesc.baseClassName === 'Arcanista' && !!classDesc.setup
  );
}

/**
 * Desfaz o caminho do Arcanista em fichas de variantes que NÃO têm caminho.
 *
 * Variantes homebrew com conjuração própria (ou sem conjuração) herdavam o
 * `setup()` do Arcanista, que sorteava um caminho, sobrescrevia o `spellPath`
 * do autor e empurrava "Caminho do Arcanista"/linhagem para `abilities` — de
 * onde iam parar em `originalAbilities` e voltavam a cada recálculo. O
 * compilador deixou de herdar o `setup`, mas as fichas já criadas guardam o
 * estrago; esta função o remove na carga.
 *
 * Idempotente: sem o `subname` a condição deixa de valer. Magias já aprendidas
 * e efeitos colaterais de linhagem (perícia, poder da Tormenta) não são
 * tocados — não dá para distinguir do que o jogador escolheu.
 *
 * @param classDesc classe da ficha resolvida no catálogo; sem ela (homebrew
 *                  ainda não registrada) nada é feito.
 */
export function healInheritedArcanistaPath(
  sheet: CharacterSheet,
  classDesc: ClassDescription | undefined
): void {
  if (!classDesc || classDesc.baseClassName !== 'Arcanista') return;
  if (classDesc.setup) return;

  const { subname } = sheet.classe;
  if (!subname || !(subname in arcanistaSpellPaths)) return;
  if (classDesc.subname === subname) return;

  const ownAbilityNames = new Set(
    (classDesc.abilities ?? []).map((a) => a.name)
  );
  const withoutPath = (abilities: ClassAbility[]): ClassAbility[] =>
    abilities.filter(
      (a) =>
        !ARCANISTA_PATH_ABILITY_NAMES.has(a.name) || ownAbilityNames.has(a.name)
    );

  sheet.classe.subname = classDesc.subname;
  if (Array.isArray(sheet.classe.abilities)) {
    sheet.classe.abilities = withoutPath(sheet.classe.abilities);
  }
  if (Array.isArray(sheet.classe.originalAbilities)) {
    sheet.classe.originalAbilities = withoutPath(
      sheet.classe.originalAbilities
    );
  }

  // O spellPath salvo é o do caminho sorteado (atributo-chave, magias
  // iniciais): troca pelo da variante em vez de reaplicar o serializado.
  // Cópia rasa: nunca compartilhar o spellPath do registry com a ficha.
  sheet.classe.spellPath = classDesc.spellPath
    ? { ...classDesc.spellPath }
    : undefined;
}
