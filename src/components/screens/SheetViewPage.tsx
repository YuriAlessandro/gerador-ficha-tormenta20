import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  Container,
  Box,
  Alert,
  CircularProgress,
  Typography,
  Breadcrumbs,
  Link,
  IconButton,
  Snackbar,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ShareIcon from '@mui/icons-material/Share';
import Result from '@/components/SheetResult/Result';
import SheetsService from '@/services/sheets.service';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useSheets } from '@/hooks/useSheets';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Bag from '@/interfaces/Bag';
import { dataRegistry } from '@/data/registry';
import { ClassDescription } from '@/interfaces/Class';

const SheetViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { user, firebaseUser } = useAuth();
  const { updateSheet } = useSheets();

  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage
  useEffect(() => {
    const darkModePref = localStorage.getItem('dkmFdn') === 'true';
    setIsDarkMode(darkModePref);
  }, []);

  useEffect(() => {
    const loadSheet = async () => {
      try {
        setLoading(true);
        setError(null);

        const sheetData = await SheetsService.getSheetById(id);

        // Check if current user is the owner using Firebase UID
        const ownerCheck =
          firebaseUser && sheetData.ownerFirebaseUid
            ? sheetData.ownerFirebaseUid === firebaseUser.uid
            : false;
        setIsOwner(ownerCheck);

        // Extract and restore the character sheet (deep copy to avoid read-only issues)
        const restoredSheet = JSON.parse(
          JSON.stringify(sheetData.sheetData)
        ) as CharacterSheet;

        // Get classes based on user's enabled supplements
        const userSupplements = user?.enabledSupplements || [];
        const CLASSES =
          dataRegistry.getClassesWithSupplementInfo(userSupplements);

        // Restore Bag class methods (same pattern as MainScreen)
        if (restoredSheet.bag) {
          restoredSheet.bag = new Bag(restoredSheet.bag.equipments || {});
        }

        // Restore spellPath functions if the class has spellcasting
        if (restoredSheet.classe?.spellPath) {
          const baseClass = CLASSES.find(
            (c: ClassDescription) => c.name === restoredSheet.classe.name
          );

          if (baseClass?.setup) {
            // For classes with setup functions, recreate spellPath based on class
            const setupClass = baseClass.setup(restoredSheet.classe);
            restoredSheet.classe.spellPath = setupClass.spellPath;
          }
        }

        setSheet(restoredSheet);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error loading sheet:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            'Não foi possível carregar a ficha. Verifique se o ID está correto.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadSheet();
    }
  }, [id, firebaseUser]);

  const handleSheetUpdate = useCallback(
    async (updatedSheet: CharacterSheet) => {
      if (!isOwner || !id) {
        return;
      }

      try {
        // Update sheet in backend
        await updateSheet(id, {
          sheetData: updatedSheet as unknown as Parameters<
            typeof updateSheet
          >[1]['sheetData'],
          name: updatedSheet.nome,
        });

        // Update local state
        setSheet(updatedSheet);

        setSnackbarMessage('Ficha atualizada com sucesso!');
        setSnackbarOpen(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error updating sheet:', err);
        setSnackbarMessage('Erro ao atualizar a ficha.');
        setSnackbarOpen(true);
      }
    },
    [isOwner, id, updateSheet]
  );

  const handleShareClick = () => {
    const url = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setSnackbarMessage('Link copiado para a área de transferência!');
          setSnackbarOpen(true);
        })
        .catch(() => {
          setSnackbarMessage('Não foi possível copiar o link.');
          setSnackbarOpen(true);
        });
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setSnackbarMessage('Link copiado para a área de transferência!');
        setSnackbarOpen(true);
      } catch (err) {
        setSnackbarMessage('Não foi possível copiar o link.');
        setSnackbarOpen(true);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleBreadcrumbClick = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    history.push('/');
  };

  if (loading) {
    return (
      <Container maxWidth='xl'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant='h6' color='text.secondary'>
            Carregando ficha...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !sheet) {
    return (
      <Container maxWidth='xl'>
        <Box sx={{ mt: 4 }}>
          <Alert severity='error' sx={{ mb: 2 }}>
            {error || 'Ficha não encontrada'}
          </Alert>
          <Typography variant='body1' sx={{ mb: 2 }}>
            A ficha que você está procurando não existe ou foi removida.
          </Typography>
          <Link
            href='/'
            onClick={handleBreadcrumbClick}
            sx={{ cursor: 'pointer' }}
          >
            Voltar para a página inicial
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <SEO
        title={`${sheet.nome} - Ficha de Personagem | Fichas de Nimb`}
        description={`${sheet.raca.name} ${sheet.classe.name}${sheet.origin ? `, ${sheet.origin.name}` : ''}. Nível ${sheet.nivel}.`}
        url={`/ficha/${id}`}
      />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Container maxWidth='xl'>
          <Box sx={{ mt: 3, mb: 4, pb: 4 }}>
            {/* Breadcrumbs */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Breadcrumbs aria-label='breadcrumb'>
                <Link
                  color='inherit'
                  href='/'
                  onClick={handleBreadcrumbClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <HomeIcon sx={{ mr: 0.5 }} fontSize='small' />
                  Home
                </Link>
                <Typography color='text.primary'>
                  Ficha de {sheet.nome}
                </Typography>
              </Breadcrumbs>

              {/* Share Button */}
              <IconButton
                onClick={handleShareClick}
                color='primary'
                aria-label='compartilhar ficha'
                title='Compartilhar ficha'
              >
                <ShareIcon />
              </IconButton>
            </Box>

            {/* Permission Info */}
            {!isOwner && (
              <Alert severity='info' sx={{ mb: 2 }}>
                Você está visualizando esta ficha em modo somente leitura.
              </Alert>
            )}

            {/* Sheet Result */}
            <Result
              sheet={sheet}
              isDarkMode={isDarkMode}
              onSheetUpdate={isOwner ? handleSheetUpdate : undefined}
            />
          </Box>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarOpen(false)}
            message={snackbarMessage}
          />
        </Container>
      </Box>
    </>
  );
};

export default SheetViewPage;
