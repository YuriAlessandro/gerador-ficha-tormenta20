import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { User } from 'firebase/auth';
import { Box, CircularProgress, Alert } from '@mui/material';
import Result from '@/components/SheetResult/Result';
import ThreatResult from '@/components/ThreatGenerator/ThreatResult';
import SheetsService from '@/services/sheets.service';
import api, { setEmbedTokenProvider } from '@/services/api';
import { AuthResponse } from '@/services/auth.service';
import { useContentSupplements } from '@/hooks/useContentSupplements';
import { useSheets } from '@/hooks/useSheets';
import CharacterSheet from '@/interfaces/CharacterSheet';
import Bag from '@/interfaces/Bag';
import { ThreatSheet, normalizeThreatSheet } from '@/interfaces/ThreatSheet';
import { dataRegistry } from '@/data/registry';
import { restoreSpellPath } from '@/functions/general';
import { rehydrateSheet } from '@/functions/sheetPayloadOptimizer';
import { SupplementId } from '@/types/supplement.types';
import { AppDispatch } from '@/store';
import { setFirebaseUser, setDbUser } from '@/store/slices/auth/authSlice';
import {
  isOwlbearEmbedded,
  startEmbedBridge,
  waitForToken,
  getEmbedToken,
} from '@/functions/owlbearEmbedBridge';

/**
 * Renderização chrome-less da ficha real para ser embutida dentro do Owlbear
 * Rodeo (extensão Fichas de Nimb). Reusa os renderers completos do app — ficha
 * de personagem (`Result`) ou de ameaça (`ThreatResult`).
 *
 * Fase 2: autenticada. O token do dono é injetado pela extensão (via
 * postMessage / owlbearEmbedBridge), o que habilita o conteúdo do dono
 * (suplementos/homebrews) e a edição/persistência. Quando aberta sem pai
 * (standalone) ou sem token, cai para leitura anônima (Fase 1).
 */
type LoadedContent =
  | { kind: 'player'; sheet: CharacterSheet }
  | { kind: 'threat'; threat: ThreatSheet };

const OwlbearSheetEmbedPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { updateSheet } = useSheets();
  const contentSupplements = useContentSupplements();

  const [content, setContent] = useState<LoadedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const themeParam = new URLSearchParams(location.search).get('theme');
  const isDarkMode = themeParam !== 'light';

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        let ownerUid: string | null = null;
        let ownerSupplements: SupplementId[] | null = null;

        // Autenticação no modo embed: recebe o token da extensão e sincroniza o
        // usuário dono para habilitar conteúdo + edição.
        if (isOwlbearEmbedded()) {
          startEmbedBridge();
          setEmbedTokenProvider(getEmbedToken);
          const token = await waitForToken();
          if (token) {
            try {
              const { data } = await api.post<AuthResponse>('/api/auth/sync');
              const dbUser = data.user;
              ownerUid = dbUser.firebaseUid;
              ownerSupplements = dbUser.enabledSupplements ?? null;
              const synthetic = {
                uid: dbUser.firebaseUid,
                email: dbUser.email,
                emailVerified: true,
                getIdToken: async () => (await getEmbedToken()) ?? '',
              } as unknown as User;
              dispatch(setFirebaseUser(synthetic));
              dispatch(setDbUser(dbUser));
            } catch {
              // Falha no sync → segue como leitura anônima.
            }
          }
        }

        const fullSheet = await SheetsService.getSheetById(id);
        if (!active) return;

        const owner = Boolean(
          ownerUid &&
            fullSheet.ownerFirebaseUid &&
            fullSheet.ownerFirebaseUid === ownerUid
        );
        setIsOwner(owner);

        const rawData = fullSheet.sheetData as unknown as {
          isThreat?: boolean;
        };

        // Ameaças têm renderer próprio (ThreatResult).
        if (rawData?.isThreat) {
          const threat = normalizeThreatSheet(
            fullSheet.sheetData as unknown as ThreatSheet
          );
          if (fullSheet.image) {
            threat.imageUrl = fullSheet.image;
          }
          setContent({ kind: 'threat', threat });
          return;
        }

        // Ficha de personagem.
        const parsedSheet = JSON.parse(
          JSON.stringify(fullSheet.sheetData)
        ) as CharacterSheet;

        // Preferimos os suplementos do DONO (consistente com o que o Result usa
        // internamente após o sync); depois os da própria ficha; por fim os do
        // viewer (anônimo → core).
        let sheetSupplements: SupplementId[];
        if (ownerSupplements && ownerSupplements.length > 0) {
          sheetSupplements = ownerSupplements;
        } else if (
          parsedSheet.usedSupplements &&
          parsedSheet.usedSupplements.length > 0
        ) {
          sheetSupplements =
            parsedSheet.usedSupplements as unknown as SupplementId[];
        } else {
          sheetSupplements = contentSupplements;
        }

        const CLASSES =
          dataRegistry.getClassesWithSupplementInfo(sheetSupplements);
        const restoredSheet = rehydrateSheet(
          parsedSheet as unknown as Record<string, unknown>,
          sheetSupplements
        );
        if (restoredSheet.bag) {
          restoredSheet.bag = new Bag(restoredSheet.bag.equipments || {});
        }
        restoreSpellPath(restoredSheet, CLASSES);

        setContent({ kind: 'player', sheet: restoredSheet });
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Não foi possível carregar a ficha.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (id) run();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSheetUpdate = useCallback(
    async (updated: CharacterSheet) => {
      if (!isOwner || !id) return;
      setContent({ kind: 'player', sheet: updated });
      try {
        await updateSheet(id, {
          sheetData: updated as unknown as Parameters<
            typeof updateSheet
          >[1]['sheetData'],
          name: updated.nome,
          image: updated.imageUrl,
        });
      } catch {
        // Mantém a edição local; o salvamento pode ser tentado novamente.
      }
    },
    [isOwner, id, updateSheet]
  );

  const handleThreatUpdate = useCallback(
    async (updated: ThreatSheet) => {
      if (!isOwner || !id) return;
      setContent({ kind: 'threat', threat: updated });
      try {
        await updateSheet(id, {
          sheetData: updated as unknown as Parameters<
            typeof updateSheet
          >[1]['sheetData'],
          name: updated.name,
        });
      } catch {
        // Mantém a edição local.
      }
    },
    [isOwner, id, updateSheet]
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !content) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity='error'>{error || 'Ficha não encontrada.'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', overflow: 'auto' }}>
      {content.kind === 'threat' ? (
        <ThreatResult
          threat={content.threat}
          viewOnly={!isOwner}
          rollsDisabled={false}
          onThreatUpdate={isOwner ? handleThreatUpdate : undefined}
        />
      ) : (
        <Result
          sheet={content.sheet}
          isDarkMode={isDarkMode}
          onSheetUpdate={isOwner ? handleSheetUpdate : undefined}
        />
      )}
    </Box>
  );
};

export default OwlbearSheetEmbedPage;
