import React, { useState } from 'react';
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
} from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { Translator } from 't20-sheet-builder';
import tormenta20 from '@/assets/images/tormenta20.jpg';
import { useAuth } from '../../hooks/useAuth';
import { useSheets } from '../../hooks/useSheets';
import { SheetData } from '../../services/sheets.service';
import CharacterLimitIndicator from '../CharacterLimitIndicator';

const MAX_CHARACTERS_LIMIT = 10; // Cloud storage limit

const MyCharactersPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const history = useHistory();
  useAuth(); // Hook needs to be called but user is not used
  const {
    sheets,
    loading,
    error,
    deleteSheet: deleteSheetAction,
    duplicateSheet: duplicateSheetAction,
    clearError,
  } = useSheets();

  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'level'>('date');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [sheetToDelete, setSheetToDelete] = useState<SheetData | null>(null);

  // Separate sheets by type (for now, all are player characters)
  const playerSheets = sheets.filter((sheet) => !sheet.sheetData?.isThreat);
  const threatSheets = sheets.filter((sheet) => sheet.sheetData?.isThreat);

  // Get current tab sheets
  const currentSheets = activeTab === 0 ? playerSheets : threatSheets;

  // Filter and sort sheets
  const filteredSheets = currentSheets
    .filter(
      (sheet) =>
        sheet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sheet.description &&
          sheet.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        case 'level': {
          // Assuming level is in sheetData
          const levelA = a.sheetData?.level || 0;
          const levelB = b.sheetData?.level || 0;
          return levelB - levelA;
        }
        default:
          return 0;
      }
    });

  const handleCreateNewSheet = () => {
    if (activeTab === 0) {
      // Players
      history.push('/ficha-aleatoria');
    } else {
      // Threats
      history.push('/gerador-ameacas');
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setSearchTerm(''); // Clear search when switching tabs
  };

  const handleEditSheet = (sheet: SheetData) => {
    history.push(`/sheet-builder/${sheet.id}`);
  };

  const handleDeleteClick = (sheet: SheetData) => {
    setSheetToDelete(sheet);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!sheetToDelete) return;

    try {
      await deleteSheetAction(sheetToDelete.id);
      setDeleteConfirmOpen(false);
      setSheetToDelete(null);
    } catch (err) {
      // Silently fail - user will see the error from Redux
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setSheetToDelete(null);
  };

  const handleDuplicate = async (sheet: SheetData) => {
    try {
      await duplicateSheetAction(sheet.id);
    } catch (err) {
      // Silently fail - user will see the error from Redux
    }
  };

  const getDescription = (sheet: SheetData) => {
    const parts: string[] = [];
    const { sheetData } = sheet;

    // Race and Class (using Portuguese field names from CharacterSheet)
    if ((sheetData as any).raca?.name) {
      parts.push(Translator.getRaceTranslation((sheetData as any).raca.name));
    }
    if ((sheetData as any).classe?.name) {
      parts.push(Translator.getRoleTranslation((sheetData as any).classe.name));
    }

    // Origin
    if ((sheetData as any).origin?.name) {
      parts.push(
        Translator.getOriginTranslation((sheetData as any).origin.name)
      );
    }

    // Devotion/Deity
    if ((sheetData as any).devoto?.divindade?.name) {
      parts.push(
        `Devoto de ${Translator.getTranslation(
          (sheetData as any).devoto.divindade.name
        )}`
      );
    }

    return parts.join(', ') || 'Personagem de Tormenta 20';
  };

  const getLevel = (sheet: SheetData) => sheet.sheetData?.level || 1;

  const EmptyState = () => {
    const isPlayers = activeTab === 0;
    const Icon = isPlayers ? PersonIcon : ThreatIcon;
    const title = isPlayers
      ? 'Seus Personagens Estão Seguros na Nuvem'
      : 'Suas Ameaças Estão Organizadas na Nuvem';
    const description = isPlayers
      ? 'Você ainda não criou nenhum personagem. Comece agora e suas fichas ficarão sincronizadas em todos os seus dispositivos!'
      : 'Você ainda não criou nenhuma ameaça. Comece agora e tenha suas criaturas sempre organizadas!';
    const buttonText = isPlayers
      ? 'Criar Meu Primeiro Personagem'
      : 'Criar Minha Primeira Ameaça';

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
            <Stack direction='row' spacing={1} alignItems='center'>
              <CharacterLimitIndicator
                current={sheets.length}
                max={MAX_CHARACTERS_LIMIT}
              />
              <Typography variant='body2' color='text.secondary'>
                {sheets.length} de {MAX_CHARACTERS_LIMIT} personagens
              </Typography>
            </Stack>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
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
            <Grid item xs={12} sm={6} md={4} lg={3} key={sheet.id}>
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
                  onClick={() => handleEditSheet(sheet)}
                  sx={{ flexGrow: 1 }}
                >
                  <CardMedia
                    component='img'
                    height='160'
                    image={sheet.image || tormenta20}
                    alt={sheet.name}
                    sx={{
                      objectFit: 'cover',
                    }}
                  />
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

                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Chip
                        label={`Nível ${getLevel(sheet)}`}
                        size='small'
                        color='primary'
                        variant='outlined'
                      />
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

      {/* Delete Confirmation Dialog */}
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
    </Container>
  );
};

export default MyCharactersPage;
