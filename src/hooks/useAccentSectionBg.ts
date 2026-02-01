import { useMemo } from 'react';

import sectionBgRed from '@/assets/images/sectionBg/sectionBg.png';
import sectionBgBrown from '@/assets/images/sectionBg/sectionBg_brown.png';
import sectionBgDarkBrown from '@/assets/images/sectionBg/sectionBg_dark-brown.png';
import sectionBgPurple from '@/assets/images/sectionBg/sectionBg_purple.png';
import sectionBgNavy from '@/assets/images/sectionBg/sectionBg_navy.png';
import { AccentColorId } from '@/theme/accentColors';
import { useUserPreferences } from './useUserPreferences';

const sectionBgMap: Record<AccentColorId, string> = {
  red: sectionBgRed,
  brown: sectionBgBrown,
  'dark-brown': sectionBgDarkBrown,
  purple: sectionBgPurple,
  navy: sectionBgNavy,
};

/**
 * Hook that returns the correct sectionBg image based on the current accent color.
 */
export const useAccentSectionBg = (): string => {
  const { accentColor } = useUserPreferences();

  return useMemo(() => {
    if (accentColor && sectionBgMap[accentColor]) {
      return sectionBgMap[accentColor];
    }
    return sectionBgRed;
  }, [accentColor]);
};
