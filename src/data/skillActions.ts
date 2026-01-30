import Skill from '../interfaces/Skills';

export interface SkillAction {
  name: string;
  summary: string;
  description: string;
}

type SkillActionsMap = {
  [key in Skill]?: SkillAction[];
};

const skillActions: SkillActionsMap = {
  [Skill.ADESTRAMENTO]: [
    {
      name: 'Acalmar Animal',
      summary: 'CD 25, ação completa. Acalme um animal nervoso ou agressivo.',
      description: `Você acalma um animal nervoso ou agressivo. Isso permite a você controlar um cavalo assustado ou convencer um lobo a não devorá-lo.

Este uso gasta uma ação completa.`,
    },
    {
      name: 'Manejar Animal',
      summary: 'CD 15, ação de movimento. Faça um animal realizar uma tarefa.',
      description: `Você faz um animal realizar uma tarefa para a qual foi treinado (como "atacar", "sentar", "vigiar"...).

Isso permite usar Adestramento como Pilotagem para veículos de tração animal.

Este uso gasta uma ação de movimento.`,
    },
  ],
  [Skill.ACROBACIA]: [
    {
      name: 'Amortecer Queda',
      summary: 'CD 15, apenas treinado. Reduza dano de queda.',
      description: `Quando cai, você pode gastar uma reação e fazer um teste de Acrobacia para reduzir o dano.

Se passar, reduz o dano da queda em 1d6, mais 1d6 para cada 5 pontos pelos quais o resultado do teste exceder a CD.

Se reduzir o dano a zero, você cai de pé.`,
    },
    {
      name: 'Equilíbrio',
      summary: 'CD 10-20. Ande por superfícies precárias.',
      description: `Se estiver andando por superfícies precárias, você precisa fazer testes de Acrobacia para não cair. Cada ação de movimento exige um teste.

• Se passar, você avança metade do seu deslocamento
• Se falhar, não avança
• Se falhar por 5 ou mais, cai

A CD é:
• 10 para piso escorregadio
• 15 para uma superfície estreita (como o topo de um muro)
• 20 para uma superfície muito estreita (como uma corda esticada)

Você pode sofrer –5 no teste para avançar seu deslocamento total.

Quando está se equilibrando você fica desprevenido e, se sofrer dano, deve fazer um novo teste de Acrobacia; se falhar, cai.`,
    },
    {
      name: 'Escapar',
      summary: 'CD varia. Escape de amarras.',
      description: `Você pode escapar de amarras. A dificuldade varia:

• Cordas: CD igual ao resultado do teste de Destreza de quem o amarrou +10
• Redes: CD 20
• Algemas: CD 30

Este uso gasta uma ação completa.`,
    },
    {
      name: 'Levantar-se Rapidamente',
      summary: 'CD 20, apenas treinado. Levante-se como ação livre.',
      description: `Se estiver caído, você pode fazer um teste de Acrobacia para ficar de pé. Você precisa ter uma ação de movimento disponível.

Se passar no teste, se levanta como uma ação livre.

Se falhar, gasta sua ação de movimento, mas continua caído.`,
    },
    {
      name: 'Passar por Espaço Apertado',
      summary: 'CD 25, apenas treinado. Passe por espaços estreitos.',
      description: `Você pode se espremer por espaços estreitos, suficientes para criaturas uma categoria de tamanho menor.

Você gasta uma ação completa e avança metade do deslocamento.`,
    },
    {
      name: 'Passar por Inimigo',
      summary: 'Teste oposto. Atravesse um espaço ocupado por inimigo.',
      description: `Você pode atravessar um espaço ocupado por um inimigo como parte de seu movimento.

Faça um teste de Acrobacia oposto ao teste de Acrobacia, Iniciativa ou Luta do oponente (o que for melhor).

• Se você passar, atravessa o espaço
• Se falhar, não atravessa e sua ação de movimento termina

Um espaço ocupado por um inimigo conta como terreno difícil.`,
    },
  ],
  [Skill.ATLETISMO]: [
    {
      name: 'Corrida',
      summary: 'Ação completa. Avança quadrados igual ao resultado do teste.',
      description: `Gaste uma ação completa e faça um teste de Atletismo. Você avança um número de quadrados de 1,5m igual ao resultado do teste. Assim, se somar 20 no teste, avança 20 quadrados de 1,5m.

Você recebe um modificador de +/–2 para cada 1,5m de deslocamento acima ou abaixo de 9m que possua. Assim, um elfo (deslocamento 12m) recebe +4 em testes de Atletismo para correr, enquanto um anão (deslocamento 6m) sofre uma penalidade de –4.

Você só pode correr em linha reta e não pode correr através de terreno difícil.

Você pode correr por um número de rodadas igual a 1 + sua Constituição. Após isso, deve fazer um teste de Fortitude por rodada (CD 15 +1 por teste anterior). Se falhar, fica fatigado.`,
    },
    {
      name: 'Escalar',
      summary: 'Ação de movimento. CD varia por superfície (10-25).',
      description: `Você pode subir superfícies inclinadas ou verticais. Gaste uma ação de movimento e faça um teste de Atletismo. Se passar, você avança metade do seu deslocamento. Se falhar, não avança. Se falhar por 5 ou mais, você cai.

A CD é:
• 10 para superfícies com apoios para os pés e mãos (como o cordame de um navio)
• 15 para uma árvore
• 20 para um muro com reentrâncias (como o de uma ruína)
• 25 para um muro liso (como o de um castelo)

Você pode sofrer –5 em seu teste para avançar seu deslocamento total.

Quando está escalando você fica desprevenido e, se sofrer dano, deve fazer um novo teste de Atletismo; se falhar, você cai.

Se um personagem adjacente a você estiver escalando e cair, você pode tentar pegá-lo. Faça um teste de Atletismo contra a CD da superfície +10. Se passar, segura o personagem. Se falhar por 5 ou mais, você também cai!`,
    },
    {
      name: 'Natação',
      summary: 'Ação de movimento. CD varia pela água (10-20+).',
      description: `Se iniciar seu turno na água, você precisa gastar uma ação de movimento e fazer um teste de Atletismo.

A CD é:
• 10 para água calma
• 15 para agitada
• 20 ou mais para tempestuosa

Se passar, você pode avançar metade de seu deslocamento. Se falhar, consegue boiar, mas não avançar. Se falhar por 5 ou mais, você afunda.

Se quiser avançar mais, pode gastar uma segunda ação de movimento na mesma rodada para outro teste de Atletismo.

Se você estiver submerso (seja por ter falhado no teste de Atletismo, seja por ter mergulhado de propósito), deve prender a respiração. Você pode prender a respiração por um número de rodadas igual a 1 + sua Constituição. Após isso, deve fazer um teste de Fortitude por rodada (CD 15 +1 por teste anterior). Se falhar, se afoga (é reduzido a 0 pontos de vida). Se continuar submerso, perde 3d6 pontos de vida por rodada até ser tirado da água ou morrer.

Você sofre penalidade de armadura em testes de Atletismo para nadar.`,
    },
  ],
  [Skill.ATUACAO]: [
    {
      name: 'Apresentação',
      summary: 'CD 20. Ganhe dinheiro com uma apresentação (leva um dia).',
      description: `Você pode se apresentar para ganhar dinheiro. Faça um teste de Atuação (CD 20). Se passar, você recebe T$ 1d6, mais T$ 1d6 para cada 5 pontos pelos quais o resultado do teste exceder a CD.

Este uso leva um dia (ou noite...).

Os valores recebidos pressupõem que você está se apresentando em um lugar propício, como o palco de uma taverna. De acordo com o mestre, você pode receber:
• Metade do valor, se estiver em um lugar inadequado (as ruas de uma cidade, um acampamento militar)
• O dobro, se estiver em um lugar especialmente propício (um festival, os salões de um palácio)`,
    },
    {
      name: 'Impressionar',
      summary: 'Teste oposto. Receba +2 em perícias de Carisma contra o alvo.',
      description: `Faça um teste de Atuação oposto pelo teste de Vontade de quem você quer impressionar.

Se você passar, recebe +2 em testes de perícias baseadas em Carisma contra essa pessoa no mesmo dia.

Se falhar, sofre –2 nesses testes e não pode tentar de novo no mesmo dia.

Se estiver tentando impressionar mais de uma pessoa, o mestre faz apenas um teste pela plateia, usando o melhor bônus.

Este uso leva de alguns minutos (canto ou dança) até algumas horas (apresentação teatral).`,
    },
  ],
  [Skill.CAVALGAR]: [
    {
      name: 'Conduzir',
      summary: 'Parte do movimento. CD 15-25 para atravessar obstáculos.',
      description: `Cavalgar através de obstáculos exige testes de Cavalgar. A CD é:
• 15 para terreno ruim e obstáculos pequenos (planície pedregosa, vala estreita)
• 25 para terreno perigoso ou obstáculos grandes (encosta nevada, pântano traiçoeiro)

Se você falhar, cai da montaria e sofre 1d6 pontos de dano.

Conduzir é parte de seu movimento e não exige uma ação.

Esta perícia exige uma sela. Sem ela, você sofre –5 no teste.`,
    },
    {
      name: 'Galopar',
      summary: 'Ação completa. Avança quadrados igual ao resultado do teste.',
      description: `Gaste uma ação completa e faça um teste de Cavalgar. Você avança um número de quadrados de 1,5m igual ao resultado do teste.

Seu teste sofre um modificador de +/–2 para cada 1,5m de deslocamento acima ou abaixo de 9m que você possua.

Esta perícia exige uma sela. Sem ela, você sofre –5 no teste.`,
    },
    {
      name: 'Montar Rapidamente',
      summary: 'CD 20. Monte ou desmonte como ação livre.',
      description: `Você pode montar ou desmontar como uma ação livre (o normal é gastar uma ação de movimento).

Se falhar por 5 ou mais, você cai no chão.

Esta perícia exige uma sela. Sem ela, você sofre –5 no teste.`,
    },
  ],
  [Skill.CONHECIMENTO]: [
    {
      name: 'Idiomas',
      summary: 'CD 20 (ou 30 para exóticos). Entenda idiomas desconhecidos.',
      description: `Você pode entender idiomas desconhecidos. Se falhar por 5 ou mais, você tira uma conclusão falsa.

Idiomas exóticos ou muito antigos têm CD 30.`,
    },
    {
      name: 'Informação',
      summary: 'CD 20-30. Responda dúvidas gerais sobre o mundo.',
      description: `Você responde dúvidas gerais.

• Questões simples, como o ano de fundação de um reino, não exigem testes
• Questões complexas, como saber o antídoto de um veneno, têm CD 20
• Mistérios e enigmas, como a origem de uma antiga maldição, têm CD 30`,
    },
  ],
  [Skill.CURA]: [
    {
      name: 'Cuidados Prolongados',
      summary:
        'CD 15, apenas treinado. Aumente a recuperação de PV do paciente.',
      description: `Você trata uma pessoa para que ela se recupere mais rapidamente. Se passar, ela aumenta sua recuperação de PV em +1 por nível nesse dia.

Este uso leva uma hora e o número máximo de pessoas que você pode cuidar é igual ao seu nível.

Esta perícia exige uma maleta de medicamentos. Sem ela, você sofre –5 no teste. Você pode usar a perícia Cura em si mesmo, mas sofre –5 no teste.`,
    },
    {
      name: 'Necropsia',
      summary: 'CD 20 (ou 30), apenas treinado. Determine causa da morte.',
      description: `Você examina um cadáver para determinar a causa e o momento aproximado da morte.

Causas raras ou extraordinárias, como um veneno ou maldição, possuem CD 30.

Este uso leva dez minutos.

Esta perícia exige uma maleta de medicamentos. Sem ela, você sofre –5 no teste.`,
    },
    {
      name: 'Primeiros Socorros',
      summary: 'CD 15, ação padrão. Estabilize um personagem sangrando.',
      description: `Você estabiliza um personagem adjacente que esteja sangrando.

Este uso gasta uma ação padrão.

Esta perícia exige uma maleta de medicamentos. Sem ela, você sofre –5 no teste. Você pode usar a perícia Cura em si mesmo, mas sofre –5 no teste.`,
    },
    {
      name: 'Tratamento',
      summary: 'Apenas treinado. Ajude vítima de doença ou veneno.',
      description: `Você ajuda a vítima de uma doença ou veneno com efeito contínuo. Gaste uma ação completa e faça um teste de Cura contra a CD da doença ou veneno.

Se você passar, o paciente recebe +5 em seu próximo teste de Fortitude contra esse efeito.

Esta perícia exige uma maleta de medicamentos. Sem ela, você sofre –5 no teste. Você pode usar a perícia Cura em si mesmo, mas sofre –5 no teste.`,
    },
  ],
  [Skill.DIPLOMACIA]: [
    {
      name: 'Barganha',
      summary: 'Teste oposto. Mude o preço em 10-20% a seu favor.',
      description: `Comprando ou vendendo algo, você pode barganhar. Seu teste de Diplomacia é oposto pelo teste de Vontade do negociante.

• Se passar, você muda o preço em 10% a seu favor
• Se passar por 10 ou mais, muda em 20%
• Se falhar por 5 ou mais, você ofende o negociante — ele não voltará a tratar com você durante pelo menos uma semana

Alguns comerciantes ou estabelecimentos podem não ter permissão de baixar seus preços.`,
    },
    {
      name: 'Mudar Atitude',
      summary: 'Teste oposto. Mude a atitude de um NPC em relação a você.',
      description: `Você muda a categoria de atitude de um NPC em relação a você ou a outra pessoa. Faça um teste de Diplomacia oposto pelo teste de Vontade do alvo.

• Se você passar, muda a atitude dele em uma categoria para cima ou para baixo, à sua escolha
• Se passar por 10 ou mais, muda em duas categorias
• Se falhar por 5 ou mais, a atitude do alvo muda uma categoria na direção oposta

Este uso gasta um minuto. Você pode sofrer –10 no teste para fazê-lo como uma ação completa (para evitar uma briga, por exemplo).

Você só pode mudar a atitude de um mesmo alvo uma vez por dia.`,
    },
    {
      name: 'Persuasão',
      summary: 'CD 20. Convença uma pessoa a fazer algo.',
      description: `Você convence uma pessoa a fazer algo, como responder uma pergunta ou prestar um favor.

• Se essa coisa for custosa (como fornecer uma carona de navio) você sofre –5 em seu teste
• Se for perigosa (como ajudar numa luta) você sofre –10 ou falha automaticamente

De acordo com o mestre, seu teste pode ser oposto ao teste de Vontade da pessoa.

Este uso gasta um minuto ou mais, de acordo com o mestre.`,
    },
  ],
  [Skill.ENGANACAO]: [
    {
      name: 'Disfarce',
      summary: 'Teste oposto. Mude sua aparência ou de outra pessoa.',
      description: `Você muda sua aparência ou a de outra pessoa. Faça um teste de Enganação oposto pelo teste de Percepção de quem prestar atenção no disfarçado.

Se você passar, a pessoa acredita no disfarce; caso contrário, percebe que há algo errado.

• Disfarces muito complexos (como uma raça diferente) impõem –5 no seu teste
• Se o disfarce é de uma pessoa específica, quem conhecer essa pessoa recebe +10 no teste de Percepção

Um disfarce exige dez minutos e um estojo de disfarces. Sem ele, você sofre –5 no teste.`,
    },
    {
      name: 'Falsificação',
      summary: 'Teste oposto. Falsifique um documento.',
      description: `Você falsifica um documento. Faça um teste de Enganação oposto pelo teste de Percepção de quem examinar o documento.

Se você passar, a pessoa acredita na falsificação; caso contrário, percebe que é falso.

Se o documento é muito complexo, ou inclui uma assinatura ou carimbo específico, você sofre –10 no teste.

Usada em conjunto com Ofício, você pode falsificar outros objetos (como joias e armas). Use Ofício para fabricar a peça e então um teste de Enganação para que ela pareça genuína.`,
    },
    {
      name: 'Fintar',
      summary: 'Ação padrão, teste oposto. Deixe o alvo desprevenido.',
      description: `Você pode gastar uma ação padrão e fazer um teste de Enganação oposto a um teste de Reflexos de um ser em alcance curto.

Se você passar, ele fica desprevenido contra seu próximo ataque, se realizado até o fim de seu próximo turno.`,
    },
    {
      name: 'Insinuação',
      summary: 'CD 20. Fale algo sem que outros entendam.',
      description: `Você fala algo para alguém sem que outras pessoas entendam do que você está falando.

Se você passar, o receptor entende sua mensagem. Se você falhar por 5 ou mais, ele entende algo diferente do que você queria.

Outras pessoas podem fazer um teste de Intuição oposto ao seu teste de Enganação. Se passarem, entendem o que você está dizendo.`,
    },
    {
      name: 'Intriga',
      summary: 'CD 20 (ou 30). Espalhe uma fofoca.',
      description: `Você espalha uma fofoca. Por exemplo, pode dizer que o dono da taverna está aguando a cerveja, para enfurecer o povo contra ele.

Intrigas muito improváveis têm CD 30.

Se você falhar por 5 ou mais, o alvo da intriga descobre que você está fofocando a respeito dele.

Mesmo que você passe, uma pessoa pode investigar a fonte da intriga e chegar até você. Isso exige um teste de Investigação por parte dela (CD igual ao seu teste para a intriga).

Este uso exige um dia ou mais, de acordo com o mestre.`,
    },
    {
      name: 'Mentir',
      summary: 'Teste oposto. Faça uma pessoa acreditar em algo falso.',
      description: `Você faz uma pessoa acreditar em algo que não é verdade. Seu teste é oposto pelo teste de Intuição da vítima.

Mentiras muito implausíveis impõem uma penalidade de –10 em seu teste.`,
    },
  ],
  [Skill.FURTIVIDADE]: [
    {
      name: 'Esconder-se',
      summary: 'Ação livre (fim do turno), teste oposto. Fique oculto.',
      description: `Faça um teste de Furtividade oposto pelos testes de Percepção de qualquer um que possa notá-lo. Todos que falharem não conseguem percebê-lo (você tem camuflagem total contra eles).

Esconder-se é uma ação livre que você só pode fazer no final do seu turno e apenas se terminar seu turno em um lugar onde seja possível se esconder (atrás de uma porta, num quarto escuro, numa mata densa, no meio de uma multidão...).

• Se tiver se movido durante o turno, você sofre –5 no teste (você pode se mover à metade do deslocamento normal para não sofrer essa penalidade)
• Se tiver atacado ou feito outra ação muito chamativa, sofre –20`,
    },
    {
      name: 'Seguir',
      summary: 'Teste oposto. Siga uma pessoa sem ser notado.',
      description: `Faça um teste de Furtividade oposto ao teste de Percepção da pessoa sendo seguida.

• Você sofre –5 se estiver em um lugar sem esconderijos ou sem movimento, como um descampado ou rua deserta
• A vítima recebe +5 em seu teste de Percepção se estiver tomando precauções para não ser seguida (como olhar para trás de vez em quando)

Se você passar, segue a pessoa até ela chegar ao seu destino. Se falhar, a pessoa o percebe na metade do caminho.`,
    },
  ],
  [Skill.GUERRA]: [
    {
      name: 'Analisar Terreno',
      summary:
        'CD 20, ação de movimento. Descubra vantagens no campo de batalha.',
      description: `Como uma ação de movimento, você pode observar o campo de batalha.

Se passar, descobre uma vantagem, como cobertura, camuflagem ou terreno elevado, se houver.`,
    },
    {
      name: 'Plano de Ação',
      summary: 'CD 20, ação padrão. Forneça +5 na Iniciativa de um aliado.',
      description: `Como uma ação padrão, você orienta um aliado em alcance médio.

Se passar, fornece +5 na Iniciativa dele. Se ele ficar com uma Iniciativa maior do que a sua e ainda não tiver agido nesta rodada, age imediatamente após seu turno.

Nas próximas rodadas, ele age de acordo com a nova ordem.`,
    },
  ],
  [Skill.INTIMIDACAO]: [
    {
      name: 'Assustar',
      summary: 'Ação padrão, teste oposto. Deixe o alvo abalado ou apavorado.',
      description: `Gaste uma ação padrão e faça um teste de Intimidação oposto pelo teste de Vontade de uma criatura em alcance curto.

• Se você passar, ela fica abalada pelo resto da cena
• Se você passar por 10 ou mais, ela fica apavorada por uma rodada e então abalada pelo resto da cena`,
    },
    {
      name: 'Coagir',
      summary: 'Teste oposto. Force uma criatura a obedecer uma ordem.',
      description: `Faça um teste de Intimidação oposto pelo teste de Vontade de uma criatura inteligente (Int –3 ou maior) adjacente.

Se você passar, ela obedece uma ordem sua (como fazer uma pequena tarefa, deixar que você passe por um lugar que ela estava protegendo...).

Se você mandá-la fazer algo perigoso ou que vá contra a natureza dela, ela recebe +5 no teste ou passa automaticamente.

Este uso gasta um minuto ou mais, de acordo com o mestre, e deixa o alvo hostil contra você.`,
    },
  ],
  [Skill.INTUICAO]: [
    {
      name: 'Perceber Mentira',
      summary: 'Teste oposto. Descubra se alguém está mentindo.',
      description: `Você descobre se alguém está mentindo.

Seu teste de Intuição é oposto pelo teste de Enganação de quem está mentindo.`,
    },
    {
      name: 'Pressentimento',
      summary: 'CD 20, apenas treinado. Analise índole ou situação anormal.',
      description: `Você analisa uma pessoa, para ter uma noção de sua índole ou caráter, ou uma situação, para saber se há algo anormal (por exemplo, se os habitantes de uma vila estão agindo de forma estranha).

Este uso apenas indica se há algo anormal, mas não revela a causa.`,
    },
  ],
  [Skill.INVESTIGACAO]: [
    {
      name: 'Interrogar',
      summary: 'CD 20-30. Descubra informações perguntando por aí.',
      description: `Você descobre informações perguntando ou indo para um lugar movimentado e mantendo os ouvidos atentos.

• Informações gerais ("Quem é o guerreiro mais forte da aldeia?") não exigem teste
• Informações restritas, que poucas pessoas conhecem ("Quem é o ancião que está sempre ao lado do rei?"), têm CD 20
• Informações confidenciais ou que podem colocar em risco quem falar sobre elas ("Quem é o líder da guilda dos ladrões?"), têm CD 30

Este uso gasta uma hora e T$ 3d6 (para comprar bebidas, subornar oficiais etc.), mas esses valores podem variar de acordo com o mestre.`,
    },
    {
      name: 'Procurar',
      summary: 'CD 15-30. Examine um local em busca de algo.',
      description: `Você examina um local em busca de algo. A CD varia:

• 15 para um item no meio de uma bagunça, mas não necessariamente escondido
• 20 para um item escondido (cofre atrás de um quadro, documento no fundo falso de uma gaveta)
• 30 para um item muito bem escondido (passagem secreta ativada por um botão, documento escrito com tinta invisível)

Este uso gasta desde uma ação completa (examinar uma escrivaninha) até um dia (pesquisar uma biblioteca).

Você também pode encontrar armadilhas (CD de acordo com a armadilha) e rastros (mas para segui-los deve usar Sobrevivência).`,
    },
  ],
  [Skill.JOGATINA]: [
    {
      name: 'Apostar',
      summary: 'Pague T$ 1d10 e faça um teste para ver quanto ganha.',
      description: `Para resolver uma noite de jogatina, pague T$ 1d10, faça um teste de perícia e consulte a tabela abaixo para determinar quanto você ganha:

• 9 ou menos: Nenhum
• 10 a 14: Metade da aposta
• 15 a 19: Valor da aposta (você "empata")
• 20 a 29: Dobro da aposta
• 30 a 39: Triplo da aposta
• 40 ou mais: Quíntuplo da aposta

O mestre pode variar o valor da aposta básica. De T$ 1d3, para uma taverna no porto frequentada por marujos e estivadores, a 1d10 × T$ 1.000, para um cassino de luxo em Valkaria.`,
    },
  ],
  [Skill.LADINAGEM]: [
    {
      name: 'Abrir Fechadura',
      summary: 'CD 20-30, ação completa. Abra uma fechadura trancada.',
      description: `Você abre uma fechadura trancada. A CD é:

• 20 para fechaduras simples (porta de loja)
• 25 para fechaduras médias (prisão, baú)
• 30 para fechaduras superiores (cofre, câmara do tesouro)

Este uso exige uma ação completa e uma gazua. Sem ela, você sofre –5 em seu teste.`,
    },
    {
      name: 'Ocultar',
      summary: 'Ação padrão, teste oposto. Esconda um objeto em você.',
      description: `Você esconde um objeto em você mesmo. Gaste uma ação padrão e faça um teste de Ladinagem oposto pelo teste de Percepção de qualquer um que possa vê-lo.

• Objetos discretos ou pequenos fornecem +5 no teste
• Objetos desajeitados ou grandes impõem –5
• Se uma pessoa revistar você, recebe +10 no teste de Percepção`,
    },
    {
      name: 'Punga',
      summary: 'CD 20, ação padrão. Pegue ou plante um objeto em alguém.',
      description: `Você pega um objeto de outra pessoa (ou planta um objeto nas posses dela). Gaste uma ação padrão e faça um teste de Ladinagem.

Se passar, você pega (ou coloca) o que queria.

A vítima tem direito a um teste de Percepção (CD igual ao resultado de seu teste de Ladinagem). Se passar, ela percebe sua tentativa, tenha você conseguido ou não.`,
    },
    {
      name: 'Sabotar',
      summary: 'CD 20-30. Desabilite um dispositivo mecânico.',
      description: `Você desabilita um dispositivo mecânico.

• Uma ação simples (emperrar uma fechadura, desativar uma armadilha básica, sabotar uma roda de carroça para que quebre 1d4 rodadas após o uso) tem CD 20
• Uma ação complexa (desativar uma armadilha avançada, sabotar um canhão para explodir quando utilizado) tem CD 30

Se você falhar por 5 ou mais, alguma coisa sai errada — a armadilha se ativa, você acha que o mecanismo está desabilitado, mas na verdade ele ainda funciona...

Usar esta perícia leva 1d4 rodadas. Você pode sofrer –5 em seu teste para fazê-lo como uma ação completa.`,
    },
  ],
  [Skill.MISTICISMO]: [
    {
      name: 'Detectar Magia',
      summary: 'CD 15, ação completa. Detecte auras mágicas em alcance curto.',
      description: `Como uma ação completa, você detecta a presença e intensidade de auras mágicas em alcance curto (mas não suas localizações exatas).

A intensidade de uma aura depende do círculo da magia ou categoria do item mágico que a gerou:
• Magias de 1º e 2º círculos e itens mágicos menores geram uma aura tênue
• Magias de 3º e 4º círculos e itens mágicos médios geram uma aura moderada
• Magias de 5º círculo e itens mágicos maiores geram uma aura poderosa
• Magias lançadas por um deus maior e artefatos geram uma aura avassaladora

Caso a aura esteja atrás de uma barreira, você sofre uma penalidade em seu teste (–5 para madeira ou pedra, –10 para ferro ou chumbo).`,
    },
    {
      name: 'Identificar Criatura',
      summary:
        'CD 15 + ND, ação padrão. Lembre características de uma criatura.',
      description: `Você analisa uma criatura mágica (construto, dragão, fada, morto-vivo etc.) que possa ver.

Se passar, lembra uma característica da criatura, como um poder ou vulnerabilidade. Para cada 5 pontos pelos quais o resultado do teste superar a CD, você lembra outra característica.

Se falhar por 5 ou mais, tira uma conclusão errada (por exemplo, acredita que a criatura é vulnerável a fogo, quando na verdade é vulnerável a frio).

Este uso gasta uma ação padrão.`,
    },
    {
      name: 'Identificar Item Mágico',
      summary: 'CD 20-30. Identifique os poderes de um item mágico.',
      description: `Você estuda um item mágico para identificar seus poderes. A CD é:

• 20 para itens mágicos menores
• 25 para médios
• 30 para itens mágicos maiores

Este uso gasta uma hora. Você pode sofrer uma penalidade de –10 no teste para diminuir o tempo para uma ação completa.`,
    },
    {
      name: 'Identificar Magia',
      summary: 'CD 15 + PM, reação. Adivinhe qual magia está sendo lançada.',
      description: `Quando alguém lança uma magia, você pode adivinhar qual é através de seus gestos e palavras.

Este uso é uma reação.`,
    },
    {
      name: 'Informação',
      summary: 'CD 20-30. Responda dúvidas sobre magia e sobrenatural.',
      description: `Você responde dúvidas relativas a magias, itens mágicos, fenômenos sobrenaturais, runas, profecias, planos de existência etc.

• Questões simples não exigem teste
• Questões complexas têm CD 20
• Mistérios e enigmas têm CD 30`,
    },
    {
      name: 'Lançar Magia de Armadura',
      summary: 'CD 20 + PM. Lance magia arcana usando armadura.',
      description: `Lançar uma magia arcana usando armadura exige um teste de Misticismo. Esse teste sofre penalidade de armadura.

Se falhar, a magia não funciona, mas gasta pontos de mana mesmo assim.`,
    },
  ],
  [Skill.NOBREZA]: [
    {
      name: 'Etiqueta',
      summary: 'CD 15. Porte-se bem em ambientes aristocráticos.',
      description: `Você sabe se portar em ambientes aristocráticos, como bailes e audiências.`,
    },
    {
      name: 'Informação',
      summary: 'CD 20-30. Responda dúvidas sobre leis, tradições e heráldica.',
      description: `Você responde dúvidas relativas a leis, tradições, linhagens e heráldica.

• Questões simples não exigem teste
• Questões complexas têm CD 20
• Mistérios e enigmas têm CD 30`,
    },
  ],
  [Skill.OFICIO]: [
    {
      name: 'Consertar',
      summary: 'CD varia, 1 hora. Repare um item destruído.',
      description: `Reparar um item destruído tem a mesma CD para fabricá-lo. Cada tentativa consome uma hora de trabalho e um décimo do preço original do item.

Em caso de falha, o tempo e o dinheiro são perdidos (mas você pode tentar novamente).`,
    },
    {
      name: 'Fabricar',
      summary: 'CD 15-20. Produza um item gastando matéria-prima e tempo.',
      description: `Você produz um item gastando matéria-prima e tempo de trabalho. A matéria-prima custa um terço do preço do item.

O tempo de trabalho depende do tipo de item:
• Um dia para consumíveis (itens alquímicos, pergaminhos, poções, munições...)
• Uma semana para não consumíveis comuns (armas, ferramentas...)
• Um mês para não consumíveis superiores e/ou mágicos

Para consumíveis, você pode sofrer –5 no teste para fabricar duas unidades do item no mesmo tempo (pagando o custo de ambas).

A critério do mestre, itens muito simples e sem efeito mecânico podem levar menos tempo. Da mesma forma, itens muito grandes ou complexos, como uma casa ou ponte, podem demorar vários meses.

A CD do teste é:
• 15 para itens simples (equipamentos de aventura, armas simples, munições, armaduras leves, escudos, preparados, catalisadores e outros a critério do mestre)
• 20 para itens complexos (armas marciais, exóticas ou de fogo, armaduras pesadas, ferramentas, vestuários, esotéricos, venenos...)`,
    },
    {
      name: 'Identificar',
      summary:
        'CD 20, ação completa. Identifique itens raros ligados ao Ofício.',
      description: `Você pode identificar itens raros e exóticos ligados ao seu Ofício.

Se passar, descobre as propriedades do item e seu preço.

Este uso gasta uma ação completa.`,
    },
    {
      name: 'Sustento',
      summary: 'CD 15, 1 semana. Ganhe dinheiro trabalhando.',
      description: `Com uma semana de trabalho e um teste de Ofício, você ganha T$ 1, mais T$ 1 por ponto que seu teste exceder a CD.

Por exemplo, com um resultado 20, ganha T$ 6 pela semana de trabalho.

Trabalhadores sem treinamento usam testes de atributo para sustento. De acordo com o mestre, outras perícias podem ser usadas para sustento, como Adestramento, Cura ou Sobrevivência.`,
    },
  ],
  [Skill.PERCEPCAO]: [
    {
      name: 'Observar',
      summary:
        'CD 15-30 (ou teste oposto). Veja coisas discretas ou escondidas.',
      description: `Você vê coisas discretas ou escondidas. A CD varia:

• 15 para algo difícil de ser visto (um livro específico em uma estante)
• 30 para algo quase invisível (uma gota de sangue em uma folha no meio de uma floresta à noite)

Para pessoas ou itens escondidos, a CD é o resultado do teste de Furtividade ou Ladinagem feito para esconder a pessoa ou o item.

Você também pode ler lábios (CD 20).`,
    },
    {
      name: 'Ouvir',
      summary: 'CD 0-20+. Escute barulhos sutis.',
      description: `Você escuta barulhos sutis.

• Conversa casual próxima tem CD 0 — a menos que exista alguma penalidade, você passa automaticamente
• Ouvir pessoas sussurrando tem CD 15
• Ouvir do outro lado de uma porta aumenta a CD em +10

Você pode fazer testes de Percepção para ouvir mesmo que esteja dormindo, mas sofre –10 no teste; um sucesso faz você acordar.

Perceber criaturas que não possam ser vistas tem CD 20, ou +10 no teste de Furtividade da criatura, o que for maior. Mesmo que você passe no teste, ainda sofre penalidades normais por lutar sem ver o inimigo.`,
    },
  ],
  [Skill.RELIGIAO]: [
    {
      name: 'Identificar Criatura',
      summary:
        'CD 15 + ND, ação padrão. Identifique criaturas de origem divina.',
      description: `Você pode identificar uma criatura com origem divina (anjos, demônios, alguns mortos-vivos e construtos etc.).

Se passar, lembra uma característica da criatura, como um poder ou vulnerabilidade. Para cada 5 pontos pelos quais o resultado do teste superar a CD, você lembra outra característica.

Se falhar por 5 ou mais, tira uma conclusão errada.

Este uso gasta uma ação padrão.`,
    },
    {
      name: 'Identificar Item Mágico',
      summary: 'CD 20-30. Identifique itens mágicos de origem divina.',
      description: `Você pode identificar um item mágico de origem divina. A CD é:

• 20 para itens mágicos menores
• 25 para médios
• 30 para itens mágicos maiores

Este uso gasta uma hora. Você pode sofrer uma penalidade de –10 no teste para diminuir o tempo para uma ação completa.`,
    },
    {
      name: 'Informação',
      summary: 'CD 20-30. Responda dúvidas sobre deuses e profecias.',
      description: `Você responde dúvidas relativas a deuses, profecias, planos de existência etc.

• Questões simples não exigem teste
• Questões complexas têm CD 20
• Mistérios e enigmas têm CD 30`,
    },
    {
      name: 'Rito',
      summary: 'CD 20. Realize uma cerimônia religiosa.',
      description: `Você realiza uma cerimônia religiosa, como um batizado, casamento ou funeral.

Isso inclui a cerimônia de penitência para redimir um devoto que tenha descumprido as Obrigações & Restrições de sua divindade.

Uma cerimônia de penitência exige um sacrifício de T$ 100 por nível de personagem do devoto ou a realização de uma missão sagrada, de acordo com o mestre.`,
    },
  ],
  [Skill.SOBREVIVENCIA]: [
    {
      name: 'Acampamento',
      summary: 'CD 15-30. Consiga abrigo e alimento para o grupo por um dia.',
      description: `Você consegue abrigo e alimento para você e seu grupo por um dia (caçando, pescando, colhendo frutos...).

A CD depende do terreno:
• 15 para planícies e colinas
• 20 para florestas e pântanos
• 25 para desertos ou montanhas
• 30 para regiões planares perigosas ou áreas de Tormenta

Regiões muito áridas ou estéreis e clima ruim (neve, tempestade etc.) impõem penalidade cumulativa de –5.

Dormir ao relento sem um acampamento e um saco de dormir diminui sua recuperação de PV e PM.

Este uso exige equipamento de viagem. Sem ele, você sofre –5 em seu teste.`,
    },
    {
      name: 'Identificar Criatura',
      summary: 'CD 15 + ND, ação padrão. Identifique animais ou monstros.',
      description: `Você pode identificar um animal ou monstro.

Se passar, lembra uma característica da criatura, como um poder ou vulnerabilidade. Para cada 5 pontos pelos quais o resultado do teste superar a CD, você lembra outra característica.

Se falhar por 5 ou mais, tira uma conclusão errada.

Este uso gasta uma ação padrão.`,
    },
    {
      name: 'Orientar-se',
      summary: 'CD 15-30. Navegue pelos ermos sem se perder.',
      description: `Um personagem viajando pelos ermos precisa fazer um teste de Sobrevivência por dia para avançar.

A CD depende do tipo de terreno:
• 15 para planícies e colinas
• 20 para florestas e pântanos
• 25 para desertos ou montanhas
• 30 para regiões planares perigosas ou áreas de Tormenta

• Se passar, você avança seu deslocamento normal
• Se falhar, avança apenas metade
• Se falhar por 5 ou mais, se perde e não avança pelo dia

Num grupo, um personagem deve ser escolhido como guia. Personagens treinados em Sobrevivência podem ajudá-lo.

Este teste é exigido apenas em jornadas perigosas (de acordo com o mestre).`,
    },
    {
      name: 'Rastrear',
      summary: 'CD 15-25, apenas treinado. Identifique e siga rastros.',
      description: `Você pode identificar e seguir rastros. A CD é:

• 15 para solo macio (neve, lama)
• 20 para solo comum (grama, terra)
• 25 para solo duro (rocha ou piso de interiores)

A CD diminui em –5 se você estiver rastreando um grupo grande (dez ou mais indivíduos) ou criaturas Enormes ou Colossais, mas aumenta em +5 em visibilidade precária (noite, chuva, neblina...).

Enquanto rastreia, seu deslocamento é reduzido à metade.

Se falhar, pode tentar novamente gastando mais um dia. Porém, a cada dia desde a criação dos rastros, a CD aumenta em +1.`,
    },
  ],
};

export const getSkillActions = (skill: Skill): SkillAction[] => {
  // Check for direct match first
  if (skillActions[skill]) {
    return skillActions[skill];
  }

  // Check if it's an Ofício variant (e.g., "Ofício (Alfaiate)")
  if (skill.startsWith('Ofício')) {
    return skillActions[Skill.OFICIO] || [];
  }

  return [];
};

export const hasSkillActions = (skill: Skill): boolean => {
  const actions = getSkillActions(skill);
  return actions.length > 0;
};

export default skillActions;
