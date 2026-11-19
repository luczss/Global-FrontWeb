 <p align="center">
  <img src="./src/assets/characters/bimoimg.png" alt="Bimo — suporte emocional, sempre por perto" width="100%" />
</p>

<h1 align="center">Bimo — Expressar, Refletir e Conectar</h1>

<p align="center">
  <strong>Um espaço digital para expressão emocional, autoconhecimento e conexão.</strong>
  <br />
  <em>Suporte emocional, sempre por perto.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google_Gemini-API-8E75B2?logo=googlegemini&logoColor=white" alt="Google Gemini API" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel" alt="Vercel" />
</p>

<p align="center">
  <a href="https://global-front-web-psi.vercel.app/"><strong>🌐 Acessar o Bimo</strong></a>
  &nbsp; • &nbsp;
  <a href="https://github.com/luczss/Global-FrontWeb.git"><strong>💻 Repositório</strong></a>
</p>

---

## 📌 Sobre o projeto

O **Bimo** é uma plataforma web desenvolvida para incentivar a expressão emocional, a reflexão pessoal e a conexão entre pessoas.

A aplicação utiliza um mascote interativo como ponto de aproximação, oferecendo um ambiente digital no qual o usuário pode conversar, registrar pensamentos, realizar pequenos desafios e acompanhar seu próprio progresso.

O projeto combina uma experiência de conversação com funcionalidades de organização pessoal, personalização e integração opcional com inteligência artificial.

Sua proposta é tornar a expressão emocional mais acessível por meio de uma interface intuitiva, acolhedora e responsiva.

> **Importante:** O Bimo é uma ferramenta de apoio à expressão emocional. Não realiza diagnósticos, não substitui acompanhamento psicológico ou médico e não deve ser utilizado como serviço de emergência.

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral das atividades do usuário.
- Acesso rápido às principais funcionalidades.
- Resumo de registros e desafios.
- Acompanhamento do progresso.

### 💬 Modo Conversa
- Conversas interativas com o mascote Bimo.
- Três personalidades: **Acolhedor, Motivador e Desafiador**.
- Reconhecimento de intenções e continuidade de contexto.
- Respostas adaptadas às preferências do usuário.
- Histórico de conversas opcional.
- Avaliação das respostas.
- Funcionamento com motor local e integração opcional com Google Gemini.

### 📔 Diário pessoal
- Criação, edição e exclusão de registros.
- Busca por título e conteúdo.
- Reconhecimento de voz pelo navegador.
- Armazenamento local dos registros.

### 🎯 Desafios
- Desafios graduais e opcionais.
- Criação e exclusão de desafios personalizados.
- Registro de conclusão.
- Sistema de moedas virtuais.
- Acompanhamento de progresso e dias consecutivos.
- Integração com API externa para demonstração de operações CRUD.

### 🎨 Personalização
- Diferentes personalidades para o Bimo.
- Loja de acessórios.
- Sistema de moedas virtuais.
- Personalização do mascote.

### ⚙️ Memória e configurações
- Memória opcional e editável.
- Preferências de conversação.
- Opção de respostas mais curtas.
- Modo de conversa sem conselhos.
- Configurações de privacidade e experiência.

---

## 🧰 Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| React 19 | Construção da interface |
| Vite 8 | Desenvolvimento e build |
| JavaScript | Lógica da aplicação |
| Tailwind CSS | Estilização e responsividade |
| React Hooks | Gerenciamento de estados e efeitos |
| Custom Hooks | Organização da lógica reutilizável |
| Google Gemini API | Geração opcional de respostas |
| `@google/genai` | Integração com o Google Gemini |
| JSONPlaceholder | API externa para operações CRUD |
| LocalStorage | Persistência de dados no navegador |
| Vercel | Hospedagem da aplicação e funções backend |

## 🧠 Inteligência artificial — Google Gemini

O Bimo possui integração com a API do Google Gemini por meio de uma função backend hospedada na Vercel.

A aplicação também possui um motor local de conversação, permitindo que funcionalidades de conversa continuem disponíveis sem depender exclusivamente de um serviço externo.

### Como funciona a alternância entre os motores?

**Motor local**
- Funciona diretamente no navegador.
- Utiliza regras, intenções, contexto e modelos de resposta.
- Não depende de uma chamada à API do Gemini.

