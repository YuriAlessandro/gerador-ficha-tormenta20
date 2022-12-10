# Gerador Modular de Fichas
O objetivo da nova versão do gerador de fichas é ser capaz de "completar" uma ficha que já foi gerada anteriormente, mesmo após o usuário adicionar/remover algum item já gerado. O objetivo é dar controle sobre coisas menores como perícias, poderes, magias, etc. Assim, se você gerar uma ficha que parece ideal mas você gostaria só de substituir um poder, você pode fazer isso e a ficha irá se auto-corrigir e também anunciar quaisquer problemas que surgirão a partir disso.

Sendo assim, cada passo do gerador de ficha clássico vai ser composto por dois elementos: Um validador e um preenchedor.

A primeira execução de uma ficha é basicamente os preenchedores criando os dados, assim como já ocorre. Depois de gerada, o usuário pode modificar a ficha da forma como quiser e a cada alteração todos os validadores são executados e os erros gerados são mostrados ao usuário.

A ficha só estará "completa" quando não houver mais erros, então o usuário pode tentar resolver os erros manualmente, resolvendo os erros existentes, ou pressionar um botão "completar ficha". A ação de completar a ficha remove quaisquer elementos que estejam gerando erros e em seguida passa a ficha incompleta aos "preenchedores", que vão gerar uma nova ficha completa.

Além disso, algumas mudanças serão feitas na forma que as fichas são geradas. O objeto da ficha vai deixar de ser puro JSON pra se tornar uma classe, e com isso vamos evitar alguns dados extras que podem ser computados on-the-go.

## Definição dos Geradores e Validadores

O gerador vai simplesmente preencher os dados, cada gerador deve ser capaz de completar sua respectiva parte da ficha sem nenhuma informação adicional além da própria ficha incompleta.

Os validadores vão gerar todas as partes que serão exibidas ao usuário, isto é, quaisquer erros que existam atualmente na ficha, quaisquer "avisos", e também a geração do texto de "passos" da geração. Isso é necessário porque se o usuário modificar algo manualmente, os passos de geração ainda precisam ser consistentes.

Após um gerador ser executado, o seu validador específico sempre será executado de forma a gerar os passos da geração.

## Passos da Geração
Cada gerador e validador deve ser uma classe/função separada e independente. Será útil para testes mesmo que nenhum exista no momento ou após a implementação.

Lembrando que na nova geração, não existirá função de "lvl up", o lvl será definido do início e os geradores têm que lidar com isso.

### 1. Raça + Genero + Nome
- Nada demais em termos de geração
- Validação no máximo sobre remover o gênero de golens

### 2. Classe
- Nada a ser gerado ou validado, só um campo basicamente

### 3. Origem
- Golens não têm origem

### 4. Atributos
- Os resultados base gerado devem ser guardados, assim se o usuário só trocar de classe ou raça nós podemos reutilizar os números, também acho que podemos deixar o usuário modificar livremente o número de atributo.
- Validar para evitar que o número seja impossivelmente alto ou baixo (no máximo 18 base ou três atributos bases menores que x) 

### 5. Devoto
- Escolhe uma entidade pra ser ou não devoto
- Valida deuses (ex. Druidas só podem ser devotos de deuses da natureza)

### 6. Pericias e Poderes
- É mais fácil gerar e validar esses dois juntos por causa das origens e de algumas co-dependências
- Informa se o usuário tem perícias demais ou de menos, o mesmo com poderes, e também checa se poderes batem com o nível, se poderiam ser todos escolhidos no nível atual, se as dependências são válidas, etc. Um dos validadores mais importantes.

### 7. Itens e Equipamentos
- Itens de origem + itens iniciais comuns + itens herdados por poderes

### 8. Magias
- Geradas conforme origens e classe e poderes
- Funcionamento similar ao validador de pericias e poderes, importante pra o usuário conseguir escolher as magias

### Z. Valores calculados
- Não precisam de validação nem geração, serão acessados por gets na classe e serão sempre calculados on-the-fly pra evitar processamento repetido
- HP e MP máximo, defesa, peso máximo, valores de perícias, dist. Movimento, etc.