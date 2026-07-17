import React from 'react';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import { type BestiaryPublicationData } from '../../premium';
import { getCategoryMeta } from '../../premium/data/bestiaryCategoryMeta';
import CommunityBanner, { CommunityItem } from './CommunityBanner';

interface BestiaryBannerProps {
  onClickButton: (link: string) => void;
  bestiary: BestiaryPublicationData[];
  loading?: boolean;
}

const BestiaryBanner: React.FC<BestiaryBannerProps> = ({
  onClickButton,
  bestiary,
  loading,
}) => {
  const items: CommunityItem[] = bestiary.map((pub) => {
    const meta = getCategoryMeta(pub.category);
    const CatIcon = meta.icon;
    return {
      id: pub.id,
      title: pub.name,
      subtitle: pub.category,
      icon: <CatIcon fontSize='inherit' />,
      accentColor: meta.color,
      rating: pub.ratings?.average,
      ratingCount: pub.ratings?.count,
      author: pub.ownerUsername || undefined,
      onClick: () => onClickButton(`/bestiario/${pub.id}`),
    };
  });

  return (
    <CommunityBanner
      icon={<AutoStoriesIcon fontSize='inherit' />}
      title='Bestiário da Comunidade'
      subtitle='Ameaças criadas e avaliadas por outros mestres, prontas para suas mesas'
      gradient='linear-gradient(135deg, #2e1437 0%, #4a1d2f 50%, #1f2e22 100%)'
      shadowColor='rgba(74, 29, 47, 0.45)'
      exploreLabel='Explorar Bestiário'
      onExplore={() => onClickButton('/bestiario')}
      createLabel='Criar ameaça'
      onCreate={() => onClickButton('/gerador-ameacas')}
      items={items}
      loading={loading}
      emptyText='Ainda não há ameaças publicadas — crie a primeira para o Bestiário!'
    />
  );
};

export default BestiaryBanner;