**Google Gemini**
- Utiliza inteligência artificial generativa.
- Produz respostas contextualizadas.
- Depende da configuração da variável de ambiente `GEMINI_API_KEY` no servidor.

Quando a integração externa está indisponível ou apresenta falhas, a aplicação conta com mecanismos de fallback para o motor local.


---

## 🏗️ Arquitetura do projeto

A aplicação utiliza uma estrutura modular para separar interface, páginas, lógica de negócio, serviços, dados e funções backend.

```text
Global-FrontWeb/
│
├── api/
│   ├── chat.js
│   └── _lib/
│       ├── config.js
│       ├── providers.js
│       ├── safety.js
│       ├── sanitize.js
│       ├── errors.js
│       ├── prompt.js
│       └── knowledge.js
│
├── knowledge/
│
├── public/
│
├── src/
│   ├── assets/
│   │   └── characters/
│   │
│   ├── components/
│   │   └── onboarding/
│   │
│   ├── hooks/
│   │
│   ├── pages/
│   │
│   ├── services/
│   │   └── conversation/
│   │
│   ├── data/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── tests/
│
├── docs/
│   ├── AUDITORIA.md
│   └── bimo-banner.png
│
├── AI.md
├── README.md
├── package.json
├── vite.config.js
└── vercel.json
```

### Organização da arquitetura

| Diretório | Responsabilidade |
|---|---|
| `api/` | Funções backend e integração com serviços externos |
| `api/_lib/` | Configurações, segurança e suporte à integração de IA |
| `knowledge/` | Conteúdos de apoio ao mecanismo de conversação |
| `src/components/` | Componentes reutilizáveis da interface |
| `src/hooks/` | Hooks personalizados e gerenciamento de comportamentos |
| `src/pages/` | Páginas e telas da aplicação |
| `src/services/` | Serviços e regras de comunicação |
| `src/data/` | Dados utilizados pela aplicação |
| `src/utils/` | Funções auxiliares |
| `tests/` | Testes automatizados |
| `docs/` | Documentação complementar |

---

## ⚙️ Requisitos técnicos do projeto

O desenvolvimento contempla os requisitos técnicos relacionados à construção de uma aplicação React, organização de componentes, gerenciamento de estado, integração com API e versionamento.

| Requisito | Implementação |
|---|---|
| React com Vite | Aplicação desenvolvida com React e Vite |
| Tailwind CSS | Estilização e responsividade |
| Mínimo de 8 componentes | Mais de 8 componentes reutilizáveis |
| `useState` | Gerenciamento de estados |
| `useEffect` | Efeitos e sincronização de dados |
| Mínimo de 2 Custom Hooks | 8 hooks personalizados |
| Organização de código | Separação entre componentes, páginas, hooks e serviços |
| API externa | Integração com JSONPlaceholder |
| CRUD | Criação, consulta, atualização e exclusão |
| Documentação | README.md e documentação de IA |
| Versionamento | Histórico de commits no Git |

### Custom Hooks

O projeto possui os seguintes hooks personalizados:

- `useBimoChat`
- `useChallenges`
- `useDiary`
- `useFeedback`
- `useLocalStorage`
- `useMemory`
- `useProfile`
- `useSpeechInput`

Esses hooks permitem organizar comportamentos e lógica reutilizável, reduzindo a concentração de responsabilidades nos componentes visuais e facilitando a manutenção do código.

---

## 🔌 Integração com API externa — CRUD

O Bimo utiliza a API pública **JSONPlaceholder** para demonstrar operações CRUD relacionadas aos desafios.

| Operação | Método HTTP | Funcionalidade |
|---|---|---|
| Create | POST | Criar desafio |
| Read | GET | Consultar desafios |
| Update | PATCH | Atualizar conclusão |
| Delete | DELETE | Excluir desafio |

Endpoint:

```text
https://jsonplaceholder.typicode.com/todos
```

### Como funciona a persistência?

O JSONPlaceholder é uma API de demonstração. As operações simulam a comunicação com um backend, mas não persistem alterações permanentemente no servidor.

A aplicação utiliza o LocalStorage para manter os dados locais do usuário no navegador. Dessa forma, os dados armazenados localmente podem continuar disponíveis mesmo quando a API externa não está acessível.

