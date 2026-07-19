/* eslint-disable */
// Stub público — escrito à mão. Ver src/premium-stub/_inert.tsx.
import { inertService } from '../_inert';

// AuthContext.tsx:132 e OwlbearAuthBridge.tsx:108 chamam onAuthStateChanged e
// signOut importados do `firebase/auth` REAL, passando este objeto. O firebase
// executa `getModularInstance(auth).onAuthStateChanged(...)`, então `auth`
// precisa cumprir o contrato de Auth — devolver um no-op solto aqui derruba a
// árvore inteira no boot (o AuthProvider fica acima de tudo).
const unsubscribe = () => {};

// Sinaliza "nenhum usuário logado", que é a verdade num build sem backend.
// Assíncrono para imitar o firebase e evitar setState durante o efeito.
const emitSignedOut = (next: unknown) => {
  queueMicrotask(() => {
    if (typeof next === 'function') next(null);
    else if (next && typeof (next as any).next === 'function')
      (next as any).next(null);
  });
  return unsubscribe;
};

export const auth = {
  currentUser: null,
  onAuthStateChanged: (next: unknown) => emitSignedOut(next),
  onIdTokenChanged: (next: unknown) => emitSignedOut(next),
  beforeAuthStateChanged: () => unsubscribe,
  authStateReady: async () => {},
  signOut: async () => {},
  setPersistence: async () => {},
  updateCurrentUser: async () => {},
};

export const googleProvider = {};
export class GoogleAuthProvider {}

export const onAuthStateChanged = (_auth: unknown, next: unknown) =>
  emitSignedOut(next);
export const signOut = async () => {};
export const signInWithPopup = async () => {
  throw new Error(
    'Login indisponível: este build não inclui o módulo premium.'
  );
};
export const updateProfile = async () => {};

export type User = any;

export default inertService();
