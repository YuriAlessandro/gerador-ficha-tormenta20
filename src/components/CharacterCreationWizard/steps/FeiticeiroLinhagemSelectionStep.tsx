import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { SupplementId } from '@/types/supplement.types';
import {
  DEUSES_MAIORES,
  DRACONICA_DAMAGE_TYPES,
  FEITICEIRO_HERANCAS,
} from '@/data/systems/tormenta20/classes/arcanista';

export type FeiticeiroLinhagem =
  | 'Linhagem Dracônica'
  | 'Linhagem Feérica'
  | 'Linhagem Rubra'
  | 'Linhagem Abençoada';

interface LinhagemOption {
  value: FeiticeiroLinhagem;
  name: string;
  description: string;
  benefit: string;
  aprimorada?: string;
  superior?: string;
  supplementId?: SupplementId;
}

interface FeiticeiroLinhagemSelectionStepProps {
  selectedLinhagem: FeiticeiroLinhagem | null;
  onChange: (linhagem: FeiticeiroLinhagem) => void;
  activeSupplements?: SupplementId[];
  selectedDeus?: string;
  onDeusChange?: (deus: string) => void;
  // Linhagem Dracônica: tipo de dano. Sem `onDamageTypeChange` o seletor não
  // aparece (o assistente de subir de nível tem o seu próprio).
  selectedDamageType?: string;
  onDamageTypeChange?: (damageType: string) => void;
}

// Linhagens do livro básico
const coreLinhagemOptions: LinhagemOption[] = [
  {
    value: 'Linhagem Dracônica',
    name: 'Linhagem Dracônica',
    description:
      'Um de seus antepassados foi um majestoso dragão. Escolha um tipo de dano entre ácido, eletricidade, fogo ou frio.',
    benefit:
      'Você soma seu Carisma em seus pontos de vida iniciais e recebe redução de dano 5 ao tipo escolhido.',
    aprimorada: FEITICEIRO_HERANCAS['Linhagem Dracônica'].aprimorada,
    superior: FEITICEIRO_HERANCAS['Linhagem Dracônica'].superior,
    supplementId: SupplementId.TORMENTA20_CORE,
  },
  {
    value: 'Linhagem Feérica',
    name: 'Linhagem Feérica',
    description: 'Seu sangue foi tocado pelas fadas.',
    benefit:
      'Você se torna treinado em Enganação e aprende uma magia de 1º círculo de encantamento ou ilusão, arcana ou divina, a sua escolha.',
    aprimorada: FEITICEIRO_HERANCAS['Linhagem Feérica'].aprimorada,
    superior: FEITICEIRO_HERANCAS['Linhagem Feérica'].superior,
    supplementId: SupplementId.TORMENTA20_CORE,
  },
  {
    value: 'Linhagem Rubra',
    name: 'Linhagem Rubra',
    description: 'Seu sangue foi corrompido pela Tormenta.',
    benefit:
      'Você recebe um poder da Tormenta. Além disso, pode perder outro atributo em vez de Carisma por poderes da Tormenta.',
    aprimorada: FEITICEIRO_HERANCAS['Linhagem Rubra'].aprimorada,
    superior: FEITICEIRO_HERANCAS['Linhagem Rubra'].superior,
    supplementId: SupplementId.TORMENTA20_CORE,
  },
];

// Linhagens do suplemento Deuses de Arton
const deusesArtonLinhagemOptions: LinhagemOption[] = [
  {
    value: 'Linhagem Abençoada',
    name: 'Linhagem Abençoada',
    description:
      'Escolha um deus maior. Uma vez feita, essa escolha não pode ser mudada. Você aprende uma magia divina de 1º círculo e pode aprender magias divinas de 1º círculo como magias de feiticeiro.',
    benefit:
      'No 2º nível, você recebe um poder concedido do deus escolhido, aprovado pelo mestre, sem precisar ser devoto dele (mas você ainda pode ser devoto desse ou de outro deus).',
    aprimorada: FEITICEIRO_HERANCAS['Linhagem Abençoada'].aprimorada,
    superior: FEITICEIRO_HERANCAS['Linhagem Abençoada'].superior,
    supplementId: SupplementId.TORMENTA20_DEUSES_ARTON,
  },
];

const FeiticeiroLinhagemSelectionStep: React.FC<
  FeiticeiroLinhagemSelectionStepProps
