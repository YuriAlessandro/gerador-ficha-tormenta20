import fs from 'fs';
import path from 'path';

// Contrato MÍNIMO do contexto de plugin do rollup — só o que este plugin usa.
// Não dá para importar `PluginContext` do rollup: o vitest embute a própria
// cópia de vite+rollup, e as duas `PluginContext` são símbolos incompatíveis
// (`moduleIds` só existe numa delas). Exigindo de menos, os dois contextos
// reais satisfazem este tipo.
type StubResolverContext = {
  resolve(
    source: string,
    importer: string | undefined,
    options: { skipSelf: boolean }
  ): Promise<{ id: string } | null>;
  error(message: string): never;
};

// O submódulo premium é privado. Sem ele (clone sem --recurse-submodules, ou
// contribuidor sem acesso ao repo), o diretório existe mas fica vazio.
// VITE_NO_PREMIUM=1 força o mesmo caminho mesmo com o submódulo presente,
// para conferir se o build público continua de pé.
export function isPremiumAvailable(rootDir: string): boolean {
  return (
    process.env.VITE_NO_PREMIUM !== '1' &&
    fs.existsSync(path.join(rootDir, 'src/premium', 'index.ts'))
  );
}

// Redireciona qualquer import que caia dentro de src/premium para o stub
// público em src/premium-stub. Trabalha sobre o caminho absoluto já resolvido,
// então cobre tanto `@/premium/...` quanto os `../premium/...` relativos dos
// barrels em src/services — nenhum arquivo de src/ precisa ser editado.
//
// Compartilhado por vite.config.ts e vitest.config.ts: sem ele no vitest, um
// PR de fork (que não consegue clonar o submódulo privado) quebra na coleta
// com "Failed to resolve import ../premium/...".
// Sem anotar o retorno como `Plugin` de propósito: o vitest embute a própria
// cópia do vite, e os dois `Plugin` são símbolos distintos apesar da forma
// idêntica. O tipo inferido do literal é aceito estruturalmente pelos dois.
export function premiumStubPlugin(rootDir: string) {
  const PREMIUM_DIR = path.resolve(rootDir, 'src/premium');
  const PREMIUM_STUB_DIR = path.resolve(rootDir, 'src/premium-stub');

  return {
    name: 'premium-stub',
    enforce: 'pre' as const,
    async resolveId(
      this: StubResolverContext,
      source: string,
      importer: string | undefined
    ) {
      // O plugin `vite:alias` roda antes dos plugins `enforce: 'pre'`, então o
      // alias `@` já chega aqui expandido para caminho absoluto. Por isso as
      // três formas precisam ser tratadas.
      const [spec, query = ''] = source.split(/(?=\?)/, 2);
      let abs: string | null = null;
      if (spec === '@/premium' || spec.startsWith('@/premium/')) {
        abs = path.resolve(rootDir, 'src', spec.slice(2));
      } else if (path.isAbsolute(spec)) {
        abs = spec;
      } else if (/^\.{1,2}\//.test(spec) && importer) {
        abs = path.resolve(path.dirname(importer), spec);
      }
      if (!abs) return null;
      if (abs !== PREMIUM_DIR && !abs.startsWith(PREMIUM_DIR + path.sep))
        return null;

      const rel = path.relative(PREMIUM_DIR, abs);
      const target =
        (rel ? path.join(PREMIUM_STUB_DIR, rel) : PREMIUM_STUB_DIR) + query;
      const resolved = await this.resolve(target, importer, { skipSelf: true });
      if (!resolved) {
        this.error(
          `[premium-stub] falta stub para "${source}" (esperado em ${path.relative(
            rootDir,
            target
          )}). Adicione o módulo em src/premium-stub/.`
        );
      }
      return resolved;
    },
  };
}
