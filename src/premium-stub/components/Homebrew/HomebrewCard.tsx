/* eslint-disable */
// Stub público — escrito à mão. Ver src/premium-stub/_inert.tsx.
import CategoryIcon from '@mui/icons-material/Category';

const FALLBACK = { label: '', color: '#757575', Icon: CategoryIcon };

// HomebrewsBanner faz `const meta = HOMEBREW_TYPE_META[hb.type]` sem optional
// chaining e logo em seguida `const { Icon } = meta`. Um objeto vazio quebraria
// no destructuring, então o Proxy responde qualquer chave.
export const HOMEBREW_TYPE_META = new Proxy(
  {},
  { get: () => FALLBACK }
) as Record<string, typeof FALLBACK>;
