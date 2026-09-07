import React from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import NumberField from '@/components/common/NumberField';
import { AgeBracketField } from '@/premium/components/Ages';
import { getAgeBracketForYears } from '@/premium/functions/ages';
import {
  getBaseAgeStageForYears,
  getBaseAgeStages,
  getInitialAgeGroup,
  getMaxLongevityRange,
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
}

/**
 * Idade do personagem — campo único para as duas regras que a governam.
 *
 * O envelhecimento do livro básico (T20, p. 108) NÃO é opcional: toda ficha tem
 * idade, e passar dos marcos de Maduro e Velho aplica modificadores de atributo
 * de verdade. As Idades Variadas de Heróis de Arton (p. 288) entram por cima,
 * atrás de um interruptor, e então substituem esses modificadores pelas suas
 * sete faixas.
 *
 * A idade em ANOS é o dado primário, e tudo mais é derivado dela: digitar 52
 * seleciona sozinho o estágio Maduro e, com Idades Variadas ligadas, a faixa
 * correspondente. É por isso que o campo numérico fica aqui em cima, fora do
 * painel opcional.
 *
 * Mora em "Informações Básicas" porque a idade precisa estar decidida antes de
 * tudo que ela altera: benefícios de origem, complicações de idade e,
 * principalmente, os níveis extras que definem o alvo do assistente de evolução.
 */
const AgeField: React.FC<AgeFieldProps> = ({
  raceName,
  classDescription,
  value,
  onChange,
  variedAgesAvailable = false,
}) => {
  const { years, variedAges, bracket, deathByOldAge } = value;

  const stages = getBaseAgeStages(raceName);
  const stageId = getBaseAgeStageForYears(years, raceName);
  const stage = stages.find((s) => s.id === stageId);

  const initialGroup = getInitialAgeGroup(classDescription);
  const longevity = getMaxLongevityRange(raceName);

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

  const handleRoll = () => setYears(rollInitialAge(classDescription, raceName));

  const toggleVariedAges = (checked: boolean) => {
    onChange({
      ...value,
      variedAges: checked,
      bracket: checked ? getAgeBracketForYears(years, raceName) : undefined,
      // O marcador de Morte por Velhice só existe dentro da regra opcional.
      deathByOldAge: checked ? deathByOldAge : undefined,
    });
  };

  const stageRangeLabel = stage
    ? `${stage.minAge}${
        stage.maxAge === undefined ? '+' : `-${stage.maxAge}`
      } anos`
    : '';

  return (
    <Paper variant='outlined' sx={{ p: 2 }}>
      <Typography variant='subtitle2' sx={{ mb: 0.5 }}>
        Idade
      </Typography>
      <Typography variant='body2' sx={{ color: 'text.secondary', mb: 1.5 }}>
        Não há idade certa para viver aventuras. Conforme envelhecem,
        personagens recebem modificadores de atributo (Tormenta20, p. 108) — e
        os marcos acompanham a longevidade da raça.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
      >
        <NumberField
          size='small'
          label='Idade (anos)'
          min={1}
          value={years ?? null}
          onValueChange={(next) => setYears(next ?? undefined)}
          sx={{ width: 160 }}
          helperText={stage ? `${stage.label} · ${stageRangeLabel}` : undefined}
        />
        <Tooltip
          title={`Idade inicial da classe: ${initialGroup.formula}${
            raceName ? `, ajustado para a longevidade de ${raceName}` : ''
          }`}
        >
          <Button
            size='small'
            variant='outlined'
            startIcon={<CasinoIcon />}
            onClick={handleRoll}
            sx={{ mt: 0.5 }}
          >
            Rolar idade
          </Button>
        </Tooltip>
      </Box>

      <Typography
        variant='caption'
        sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
      >
        Longevidade máxima: cerca de {longevity.minAge} a {longevity.maxAge}{' '}
        anos.
      </Typography>

      {!variedAges && stage && stage.attributeModifiers.length > 0 && (
        <Alert severity='info' sx={{ mt: 1.5 }}>
          <strong>{stage.label}:</strong> {stage.summary}
        </Alert>
      )}

      {variedAgesAvailable && (
        <FormControlLabel
          sx={{ mt: 1, ml: 0 }}
          control={
            <Switch
              size='small'
              checked={!!variedAges}
              onChange={(_e, checked) => toggleVariedAges(checked)}
            />
          }
          label={
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Idades Variadas{' '}
              <Tooltip title='Regra opcional de Heróis de Arton (p. 288): sete faixas etárias com níveis extras, complicações de idade e benefícios de origem alterados. Substitui os modificadores de envelhecimento do livro básico.'>
                <HelpOutlineIcon
                  fontSize='inherit'
                  sx={{ verticalAlign: 'middle' }}
                />
              </Tooltip>
            </Typography>
          }
        />
      )}

      {variedAges && (
        <AgeBracketField
          raceName={raceName}
          bracket={bracket}
          deathByOldAge={deathByOldAge}
          onChange={(next) =>
            onChange({
              ...value,
              bracket: next.bracket,
              // `years` ausente = a mudança não move a idade (ex.: ligar Morte
              // por Velhice); manter o que o jogador digitou.
              years: next.years ?? years,
              stage: getBaseAgeStageForYears(next.years ?? years, raceName),
              deathByOldAge: next.deathByOldAge,
            })
          }
        />
      )}
    </Paper>
  );
};

export default AgeField;
