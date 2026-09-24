import React from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '@mui/material/styles';
import { SAFE_AREA_TOP } from '../theme/safeArea';

/**
 * Faixa opaca que pinta a área da status bar no PWA do iOS.
 *
 * Com `apple-mobile-web-app-status-bar-style: black-translucent` (index.html) o
 * app fica edge-to-edge e passa a ser dono dos pixels sob a status bar. Sem
 * isso quem pinta aquela faixa é o iOS, com um efeito translúcido que amostra
 * (às vezes um frame velho do) conteúdo e aparece como um borrão.
 *
 * Neste modo o iOS desenha o relógio e os ícones sempre em BRANCO, sem deixar
 * escolher — então a faixa precisa ser escura o bastante. A cor base é a cor da
 * marca/acento (a mesma da navbar); acentos claros demais para texto branco
 * caem num cinza neutro escuro.
 *
 * Vai em portal para o `body` e com z-index acima de tudo: o topo real da pilha
 * é o canvas 3D de dados (99999) e seu spinner (100000).
 *
 * Fora do PWA `env(safe-area-inset-top)` vale `0px` e a faixa tem altura zero —
 * é inerte no desktop e no navegador.
 */

const SCRIM_Z_INDEX = 2147483000;

/** Abaixo disto, texto branco em cima da faixa deixa de ser legível. */
const MIN_CONTRAST_WITH_WHITE = 3;

const FALLBACK_DARK = '#212121';

const relativeLuminance = (hex: string): number => {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!parsed) return 0;

  const channel = (component: string): number => {
    const value = parseInt(component, 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel(parsed[1]) +
    0.7152 * channel(parsed[2]) +
    0.0722 * channel(parsed[3])
  );
};

const contrastWithWhite = (hex: string): number =>
  1.05 / (relativeLuminance(hex) + 0.05);

const SafeAreaScrim: React.FC = () => {
  const theme = useTheme();

  /* No tema escuro `primary.main` é a variante CLARA do acento e `primary.dark`
     é o tom base — então esta expressão devolve a cor da marca nos dois temas,
     mantendo a faixa estável ao alternar claro/escuro. */
  const brandColor =
    theme.palette.mode === 'dark'
      ? theme.palette.primary.dark
      : theme.palette.primary.main;

  const background =
    contrastWithWhite(brandColor) >= MIN_CONTRAST_WITH_WHITE
      ? brandColor
      : FALLBACK_DARK;

  return ReactDOM.createPortal(
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: SAFE_AREA_TOP,
        background,
        pointerEvents: 'none',
        zIndex: SCRIM_Z_INDEX,
      }}
    />,
    document.body
  );
};

export default SafeAreaScrim;
