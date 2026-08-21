import type { PortraitRoll, PortraitRollGroup } from '../interfaces/Portrait';
import api from '../services/api';

/**
 * Portrait — ponte entre a ficha aberta e o overlay de stream.
 *
 * Módulo público e singleton, espelhando `owlbearEmbedBridge.ts`: quem produz
 * rolagens (`DiceRollContext.publishRoll`) não sabe QUAL ficha está aberta — o
 * `ExtendedDiceRollPayload` não carrega `sheetId`, e o `DiceRollProvider` está
 * montado no nível do `<App/>`. As telas que sabem (a ficha, o embed do Owlbear,
 * a sessão de mesa) registram aqui; o `publishRoll` só chama
 * `forwardPortraitRoll` e este módulo decide se há para onde mandar.
 *
 * O transporte é HTTP, não socket, de propósito: fora de uma sessão de mesa o
 * dono não mantém socket aberto, e um POST solto por rolagem é mais barato do
 * que manter uma conexão viva só para isso. O backend faz relay puro (não
 * persiste) — ver `backend/src/controllers/portraitController.ts`.
 */

interface ActivePortrait {
  sheetId: string;
}

let active: ActivePortrait | null = null;

/**
 * Registra (ou limpa) a ficha cujas rolagens devem ir para o overlay.
 *
 * SÓ chamar com a ficha do PRÓPRIO usuário. Na sessão de mesa o mestre alterna
 * entre as fichas dos jogadores; registrar cego mandaria as rolagens dele para
 * o overlay de quem estivesse selecionado na tela.
 */
export function setActivePortraitSheet(sheetId: string | null): void {
  active = sheetId ? { sheetId } : null;
}

export function getActivePortraitSheetId(): string | null {
  return active?.sheetId ?? null;
}

/**
 * Coalescência: uma rolagem de ataque completo dispara `publishRoll` mais de uma
 * vez em sequência (fase 1 e dados extras do crítico). Sem a janela, o overlay
 * receberia dois POSTs e piscaria o resultado intermediário.
 */
const THROTTLE_MS = 150;
let lastSentAt = 0;
let pending: ReturnType<typeof setTimeout> | null = null;
let pendingPayload: PortraitRoll | null = null;

/** Forma mínima que o bridge precisa do payload de rolagem do premium. */
export interface PortraitRollSource {
  rollLabel?: string;
  characterName?: string;
  rollGroups?: PortraitRollGroup[];
}

function toPortraitRoll(source: PortraitRollSource): PortraitRoll {
  return {
    // `crypto.randomUUID` não existe em contexto inseguro (http://ip:5173 na
    // rede local, que é como muita gente testa). O id só serve para dedupe.
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    at: Date.now(),
    label: source.rollLabel || 'Rolagem',
    characterName: source.characterName,
    groups: Array.isArray(source.rollGroups) ? source.rollGroups : [],
  };
}

function send(payload: PortraitRoll): void {
  const sheetId = active?.sheetId;
  if (!sheetId) return;
  lastSentAt = Date.now();
  // Fire-and-forget. O `.catch` é obrigatório: sem ele, um 403/timeout vira
  // unhandled rejection dentro do `publishRoll`, no meio de uma rolagem.
  api.post('/api/portrait/roll', { sheetId, roll: payload }).catch(() => {
    // Overlay é acessório: falhar aqui não pode afetar a rolagem na ficha.
  });
}

/**
 * Encaminha uma rolagem para o overlay. No-op quando não há ficha registrada
 * (o caso normal — a maioria dos usuários não tem Portrait ligado).
 *
 * NÃO chamar em modo de rolagem privada: o call site em `publishRoll` já está
 * dentro do `if (!isPrivateRollMode)`. Rolagem privada vazando na live é pior
 * do que vazando na mesa.
 */
export function forwardPortraitRoll(source: PortraitRollSource): void {
  if (!active) return;

  const payload = toPortraitRoll(source);
  const elapsed = Date.now() - lastSentAt;

  if (elapsed >= THROTTLE_MS) {
    send(payload);
    return;
  }

  // Dentro da janela: guarda a MAIS RECENTE e manda uma vez só.
  pendingPayload = payload;
  if (pending) return;
  pending = setTimeout(() => {
    pending = null;
    if (pendingPayload) {
      send(pendingPayload);
      pendingPayload = null;
    }
  }, THROTTLE_MS - elapsed);
}

/** Só para testes: zera o estado do módulo entre casos. */
export function resetPortraitBridge(): void {
  active = null;
  lastSentAt = 0;
  pendingPayload = null;
  if (pending) {
    clearTimeout(pending);
    pending = null;
  }
}
