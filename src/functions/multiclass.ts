import CharacterSheet, { ClassLevelEntry } from '@/interfaces/CharacterSheet';
import { ClassAbility, ClassDescription } from '@/interfaces/Class';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';

/**
 * Verifica se a sheet tem multiclasse.
 * Retorna false se classLevels undefined ou todas entradas são da mesma classe.
 */
export function isMulticlass(sheet: CharacterSheet): boolean {
  if (!sheet.classLevels || sheet.classLevels.length === 0) return false;
  const uniqueClasses = new Set(sheet.classLevels.map((cl) => cl.className));
  return uniqueClasses.size > 1;
}

/**
 * Retorna o nível numa classe específica.
 * Se classLevels undefined (mono-classe), retorna sheet.nivel.
 */
export function getClassLevel(
  sheet: CharacterSheet,
  className: string
): number {
  if (!sheet.classLevels || sheet.classLevels.length === 0) {
    return sheet.nivel;
  }
  return sheet.classLevels.filter((cl) => cl.className === className).length;
}

/**
 * Retorna Map<className, classLevel> com a contagem de níveis em cada classe.
 * Se classLevels undefined, retorna a classe primária com sheet.nivel.
 */
export function getClassLevelsMap(sheet: CharacterSheet): Map<string, number> {
  const map = new Map<string, number>();
  if (!sheet.classLevels || sheet.classLevels.length === 0) {
    map.set(sheet.classe.name, sheet.nivel);
    return map;
  }
  sheet.classLevels.forEach((cl) => {
    map.set(cl.className, (map.get(cl.className) ?? 0) + 1);
  });
  return map;
}

/**
 * Inicializa classLevels a partir de uma sheet mono-classe existente.
 * Cria uma entrada para cada nível, todos com a classe primária.
 */
export function initializeClassLevels(
  sheet: CharacterSheet
): ClassLevelEntry[] {
  const entries: ClassLevelEntry[] = [];
  for (let i = 1; i <= sheet.nivel; i += 1) {
    entries.push({
      level: i,
      className: sheet.classe.name,
      classSubname: sheet.classe.subname,
    });
  }
  return entries;
}

/**
 * Retorna string de display para multiclasse.
 * Ex: "Arcanista 3 / Paladino 1" ou "Guerreiro 5" (mono-classe).
 */
export function getMulticlassDisplayName(sheet: CharacterSheet): string {
  if (!isMulticlass(sheet)) {
    const name =
      sheet.classe.isVariant && sheet.classe.baseClassName
        ? `${sheet.classe.name} (${sheet.classe.baseClassName})`
        : sheet.classe.name;
    return `${name} ${sheet.nivel}`;
  }

  const classLevelsMap = getClassLevelsMap(sheet);
  const parts: string[] = [];
  classLevelsMap.forEach((level, className) => {
    parts.push(`${className} ${level}`);
  });
  return parts.join(' / ');
}

/**
 * Busca a ClassDescription de uma classe pelo nome, usando o registry.
 * Tenta primeiro pelo registry (com suplementos), fallback para lookup direto.
 */
export function findClassDescription(
  className: string,
  classSubname?: string,
  supplements?: SupplementId[]
): ClassDescription | undefined {
  const supps = supplements ?? [];
  const allClasses = dataRegistry.getClassesBySupplements(supps);
  return allClasses.find((c) => {
    if (c.name !== className) return false;
    if (classSubname) return c.subname === classSubname;
    return !c.subname;
  });
}

/**
 * Calcula PV total para multiclasse.
 *
 * Fórmula:
 * - Classe primária: pv (base) + addpv * (primaryLevel - 1)
 * - Classes secundárias: addpv * secondaryLevel (sem base)
 * - CON por nível: max(conMod, 0) * characterLevel
 * - Bonus: bonusPV, manualPVEdit, customPVPerLevel
 */
