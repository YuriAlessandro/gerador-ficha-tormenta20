import { describe, it } from 'vitest';

/**
 * Trava por TESTE para o modo stub (PR de fork, sem o submódulo premium).
 *
 * `PREMIUM_DEPENDENT_TESTS` (vitest.config.ts) tira o ARQUIVO inteiro do modo
 * stub. Quando só alguns casos de um arquivo grande do core dependem de código
 * premium (bônus de ficha, complicações de idade, familiar), tirar o arquivo
 * levaria junto dezenas de testes que passam. Nesses casos, use isto.
 *
 * O valor vem de `test.env` em vitest.config.ts, que já sabe se o premium está
 * presente (ou se `VITE_NO_PREMIUM=1` forçou o stub).
 */
export const PREMIUM_AVAILABLE = process.env.PREMIUM_AVAILABLE !== 'false';

export const itWithPremium = it.runIf(PREMIUM_AVAILABLE);
export const describeWithPremium = describe.runIf(PREMIUM_AVAILABLE);
