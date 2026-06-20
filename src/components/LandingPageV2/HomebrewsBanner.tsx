import React from 'react';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { Homebrew } from '../../premium/interfaces/Homebrew';
import { HOMEBREW_TYPE_META } from '../../premium/components/Homebrew/HomebrewCard';
import CommunityBanner, { CommunityItem } from './CommunityBanner';

interface HomebrewsBannerProps {
  onClickButton: (link: string) => void;
  homebrews: Homebrew[];
  loading?: boolean;
}

const HomebrewsBanner: React.FC<HomebrewsBannerProps> = ({
  onClickButton,
  homebrews,
  loading,
}) => {
  const items: CommunityItem[] = homebrews.map((hb) => {
    const meta = HOMEBREW_TYPE_META[hb.type];
    const { Icon } = meta;
    return {
      id: hb.id,
      title: hb.name,
      subtitle: meta.label,
      image: hb.imageUrl || hb.coverImage,
      icon: <Icon fontSize='inherit' />,
      accentColor: meta.color,
      rating: hb.ratings?.average,
      ratingCount: hb.ratings?.count,
      author: hb.ownerUsername,
      onClick: () => onClickButton(`/homebrew/${hb.id}`),
    };
  });

  return (
    <CommunityBanner
      icon={<AutoFixHighIcon fontSize='inherit' />}
      title='Homebrews da Comunidade'
      subtitle='Raças, classes, magias e poderes criados pela comunidade — ative e use nas suas fichas'
      gradient='linear-gradient(135deg, #0e3a44 0%, #3a1c4a 50%, #0e3a44 100%)'
      shadowColor='rgba(14, 58, 68, 0.45)'
      exploreLabel='Explorar homebrews'
      onExplore={() => onClickButton('/homebrews')}
      createLabel='Criar homebrew'
      onCreate={() => onClickButton('/meus-homebrews')}
      items={items}
      loading={loading}
      emptyText='Ainda não há homebrews publicados — seja o primeiro a criar o seu!'
    />
  );
};

export default HomebrewsBanner;
