import React from 'react';
import { Box, Typography } from '@mui/material';

interface FormattedSpellTextProps {
  description: string;
  formattedDescription?: string;
}

type TextBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'bullet'; text: string };

/** Renderiza `**trecho**` sem HTML cru nem regex frágil. */
function renderInlineFormatting(text: string): React.ReactNode {
  const segments = text.split(/(\*\*[^*]+\*\*)/g);
  if (segments.length === 1) {
    // Destaca rótulo "Nome:" no início de um tópico de lista quando ainda não vem em **
    const colonMatch = text.match(/^([^.:]{2,42}:)\s+([\s\S]+)$/);
    if (colonMatch) {
      return (
        <>
          <strong>{colonMatch[1]}</strong> {colonMatch[2]}
        </>
      );
    }
    return text;
  }

  return segments.map((part, idx) => {
    const key = `${idx}-${part.slice(0, 12)}`;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

/**
 * Quebra uma descrição densa do catálogo TS em tópicos `*` legíveis quando a
 * magia lista sub-efeitos após frases como "escolha um dos efeitos...".
 */
export function parseSpellDescriptionBlocks(
  rawText: string,
  formattedOverride?: string
): TextBlock[] {
  const source = (formattedOverride || rawText || '').trim();
  if (!source) return [];

  // Se já vier estruturada (do mapa Obsidian com `* ` ou `\n\n`), apenas converte linhas.
  if (source.includes('\n')) {
    const blocks: TextBlock[] = [];
    source.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (/^[*•-]\s+/.test(trimmed)) {
        blocks.push({
          kind: 'bullet',
          text: trimmed.replace(/^[*•-]\s+/, ''),
        });
      } else {
        blocks.push({ kind: 'paragraph', text: trimmed });
      }
    });
    return blocks;
  }

  // Fallback heurístico para descrições corridas (ex.: suplementos sem entrada no mapa).
  const triggerRegex =
    /(escolha um dos (?:efeitos|seguintes|modos|tipos)[^.:]*[.:]|efeitos possíveis:|os efeitos são:)/i;
  const triggerMatch = source.match(triggerRegex);
  if (!triggerMatch || triggerMatch.index === undefined) {
    return [{ kind: 'paragraph', text: source }];
  }

  const splitAt = triggerMatch.index + triggerMatch[0].length;
  const intro = source.slice(0, splitAt).trim();
  const rest = source.slice(splitAt).trim();

  // Procura rótulos de efeito como "Chamejar: ..." ou "1. Efeito: ..."
  const labelMatches = Array.from(
    rest.matchAll(/(?:^|\.\s+)([A-ZÁÉÍÓÚÂÊÔÃÕÇ][^.]{1,36}:)\s+/g)
  );

  if (labelMatches.length < 2) {
    return [{ kind: 'paragraph', text: source }];
  }

  const blocks: TextBlock[] = [{ kind: 'paragraph', text: intro }];
  labelMatches.forEach((m, index) => {
    const matchStart = m.index ?? 0;
    const labelStart = rest[matchStart] === '.' ? matchStart + 1 : matchStart;
    const nextMatch = labelMatches[index + 1];
    const end = nextMatch?.index ?? rest.length;
    const itemText = rest.slice(labelStart, end).trim();
    if (itemText) {
      blocks.push({ kind: 'bullet', text: itemText });
    }
  });

  return blocks;
}

/**
 * Renderiza descrição de magia no padrão da biblioteca Obsidian:
 * parágrafos espaçados e efeitos múltiplos separados em tópicos `*` legíveis.
 */
const FormattedSpellText: React.FC<FormattedSpellTextProps> = ({
  description,
  formattedDescription,
}) => {
  const blocks = parseSpellDescriptionBlocks(description, formattedDescription);

  const elements: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = (keyPrefix: number) => {
    if (bulletBuffer.length === 0) return;
    elements.push(
      <Box
        key={`bullets-${keyPrefix}`}
        component='ul'
        sx={{
          pl: 2.5,
          my: 1,
          '& li': {
            mb: 0.75,
            lineHeight: 1.55,
          },
          '& li:last-child': {
            mb: 0,
          },
        }}
      >
        {bulletBuffer.map((item, idx) => (
          <Typography
            key={`${keyPrefix}-${idx}-${item.slice(0, 14)}`}
            component='li'
            variant='body2'
          >
            {renderInlineFormatting(item)}
          </Typography>
        ))}
      </Box>
    );
    bulletBuffer = [];
  };

  blocks.forEach((block, idx) => {
    if (block.kind === 'bullet') {
      bulletBuffer.push(block.text);
    } else {
      flushBullets(idx);
      elements.push(
        <Typography
          key={`p-${idx}-${block.text.slice(0, 14)}`}
          variant='body2'
          sx={{
            mb: 1,
            lineHeight: 1.6,
            '&:last-child': { mb: 0 },
          }}
        >
          {renderInlineFormatting(block.text)}
        </Typography>
      );
    }
  });
  flushBullets(blocks.length);

  return <Box>{elements}</Box>;
};

export default FormattedSpellText;
