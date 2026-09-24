/**
 * Miniatura esquemática de um layout: regiões e seções como blocos, com as
 * cores e ícones do tema.
 *
 * Existe para a galeria, o importar por código e a página do link — lugares
 * onde não há ficha para renderizar o `Result` de verdade (e montar uma ficha
 * inteira por card seria caro). Também não carrega a imagem de fundo por URL:
 * um preview de terceiro não deve disparar requisição para servidor alheio.
 */
import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  LayoutRegion,
  LayoutSection,
  SheetLayout,
  SheetSectionKind,
  showsOn,
} from '../../../interfaces/SheetLayout';
import { sanitizeSheetLayout } from '../../../functions/sheetLayoutValidation';
import SheetIcon from '../../icons/SheetIcon';
import { resolveLayoutFont } from './layoutTheme';

export const SECTION_KIND_LABELS: Record<SheetSectionKind, string> = {
  identity: 'Identidade',
  attributes: 'Atributos',
  skills: 'Perícias',
  attacks: 'Ataques',
  defense: 'Defesa',
  powers: 'Poderes',
  spells: 'Magias',
  equipment: 'Equipamentos',
  proficiencies: 'Proficiências',
  sizeDisplacement: 'Tamanho e deslocamento',
  partners: 'Parceiros',
  animalCompanions: 'Companheiros',
  journal: 'Diário',
  creationSteps: 'Passo-a-passo',
  supportCta: 'Apoio',
  bugReport: 'Aviso',
  note: 'Anotação',
};

export const TEMPLATE_KIND_LABELS: Record<SheetLayout['template'], string> = {
  tabs: 'Abas',
  single: 'Página única',
  actionMenu: 'Menu de ação',
};

/** Seções de rodapé não dizem nada sobre o design; ficam fora da miniatura. */
const HIDDEN_KINDS = new Set<SheetSectionKind>([
  'supportCta',
  'bugReport',
  'creationSteps',
]);

interface BlockProps {
  section: LayoutSection;
  cardBg?: string;
  titleColor?: string;
}

const Block: React.FC<BlockProps> = ({ section, cardBg, titleColor }) => (
  <Box
    sx={{
      flex: section.width === 'half' ? '1 1 45%' : '1 1 100%',
      minWidth: 0,
      px: 0.75,
      py: 0.5,
      borderRadius: 0.5,
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: cardBg ?? 'background.paper',
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
    }}
  >
    {section.iconKey && (
      <SheetIcon
        iconKey={section.iconKey}
        sx={{ fontSize: 12, color: section.titleColor ?? titleColor }}
      />
    )}
    <Typography
      noWrap
      sx={{
        fontSize: 10,
        lineHeight: 1.4,
        color: section.titleColor ?? titleColor ?? 'text.secondary',
      }}
    >
      {section.title ?? SECTION_KIND_LABELS[section.payload.kind]}
    </Typography>
  </Box>
);

const visibleSections = (region: LayoutRegion) =>
  region.sections.filter((s) => !HIDDEN_KINDS.has(s.payload.kind));

export interface SheetLayoutWireframeProps {
  /** Aceita payload cru: passa pelo saneamento antes de desenhar. */
  layout: unknown;
  height?: number;
}

const SheetLayoutWireframe: React.FC<SheetLayoutWireframeProps> = ({
  layout: raw,
  height = 160,
}) => {
  const layout = sanitizeSheetLayout(raw);
  const { theme } = layout;
  const { cardBackgroundColor: cardBg, titleColor } = theme;
  const accent = theme.accentColor ?? undefined;

  // A miniatura mostra a visão de COMPUTADOR: as cópias "só celular" de uma
  // seção duplicada apareceriam em dobro.
  const regions = layout.regions
    .filter((r) => r.role !== 'footer' && showsOn(r.showOn, 'desktop'))
    .map((r) => ({
      ...r,
      sections: r.sections.filter((s) => showsOn(s.showOn, 'desktop')),
    }));
  const main = regions.filter((r) => r.role === 'main' || r.role === 'header');
  const aside = regions.filter((r) => r.role === 'aside');
  const surfaces = regions.filter((r) => r.role === 'surface');
  const shownSurfaces = surfaces.filter((s) => visibleSections(s).length > 0);

  const blocks = (list: LayoutRegion[]) =>
    list
      .flatMap(visibleSections)
      .map((section) => (
        <Block
          key={section.id}
          section={section}
          cardBg={cardBg}
          titleColor={titleColor}
        />
      ));

  const surfaceStrip = (
    <Stack direction='row' spacing={0.5} sx={{ overflow: 'hidden' }}>
      {shownSurfaces.map((region, i) => (
        <Box
          key={region.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
            px: 0.5,
            borderBottom: '2px solid',
            borderColor: i === 0 ? accent ?? 'primary.main' : 'transparent',
            flexShrink: 0,
          }}
        >
          {region.iconKey && (
            <SheetIcon iconKey={region.iconKey} sx={{ fontSize: 11 }} />
          )}
          <Typography sx={{ fontSize: 10 }}>{region.label}</Typography>
        </Box>
      ))}
    </Stack>
  );

  let body: React.ReactNode;
  if (layout.template === 'actionMenu') {
    body = (
      <Stack spacing={0.5}>
        <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          {blocks(regions.filter((r) => r.role === 'header'))}
        </Stack>
        {shownSurfaces.map((region) => (
          <Box
            key={region.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              px: 0.75,
              py: 0.25,
              borderRadius: 0.5,
              backgroundColor: cardBg ?? 'background.paper',
              borderLeft: '3px solid',
              borderLeftColor: accent ?? 'primary.main',
            }}
          >
            {region.iconKey && (
              <SheetIcon iconKey={region.iconKey} sx={{ fontSize: 12 }} />
            )}
            <Typography noWrap sx={{ fontSize: 10 }}>
              {region.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    );
  } else {
    const firstSurface = shownSurfaces[0];
    body = (
      <Stack direction='row' spacing={0.75} sx={{ height: '100%' }}>
        <Stack
          spacing={0.5}
          sx={{ flex: aside.length ? '1 1 65%' : '1 1 100%', minWidth: 0 }}
        >
          <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {blocks(main)}
          </Stack>
          {layout.template === 'tabs' && shownSurfaces.length > 0 && (
            <>
              {surfaceStrip}
              <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {firstSurface ? blocks([firstSurface]) : null}
              </Stack>
            </>
          )}
          {layout.template === 'single' && (
            <Stack direction='row' sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {blocks(surfaces)}
            </Stack>
          )}
        </Stack>
        {aside.length > 0 && (
          <Stack spacing={0.5} sx={{ flex: '1 1 35%', minWidth: 0 }}>
            {blocks(aside)}
          </Stack>
        )}
      </Stack>
    );
  }

  return (
    <Box
      aria-hidden
      sx={{
        height,
        overflow: 'hidden',
        p: 1,
        borderRadius: 1,
        backgroundColor: 'action.hover',
        fontFamily: resolveLayoutFont(theme.fontFamily),
        position: 'relative',
        // Esmaece o que não coube, em vez de cortar seco.
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 24,
          background: (t) =>
            `linear-gradient(transparent, ${t.palette.action.hover})`,
        },
      }}
    >
      {body}
    </Box>
  );
};

export default SheetLayoutWireframe;
