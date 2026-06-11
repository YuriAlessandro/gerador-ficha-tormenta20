---
title: Atualização 4.18 - Parceiros na Mesa Virtual
description: Parceiros na Mesa Virtual, histórico de rolagens persistente com aplicação direta de PV, PV/PM repensados e mais correções.
slug: atualizacao-4-18-parceiros-na-mesa-virtual
coverImage: <SUGESTÃO: arte de fantasia/RPG com herói acompanhado de um aliado/parceiro (cavaleiro com escudeiro, mago com familiar, ranger com lobo — ex.: dmdave.com, thegamerimages.com). Substituir por URL real antes de publicar.>
---

## Bloco 1

**Título do bloco:** Parceiros na Mesa Virtual: aliados temporários com pacote de bônus pronto pra usar

**Imagem sugerida:** Screenshot da Mesa Virtual com o painel **Parceiros** aberto na ficha de um jogador, mostrando o nome do Parceiro ("Sir Galahad"), os bônus passivos aplicados e os botões **Usar** de uma ação ativada.

Faltava um jeito de o mestre **dar uma mãozinha mecânica** pros jogadores no meio da campanha — um aliado temporário, um companheiro temporário convocado pela narrativa, um NPC que entra na sessão pra somar. A 4.18 traz **Parceiros**: o mestre anexa um Parceiro a qualquer jogador durante um encontro ativo e o pacote de bônus já cai na ficha.

A biblioteca built-in tem **12 arquétipos × 3 tiers** (Iniciante, Veterano, Mestre), cada um com seu sabor: **Adepto**, **Ajudante**, **Assassino**, **Atirador**, **Combatente**, **Destruidor**, **Fortão**, **Guardião**, **Magivocador**, **Médico**, **Perseguidor** e **Vigilante**. E se nada na lista couber, o mestre monta um **parceiro customizado** num editor livre combinando:

- **Bônus passivos** (atributos, perícias, defesa, ataque, etc.) que entram direto na ficha.
- **Ações ativadas** com custo de PM, limite por rodada e rolagem de dado embutida.
- **Habilidades narrativas** pra cor e fluff.

Do lado do jogador, aparece um painel **Parceiros** na ficha listando o que está aplicado automaticamente, as ações disponíveis com botão **Usar** e os efeitos informativos. Rolagens do parceiro entram com o overlay fullscreen e são broadcast pra mesa toda — igual a uma rolagem do próprio personagem. E o dialog **"É O SEU TURNO!"** lembra você de que tem parceiros prontos pra entrar em jogo.

Antes o item **Parceiros** ficava escondido pra quem não era apoiador, então a maior parte da comunidade nem descobria que existia. Agora ele aparece no menu pra **todo mundo**: quem não é apoiador vê um **CTA convidando a apoiar** pra liberar o uso na mesa. *Vai ficar muito mais fácil mostrar que isso existe.*

---

## Bloco 2

**Título do bloco:** Histórico de rolagens repensado: persistente, em cards e com aplicação direta de PV

**Imagem sugerida:** Screenshot do painel **Rolagens recentes** na Mesa Virtual, mostrando 2-3 cards com a imagem da ficha em círculo, faixa lateral colorida e os botões inline de **½ / ×2 / valor** pra aplicar dano/cura ao lado do resultado.

O histórico de rolagens da Mesa Virtual recebeu o redesenho mais agressivo desde que existe — e ele resolve três dores ao mesmo tempo: **sumir no refresh**, **ser difícil de ler** e **forçar o jogador a abrir a ficha pra aplicar o dano**.

- **Agora é persistente.** Antes o histórico vivia só na memória do navegador: F5 apagava tudo e quem entrava no meio da sessão não enxergava nada do que tinha rolado. Agora cada rolagem é **persistida no banco de dados** e sincronizada em tempo real — late-joiners recebem as últimas **200 rolagens** ao entrar, o histórico volta intacto após qualquer refresh, e o botão **"Limpar histórico"** do mestre zera o histórico de **todos os clientes** simultaneamente (antes cada cliente limpava só a própria tela).
- **Cada rolagem virou um card.** Imagem da ficha em círculo, faixa lateral colorida (a mesma cor que o mestre define na ordem de turno) e o valor final em destaque. Bem mais escaneável.
- **Botões inline pra aplicar dano e cura na hora.** À esquerda do valor: **½ / ×2 / valor** pra aplicar dano. À direita: **valor / ×2 / ½** pra aplicar cura. Clica e o PV da ficha é alterado **na hora**, com o dano consumindo **PV temporário primeiro**. Acabou o "rola o dado, abre a ficha, calcula, edita".

O painel inteiro também ganhou um botão pra **recolher/expandir** (igual à ordem de turno) e a preferência fica salva pra próxima sessão.

---

## Bloco 3

**Título do bloco:** Rail lateral também na visão do mestre, com seletor de alvo

