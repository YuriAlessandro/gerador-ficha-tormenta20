// Gerado a partir da ontologia validada do cofre Tormenta 20 (Obsidian).
export interface SpellOntologyEntry {
  tradicao?: string[];
  funcao?: string[];
  alvoTipo?: string[];
  descritores?: string[];
  tiposDano?: string[];
  exclusivaDevocao?: string[];
  aprimoramentoExclusivo?: string[];
  formattedDescription?: string;
}

export const SPELL_ONTOLOGY_MAP: Record<string, SpellOntologyEntry> = {
  "abencoar alimentos": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "acalmar animal": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "arma espiritual": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano",
      "invocacao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "tiposDano": [
      "corte"
    ]
  },
  "arma de jade": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "objeto"
    ],
    "aprimoramentoExclusivo": [
      "Lin-Wu"
    ]
  },
  "armamento da natureza": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "objeto"
    ]
  },
  "arsenal de allihanna": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "invocacao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "fogo"
    ],
    "exclusivaDevocao": [
      "Allihanna",
      "Arsenal"
    ],
    "aprimoramentoExclusivo": [
      "Allihanna"
    ]
  },
  "bofetada de nimb": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "exclusivaDevocao": [
      "Nimb"
    ],
    "aprimoramentoExclusivo": [
      "Nimb"
    ]
  },
  "bencao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "caminhos da natureza": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "invocacao",
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "comando": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Você dá uma ordem irresistível, que o alvo deve ser capaz de ouvir (mas não precisa entender). Se falhar na resistência, ele deve obedecer ao comando em seu próprio turno da melhor maneira possível. Escolha um dos efeitos:\n* **Fuja:** o alvo gasta seu turno se afastando de você (usando todas as suas ações).\n* **Largue:** o alvo solta quaisquer itens que esteja segurando e não pode pegá-los novamente até o início de seu próximo turno. Como esta é uma ação livre, ele ainda pode executar outras ações (exceto pegar aquilo que largou).\n* **Pare:** o alvo fica Pasmo (apenas uma vez por cena).\n* **Senta:** com uma ação livre, o alvo senta no chão (se estava pendurado ou voando, desce até o chão). Ele pode fazer outras ações, mas não se levantar até o início de seu próximo turno.\n* **Venha:** o alvo gasta seu turno se aproximando de você (usando todas as suas ações)."
  },
  "consagrar": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "cura"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "cura",
      "luz"
    ]
  },
  "controlar plantas": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "criar elementos": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo"
    ],
    "formattedDescription": "Você cria uma pequena porção de um elemento, a sua escolha. Os elementos criados são reais, não mágicos. Elementos físicos devem surgir em uma superfície. Em vez de um cubo, pode-se criar objetos simples (sem partes móveis) feitos de gelo, terra ou pedra.\n* **Água:** enche um recipiente de tamanho Minúsculo (como um odre) com água potável ou cria um cubo de gelo de tamanho Minúsculo.\n* **Ar:** cria um vento fraco em um quadrado de 1,5m. Isso purifica a área de qualquer gás ou fumaça, ou remove névoa por uma rodada.\n* **Fogo:** cria uma chama que ilumina como uma tocha. Você pode segurá-la na palma de sua mão sem se queimar, ou fazê-la surgir em um quadrado de 1,5m. Se uma criatura ou objeto estiver no quadrado, sofre 1d6 pontos de dano de fogo; se falhar num teste de Reflexos, fica Em Chamas.\n* **Terra:** cria um cubo de tamanho Minúsculo feito de terra, argila ou pedra."
  },
  "curar ferimentos": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "luz"
    ]
  },
  "despedacar": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "impacto"
    ]
  },
  "detectar ameacas": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ]
  },
  "escapatoria de hyninn": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "exclusivaDevocao": [
      "Hyninn"
    ],
    "aprimoramentoExclusivo": [
      "Hyninn"
    ]
  },
  "escudo da fe": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "euforia de valkaria": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "exclusivaDevocao": [
      "Valkaria"
    ],
    "aprimoramentoExclusivo": [
      "Valkaria"
    ]
  },
  "execucao de thwor": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "exclusivaDevocao": [
      "Thwor"
    ],
    "aprimoramentoExclusivo": [
      "Thwor"
    ]
  },
  "frescor de lena": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "veneno"
    ],
    "exclusivaDevocao": [
      "Lena"
    ],
    "aprimoramentoExclusivo": [
      "Lena"
    ]
  },
  "futuro melhor": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "sentidos"
    ],
    "aprimoramentoExclusivo": [
      "Thyatis"
    ]
  },
  "furia dos antepassados": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano",
      "invocacao",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "luz"
    ],
    "tiposDano": [
      "luz"
    ],
    "aprimoramentoExclusivo": [
      "Lin-Wu"
    ]
  },
  "infligir ferimentos": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "cura",
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "cura",
      "trevas"
    ],
    "tiposDano": [
      "trevas"
    ]
  },
  "infortunio de sszzaas": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "exclusivaDevocao": [
      "Sszzaas"
    ],
    "aprimoramentoExclusivo": [
      "Sszzaas"
    ]
  },
  "instante estoico": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano",
      "invocacao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "aprimoramentoExclusivo": [
      "Khalmyr"
    ]
  },
  "magia dadivosa": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "aprimoramentoExclusivo": [
      "Wynna"
    ]
  },
  "orbe do oceano": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "exclusivaDevocao": [
      "Oceano"
    ],
    "aprimoramentoExclusivo": [
      "Oceano"
    ]
  },
  "orientacao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "paixao de marah": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "exclusivaDevocao": [
      "Marah"
    ],
    "aprimoramentoExclusivo": [
      "Marah"
    ]
  },
  "perdicao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "perturbacao sombria": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "mental"
    ],
    "aprimoramentoExclusivo": [
      "Tenebra"
    ]
  },
  "poder de kallyadranoch": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "acido",
      "eletricidade",
      "fogo",
      "frio"
    ],
    "tiposDano": [
      "acido"
    ],
    "exclusivaDevocao": [
      "Kallyadranoch"
    ],
    "aprimoramentoExclusivo": [
      "Kallyadranoch"
    ]
  },
  "posse de arsenal": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "exclusivaDevocao": [
      "Arsenal"
    ],
    "aprimoramentoExclusivo": [
      "Arsenal"
    ]
  },
  "profanar": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "cura"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "cura",
      "trevas"
    ]
  },
  "protecao divina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "protecao de tauron": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "mobilidade",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "luz"
    ]
  },
  "santuario": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "cura"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "cura"
    ]
  },
  "sigilo de sszzaas": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "exclusivaDevocao": [
      "Sszzaas"
    ],
    "aprimoramentoExclusivo": [
      "Sszzaas"
    ]
  },
  "siroco de azgher": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano",
      "invocacao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "corte"
    ],
    "exclusivaDevocao": [
      "Azgher"
    ],
    "aprimoramentoExclusivo": [
      "Azgher"
    ],
    "formattedDescription": "Invocando a fúria do Deus-Sol, você cria uma breve e focada tempestade de areia, capaz de esfolar a carne dos ossos!\n\nCriaturas afetadas sofrem dano de corte conforme seu grau de proteção:\n* 3d6 se estiverem sem armadura.\n* 2d6 se estiverem com armadura leve.\n* 1d6 se estiverem com armadura pesada."
  },
  "sorriso da fortuna": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "aprimoramentoExclusivo": [
      "Hyninn"
    ]
  },
  "suporte ambiental": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "frio"
    ]
  },
  "toque de megalokk": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "exclusivaDevocao": [
      "Megalokk"
    ],
    "aprimoramentoExclusivo": [
      "Megalokk"
    ]
  },
  "tranquilidade": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "voz da razao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "aprimoramentoExclusivo": [
      "Tanna-Toh"
    ]
  },
  "aliado animal": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "augurio": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "formattedDescription": "Esta magia diz se uma ação que você tomará em breve — no máximo uma hora no futuro — trará resultados bons ou ruins. O mestre rola 1d6 em segredo; com um resultado de 2 a 6, a magia funciona e você recebe uma das seguintes respostas:\n* **“Felicidade”:** a ação trará bons resultados;\n* **“Miséria”:** a ação trará maus resultados;\n* **“Felicidade e miséria”:** para ambos;\n* **“Nada”:** para ações que não trarão resultados bons ou ruins.\n\nCom um resultado 1, a magia falha e oferece o resultado “nada”. Não há como saber se esse resultado foi dado porque a magia falhou ou não. Lançar esta magia múltiplas vezes sobre o mesmo assunto gera sempre o primeiro resultado.\n\nPor exemplo, se o grupo está prestes a entrar em uma câmara, o augúrio dirá “felicidade” se a câmara contém um tesouro desprotegido, “miséria” se contém um monstro, “felicidade e miséria” se houver um tesouro e um monstro ou “nada” se a câmara estiver vazia."
  },
  "condicao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "controlar ar": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Você pode controlar os movimentos e comportamentos de massas de ar. Ao lançar a magia, escolha um dos efeitos abaixo:\n* **Ascender:** Cria uma corrente de ar ascendente capaz de erguer do chão uma criatura ou objeto médio, fazendo o alvo flutuar para cima e para baixo conforme sua vontade. Você pode gastar uma ação de movimento para subir ou descer o alvo até 6m por rodada, até um máximo de 30m de altura. Você não pode mover o alvo horizontalmente — mas o alvo pode, por exemplo, escalar uma colina ou se apoiar no teto para mover-se lateralmente (com metade de seu deslocamento normal). Uma criatura que esteja flutuando fica Vulnerável e sofre –2 nas jogadas de ataque. Alvos involuntários têm direito a um teste de Fortitude no início de seu turno para negar o efeito. Derrubar um alvo flutuando (simplesmente parando a corrente de ar) causa o dano normal de queda, mas um alvo que passe no teste pode 'nadar' para o chão contra a corrente. Você pode usar essa opção para fazer uma Derrubar contra uma criatura voadora dentro do alcance, usando seu atributo-chave no lugar de Força.\n* **Sopro:** Cria uma lufada de vento a partir de suas mãos, que empurra qualquer criatura Média ou menor em um cone de 4,5m — faça uma Empurrar usando seu atributo-chave ao invés de Força, usando o mesmo resultado de sua rolagem para todos os alvos. A lufada de vento também faz qualquer coisa que um vento forte e súbito faria, como levantar pó, dispersar vapores, apagar chamas, espalhar papéis ou mover uma embarcação. Manter o sopro ativo exige uma ação padrão.\n* **Vento:** Cria uma área de vento forte dentro do alcance da magia. Se lançada numa área que já esteja com algum efeito de vento, aumenta esse efeito em um passo. Manter o vento ativo requer uma ação de movimento. Você também pode usar essa opção para reduzir os efeitos de vento em uma área."
  },
  "controlar fogo": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo"
    ],
    "formattedDescription": "Você pode criar, moldar, mover ou extinguir chamas e emanações de calor. Ao lançar a magia, escolha um dos efeitos:\n* **Chamejar:** o alvo é armas escolhidas. Elas causam +1d6 de dano de fogo. Também afeta armas naturais e ataques desarmados.\n* **Esquentar:** o alvo é 1 objeto, que começa a esquentar. Ele sofre 1d6 pontos de dano de fogo por rodada e causa o mesmo dano a qualquer criatura que o esteja segurando ou vestindo. A critério do mestre, o objeto ou a criatura vestindo-o também podem ficar Em Chamas. Uma criatura pode gastar uma ação completa para resfriar o objeto (jogando areia ou se jogando numa fonte de água próxima, por exemplo) e cancelar o efeito da magia.\n* **Extinguir:** o alvo é 1 chama de tamanho Grande ou menor, que é apagada. Isso cria uma nuvem de fumaça que ocupa uma esfera com 3m de raio centrada onde estava a chama. Dentro da fumaça, criaturas têm Camuflagem.\n* **Modelar:** o alvo é 1 chama de tamanho Grande ou menor. A cada rodada, você pode gastar uma ação livre para movimentá-la 9m em qualquer direção. Se atravessar o espaço ocupado por uma criatura, causa 2d6 pontos de dano de fogo. Uma criatura só pode receber dano dessa maneira uma vez por rodada."
  },
  "controlar madeira": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "objeto"
    ],
    "formattedDescription": "Você molda, retorce, altera ou repele madeira. Se lançar esta magia num objeto de uma criatura involuntária, ela tem direito a um teste de Vontade para anulá-la. Ao lançar a magia, escolha:\n* **Fortalecer:** deixa o alvo mais resistente. Armas têm seu dano aumentado em um passo. Escudos têm seu bônus de Defesa aumentado em +2 (isso é uma melhoria no item, portanto é cumulativa com outras magias). Esses e outros itens de madeira recebem +5 na RD e dobram seus PV.\n* **Modelar:** muda a forma do alvo. Pode transformar um galho em espada, criar uma porta onde antes havia apenas uma parede, transformar um tronco em uma caixa... Mas não pode criar mecanismos complexos (como uma besta) ou itens consumíveis.\n* **Repelir:** o alvo é repelido por você. Se for uma arma, ataques feitos com ela contra você falham automaticamente. Se for uma porta ou outro objeto que possa ser aberto, ele vai se abrir quando você se aproximar, mesmo que esteja trancado. Um objeto que vá atingi-lo, como uma carroça, tronco ou barril, vai desviar ou parar adjacente a você, sem lhe causar dano. Os efeitos de regras em outros objetos de madeira ficam a cargo do mestre.\n* **Retorcer:** estraga o alvo. Uma porta retorcida emperra (exigindo um teste de Força contra CD 25 para ser aberta). Armas e itens retorcidos impõem –5 em testes de perícia. Escudos retorcidos deixam de oferecer bônus (mas ainda impõem penalidades). Um barco retorcido começa a afundar e naufraga ao final da cena. Os efeitos de regras em outros objetos de madeira ficam a cargo do mestre."
  },
  "couraca de allihanna": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "objeto"
    ],
    "exclusivaDevocao": [
      "Allihanna"
    ]
  },
  "circulo da justica": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "area"
    ]
  },
  "enxame de pestes": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "corte"
    ]
  },
  "fisico divino": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "globo da verdade de gwen": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "mente divina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "miasma mefitico": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "acido"
    ],
    "tiposDano": [
      "acido"
    ]
  },
  "oracao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "punicao do profano": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "impacto"
    ]
  },
  "purificacao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "raio solar": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "luz"
    ],
    "tiposDano": [
      "luz"
    ]
  },
  "rogar maldicao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "sentidos"
    ],
    "formattedDescription": "Você entoa cânticos maléficos que amaldiçoam uma vítima, criando efeitos variados. Ao lançar a magia, escolha entre os seguintes:\n* **Debilidade:** o alvo fica Esmorecido e não pode se comunicar ou lançar magias. Ainda reconhece seus aliados e pode segui-los e ajudá-los, mas sempre de maneira simplória.\n* **Doença:** muda a duração para instantânea. O alvo contrai uma doença a sua escolha, que o afeta imediatamente (sem período de incubação).\n* **Fraqueza:** o alvo fica Debilitado e Lento.\n* **Isolamento:** o alvo perde o uso de um de seus cinco sentidos a sua escolha. Se perder a visão, fica Cego. Se perder a audição, fica Surdo. Se perder o olfato ou paladar, não pode usar a habilidade faro. Se perder o tato, fica Caído e não pode se levantar.\n\nVocê também pode inventar sua própria maldição, usando esses exemplos como sugestões, mas o mestre tem a palavra final sobre o efeito."
  },
  "silencio": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "mental"
    ]
  },
  "soco de arsenal": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "impacto"
    ],
    "exclusivaDevocao": [
      "Arsenal"
    ]
  },
  "tempestade divina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "impacto"
    ]
  },
  "traicao da lamina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "vestimenta da fe": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "objeto"
    ]
  },
  "voz divina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "anular a luz": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "luz",
      "trevas"
    ]
  },
  "banimento": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "frio",
      "luz"
    ]
  },
  "coluna de chamas": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo",
      "luz"
    ],
    "tiposDano": [
      "fogo",
      "luz"
    ]
  },
  "comunhao com a natureza": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "controlar terra": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "impacto"
    ],
    "formattedDescription": "Você manipula a densidade e a forma de toda terra, pedra, lama, argila ou areia na área. Ao lançar a magia, escolha:\n* **Amolecer:** se afetar o teto, uma coluna ou suporte, provoca um desabamento que causa 10d6 pontos de dano de impacto às criaturas na área (Reflexos reduz à metade). Se afetar um piso de terra ou pedra, cria terreno difícil de areia ou argila, respectivamente.\n* **Modelar:** pode usar pedra ou argila para criar um ou mais objetos simples de tamanho Enorme ou menor (sem mecanismos ou partes móveis). Por exemplo, pode transformar um tijolo em uma maça, criar uma passagem onde antes havia apenas uma parede ou levantar uma ou mais paredes que oferecem Cobertura (RD 8 e 50 PV para cada 3m).\n* **Solidificar:** transforma lama ou areia em terra ou pedra. Criaturas com os pés na superfície ficam Agarrado. Elas podem se soltar com uma ação padrão e um teste de Acrobacia ou Atletismo."
  },
  "controlar agua": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "dano",
      "mobilidade"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "fogo",
      "frio"
    ],
    "tiposDano": [
      "fogo"
    ],
    "formattedDescription": "Você controla os movimentos e comportamentos da água. Ao lançar a magia, escolha um dos efeitos abaixo:\n* **Congelar:** toda a água mundana na área é congelada. Criaturas nadando na área ficam Imóvel; escapar exige gastar uma ação padrão e passar num teste de Atletismo ou Acrobacia.\n* **Derreter:** gelo mundano na área vira água e a magia termina. A critério do mestre, isso pode criar terreno difícil.\n* **Enchente:** eleva o nível da água mundana na área em até 4,5m. A sua escolha, muda área para alvo: uma embarcação. O alvo recebe +3m em seu deslocamento pela duração do efeito.\n* **Evaporar:** toda a água e gelo mundano na área evaporam instantaneamente e a magia termina. Elementais da água, plantas monstruosas e criaturas com imunidade a frio na área sofrem 10d8 pontos de dano de fogo; outras criaturas vivas recebem metade desse dano (Fortitude reduz à metade).\n* **Partir:** diminui o nível de toda água mundana na área em até 4,5m. Em um corpo d'água raso, isso abre um caminho seco, que pode ser atravessado a pé. Em um corpo d'água profundo, cria um redemoinho que pode prender barcos (um teste de Pilotagem permite ao piloto livrar a embarcação). Elementais da água na área ficam Lento."
  },
  "despertar consciencia": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "dispersar as trevas": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "protecao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "luz",
      "trevas"
    ]
  },
  "heroismo": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "missao divina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "poeira da podridao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "trevas"
    ],
    "tiposDano": [
      "trevas"
    ]
  },
  "potencia divina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "protecao contra magia": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "servo divino": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "sopro da salvacao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "cura"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "cura",
      "luz"
    ]
  },
  "viagem arborea": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "tiposDano": [
      "impacto"
    ]
  },
  "conceder milagre": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "controlar o clima": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "area"
    ]
  },
  "circulo da restauracao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "luz"
    ],
    "tiposDano": [
      "luz"
    ]
  },
  "colera de azgher": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo"
    ],
    "exclusivaDevocao": [
      "Azgher"
    ]
  },
  "cupula de repulsao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "guardiao divino": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "cura",
      "invocacao",
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "cura",
      "luz",
      "mental"
    ]
  },
  "ligacao sombria": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "manto do cruzado": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "cura",
      "dano",
      "invocacao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "cura",
      "luz",
      "trevas"
    ],
    "tiposDano": [
      "luz",
      "trevas"
    ],
    "formattedDescription": "Você invoca o poder de sua divindade na forma de um manto de energia que reveste seu corpo. Esta magia tem duas versões. Você escolhe qual versão pode lançar quando aprende esta magia. Ela não pode ser mudada.\n* **Manto de Luz:** um manto dourado e luminoso. No início de cada um de seus turnos, você e todos os seus aliados em alcance curto recuperam 2d8 PV. Você recebe imunidade a dano de trevas e seus ataques corpo a corpo causam +2d8 pontos de dano de luz.\n* **Manto de Trevas:** um manto negro como a noite. No início de cada um de seus turnos, todos os inimigos em alcance curto sofrem 4d8 pontos de dano de trevas. Você cura metade de todo o dano causado pela magia."
  },
  "premonicao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "terremoto": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "dano"
    ],
    "alvoTipo": [
      "area"
    ],
    "tiposDano": [
      "impacto"
    ],
    "formattedDescription": "Esta magia cria um tremor de terra que rasga o solo. O terremoto dura uma rodada, durante a qual criaturas sobre o solo ficam Atordoado (apenas uma vez por cena). Barreiras físicas não interrompem a área de Terremoto. O efeito exato depende do terreno:\n* **Caverna ou subterrâneo:** a magia derruba o teto, causando 12d6 pontos de dano de impacto e agarrando todas as criaturas na área. Um teste de Reflexos reduz o dano à metade e evita a condição.\n* **Construção:** todas as estruturas na área sofrem 200 pontos de dano de impacto, o suficiente para derrubar construções de madeira ou alvenaria simples, mas não de alvenaria reforçada. Criaturas em uma construção que desmorone sofrem o mesmo efeito de criaturas em uma caverna (veja acima).\n* **Espaço aberto:** fendas se abrem no chão. Cada criatura na área precisa rolar um dado; em um resultado ímpar, uma fenda se abre sob ela e ela precisa fazer um teste de Reflexos; se falhar, cai na fenda. A criatura pode escapar gastando uma ação completa e passando em um teste de Atletismo. No início do seu próximo turno as fendas se fecham, matando todos que estejam dentro delas.\n* **Penhasco:** o penhasco racha, criando um desmoronamento que percorre uma distância horizontal igual à distância da queda. Por exemplo, um penhasco com 30m de altura desmorona em uma área de 30m de comprimento além da base. Qualquer criatura no caminho sofre 12d6 pontos de dano de impacto e fica Agarrado. Um teste de Reflexos reduz o dano à metade e evita ficar Agarrado.\n* **Rio, lago ou pântano:** fissuras se abrem sob a água, drenando-a e formando um lamaçal. Criaturas na área precisam fazer um teste de Reflexos para não afundarem na lama e ficarem Agarrado. No início do seu próximo turno as fissuras se fecham, possivelmente afogando as criaturas que ficaram Agarrado.\n\nCriaturas Agarrado (efeito possível de caverna, construção, penhasco e rio, lago ou pântano) sofrem 1d6 pontos de dano por rodada até serem libertadas, o que exige uma ação completa e um teste de Atletismo (por parte da própria criatura ou de um aliado adjacente)."
  },
  "aura divina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "protecao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ]
  },
  "furia do panteao": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "eletricidade",
      "fogo",
      "frio"
    ],
    "tiposDano": [
      "eletricidade",
      "frio",
      "impacto"
    ],
    "formattedDescription": "Você cria uma nuvem de tempestade violenta. Os ventos tornam ataques à distância impossíveis e fazem a área contar como condição terrível para lançar magia. Além disso, inimigos na área têm a visibilidade reduzida (como a magia Névoa).\n\nUma vez por turno, você pode gastar uma ação de movimento para gerar um dos efeitos a seguir:\n* **Nevasca:** Inimigos na área sofrem 10d6 pontos de dano de frio (Fortitude reduz à metade). A área fica coberta de neve, virando terreno difícil até o fim da cena ou até você usar siroco.\n* **Raios:** Até 6 inimigos a sua escolha na área sofrem 10d8 pontos de dano de eletricidade (Reflexos reduz à metade).\n* **Siroco:** Transforma a chuva em uma tempestade de areia escaldante. Inimigos na área sofrem 10d6 pontos de dano (metade corte, metade fogo) e ficam Sangrando (Fortitude reduz o dano à metade e evita a condição).\n* **Trovões:** Inimigos sofrem 10d6 pontos de dano de impacto e ficam Desprevenido por uma rodada (Fortitude reduz o dano à metade e evita a condição)."
  },
  "intervencao divina": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "cura"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "cura"
    ],
    "formattedDescription": "Você pede a sua divindade para interceder diretamente. Você pode:\n* Curar todos os PV e condições de até 10 criaturas em alcance longo (este efeito cura mortos-vivos, em vez de causar dano).\n* Dissipar os efeitos de qualquer magia de 4º círculo ou menor.\n\nVocê pode implorar por algo ainda mais poderoso. Nesse caso, a magia requer o sacrifício de 2 PM e pode fazer coisas como:\n* Criar um item mundano de até T$ 30.000.\n* Duplicar os efeitos de qualquer magia de até 4º círculo. Caso a magia precise de um componente material para ser lançada, ainda é necessário providenciar o componente.\n* Proteger uma cidade de um desastre, como uma erupção vulcânica, enchente ou terremoto.\n* Ressuscitar uma criatura em alcance longo que tenha morrido há até uma rodada. A criatura acorda com 1 PV.\n* Qualquer outra coisa que o mestre autorize, conforme os desejos e objetivos da divindade do conjurador."
  },
  "lagrimas de wynna": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "exclusivaDevocao": [
      "Wynna"
    ]
  },
  "reanimacao impura": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "segunda chance": {
    "tradicao": [
      "Divina"
    ],
    "funcao": [
      "controle",
      "cura"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "cura",
      "luz"
    ]
  },
  "adaga mental": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "alarme": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "area"
    ]
  },
  "amedrontar": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "armadura arcana": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "concentracao de combate": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "informacao",
      "protecao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "conjurar monstro": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "invocacao",
      "mobilidade",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo"
    ],
    "formattedDescription": "Você conjura um monstro Pequeno que ataca seus inimigos. Você escolhe a aparência do monstro e o tipo de dano que ele pode causar, entre corte, impacto e perfuração. No entanto, ele não é uma criatura real, e sim um construto feito de energia. Se for destruído, ou quando a magia acaba, desaparece com um brilho, sem deixar nada para trás. Você só pode ter um monstro conjurado por esta magia por vez.\n\nO monstro surge em um espaço desocupado a sua escolha dentro do alcance e age no início de cada um de seus turnos, a partir da próxima rodada. O monstro tem deslocamento 9m e pode fazer uma ação de movimento por rodada. Você pode gastar uma ação padrão para dar uma das seguintes ordens a ele:\n* **Mover:** o monstro se movimenta o dobro do deslocamento nessa rodada.\n* **Atacar:** o monstro causa 2d4+2 pontos de dano a uma criatura adjacente.\n* **Lançar Magia:** o monstro pode servir como ponto de origem para uma magia lançada por você com execução de uma ação padrão ou menor. Ele pode descarregar um Toque Chocante em um inimigo distante, ou mesmo \"cuspir\" uma Bola de Fogo! Você gasta PM normalmente para lançar a magia.\n\nOutros usos criativos para monstros conjurados ficam a critério do mestre. O monstro não age sem receber uma ordem. Para efeitos de jogo, o monstro conjurado tem For 2, Des 3 e todos os outros atributos nulos. Ele tem Defesa igual a sua, 20 pontos de vida e usa o seu bônus para teste de Reflexos. Ele é imune a efeitos que pedem um teste de Fortitude ou Vontade."
  },
  "criar ilusao": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "disfarce ilusorio": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "mental"
    ]
  },
  "enfeiticar": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "explosao de chamas": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo"
    ]
  },
  "hipnotismo": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "imagem espelhada": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "mental",
      "sentidos"
    ]
  },
  "leque cromatico": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "luz",
      "mental"
    ]
  },
  "primor atletico": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "queda suave": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "raio do enfraquecimento": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "seta infalivel de talude": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "essencia"
    ]
  },
  "sono": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "teia": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo"
    ]
  },
  "toque chocante": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "eletricidade"
    ],
    "tiposDano": [
      "eletricidade"
    ]
  },
  "tranca arcana": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "objeto"
    ]
  },
  "transmutar objetos": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo"
    ]
  },
  "vitalidade fantasma": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "area escorregadia": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "alterar tamanho": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "objeto"
    ]
  },
  "amarras etereas": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "aparencia perfeita": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "mental"
    ]
  },
  "bola de fogo": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo"
    ]
  },
  "campo de forca": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "camuflagem ilusoria": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "cranio voador de vladislav": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "trevas"
    ],
    "tiposDano": [
      "trevas"
    ]
  },
  "desespero esmagador": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ]
  },
  "esculpir sons": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "flecha acida": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "acido"
    ],
    "tiposDano": [
      "acido"
    ]
  },
  "invisibilidade": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "luz",
      "mental"
    ]
  },
  "ligacao telepatica": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "localizacao": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "cura",
      "informacao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "cura"
    ]
  },
  "mapear": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "objeto"
    ]
  },
  "metamorfose": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "tiposDano": [
      "corte"
    ]
  },
  "montaria arcana": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "refugio": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo",
      "frio"
    ]
  },
  "relampago": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "eletricidade"
    ],
    "tiposDano": [
      "eletricidade"
    ]
  },
  "salto dimensional": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "servos invisiveis": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "sopro das uivantes": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "descritores": [
      "frio"
    ],
    "tiposDano": [
      "frio",
      "impacto"
    ]
  },
  "sussurros insanos": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "toque vampirico": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "trevas"
    ],
    "tiposDano": [
      "trevas"
    ]
  },
  "velocidade": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "contato extraplanar": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "convocacao instantanea": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "invocacao"
    ],
    "alvoTipo": [
      "objeto"
    ]
  },
  "dificultar deteccao": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "enxame rubro de ichabod": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "acido"
    ],
    "tiposDano": [
      "acido"
    ]
  },
  "erupcao glacial": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo",
      "frio"
    ],
    "tiposDano": [
      "corte",
      "fogo",
      "frio"
    ]
  },
  "ferver sangue": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo"
    ]
  },
  "globo de invulnerabilidade": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "ilusao lacerante": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "lanca ignea de aleph": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo",
      "perfuracao"
    ]
  },
  "miragem (magia)": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "muralha elemental": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo",
      "frio",
      "trevas"
    ],
    "tiposDano": [
      "fogo",
      "frio"
    ],
    "formattedDescription": "Uma muralha de um elemento a sua escolha se eleva da terra. Ela pode ser um muro de até 30m de comprimento e 3m de altura (ou o contrário) ou uma cúpula de 3m de raio. Os efeitos variam conforme o elemento escolhido:\n* **Fogo:** A muralha é opaca e composta de chamas crepitantes. Qualquer criatura que atravessá-la ou iniciar seu turno nela sofre 6d6 pontos de dano de fogo.\n* **Gelo:** A muralha é composta de gelo branco-azulado. Ela possui Defesa 10, 30 PV por trecho de 3m de comprimento, redução de fogo 0 e é imune a frio, trevas e essência. Qualquer criatura que atravessá-la ou iniciar seu turno nela sofre 6d6 pontos de dano de frio."
  },
  "telecinesia": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle",
      "dano",
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "impacto"
    ],
    "formattedDescription": "Você move objetos ou criaturas se concentrando. Ao lançar a magia, escolha uma das opções a seguir:\n* **Força Contínua (Duração: Sustentada):** você move uma criatura Média ou menor, ou objeto de até 10 espaços, a até 6m por rodada. Uma criatura pode anular o efeito sobre ela, ou sobre um objeto que possua, passando num teste de Vontade. O alvo pode ser movido em qualquer direção dentro do alcance. Ele cai no chão se sair do alcance ou a magia terminar.\n* **Empurrão Violento (Duração: Instantânea):** nesta versão a energia mágica é expelida de uma única vez e arremessa até 10 objetos (no máximo 10 espaços). Os objetos devem estar a até 3m uns dos outros e podem ser arremessados até o alcance da magia. Objetos arremessados podem atingir criaturas em seu caminho, causando de 1 ponto de dano de impacto por espaço (objetos macios, sem pontas ou sem fio) até 1d6 pontos de dano por espaço (objetos duros, pontudos ou afiados). Criaturas atingidas têm direito a um teste de Reflexos para reduzir o dano à metade. Criaturas Médias ou menores podem ser arremessadas, mas têm direito a um teste de Vontade para evitar o efeito (em si mesmas ou em objetos que estejam segurando). Uma criatura arremessada contra uma superfície sólida sofre 1d6 pontos de dano de impacto para cada 3m que \"voou\" no deslocamento (incluindo outras criaturas; nesse caso, ambas sofrem o dano)."
  },
  "teletransporte": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Esta magia transporta os alvos para um lugar a sua escolha a até 1.000km. Você precisa fazer um teste de Misticismo, com dificuldade que depende de seu conhecimento sobre o local de destino:\n* **CD 20:** Um lugar familiar, que você visita com frequência.\n* **CD 30:** Um lugar conhecido, que você já visitou pelo menos uma vez.\n* **CD 40:** Um lugar que você nunca visitou e só conhece a partir da descrição de outra pessoa que esteve lá.\n\nVocê não pode se teletransportar para um lugar que nunca visitou sem a descrição de alguém. Ou seja, não pode se transportar para a \"sala de tesouro do rei\" se nunca esteve nela nem falou com alguém que esteve.\n\nSe passar no teste, os alvos chegam ao lugar desejado. Se falhar, os alvos surgem 1d10 x 10km afastados em qualquer direção (se o destino é uma cidade costeira, você pode surgir em alto-mar). Se falhar por 5 ou mais, você chega em um lugar parecido, mas errado. E se você rolar 1 natural no teste a magia falha (mas você gasta os PM) e fica Atordoado por 1d4 rodadas."
  },
  "tentaculos de trevas": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "trevas"
    ],
    "tiposDano": [
      "trevas"
    ]
  },
  "transformacao de guerra": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "voo": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "mobilidade"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "ancora dimensional": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "alterar memoria": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "animar objetos": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "objeto"
    ],
    "descritores": [
      "mental"
    ],
    "formattedDescription": "Você concede vida a objetos inanimados. Cada objeto se torna um parceiro sob seu controle. O tipo dele é escolhido da lista de tamanho e ele não conta em seu limite de parceiros. Com uma ação de movimento, você pode comandar mentalmente qualquer objeto animado dentro do alcance para que auxilie você ou outra criatura. Outros usos criativos para os objetos ficam a cargo do mestre.\n\nObjetos animados são construtos com valores de Força, Destreza e PV de acordo com seu tamanho. Todos os outros atributos são nulos, eles não têm valor de Defesa ou testes de resistência e falham automaticamente em qualquer teste oposto. Diferente de parceiros comuns, um objeto pode ser alvo de um ataque direto. Esta magia não afeta itens mágicos, nem objetos que estejam sendo carregados por outra criatura.\n\nEstatísticas de objetos animados:\n* **Minúsculo:** For –3, Des 4, 5 PV; Assassino ou Combatente Iniciante.\n* **Pequeno:** For –2, Des 2, 10 PV; Combatente ou Guardião Iniciante.\n* **Médio:** For 0, Des 1, 20 PV; Combatente ou Guardião Veterano.\n* **Grande:** For 2, Des 0, 40 PV; Fortão, Guardião ou Montaria (cavalo) Veterano.\n* **Enorme:** For 4, Des –2, 60 PV; Fortão, Guardião ou Montaria (cavalo) Mestre."
  },
  "assassino fantasmagorico": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental",
      "trevas"
    ],
    "tiposDano": [
      "trevas"
    ]
  },
  "campo antimagia": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "conjurar elemental": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "eletricidade",
      "fogo",
      "frio",
      "mental"
    ],
    "tiposDano": [
      "eletricidade",
      "fogo",
      "frio",
      "impacto"
    ],
    "formattedDescription": "Esta magia transforma uma porção de um elemento inerte em uma criatura elemental Grande do tipo do elemento alvo. Por exemplo, lançar esta magia numa fogueira ou tocha cria um elemental do fogo. Você pode criar elementais do ar, água, fogo e terra com essa magia. O elemental obedece a todos os seus comandos e pode funcionar como um parceiro do tipo destruidor (cuja habilidade custa apenas 2 PM para ser usada) e mais um tipo entre os indicados na lista abaixo, ambos mestres. O elemental auxilia apenas você e não conta em seu limite de parceiros:\n* **Ar:** assassino, perseguidor ou vigilante. Dano de eletricidade.\n* **Água:** ajudante, guardião ou médico. Dano de frio.\n* **Fogo:** atirador, combatente ou fortão. Dano de fogo.\n* **Terra:** combatente, guardião ou montaria. Dano de impacto."
  },
  "controlar a gravidade": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "impacto"
    ],
    "formattedDescription": "Você controla os efeitos da gravidade dentro da área. Ao lançar a magia, escolha um dos efeitos abaixo. Enquanto a magia durar, você pode gastar uma ação padrão para mudar o efeito:\n* **Aumentar:** no início de seus turnos, cada criatura na área deve fazer um teste de Atletismo. Se passar, fica Fatigado. Se falhar, fica Fatigado e Caído.\n* **Inverter:** inverte a gravidade da área, fazendo com que criaturas e objetos \"caiam\" para cima, atingindo o topo (12m) em uma rodada. Se um obstáculo (como um teto) impedir o movimento das criaturas, elas sofrem 1d6 pontos de dano de impacto para cada 1,5m de \"queda\". Elas podem então se levantar e caminhar no obstáculo, de cabeça para baixo. Se não houver obstáculo, as criaturas e objetos ficam flutuando no topo da área afetada, sem poder sair do lugar. Criaturas voadoras podem se movimentar normalmente. Alguém adjacente a algo que possa agarrar tem direito a um teste de Reflexos para evitar a \"queda\". A criatura deve permanecer presa pela duração da magia; caso contrário \"cairá\".\n* **Reduzir:** criaturas ou objetos livres Médios ou menores flutuam para cima e para baixo conforme sua vontade, com deslocamento de voo 6m. Criaturas na área recebem +20 em testes de Atletismo para escalar e saltar. Uma criatura levitando fica instável, sofrendo –2 em testes de ataque."
  },
  "desintegrar": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "essencia"
    ]
  },
  "duplicata ilusoria": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "explosao caleidoscopica": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "luz",
      "mental"
    ],
    "formattedDescription": "Esta magia cria uma forte explosão de luzes estroboscópicas e sons cacofônicos que desorientam as criaturas atingidas. O efeito que cada criatura sofre depende do nível ou ND dela:\n* **Nível ou ND 4 ou menor:** se falhar no teste de resistência, fica Inconsciente. Se passar, fica Atordoado por 1d4 rodadas e Enjoado pelo resto da cena.\n* **Nível ou ND entre 5 e 9:** se falhar no teste de resistência, fica Atordoado por 1d4 rodadas e Enjoado pelo resto da cena. Se passar, fica Atordoado por 1 rodada e Enjoado por 1d4 rodadas.\n* **Nível ou ND 10 ou maior:** se falhar no teste de resistência, fica Atordoado por 1 rodada e Enjoado por 1d4 rodadas. Se passar, fica Desprevenido e Enjoado por 1 rodada.\n\nUma criatura só pode ser Atordoado por esta magia uma vez por cena."
  },
  "forma eterea": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "mobilidade"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "sentidos"
    ],
    "tiposDano": [
      "impacto"
    ]
  },
  "marionete": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "mao poderosa de talude": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle",
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "metamorfose"
    ],
    "tiposDano": [
      "impacto"
    ],
    "formattedDescription": "Esta magia cria uma mão flutuante Grande que sempre se posiciona entre você e um oponente a sua escolha. A mão fornece Cobertura (+5 na Defesa) contra esse oponente. Nada é capaz de enganar a mão — coisas como escuridão, invisibilidade, metamorfose e disfarces mundanos não a impedem de protegê-lo. A mão tem Defesa 20 e PV e resistências iguais aos seus.\n\nCom uma ação de movimento, você pode comandar a mão para que o proteja de outro oponente ou para que realize uma das ações a seguir:\n* **Agarrar:** a mão usa uma Agarrar contra o oponente, usando o seu Misticismo com um bônus adicional de +10. A mão mantém o oponente Agarrado, mas não causa dano.\n* **Esmagar:** a mão esmaga um oponente Agarrado, causando 2d6+10 pontos de dano de impacto.\n* **Empurrar:** a mão afasta o oponente (Empurrar usando o seu Misticismo com um bônus adicional de +10). A mão acompanha o oponente para empurrá-lo o máximo que conseguir, dentro do alcance da magia."
  },
  "raio polar": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle",
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo",
      "frio"
    ],
    "tiposDano": [
      "frio"
    ]
  },
  "relampago flamejante de reynard": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "invocacao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "eletricidade",
      "fogo"
    ],
    "tiposDano": [
      "eletricidade",
      "fogo"
    ]
  },
  "sonho": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "talho invisivel de edauros": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "tiposDano": [
      "corte"
    ]
  },
  "alterar destino": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "informacao",
      "protecao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "aprisionamento": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle",
      "informacao",
      "mobilidade",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "luz"
    ],
    "formattedDescription": "Você cria uma prisão mágica para aprisionar uma criatura. Se falhar no teste de resistência, o alvo sofre o efeito da magia; se passar, fica imune a esta magia por uma semana. Enquanto estiver aprisionada, a criatura não precisa respirar e alimentar-se, e não envelhece. Magias de adivinhação não conseguem localizar ou perceber o alvo. Ao lançar a magia, você escolhe uma das seguintes formas de prisão. O componente material varia, mas todos custam T$ 1.000:\n* **Acorrentamento:** o alvo é preso por correntes firmemente enraizadas no chão, que o mantém no lugar. O alvo fica Paralisado e não pode se mover ou ser movido por qualquer meio. Componente Material: uma fina corrente de mitral.\n* **Contenção Mínima:** o alvo diminui para 2 cm de altura e é preso dentro de uma pedra preciosa ou objeto semelhante. Luz passa através da pedra, permitindo que o alvo veja o lado de fora e seja visto, mas nada mais pode passar, nem por meio de teletransporte ou viagem planar. A pedra não pode ser quebrada enquanto o alvo estiver dentro. Componente Material: uma pedra preciosa, como um diamante ou rubi.\n* **Prisão Dimensional:** o alvo é transportado para um semiplano protegido contra teletransporte e viagens planares. Pode ser um labirinto, uma gaiola, uma torre ou qualquer estrutura ou área confinada e pequena a sua escolha. Componente Material: uma representação em miniatura da prisão, feita de jade.\n* **Sepultamento:** o alvo é sepultado nas profundezas da terra, em uma esfera mágica. Nada pode destruir ou atravessar a esfera, nem mesmo teletransporte ou viagens planares. Componente Material: um pequeno orbe de adamante.\n* **Sono Eterno:** o alvo adormece e não pode ser acordado. Componente Material: fruta preparada com ervas soníferas raras.\n\nQuando a magia é lançada, você deve especificar uma condição que fará com que ela termine e solte o alvo. A condição pode ser tão específica ou elaborada quanto você quiser, mas deve ser possível de acontecer. As condições podem se basear no nome, identidade ou divindade padroeira de uma criatura, ou em ações ou qualidades observáveis, mas nunca em estatísticas intangíveis, como nível, classe ou pontos de vida. O mestre tem a palavra final sobre se uma condição é válida ou não."
  },
  "barragem elemental de vectorius": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "controle",
      "protecao"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "acido",
      "eletricidade",
      "fogo",
      "frio"
    ],
    "formattedDescription": "Criada pelo arquimago Vectorius, esta magia produz quatro esferas, de ácido, eletricidade, fogo e frio, que voam até um ponto a sua escolha. Quando atingem o ponto escolhido, explodem causando 6d6 pontos de dano de seu respectivo tipo numa área com 12m de raio. Um teste de Reflexos reduz o dano à metade. Você pode mirar cada esfera em uma criatura ou ponto diferente. Uma criatura ao alcance da explosão de mais de uma esfera deve fazer um teste de resistência para cada uma.\n\nAlém disso, as esferas causam os seguintes efeitos em criaturas que falharem em seus testes de resistência:\n* **Ácido:** Vulnerável até o fim da cena.\n* **Elétrica:** Atordoado por 1 rodada (apenas uma vez por cena).\n* **Fogo:** Em Chamas.\n* **Frio:** Lento até o fim da cena."
  },
  "chuva de meteoros": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "fogo"
    ],
    "tiposDano": [
      "fogo",
      "impacto"
    ]
  },
  "controlar o tempo": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Aquele que controla o tempo controla o mundo. Escolha um dos efeitos a seguir:\n* **Congelar o tempo:** você gera uma bolha do seu tamanho na qual o tempo passa mais lentamente. Para outras criaturas, a bolha surge e desaparece instantaneamente, mas, para você, ela dura 3 rodadas, durante as quais você pode agir e não é afetado por efeitos contínuos (como chamas). Porém, durante essas 3 rodadas, você e quaisquer efeitos que você gerar não podem sair da área que você ocupava quando lançou esta magia. Efeitos de área com duração maior que a da bolha voltam a agir normalmente quando ela termina.\n* **Saltar no tempo:** você e até 5 criaturas voluntárias são transportadas de 1 a 24 horas para o futuro, desaparecendo com um brilho. Vocês ressurgem no mesmo lugar, com a mesma velocidade e orientação; do seu ponto de vista, nenhum tempo se passou. Se um objeto sólido agora ocupa o espaço de uma criatura, ela ressurge na área vazia mais próxima.\n* **Voltar no tempo:** você revive os últimos segundos. Todas as ações da rodada anterior são desfeitas (incluindo perda de PV e PM — exceto os gastos nesta magia). Tudo retorna à posição em que estava no início do seu turno na última rodada e você é o único que sabe o que acontecerá. Outros personagens devem repetir as mesmas ações — exceto se você fizer algo a respeito (como avisar seus aliados sobre o que vai acontecer). Você só pode reviver uma mesma rodada uma vez."
  },
  "deflagracao de mana": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "tiposDano": [
      "essencia"
    ]
  },
  "desejo": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Esta é a mais poderosa das magias arcanas, permitindo alterar a realidade a seu bel-prazer. Você pode:\n* Dissipar os efeitos de qualquer magia de 4º círculo ou menor.\n* Transportar até 10 criaturas voluntárias em alcance longo para qualquer outro local, em qualquer plano.\n* Desfazer um acontecimento recente. A magia permite que um teste realizado por uma criatura em alcance longo na última rodada seja realizado novamente. Por exemplo, se um aliado morreu na última rodada devido ao ataque de um inimigo, você pode obrigar o inimigo a refazer esse ataque.\n\nVocê pode desejar por algo ainda mais poderoso. Nesse caso, a magia requer o sacrifício de 2 PM e pode fazer coisas como:\n* Criar um item mundano de até T$ 30.000.\n* Duplicar os efeitos de qualquer magia de até 4º círculo. Caso a magia precise de um componente material para ser lançada, ainda é necessário providenciar o componente.\n* Aumentar um atributo de uma criatura em +1. Cada atributo só pode ser aumentado uma vez com Desejo.\n\nDesejo pode gerar efeitos ainda mais poderosos, mas cuidado! Desejar a fortuna de um rei pode transportá-lo para a sala de tesouro real, onde você poderá ser preso ou morto; desejar ser imortal pode transformá-lo em morto-vivo, e assim por diante. Qualquer efeito que não se encaixe na lista acima deve ser decidido pelo mestre."
  },
  "engenho de mana": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "legiao": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "mata-dragao": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "area",
      "proprio"
    ],
    "tiposDano": [
      "essencia"
    ]
  },
  "possessao": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "mobilidade",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "requiem": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "semiplano": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "luz"
    ]
  },
  "sombra assassina": {
    "tradicao": [
      "Arcana"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "arma magica": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "objeto"
    ]
  },
  "aviso": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Envia um aviso telepático para uma criatura, mesmo que não possa vê-la nem tenha linha de efeito. Escolha um:\n* **Alerta:** o alvo recebe +5 em seu próximo teste de Iniciativa e de Percepção dentro da cena.\n* **Mensagem:** o alvo recebe uma mensagem sua de até 25 palavras. Vocês devem ter um idioma em comum para o alvo poder entendê-lo.\n* **Localização:** o alvo sabe onde você está naquele momento. Se você mudar de posição, ele não saberá."
  },
  "compreensao": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "escuridao": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "objeto"
    ],
    "descritores": [
      "luz"
    ]
  },
  "flecha de luz": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "luz"
    ],
    "tiposDano": [
      "luz"
    ]
  },
  "luz": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "objeto"
    ],
    "descritores": [
      "luz"
    ]
  },
  "nevoa": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "sentidos"
    ]
  },
  "percepcao rubra": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "informacao",
      "protecao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "aprimoramentoExclusivo": [
      "Aharadak"
    ]
  },
  "resistencia a energia": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "acido",
      "eletricidade",
      "fogo",
      "frio",
      "luz",
      "trevas"
    ]
  },
  "visao mistica": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "luz",
      "sentidos"
    ]
  },
  "conjurar mortos-vivos": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "dano",
      "mobilidade",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "frio",
      "mental",
      "trevas",
      "veneno"
    ],
    "tiposDano": [
      "trevas"
    ]
  },
  "dissipar magia": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "fogo"
    ]
  },
  "marca da obediencia": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "runa de protecao": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "area"
    ],
    "descritores": [
      "acido",
      "eletricidade",
      "fogo",
      "frio",
      "luz",
      "trevas"
    ]
  },
  "traicao magica": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "dano",
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "tiposDano": [
      "essencia"
    ]
  },
  "imobilizar": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "controle",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "lendas e historias": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "informacao",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Você descobre informações sobre uma criatura, objeto ou local que esteja tocando. O que exatamente você descobre depende do mestre: talvez você não descubra tudo que há para saber, mas ganhe pistas para continuar a investigação.\n\nA cada rodada que mantiver a magia, você descobre:\n* Todas as informações sobre o alvo, como se tivesse passado em todos os testes de Conhecimento para tal.\n* Todas as habilidades do alvo. Se for uma criatura, você sabe suas estatísticas de jogo como raça, classe, nível, atributos, magias, resistências e fraquezas. Se for um item mágico, aprende seu efeito e funcionamento.\n* Se o alvo está sob influência de alguma magia e todas as informações sobre as magias ativas, se houver alguma."
  },
  "manto de sombras": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "luz",
      "mental"
    ]
  },
  "pele de pedra": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "proprio"
    ]
  },
  "selo de mana": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "servo morto-vivo": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "videncia": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "informacao",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Através de uma superfície reflexiva (bacia de água benta para clérigos, lago para druidas, bola de cristal para magos, espelho para feiticeiros etc.) você pode ver e ouvir uma criatura escolhida e seus arredores (cerca de 6m em qualquer direção), mesmo que ela se mova. O alvo pode estar a qualquer distância, mas se passar em um teste de Vontade, a magia falha. A vítima recebe bônus ou penalidades em seu teste de resistência, dependendo do conhecimento que você tiver dela:\n* **Não conhece o alvo:** +10.\n* **Ouviu falar do alvo:** +5.\n* **O alvo está em outro plano ou mundo:** +5.\n* **Já encontrou o alvo pessoalmente:** +0.\n* **Tem uma pintura, escultura ou outra representação do alvo:** –2.\n* **Conhece bem o alvo:** –5.\n* **Tem um pertence pessoal ou peça de roupa do alvo:** –5.\n* **Tem uma parte do corpo do alvo (unhas, cabelos...):** –10."
  },
  "libertacao": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "muralha de ossos": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "dano",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "frio"
    ],
    "tiposDano": [
      "corte"
    ]
  },
  "viagem planar": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "suporte"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "visao da verdade": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "informacao"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "mental"
    ]
  },
  "buraco negro": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "mobilidade",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "invulnerabilidade": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "controle"
    ],
    "alvoTipo": [
      "proprio"
    ],
    "descritores": [
      "mental"
    ],
    "formattedDescription": "Esta magia cria uma barreira mágica impenetrável que protege você contra efeitos nocivos mentais ou físicos, a sua escolha:\n* **Proteção mental:** você fica imune às condições Abalado, Alquebrado, Apavorado, Atordoado, Confuso, Esmorecido, Fascinado, Frustrado e Pasmo, além de efeitos de encantamento e ilusão.\n* **Proteção física:** você fica imune às condições Atordoado, Cego, Debilitado, Enjoado, Envenenado, Exausto, Fatigado, fraco, Lento, Ofuscado e Paralisado, além de acertos críticos, ataques furtivos e doenças."
  },
  "palavra primordial": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "formattedDescription": "Você pronuncia uma palavra do idioma primordial da Criação, que causa um dos efeitos abaixo, a sua escolha:\n* **Atordoar:** a criatura fica Atordoado por 1d4+1 rodadas (apenas uma vez por cena). Se passar no teste de resistência, ou se já foi Atordoado por esta magia, fica Desprevenido por 1d4 rodadas.\n* **Cegar:** a criatura fica Cego. Se passar no teste de resistência, fica Ofuscado por 1d4 rodadas.\n* **Matar:** a criatura morre. Além do teste de Vontade, a criatura tem direito a um teste de Fortitude se tiver mais da metade de seus PV. Se passar em qualquer um deles, em vez de morrer perde 10d8 pontos de vida e fica Sangrando."
  },
  "projetar consciencia": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "informacao",
      "mobilidade"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "mental"
    ]
  },
  "roubar a alma": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "controle",
      "protecao"
    ],
    "alvoTipo": [
      "criatura"
    ]
  },
  "toque da morte": {
    "tradicao": [
      "Universal"
    ],
    "funcao": [
      "dano"
    ],
    "alvoTipo": [
      "criatura"
    ],
    "descritores": [
      "trevas"
    ],
    "tiposDano": [
      "trevas"
    ]
  }
};
