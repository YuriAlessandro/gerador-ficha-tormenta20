(this["webpackJsonpgerador-ficha-tormenta20"]=this["webpackJsonpgerador-ficha-tormenta20"]||[]).push([[0],{42:function(e,a,o){},43:function(e,a,o){},55:function(e,a,o){"use strict";o.r(a);var s=o(0),r=o.n(s),t=o(11),i=o.n(t),n=(o(42),o(43),o(24)),d=o(80),c=o(88),m=o(83),u=o(57),l=o(85),p=o(84),A=o(32),b=o.n(A),v=o(2),h=function(e){var a=e.sheet,o=a.nome,s=a.sexo,r=a.nivel,t=a.atributos,i=a.raca,n=a.classe,d=a.pericias,c=a.pv,m=a.pm,u=a.defesa,l={mainDiv:{width:"60vw",padding:"5px 30px 30px 30px"},row:{display:"flex",borderTop:"1px solid black",padding:"5px 0"},item:{marginRight:"10px"}},p=t.map((function(e){return Object(v.jsxs)("span",{style:l.item,children:[Object(v.jsx)("strong",{children:e.name})," ",e.value," (",e.mod>0?"+":"",e.mod,")"]})})),A=d.sort().map((function(e){return Object(v.jsx)("li",{children:e})})),b=i.habilites.texts.map((function(e){return Object(v.jsx)("li",{children:e})})),h=n.habilities.map((function(e){return Object(v.jsxs)("li",{children:[Object(v.jsxs)("strong",{children:[e.name,":"]})," ",e.text]})})),f=n.proeficiencias.map((function(e){return Object(v.jsx)("li",{children:e})}));return Object(v.jsxs)("div",{style:l.mainDiv,children:[Object(v.jsxs)("div",{style:l.row,children:[Object(v.jsxs)("span",{style:l.item,children:[Object(v.jsx)("strong",{children:"Nome"})," ",o]}),Object(v.jsxs)("span",{style:l.item,children:[Object(v.jsx)("strong",{children:"Classe"})," ",n.name]}),Object(v.jsxs)("span",{style:l.item,children:[Object(v.jsx)("strong",{children:"Ra\xe7a"})," ",i.name]}),Object(v.jsxs)("span",{style:l.item,children:[Object(v.jsx)("strong",{children:"N\xedvel"})," ",r]}),Object(v.jsxs)("span",{children:[Object(v.jsx)("strong",{children:"Sexo"})," ",s]})]}),Object(v.jsx)("div",{style:l.row,children:p}),Object(v.jsxs)("div",{style:l.row,children:[Object(v.jsxs)("span",{style:l.item,children:[Object(v.jsx)("strong",{children:"PV"})," ",c]}),Object(v.jsxs)("span",{style:l.item,children:[Object(v.jsx)("strong",{children:"PM"})," ",m]}),Object(v.jsxs)("span",{style:l.item,children:[Object(v.jsx)("strong",{children:"Defesa"})," ",u]})]}),Object(v.jsx)("div",{style:l.row,children:Object(v.jsxs)("div",{children:[Object(v.jsx)("strong",{children:"Per\xedcias Treinadas:"}),Object(v.jsx)("ul",{children:A})]})}),Object(v.jsx)("div",{style:l.row,children:Object(v.jsxs)("div",{children:[Object(v.jsx)("strong",{children:"Proefici\xeancias"}),Object(v.jsx)("ul",{children:f})]})}),Object(v.jsx)("div",{style:l.row,children:Object(v.jsxs)("div",{children:[Object(v.jsx)("strong",{children:"Equipamento Inicial"}),Object(v.jsx)("ul",{children:Object(v.jsx)("li",{children:"A FAZER"})})]})}),Object(v.jsx)("div",{style:l.row,children:Object(v.jsxs)("div",{children:[Object(v.jsx)("strong",{children:"Habilidades de Ra\xe7a"}),Object(v.jsx)("ul",{children:b})]})}),Object(v.jsx)("div",{style:l.row,children:Object(v.jsxs)("div",{children:[Object(v.jsx)("strong",{children:"Habilidades de Classe"}),Object(v.jsx)("ul",{children:h})]})}),Object(v.jsx)("div",{style:l.row,children:Object(v.jsxs)("div",{children:[Object(v.jsx)("strong",{children:"Magias"}),0===n.magics.length&&Object(v.jsx)("ul",{children:Object(v.jsx)("li",{children:"N\xe3o possui."})})]})}),Object(v.jsx)("div",{style:l.row})]})},f=o(86),O=o(89),g=o(82),I=Object(d.a)((function(){return{link:{color:"#FAFAFA"}}})),C=function(e){var a=e.visible,o=e.onCloseSidebar,s={sidebar:{position:"absolute",background:"rgba(0,0,0,0.95)",top:"0",width:"300px",height:"97.9vh",zIndex:"1",boxShadow:"5px 0px 5px 0px rgba(0,0,0,0.75)",color:"#FAFAFA",display:a?"block":"none",paddingTop:"20px",transition:"width 20s"},closeIcon:{textAlign:"right",paddingRight:"15px"}},r=I();return Object(v.jsxs)("div",{style:s.sidebar,children:[Object(v.jsx)("div",{style:s.closeIcon,children:Object(v.jsx)(u.a,{style:{cursor:"pointer"},onClick:o,variant:"inherit",children:"X"})}),Object(v.jsxs)(f.a,{children:[Object(v.jsx)(O.a,{children:Object(v.jsx)(u.a,{variant:"inherit",children:Object(v.jsx)(g.a,{className:r.link,href:"https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions/new",children:"Sugest\xf5es, Ideias e Feedbacks"})})}),Object(v.jsx)(O.a,{children:Object(v.jsx)(u.a,{variant:"inherit",children:Object(v.jsx)(g.a,{className:r.link,href:"https://github.com/YuriAlessandro/gerador-ficha-tormenta20",children:"Contribua com o Projeto"})})})]})]})},j=["For\xe7a","Destreza","Constitui\xe7\xe3o","Intelig\xeancia","Sabedoria","Carisma"],x=[{name:"Suraggel",habilites:{attrs:[{attr:"Sabedoria",mod:4},{attr:"Carisma",mod:2},{attr:"Destreza",mod:4}],other:[],texts:["Voc\xea \xe9 uma criatura do tipo esp\xedrito e recebe vis\xe3o no escuro.","Voc\xea recebe +2 em Diplomacia e Intui\xe7\xe3o. Al\xe9m disso, pode lan\xe7ar Luz (como uma magia divina; atributo-chave Carisma). Caso aprenda novamente essa magia, o custo para lan\xe7\xe1-la diminui em \u20131 PM."]}},{name:"An\xe3o",habilites:{attrs:[{attr:"Constitui\xe7\xe3o",mod:4},{attr:"Sabedoria",mod:2},{attr:"Destreza",mod:-2}],other:[{type:"pv",mod:3}],texts:["Voc\xea recebe vis\xe3o no escuro e +2 em testes de Percep\xe7\xe3o e Sobreviv\xeancia realizados no subterr\xe2neo.","Seu deslocamento \xe9 6m (em vez de 9m). Por\xe9m, seu deslocamento n\xe3o \xe9 reduzido por uso de armadura ou excesso de carga.","Voc\xea recebe +3 pontos de vida no 1\xba n\xedvel e +1 por n\xedvel seguinte (J\xc1 INCLUSO).","Voc\xea \xe9 perito nas armas tradicionais an\xe3s, seja por ter treinado com elas, seja por us\xe1-las como ferramentas de of\xedcio. Para voc\xea, todos os machados, martelos, marretas e picaretas s\xe3o armas simples. Voc\xea recebe +2 em ataques com essas armas."]}},{name:"Dahllan",habilites:{attrs:[{attr:"Sabedoria",mod:4},{attr:"Destreza",mod:2},{attr:"Intelig\xeancia",mod:-2}],other:[],texts:["Voc\xea pode lan\xe7ar a magia Controlar Plantas (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em \u20131 PM.","Voc\xea pode gastar uma a\xe7\xe3o de movimento e 1 PM para transformar sua pele em casca de \xe1rvore, recebendo +2 na Defesa at\xe9 o fim da cena.","Voc\xea pode se comunicar com animais por meio de linguagem corporal e vocaliza\xe7\xf5es. Voc\xea pode usar Adestramento para mudar atitude e pedir favores de animais (veja Diplomacia, na p\xe1gina 117). Caso receba esta habilidade novamente, recebe +2 em Adestramento."]}},{name:"Elfo",habilites:{attrs:[{attr:"Intelig\xeancia",mod:4},{attr:"Destreza",mod:2},{attr:"Constitui\xe7\xe3o",mod:-2}],other:[{type:"pm",mod:1,pernivel:!0}],texts:["Seu deslocamento \xe9 12m (em vez de 9m).","Voc\xea recebe +1 ponto de mana por n\xedvel (J\xc1 INCLUSO).","Voc\xea recebe vis\xe3o na penumbra e +2 em Misticismo e Percep\xe7\xe3o."]}},{name:"Goblin",habilites:{attrs:[{attr:"Destreza",mod:4},{attr:"Intelig\xeancia",mod:2},{attr:"Carisma",mod:-2}],other:[],texts:["Voc\xea n\xe3o sofre penalidades em testes de per\xedcia por n\xe3o usar kits. Se usar o kit, recebe +2 no teste de per\xedcia.","Voc\xea recebe vis\xe3o no escuro e deslocamento de escalada igual ao seu deslocamento terrestre.","Seu tamanho \xe9 Pequeno (veja a p\xe1gina 106), mas seu deslocamento se mant\xe9m 9m. Apesar de pequenos, goblins s\xe3o r\xe1pidos.","Voc\xea recebe +2 em Fortitude e sua recupera\xe7\xe3o de PV e PM nunca \xe9 inferior ao seu n\xedvel."]}},{name:"Lefeu",habilites:{attrs:[{attr:"Carisma",mod:-2},{attr:"any",mod:2},{attr:"any",mod:2},{attr:"any",mod:2}],other:[],texts:["Voc\xea \xe9 uma criatura do tipo monstro e recebe +5 em testes de resist\xeancia contra efeitos causados por lefeu e pela Tormenta.","Todo lefou possui defeitos f\xedsicos que, embora desagrad\xe1veis, conferem certas vantagens. Voc\xea recebe +2 em duas per\xedcias a sua escolha. Cada um desses b\xf4nus conta como um poder da Tormenta. Voc\xea pode trocar um desses b\xf4nus por um poder da Tormenta a sua escolha. Esta habilidade n\xe3o causa perda de Carisma."]}},{name:"Minotauro",habilites:{attrs:[{attr:"For\xe7a",mod:4},{attr:"Constitui\xe7\xe3o",mod:2},{attr:"Sabedoria",mod:-2}],other:[{type:"defesa",mod:1}],texts:["Voc\xea possui uma arma natural de chifres (dano 1d6, cr\xedtico x2, perfura\xe7\xe3o). Quando usa a a\xe7\xe3o atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com os chifres.","Sua pele \xe9 dura como a de um touro. Voc\xea recebe +1 na Defesa (J\xc1 INCLUSO).","Voc\xea tem olfato apurado. Voc\xea n\xe3o fica desprevenido e sofre apenas camuflagem (em vez de camuflagem total) contra inimigos em alcance curto que n\xe3o possa ver."]}},{name:"Qareen",habilites:{attrs:[{attr:"Carisma",mod:4},{attr:"Intelig\xeancia",mod:2},{attr:"Sabedoria",mod:-2}],other:[{type:"defesa",mod:1}],texts:["Se lan\xe7ar uma magia que algu\xe9m tenha pedido desde seu \xfaltimo turno, o custo da magia diminui em \u20131 PM. Fazer um desejo ao qareen \xe9 uma a\xe7\xe3o livre.","Conforme sua ascend\xeancia, voc\xea recebe resist\xeancia 10 a um tipo de dano. Escolha uma: frio (qareen da \xe1gua), eletricidade (do ar), fogo (do fogo), \xe1cido (da terra), luz (da luz) ou trevas (qareen das trevas).","Voc\xea pode lan\xe7ar uma magia de 1\xba c\xedrculo a sua escolha (atributo- chave Carisma). Caso aprenda novamente essa magia, seu custo diminui em \u20131 PM."]}},{name:"Golem",habilites:{attrs:[{attr:"For\xe7a",mod:4},{attr:"Constitui\xe7\xe3o",mod:2},{attr:"Carisma",mod:-2}],other:[{type:"defesa",mod:2}],texts:["Como uma a\xe7\xe3o completa, voc\xea pode gastar pontos de mana para recuperar pontos de vida, \xe0 taxa de 5 PV por PM.","Seu corpo artificial \xe9 resistente, mas r\xedgido. Voc\xea recebe +2 na Defesa (J\xc1 INCLUSO), mas possui penalidade de armadura \u20132 e seu deslocamento \xe9 6m. Voc\xea leva um dia para vestir ou remover uma armadura (pois precisa acoplar as pe\xe7as dela a seu chassi).","Voc\xea \xe9 uma criatura do tipo construto. Recebe vis\xe3o no escuro e imunidade a doen\xe7as, fadiga, sangramento, sono e venenos. Al\xe9m disso, n\xe3o precisa respirar, alimentar-se ou dormir. Por fim, n\xe3o recupera pontos de vida por descanso e n\xe3o se beneficia de habilidades de cura e itens inger\xedveis (comidas, po\xe7\xf5es etc.). Voc\xea precisa ficar inerte por oito horas por dia para recarregar sua fonte de energia. Se fizer isso, recupera PM por descanso em condi\xe7\xf5es normais (golens n\xe3o s\xe3o afetados por condi\xe7\xf5es boas ou ruins de descanso).","Escolha entre \xe1gua (frio), ar (eletricidade), fogo (fogo) e terra (\xe1cido). Voc\xea \xe9 imune a dano causado por essa energia. Se fosse sofrer dano m\xe1gico dessa energia, em vez disso cura PV em quantidade igual \xe0 metade do dano. Por exemplo, se um golem com esp\xedrito elemental do fogo \xe9 atingido por uma Bola de Fogo que causa 30 pontos de dano, em vez de sofrer esse dano, ele recupera 15 PV.","Como uma criatura artificial, voc\xea j\xe1 foi constru\xeddo \u201cpronto\u201d. N\xe3o teve uma inf\xe2ncia \u2014 portanto, n\xe3o tem direito a escolher uma origem e receber benef\xedcios por ela."]}},{name:"Hynne",habilites:{attrs:[{attr:"Destreza",mod:4},{attr:"Carisma",mod:2},{attr:"For\xe7a",mod:-2}],other:[],texts:["Quando faz um ataque \xe0 dist\xe2ncia com uma funda ou uma arma de arremesso, seu dano aumenta em um passo.","Seu tamanho \xe9 Pequeno (veja a p\xe1gina 106) e seu deslocamento \xe9 6m. Voc\xea recebe +2 em Engana\xe7\xe3o e usa o modificador de Destreza para Atletismo (em vez de For\xe7a).","Quando faz um teste de resist\xeancia, voc\xea pode gastar 1 PM para rolar este teste novamente."]}},{name:"Humano",habilites:{attrs:[{attr:"any",mod:2},{attr:"any",mod:2},{attr:"any",mod:2}],other:[{type:"pericias",allowed:"any"},{type:"pericias",allowed:"any"}],texts:["Filhos de Valkaria, Deusa da Ambi\xe7\xe3o, humanos podem se destacar em qualquer caminho que escolherem.","Voc\xea se torna treinado em duas per\xedcias a sua escolha (n\xe3o precisam ser da sua classe). Voc\xea pode trocar uma dessas per\xedcias por um poder geral a sua escolha (J\xc1 INCLUSO)."]}},{name:"Kliren",habilites:{attrs:[{attr:"Intelig\xeancia",mod:4},{attr:"Carisma",mod:2},{attr:"For\xe7a",mod:-2}],other:[{type:"pericias",allowed:"any"}],texts:["Sua natureza multifacetada fez com que voc\xea aprendesse conhecimentos variados. Voc\xea se torna treinado em uma per\xedcia a sua escolha (n\xe3o precisa ser da sua classe, J\xc1 INCLUSO).","Quando faz um teste de atributo ou per\xedcia, voc\xea pode gastar 2 PM para substituir o modificador de atributo utilizado por Intelig\xeancia. Por exemplo, ao fazer um teste de Atletismo voc\xea pode gastar 2 PM para usar seu modificador de Intelig\xeancia em vez do modificador de For\xe7a.","oc\xea sofre 1 ponto de dano adicional por dado de dano de impacto. Por exemplo, se for atingido por uma clava (dano 1d6), sofre 1d6+1 pontos de dano. Se cair de 3m de altura (dano 2d6), sofre 2d6+2 pontos de dano.","Voc\xea recebe profici\xeancia em armas de fogo e +2 em testes de Of\xedcio (um qualquer, a sua escolha)."]}},{name:"Medusa",habilites:{attrs:[{attr:"Destreza",mod:4},{attr:"Carisma",mod:2}],other:[{type:"pericias",allowed:"any"}],texts:["Voc\xea \xe9 uma criatura do tipo monstro e recebe vis\xe3o no escuro.","Voc\xea recebe resist\xeancia a veneno 5 e pode gastar uma a\xe7\xe3o de movimento e 1 PM para envenenar uma arma que esteja empunhando. A arma causa +1d12 pontos de dano de veneno. O veneno dura at\xe9 voc\xea acertar um ataque ou at\xe9 o fim da cena (o que acontecer primeiro).","Voc\xea pode gastar uma a\xe7\xe3o de movimento e 1 PM para for\xe7ar uma criatura em alcance curto a fazer um teste de Fortitude (CD Car). Se a criatura falhar, fica atordoada por 1 rodada. Se passar, fica imune a esta habilidade por um dia."]}},{name:"Osteon",habilites:{attrs:[{attr:"Constitui\xe7\xe3o",mod:-2},{attr:"any",mod:2},{attr:"any",mod:2},{attr:"any",mod:2}],other:[],texts:["Voc\xea recebe resist\xeancia a corte, frio e perfura\xe7\xe3o 5.","Voc\xea se torna treinado em uma per\xedcia (n\xe3o precisa ser da sua classe) ou recebe um poder geral a sua escolha. Como alternativa, voc\xea pode ser um osteon de outra ra\xe7a humanoide que n\xe3o humano. Neste caso, voc\xea ganha uma habilidade dessa ra\xe7a a sua escolha. Se a ra\xe7a era de tamanho diferente de M\xe9dio, voc\xea tamb\xe9m possui sua categoria de tamanho (N\xc3O INCLUSO, ESCOLHA O DESEJADO E ADICIONE MANUALMENTE NA SUA FICHA).","Voc\xea \xe9 uma criatura do tipo morto-vivo. Recebe vis\xe3o no escuro e imunidade a doen\xe7as, fadiga, sangramento, sono e venenos. Al\xe9m disso, n\xe3o precisa respirar, alimentar-se ou dormir. Por fim, habilidades m\xe1gicas de cura causam dano a voc\xea e voc\xea n\xe3o se beneficia de itens inger\xedveis (comidas, po\xe7\xf5es etc.), mas dano de trevas recupera seus PV."]}},{name:"Sereia",habilites:{attrs:[{attr:"any",mod:2},{attr:"any",mod:2},{attr:"any",mod:2}],other:[],texts:["Voc\xea pode lan\xe7ar duas das magias a seguir: Amedrontar, Comando, Despeda\xe7ar, Enfeiti\xe7ar, Hipnotismo ou Sono (atributo-chave Carisma). Caso aprenda novamente uma dessas magias, seu custo diminui em \u20131 PM.","Para voc\xea, o tridente \xe9 uma arma simples. Al\xe9m disso, voc\xea recebe +2 em rolagens de dano com azagaias, lan\xe7as e tridentes","Voc\xea pode respirar debaixo d\u2019\xe1gua e possui uma cauda que fornece deslocamento de nata\xe7\xe3o 12m. Quando fora d\u2019\xe1gua, sua cauda desaparece e d\xe1 lugar a pernas (deslocamento 9m). Se permanecer mais de um dia sem contato com \xe1gua, voc\xea n\xe3o recupera PM com descanso at\xe9 voltar para a \xe1gua (ou, pelo menos, tomar um bom banho!)."]}},{name:"S\xedlfide",habilites:{attrs:[{attr:"Carisma",mod:4},{attr:"Destreza",mod:2},{attr:"For\xe7a",mod:-4}],other:[],texts:["Seu tamanho \xe9 Min\xfasculo. Voc\xea pode pairar a 1,5m do ch\xe3o com deslocamento 9m. Isso permite que voc\xea ignore terreno dif\xedcil e o torna imune a dano por queda (a menos que esteja inconsciente). Voc\xea pode gastar 1 PM por rodada para voar com deslocamento de 12m.","Voc\xea \xe9 uma criatura do tipo esp\xedrito, recebe vis\xe3o na penumbra e pode falar com animais livremente.","Voc\xea pode lan\xe7ar duas das magias a seguir (todas atributo- chave Carisma): Criar Ilus\xe3o, Enfeiti\xe7ar, Luz (como uma magia arcana) e Sono. Caso aprenda novamente uma dessas magias, seu custo diminui em \u20131 PM."]}},{name:"Suraggel",habilites:{attrs:[{attr:"Sabedoria",mod:4},{attr:"Intelig\xeancia",mod:2},{attr:"Destreza",mod:4}],other:[],texts:["Voc\xea \xe9 uma criatura do tipo esp\xedrito e recebe vis\xe3o no escuro.","Voc\xea recebe +2 em Engana\xe7\xe3o e Furtividade. Al\xe9m disso, pode lan\xe7ar Escurid\xe3o (como uma magia divina; atributochave Intelig\xeancia). Caso aprenda novamente essa magia, o custo para lan\xe7\xe1-la diminui em \u20131 PM."]}},{name:"Trog",habilites:{attrs:[{attr:"Constitui\xe7\xe3o",mod:4},{attr:"For\xe7a",mod:2},{attr:"Intelig\xeancia",mod:-2}],other:[{type:"defesa",mod:1}],texts:["Voc\xea pode gastar uma a\xe7\xe3o padr\xe3o e 2 PM para expelir um g\xe1s f\xe9tido. Todas as criaturas (exceto trogs) em alcance curto devem passar em um teste de Fortitude contra veneno (CD Con) ou ficar\xe3o enjoadas durante 1d6 rodadas. Uma criatura que passe no teste de resist\xeancia fica imune a esta habilidade por um dia.","Voc\xea possui uma arma natural de mordida (dano 1d6, cr\xedtico x2, perfura\xe7\xe3o). Quando usa a a\xe7\xe3o atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.","Voc\xea \xe9 uma criatura do tipo monstro e recebe vis\xe3o no escuro, +1 na Defesa (J\xc1 INCLUSO) e, se estiver sem armadura ou roupas pesadas, +5 em Furtividade.","Voc\xea sofre 1 ponto de dano adicional por dado de dano de frio."]}}],E={ACROBACIA:"Acrobacia",ADESTRAMENTO:"Adestramento",ATLETISMO:"Atletismo",ATUACAO:"Atua\xe7\xe3o",CAVALGAR:"Cavalgar",CONHECIMENTO:"Conhecimento",CURA:"Cura",DIPLOMACIA:"Diplomacia",ENGANACAO:"Engana\xe7\xe3o",FORTITUDE:"Fortitude",FURTIVIDADE:"Furtividade",GUERRA:"Guerra",INICIATIVA:"Iniciativa",INTIMIDACAO:"Intimida\xe7\xe3o",INTUICAO:"Intui\xe7\xe3o",INVESTIGACAO:"Investiga\xe7\xe3o",JOGATINA:"Jogatina",LADINAGEM:"Ladinagem",LUTA:"Luta",MISTICISMO:"Misticismo",NOBREZA:"Nobreza",OFICIO:"Of\xedcio",PERCEPCAO:"Percep\xe7\xe3o",PILOTAGEM:"Pilotagem",PONTARIA:"Pontaria",REFLEXOS:"Reflexos",RELIGIAO:"Religi\xe3o",SOBREVIVENCIA:"Sobreviv\xeancia",VONTADE:"Vontade"},T=[{name:"B\xe1rbaro",pv:24,addpv:6,pm:3,addpm:3,periciasbasicas:[{type:"and",list:[E.LUTA,E.FORTITUDE]}],periciasrestantes:{qtd:4,list:[E.ADESTRAMENTO,E.ATLETISMO,E.CAVALGAR,E.INICIATIVA,E.INTIMIDACAO,E.OFICIO,E.PERCEPCAO,E.PONTARIA,E.SOBREVIVENCIA,E.VONTADE]},proeficiencias:["Armas marciais e escudos."],habilities:[{name:"Furia",text:"Voc\xea pode gastar 2 PM para invocar uma f\xfaria selvagem, tornando-se tem\xedvel em combate. Voc\xea recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas n\xe3o pode fazer nenhuma a\xe7\xe3o que exija calma e concentra\xe7\xe3o (como usar a per\xedcia Furtividade ou lan\xe7ar magias). A cada cinco n\xedveis, pode gastar +2 PM para aumentar os b\xf4nus em +1. A F\xfaria termina se, ao fim da rodada, voc\xea n\xe3o tiver atacado nem sido alvo de um efeito (ataque, habilidade, magia...) hostil.",effect:null,nivel:1}],magics:[]},{name:"Bucaneiro",pv:16,addpv:4,pm:3,addpm:3,periciasbasicas:[{type:"or",list:[E.LUTA,E.PONTARIA]},{type:"and",list:[E.REFLEXOS]}],periciasrestantes:{qtd:4,list:[E.ACROBACIA,E.ATLETISMO,E.ATUACAO,E.ENGANACAO,E.FORTITUDE,E.FURTIVIDADE,E.INICIATIVA,E.INTIMIDACAO,E.JOGATINA,E.LUTA,E.OFICIO,E.PERCEPCAO,E.PILOTAGEM,E.PONTARIA]},proeficiencias:["Armas marciais."],habilities:[{name:"Aud\xe1cia",text:"Quando faz um teste de per\xedcia, voc\xea pode gastar 2 PM para receber um b\xf4nus igual ao seu modificador de Carisma no teste. Voc\xea n\xe3o pode usar esta habilidade em testes de ataque.",effect:null,nivel:1},{name:"Insol\xeancia",text:"Voc\xea soma seu b\xf4nus de Carisma na Defesa, limitado pelo seu n\xedvel. Esta habilidade exige liberdade de movimentos; voc\xea n\xe3o pode us\xe1-la se estiver de armadura pesada ou na condi\xe7\xe3o im\xf3vel.",effect:null,nivel:1}],magics:[]},{name:"Ca\xe7ador",pv:16,addpv:4,pm:4,addpm:4,periciasbasicas:[{type:"or",list:[E.LUTA,E.PONTARIA]},{type:"and",list:[E.SOBREVIVENCIA]}],periciasrestantes:{qtd:6,list:[E.ADESTRAMENTO,E.ATLETISMO,E.CAVALGAR,E.CURA,E.FORTITUDE,E.FURTIVIDADE,E.INICIATIVA,E.INVESTIGACAO,E.LUTA,E.OFICIO,E.PERCEPCAO,E.PONTARIA,E.REFLEXOS]},proeficiencias:["Armas marciais e escudos."],habilities:[{name:"Marca da Presa",text:"Voc\xea pode gastar uma a\xe7\xe3o de movimento e 1 PM para analisar uma criatura em alcance curto. At\xe9 o fim da cena, voc\xea recebe +1d4 nas rolagens de dano contra essa criatura. A cada quatro n\xedveis, voc\xea pode gastar +1 PM para aumentar o b\xf4nus de dano (veja a tabela da classe).",effect:null,nivel:1},{name:"Rastreador",text:"Voc\xea recebe +2 em Sobreviv\xeancia. Al\xe9m disso, pode se mover com seu deslocamento normal enquanto rastreia sem sofrer penalidades no teste de Sobreviv\xeancia.",effect:null,nivel:1}],magics:[]},{name:"Cavaleiro",pv:20,addpv:5,pm:3,addpm:3,periciasbasicas:[{type:"and",list:[E.LUTA,E.FORTITUDE]}],periciasrestantes:{qtd:2,list:[E.ADESTRAMENTO,E.ATLETISMO,E.CAVALGAR,E.DIPLOMACIA,E.GUERRA,E.INICIATIVA,E.INTIMIDACAO,E.NOBREZA,E.PERCEPCAO,E.VONTADE]},proeficiencias:["Armas Marciais","Armaduras pesadas e Escudos"],habilities:[{name:"C\xf3digo de Honra",text:"Cavaleiros distinguem-se de meros combatentes por seguir um c\xf3digo de conduta. Fazem isto para mostrar que est\xe3o acima dos mercen\xe1rios e bandoleiros que infestam os campos de batalha. Voc\xea n\xe3o pode atacar um oponente pelas costas (em termos de jogo, n\xe3o pode se beneficiar do b\xf4nus de flanquear), ca\xeddo, desprevenido ou incapaz de lutar. Se violar o c\xf3digo, voc\xea perde todos os seus PM e s\xf3 pode recuper\xe1-los a partir do pr\xf3ximo dia. Rebaixar-se ao n\xedvel dos covardes e desesperados abala a autoconfian\xe7a que eleva o cavaleiro.",effect:null,nivel:1},{name:"Baluarte",text:"Voc\xea pode gastar 1 PM para receber +2 na Defesa e nos testes de resist\xeancia at\xe9 o in\xedcio do seu pr\xf3ximo turno. A cada quatro n\xedveis, pode gastar +1 PM para aumentar o b\xf4nus em +2.",effect:null,nivel:1}],magics:[]},{name:"Guerreiro",pv:20,addpv:5,pm:3,addpm:3,periciasbasicas:[{type:"or",list:[E.LUTA,E.PONTARIA]},{type:"and",list:[E.FORTITUDE]}],periciasrestantes:{qtd:2,list:[E.ADESTRAMENTO,E.ATLETISMO,E.CAVALGAR,E.GUERRA,E.INICIATIVA,E.INTIMIDACAO,E.LUTA,E.OFICIO,E.PERCEPCAO,E.PONTARIA,E.REFLEXOS]},proeficiencias:["Armas Marciais","Armaduras pesadas e Escudos"],habilities:[{name:"Ataque Especial",text:"Quando faz um ataque, voc\xea pode gastar 1 PM para receber +4 no teste de ataque ou na rolagem de dano. A cada quatro n\xedveis, pode gastar +1 PM para aumentar o b\xf4nus em +4. Voc\xea pode dividir os b\xf4nus igualmente. Por exemplo, no 17\xba n\xedvel, pode gastar 5 PM para receber +20 no ataque, +20 no dano ou +10 no ataque e +10 no dano.",effect:null,nivel:1}],magics:[]},{name:"Inventor",pv:12,addpv:3,pm:4,addpm:4,periciasbasicas:[{type:"and",list:[E.OFICIO,E.VONTADE]}],periciasrestantes:{qtd:4,list:[E.CONHECIMENTO,E.CURA,E.DIPLOMACIA,E.FORTITUDE,E.INICIATIVA,E.INVESTIGACAO,E.LUTA,E.MISTICISMO,E.OFICIO,E.PILOTAGEM,E.PONTARIA,E.PERCEPCAO]},proeficiencias:["Nenhuma,"],habilities:[{name:"Engenhosidade",text:"Quando faz um teste de per\xedcia, voc\xea pode gastar 2 PM para receber um b\xf4nus igual ao seu modificador de Intelig\xeancia no teste. Voc\xea n\xe3o pode usar esta habilidade em testes de ataque.",effect:null,nivel:1},{name:"Prot\xf3tipo",text:"Voc\xea come\xe7a o jogo com um item superior com uma modifica\xe7\xe3o ou 10 itens alqu\xedmicos, com pre\xe7o total de at\xe9 T$ 500. Veja o Cap\xedtulo 3: Equipamento para a lista de itens.",effect:null,nivel:1}],magics:[]},{name:"Ladino",pv:12,addpv:3,pm:4,addpm:4,periciasbasicas:[{type:"and",list:[E.LADINAGEM,E.REFLEXOS]}],periciasrestantes:{qtd:8,list:[E.ACROBACIA,E.ATLETISMO,E.ATUACAO,E.CAVALGAR,E.CONHECIMENTO,E.DIPLOMACIA,E.ENGANACAO,E.FURTIVIDADE,E.INICIATIVA,E.INTIMIDACAO,E.INTUICAO,E.INVESTIGACAO,E.JOGATINA,E.LUTA,E.OFICIO,E.PERCEPCAO,E.PONTARIA,E.PILOTAGEM]},proeficiencias:["Nenhuma."],habilities:[{name:"Ataque Furtivo",text:"Voc\xea sabe atingir os pontos vitais de um inimigo distra\xeddo. Uma vez por rodada, quando atinge um alvo desprevenido com um ataque corpo a corpo ou em alcance curto, ou um alvo que esteja flanqueando, voc\xea causa 1d6 pontos de dano adicional. A cada dois n\xedveis, esse dano adicional aumenta em +1d6. Uma criatura imune a acertos cr\xedticos tamb\xe9m \xe9 imune a ataques furtivos.",effect:null,nivel:1},{name:"Especialista",text:"Escolha um n\xfamero de per\xedcias treinadas igual ao seu b\xf4nus de Intelig\xeancia (m\xednimo 1). Ao fazer um teste de uma dessas per\xedcias, voc\xea pode gastar 1 PM para dobrar seu b\xf4nus de treinamento. Voc\xea n\xe3o pode usar esta habilidade em testes de ataque.",effect:null,nivel:1}],magics:[]},{name:"Lutador",pv:20,addpv:5,pm:3,addpm:3,periciasbasicas:[{type:"and",list:[E.LUTA,E.FORTITUDE]}],periciasrestantes:{qtd:4,list:[E.ACROBACIA,E.ADESTRAMENTO,E.ATLETISMO,E.ENGANACAO,E.FURTIVIDADE,E.INICIATIVA,E.INTIMIDACAO,E.OFICIO,E.PERCEPCAO,E.PONTARIA,E.REFLEXOS]},proeficiencias:["Nenhuma."],habilities:[{name:"Briga",text:"Seus ataques desarmados causam 1d6 pontos de dano e podem causar dano letal ou n\xe3o letal (sem penalidades). A cada quatro n\xedveis, seu dano desarmado aumenta, conforme a tabela. O dano na tabela \xe9 para criaturas Pequenas e M\xe9dias. Criaturas Min\xfasculas diminuem esse dano em um passo, Grandes e Enormes aumentam em um passo e Colossais aumentam em dois passos.",effect:null,nivel:1},{name:"Golpe Rel\xe2mpago",text:"Quando usa a a\xe7\xe3o atacar para fazer um ataque desarmado, voc\xea pode gastar 1 PM para realizar um ataque desarmado adicional.",effect:null,nivel:1}],magics:[]},{name:"Nobre",pv:16,addpv:4,pm:4,addpm:4,periciasbasicas:[{type:"or",list:[E.DIPLOMACIA,E.INTIMIDACAO]},{type:"and",list:[E.VONTADE]}],periciasrestantes:{qtd:4,list:[E.ADESTRAMENTO,E.ATUACAO,E.CAVALGAR,E.CONHECIMENTO,E.DIPLOMACIA,E.ENGANACAO,E.FORTITUDE,E.GUERRA,E.INICIATIVA,E.INTIMIDACAO,E.INTUICAO,E.INVESTIGACAO,E.JOGATINA,E.LUTA,E.NOBREZA,E.OFICIO,E.PERCEPCAO,E.PONTARIA]},proeficiencias:["Armas marciais e escudos","Armaduras pesadas e escudos"],habilities:[{name:"Autoconfian\xe7a",text:"Voc\xea pode somar seu b\xf4nus de Carisma em vez de Destreza na Defesa (mas continua n\xe3o podendo somar um b\xf4nus de atributo na Defesa quando usa armadura pesada).",effect:null,nivel:1},{name:"Esp\xf3lio",text:"Voc\xea recebe um item a sua escolha com pre\xe7o de at\xe9 T$ 2.000.",effect:null,nivel:1},{name:"Orgulho",text:"Quando faz um teste de per\xedcia, voc\xea pode gastar uma quantidade de PM a sua escolha (limitado pelo seu modificador de Carisma). Para cada PM que gastar, recebe +2 no teste.",effect:null,nivel:1}],magics:[]},{name:"Paladino",pv:20,addpv:5,pm:3,addpm:3,periciasbasicas:[{type:"and",list:[E.LUTA,E.VONTADE]}],periciasrestantes:{qtd:2,list:[E.ADESTRAMENTO,E.ATLETISMO,E.CAVALGAR,E.CURA,E.DIPLOMACIA,E.FORTITUDE,E.GUERRA,E.INICIATIVA,E.INTUICAO,E.NOBREZA,E.PERCEPCAO,E.RELIGIAO]},proeficiencias:["Armas marciais e escudos","Armaduras pesadas e escudos"],habilities:[{name:"Aben\xe7oado",text:"Voc\xea soma seu b\xf4nus de Carisma no seu total de pontos de mana no 1\xba n\xedvel. Al\xe9m disso, torna-se devoto de uma divindade dispon\xedvel para paladinos (Azgher, Khalmyr, Lena, Lin-Wu, Marah, Tanna-Toh, Thyatis, Valkaria). Voc\xea deve obedecer \xe0s Obriga\xe7\xf5es & Restri\xe7\xf5es de seu deus, mas, em troca, ganha os Poderes Concedidos dele. Como alternativa, voc\xea pode ser um paladino do bem, lutando em prol da bondade e da justi\xe7a como um todo. N\xe3o recebe nenhum Poder Concedido, mas n\xe3o precisa seguir nenhuma Obriga\xe7\xe3o & Restri\xe7\xe3o (al\xe9m do C\xf3digo do Her\xf3i, abaixo).",effect:null,nivel:1},{name:"C\xf3digo de H\xe9roi",text:"Voc\xea deve sempre manter sua palavra e nunca pode recusar um pedido de ajuda de algu\xe9m inocente. Al\xe9m disso, nunca pode mentir, trapacear ou roubar. Se violar o c\xf3digo, voc\xea perde todos os seus PM e s\xf3 pode recuper\xe1-los a partir do pr\xf3ximo dia.",effect:null,nivel:1},{name:"Golpe Divino",text:"Quando faz um ataque corpo a corpo, voc\xea pode gastar 2 PM para desferir um golpe destruidor. Voc\xea soma seu b\xf4nus de Carisma no teste de ataque e +1d8 na rolagem de dano. A cada quatro n\xedveis, pode gastar +1 PM para aumentar o dano em +1d8.",effect:null,nivel:1}],magics:[]}],M={Humano:{Homem:["Aldor","Aran","Beren","Cyriac","Darik","Dravor","Drystan","Eldred","Ghart","Gryffen"],Mulher:["Alysia","Avelin","Catryn","Darna","Elenya","Emeria","Glenda","Gylda","Isolda"]},"An\xe3o":{Homem:["An\xe3ozinho"],Mulher:["Ana"]},Dahllan:{Homem:["Darlan"],Mulher:["Darlene"]},Lefou:{Homem:["Lefex"],Mulher:["Lefoa"]},Elfo:{Homem:["Elfo"],Mulher:["Elfa"]},Goblin:{Homem:["Goblinaldo"],Mulher:["Goblina"]},Lefeu:{Homem:["Lefeuso"],Mulher:["Lefona"]},Minotauro:{Homem:["Minotouro"],Mulher:["Minotaura"]},Qareen:{Homem:["Eliezer"],Mulher:["Eliana"]},Golem:{Homem:["Golenzin"],Mulher:["Gola"]},Hynne:{Homem:["Frodo"],Mulher:["Hynne"]},Kliren:{Homem:["Kliren"],Mulher:["Klirena"]},Medusa:{Homem:["Meduso"],Mulher:["Medusa"]},Osteon:{Homem:["Evass"],Mulher:["Noita"]},Sereia:{Homem:["Sereio"],Mulher:["Serena"]},"S\xedlfide":{Homem:["Silfide"],Mulher:["Silfida"]},Trog:{Homem:["Trogo"],Mulher:["Traga"]},Suraggel:{Homem:["Aggelus"],Mulher:["Aggelas"]}};function P(e){return Math.floor(e/2)-5}function V(e){return e[Math.floor(Math.random()*e.length)]}function N(){return V(Object.keys(E))}function R(){var e=j.map((function(e){var a,o,s=(a=8,o=18,Math.floor(Math.random()*(o-a)+a));return{name:e,value:s,mod:P(s)}})),a=V(x);!function(e,a,o){e.habilites.attrs.forEach((function(e){var s;if("any"===e.attr)for(s=V(j);a.includes(s);)s=V(j);else s=e.attr;a.push(s);var r=o.find((function(e){return e.name===s})),t=r.value;r.value=e.mod+t,r.mod=P(r.value)}))}(a,[],e);var o=V(["Homem","Mulher"]),s=function(e,a){return V(M[e][a])}(a.name,o),r=V(T),t=e.find((function(e){return"Constitui\xe7\xe3o"===e.name})),i=r.pv+t.mod,n=r.pm,d=10+e.find((function(e){return"Destreza"===e.name})).mod,c=[];a.habilites.other.forEach((function(e){if("pericias"===e.type){if("any"===e.allowed){for(var a=N();c.includes(a);)a=N();c.push(E[a])}}else"pv"===e.type?i+=e.mod:"pm"===e.type?n+=e.mod:"defesa"===e.type&&(d+=e.mod)})),r.periciasbasicas.forEach((function(e){"or"===e.type?c.push(V(e.list)):"and"===e.type&&e.list.forEach((function(e){c.push(e)}))}));for(var m=0;m<r.periciasrestantes.qtd;m+=1){for(var u=V(r.periciasrestantes.list);c.includes(u);)u=V(r.periciasrestantes.list);c.push(u)}return{nome:s,sexo:o,nivel:1,atributos:e,raca:a,classe:r,pericias:c,pv:i,pm:n,defesa:d}}var S=Object(d.a)((function(e){return{root:{padding:"0 30px"},appbar:{background:"rgb(209, 50, 53);"},title:{flexGrow:1},button:{background:"rgb(209, 50, 53);",color:"#FAFAFA",marginBottom:"10px"},input:{color:"rgb(209, 50, 53)"},formControl:{display:"flex",margin:e.spacing(1)}}})),D=function(){var e=S(),a={select:{marginRight:"10px",minWidth:"150px",minHeight:"36px",marginBottom:"10px"}},o=r.a.useState(),s=Object(n.a)(o,2),t=s[0],i=s[1],d=r.a.useState(),A=Object(n.a)(d,2),f=A[0],O=A[1];r.a.useEffect((function(){O(!1)}),[]);return Object(v.jsxs)("div",{children:[Object(v.jsx)(C,{visible:f,onCloseSidebar:function(){O(!1)}}),Object(v.jsx)(c.a,{position:"static",className:e.appbar,children:Object(v.jsxs)(m.a,{children:[Object(v.jsx)(p.a,{onClick:function(){O(!0)},edge:"start",className:e.menuButton,color:"inherit","aria-label":"menu",children:Object(v.jsx)(b.a,{})}),Object(v.jsx)(u.a,{variant:"h6",className:e.title,children:"Gerador de Ficha - Tormenta 20"})]})}),Object(v.jsxs)("div",{style:{margin:"20px",display:"flex",flexWrap:"wrap"},children:[Object(v.jsx)("select",{style:a.select,children:Object(v.jsx)("option",{children:"Todas as Ra\xe7as"})}),Object(v.jsx)("select",{style:a.select,children:Object(v.jsx)("option",{children:"Todas as Classes"})}),Object(v.jsx)("select",{style:a.select,children:Object(v.jsx)("option",{children:"N\xedvel 1"})}),Object(v.jsx)(l.a,{variant:"contained",onClick:function(){var e=R();i(e)},className:e.button,children:"Gerar Ficha"})]}),t&&Object(v.jsx)(h,{sheet:t})]})};var y=function(){return Object(v.jsx)("div",{className:"App",children:Object(v.jsx)("header",{className:"App-header",children:Object(v.jsx)(D,{})})})},q=function(e){e&&e instanceof Function&&o.e(3).then(o.bind(null,90)).then((function(a){var o=a.getCLS,s=a.getFID,r=a.getFCP,t=a.getLCP,i=a.getTTFB;o(e),s(e),r(e),t(e),i(e)}))};i.a.render(Object(v.jsx)(r.a.StrictMode,{children:Object(v.jsx)(y,{})}),document.getElementById("root")),q()}},[[55,1,2]]]);
//# sourceMappingURL=main.9d4f69a1.chunk.js.map