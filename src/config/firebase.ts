// Re-export from premium module
export {
  auth,
  googleProvider,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from '../premium/config/firebase';

export type { User } from '../premium/config/firebase';

export { default } from '../premium/config/firebase';
