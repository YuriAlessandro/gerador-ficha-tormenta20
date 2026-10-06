/**
 * Dogmas fundamentalistas (Deuses de Arton, p. 11–32).
 *
 * Os textos são RESUMOS objetivos, com palavras próprias — o app não
 * substitui o livro (produto da Jambô Editora). Cada entrada cita a página
 * impressa para quem quiser o texto completo.
 *
 * `herdaSacerdote`: o livro diz que o dogma é "como o do sacerdote", às vezes
 * com um complemento; a exibição junta o resumo do sacerdote com `texto`.
 */
import { DogmaFundamentalista } from '../../../../interfaces/Character';
import { DivindadeNames } from '../../../../interfaces/Divindade';

export interface DogmaEntry {
  /** Resumo próprio. Obrigatório, exceto quando só herda o do sacerdote. */
  texto?: string;
  herdaSacerdote?: boolean;
  /** Página impressa de Deuses de Arton. */
  pagina: number;
}

export interface FundamentalistaDeus {
  sacerdote: DogmaEntry;
  druida?: DogmaEntry;
  paladino?: DogmaEntry;
  /** Única raça que pode seguir o dogma de paladino (Valkaria: Humano). */
  paladinoSomenteRaca?: string;
  /**
   * Dogmas que, NA AVALIAÇÃO DO APP, servem melhor a NPCs. O livro (p. 11) só
   * diz que "alguns dogmas" são inviáveis para PJs, sem listar quais — esta
   * lista é editorial e o aviso exibido diz isso ao usuário.
   */
  avisoNpc?: DogmaFundamentalista[];
}

