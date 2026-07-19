# Fichas de Nimb — Gerador de Fichas de Tormenta 20

[![CircleCI](https://circleci.com/gh/YuriAlessandro/gerador-ficha-tormenta20/tree/main.svg?style=svg)](https://app.circleci.com/pipelines/github/YuriAlessandro/gerador-ficha-tormenta20)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=flat&logo=material-ui&logoColor=white)

Gerador de fichas, ameaças e itens para o RPG **Tormenta 20**, com as regras
oficiais implementadas. Cria personagens do nível 1 ao 20 — aleatórios ou
escolhendo cada detalhe —, calcula tudo sozinho e exporta em PDF.

🎲 **[Acesse o gerador](https://fichasdenimb.com.br)** · 📋 **[Changelog](https://fichasdenimb.com.br/changelog)** · 🗺️ **[Mapa de Arton](https://fichasdenimb.com.br/mapadearton)**

## ✨ O que dá pra fazer

### Sem conta, direto no navegador

Todo o núcleo do gerador funciona offline, sem login e sem backend:

- **Criar Personagem** — assistente passo a passo com atributos, perícias,
  poderes, magias, equipamento inicial e loja. Cobre as escolhas específicas de
  raça (Suraggel, Qareen, Moreau, Golem, Feiticeiro, Alma Livre e companhia).
- **Ficha Aleatória** — ficha completa pronta em um clique, com filtros
  opcionais de raça, classe, origem, divindade e nível.
- **Subida de nível** — assistente que aplica benefícios, poderes e magias novas.
- **Editor completo** — ajuste poderes, magias, perícias, ataques, rolagens,
  proficiências, PV/PM temporários e veja a Defesa calculada com explicação.
- **Gerador de Ameaças** — NPCs e criaturas por nível de desafio.
- **Criar Item Superior** e **Criar Item Mágico**.
- **Rolador de Recompensas** — tesouros aleatórios.
- **Enciclopédia de Tanah-Toh** — raças, classes, origens, divindades, poderes e
  magias consultáveis com busca e filtros.
- **Caverna do Saber** — artigos, dicas e guias de regras.
- **Exportar em PDF** e **exportar para Foundry VTT** (personagens e ameaças).
- **Rolador de dados 3D**, tema claro/escuro e **PWA** instalável.

### Com uma conta gratuita

- **Meus Personagens** — fichas salvas na nuvem, organizadas em pastas.
- **Mesas virtuais** — sessões ao vivo com os jogadores, rolagens
  compartilhadas e ferramentas de mestre.
- **Homebrews da comunidade** — crie e publique raças, classes, origens,
  divindades e pacotes de magias e poderes, e ative-os nas suas fichas.
- **Builds** e **Bestiário da comunidade** — publique e explore.
- **Blog** e **Fórum** — leitura aberta, publicação com conta.
- **Perfil público** com badges e seções customizáveis.

### Para apoiadores

O projeto se sustenta por assinaturas, que também elevam os limites de fichas,
ameaças, mesas e suplementos ativos. Recursos exclusivos incluem **Multiclasse**,
**Efeitos Ativos**, **Complicações** (Heróis de Arton) e o **Guia de acerto** de
área de magias. Detalhes em [fichasdenimb.com.br/apoiar](https://fichasdenimb.com.br/apoiar).

## 📚 Suplementos oficiais

O conteúdo é organizado em suplementos que o usuário ativa e desativa:

| Suplemento                     | Sigla | O que adiciona                                                                      |
| ------------------------------ | ----- | ----------------------------------------------------------------------------------- |
| **Tormenta 20** (Livro Básico) | T20   | Raças, classes, origens e poderes. Sempre ativo                                     |
| **Ameaças de Arton**           | AdA   | 29 raças, 67 equipamentos, 7 magias, classes e materiais especiais                  |
| **Atlas de Arton**             | AA    | 70 origens regionais e poderes de magia                                             |
| **Deuses de Arton**            | DA    | 1 classe, 76 poderes concedidos, 28 magias, 22 habilidades de Suraggel              |
| **Heróis de Arton**            | HA    | 5 raças, 1 classe, 30 origens, 59 poderes gerais, classes variantes e Golpe Pessoal |
| **Guia de Deuses Menores**     | GDM   | 63 divindades menores com poderes concedidos e status divino                        |

## 🔌 Integrações

- **[Owlbear Rodeo](https://www.owlbear.rodeo/)** — extensão que vincula tokens
  da sala às fichas, exibe a ficha no iframe e anuncia rolagens para a mesa.
  Código em [`extensions/owlbear/`](extensions/owlbear/).
- **Foundry VTT** — exportação de personagens e ameaças em JSON importável.

## 🚀 Tecnologias

- **React 17** + **TypeScript 5** (modo estrito)
- **Vite 4** como build tool
- **Material-UI v9** + **Tailwind CSS**
- **Redux Toolkit** com Redux Persist
- **pdf-lib** para geração de PDF
- **Firebase Auth** para autenticação e **Socket.IO** para as mesas ao vivo
- **Vitest** para testes, **ESLint** (Airbnb) + **Prettier**

## 🏛️ Arquitetura open-core

Este repositório é público e MIT, mas o projeto tem duas partes privadas:

| Diretório          | Repositório | Conteúdo                           |
| ------------------ | ----------- | ---------------------------------- |
| `src/premium`      | privado     | Funcionalidades pagas do frontend  |
| `backend`          | privado     | API, banco e pagamentos            |
| `src/premium-stub` | **público** | Substituto inerte de `src/premium` |

**Você não precisa de acesso aos submódulos para contribuir.** Ao clonar sem
eles, um plugin no `vite.config.ts` redireciona todo import de `src/premium`
para `src/premium-stub/`, e o app sobe normalmente com o gerador, o wizard, o
PDF, o gerador de ameaças e a enciclopédia funcionando. As funcionalidades pagas
simplesmente não aparecem.

Detalhes, limitações conhecidas e como regenerar o stub estão no
[CONTRIBUTING.md](CONTRIBUTING.md#rodando-sem-o-módulo-premium).

## 📦 Rodando localmente

### Requisitos

- **Node.js 22** e **npm 11** — o `package-lock.json` é gerado pelo npm 11 e
  versões anteriores rejeitam o lock no `npm ci`
- Git

```bash
# Clone (os submódulos privados são pulados automaticamente se você não tiver acesso)
git clone https://github.com/YuriAlessandro/gerador-ficha-tormenta20.git
cd gerador-ficha-tormenta20

npm install
npm start

# Acesse http://localhost:5173
```

### Comandos úteis

```bash
npm test                          # Testes (Vitest)
npm run build                     # Build de produção
npx tsc --noEmit                  # Verificação de tipos
npx eslint src/                   # Lint
npx prettier --write src/         # Formatação
```

> Sem o submódulo `src/premium`, o `tsc --noEmit` e os testes que importam o
> premium falham — o app roda, mas essas verificações não. Veja o
> [CONTRIBUTING.md](CONTRIBUTING.md#rodando-sem-o-módulo-premium).

## 🤝 Como contribuir

Contribuições são muito bem-vindas — de correções de regra e conteúdo de
suplemento a features novas.

- **Encontrou um bug?** Abra uma [issue](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/issues)
  com passos para reproduzir, screenshots, navegador e sistema.
- **Tem uma ideia?** Use as [Discussions](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions).
- **Quer codar?** Faça um fork, crie uma branch, e abra um Pull Request.

O [CONTRIBUTING.md](CONTRIBUTING.md) explica a arquitetura, a estrutura dos
dados de regras e as convenções de código.

## 📧 Contato

- [GitHub Discussions](https://github.com/YuriAlessandro/gerador-ficha-tormenta20/discussions)
- contato@fichasdenimb.com.br

## 👥 Contribuidores

- [Yuri Alessandro Martins](https://github.com/YuriAlessandro)
- [Isaac Batista](https://github.com/isaacbatst)
- [Gustavo Carvalho](https://github.com/GustavoAC)
- [Ramon Alves](https://github.com/alvesramonz)
- [Mateus Cordeiro](https://github.com/mateusmcordeiro)
- Fabio Soares
- Cairo Noleto

## 📄 Licença

Código sob licença [MIT](LICENSE).

**Tormenta 20** é propriedade da [Jambô Editora](https://jamboeditora.com.br/).
Este é um projeto de fã, sem vínculo com a editora, e não substitui os livros
oficiais.
