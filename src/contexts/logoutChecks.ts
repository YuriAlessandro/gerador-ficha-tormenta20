/**
 * Quem tem algo a perder no logout se registra aqui (a ficha aberta, os
 * grimórios com alterações não enviadas). O diálogo de "Sair da conta"
 * mostra a mensagem de cada um que tiver pendência.
 */
export interface LogoutCheck {
  /** Há algo que se perde se sair agora? */
  check: () => boolean;
  /** Texto mostrado no diálogo de confirmação. */
  message: string;
  /** Chamado depois que o logout explícito deu certo. */
  onLogout?: () => void;
  /** Última chance de salvar antes do diálogo (ex.: enviar pendências). */
  beforeLogout?: () => Promise<unknown>;
}

export interface LogoutCheckRegistry {
  register: (id: string, check: LogoutCheck) => void;
  unregister: (id: string) => void;
  pendingMessages: () => string[];
  notifyLogout: () => void;
  /** Roda os `beforeLogout`, esperando no máximo `timeoutMs`. Nunca rejeita. */
  prepare: (timeoutMs: number) => Promise<void>;
}

/** Quanto o "Sair" espera as pendências subirem antes de avisar. */
export const LOGOUT_PREPARE_TIMEOUT_MS = 5000;

export const SHEET_LOGOUT_CHECK_ID = 'sheet';

export const SHEET_UNSAVED_MESSAGE =
  'Você tem alterações não salvas na nuvem. Se você sair agora, elas ficarão salvas apenas localmente no seu navegador.';

export function createLogoutCheckRegistry(): LogoutCheckRegistry {
  const checks = new Map<string, LogoutCheck>();
  return {
    register: (id, check) => {
      checks.set(id, check);
    },
    unregister: (id) => {
      checks.delete(id);
    },
    pendingMessages: () =>
      Array.from(checks.values())
        .filter(({ check }) => check())
        .map(({ message }) => message),
    notifyLogout: () => {
      checks.forEach(({ onLogout }) => onLogout?.());
    },
    prepare: async (timeoutMs) => {
      const tasks = Array.from(checks.values()).flatMap(({ beforeLogout }) =>
        beforeLogout ? [beforeLogout().catch(() => undefined)] : []
      );
      if (tasks.length === 0) return;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timeout = new Promise<void>((resolve) => {
        timer = setTimeout(resolve, timeoutMs);
      });
      await Promise.race([Promise.all(tasks), timeout]);
      clearTimeout(timer);
    },
  };
}
