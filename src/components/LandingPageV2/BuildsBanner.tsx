import React from 'react';
import ConstructionIcon from '@mui/icons-material/Construction';
import { BuildData } from '../../premium/services/builds.service';
import CommunityBanner, { CommunityItem } from './CommunityBanner';

interface BuildsBannerProps {
  onClickButton: (link: string) => void;
  builds: BuildData[];
  loading?: boolean;
}

const BUILD_ACCENT = '#7c4dff';

const BuildsBanner: React.FC<BuildsBannerProps> = ({
  onClickButton,
  builds,
  loading,
}) => {
  const items: CommunityItem[] = builds.map((build) => ({
    id: build.id,
    title: build.name,
    subtitle: build.isMulticlass ? 'Multiclasse' : build.classe,
    image: build.imageUrl,
    icon: <ConstructionIcon fontSize='inherit' />,
    accentColor: BUILD_ACCENT,
    rating: build.ratings?.average,
    ratingCount: build.ratings?.count,
    author: build.ownerUsername,
    onClick: () => onClickButton(`/build/${build.id}`),
  }));

  return (
    <CommunityBanner
      icon={<ConstructionIcon fontSize='inherit' />}
      title='Builds da Comunidade'
      subtitle='Personagens otimizados e prontos para inspirar a sua próxima ficha'
      gradient='linear-gradient(135deg, #2b1a4a 0%, #4a2d6b 50%, #1f1437 100%)'
      shadowColor='rgba(43, 26, 74, 0.45)'
      exploreLabel='Explorar builds'
      onExplore={() => onClickButton('/builds')}
      createLabel='Criar build'
      onCreate={() => onClickButton('/my-builds')}
      items={items}
      loading={loading}
      emptyText='Ainda não há builds publicadas — compartilhe a primeira!'
    />
  );
};

export default BuildsBanner;
