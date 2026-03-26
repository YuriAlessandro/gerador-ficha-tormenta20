/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Container,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Stack,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  CloudDone as CloudIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Person as PersonIcon,
  Dangerous as ThreatIcon,
  Groups as TableIcon,
  CreateNewFolder as CreateNewFolderIcon,
  FolderOpen as FolderOpenIcon,
  DriveFileMove as MoveIcon,
  FolderOff as FolderOffIcon,
} from '@mui/icons-material';
import { useHistory, useLocation } from 'react-router-dom';
import tormenta20 from '@/assets/images/tormenta20.jpg';
import { useAuth } from '../../hooks/useAuth';
import { useSheets } from '../../hooks/useSheets';
import { useFolders } from '../../hooks/useFolders';
import { SheetListData } from '../../services/sheets.service';
import { Folder } from '../../services/folders.service';
import CharacterLimitIndicator from '../CharacterLimitIndicator';
import { useSheetLimit } from '../../hooks/useSheetLimit';
import { useSubscription } from '../../hooks/useSubscription';
import SupporterBadge from '../Premium/SupporterBadge';
import { normalizeSearch } from '../../functions/stringUtils';

// Special filter values
const FOLDER_ALL = '__all__';
const FOLDER_NONE = '__none__';

const MyCharactersPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const history = useHistory();
  const location = useLocation();
  useAuth();
  const {
    sheets,
    loading,
    error,
    deleteSheet: deleteSheetAction,
    duplicateSheet: duplicateSheetAction,
    clearError,
  } = useSheets();
  const {
    folders,
    createFolder: createFolderAction,
    updateFolder: updateFolderAction,
    deleteFolder: deleteFolderAction,
    moveSheetToFolder: moveSheetToFolderAction,
  } = useFolders();
  const { supportLevel } = useSubscription();
  const {
    maxSheets,
    maxMenaceSheets,
    canCreateCharacter,
    canCreateMenace,
    isNearCharacterLimit,
    isNearMenaceLimit,
    remainingCharacterSlots,
    remainingMenaceSlots,
    isCharacterLimitUnlimited,
    isMenaceLimitUnlimited,
  } = useSheetLimit();

  // Get initial tab from URL query param
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'ameacas') return 1;
    return 0;
  };

  const getInitialFolder = () => {
    const params = new URLSearchParams(location.search);
    return params.get('folder') || FOLDER_ALL;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedFolderId, setSelectedFolderId] = useState(getInitialFolder());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'level'>('date');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<SheetListData | null>(
    null
  );

  // Folder management state
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderDialogMode, setFolderDialogMode] = useState<'create' | 'rename'>(
    'create'
  );
  const [folderName, setFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deleteFolderConfirmOpen, setDeleteFolderConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);

  // Move to folder state
  const [moveMenuAnchor, setMoveMenuAnchor] = useState<HTMLElement | null>(
    null
  );
  const [sheetToMove, setSheetToMove] = useState<SheetListData | null>(null);

  // Folder chip context menu state
  const [folderContextAnchor, setFolderContextAnchor] =
    useState<HTMLElement | null>(null);
  const [contextFolder, setContextFolder] = useState<Folder | null>(null);

  // Sync tab with URL on location change (browser back/forward)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    const newTab = tab === 'ameacas' ? 1 : 0;
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
    const folder = params.get('folder') || FOLDER_ALL;
    if (folder !== selectedFolderId) {
      setSelectedFolderId(folder);
    }
  }, [location.search]); // Only depend on location.search, not activeTab/selectedFolderId to avoid loops

  // Separate sheets by type
  const playerSheets = sheets.filter((sheet) => !sheet.sheetData?.isThreat);
  const threatSheets = sheets.filter((sheet) => sheet.sheetData?.isThreat);

  // Get current tab sheets
  const currentSheets = activeTab === 0 ? playerSheets : threatSheets;

  // Count sheets per folder (across both tabs for shared folders)
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    sheets.forEach((sheet) => {
      if (sheet.folderId) {
        counts[sheet.folderId] = (counts[sheet.folderId] || 0) + 1;
      }
    });
    return counts;
  }, [sheets]);

  // Count sheets per folder for current tab only
  const currentTabFolderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    currentSheets.forEach((sheet) => {
      if (sheet.folderId) {
        counts[sheet.folderId] = (counts[sheet.folderId] || 0) + 1;
      }
    });
    return counts;
  }, [currentSheets]);

  // Filter and sort sheets
  const filteredSheets = currentSheets
    .filter((sheet) => {
      // Folder filter
      if (selectedFolderId === FOLDER_NONE) {
        if (sheet.folderId) return false;
      } else if (selectedFolderId !== FOLDER_ALL) {
        if (sheet.folderId !== selectedFolderId) return false;
      }

      // Search filter
      const search = normalizeSearch(searchTerm);
      if (!search) return true;
      return (
        normalizeSearch(sheet.name).includes(search) ||
        (sheet.description &&
          normalizeSearch(sheet.description).includes(search))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case 'level': {
          const dataA = a.sheetData as unknown as { nivel?: number };
          const dataB = b.sheetData as unknown as { nivel?: number };
          const levelA = dataA?.nivel || 0;
          const levelB = dataB?.nivel || 0;
          return levelB - levelA;
        }
        default:
          return 0;
      }
    });

  // URL update helper
  const updateUrl = (tab: number, folder: string) => {
    const tabName = tab === 0 ? 'personagens' : 'ameacas';
    const params = new URLSearchParams();
    params.set('tab', tabName);
    if (folder !== FOLDER_ALL) {
      params.set('folder', folder);
    }
    history.push(`/meus-personagens?${params.toString()}`);
  };

  const handleCreateNewSheet = () => {
    if (activeTab === 0) {
      history.push('/criar-ficha');
    } else {
      history.push('/gerador-ameacas');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchTerm('');
    updateUrl(newValue, selectedFolderId);
  };

  const handleFolderSelect = (folderId: string) => {
    setSelectedFolderId(folderId);
    updateUrl(activeTab, folderId);
  };

  const handleViewSheet = (sheet: SheetListData) => {
    const isThreat = sheet.sheetData?.isThreat;
    if (isThreat) {
      history.push('/threat-view', { cloudThreatId: sheet.id });
    } else {
      history.push(`/ficha/${sheet.id}`);
    }
  };

  const handleEditSheet = (sheet: SheetListData) => {
    const isThreat = sheet.sheetData?.isThreat;
    if (isThreat) {
      history.push('/gerador-ameacas', { cloudThreatId: sheet.id });
    } else {
      history.push('/criar-ficha', { cloudSheet: sheet });
    }
  };

  const handleDeleteClick = (sheet: SheetListData) => {
    setSheetToDelete(sheet);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sheetToDelete) return;
    try {
      await deleteSheetAction(sheetToDelete.id);
      setDeleteConfirmOpen(false);
      setSheetToDelete(null);
    } catch {
      // Silently fail - user will see the error from Redux
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSheetToDelete(null);
  };

  const handleDuplicate = async (sheet: SheetListData) => {
    try {
      await duplicateSheetAction(sheet.id);
    } catch {
      // Silently fail - user will see the error from Redux
    }
  };

  const handleNavigateToTable = (
    e: React.MouseEvent,
    tableId: string
  ): void => {
    e.stopPropagation();
    history.push(`/mesas/${tableId}`);
  };

  // --- Folder CRUD handlers ---
  const handleOpenCreateFolder = () => {
    setFolderDialogMode('create');
    setFolderName('');
    setEditingFolder(null);
    setFolderDialogOpen(true);
  };

  const handleOpenRenameFolder = (folder: Folder) => {
    setFolderDialogMode('rename');
    setFolderName(folder.name);
    setEditingFolder(folder);
    setFolderDialogOpen(true);
    setFolderContextAnchor(null);
    setContextFolder(null);
  };

  const handleFolderDialogConfirm = async () => {
    const trimmed = folderName.trim();
    if (!trimmed) return;

    try {
      if (folderDialogMode === 'create') {
        await createFolderAction(trimmed);
      } else if (editingFolder) {
        await updateFolderAction(editingFolder.id, trimmed);
      }
      setFolderDialogOpen(false);
      setFolderName('');
      setEditingFolder(null);
    } catch {
      // Silently fail
    }
  };

  const handleFolderDialogCancel = () => {
    setFolderDialogOpen(false);
    setFolderName('');
    setEditingFolder(null);
  };

  const handleOpenDeleteFolder = (folder: Folder) => {
    setFolderToDelete(folder);
    setDeleteFolderConfirmOpen(true);
    setFolderContextAnchor(null);
    setContextFolder(null);
  };

  const handleDeleteFolderConfirm = async () => {
    if (!folderToDelete) return;
    try {
      await deleteFolderAction(folderToDelete.id);
      // If we were viewing the deleted folder, go back to "all"
      if (selectedFolderId === folderToDelete.id) {
        handleFolderSelect(FOLDER_ALL);
      }
      setDeleteFolderConfirmOpen(false);
      setFolderToDelete(null);
    } catch {
      // Silently fail
    }
  };

  const handleDeleteFolderCancel = () => {
    setDeleteFolderConfirmOpen(false);
    setFolderToDelete(null);
  };

  // --- Move to folder handlers ---
  const handleOpenMoveMenu = (
    event: React.MouseEvent<HTMLElement>,
    sheet: SheetListData
  ) => {
    setMoveMenuAnchor(event.currentTarget);
    setSheetToMove(sheet);
  };

  const handleMoveToFolder = async (folderId: string | null) => {
    if (!sheetToMove) return;
    try {
      await moveSheetToFolderAction(sheetToMove.id, folderId);
    } catch {
      // Silently fail
    }
    setMoveMenuAnchor(null);
    setSheetToMove(null);
  };

  const handleCloseMoveMenu = () => {
    setMoveMenuAnchor(null);
    setSheetToMove(null);
  };

  // --- Folder chip context menu ---
  const handleFolderChipContext = (
    event: React.MouseEvent<HTMLElement>,
    folder: Folder
  ) => {
    event.preventDefault();
    setFolderContextAnchor(event.currentTarget);
    setContextFolder(folder);
  };

  const handleCloseFolderContext = () => {
    setFolderContextAnchor(null);
    setContextFolder(null);
  };

  const getDescription = (sheet: SheetListData) => {
    const parts: string[] = [];
    const data = sheet.sheetData as any;

    if (data.isThreat) {
      if (data.type) parts.push(data.type);
      if (data.size) parts.push(data.size);
      if (data.role) parts.push(data.role);
      if (data.challengeLevel) parts.push(`ND ${data.challengeLevel}`);
      return parts.length > 0 ? parts.join(', ') : 'Ameaça de Tormenta 20';
    }

    if (data.raca?.name) {
      parts.push(data.raca.name);
    }
    if (
      data.classLevels &&
      Array.isArray(data.classLevels) &&
      data.classLevels.length > 0
    ) {
      const classMap = new Map<string, number>();
      (data.classLevels as { className: string }[]).forEach((cl) => {
        classMap.set(cl.className, (classMap.get(cl.className) ?? 0) + 1);
      });
      if (classMap.size > 1) {
        const classParts = Array.from(classMap.entries()).map(
          ([name, level]) => `${name} ${level}`
        );
        parts.push(classParts.join(' / '));
      } else if (data.classe?.name) {
        parts.push(data.classe.name);
      }
    } else if (data.classe?.name) {
      parts.push(data.classe.name);
    }
    if (data.origin?.name) {
      parts.push(data.origin.name);
    }
    if (data.devoto?.divindade?.name) {
      parts.push(`Devoto de ${data.devoto.divindade.name}`);
    }

    return parts.length > 0 ? parts.join(', ') : 'Personagem de Tormenta 20';
  };

  const getLevel = (sheet: SheetListData) => {
    const data = sheet.sheetData as any;
    if (data?.isThreat) {
      return `ND ${data.challengeLevel || '?'}`;
    }
    return data?.nivel || 1;
  };

  const getFolderName = (folderId: string | null | undefined): string => {
    if (!folderId) return '';
    const folder = folders.find((f) => f.id === folderId);
    return folder?.name || '';
  };

  const EmptyState = () => {
    const isPlayers = activeTab === 0;
    const Icon = isPlayers ? PersonIcon : ThreatIcon;
    const title = isPlayers
      ? 'Seus Personagens Estão Seguros na Nuvem'
      : 'Suas Ameaças Estão Organizadas na Nuvem';
    const description = isPlayers
      ? 'Você ainda não criou nenhum personagem. Comece agora e suas fichas ficarão sincronizadas em todos os seus dispositivos!'
      : 'Você ainda não criou nenhuma ameaça. Comece agora e tenha suas criaturas sempre organizadas!';
    const buttonText = isPlayers ? 'Criar Nova Ficha' : 'Criar Nova Ameaça';

    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
        }}
      >
        <Icon
          sx={{
            fontSize: { xs: 80, md: 120 },
            color: 'text.secondary',
            mb: 2,
          }}
        />
        <Typography
          variant='h4'
          component='h2'
          sx={{
            mb: 2,
            fontFamily: 'Tfont',
            color: 'text.primary',
            fontSize: { xs: '1.8rem', md: '2.5rem' },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}
        >
          {description}
        </Typography>
        <Button
          variant='contained'
          size='large'
          startIcon={<AddIcon />}
          onClick={handleCreateNewSheet}
          sx={{
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
            borderRadius: 2,
          }}
        >
          {buttonText}
        </Button>
      </Box>
    );
  };

  if (loading && sheets.length === 0) {
    return (
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='50vh'
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='flex-start'
          flexWrap='wrap'
          gap={2}
          mb={3}
        >
          <Box>
            <Typography
              variant='h3'
              component='h1'
              sx={{
                fontFamily: 'Tfont',
                fontWeight: 'bold',
                fontSize: { xs: '2rem', md: '3rem' },
                color: 'primary.main',
              }}
            >
              Meus Personagens
            </Typography>
            <Box display='flex' alignItems='center' gap={1} mt={1}>
              <CloudIcon color='success' fontSize='small' />
              <Typography variant='body2' color='text.secondary'>
                Sincronizado com a nuvem
              </Typography>
            </Box>
          </Box>

          <Box
            display='flex'
            flexDirection='column'
            alignItems='flex-end'
            gap={1}
          >
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={handleCreateNewSheet}
              size={isMobile ? 'medium' : 'large'}
              sx={{
                borderRadius: 2,
                px: 3,
              }}
            >
              {(() => {
                const isPlayerTab = activeTab === 0;
                if (isMobile) {
                  return isPlayerTab ? 'Nova Ficha' : 'Nova Ameaça';
                }
                return isPlayerTab ? 'Criar Nova Ficha' : 'Criar Nova Ameaça';
              })()}
            </Button>
            <Stack
              direction='row'
              spacing={2}
              alignItems='center'
              flexWrap='wrap'
            >
              <SupporterBadge
                level={supportLevel}
                variant='small'
                showTooltip={false}
              />
              {activeTab === 0 && !isCharacterLimitUnlimited && (
                <Stack direction='row' spacing={1} alignItems='center'>
                  <CharacterLimitIndicator
                    current={playerSheets.length}
                    max={maxSheets}
                  />
                  <Typography
                    variant='body2'
                    color={
                      isNearCharacterLimit ? 'warning.main' : 'text.secondary'
                    }
                    fontWeight={isNearCharacterLimit ? 'bold' : 'normal'}
                  >
                    {playerSheets.length} de {maxSheets} fichas de personagem
                  </Typography>
                </Stack>
              )}
              {activeTab === 1 && !isMenaceLimitUnlimited && (
                <Stack direction='row' spacing={1} alignItems='center'>
                  <CharacterLimitIndicator
                    current={threatSheets.length}
                    max={maxMenaceSheets}
                  />
                  <Typography
                    variant='body2'
                    color={
                      isNearMenaceLimit ? 'warning.main' : 'text.secondary'
                    }
                    fontWeight={isNearMenaceLimit ? 'bold' : 'normal'}
                  >
                    {threatSheets.length} de {maxMenaceSheets} fichas de ameaças
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {activeTab === 0 &&
            isNearCharacterLimit &&
            canCreateCharacter &&
            !isCharacterLimitUnlimited && (
              <Alert severity='warning' sx={{ mb: 2 }}>
                Você está próximo do limite de {maxSheets} fichas de personagem.
                Restam apenas {remainingCharacterSlots} vaga
                {remainingCharacterSlots !== 1 ? 's' : ''}.
              </Alert>
            )}
          {activeTab === 0 &&
            !canCreateCharacter &&
            !isCharacterLimitUnlimited && (
              <Alert severity='error' sx={{ mb: 2 }}>
                Você atingiu o limite de {maxSheets} fichas de personagem do seu
                apoio. Delete algumas fichas antigas para criar novas.
              </Alert>
            )}
          {activeTab === 1 &&
            isNearMenaceLimit &&
            canCreateMenace &&
            !isMenaceLimitUnlimited && (
              <Alert severity='warning' sx={{ mb: 2 }}>
                Você está próximo do limite de {maxMenaceSheets} fichas de
                ameaça. Restam apenas {remainingMenaceSlots} vaga
                {remainingMenaceSlots !== 1 ? 's' : ''}.
              </Alert>
            )}
          {activeTab === 1 && !canCreateMenace && !isMenaceLimitUnlimited && (
            <Alert severity='error' sx={{ mb: 2 }}>
              Você atingiu o limite de {maxMenaceSheets} fichas de ameaça do seu
              apoio. Delete algumas fichas antigas para criar novas.
            </Alert>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                fontSize: '1rem',
                fontWeight: 500,
                textTransform: 'none',
                minHeight: 48,
              },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition='start'
              label={`Personagens (${playerSheets.length})`}
              sx={{ mr: 2 }}
            />
            <Tab
              icon={<ThreatIcon />}
              iconPosition='start'
              label={`Ameaças (${threatSheets.length})`}
            />
          </Tabs>
        </Box>

        {/* Folder Chips Bar */}
        {folders.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              mb: 2,
              overflowX: 'auto',
              flexWrap: 'nowrap',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: 2,
                backgroundColor: 'action.disabled',
              },
            }}
          >
            <Chip
              label={`Todos (${currentSheets.length})`}
              color={selectedFolderId === FOLDER_ALL ? 'primary' : 'default'}
              variant={selectedFolderId === FOLDER_ALL ? 'filled' : 'outlined'}
              onClick={() => handleFolderSelect(FOLDER_ALL)}
              sx={{ flexShrink: 0 }}
            />
            {folders.map((folder) => {
              const count = currentTabFolderCounts[folder.id] || 0;
              return (
                <Chip
                  key={folder.id}
                  icon={<FolderOpenIcon sx={{ fontSize: '1rem !important' }} />}
                  label={`${folder.name} (${count})`}
                  color={selectedFolderId === folder.id ? 'primary' : 'default'}
                  variant={
                    selectedFolderId === folder.id ? 'filled' : 'outlined'
                  }
                  onClick={() => handleFolderSelect(folder.id)}
                  onContextMenu={(e) => handleFolderChipContext(e, folder)}
                  onDelete={() =>
                    handleFolderChipContext(
                      {
                        currentTarget: document.getElementById(
                          `folder-chip-${folder.id}`
                        ),
                        preventDefault: () => {},
                      } as unknown as React.MouseEvent<HTMLElement>,
                      folder
                    )
                  }
                  deleteIcon={
                    <EditIcon
                      id={`folder-chip-${folder.id}`}
                      sx={{ fontSize: '0.9rem !important' }}
                    />
                  }
                  sx={{ flexShrink: 0 }}
                />
              );
            })}
            <Chip
              label={
                currentSheets.filter((s) => !s.folderId).length > 0
                  ? `Sem pasta (${
                      currentSheets.filter((s) => !s.folderId).length
                    })`
                  : 'Sem pasta'
              }
              icon={<FolderOffIcon sx={{ fontSize: '1rem !important' }} />}
              color={selectedFolderId === FOLDER_NONE ? 'primary' : 'default'}
              variant={selectedFolderId === FOLDER_NONE ? 'filled' : 'outlined'}
              onClick={() => handleFolderSelect(FOLDER_NONE)}
              sx={{ flexShrink: 0 }}
            />
            <Chip
              icon={
                <CreateNewFolderIcon sx={{ fontSize: '1rem !important' }} />
              }
              label='Nova Pasta'
              variant='outlined'
              onClick={handleOpenCreateFolder}
              sx={{ flexShrink: 0 }}
            />
          </Box>
        )}

        {/* Create first folder hint (when no folders exist yet) */}
        {folders.length === 0 && sheets.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip
              icon={
                <CreateNewFolderIcon sx={{ fontSize: '1rem !important' }} />
              }
              label='Criar pasta para organizar'
              variant='outlined'
              onClick={handleOpenCreateFolder}
            />
          </Box>
        )}

        {/* Folder chip context menu */}
        <Menu
          anchorEl={folderContextAnchor}
          open={Boolean(folderContextAnchor)}
          onClose={handleCloseFolderContext}
        >
          <MenuItem
            onClick={() => {
              if (contextFolder) handleOpenRenameFolder(contextFolder);
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>Renomear</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (contextFolder) handleOpenDeleteFolder(contextFolder);
            }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Excluir</ListItemText>
          </MenuItem>
        </Menu>

        {/* Filters and Search */}
        {currentSheets.length > 0 && (
          <Box
            display='flex'
            gap={2}
            flexWrap='wrap'
            alignItems='center'
            mb={3}
          >
            <TextField
              placeholder={
                activeTab === 0 ? 'Buscar personagens...' : 'Buscar ameaças...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size='small'
              sx={{ minWidth: 250, flexGrow: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size='small' sx={{ minWidth: 150 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                label='Ordenar por'
                onChange={(e) =>
                  setSortBy(e.target.value as 'name' | 'date' | 'level')
                }
              >
                <MenuItem value='date'>Data</MenuItem>
                <MenuItem value='name'>Nome</MenuItem>
                <MenuItem value='level'>Nível</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}

        {/* Summary */}
        {currentSheets.length > 0 && (
          <Typography variant='body2' color='text.secondary'>
            {filteredSheets.length} de {currentSheets.length}{' '}
            {activeTab === 0 ? 'personagens' : 'ameaças'}
          </Typography>
        )}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity='error' onClose={clearError} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && currentSheets.length === 0 && <EmptyState />}

      {/* Characters Grid */}
      {currentSheets.length > 0 && (
        <Grid container spacing={3}>
          {filteredSheets.map((sheet) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={sheet.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardActionArea
                  onClick={() => handleViewSheet(sheet)}
                  sx={{ flexGrow: 1 }}
                >
                  <CardMedia
                    component='img'
                    height='160'
                    image={
                      sheet.image || sheet.sheetData?.imageUrl || tormenta20
                    }
                    alt={sheet.name}
                    sx={{
                      objectFit: 'cover',
                      objectPosition: 'top',
                    }}
                  />

                  {/* PV/PM Progress Bars */}
                  {!sheet.sheetData?.isThreat && (
                    <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        >
                          PV:{' '}
                          {(sheet.sheetData as any).currentPV ??
                            (sheet.sheetData as any).pv}
                          /{(sheet.sheetData as any).pv}
                        </Typography>
                        <LinearProgress
                          variant='determinate'
                          value={Math.min(
                            (((sheet.sheetData as any).currentPV ??
                              (sheet.sheetData as any).pv) /
                              (sheet.sheetData as any).pv) *
                              100,
                            100
                          )}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            backgroundColor: 'rgba(108,166,81, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.palette.success.main,
                              opacity: 100,
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography
                          variant='caption'
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        >
                          PM:{' '}
                          {(sheet.sheetData as any).currentPM ??
                            (sheet.sheetData as any).pm}
                          /{(sheet.sheetData as any).pm}
                        </Typography>
                        <LinearProgress
                          variant='determinate'
                          value={Math.min(
                            (((sheet.sheetData as any).currentPM ??
                              (sheet.sheetData as any).pm) /
                              (sheet.sheetData as any).pm) *
                              100,
                            100
                          )}
                          sx={{
                            height: 6,
                            borderRadius: 1,
                            backgroundColor: 'rgba(0, 139, 255, 0.2)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.palette.info.main,
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      gutterBottom
                      variant='h6'
                      component='h3'
                      sx={{
                        fontFamily: 'Tfont',
                        fontWeight: 'bold',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {sheet.name}
                    </Typography>

                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                    >
                      {getDescription(sheet)}
                    </Typography>

                    <Stack
                      direction='row'
                      spacing={1}
                      alignItems='center'
                      flexWrap='wrap'
                      useFlexGap
                    >
                      <Chip
                        label={`Nível ${getLevel(sheet)}`}
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
                      {sheet.folderId && (
                        <Chip
                          icon={
                            <FolderOpenIcon
                              sx={{ fontSize: '0.85rem !important' }}
                            />
                          }
                          label={getFolderName(sheet.folderId)}
                          size='small'
                          variant='outlined'
                          sx={{ maxWidth: 140 }}
                        />
                      )}
                      {sheet.assignedTableId && (
                        <Tooltip title='Ir para a mesa'>
                          <Chip
                            icon={<TableIcon />}
                            label={sheet.assignedTableId.name}
                            size='small'
                            color='secondary'
                            variant='filled'
                            onClick={(e) =>
                              handleNavigateToTable(
                                e,
                                // eslint-disable-next-line no-underscore-dangle
                                sheet.assignedTableId!._id
                              )
                            }
                            sx={{
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'secondary.dark',
                              },
                            }}
                          />
                        </Tooltip>
                      )}
                    </Stack>

                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 1, display: 'block' }}
                    >
                      Editado em{' '}
                      {new Date(sheet.updatedAt).toLocaleDateString('pt-BR')}
                    </Typography>
                  </CardContent>
                </CardActionArea>

                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Box>
                    <Tooltip title='Editar'>
                      <IconButton
                        size='small'
                        color='primary'
                        onClick={() => handleEditSheet(sheet)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Duplicar'>
                      <IconButton
                        size='small'
                        onClick={() => handleDuplicate(sheet)}
                      >
                        <DuplicateIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title='Mover para pasta'>
                      <IconButton
                        size='small'
                        onClick={(e) => handleOpenMoveMenu(e, sheet)}
                      >
                        <MoveIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Tooltip title='Excluir'>
                    <IconButton
                      size='small'
                      color='error'
                      onClick={() => handleDeleteClick(sheet)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Move to Folder Menu */}
      <Menu
        anchorEl={moveMenuAnchor}
        open={Boolean(moveMenuAnchor)}
        onClose={handleCloseMoveMenu}
      >
        <MenuItem
          onClick={() => handleMoveToFolder(null)}
          selected={!sheetToMove?.folderId}
        >
          <ListItemIcon>
            <FolderOffIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>Sem pasta</ListItemText>
        </MenuItem>
        {folders.map((folder) => (
          <MenuItem
            key={folder.id}
            onClick={() => handleMoveToFolder(folder.id)}
            selected={sheetToMove?.folderId === folder.id}
          >
            <ListItemIcon>
              <FolderOpenIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>{folder.name}</ListItemText>
            <Typography variant='caption' color='text.secondary' sx={{ ml: 1 }}>
              {folderCounts[folder.id] || 0}
            </Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Delete Sheet Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o personagem{' '}
            <strong>&ldquo;{sheetToDelete?.name}&rdquo;</strong>? Esta ação não
            pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Folder Create/Rename Dialog */}
      <Dialog
        open={folderDialogOpen}
        onClose={handleFolderDialogCancel}
        maxWidth='xs'
        fullWidth
      >
        <DialogTitle>
          {folderDialogMode === 'create' ? 'Nova Pasta' : 'Renomear Pasta'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label='Nome da pasta'
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            inputProps={{ maxLength: 50 }}
            helperText={`${folderName.length}/50 caracteres`}
            sx={{ mt: 1 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && folderName.trim()) {
                handleFolderDialogConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFolderDialogCancel}>Cancelar</Button>
          <Button
            onClick={handleFolderDialogConfirm}
            variant='contained'
            disabled={!folderName.trim()}
          >
            {folderDialogMode === 'create' ? 'Criar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Folder Confirmation Dialog */}
      <Dialog
        open={deleteFolderConfirmOpen}
        onClose={handleDeleteFolderCancel}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>Excluir Pasta</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a pasta{' '}
            <strong>&ldquo;{folderToDelete?.name}&rdquo;</strong>?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
            As fichas dentro desta pasta não serão excluídas, apenas
            desassociadas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteFolderCancel}>Cancelar</Button>
          <Button
            onClick={handleDeleteFolderConfirm}
            color='error'
            variant='contained'
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyCharactersPage;
