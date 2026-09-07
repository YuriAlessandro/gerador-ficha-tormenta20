import React from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import NumberField from '@/components/common/NumberField';
import { AgeBracketDetails, AgeBracketSelect } from '@/premium/components/Ages';
import { getAgeBracketForYears } from '@/premium/functions/ages';
import {
  getBaseAgeStageForYears,
  getBaseAgeStages,
  getInitialAgeGroup,
  getStageEntryAge,
  rollInitialAge,
} from '@/functions/ages';
import type { AgeBracketId, BaseAgeStageId } from '@/interfaces/Age';
import type { ClassDescription } from '@/interfaces/Class';

export interface AgeSelection {
  years?: number;
  stage?: BaseAgeStageId;
  variedAges?: boolean;
  bracket?: AgeBracketId;
  deathByOldAge?: boolean;
}

interface AgeFieldProps {
  raceName?: string;
  classDescription?: Pick<ClassDescription, 'name' | 'baseClassName'>;
  value: AgeSelection;
  onChange: (next: AgeSelection) => void;
  /** Idades Variadas (Heróis de Arton) disponíveis para esta conta. */
  variedAgesAvailable?: boolean;
  /**
   * Oferecer a rolagem de idade inicial.
   *
   * Só na CRIAÇÃO: a tabela do livro sorteia a idade com que o personagem
   * começa a aventurar-se, e num personagem que já existe isso não é uma
   * pergunta em aberto — sortear a idade dele seria reescrever quem ele é.
   */
  allowRoll?: boolean;
}

/** Altura de um input MUI de tamanho padrão — alinha o botão com os campos. */
const INPUT_HEIGHT = 56;

/**
 * Idade do personagem.
 *
 * Envelhecer é regra padrão: toda ficha tem idade, e passar dos marcos aplica
 * modificadores de atributo. As Idades Variadas de Heróis de Arton são o caso
 * incomum, e por isso ficam recolhidas numa caixa própria, atrás de um
 * interruptor.
 *
 * A idade em ANOS é o dado primário, e a faixa é derivada dela. Mas a leitura
 * inversa também precisa funcionar: sem o seletor de faixa ao lado, os marcos
 * (que mudam com a longevidade da raça) só apareceriam para quem já sabe qual
 * número digitar. Por isso os dois controles ficam lado a lado e se
 * alimentam — digitar a idade move a faixa, escolher a faixa move a idade.
 *
 * Quando Idades Variadas está ligada, o seletor das sete faixas ocupa o LUGAR
 * do seletor de envelhecimento: as duas regras nunca valem juntas, e manter os
 * dois na tela colocaria dois controles disputando o mesmo significado.
 */
const AgeField: React.FC<AgeFieldProps> = ({
  raceName,
  classDescription,
  value,
  onChange,
  variedAgesAvailable = false,
  allowRoll = true,
}) => {
  const { years, variedAges, bracket, deathByOldAge } = value;

  const stages = getBaseAgeStages(raceName);
  const stageId = getBaseAgeStageForYears(years, raceName);
  const stage = stages.find((s) => s.id === stageId);

  /**
   * Toda mudança de idade reprojeta os derivados de uma vez. Recalcular estágio
   * e faixa juntos é o que impede os dois de divergirem — a ficha guarda ambos,
   * e um deles desatualizado aplicaria o modificador errado.
   */
  const setYears = (next: number | undefined) => {
    onChange({
      ...value,
      years: next,
      stage: getBaseAgeStageForYears(next, raceName),
      bracket: variedAges ? getAgeBracketForYears(next, raceName) : undefined,
    });
  };

  const toggleVariedAges = (checked: boolean) => {
    onChange({
      ...value,
      variedAges: checked,
      bracket: checked ? getAgeBracketForYears(years, raceName) : undefined,
      // O marcador de Morte por Velhice só existe dentro da regra opcional.
      deathByOldAge: checked ? deathByOldAge : undefined,
    });
  };

  const stageRangeLabel = (index: number): string => {
    const { minAge, maxAge } = stages[index];
    if (maxAge === undefined) return `${minAge}+ anos`;
    // O primeiro estágio começa em zero, e "0-44 anos" sugere que a idade de um
    // recém-nascido é uma escolha razoável de personagem.
    if (index === 0) return `até ${maxAge} anos`;
    return `${minAge}-${maxAge} anos`;
  };

  const initialGroup = getInitialAgeGroup(classDescription);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <NumberField
          label='Idade'
          min={1}
          value={years ?? null}
          onValueChange={(next) => setYears(next ?? undefined)}
          sx={{ width: 120 }}
        />

        {variedAges ? (
          <AgeBracketSelect
            raceName={raceName}
            bracket={bracket}
            sx={{ minWidth: 220, flex: 1 }}
            onChange={(next) =>
              onChange({
                ...value,
                bracket: next.bracket,
                years: next.years,
                stage: getBaseAgeStageForYears(next.years, raceName),
              })
            }
          />
        ) : (
          <FormControl sx={{ minWidth: 220, flex: 1 }}>
            <InputLabel id='age-stage-label'>Faixa etária</InputLabel>
            <Select
              labelId='age-stage-label'
              label='Faixa etária'
              value={stageId}
              onChange={(e) =>
                setYears(
                  getStageEntryAge(
                    e.target.value as BaseAgeStageId,
                    raceName,
                    classDescription
                  )
                )
              }
            >
              {stages.map((option, index) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label} · {stageRangeLabel(index)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {allowRoll && (
          <Tooltip
            title={`Rolar a idade inicial da classe (${initialGroup.formula})`}
          >
            <Button
              variant='outlined'
              onClick={() =>
                setYears(rollInitialAge(classDescription, raceName))
              }
              sx={{ minWidth: 'auto', height: INPUT_HEIGHT, px: 2 }}
              aria-label='Rolar idade'
            >
              <CasinoIcon />
            </Button>
          </Tooltip>
        )}
      </Box>

      {!variedAges && stage && stage.attributeModifiers.length > 0 && (
        <Alert severity='info' sx={{ mt: 1.5 }}>
          <strong>{stage.label}:</strong> {stage.summary}
        </Alert>
      )}

      {variedAgesAvailable && (
        <Paper variant='outlined' sx={{ p: 1.5, mt: 2 }}>
          <FormControlLabel
            sx={{ ml: 0 }}
            control={
              <Switch
                size='small'
                checked={!!variedAges}
                onChange={(_e, checked) => toggleVariedAges(checked)}
              />
            }
            label={
              <Typography variant='body2'>
                Idades Variadas (Heróis de Arton)
              </Typography>
            }
          />

          {variedAges && (
            <AgeBracketDetails
              bracket={bracket}
              deathByOldAge={deathByOldAge}
              onDeathByOldAgeChange={(next) =>
                onChange({ ...value, deathByOldAge: next })
              }
            />
          )}
        </Paper>
      )}
    </Box>
  );
};

export default AgeField;
