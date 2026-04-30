import CharacterSheet, {
  ClassLevelEntry,
  SerializedSpellPath,
} from '@/interfaces/CharacterSheet';
import { ClassAbility, ClassDescription, SpellPath } from '@/interfaces/Class';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import { LevelUpSelections } from '@/interfaces/WizardSelections';
import {
  arcanistaSpellPaths,
  ArcanistaSubtypes,
  classAbilities as arcanistaClassAbilities,
  feiticeiroPaths,
  createLinhagemAbencoada,
} from '@/data/systems/tormenta20/classes/arcanista';
import { Atributo } from '@/data/systems/tormenta20/atributos';
import { allSpellSchools, SpellSchool } from '@/interfaces/Spells';

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
  return parts.join(' · ');
}

/**
 * Busca a ClassDescription de uma classe pelo nome, usando o registry.
 * Quando supplements não é fornecido, busca em TODOS os suplementos para
 * garantir que classes variantes de suplementos sejam encontradas.
 * Inclui fallback para classes com subname dinâmico (ex: Arcanista/Mago).
 */
export function findClassDescription(
  className: string,
  classSubname?: string,
  supplements?: SupplementId[]
): ClassDescription | undefined {
  const supps = supplements ?? Object.values(SupplementId);
  const allClasses = dataRegistry.getClassesBySupplements(supps);

  // Exact match first (handles variant classes with explicit subname)
  const exactMatch = allClasses.find((c) => {
    if (c.name !== className) return false;
    if (classSubname) return c.subname === classSubname;
    return !c.subname;
  });

  if (exactMatch) return exactMatch;

  // Fallback: match by name only when subname is from setup() (not in registry)
  // Ex: Arcanista has subname 'Mago' set by setup(), but registry has no subname
  if (classSubname) {
    return allClasses.find((c) => c.name === className && !c.subname);
  }

  return undefined;
}

/**
 * Calcula PV total para multiclasse.
 *
 * Fórmula:
 * - Classe primária: pv (base) + conMod + max(addpv + conMod, 1) * (primaryLevel - 1)
 * - Classes secundárias: max(addpv + conMod, 1) * secondaryLevel (sem base)
 * - CON negativo reduz o PV mas o ganho mínimo por nível é 1
 * - Bonus: bonusPV, manualPVEdit, customPVPerLevel
 */
export function calculateMulticlassPV(sheet: CharacterSheet): number {
  if (!isMulticlass(sheet)) {
    // Fallback: fórmula mono-classe padrão
    const addPVPerLevel = sheet.customPVPerLevel ?? sheet.classe.addpv ?? 0;
    const conMod = sheet.atributos.Constituição?.value || 0;
    // Constituição negativa reduz PV, mas ganho mínimo por nível é 1
    const pvPerLevelGain = Math.max(addPVPerLevel + conMod, 1);
    return (sheet.classe.pv || 0) + conMod + pvPerLevelGain * (sheet.nivel - 1);
  }

  const classLevelsMap = getClassLevelsMap(sheet);
  const primaryClassName = sheet.classLevels![0].className;
  let totalPV = 0;

  // Constituição negativa reduz PV, mas ganho mínimo por nível é 1
  const conMod = sheet.atributos.Constituição?.value || 0;

  classLevelsMap.forEach((classLevel, className) => {
    const isPrimary = className === primaryClassName;
    // Encontrar a ClassDescription para obter pv/addpv
    const subname = sheet.classLevels!.find(
      (cl) => cl.className === className
    )?.classSubname;
    const classDesc = findClassDescription(className, subname);

    if (!classDesc) return;

    if (isPrimary) {
      // Classe primária: base PV + conMod + max(addpv + conMod, 1) * (classLevel - 1)
      const addpv =
        className === sheet.classe.name
          ? sheet.customPVPerLevel ?? classDesc.addpv
          : classDesc.addpv;
      const pvPerLevelGain = Math.max(addpv + conMod, 1);
      totalPV += classDesc.pv + conMod + pvPerLevelGain * (classLevel - 1);
    } else {
      // Classes secundárias: max(addpv + conMod, 1) por nível (sem base PV)
      const pvPerLevelGain = Math.max(classDesc.addpv + conMod, 1);
      totalPV += pvPerLevelGain * classLevel;
    }
  });

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

    const filtered = classDesc.abilities
      .filter((a) => a.nivel <= classLevel)
      .map((a) => ({ ...a, sourceClassName: className }));
    allAbilities.push(...filtered);
  });

  return allAbilities;
}

/**
 * Constrói um SpellPath a partir das escolhas de classSetup do wizard de level-up.
 * Para classes com setup() automático (Clérigo, Frade), chama setup() diretamente.
 * Para classes com spellPath estático (Necromante, Ventanista), retorna o spellPath da ClassDescription.
 * Retorna null se a classe não é conjuradora.
 */