---

## 🔐 Persistência e privacidade

O Bimo utiliza o **LocalStorage** para armazenar informações no próprio navegador.

Entre os dados armazenados estão:

- Perfil e preferências.
- Registros do diário.
- Desafios e progresso.
- Moedas virtuais.
- Memória opcional.
- Avaliações das respostas.
- Histórico de conversas, quando ativado.

### Cuidados com os dados

- Os dados armazenados localmente não possuem criptografia automática.
- A integração com serviços externos altera o fluxo de dados.
- Quando o Gemini é utilizado, mensagens necessárias para a geração da resposta podem ser encaminhadas ao backend e ao provedor externo.
- Informações opcionais, como memória e registros do diário, devem ser compartilhadas apenas conforme os recursos e ações disponíveis na aplicação.

O usuário deve estar ciente de que o uso de serviços externos não representa garantia de confidencialidade absoluta.

---

## 🚀 Instalação e execução local

### Pré-requisitos

- Node.js 22 ou superior.
- npm.
- Git.

### 1. Clone o repositório

```bash
git clone https://github.com/luczss/Global-FrontWeb.git
```

### 2. Entre na pasta do projeto

```bash
cd Global-FrontWeb
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute a aplicação

```bash
npm run dev
```

Acesse o endereço informado pelo Vite no terminal. Normalmente:

```text
http://localhost:5173
```

### 5. Gerar versão de produção

```bash
npm run build
```

### 6. Visualizar a versão de produção localmente

```bash
npm run preview
```

---

## 🧪 Testes e validação

O projeto possui arquivos de testes automatizados na pasta `tests/`, contemplando diferentes áreas da aplicação, como:

- Motor de conversação.
- Cenários e continuidade de conversa.
- Endpoint de inteligência artificial.
- Cliente de IA e mecanismos de fallback.

Para executar os testes com o executor nativo do Node.js:

```bash
node --test tests/*.test.mjs
```

Para verificar se a aplicação gera a versão de produção corretamente:

```bash
npm run build
```

**Observação:** a integração com o Gemini também deve ser validada no ambiente da Vercel, com a variável de ambiente configurada. Testes com servidores simulados não substituem chamadas reais à API do Google.

---

## 🌐 Deploy

O projeto está publicado na Vercel.

<p align="center">
  <a href="https://global-front-web-psi.vercel.app/">
    <strong>🚀 ACESSAR A APLICAÇÃO — BIMO</strong>
  </a>
</p>



A integração com o Gemini depende da variável `GEMINI_API_KEY` configurada no ambiente da Vercel.

Após alterações no código ou nas variáveis de ambiente, é necessário realizar um novo deploy para aplicar as mudanças.

---

## 🤖 Documentação de Inteligência Artificial

O arquivo `AI.md` é destinado ao registro transparente da utilização de ferramentas de inteligência artificial durante o desenvolvimento.

A documentação deve apresentar:

- Ferramentas de IA utilizadas.
- Finalidade de cada ferramenta.
- Prompts utilizados durante o desenvolvimento.
- Funcionalidades desenvolvidas ou modificadas com auxílio de IA.
- Validações e testes realizados.
- Ajustes feitos após identificar problemas.
- Análise crítica da equipe sobre os resultados.

O objetivo é diferenciar as contribuições automatizadas das decisões, implementações e validações realizadas pelos integrantes.

---

## 🔄 Versionamento e colaboração

O projeto utiliza Git e GitHub para controle de versão e acompanhamento da evolução do desenvolvimento.

O histórico de commits registra a evolução do projeto, incluindo funcionalidades, correções e melhorias realizadas durante o processo de desenvolvimento.

**Requisito acadêmico:** manter pelo menos 15 commits significativos, conforme solicitado no trabalho.

[Consultar histórico de commits no GitHub](https://github.com/luczss/Global-FrontWeb/commits/main/)

---

<p align="center">
  <strong>Bimo — Expressar. Refletir. Conectar.</strong>
  <br />
  Desenvolvido como projeto acadêmico de Engenharia de Software.
  <br /><br />
  <em>Tecnologia que aproxima. Um espaço para se expressar.</em>
</p>