**Imagem sugerida:** Screenshot da Mesa Virtual na visão do mestre com o rail à direita visível, e o popover de seleção de alvo aberto sobre o botão de dano, mostrando a lista de participantes do encontro (jogadores e ameaças) com a aba **"Recentes"** no topo.

O mestre agora tem o mesmo painel lateral à direita que os jogadores já tinham: **histórico de rolagens** + **rolagem rápida**. Mas como o mestre opera em nome de qualquer um, os botões de aplicar dano e cura funcionam de um jeito diferente.

Ao clicar em **dano** ou **cura**, abre um **popover** pra você escolher o alvo entre os **participantes do encontro** — jogadores e ameaças, na mesma lista. No topo tem um atalho de **"Recentes"** pra repetir alvos comuns (clutch quando estourou um ataque em área e você precisa aplicar 18 de fogo em 4 inimigos seguidos).

Dano em PJ atualiza a **ficha e o encontro juntos**; dano em ameaça mexe direto no participante. E o rail se **recolhe sozinho** sempre que o mestre troca de aba — porque ele compete por atenção com configurações da mesa, edição de ameaças, etc.

Outro ajuste de visão do mestre que entrou junto: **ao iniciar um encontro, só o card do combatente atual começa expandido**. Antes todo mundo abria expandido e a tela do mestre era um muro de texto na primeira rodada. Agora os demais ficam recolhidos pra você focar em quem está agindo.

---

## Bloco 4

**Título do bloco:** PV, PM e Atributos repensados pra desktop e mobile

**Imagem sugerida:** Comparação lado a lado (ou screenshot único do mobile) da nova seção de PV/PM com controles **−/+** sempre visíveis, campo de dano/cura e o círculo clicável. Mostrar também o chip colorido embaixo de um atributo afetado por condição (ex.: Carisma **−2** por Esmorecido).

Editar PV e PM era uma fricção diária. No desktop dava certo, mas exigia passar o mouse por cima do círculo — **o que simplesmente não funciona no touch**. Quem usa a ficha no celular ficava sem como editar valores. Mudei tudo:

- **Controles sempre visíveis** logo abaixo de cada círculo: um par de **−/+** com incremento ajustável (clica e o valor cai/sobe pelo passo), e um campo onde você **digita o valor** e aplica como **Dano** (consome temp primeiro, depois PV) ou **Curar** (não toca em temp).
- **Círculo clicável**, abre um **painel de edição completa** — entra pela direita no desktop e **por baixo no celular** (mantendo a ficha visível atrás). Lá dentro você ajusta atual, temporário, incremento, define um **máximo manual** que sobrescreve o cálculo automático, e tem botões dedicados de **Cura total** (zera o temp também, como descanso) e **Limpar temp**.

Com tudo isso visível direto, os controles de **−/+** e **incremento** que ainda apareciam dentro do card ficaram redundantes e foram removidos — o card de PV/PM agora é mais limpo e focado nos valores.

E o bloco de atributos ganhou um redesenho próprio. No desktop, os atributos eram empurrados pra cima com um **truque de margem negativa** pra criar aquela faixa decorativa sobreposta ao card do herói — bonito, mas frágil: quebrava sempre que algo mudava acima. Agora os atributos têm **seção própria** no desktop também (com título **"Atributos"**, igual ao mobile), sem hack de margem.

E o bônus do redesenho: quando uma **condição ativa** afeta um atributo (ex.: Esmorecido dá **−2** em Carisma), aparece um **chip colorido embaixo** da caixa mostrando exatamente a magnitude — vermelho pra penalidade, verde pra bônus — e o tooltip explica **Base → Modificado**. *Dá pra ver em 1 segundo o que está afetando o personagem.*

---

## Bloco 5

**Título do bloco:** Notificações que levam direto ao comentário (com destaque visual)

**Imagem sugerida:** Screenshot/GIF mostrando o efeito **pulse laranja** num comentário do fórum logo após o usuário clicar numa notificação — a tela rolando até o comentário e o destaque visual aparecendo.

Clicar numa notificação de comentário (fórum, blog, build, bestiário) sempre abriu **só a página**. Em discussões longas, achar o comentário que gerou a notificação virava um Ctrl+F mental.

Agora a tela **rola automaticamente** até o comentário e ele ganha um **pulse laranja** de destaque por uns segundos pra você localizar de imediato. Vale tanto pra notificações abertas dentro do app quanto pelas **push notifications do PWA** (no celular instalado). Funciona pra notificações novas — as antigas continuam levando só pra página.

E dois bugs silenciosos da notificação foram fechados junto:

- **Push notification não marcava o aviso como lido.** Quem abria pela push no celular chegava na página, mas o ícone do sino continuava com o número não-lido até clicar manualmente na lista. Agora a notificação é **marcada como lida automaticamente** ao abrir pela push.
- **Notificações de comentário em build levavam pra listagem.** O link interno apontava pra `/builds/<id>` (rota inexistente, caía na listagem geral) em vez da página da build. Agora vai direto pra `/build/<id>`. Bug bobo mas chato pra quem comenta builds.

