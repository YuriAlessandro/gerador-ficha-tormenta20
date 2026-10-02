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
}

export interface LogoutCheckRegistry {
  register: (id: string, check: LogoutCheck) => void;
  unregister: (id: string) => void;
  pendingMessages: () => string[];
  notifyLogout: () => void;
}

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
  };
}
