/**
 * Menu de ação: o modelo do app do D&D Beyond.
 *
 * A identidade fica no topo, como em qualquer ficha. Logo abaixo vem a BARRA DE
 * TELA: fixa ao rolar, mostra onde o jogador está (ícone, nome e o que tem
 * dentro) e, tocada, abre o menu de telas ali mesmo, embaixo dela. A ficha
 * sempre abre numa tela, nunca numa lista vazia de conteúdo: é o que o jogador
 * abre a ficha para ver.
 *
 * O MENU NÃO É UM `Dialog`, e isso é a decisão mais importante do arquivo.
 * `Dialog` renderiza em portal para o `document.body`, o que cobriria a tela
 * INTEIRA, e o `Result` roda dentro do widget de ficha do Escudo do Mestre e
 * do `PlayerSheetViewDialog`: um jogador abrindo o menu da própria ficha
 * apagaria a tela do mestre. Ancorado na barra (que é sticky), o menu aparece
 * onde o jogador está olhando, em qualquer container, por mais que ele tenha
 * rolado a ficha.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha, keyframes, useTheme } from '@mui/material/styles';
import AppsIcon from '@mui/icons-material/Apps';
import CloseIcon from '@mui/icons-material/Close';

import { LayoutRegion } from '../../../../interfaces/SheetLayout';
import { safeTop } from '../../../../theme/safeArea';
import SheetIcon from '../../../icons/SheetIcon';
import RegionStack from '../RegionStack';
import { SheetSectionNodeMap } from '../sheetSectionTypes';
import { SheetTemplateProps } from './templateTypes';
import { useSurfaceSelection } from './useSurfaceSelection';

/** Curva de saída forte: resposta imediata ao toque, sem arrastar no fim. */
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

const menuEnter = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.98); }
  to { opacity: 1; transform: none; }