export function calculateMulticlassPV(sheet: CharacterSheet): number {
  if (!isMulticlass(sheet)) {
    // Fallback: fórmula mono-classe padrão
    const addPVPerLevel = sheet.customPVPerLevel ?? sheet.classe.addpv ?? 0;
    const conMod = Math.max(sheet.atributos.Constituição?.value || 0, 0);
    return (
      (sheet.classe.pv || 0) +
      addPVPerLevel * (sheet.nivel - 1) +
      conMod * sheet.nivel
    );
  }

  const classLevelsMap = getClassLevelsMap(sheet);
  const primaryClassName = sheet.classLevels![0].className;
  const primarySubname = sheet.classLevels![0].classSubname;
  let totalPV = 0;

  classLevelsMap.forEach((classLevel, className) => {
    const isPrimary = className === primaryClassName;
    // Encontrar a ClassDescription para obter pv/addpv
    const subname = sheet.classLevels!.find(
      (cl) => cl.className === className
    )?.classSubname;
    const classDesc = findClassDescription(className, subname);

    if (!classDesc) return;

    if (isPrimary) {
      // Classe primária: base PV + addpv per subsequent level
      const addpv =
        className === sheet.classe.name
          ? sheet.customPVPerLevel ?? classDesc.addpv
          : classDesc.addpv;
      totalPV += classDesc.pv + addpv * (classLevel - 1);
    } else {
      // Classes secundárias: apenas addpv (sem base PV)
      totalPV += classDesc.addpv * classLevel;
    }
  });

  // CON modifier por nível de personagem (min 0)
  const conMod = Math.max(sheet.atributos.Constituição?.value || 0, 0);
  totalPV += conMod * sheet.nivel;

  // Add bonus PV if defined
  if (sheet.bonusPV) {
    totalPV += sheet.bonusPV;
  }

  // Add manual PV edit if defined
  if (sheet.manualPVEdit) {
    totalPV += sheet.manualPVEdit;
  }

  return totalPV;
}

/**
 * Calcula PM total para multiclasse.
 *
 * Fórmula: Σ(class.pm + class.addpm * (classLevel - 1)) para cada classe
 * Cada classe contribui normalmente com base + addpm per subsequent level.
 */
export function calculateMulticlassPM(sheet: CharacterSheet): number {
  if (!isMulticlass(sheet)) {
    // Fallback: fórmula mono-classe padrão
    const addPMPerLevel = sheet.customPMPerLevel ?? sheet.classe.addpm ?? 0;
    return (sheet.classe.pm || 0) + addPMPerLevel * (sheet.nivel - 1);
  }

  const classLevelsMap = getClassLevelsMap(sheet);
  let totalPM = 0;

  classLevelsMap.forEach((classLevel, className) => {
    const subname = sheet.classLevels!.find(
      (cl) => cl.className === className
    )?.classSubname;
    const classDesc = findClassDescription(className, subname);

    if (!classDesc) return;

    const addpm =
      className === sheet.classe.name
        ? sheet.customPMPerLevel ?? classDesc.addpm
        : classDesc.addpm;
    totalPM += classDesc.pm + addpm * (classLevel - 1);
  });

  // Add bonus PM if defined
  if (sheet.bonusPM) {
    totalPM += sheet.bonusPM;
  }

  // Add manual PM edit if defined
  if (sheet.manualPMEdit) {
    totalPM += sheet.manualPMEdit;
  }

  return totalPM;
}

/**
 * Retorna todas as habilidades de classe disponíveis para multiclasse.
 * Para cada classe, filtra habilidades por nível da classe específica.
 * Mono-classe: retorna as habilidades da classe primária filtradas por sheet.nivel.
 */
export function getMulticlassAvailableAbilities(
  sheet: CharacterSheet,
  supplements?: SupplementId[]
): ClassAbility[] {
  if (!isMulticlass(sheet)) {
    // Mono-classe: comportamento original
    const classDesc = findClassDescription(
      sheet.classe.name,
      sheet.classe.subname,
      supplements
    );
    const abilities = classDesc?.abilities ?? sheet.classe.abilities;
    return abilities.filter((a) => a.nivel <= sheet.nivel);
  }

  const classLevelsMap = getClassLevelsMap(sheet);
  const allAbilities: ClassAbility[] = [];

  classLevelsMap.forEach((classLevel, className) => {
    const subname = sheet.classLevels!.find(
      (cl) => cl.className === className
    )?.classSubname;
    const classDesc = findClassDescription(className, subname, supplements);

    if (!classDesc) return;

    const filtered = classDesc.abilities.filter((a) => a.nivel <= classLevel);
    allAbilities.push(...filtered);
  });

  return allAbilities;
}
