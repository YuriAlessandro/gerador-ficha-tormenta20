import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CharacterSheet from '@/interfaces/CharacterSheet';
import { recalculateSheet } from '@/functions/recalculateSheet';
import {
  getAgeAttributeTotalsDelta,
  getBaseAgeStageForYears,
} from '@/functions/ages';
import {
  getAgeBracket,
  getRequiredAgeComplications,
} from '@/premium/functions/ages';
import type { AgeComplication, SheetAge } from '@/interfaces/Age';
import { AgeComplicationsStep } from '@/premium/components/Ages';
import AgeField, { AgeSelection } from '@/components/common/AgeField';

interface AgeEditDrawerProps {
  open: boolean;
  onClose: () => void;
  sheet: CharacterSheet;
  onSave: (updatedSheet: CharacterSheet) => void;
  /** Idades Variadas (Heróis de Arton) disponíveis para esta conta. */
  variedAgesAvailable?: boolean;
}

/** Estado de idade da ficha traduzido para o formato do campo de edição. */
function toSelection(sheet: CharacterSheet): AgeSelection {
  return {
    years: sheet.age?.years,
    stage: sheet.age?.stage,
    variedAges: !!sheet.age?.bracket,
    bracket: sheet.age?.bracket,
    deathByOldAge: sheet.optionalRules?.deathByOldAge,
  };
}

/**
 * Edição de idade depois da criação.
 *
 * Cobre as duas regras: o envelhecimento do livro básico, que toda ficha tem, e
 * as Idades Variadas de Heróis de Arton, que o jogador pode ligar aqui se tiver
 * acesso. Vive no repositório aberto justamente porque a primeira não é
 * opcional — sem o submódulo premium, o painel de faixas simplesmente não
 * aparece e o resto continua funcionando.
 *
 * Duas coisas NÃO são recalculadas aqui, de propósito:
 *
 * - **Níveis extras.** `age.extraLevels` é congelado na criação. Reescrever a
 *   progressão inteira (poderes por nível, magias, PV/PM) a partir de uma troca
 *   de faixa etária é destrutivo e imprevisível; o drawer avisa e deixa o ajuste
 *   de nível a cargo do jogador.
 * - **Benefícios de origem.** Virar Criança não desfaz benefícios já escolhidos;
 *   a regra "Sem Origem" vale para quem nasce criança, e desfazê-la aqui
 *   apagaria perícias e poderes que o jogador pode ter em uso.
 *
 * O que É ajustado automaticamente: os modificadores de atributo, aplicados por
 * DELTA (o que a idade nova dá menos o que a antiga dava), pelo mesmo motivo da
 * troca de raça — eles já estão somados em `atributos`. O delta compara TOTAIS,
 * então também cobre ligar ou desligar Idades Variadas numa ficha pronta, em que
 * as duas pontas usam tabelas diferentes.
 */
const AgeEditDrawer: React.FC<AgeEditDrawerProps> = ({
  open,
  onClose,
  sheet,
  onSave,
  variedAgesAvailable = false,
}) => {
  const [selection, setSelection] = useState<AgeSelection>(() =>
    toSelection(sheet)
  );
  const [complications, setComplications] = useState<AgeComplication[]>(
    sheet.age?.complications ?? []
  );

  useEffect(() => {
    if (!open) return;
    setSelection(toSelection(sheet));
    setComplications(sheet.age?.complications ?? []);
  }, [open, sheet.age, sheet.optionalRules?.deathByOldAge]);

  const raceName = sheet.raca?.name;
  const stage =
    selection.stage ?? getBaseAgeStageForYears(selection.years, raceName);
  const bracket = selection.variedAges ? selection.bracket : undefined;
  const required = getRequiredAgeComplications(bracket);
  const selectedBracket = getAgeBracket(bracket);

  const nextAge: SheetAge = {
    years: selection.years,
    stage,
    bracket,
    complications,
    grantedPowerName: sheet.age?.grantedPowerName,
    // Preservado: o nível já foi construído com base nele.
    extraLevels: sheet.age?.extraLevels ?? 0,
  };

  const attributeDelta = getAgeAttributeTotalsDelta(sheet.age, nextAge);

  const levelWarning =
    (selectedBracket?.extraLevels ?? 0) !== (sheet.age?.extraLevels ?? 0);

  const canSave = complications.length === required;

  const handleSave = () => {
    const next = _.cloneDeep(sheet);

    // Delta de atributos: os modificadores da idade são permanentes e já estão
    // somados em `atributos`, então só a diferença entre os totais se aplica.
    attributeDelta.forEach(({ attribute, value }) => {
      next.atributos[attribute].value += value;
    });

    // Idade em branco e sem faixa é o estado "não informado" — a ficha volta a
    // não ter bloco de idade nenhum, como as criadas antes desta regra.
    if (selection.years === undefined && !bracket) {
      delete next.age;
    } else {
      next.age = nextAge;
    }

    const optionalRules = { ...(next.optionalRules ?? {}) };
    if (selection.deathByOldAge) optionalRules.deathByOldAge = true;
    else delete optionalRules.deathByOldAge;
    next.optionalRules =
      Object.keys(optionalRules).length > 0 ? optionalRules : undefined;

    onSave(recalculateSheet(next, sheet));
    onClose();
  };

  const formatMod = (value: number) => (value > 0 ? `+${value}` : `${value}`);

  return (
    <Drawer anchor='right' open={open} onClose={onClose}>
      <Box sx={{ width: { xs: '100vw', sm: 460 }, p: 2 }}>
        <Stack
          direction='row'
          sx={{
            mb: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant='h6'>Idade</Typography>
          <IconButton onClick={onClose} aria-label='Fechar'>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />

        <AgeField
          raceName={raceName}
          classDescription={sheet.classe}
          value={selection}
          onChange={(next) => {
            // Mudar de faixa muda quantas complicações são exigidas; as antigas
            // não sobrevivem à troca.
            if (next.bracket !== selection.bracket) setComplications([]);
            setSelection(next);
          }}
          variedAgesAvailable={variedAgesAvailable || !!sheet.age?.bracket}
        />

        {attributeDelta.length > 0 && (
          <Alert severity='info' sx={{ mt: 2 }}>
            Ao salvar, seus atributos serão ajustados:{' '}
            {attributeDelta
              .map((mod) => `${formatMod(mod.value)} em ${mod.attribute}`)
              .join(', ')}
            .
          </Alert>
        )}

        {levelWarning && (
          <Alert severity='warning' sx={{ mt: 2 }}>
            Os níveis extras concedidos por idade <strong>não</strong> são
            recalculados na edição — reescrever a progressão apagaria escolhas
            já feitas. Se quiser ajustar o nível, use o assistente de evolução
            (ou remova níveis pela ficha).
          </Alert>
        )}

        {required > 0 && bracket && (
          <Box sx={{ mt: 2 }}>
            <AgeComplicationsStep
              bracket={bracket}
              selected={complications}
              onChange={setComplications}
              // Fora da criação não há como conceder o poder de "Já Vi Coisas"
              // sem reabrir o seletor de poderes; a complicação do Adulto passa
              // a ser exigida como nas demais faixas.
              tookOptionalPower
            />
          </Box>
        )}

        <Stack direction='row' spacing={1} sx={{ mt: 3 }}>
          <Button variant='contained' onClick={handleSave} disabled={!canSave}>
            Salvar
          </Button>
          <Button onClick={onClose}>Cancelar</Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default AgeEditDrawer;
