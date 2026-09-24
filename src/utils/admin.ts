/**
 * Ponto único de configuração do acesso administrativo no frontend.
 *
 * Espelha `backend/src/config/admin.ts`: é admin quem tem `isAdmin` no banco
 * (concedido por outro admin na tela de admin) ou quem é o dono da plataforma
 * — este último não depende de flag no banco.
 *
 * Estas checagens são só de UX (mostrar/esconder menu e ações). Quem realmente
 * autoriza é o backend, no `adminMiddleware`.
 */
export const OWNER_EMAIL = (
  import.meta.env.VITE_OWNER_EMAIL || 'yuri.alessandro.m@gmail.com'
).toLowerCase();

/** Campos mínimos necessários para decidir se alguém é admin. */
export interface AdminCheckableUser {
  email?: string | null;
  isAdmin?: boolean;
}

/** Se o email é o do dono da plataforma (comparação case-insensitive). */
export const isOwnerEmail = (email?: string | null): boolean =>
  !!email && email.toLowerCase() === OWNER_EMAIL;

/** Se o usuário tem acesso administrativo (dono ou admin promovido). */
export const isAdminUser = (user?: AdminCheckableUser | null): boolean => {
  if (!user) return false;
  return user.isAdmin === true || isOwnerEmail(user.email);
};
