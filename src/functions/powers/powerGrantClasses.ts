import { ClassPowerGrant } from '@/interfaces/Class';

/**
 * Classes de onde vem o poder da concessão. Com `classesByOption`, depende da
 * opção escolhida no mesmo nível (Lorde: Soldado → Guerreiro, Governante →
 * Nobre); sem a escolha ainda, valem todas.
 */
export function resolveGrantClasses(
  grant: ClassPowerGrant,
  chosenOption?: string
): string[] {
  const byOption = chosenOption
    ? grant.classesByOption?.classes[chosenOption]
    : undefined;
  return byOption ?? grant.fromClasses;
}

export default resolveGrantClasses;
