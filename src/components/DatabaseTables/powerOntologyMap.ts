// Gerado a partir da ontologia validada do cofre Tormenta 20 (Obsidian).
export interface PowerOntologyEntry {
  subcategoriaTatica?: string;
  areaEfeito?: string;
  escalaPorNivel?: boolean;
  escalaPorPoderesTormenta?: boolean;
  magiasRelacionadas?: string[];
}

export const POWER_ONTOLOGY_MAP: Record<string, PowerOntologyEntry> = {
  "acuidade com arma": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "arma secundaria grande": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "arremesso multiplo": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "arremesso potente": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "ataque poderoso": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "ataque preciso": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "ataque com escudo": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "ataque pesado": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "bloqueio com escudo": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "carga de cavalaria": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "area"
  },
  "combate defensivo": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "derrubar aprimorado": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "desarmar aprimorado": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "area"
  },
  "disparo preciso": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "disparo rapido": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "alvo"
  },
  "empunhadura poderosa": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "encouracado": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "esquiva": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "estilo desarmado": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "alvo"
  },
  "estilo de arma longa": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "estilo de arma e escudo": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "estilo de arremesso": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "estilo de disparo": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "estilo de duas armas": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "estilo de duas maos": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "estilo de uma arma": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "fanatico": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "alvo"
  },
  "finta aprimorada": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "foco em arma": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "ginete": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "inexpugnavel": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "mira apurada": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "piqueiro": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "presenca aterradora": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "alcance-curto"
  },
  "proficiencia": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "quebrar aprimorado": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "reflexos de combate": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "saque rapido": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "trespassar": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal"
  },
  "vitalidade": {
    "subcategoriaTatica": "combate-corpo-a-corpo",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "a ferramenta certa": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "abraco da fenix": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "adaga noturna": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "afinidade com a tormenta": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "alimentar-se do pavor": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "alma de mudanca": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "almejar o impossivel": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "andarilho carregado": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "anfibio": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "apostar com o trapaceiro": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "armadilha divina": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "armadura de ossos": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "armas da ambicao": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "armas da destruicao": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "armas da selvageria": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "arsenal das profundezas": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "astucia da serpente": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "ataque piedoso": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "aura restauradora": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "aura de medo": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "aura de paz": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "aventureiro inquieto": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "baforada draconica": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "barreira de coral": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "belo presente": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "biblioteca divina": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "bencao do mana": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "cancioneiro da esperanca": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "caricia sombria": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "centelha magica": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "cerimonialista divino": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "chamado monstruoso": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "companheiro celeste": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "companheiro silvestre": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "compreender os ermos": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "conhecimento enciclopedico": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "conjurar arma": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "conviccao ambiciosa": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "coragem total": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "corromper equipamento": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "cura gentil": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "curandeira perfeita": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "curar o espirito": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dedo verde": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "descanso natural": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "discurso conciliador": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dom da esperanca": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dom da furtividade": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dom da imortalidade": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dom da profecia": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dom da ressurreicao": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dom da verdade": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dom da vontade": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "dom dos segredos": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "escamas draconicas": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "escudo magico": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "espada justiceira": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "espada solar": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "espalhar a corrupcao": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "area"
  },
  "espirito animal": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "espirito do conhecimento": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "estouro da trobada": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "exaltar honra": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "area"
  },
  "expurgar a derrota": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "familiar elemental": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "familiar ofidico": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "farsa do fingidor": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "ferramentas da guerra": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "forma de macaco": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "fulgor solar": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "fe guerreira": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "furia divina": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "golpe semantico": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "golpe tempestuoso": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "golpista divino": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "habitante do deserto": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "imolacao sagrada": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "inimigo de tenebra": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "jurista divino": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "jubilo na dor": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "kiai divino": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "liberdade divina": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "magia caotica": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "magia piedosa": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "magia venenosa": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alvo"
  },
  "manto ardiloso": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "manto da penumbra": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "mar revolto": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "area"
  },
  "mediador da tempestade": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "mente analitica": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "mente vazia": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "mestre de si": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "mestre dos mares": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "mordida de vibora": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "navegador sagrado": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "nimb (poder concedido)": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "o dobro ou nada": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "o futuro que vier disso": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "o sol que nos aquece": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "area"
  },
  "olhar amedrontador": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "palavra de poder": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "palavras de bondade": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "passo sombrio": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "perceber farsas": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "percepcao temporal": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "pesquisa abencoada": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "pilar de heredrimm": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "poder oculto": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "poder sem limites": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "poder do vinculo": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "presas primordiais": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "presas venenosas": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "proeminencia solar": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alvo"
  },
  "quebrar encanto": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "redirecionar destino": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "rejeicao divina": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "remorso do belicista": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "reparar injustica": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "resplendor divino": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "sangue ofidico": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "sangue de ferro": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "saque celestial": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "servos do dragao": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "sopro do mar": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "area"
  },
  "sorte dos loucos": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "sorvo de mana": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "so os loucos sabem": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "talento artistico": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "temor arcano": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-medio"
  },
  "terror profundo": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "teurgista mistico": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "toque de nao vida": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "tradicao de lin-wu": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "transbordar cura": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "transmissao da loucura": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "trilha desimpedida": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "tropas duyshidakk": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "urro divino": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "ushultt": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "alcance-curto"
  },
  "visao nas trevas": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "vitoria a qualquer custo": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "voz da civilizacao": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "voz da natureza": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "voz dos monstros": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "zumbificar": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "egide dos mares": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "extase da loucura": {
    "subcategoriaTatica": "concedido",
    "areaEfeito": "pessoal"
  },
  "acrobatico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ao sabor do destino": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "aparencia inofensiva": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "atletico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "atraente": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "comandar": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-medio"
  },
  "costas largas": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "foco em pericia": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "impostor": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "inventario organizado": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "investigador": {
    "subcategoriaTatica": "investigacao",
    "areaEfeito": "pessoal"
  },
  "lobo solitario": {
    "subcategoriaTatica": "sobrevivencia",
    "areaEfeito": "alcance-curto"
  },
  "medicina": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "parceiro": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "sentidos agucados": {
    "subcategoriaTatica": "investigacao",
    "areaEfeito": "pessoal"
  },
  "sortudo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "surto heroico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "torcida": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-medio"
  },
  "treinamento em pericia": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "veneficio": {
    "subcategoriaTatica": "oficio",
    "areaEfeito": "pessoal"
  },
  "vontade de ferro": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "celebrar ritual": {
    "subcategoriaTatica": "fabrica-sobrenatural",
    "areaEfeito": "pessoal"
  },
  "escrever pergaminho": {
    "subcategoriaTatica": "fabrica-sobrenatural",
    "areaEfeito": "pessoal"
  },
  "foco em magia": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "magia acelerada": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "magia ampliada": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "area"
  },
  "magia discreta": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "magia ilimitada": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "preparar pocao": {
    "subcategoriaTatica": "fabrica-sobrenatural",
    "areaEfeito": "pessoal"
  },
  "anatomia insana": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "antenas": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "armamento aberrante": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "articulacoes flexiveis": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "asas insetoides": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "carapaca": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "corpo aberrante": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "cuspir enxame": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "alcance-curto",
    "escalaPorPoderesTormenta": true
  },
  "dentes afiados": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal"
  },
  "desprezar a realidade": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal"
  },
  "empunhadura rubra": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "fome de mana": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal"
  },
  "larva explosiva": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "legiao aberrante": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "area",
    "escalaPorPoderesTormenta": true
  },
  "membros estendidos": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "membros extras": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal"
  },
  "mente aberrante": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "maos membranosas": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "olhos vermelhos": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "pele corrompida": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "sangue acido": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal"
  },
  "visco rubro": {
    "subcategoriaTatica": "tormenta",
    "areaEfeito": "pessoal",
    "escalaPorPoderesTormenta": true
  },
  "agrilhoar os caidos": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Servo Morto-Vivo"
    ]
  },
  "alquimia arcana": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "apoteose celestial": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "apoteose draconica": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "apoteose feerica": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "apoteose rubra": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "arcanista de linha de frente": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "area"
  },
  "arcano de batalha": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "asas de sapo": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "caldeirao do bruxo": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "contingencia arcana": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Runa de Proteção"
    ]
  },
  "contramagica aprimorada": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-medio",
    "magiasRelacionadas": [
      "Dissipar Magia"
    ]
  },
  "contramagica superior": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Dissipar Magia"
    ]
  },
  "envolto em misterio": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "escriba arcano": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "especialista em escola": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "especialista em invocacoes": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alvo",
    "magiasRelacionadas": [
      "Conjurar Monstro",
      "Servo Morto-Vivo"
    ]
  },
  "familiar aprimorado": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-longo"
  },
  "familiar": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "fluxo de mana": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "foco vital": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "fortalecimento arcano": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "heranca aprimorada": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "area"
  },
  "heranca superior": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "area"
  },
  "ingrediente especial": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "magia performatica": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "area"
  },
  "magia pungente": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "memoria subita": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "mestre em escola": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "o proprio sangue": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "poder magico": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "raio arcano": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-curto"
  },
  "raio dividido": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "raio elemental": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "raio poderoso": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "ritual do lich": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Servo Morto-Vivo"
    ]
  },
  "sifao de mana": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "tinta do mago": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "trama celere": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "transliteracao impossivel": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "alma de bronze": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "brado assustador": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-curto"
  },
  "critico brutal": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "espirito inquebravel": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "esquiva sobrenatural (barbaro)": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "forca indomavel": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "frenesi": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "furia raivosa": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "furia da savana": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "golpe poderoso": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "investida imprudente": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "pele de aco": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "pele de ferro": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "sangue dos inimigos": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "supersticao": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "totem espiritual": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "vigor primal": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "arte magica": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "aumentar repertorio": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "danca das laminas": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "esgrima magica": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "estrelato": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "fascinar em massa": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "golpe elemental": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "golpe magico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "inspiracao marcial": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "lendas e historias (bardo)": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "manipular em massa": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "manipular": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "melodia restauradora": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "mestre dos sussurros": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "musica: balada fascinante": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "musica: cancao assustadora": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "musica: melodia curativa": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "parodia": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-medio"
  },
  "prestidigitacao": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "abusar dos fracos": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "amigos no porto": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "aparar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "apostador": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ataque acrobatico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "aventureiro avido": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "bravata audaz": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "bravata imprudente": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "en garde": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "flagelo dos mares": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "foliao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "grudar o cano": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "pernas do mar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "pistoleiro": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "presenca paralisante": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ripostar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "touche": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "armadilha: arataca": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "armadilha: espinhos": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "armadilha: laco": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "armadilha: rede": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "area"
  },
  "armadilheiro": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "bote": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "camuflagem (cacador)": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "chuva de laminas": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "elo com a natureza": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "empatia selvagem (cacador)": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "ervas curativas": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "escaramuca superior": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "escaramuca": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "alcance-curto"
  },
  "espreitar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "inimigo de (criatura)": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "olho do falcao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-longo"
  },
  "ponto fraco": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "armadura da honra": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "desprezar os covardes": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "escudeiro": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "estandarte": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "etiqueta": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "investida destruidora": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "montaria corajosa": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "pajem": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "postura de combate: ariete implacavel": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "postura de combate: castigo de ferro": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "postura de combate: foco de batalha": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "postura de combate: muralha intransponivel.": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "postura de combate: provocacao petulante": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "alcance-curto"
  },
  "postura de combate: torre inabalavel": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "torre armada": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "abencoar arma": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Arma Mágica"
    ]
  },
  "arma divina": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Arma Espiritual",
      "Arma Mágica"
    ]
  },
  "bencao de batalha": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Bênção"
    ]
  },
  "canalizar abencoado": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-curto",
    "magiasRelacionadas": [
      "Consagrar",
      "Bênção"
    ]
  },
  "canalizar amplo": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "canalizar concentrado": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-curto"
  },
  "canalizar energia": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-curto",
    "magiasRelacionadas": [
      "Curar Ferimentos",
      "Infligir Ferimentos"
    ]
  },
  "canalizar poderoso": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "area"
  },
  "canalizar profanado": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-curto",
    "magiasRelacionadas": [
      "Profanar"
    ]
  },
  "dizimar infieis": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Cólera de Azgher"
    ]
  },
  "expulsar/comandar mortos-vivos": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "area",
    "magiasRelacionadas": [
      "Conjurar Mortos-Vivos"
    ]
  },
  "forca da devocao": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "liturgia marcial": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Arma Mágica"
    ]
  },
  "liturgia magica": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "magia sagrada/profana": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Raio Solar",
      "Infligir Ferimentos"
    ]
  },
  "mestre celebrante": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "missa: bencao da vida": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true,
    "magiasRelacionadas": [
      "Curar Ferimentos"
    ]
  },
  "missa: chamado as armas": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Arma Mágica"
    ]
  },
  "missa: compartilhar milagre": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Bênção",
      "Oração",
      "Resistência a Energia"
    ]
  },
  "missa: elevacao do espirito": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "missa: escudo divino": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Escudo da Fé"
    ]
  },
  "missa: imposicao da vontade": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Comando"
    ]
  },
  "missa: mente abencoada": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Tranquilidade"
    ]
  },
  "missa: superar as limitacoes": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "prece de combate": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Bênção",
      "Escudo da Fé",
      "Curar Ferimentos"
    ]
  },
  "presente dos deuses": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "punicao divina": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Purificação"
    ]
  },
  "solo profanado": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "area",
    "magiasRelacionadas": [
      "Profanar"
    ]
  },
  "solo sagrado": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "area",
    "magiasRelacionadas": [
      "Consagrar"
    ]
  },
  "simbolo sagrado energizado": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "egide da fe": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "alcance-curto",
    "magiasRelacionadas": [
      "Escudo da Fé"
    ]
  },
  "aspecto da primavera": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "aspecto do inverno": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "aspecto do outono": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "alcance-curto"
  },
  "aspecto do verao": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "companheiro animal aprimorado": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "companheiro animal lendario": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "companheiro animal magico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "coracao da selva": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "espirito dos equinocios": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "espirito dos solsticios": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "forma primal": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "forma selvagem aprimorada": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "forma selvagem superior": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "forma selvagem": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "forca dos penhascos": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "liberdade da pradaria": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "magia natural": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "presas afiadas": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "segredos da natureza": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "tranquilidade dos lagos": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "ataque reflexo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "bater e correr": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "especializacao em arma": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "golpe demolidor": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "golpe pessoal": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "golpe de raspao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "mestre em arma": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "planejamento marcial": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "romper resistencias": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "tornado de dor": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "agite antes de usar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ajuste de mira.": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "alquimista iniciado": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "alquimista de batalha": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "armeiro": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ativacao rapida": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "automato prototipado": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "automato": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "balistica": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "blindagem": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "cano raiado": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "catalisador instavel": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "chutes e palavroes": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "conhecimento de formulas": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "couraceiro": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "engenhoqueiro": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "farmaceutico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ferreiro": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "granadeiro": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "alcance-medio"
  },
  "homunculo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-longo"
  },
  "invencao potente": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "maestria em pericia": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "manutencao eficiente": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "mestre alquimista": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "mestre cuca": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "mistura fervilhante": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "area"
  },
  "oficina de campo": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "pedra de amolar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "sintese rapida": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "assassinar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "contatos no submundo": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "escapista": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "fuga formidavel": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "gatuno": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ladrao arcano": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "mente criminosa": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "mao na boca": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "maos rapidas": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "oportunismo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "rolamento defensivo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "roubo de mana": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "saqueador de tumbas": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "sombra": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "truque magico": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "velocidade ladina": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "veneno persistente": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "veneno potente": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "arma improvisada": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ate acertar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "bracos calejados": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "cabecada": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "chave": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "alvo"
  },
  "confianca dos ringues": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "convencido": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "golpe baixo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "golpe imprudente": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "imobilizacao": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "lutador de chao": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "lingua dos becos": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "nome na arena": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "punhos de adamante": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "alvo"
  },
  "rasteira": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "sarado": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "sequencia destruidora": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "trincado": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "trocacao tumultuosa": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "trocacao": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "voadora": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "armadura brilhante": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "educacao privilegiada": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "estrategista": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-curto"
  },
  "favor": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "general": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "grito tiranico": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-curto"
  },
  "inspirar confianca": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-curto"
  },
  "inspirar gloria": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-curto"
  },
  "jogo da corte": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "liderar pelo exemplo": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-curto"
  },
  "lingua rapida": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "lingua de ouro": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "lingua de prata": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "presenca majestosa": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "voz poderosa": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-medio"
  },
  "arma sagrada": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "aura antimagia": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "aura ardente": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "aura poderosa": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "aura de cura": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "aura de invencibilidade": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "fulgor divino": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "julgamento divino: arrependimento": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "julgamento divino: autoridade": {
    "subcategoriaTatica": "social",
    "areaEfeito": "alcance-curto"
  },
  "julgamento divino: coragem": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "julgamento divino: iluminacao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "julgamento divino: justica": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "julgamento divino: libertacao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "julgamento divino: salvacao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "julgamento divino: vindicacao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "julgamento divino: zelo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-longo"
  },
  "orar": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "virtude paladinesca: caridade": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "virtude paladinesca: castidade": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "virtude paladinesca: compaixao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "virtude paladinesca: humildade": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "virtude paladinesca: temperanca": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "acelerar sacrario": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ampliar sacrario": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-medio"
  },
  "autoridade eclesiastica": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "bencao fortalecedora": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "canto monastico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "copista": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "cozinheiro da abadia": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "estudante diligente": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "fe e razao": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "mago branco": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "memorizar liturgia": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "oficio do mosteiro": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "psicografia": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "sacrario da erudicao": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "sacrario da misericordia": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alvo"
  },
  "sacrario da resiliencia": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "sacrario da solenidade": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "area"
  },
  "sacrario da verdade": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "area"
  },
  "sacrario das sombras": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "area"
  },
  "sacrario do compartilhamento": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-curto"
  },
  "sacrario do ocaso": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "sermao da celeridade": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "sermao da egide": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "teologia aplicada": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "transferir sacrario": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "zelador dos vinhedos": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "amigo divino": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "asas aliadas": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "bom garoto": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "comando defensivo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "comandos distantes": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "convocar enxame": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "coracao grande": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "direcionamento marcial": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "domador cativante": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "domador lendario": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ensinar truque": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "investida conjunta": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "lider da matilha": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "lingua das criaturas": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "mascote": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-medio"
  },
  "petisco merecido": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "alcance-curto"
  },
  "protecao fraterna": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "alcance-curto"
  },
  "trabalho em equipe": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "treinador ecletico": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "veterinario de campo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "ambidestria": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "arqueiro": {
    "subcategoriaTatica": "combate-a-distancia",
    "areaEfeito": "pessoal"
  },
  "aumento de atributo": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "autoridade feudal": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "companheiro animal": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "comunhao vital": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "alcance-curto"
  },
  "conhecimento magico": {
    "subcategoriaTatica": "metamagia",
    "areaEfeito": "pessoal"
  },
  "destruidor": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "emboscar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "esgrimista": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "especializacao em armadura": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "solidez": {
    "subcategoriaTatica": "defesa",
    "areaEfeito": "pessoal"
  },
  "titulo": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "valentao": {
    "subcategoriaTatica": "manobra",
    "areaEfeito": "pessoal"
  },
  "impeto": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "alpinista social": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "amigo especial": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "antigo mestre": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "busca interior": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "confissao": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "coracao heroico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "cultura exotica": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "desejo de liberdade": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "detetive": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "dom artistico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "escavador": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "esforcado": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "esse cheiro...": {
    "subcategoriaTatica": "oficio",
    "areaEfeito": "alcance-curto"
  },
  "estoico": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "frutos do trabalho": {
    "subcategoriaTatica": "oficio",
    "areaEfeito": "pessoal"
  },
  "gororoba": {
    "subcategoriaTatica": "oficio",
    "areaEfeito": "pessoal"
  },
  "heranca": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "influencia militar": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "lembrancas graduais": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "membro da igreja": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "mochileiro": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "medico de campo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "negociacao": {
    "subcategoriaTatica": "oficio",
    "areaEfeito": "pessoal"
  },
  "palpite fundamentado": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "passagem de navio": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "punguista": {
    "subcategoriaTatica": "oficio",
    "areaEfeito": "pessoal"
  },
  "pao e circo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "quebra-galho": {
    "subcategoriaTatica": "oficio",
    "areaEfeito": "pessoal"
  },
  "rede de contatos": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "sangue azul": {
    "subcategoriaTatica": "social",
    "areaEfeito": "pessoal"
  },
  "truque de magica": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "vendedor de carcacas": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "vida rustica": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "a prova de tudo": {
    "subcategoriaTatica": "utilidade",
    "areaEfeito": "pessoal"
  },
  "agua no feijao": {
    "subcategoriaTatica": "oficio",
    "areaEfeito": "pessoal"
  },
  "ajudante nato": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "amo": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "arma amada": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "arma natural aprimorada": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "alvo"
  },
  "arma natural habil": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "arquearia elfica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "arsenal de lisandra": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal",
    "magiasRelacionadas": [
      "Armamento da Natureza"
    ]
  },
  "asas extraplanares": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "asas de aco": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "atracao pela polvora": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "camuflagem mimetica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "canto da sereia": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "cascos poderosos": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "chassi gracioso": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "citadino": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "comandar aprimorado": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "conforto do aco": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "constricao atroz": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "alcance-curto"
  },
  "coracao de pedra": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "coro sibilante": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "crescimento feerico": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "crianca da luz": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "crianca das trevas": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "devocao iluminada": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "duas cabecas": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "dupla conjuracao": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "dupla inteligencia": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "dupla prontidao": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "duro como aco": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "entre as pernas": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "escapada criativa": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "esgrima elfica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "estilo classico": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "estirpe arcana": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "exaltacao do rejeitado": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "explosao ossea": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "falatorio criativo": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "familiar de luz": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "familiar de trevas": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "faro aprimorado": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "alcance-medio"
  },
  "fragrancia de rosas": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "alcance-curto"
  },
  "furia aterrorizante": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "alcance-curto"
  },
  "furia natural": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "gavinhas": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "ginete de javali": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "glamour maior": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "glamour": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "golpe dos titas": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "golpe no joelho": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "grande marca de wynna": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "heranca erudita": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "logica gnomica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "magia ofidica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "manipulacao esqueletica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "marrada poderosa": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "meditacao mistica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "olhar petrificante": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "alcance-curto"
  },
  "ossos afiados": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "pirata oceanico": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "programacao holistica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "programacao de combate": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "protetor eterno": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "protetor taurico": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "quadridestria": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "quatro bracos": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "saliva corrosiva": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "sangue magico": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  },
  "saraivada florestal": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "area",
    "escalaPorNivel": true
  },
  "soco foguete": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "alcance-curto"
  },
  "tradicao perdida aprimorada": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "tradicao perdida": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "tradicao de ayrelynn": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "valentia nata": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "veneno aprimorado": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "vigilancia elfica": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal"
  },
  "vitalidade das fadas": {
    "subcategoriaTatica": "racial",
    "areaEfeito": "pessoal",
    "escalaPorNivel": true
  }
};
