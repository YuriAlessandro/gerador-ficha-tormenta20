/**
 * Renderiza um ícone do catálogo do game-icons.net.
 *
 * Os desenhos vêm do jsDelivr, direto do repositório oficial TRAVADO num commit
 * (`GAME_ICONS_COMMIT`, gerado por `scripts/build-game-icons.mjs`): o conteúdo
 * de uma URL nunca muda e o CDN a serve como imutável. São buscados sob demanda
 * e cacheados em módulo: uma ficha usa 5-15 ícones, então o custo é de alguns
 * KB, e o bundle JS não cresce um byte (ícone escolhido em runtime não é
 * tree-shakeable, por isso não é um pacote npm). O service worker guarda o que
 * já foi visto, para o PWA offline (ver `vite.config.ts`).
 *
 * Ícone que não carrega (CDN fora do ar, sem rede) vira ausência: a ficha nunca
 * quebra por causa dele.
 *
 * O conteúdo é embrulhado num `SvgIcon` do MUI de propósito: assim `fontSize`,
 * `color` e `sx` funcionam igual aos ícones do resto do app, que é exatamente
 * o benefício que o cabeçalho de `spellSchoolIcons.tsx` cita ao justificar por
 * que aqueles oito glifos foram inlinados em vez de virem de outra biblioteca.
 */
import React, { useEffect, useState } from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

import { GAME_ICONS_COMMIT } from './credits.generated';

/** Os SVGs gerados têm sempre o viewBox original do game-icons. */
const VIEW_BOX = '0 0 512 512';

/**
 * `path` já resolvido, ou `null` enquanto carrega / quando falhou.
 *
 * Cache em módulo, e não em estado do React: o mesmo ícone aparece em várias
 * seções e o cache tem que ser compartilhado entre elas. Guardar a Promise (e
 * não só o resultado) evita que dez componentes montando juntos disparem dez
 * requisições do mesmo arquivo.
 */
const cache = new Map<string, Promise<string | null>>();

export const GAME_ICONS_CDN = `https://cdn.jsdelivr.net/gh/game-icons/icons@${GAME_ICONS_COMMIT}`;

/**
 * O SVG original tem o quadrado preto de fundo como PRIMEIRO path e o glifo
 * nos demais. Só o glifo interessa, sem `fill`, para herdar `currentColor`.
 * Com um path só, ele já é o glifo.
 */
export const glyphOf = (svgText: string): string | null => {
  const paths = [...svgText.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(
    (m) => m[1]
  );
  if (paths.length === 0) return null;
  if (paths.length === 1) return paths[0];
  return paths.slice(1).join(' ');
};

export const loadGameIconPath = (
  author: string,
  name: string
): Promise<string | null> => {
  const key = `${author}/${name}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const promise = fetch(`${GAME_ICONS_CDN}/${key}.svg`)
    .then((res) => (res.ok ? res.text() : null))
    .then((text) => (text ? glyphOf(text) : null))
    // Ícone que não carrega não pode derrubar a ficha: vira ausência, e quem
    // chama decide o que mostrar no lugar.
    .catch(() => null);

  cache.set(key, promise);
  return promise;
};

/** Só para testes: o cache é de módulo e sobrevive entre casos. */
export const clearGameIconCache = (): void => {
  cache.clear();
};

export interface GameIconProps extends SvgIconProps {
  /** `<autor>/<nome>`, sem o prefixo `gi:`. */
  icon: string;
}

const GameIcon: React.FC<GameIconProps> = ({
  icon,
  fontSize,
  color,
  sx,
  className,
}) => {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    const [author, name] = icon.split('/');
    if (!author || !name) return undefined;

    let alive = true;
    loadGameIconPath(author, name).then((d) => {
      if (alive) setPath(d);
    });

    return () => {
      alive = false;
    };
  }, [icon]);

  return (
    <SvgIcon
      viewBox={VIEW_BOX}
      fontSize={fontSize}
      color={color}
      sx={sx}
      className={className}
    >
      {/* Enquanto carrega o SvgIcon fica vazio, mas ocupa o mesmo espaço —
          é o que impede a lista de menu de saltar quando os ícones chegam. */}
      {path && <path d={path} />}
    </SvgIcon>
  );
};

export default GameIcon;
