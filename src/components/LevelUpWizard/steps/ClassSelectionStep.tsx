import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Paper,
  Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { ClassDescription } from '@/interfaces/Class';
import { dataRegistry } from '@/data/registry';
import { SupplementId } from '@/types/supplement.types';
import { getClassLevelsMap } from '@/functions/multiclass';

interface ClassSelectionStepProps {
  simulatedSheet: CharacterSheet;
  supplements: SupplementId[];
  selectedClassName: string;
  selectedClassSubname?: string;
  onClassSelect: (className: string, subname?: string) => void;
  hasAccess: boolean;
  supporterOnly: boolean;
}

const ClassSelectionStep: React.FC<ClassSelectionStepProps> = ({
  simulatedSheet,
  supplements,
  selectedClassName,
  selectedClassSubname,
  onClassSelect,
  hasAccess,
  supporterOnly,
}) => {
  const availableClasses = useMemo(
    () => dataRegistry.getClassesBySupplements(supplements),
    [supplements]
  );

  const currentClassLevels = useMemo(
    () => getClassLevelsMap(simulatedSheet),
    [simulatedSheet]
  );

  const isNewClass = !currentClassLevels.has(selectedClassName);

  // Group classes: current classes first, then others
  const { currentClasses, otherClasses } = useMemo(() => {
    const current: ClassDescription[] = [];
    const other: ClassDescription[] = [];

    availableClasses.forEach((cls) => {
      if (currentClassLevels.has(cls.name)) {
        current.push(cls);
      } else {
        other.push(cls);
      }
    });

    return { currentClasses: current, otherClasses: other };
  }, [availableClasses, currentClassLevels]);

  // Non-supporters can only select current classes; other classes are locked
  const isOtherClassLocked = !hasAccess && supporterOnly;

  const renderClassItem = (cls: ClassDescription, locked: boolean = false) => {
    const classLevel = currentClassLevels.get(cls.name);
    const isSelected =
      cls.name === selectedClassName &&
      (!cls.subname || cls.subname === selectedClassSubname);
    const isCurrent = classLevel !== undefined;

    return (
      <ListItemButton
        key={`${cls.name}-${cls.subname ?? ''}`}
        selected={isSelected}
        disabled={locked}
        onClick={() => !locked && onClassSelect(cls.name, cls.subname)}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'divider',
          opacity: locked ? 0.6 : 1,
        }}
      >
        <ListItemText
          primary={
            <Box display='flex' alignItems='center' gap={1}>
              {locked && <LockIcon fontSize='small' color='disabled' />}
              {!locked && isSelected && (
                <CheckCircleIcon color='primary' fontSize='small' />
              )}
              <Typography variant='body1' fontWeight={isSelected ? 600 : 400}>
                {cls.subname ? `${cls.name} (${cls.subname})` : cls.name}
              </Typography>
              {isCurrent && (
                <Chip
                  label={`Nivel ${classLevel}`}
                  size='small'
                  color='primary'
                  variant='outlined'
                />
              )}
              {cls.isVariant && (
                <Chip
                  label='Variante'
                  size='small'
                  color='secondary'
                  variant='outlined'
                />
              )}
            </Box>
          }
          secondary={
            <Typography variant='caption' color='text.secondary'>
              PV/nivel: +{cls.addpv} | PM/nivel: +{cls.addpm}
              {cls.spellPath ? ' | Conjurador' : ''}
            </Typography>
          }
        />
      </ListItemButton>
    );
  };

  return (
    <Box>
      <Typography variant='subtitle1' gutterBottom fontWeight={600}>
        Escolha a classe para este nivel
      </Typography>

      {isNewClass && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          <strong>Multiclasse:</strong> Voce ganha PV de nivel subsequente (nao
          o PV base), e nao ganha pericias treinadas nem proficiencias da nova
          classe.
        </Alert>
      )}

      {currentClasses.length > 0 && (
        <Paper variant='outlined' sx={{ mb: 2, p: 1 }}>
          <Typography variant='caption' color='text.secondary' sx={{ px: 1 }}>
            Suas classes atuais
          </Typography>
          <List dense disablePadding>
            {currentClasses.map((cls) => renderClassItem(cls))}
          </List>
        </Paper>
      )}

      {isOtherClassLocked && (
        <Alert
          severity='info'
          icon={<LockIcon />}
          sx={{ mb: 2 }}
          action={
            <Button color='inherit' size='small' href='/apoiar' target='_blank'>
              Apoiar o projeto
            </Button>
          }
        >
          Multiclasse é exclusiva para apoiadores do projeto!
        </Alert>
      )}

      <Paper variant='outlined' sx={{ p: 1, maxHeight: 300, overflow: 'auto' }}>
        <Typography variant='caption' color='text.secondary' sx={{ px: 1 }}>
          Outras classes
        </Typography>
        <List dense disablePadding>
          {otherClasses.map((cls) => renderClassItem(cls, isOtherClassLocked))}
        </List>
      </Paper>
    </Box>
  );
};

export default ClassSelectionStep;
