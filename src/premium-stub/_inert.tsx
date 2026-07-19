/* eslint-disable @typescript-eslint/no-explicit-any, react/jsx-no-useless-fragment */
/**
 * Helpers do stub público do módulo premium.
 *
 * Este diretório substitui `src/premium` (submódulo privado) quando ele não
 * está disponível, permitindo que o projeto rode a partir do repositório
 * público apenas. Nada aqui implementa feature alguma: os componentes não
 * renderizam, os serviços rejeitam e os dados são vazios.
 *
 * Ver `premiumStubPlugin` em vite.config.ts para o redirecionamento.
 */
import React from 'react';

export const STUB_MESSAGE =
  'Recurso premium indisponível: este build não inclui o módulo privado.';

/** Componente que não renderiza nada. Usado para toda UI premium. */
export const NullComponent: React.FC<any> = () => null;

/** Provider/context wrapper que apenas repassa os filhos. */
export const PassthroughProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => <>{children}</>;

/** Função sem efeito, para callbacks e registradores. */
export const noop = (): void => undefined;

/** Chamada de serviço que sempre falha — os callers já tratam erro de rede. */
export const rejects = (): Promise<never> =>
  Promise.reject(new Error(STUB_MESSAGE));

/**
 * Para símbolos que nenhum caminho de runtime público alcança (compiladores de
 * homebrew, validadores). Se alguém chegar aqui, é bug de escopo do stub — vale
 * mais falhar alto do que devolver dado falso.
 */
export const unavailable = (): never => {
  throw new Error(STUB_MESSAGE);
};

/**
 * Objeto inerte recursivo: qualquer propriedade acessada devolve outro objeto
 * inerte, e qualquer chamada devolve uma promise rejeitada. Serve para os
 * `default` dos serviços, cujos métodos variam e são sempre assíncronos.
 */
export function inertService(): any {
  const target = function inert() {
    return rejects();
  };
  return new Proxy(target, {
    get(_t, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally')
        return undefined;
      if (prop === Symbol.toPrimitive || prop === Symbol.toStringTag)
        return undefined;
      return inertService();
    },
    apply() {
      return rejects();
    },
  });
}