`;

const scrimEnter = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

/** "Ataques, Defesa": o que o jogador encontra ao abrir a tela. */
const describeScreen = (
  region: LayoutRegion,
  nodes: SheetSectionNodeMap
): string =>
  region.sections
    .filter((section) => nodes[section.payload.kind]?.available)
    .map(
      (section) => section.title ?? nodes[section.payload.kind]?.defaultTitle
    )
    .filter(Boolean)
    .join(', ');

interface ScreenTileProps {
  iconKey?: string;
  size: number;
  active?: boolean;
}

/** Ícone da tela num quadrado tingido pela cor de destaque. */
const ScreenTile: React.FC<ScreenTileProps> = ({ iconKey, size, active }) => {
  const theme = useTheme();
  const { main } = theme.palette.primary;
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 1.5,
        color: active ? theme.palette.primary.contrastText : main,
        backgroundColor: active ? main : alpha(main, 0.14),
        transition: `background-color 160ms ${EASE_OUT}, color 160ms ${EASE_OUT}`,
      }}
    >
      <SheetIcon iconKey={iconKey} sx={{ fontSize: size * 0.55 }} />
    </Box>
  );
};

const ActionMenuTemplate: React.FC<SheetTemplateProps> = ({
  layout,
  nodes,
  sheetId,
}) => {
  const theme = useTheme();
  const surfaces = layout.regions.filter((r) => r.role === 'surface');
  // `activeId` já vem da memória quando havia uma: o caso real é o jogador
  // lendo os próprios ataques na mesa e girando o tablet, o que remonta a
  // árvore inteira. Sem isso ele cairia de volta na primeira tela.
  const { activeId, setActiveId } = useSurfaceSelection(
    sheetId,
    layout,
    surfaces
  );
  const [menuOpen, setMenuOpen] = useState(false);

  /** Marco zero-altura logo acima da barra, para onde a troca de tela rola. */
  const anchorRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLButtonElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  const { titleColor } = layout.theme;
  const headerRegions = layout.regions.filter((r) => r.role === 'header');
  const footerRegions = layout.regions.filter((r) => r.role === 'footer');
  const current = surfaces.find((r) => r.id === activeId);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    barRef.current?.focus();
  }, []);

  // Esc fecha, e o foco vai para a tela atual do menu (teclado e leitor de
  // tela começam de onde o jogador está, não do topo da lista).
  useEffect(() => {
    if (!menuOpen) return undefined;
    activeItemRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen, closeMenu]);

  const openScreen = (regionId: string) => {
    setMenuOpen(false);
    barRef.current?.focus();
    if (regionId === activeId) return;
    setActiveId(regionId);
    // Quem troca de tela lá embaixo da anterior cairia no meio da nova. Só
    // rola quando a barra está grudada no topo: com a ficha no começo, a
    // identidade continua à vista.
    const anchor = anchorRef.current;
    const bar = barRef.current;
    if (anchor && bar) {
      const stuck =
        anchor.getBoundingClientRect().top < bar.getBoundingClientRect().top;
      if (stuck) anchor.scrollIntoView?.({ block: 'start' });
    }
  };

  const renderRegions = (regions: LayoutRegion[]) =>
    regions.map((region) => (
      <RegionStack
        key={region.id}
        region={region}
        nodes={nodes}
        titleColor={titleColor}
      />
    ));

  const primary = theme.palette.primary.main;
  const surfaceBg = theme.palette.background.paper;

  return (
    <Box sx={{ position: 'relative' }}>
      {renderRegions(headerRegions)}

      {current && (
        <>
          <div ref={anchorRef} />
          <Box
            sx={{
              position: 'sticky',
              top: safeTop(8),
              zIndex: 3,
              mb: 4,
            }}
          >
            <ButtonBase
              ref={barRef}
              onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
              aria-haspopup='true'
              aria-expanded={menuOpen}
              aria-label={`Trocar de tela (atual: ${current.label})`}
              sx={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                pl: 1,
                pr: 1.5,
                py: 1,
                textAlign: 'left',
                borderRadius: 2,
                backgroundColor: surfaceBg,
                border: '1px solid',
                borderColor: alpha(primary, menuOpen ? 0.5 : 0.18),
                boxShadow: `0 6px 20px ${alpha(
                  theme.palette.common.black,
                  theme.palette.mode === 'dark' ? 0.45 : 0.12
                )}`,
                transition: `transform 140ms ${EASE_OUT}, border-color 160ms ease`,
                '&:active': { transform: 'scale(0.985)' },
                '&.Mui-focusVisible': {
                  outline: `2px solid ${primary}`,
                  outlineOffset: 2,
                },
              }}
            >
              <ScreenTile iconKey={current.iconKey} size={40} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontFamily: 'Tfont',
                    fontSize: '1.15rem',
                    lineHeight: 1.2,
                    color: titleColor ?? 'text.primary',
                  }}
                >
                  {current.label}
                </Typography>
                <Typography
                  noWrap
                  variant='caption'
                  component='div'
                  sx={{ color: 'text.secondary' }}
                >
                  {describeScreen(current, nodes)}
                </Typography>
              </Box>
              <Box
                aria-hidden
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 1.5,
                  color: primary,
                  backgroundColor: alpha(primary, menuOpen ? 0.16 : 0.08),
                  transition: `background-color 160ms ease`,
                }}
              >
                {menuOpen ? <CloseIcon /> : <AppsIcon />}
              </Box>
            </ButtonBase>

            {menuOpen && (
              <Box
                component='nav'
                aria-label='Telas da ficha'
                sx={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  maxHeight: 'min(70vh, 560px)',
                  overflowY: 'auto',
                  overscrollBehavior: 'contain',
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: surfaceBg,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: `0 18px 48px ${alpha(
                    theme.palette.common.black,
                    theme.palette.mode === 'dark' ? 0.6 : 0.2
                  )}`,
                  transformOrigin: 'top center',
                  animation: `${menuEnter} 180ms ${EASE_OUT}`,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                  },
                  // Uma coluna no celular; na ficha larga, a grade aproveita a
                  // largura em vez de uma lista comprida e estreita.
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 0.5,
                }}
              >
                {surfaces.map((region) => {
                  const active = region.id === activeId;
                  return (
                    <ButtonBase
                      key={region.id}
                      ref={active ? activeItemRef : undefined}
                      onClick={() => openScreen(region.id)}
                      aria-current={active ? 'page' : undefined}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        gap: 1.5,
                        p: 1,
                        textAlign: 'left',
                        borderRadius: 1.5,
                        backgroundColor: active
                          ? alpha(primary, 0.1)
                          : 'transparent',
                        transition: `background-color 140ms ease, transform 140ms ${EASE_OUT}`,
                        '@media (hover: hover) and (pointer: fine)': {
                          '&:hover': {
                            backgroundColor: alpha(
                              primary,
                              active ? 0.14 : 0.06
                            ),
                          },
                        },
                        '&:active': { transform: 'scale(0.985)' },
                        '&.Mui-focusVisible': {
                          outline: `2px solid ${primary}`,
                          outlineOffset: -2,
                        },
                      }}
                    >
                      <ScreenTile
                        iconKey={region.iconKey}
                        size={44}
                        active={active}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          noWrap
                          sx={{ fontWeight: 600, lineHeight: 1.3 }}
                        >
                          {region.label}
                        </Typography>
                        <Typography
                          noWrap
                          variant='caption'
                          component='div'
                          sx={{ color: 'text.secondary' }}
                        >
                          {describeScreen(region, nodes)}
                        </Typography>
                      </Box>
                    </ButtonBase>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Cada seção da tela é um card próprio, com a própria barra de
              ações: igual às outras fichas, só que uma tela por vez. */}
          {renderRegions([current])}
        </>
      )}

      {renderRegions(footerRegions)}

      {/* Véu só sobre a área da ficha (ver o comentário do topo). Fica abaixo
          da barra, que continua tocável para fechar. */}
      {menuOpen && (
        <Box
          data-testid='action-menu-scrim'
          onClick={closeMenu}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            backgroundColor: alpha(theme.palette.common.black, 0.35),
            animation: `${scrimEnter} 160ms ease-out`,
            '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
          }}
        />
      )}
    </Box>
  );
};

export default ActionMenuTemplate;
