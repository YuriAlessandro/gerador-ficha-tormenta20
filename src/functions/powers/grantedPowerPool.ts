/**
 * Piscina de poderes concedidos disponíveis para escolha — ponto único das
 * quatro superfícies que a montam (assistente, drawer de poderes da
 * divindade, editor de poderes e o motor de geração).
 *
 * Com Devoção Dupla a piscina deixa de ser "os poderes do meu deus" e passa a
 * ser a UNIÃO das listas dos dois deuses. A QUANTIDADE que o personagem pode
 * escolher não muda — continua saindo de `classe.qtdPoderesConcedidos` — o que
 * muda é de onde ele escolhe.
 */
import { GeneralPower, RequirementType } from '../../interfaces/Poderes';
import { SupplementId } from '../../types/supplement.types';
import { dataRegistry } from '../../data/registry';

/**
 * Um poder é exclusivo de devoção dupla quando exige DOIS deuses no MESMO
 * grupo de requisitos — o AND que só um devoto duplo satisfaz. É assim que os
 * poderes únicos de sincretismo são identificados, sem precisar de um campo
 * ou de um tipo de requisito próprio.
 */
export function isDualDevotionPower(power: GeneralPower): boolean {
  return !!power.requirements?.some(
    (group) =>
      group.filter((req) => req.type === RequirementType.DEVOTO && !req.not)
        .length >= 2
  );
}

/**
 * União deduplicada (por nome) dos poderes concedidos dos deuses informados.
 *
 * Resolve cada deus pelo registry — nunca pelo array estático — senão poderes
 * vindos de suplementos (Deuses de Arton, Deuses Menores, homebrew) somem da
 * lista.
 */
export function getGrantedPowerPool(
  deityNames: string[],
  supplements: SupplementId[]
): GeneralPower[] {
  const pool: GeneralPower[] = [];
  const seen = new Set<string>();

  deityNames.forEach((name) => {
    const deity = dataRegistry.getDeityByName(name, supplements);
    deity?.poderes?.forEach((power) => {
      if (seen.has(power.name)) return;
      seen.add(power.name);
      pool.push(power);
    });
  });

  return pool;
}

/**
 * De qual(is) deus(es) da devoção um poder concedido vem — usado pelas UIs que
 * agrupam a piscina por divindade. Um poder único de sincretismo devolve os
 * dois nomes, e é o que permite exibi-lo numa seção própria.
 */
export function getPowerDeityNames(
  power: GeneralPower,
  deityNames: string[]
): string[] {
  const required = new Set<string>();
  power.requirements?.forEach((group) => {
    group.forEach((req) => {
      if (req.type === RequirementType.DEVOTO && !req.not && req.name) {
        required.add(req.name);
      }
    });
  });
  return deityNames.filter((name) => required.has(name));
}
