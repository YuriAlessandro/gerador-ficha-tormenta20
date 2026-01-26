export const SEO_CONFIG = {
  siteName: 'Fichas de Nimb',
  baseUrl: 'https://fichasdenimb.com.br',
  defaultImage:
    'https://raw.githubusercontent.com/YuriAlessandro/gerador-ficha-tormenta20/gh-pages/shareImage.jpg',
  locale: 'pt_BR',

  defaults: {
    title: 'Fichas de Nimb - Plataforma Completa para Tormenta 20',
    description:
      'Plataforma completa para Tormenta 20: gerador de fichas, criador de itens superiores e mágicos, rolador de recompensas, enciclopédia e muito mais.',
  },

  pages: {
    home: {
      title: 'Fichas de Nimb - Plataforma Completa para Tormenta 20',
      description:
        'Plataforma completa para Tormenta 20: gerador de fichas, criador de itens superiores e mágicos, rolador de recompensas, enciclopédia e muito mais.',
    },
    blog: {
      title: 'Blog',
      description:
        'Artigos, dicas e novidades sobre Tormenta 20 e o Fichas de Nimb.',
    },
    database: {
      title: 'Enciclopédia de Tormenta 20',
      description:
        'Consulte raças, classes, origens, divindades, poderes e magias de Tormenta 20.',
    },
    races: {
      title: 'Raças de Tormenta 20',
      description:
        'Todas as raças jogáveis: humano, elfo, anão, lefou, goblin, minotauro e mais.',
    },
    classes: {
      title: 'Classes de Tormenta 20',
      description:
        'Todas as classes: arcanista, bárbaro, bardo, bucaneiro, caçador, cavaleiro, clérigo, druida, guerreiro, inventor, ladino, lutador, nobre, paladino e ranger.',
    },
    origins: {
      title: 'Origens de Tormenta 20',
      description:
        'Todas as origens de personagem: acólito, amigo dos animais, artesão, artista, assistente de laboratório, capanga e mais.',
    },
    deities: {
      title: 'Divindades de Tormenta 20',
      description:
        'Todos os deuses do Panteão: Allihanna, Arsenal, Azgher, Hyninn, Khalmyr, Lena, Marah, Nimb, Oceano, Sszzaas, Tanna-Toh, Tenebra, Thyatis, Valkaria e Wynna.',
    },
    powers: {
      title: 'Poderes de Tormenta 20',
      description:
        'Poderes de combate, concedidos, destino, magia e tormenta para personagens de Tormenta 20.',
    },
    spells: {
      title: 'Magias de Tormenta 20',
      description:
        'Todas as magias arcanas e divinas de Tormenta 20, do 1º ao 5º círculo.',
    },
    rewards: {
      title: 'Rolador de Recompensas',
      description:
        'Gere recompensas aleatórias seguindo as regras oficiais de Tormenta 20.',
    },
    superiorItems: {
      title: 'Criador de Itens Superiores',
      description:
        'Crie itens superiores personalizados para suas aventuras em Tormenta 20.',
    },
    magicalItems: {
      title: 'Criador de Itens Mágicos',
      description:
        'Crie itens mágicos únicos para suas campanhas de Tormenta 20.',
    },
    threatGenerator: {
      title: 'Gerador de Ameaças',
      description:
        'Crie NPCs e monstros personalizados seguindo as regras de Tormenta 20.',
    },
    builds: {
      title: 'Builds de Personagens',
      description:
        'Explore e compartilhe builds de personagens otimizados para Tormenta 20.',
    },
    changelog: {
      title: 'Changelog',
      description: 'Histórico de atualizações e novidades do Fichas de Nimb.',
    },
    cavernaDoSaber: {
      title: 'Caverna do Saber',
      description:
        'Recursos e ferramentas adicionais para mestres e jogadores de Tormenta 20.',
    },
  },
};

export type PageKey = keyof typeof SEO_CONFIG.pages;

export const getPageSEO = (pageKey: PageKey) => SEO_CONFIG.pages[pageKey];

// Default SEO values for schema usage
export const defaultSEO = {
  siteName: SEO_CONFIG.siteName,
  siteUrl: SEO_CONFIG.baseUrl,
  image: SEO_CONFIG.defaultImage,
  locale: SEO_CONFIG.locale,
};
