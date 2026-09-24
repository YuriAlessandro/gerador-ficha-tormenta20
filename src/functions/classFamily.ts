import type { ClassDescription } from '../interfaces/Class';

/**
 * Identidade de "família" de classe — base e variantes.
 *
 * Módulo FOLHA de propósito (só um import de tipo): é consumido tanto por
 * `functions/general.ts` quanto por módulos de `data/`, e qualquer dependência
 * de runtime aqui fecharia um ciclo de import entre os dois lados.
 */
type ClassIdentity = Pick<
  ClassDescription,
  'name' | 'isVariant' | 'baseClassName'
>;

/**
 * Nome da "família" de uma classe: a classe base, quando for variante; senão o
 * próprio nome. Inovador e Guerreiro devolvem ambos 'Guerreiro'.
 */
export function getClassFamilyName(classe: ClassIdentity): string {
  return classe.isVariant === true && classe.baseClassName
    ? classe.baseClassName
    : classe.name;
}

/**
 * Duas classes pertencem à mesma família — nos DOIS sentidos.
 *
 * Complementa `isClassOrVariantOf` (em `general.ts`), que é de mão única
 * (variante → base) e portanto deixa passar o caso simétrico: um Guerreiro "não
 * é" Inovador, mas Inovador também não é outra classe para a regra "uma classe
 * que não seja a sua" do Duplo Feérico.
 */
export function isSameClassFamily(a: ClassIdentity, b: ClassIdentity): boolean {
  return getClassFamilyName(a) === getClassFamilyName(b);
}
