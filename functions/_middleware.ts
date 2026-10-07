/**
 * Proxy de SEO para crawlers — Cloudflare Pages Function.
 *
 * Substitui o `location /internal-seo-proxy/` do nginx que rodava no Cloud Run
 * (src/premium/devops/nginx.conf). Crawlers de redes sociais e buscadores não
 * executam JavaScript, então receberiam o shell vazio do SPA; em vez disso a
 * requisição é repassada ao backend, que monta o HTML com as meta tags de Open
 * Graph a partir do documento no Mongo.
 *
 * Do outro lado, `backend/src/middleware/crawlerMiddleware.ts` faz a mesma
 * detecção de User-Agent e responde via `seoController.handleCrawlerRequest`.
 * A lista abaixo espelha a de lá — as duas precisam andar juntas.
 *
 * Quais caminhos chegam aqui é decidido por `public/_routes.json`. Sem aquele
 * arquivo, TODA requisição (inclusive de asset estático) invocaria esta Function
 * e passaria a contar na cota do Workers — com ele, assets continuam no caminho
 * estático, que é gratuito e ilimitado.
 */

/**
 * Superfície mínima do contexto de uma Pages Function. O tipo completo vem de
 * `@cloudflare/workers-types`, mas esta Function usa só duas coisas — não vale
 * uma dependência nova só por isso.
 */
interface PagesContext {
  request: Request;
  /** Encaminha para o próximo handler; aqui, sempre o asset estático. */
  next: () => Promise<Response>;
}

const BACKEND_URL = 'https://fichas-backend.fly.dev';

// Espelha CRAWLER_USER_AGENTS em backend/src/middleware/crawlerMiddleware.ts
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'discordbot',
  'slackbot',
  'pinterest',
  'googlebot',
  'bingbot',
  'applebot',
];

// O nginx usava proxy_read_timeout 10s. Mantido: é melhor entregar o SPA do que
// deixar o crawler esperando.
const BACKEND_TIMEOUT_MS = 10_000;

function isCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some((crawler) => ua.includes(crawler));
}

/**
 * O Mapa de Arton também é servido por um subdomínio-máscara, que renderiza o
 * mapa na raiz (`/`). Essa página é pública e precisa ser incorporável por
 * qualquer site, então não pode sair com `X-Frame-Options`.
 *
 * O `public/_headers` resolve o caso por CAMINHO (`/mapadearton*`), mas não sabe
 * casar por host. A saída natural seria uma Transform Rule na zona — e foi o que
 * tentamos primeiro: regras de resposta da zona **não se aplicam** ao tráfego
 * servido pelo Pages (verificado com uma regra de teste que nunca apareceu na
 * resposta). Então o destacamento acontece aqui.
 */
function isMapSubdomain(hostname: string): boolean {
  return hostname.startsWith('mapadearton.');
}

function withoutFrameOptions(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.delete('X-Frame-Options');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const SITEMAP_PATH = '/sitemap.xml';

/**
 * O sitemap é gerado pelo backend (lista os posts publicados do blog) e
 * servido por aqui para QUALQUER User-Agent — não é HTML de crawler.
 *
 * Em falha responde 503, e nunca `next()`: o Pages está em modo SPA, então o
 * "asset estático" de `/sitemap.xml` seria o `index.html` com 200, e o
 * buscador registraria um sitemap inválido em vez de tentar de novo.
 */
async function serveSitemap(): Promise<Response> {
  const unavailable = () =>
    new Response('Sitemap temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': '300', 'Cache-Control': 'no-store' },
    });

  try {
    const upstream = await fetch(`${BACKEND_URL}${SITEMAP_PATH}`, {
      method: 'GET',
      headers: { Accept: 'application/xml' },
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });
    const contentType = upstream.headers.get('Content-Type') ?? '';
    if (!upstream.ok || !contentType.includes('xml')) return unavailable();

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return unavailable();
  }
}

export const onRequest = async (context: PagesContext): Promise<Response> => {
  const { request, next } = context;
  const userAgent = request.headers.get('User-Agent');
  const url = new URL(request.url);
  const onMapSubdomain = isMapSubdomain(url.hostname);

  if (url.pathname === SITEMAP_PATH) {
    return serveSitemap();
  }

  if (!isCrawler(userAgent)) {
    const response = await next();
    return onMapSubdomain ? withoutFrameOptions(response) : response;
  }

  try {
    const upstream = await fetch(`${BACKEND_URL}${url.pathname}${url.search}`, {
      method: 'GET',
      headers: {
        // O backend decide o que renderizar a partir do UA — sem repassar, ele
        // não reconhece o crawler e devolve o SPA.
        'User-Agent': userAgent ?? '',
        Accept: request.headers.get('Accept') ?? 'text/html',
        'X-Forwarded-Proto': 'https',
        'X-Forwarded-Host': url.host,
        'X-Real-IP': request.headers.get('CF-Connecting-IP') ?? '',
      },
      signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
    });

    // Backend fora do ar ou sem conteúdo para a rota: cai no SPA em vez de
    // propagar o erro. Equivale ao `error_page 500 502 503 504 = /index.html`
    // do nginx.
    if (!upstream.ok) {
      return next();
    }

    // As regras do `public/_headers` só valem para assets servidos pelo Pages —
    // uma Response construída aqui não passa por elas. Sem repetir os headers, a
    // resposta ao crawler sairia sem eles, divergindo do que o nginx fazia.
    const crawlerHeaders: Record<string, string> = {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'text/html; charset=utf-8',
      // HTML de crawler é montado a partir de dados que mudam (nome da ficha,
      // bio do perfil). Cache curto no edge mantém o preview atualizado sem
      // martelar o backend quando um link viraliza.
      'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
    };

    if (!onMapSubdomain) {
      crawlerHeaders['X-Frame-Options'] = 'SAMEORIGIN';
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: crawlerHeaders,
    });
  } catch {
    // Timeout, DNS, TLS — qualquer falha degrada para o SPA.
    return next();
  }
};
