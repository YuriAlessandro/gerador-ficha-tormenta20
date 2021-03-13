import React, { useEffect } from 'react';

const Changelog: React.FC = () => {
  useEffect(() => {
    const footer = document.getElementById('bottom');
    if (footer) {
      footer.style.position = 'absolute';
    }
  });
  return (
    <div style={{ padding: '0 30px' }}>
      <h1>Changelog</h1>
      <p>
        Segue a lista de mudanças no projeto. Última atualização em 13/03/2021.
      </p>

      <h3>Versão 1.0</h3>
      <li>
        <li>Suporte a todas as raças.</li>
        <li>Suporte a todas as classes.</li>
        <li>
          Geração aleatório de atributos, considerando os modificadores
          corretamente.
        </li>
        <li>
          Habilidades de raça e classe que garantam modificações de atributo
          e/ou novas perícias já são automaticamente consideradas.
        </li>
        <li>
          Geração das magias inicias para Arcanista, Druida, Clérigo e Bardo.
        </li>
        <li>
          Os nomes dos personagens são gerados aleatoriamente com base na raça.
          Nome de Osteon é baseado em uma raça &quot;anterior&quot; - ou seja, a
          raça do personagem antes dele morrer.
        </li>
        <li>
          Filtros de geração permitem que você escolha qual raça/classe deseja
          gerar.
        </li>
        <li>
          Gerando aleatoriamente se um personagem é devoto ou não. Caso ele
          seja, é escolhido aleatoriamente o Deus e os poderes concedidos.
        </li>
        <li>
          Gerando origem aleatória. Os poderes de origem são escolhidos
          aleatoriamente junto com as perícias, seguindos as regras determinadas
          pelo sistema.
        </li>
        <li>
          Equipamento inicial, com todo os itens oriundos da origem, dinheiro
          inicial, e as armas aleatórias com base nas proficiências do
          personagem gerado.
        </li>
      </li>
    </div>
  );
};

export default Changelog;
