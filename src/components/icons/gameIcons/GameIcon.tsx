/**
 * Renderiza um ícone do catálogo do game-icons.net.
 *
 * Os desenhos vivem em `public/game-icons/<autor>/<nome>.svg`, gerados por
 * `scripts/build-game-icons.mjs`. São buscados sob demanda e cacheados em
 * módulo: uma ficha usa 5-15 ícones, então o custo é de alguns KB, e o bundle
 * JS não cresce um byte — que é o motivo de o catálogo não ser um pacote npm
 * (ícone escolhido em runtime não é tree-shakeable).
 *
 * O conteúdo é embrulhado num `SvgIcon` do MUI de propósito: assim `fontSize`,
 * `color` e `sx` funcionam igual aos ícones do resto do app, que é exatamente
 * o benefício que o cabeçalho de `spellSchoolIcons.tsx` cita ao justificar por
 * que aqueles oito glifos foram inlinados em vez de virem de outra biblioteca.
 */
import React, { useEffect, useState } from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

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

const pathOf = (svgText: string): string | null => {
  const match = svgText.match(/<path\b[^>]*\bd="([^"]+)"/);
  return match ? match[1] : null;
};

export const loadGameIconPath = (
  author: string,
  name: string
): Promise<string | null> => {
  const key = `${author}/${name}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const promise = fetch(`/game-icons/${key}.svg`)
    .then((res) => (res.ok ? res.text() : null))
    .then((text) => (text ? pathOf(text) : null))
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