> = ({
  selectedLinhagem,
  onChange,
  activeSupplements = [],
  selectedDeus,
  onDeusChange,
  selectedDamageType,
  onDamageTypeChange,
}) => {
  // Filtra as opções de linhagem baseado nos suplementos ativos
  const linhagemOptions = useMemo(() => {
    const options = [...coreLinhagemOptions];

    // Adiciona linhagens do suplemento Deuses de Arton se estiver ativo
    if (activeSupplements.includes(SupplementId.TORMENTA20_DEUSES_ARTON)) {
      options.push(...deusesArtonLinhagemOptions);
    }

    return options;
  }, [activeSupplements]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as FeiticeiroLinhagem);
  };

  const handleDeusChange = (deus: string) => {
    if (onDeusChange) {
      onDeusChange(deus);
    }
  };

  const isComplete =
    selectedLinhagem !== null &&
    (selectedLinhagem !== 'Linhagem Abençoada' || selectedDeus) &&
    (selectedLinhagem !== 'Linhagem Dracônica' ||
      !onDamageTypeChange ||
      selectedDamageType);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography
        variant='body1'
        sx={{
          color: 'text.secondary',
        }}
      >
        Como Feiticeiro, seu poder mágico vem de uma linhagem sobrenatural.
        Escolha a origem de seu poder inato:
      </Typography>
      <RadioGroup value={selectedLinhagem || ''} onChange={handleChange}>
        {linhagemOptions.map((option) => (
          <Paper key={option.value} sx={{ p: 2, mb: 2 }}>
            <FormControlLabel
              value={option.value}
              control={<Radio />}
              label={
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography variant='h6'>{option.name}</Typography>
                    {option.supplementId &&
                      option.supplementId !== SupplementId.TORMENTA20_CORE && (
                        <Chip
                          label='Deuses de Arton'
                          size='small'
                          color='secondary'
                          variant='outlined'
                        />
                      )}
                  </Box>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                      marginBottom: '16px',
                    }}
                  >
                    {option.description}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'bold',
                    }}
                  >
                    Benefício Básico:
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'text.secondary',
                    }}
                  >
                    {option.benefit}
                  </Typography>
                  {option.aprimorada && (
                    <>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          mt: 1,
                        }}
                      >
                        Aprimorada:
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {option.aprimorada}
                      </Typography>
                    </>
                  )}
                  {option.superior && (
                    <>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          mt: 1,
                        }}
                      >
                        Superior:
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'text.secondary',
                        }}
                      >
                        {option.superior}
                      </Typography>
                    </>
                  )}
                </Box>
              }
            />

            {/* Tipo de dano da Linhagem Dracônica */}
            {option.value === 'Linhagem Dracônica' &&
              selectedLinhagem === 'Linhagem Dracônica' &&
              onDamageTypeChange && (
                <Box sx={{ mt: 2, ml: 4 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Tipo de Dano</InputLabel>
                    <Select
                      value={selectedDamageType || ''}
                      label='Tipo de Dano'
                      onChange={(e) => onDamageTypeChange(e.target.value)}
                    >
                      {DRACONICA_DAMAGE_TYPES.map((damageType) => (
                        <MenuItem key={damageType} value={damageType}>
                          {damageType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

            {/* Seleção de deus para Linhagem Abençoada */}
            {option.value === 'Linhagem Abençoada' &&
              selectedLinhagem === 'Linhagem Abençoada' && (
                <Box sx={{ mt: 2, ml: 4 }}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Escolha o Deus Maior</InputLabel>
                    <Select
                      value={selectedDeus || ''}
                      label='Escolha o Deus Maior'
                      onChange={(e) => handleDeusChange(e.target.value)}
                    >
                      {DEUSES_MAIORES.map((deus) => (
                        <MenuItem key={deus} value={deus}>
                          {deus}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedDeus && (
                    <Alert severity='info' sx={{ mt: 1 }}>
                      Você escolheu <strong>{selectedDeus}</strong>. No 2º
                      nível, receberá um poder concedido deste deus.
                    </Alert>
                  )}
                </Box>
              )}
          </Paper>
        ))}
      </RadioGroup>
      {isComplete && (
        <Alert severity='success'>
          Linhagem selecionada com sucesso! Você pode continuar para o próximo
          passo.
        </Alert>
      )}
      {!isComplete && selectedLinhagem === 'Linhagem Abençoada' && (
        <Alert severity='warning'>
          Selecione um deus maior para continuar.
        </Alert>
      )}
      {!isComplete && selectedLinhagem !== 'Linhagem Abençoada' && (
        <Alert severity='info'>Selecione uma linhagem para continuar.</Alert>
      )}
    </Box>
  );
};

export default FeiticeiroLinhagemSelectionStep;
