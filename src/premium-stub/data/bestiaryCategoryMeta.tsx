/* eslint-disable */
// Stub público — escrito à mão. Ver src/premium-stub/_inert.tsx.
import CategoryIcon from '@mui/icons-material/Category';

// BestiaryBanner faz `const CatIcon = meta.icon` e renderiza `<CatIcon />`.
// `icon` precisa ser um componente React válido — undefined derruba a home.
export const getCategoryMeta = () => ({
  icon: CategoryIcon,
  color: '#757575',
});