---

## Bloco 6

**Título do bloco:** Atalhos da ficha: subir nível direto e mestre abrindo fichas da mesa

**Imagem sugerida:** Screenshot do header da ficha mostrando o novo botão de **seta-pra-cima** ao lado do botão de **editar**, com tooltip "Subir de nível" visível. Alternativa: screenshot da página de configurações da Mesa Virtual com a ficha de um jogador aberta no modal de tela cheia.

Dois cliques a menos na rotina:

- **Botão de subir nível direto no card de informações da ficha.** Antes era preciso abrir o drawer de edição de informações da ficha pra subir de nível — não fazia muito sentido. Agora, ao lado do botão de **editar**, apareceu um novo botão (ícone de seta com linha pra cima) que abre o **assistente de progressão** direto. Fica desabilitado quando você já está no **nível 20**.
- **Mestre pode abrir a ficha de qualquer jogador direto da tela da mesa.** Na tela de configurações da **Mesa Virtual**, clica no **nome do jogador** (ou no nome da ficha vinculada logo abaixo) pra abrir a ficha completa em um **modal em tela cheia**, somente leitura — **sem precisar iniciar a sessão**. Vale tanto pra fichas dos jogadores quanto pros personagens do próprio mestre. Útil pra revisar build antes do encontro, conferir poderes pra preparar enredo, *etc.*

---

## Bloco 7

**Título do bloco:** Fórum: menção via botão @, comentários que crescem e nesting que funciona no celular

**Imagem sugerida:** Screenshot da caixa de comentário do fórum com o botão **@** embutido visível no canto (estilo Slack), e o lembrete discreto abaixo. Alternativa: thread profundo no celular mostrando o nesting com indentação leve e a linha vertical à esquerda.

O fórum recebeu três ajustes pequenos mas de impacto diário:

- **Botão @ embutido nas caixas de comentário.** Você sempre pôde digitar **@nome** pra mencionar classes, raças, poderes e outros itens da enciclopédia em comentários — mas quase ninguém sabia. Agora um botão **@** está embutido na própria caixa de comentário (estilo Slack): clica pra inserir o **@** e começa a procurar o que quer citar. Um lembrete discreto abaixo da caixa reforça o atalho.
- **Caixas crescem com o texto.** Os campos de **comentar**, **responder** e **editar** começavam pequenos e ficavam apertados em textos longos. Agora a caixa **se expande automaticamente** conforme você digita (até 15 linhas) e só depois vira scroll interno.
- **Nesting no celular não come mais o texto.** Respostas profundas comprimiam tanto o espaço de leitura que o conteúdo saía da tela. A indentação agora é leve e com **limite de 3 níveis no celular** (4 no desktop), e uma linha vertical sutil à esquerda continua mostrando que o comentário é uma resposta aninhada — sem comer espaço útil.

---

## Bloco 8

**Título do bloco:** Outras correções e ajustes

A 4.18 também fechou várias frentes que vinham incomodando:

- **App forçava modo retrato mesmo com a tela desbloqueada:** o app instalado abria sempre em **retrato**, mesmo com a rotação do celular liberada — péssimo pra quem usa deitado. Agora o app respeita o **lock de orientação** do próprio aparelho.
- **Botão "Salvar" travado ao criar efeito customizado com escopo "Qualquer arma":** ao criar um **efeito customizado** e escolher **Dano de arma** ou **Ataque (corpo a corpo / distância)**, o escopo já aparecia como **Qualquer arma**, mas o botão **Salvar** só destravava se você trocasse o escopo e voltasse. O estado inicial agora sincroniza com a UI — Salvar fica liberado imediatamente.
- **"Passo-a-passo da Criação" aparecia vazio em fichas salvas na nuvem:** fichas geradas pelo Wizard (manual ou aleatório) que passavam pela nuvem voltavam com a seção em branco. O passo-a-passo era descartado no envio. Agora ele é preservado integralmente — fichas novas (ou re-salvas após esta atualização) voltam a exibir todas as decisões da criação.
- **"Suas mesas" na home não mostrava suas mesas no primeiro carregamento:** mesmo participando de mesas, a home exibia o convite **"Crie sua primeira mesa"** e só passava a listar depois que você visitava **Mesas Virtuais** e voltava. Agora a home busca suas mesas automaticamente.
- **Home destaca apenas a mesa mais recente:** o bloco **Suas mesas** agora mostra somente **1 mesa** (a mais recente da qual você participa) lado a lado com o botão **+ Nova mesa**. Os nomes deixam de aparecer truncados; a lista completa continua acessível pelo atalho **Ver todas**.

A lista completa, como sempre, está no [Changelog](/changelog).
