/* eslint-disable */
// Stub público — escrito à mão. Ver src/premium-stub/_inert.tsx.

// ThreatResult deriva ~1000 linhas do retorno desta função. A identidade é o
// stub correto: a implementação real também devolve a ameaça intacta quando
// não há condições ativas, que é sempre o caso sem o módulo premium.
export function getEffectiveThreat<T>(threat: T): T {
  return threat;
}
