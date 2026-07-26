import { RefObject, useLayoutEffect, useRef, useState } from 'react';

/**
 * Largura real do elemento (`clientWidth`), atualizada a cada resize.
 *
 * O que decide um layout raramente é o viewport: um card dentro de uma coluna
 * de 60% numa tela de 820px tem ~360px úteis, e `useMediaQuery` responde a
 * pergunta errada nesse caso. Isto responde a certa.
 *
 * A primeira medição roda em `useLayoutEffect`, antes do paint, então o render
 * inicial com `0` nunca chega à tela — não há flash de layout. Retorna `0`
 * quando não há elemento (ou em ambiente sem layout, como o jsdom).
 */
export function useContainerWidth<T extends HTMLElement>(): [
  RefObject<T>,
  number
] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const update = () => setWidth(node.clientWidth);
    update();

    // jsdom não implementa ResizeObserver; lá a medição inicial já basta.
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width];
}