export const FUNDAMENTALISTAS: Record<DivindadeNames, FundamentalistaDeus> = {
  AHARADAK: {
    sacerdote: {
      texto:
        'Espalha a corrupção da Tormenta a qualquer custo. É o único fundamentalista que nunca perde seus poderes.',
      pagina: 12,
    },
    druida: {
      texto: 'Nunca ataca lefou nem criaturas da Tormenta.',
      pagina: 24,
    },
    avisoNpc: ['sacerdote'],
  },
  ALLIHANNA: {
    sacerdote: {
      texto:
        'Não sai em missões, a menos que sua comunidade esteja em risco; mesmo assim, por no máximo um mês.',
      pagina: 13,
    },
    druida: {
      texto:
        'Não ataca animais nem monstros de natureza vegetal, nem deixa aliados atacarem. Deve atacar e destruir devotos de Megalokk.',
      pagina: 25,
    },
  },
  ARSENAL: {
    sacerdote: {
      texto:
        'Toda derrota, por menor que seja (um teste, uma disputa, até um jogo amigável), precisa ser compensada logo com uma vitória.',
      pagina: 13,
    },
  },
  AZGHER: {
    sacerdote: {
      texto: 'Deve atacar e destruir os devotos de Tenebra que encontrar.',
      pagina: 13,
    },
    paladino: {
      herdaSacerdote: true,
      texto:
        'Também deve atacar e destruir necromantes e mortos-vivos (incluindo osteon).',
      pagina: 28,
    },
  },
  HYNINN: {
    sacerdote: {
      texto:
        'Diz no máximo cinco verdades por dia. Seu ato de furtividade diário tem CD mínima 20 + metade do nível.',
      pagina: 14,
    },
  },
  KALLYADRANOCH: {
    sacerdote: {
      texto:
        'Deve se oferecer como servo de um dragão maligno adulto ou maior e, se aceito, obedecer e fazer oferendas a ele, inclusive sacrifícios.',
      pagina: 14,
    },
    avisoNpc: ['sacerdote'],
  },
  KHALMYR: {
    sacerdote: {
      texto:
        'Oferece ajuda a todos que encontra, primeiro a quem mais precisa, e ajuda pelo menos um necessitado por dia.',
      pagina: 15,
    },
    paladino: { herdaSacerdote: true, pagina: 28 },
  },
  LENA: {
    sacerdote: {
      texto:
        'Se houver uma criatura ferida ao alcance de sua cura, aliada ou inimiga, só pode agir para curá-la.',
      pagina: 15,
    },
    paladino: {
      texto: 'Não causa nenhum tipo de dano, nem mesmo não letal.',
      pagina: 29,
    },
  },
  LINWU: {
    sacerdote: {
      texto:
        'Não permite que aliados façam ações que exigem testes de Enganação, Ladinagem ou Furtividade.',
      pagina: 15,
    },
    paladino: {
      herdaSacerdote: true,
      texto: 'Também deve atacar e destruir os devotos de Aharadak.',
      pagina: 30,
    },
  },
  MARAH: {
    sacerdote: {
      texto:
        'Não participa de combates, nem para proteger ou curar, e não lança magias que exigem teste de resistência. Encerra conflitos só por meios não violentos.',
      pagina: 16,
    },
    paladino: {
      texto: 'Não deixa aliados causarem dano, nem mesmo não letal.',
      pagina: 30,
    },
    avisoNpc: ['sacerdote'],
  },
  MEGALOKK: {
    sacerdote: {
      texto:
        'Não faz alianças nem contato pacífico com outros povos, exceto o tipo de monstro que protege; os demais só merecem violência.',
      pagina: 16,
    },
    druida: {
      texto:
        'Não se associa a ninguém: todos os outros seres, até monstros, são oferenda a Megalokk (ou comida).',
      pagina: 25,
    },
    avisoNpc: ['sacerdote', 'druida'],
  },
  NIMB: {
    sacerdote: {
      texto:
        'Uma vez por sessão (ou por mês de jogo), se põe numa situação com 5% de chance de morrer (1 em 1d20).',
      pagina: 17,
    },
  },
  OCEANO: {
    sacerdote: {
      texto:
        'Não pisa em solo firme, a não ser cercado de água visível em pelo menos três direções. Se precisar, usa meios como voo.',
      pagina: 17,
    },
    druida: { texto: 'Nunca sai da água.', pagina: 25 },
  },
  SSZZAAS: {
    sacerdote: {
      texto:
        'A cada nível, faz um sacrifício (mata um humanoide em ritual) ou corrompe o bem (frustra uma causa justa, incrimina um inocente...).',
      pagina: 18,
    },
    avisoNpc: ['sacerdote'],
  },
  TANNATOH: {
    sacerdote: {
      texto:
        'Revela tudo o que sabe, mesmo sem ser perguntado. Não faz testes de Enganação ou Furtividade nem permite que sejam feitos perto dele.',
      pagina: 18,
    },
    paladino: {
      herdaSacerdote: true,
      texto:
        'Também revela sua identidade e ocupação verdadeiras antes de qualquer conversa.',
      pagina: 31,
    },
  },
  TENEBRA: {
    sacerdote: {
      texto:
        'Não usa nenhuma forma de iluminação, só visão no escuro e outros sentidos. Deve atacar e destruir os devotos de Azgher.',
      pagina: 19,
    },
    druida: {
      texto: 'Nunca ataca mortos-vivos, mesmo quando atacado por eles.',
      pagina: 26,
    },
  },
  THWOR: {
    sacerdote: {
      texto:
        'Inimigo do Reinado: suas missões são ataques a povoados humanos, e quem recusa devoção a Thwor deve ser destruído.',
      pagina: 20,
    },
    avisoNpc: ['sacerdote'],
  },
  THYATIS: {
    sacerdote: {
      texto:
        'Não mata nenhum ser vivo e não pode se recusar a ressuscitar quem estiver ao alcance de seus poderes, inclusive inimigos.',
      pagina: 20,
    },
    paladino: { texto: 'Não mata nenhum ser vivo.', pagina: 31 },
  },
  VALKARIA: {
    sacerdote: {
      texto:
        'Não fica mais de uma semana na mesma cidade e nunca recusa uma missão ou aventura.',
      pagina: 21,
    },
    paladino: {
      texto:
        'Busca sempre novas missões e nunca recusa uma; entre aventuras, faz uma busca ligada a aventura. Não usa habilidades que causam condições de movimento.',
      pagina: 32,
    },
    paladinoSomenteRaca: 'Humano',
  },
  WYNNA: {
    sacerdote: {
      texto:
        'Nunca impede nem cancela magias, de aliados ou inimigos: não usa Dissipar Magia, Campo Antimagia e similares (pode encerrar as próprias magias sustentadas).',
      pagina: 21,
    },
  },
};

export default FUNDAMENTALISTAS;
