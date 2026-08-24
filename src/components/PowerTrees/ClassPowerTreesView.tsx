import React, { useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import type { ClassDescription } from '../../interfaces/Class';
import type { PowerNodeKind } from '../../functions/powerTree';
import {
  buildClassPowerGraph,
  collectAncestors,
  collectDescendants,
} from '../../functions/powerTree';
import { getPowerTreeLabel, sortRootNames } from '../../data/powerTreeLabels';
import { dataRegistry } from '../../data/registry';
import { SupplementId } from '../../types/supplement.types';
import PowerTreeCanvas from './PowerTreeCanvas';
import PowerDetailDrawer from './PowerDetailDrawer';
import PowerNodeCard from './PowerNodeCard';
import { getNodeKindMeta } from './powerNodeStyle';

interface ClassPowerTreesViewProps {
  classe: ClassDescription;
  /** Mesmos suplementos escolhidos na enciclopédia, para resolver poderes gerais. */
  supplements: SupplementId[];
}

/** Chave da seção de avulsos no mesmo conjunto que guarda as árvores abertas. */
const STANDALONE_SECTION = '__avulsos__';

const ZOOM_STEP = 0.125;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.25;

const KIND_LEGEND: PowerNodeKind[] = [
  'power',
  'ability',
  'abilityOption',
  'general',
  'external',
];

/**
 * As linhas de progressão de UMA classe, desenhadas.
 *
 * Mora dentro da linha da classe na enciclopédia, como uma segunda leitura da
 * mesma lista de poderes que a view de texto mostra — por isso não traz
 * seletor de classe nem filtro de suplemento: quem escolhe os dois é a tabela.
 */
const ClassPowerTreesView: React.FC<ClassPowerTreesViewProps> = ({
  classe,
  supplements,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  // Só a maior árvore abre sozinha: uma classe tem até 11 delas mais dezenas de
  // poderes avulsos, e despejar tudo de uma vez é rolagem, não leitura.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    setZoom(isMobile ? 0.75 : 1);
  }, [isMobile]);

  const generalPowers = useMemo(
    () => dataRegistry.getAllPowersBySupplements(supplements),
    [supplements]
  );

  const graph = useMemo(
    () => buildClassPowerGraph({ classe, generalPowers }),
    [classe, generalPowers]
  );

  useEffect(() => {
    setSelectedNodeId(null);
    setOpenSections(new Set(graph.clusters[0] ? [graph.clusters[0].id] : []));
  }, [graph]);

  const toggleSection = (id: string) => {
    setOpenSections((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedNode = selectedNodeId
    ? graph.nodes[selectedNodeId] ?? null
    : null;

  const highlightedIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    return new Set<string>([
      selectedNodeId,
      ...collectAncestors(graph, selectedNodeId),
      ...collectDescendants(graph, selectedNodeId),
    ]);
  }, [graph, selectedNodeId]);

  const empty = new Set<string>();

  if (graph.clusters.length === 0 && graph.standaloneIds.length === 0) {
    return (
      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
        {classe.name} não tem poderes próprios nos suplementos selecionados.
      </Typography>
    );
  }

  return (
    <Box>
      <Stack
        direction='row'
        spacing={1}
        sx={{
          mb: 2,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
          {graph.stats.totalPowers} poderes · {graph.clusters.length}{' '}
          {graph.clusters.length === 1 ? 'árvore' : 'árvores'} ·{' '}
          {graph.stats.powersInClusters} em cadeias ·{' '}
          {graph.stats.standalonePowers} avulsos
        </Typography>

        <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
          <Tooltip title='Diminuir'>
            <span>
              <IconButton
                size='small'
                disabled={zoom <= ZOOM_MIN}
                onClick={() =>
                  setZoom((current) => Math.max(ZOOM_MIN, current - ZOOM_STEP))
                }
                aria-label='Diminuir zoom'
              >
                <ZoomOutIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
          <Typography
            variant='caption'
            sx={{ minWidth: 40, textAlign: 'center' }}
          >
            {Math.round(zoom * 100)}%
          </Typography>
          <Tooltip title='Aumentar'>
            <span>
              <IconButton
                size='small'
                disabled={zoom >= ZOOM_MAX}
                onClick={() =>
                  setZoom((current) => Math.min(ZOOM_MAX, current + ZOOM_STEP))
                }
                aria-label='Aumentar zoom'
              >
                <ZoomInIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title='Tamanho original'>
            <IconButton
              size='small'
              onClick={() => setZoom(1)}
              aria-label='Restaurar zoom'
            >
              <CenterFocusStrongIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {graph.clusters.map((cluster) => {
        const entradas = sortRootNames(
          cluster.rootIds.length > 0 ? cluster.rootIds : cluster.nodeIds
        );
        const nomeCurado = getPowerTreeLabel(cluster.rootIds);
        // Entrada única se identifica pelo próprio nome; várias entradas usam o
        // nome coletivo quando existe e, quando não, aparecem por extenso.
        const titulo = nomeCurado ?? entradas.join(' · ');
        return (
          <Accordion
            key={cluster.id}
            expanded={openSections.has(cluster.id)}
            onChange={() => toggleSection(cluster.id)}
            disableGutters
            slotProps={{ transition: { unmountOnExit: true } }}
            sx={{ mb: 1, '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box>
                <Typography
                  sx={{
                    fontFamily: 'Tfont, serif',
                    fontWeight: 600,
                    color: 'primary.main',
                  }}
                >
                  {titulo}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {cluster.nodeIds.length} poderes · {cluster.edges.length}{' '}
                  {cluster.edges.length === 1 ? 'ligação' : 'ligações'}
                  {nomeCurado && ` · entradas: ${entradas.join(', ')}`}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <PowerTreeCanvas
                cluster={cluster}
                graph={graph}
                selectedId={selectedNodeId}
                highlightedIds={highlightedIds}
                matchedIds={empty}
                zoom={zoom}
                onSelect={setSelectedNodeId}
              />
            </AccordionDetails>
          </Accordion>
        );
      })}

      {graph.standaloneIds.length > 0 && (
        <Accordion
          expanded={openSections.has(STANDALONE_SECTION)}
          onChange={() => toggleSection(STANDALONE_SECTION)}
          disableGutters
          slotProps={{ transition: { unmountOnExit: true } }}
          sx={{ mt: 2, '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box>
              <Typography sx={{ fontFamily: 'Tfont, serif', fontWeight: 600 }}>
                Poderes avulsos
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {graph.standaloneIds.length} poderes que não exigem nem
                destravam outro
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(208px, 1fr))',
                gap: 1.5,
              }}
            >
              {graph.standaloneIds.map((id) => (
                <PowerNodeCard
                  key={id}
                  node={graph.nodes[id]}
                  height={68}
                  selected={selectedNodeId === id}
                  related={false}
                  matched={false}
                  dimmed={false}
                  onSelect={setSelectedNodeId}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      <Stack
        direction='row'
        sx={{
          flexWrap: 'wrap',
          gap: 2,
          mt: 3,
          color: 'text.secondary',
          fontSize: '0.8rem',
        }}
      >
        {KIND_LEGEND.map((kind) => {
          const meta = getNodeKindMeta(kind, theme);
          return (
            <Tooltip key={kind} title={meta.description}>
              <Stack
                direction='row'
                spacing={0.75}
                sx={{ alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: meta.color,
                  }}
                />
                <span>{meta.label}</span>
              </Stack>
            </Tooltip>
          );
        })}
        <Stack direction='row' spacing={0.75} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 22,
              borderTop: '2px dashed',
              borderColor: 'text.secondary',
            }}
          />
          <span>caminho alternativo (OU)</span>
        </Stack>
      </Stack>

      {/* Só montado quando há seleção: o painel do desktop é um Drawer
          persistente, e o paper dele fica fora da tela mesmo fechado. Dentro
          da célula da tabela isso soma na largura do documento e a página
          inteira passa a rolar de lado. */}
      {selectedNode && (
        <PowerDetailDrawer
          node={selectedNode}
          graph={graph}
          onClose={() => setSelectedNodeId(null)}
          onNavigate={setSelectedNodeId}
        />
      )}
    </Box>
  );
};

export default ClassPowerTreesView;