export function buildSpellPathFromSetup(
  className: string,
  classSubname: string | undefined,
  classSetup: NonNullable<LevelUpSelections['classSetup']> | undefined,
  supplements?: SupplementId[]
): SpellPath | null {
  const classDesc = findClassDescription(className, classSubname, supplements);
  if (!classDesc) return null;

  // Classes com spellPath estático (variantes como Necromante, Ventanista)
  if (classDesc.spellPath) {
    return classDesc.spellPath;
  }

  // Arcanista: usar subtype das choices
  if (className === 'Arcanista' && classSetup?.arcanistaSubtype) {
    const subtype = classSetup.arcanistaSubtype as ArcanistaSubtypes;
    const spellPath = { ...arcanistaSpellPaths[subtype] };
    if (
      subtype === 'Feiticeiro' &&
      classSetup.feiticeiroLinhagem === 'Linhagem Abençoada'
    ) {
      spellPath.includeDivineSchools = allSpellSchools;
    }
    return spellPath;
  }

  // Bardo: Both (arcana + divina) com escolas selecionadas
  if (className === 'Bardo' && classSetup?.spellSchools) {
    return {
      initialSpells: 2,
      spellType: 'Both',
      qtySpellsLearnAtLevel: (level: number) => (level % 2 === 0 ? 1 : 0),
      schools: classSetup.spellSchools as SpellSchool[],
      spellCircleAvailableAtLevel: (level: number) => {
        if (level < 6) return 1;
        if (level < 10) return 2;
        if (level < 14) return 3;
        return 4;
      },
      keyAttribute: Atributo.CARISMA,
    };
  }

  // Druida: Divine com escolas selecionadas
  if (className === 'Druida' && classSetup?.spellSchools) {
    return {
      initialSpells: 2,
      spellType: 'Divine',
      qtySpellsLearnAtLevel: (level: number) => (level % 2 === 0 ? 1 : 0),
      schools: classSetup.spellSchools as SpellSchool[],
      spellCircleAvailableAtLevel: (level: number) => {
        if (level < 5) return 1;
        if (level < 9) return 2;
        if (level < 13) return 3;
        if (level < 17) return 4;
        return 5;
      },
      keyAttribute: Atributo.SABEDORIA,
    };
  }

  // Clérigo/Frade: setup() automático (sem choices do usuário)
  if (classDesc.setup) {
    const setupClass = classDesc.setup(classDesc);
    if (setupClass.spellPath) {
      return setupClass.spellPath;
    }
  }

  return null;
}

/**
 * Serializa um SpellPath para persistência (remove funções).
 */
export function serializeSpellPath(
  spellPath: SpellPath,
  className: string,
  classSubname?: string
): SerializedSpellPath {
  return {
    initialSpells: spellPath.initialSpells,
    spellType: spellPath.spellType,
    schools: spellPath.schools,
    excludeSchools: spellPath.excludeSchools,
    includeDivineSchools: spellPath.includeDivineSchools,
    includeArcaneSchools: spellPath.includeArcaneSchools,
    crossTraditionLimit: spellPath.crossTraditionLimit,
    keyAttribute: spellPath.keyAttribute,
    className,
    classSubname,
  };
}

/**
 * Aplica campos serializados (customizados pelo usuário) sobre um SpellPath restaurado.
 */
export function applySerializedOverrides(
  target: SpellPath,
  serialized: SerializedSpellPath
): void {
  if (serialized.schools) {
    target.schools = serialized.schools;
  }
  if (serialized.keyAttribute) {
    target.keyAttribute = serialized.keyAttribute;
  }
  if (serialized.excludeSchools) {
    target.excludeSchools = serialized.excludeSchools;
  }
  if (serialized.includeDivineSchools) {
    target.includeDivineSchools = serialized.includeDivineSchools;
  }
  if (serialized.includeArcaneSchools) {
    target.includeArcaneSchools = serialized.includeArcaneSchools;
  }
  if (serialized.crossTraditionLimit !== undefined) {
    target.crossTraditionLimit = serialized.crossTraditionLimit;
  }
}

/**
 * Retorna habilidades adicionais de classe que vêm do setup/configuração
 * e não estão na ClassDescription base (ex: linhagens do Feiticeiro).
 * Usado para injetar essas abilities no wizard de level-up e em applyManualLevelUp.
 */
export function getClassSetupAbilities(
  className: string,
  classSetup?: LevelUpSelections['classSetup']
): ClassAbility[] {
  if (!classSetup) return [];

  if (className === 'Arcanista' && classSetup.arcanistaSubtype) {
    const abilities: ClassAbility[] = [];

    // Habilidade do subtipo (Caminho do Arcanista)
    const subtypeAbility =
      arcanistaClassAbilities[classSetup.arcanistaSubtype as ArcanistaSubtypes];
    if (subtypeAbility) {
      abilities.push(subtypeAbility);
    }

    // Linhagem do Feiticeiro (pode ter sheetActions com picks)
    if (
      classSetup.arcanistaSubtype === 'Feiticeiro' &&
      classSetup.feiticeiroLinhagem
    ) {
      if (classSetup.feiticeiroLinhagem === 'Linhagem Abençoada') {
        const deus = classSetup.linhagemAbencoadaDeus || 'um deus maior';
        abilities.push(createLinhagemAbencoada(deus));
      } else {
        const linhagemAbility = feiticeiroPaths.find(
          (p) => p.name === classSetup.feiticeiroLinhagem
        );
        if (linhagemAbility) {
          abilities.push(linhagemAbility);
        }
      }
    }

    return abilities;
  }

  return [];
}
