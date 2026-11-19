<p align="center">   <img src="/src/assets/characters/bimoimg.png" alt="Bimo — suporte emocional, sempre por perto" width="100%" /> </p>

<h1 align="center">Bimo — Expressar, Refletir e Conectar</h1>

<p align="center">
  <strong>Um espaço digital para expressão emocional, autoconhecimento e conexão.</strong>
  <br />
  <em>Suporte emocional, sempre por perto.</em>
</p>

<p align="center">
&#x20; \<img src="[https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white](https://img.shields.io/badge/React-18-61DAFB?logo=react\&logoColor=white)" />
&#x20; \<img src="[https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white](https://img.shields.io/badge/Vite-5-646CFF?logo=vite\&logoColor=white)" />
&#x20; \<img src="[https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss\&logoColor=white)" />
&#x20; \<img src="[https://img.shields.io/badge/Google_Gemini-API-8E75B2?logo=googlegemini&logoColor=white](https://img.shields.io/badge/Google_Gemini-API-8E75B2?logo=googlegemini\&logoColor=white)" />
&#x20; \<img src="[https://img.shields.io/badge/Status-Em_desenvolvimento-2E5247](https://img.shields.io/badge/Status-Em_desenvolvimento-2E5247)" />
</p>

<p align="center">
&#x20; \<a href="[https://teste-gs-mu.vercel.app/](https://teste-gs-mu.vercel.app/)">Acessar projeto publicado\</a>
</p>

---

## Equipe

O projeto foi desenvolvido por:

| Integrante                   |     RM |
| ---------------------------- | -----: |
| Eduardo Guzeli Nogueira      | 571143 |
| Diego Caio de Ulhôa          | 572190 |
| Lucas dos Santos Oliveira    | 571718 |
| Octávio Mello Covre de Souza | 571811 |
| Gabriel Torres Zambo         | 569883 |

---

## Sobre o projeto

O **Bimo** é uma plataforma web desenvolvida para incentivar a expressão emocional, a reflexão pessoal e a conexão entre pessoas.

A aplicação utiliza um mascote interativo como ponto de aproximação, oferecendo um ambiente digital no qual o usuário pode conversar, registrar pensamentos, realizar pequenos desafios e acompanhar seu próprio progresso.

O projeto combina uma experiência de conversação com funcionalidades de organização pessoal, personalização e inteligência artificial opcional.

Sua proposta é tornar a expressão emocional mais acessível por meio de uma interface intuitiva, acolhedora e responsiva.

> O Bimo é uma ferramenta de apoio à expressão emocional. Não realiza diagnósticos, não substitui acompanhamento psicológico ou médico e não deve ser utilizado como serviço de emergência.

## Funcionalidades

### Dashboard

- Visão geral das atividades.
- Acesso rápido às funcionalidades.
- Resumo de registros e desafios.
- Acompanhamento do progresso.

### Modo Conversa

- Conversas com o mascote Bimo.
- Três personalidades: Acolhedor, Motivador e Desafiador.
- Reconhecimento de intenções e continuidade de contexto.
- Respostas adaptadas às preferências do usuário.
- Histórico de conversas opcional.
- Avaliação das respostas.
- Alternância entre motor local e Google Gemini.

### Diário pessoal

- Criação de registros.
- Edição e exclusão de registros.
- Busca por título e conteúdo.
- Reconhecimento de voz pelo navegador.
- Persistência local dos registros.

### Desafios

- Desafios graduais e opcionais.
- Criação e exclusão de desafios personalizados.
- Registro de conclusão.
- Sistema de moedas virtuais.
- Acompanhamento de progresso e dias consecutivos.
- Integração com API externa.

### Personalização

- Personalidades diferentes para o Bimo.
- Loja de acessórios.
- Sistema de moedas virtuais.
- Personalização do mascote.

### Memória e configurações

- Memória opcional e editável.
- Controle de privacidade.
- Preferências de conversação.
- Opção de respostas mais curtas.
- Modo de conversa sem conselhos.
- Controle manual da inteligência artificial.

---

## Tecnologias utilizadas

| Tecnologia        | Aplicação                           |
| ----------------- | ----------------------------------- |
| React 18          | Construção da interface             |
| Vite              | Ambiente de desenvolvimento e build |
| JavaScript        | Lógica da aplicação                 |
| Tailwind CSS 3    | Estilização e responsividade        |
| React Hooks       | Gerenciamento de estados e efeitos  |
| Custom Hooks      | Organização da lógica reutilizável  |
| Google Gemini API | Geração opcional de respostas       |
| `@google/genai`   | SDK oficial do Google Gemini        |
| JSONPlaceholder   | API externa para operações CRUD     |
| LocalStorage      | Persistência de dados no navegador  |
| Vercel            | Hospedagem e execução do backend    |

## Inteligência artificial — Google Gemini

O Bimo possui integração com a API do Google Gemini por meio de uma função backend hospedada na Vercel.

**IMPORTANTE: A inteligência artificial vem DESATIVADA por padrão. Para utilizar as respostas do Gemini, é necessário ativar manualmente o recurso.**

### Como ativar o modo IA

1. Acesse o Bimo.
2. Entre na página **Configurações**.
3. Localize a opção **Respostas com IA (Google Gemini)**.
4. Ative a opção.
5. Acesse o Modo Conversa e envie uma mensagem.
6. Verifique a identificação **IA · Google Gemini** nas respostas.

\<details>
\<summary>\<strong>Como funciona a alternância entre os motores?\</strong>\</summary>

O Bimo possui dois mecanismos de resposta:

- **Motor local:** funciona diretamente no navegador, utilizando regras, intenções, contexto e modelos de resposta. Não depende de uma API paga.
- **Google Gemini:** utiliza inteligência artificial generativa para produzir respostas contextualizadas, quando ativada e disponível.

Se a IA estiver desativada, indisponível ou apresentar falhas, o sistema utiliza automaticamente o motor local.

Situações prioritárias de segurança continuam sendo tratadas pelo mecanismo local.

\</details>

### Configuração da API

A chave do Google Gemini deve ser configurada exclusivamente no servidor.

Variável de ambiente:

```env
GEMINI_API_KEY=sua_chave_aqui
```

Na Vercel:

1. Acesse o projeto.
2. Entre em **Settings**.
3. Abra **Environment Variables**.
4. Adicione `GEMINI_API_KEY`.
5. Configure para Production e Preview.
6. Salve e realize um novo deploy.

A chave nunca deve ser adicionada ao código do frontend ou enviada ao GitHub.

Modelo padrão configurado:

```text
gemini-3.1-flash-lite
```

Endpoint utilizado:

```text
/api/chat
```

Para verificar a configuração da integração, acesse:

```text
https://teste-gs-mu.vercel.app/api/chat
```

O endpoint GET retorna informações de configuração, como provedor e modelo, sem expor a chave.

---

## Arquitetura do projeto

A aplicação utiliza uma organização modular, separando interface, páginas, lógica de negócio, serviços e dados.

```text
bimo/
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

## Requisitos técnicos do trabalho

O desenvolvimento contempla os principais requisitos técnicos de Front-end Design e Web Development.

| Requisito                | Implementação no Bimo                                         |
| ------------------------ | ------------------------------------------------------------- |
| React com Vite           | Aplicação construída com React 18 e Vite                      |
| Tailwind CSS             | Estilização da interface                                      |
| Mínimo de 8 componentes  | Componentes reutilizáveis distribuídos pela aplicação         |
| useState                 | Gerenciamento de estados                                      |
| useEffect                | Efeitos e sincronização de dados                              |
| Mínimo de 2 Custom Hooks | O projeto possui 8 hooks personalizados                       |
| Organização de código    | Separação entre componentes, páginas, hooks, serviços e dados |
| API externa              | Integração com JSONPlaceholder                                |
| CRUD                     | Operações de criação, consulta, atualização e exclusão        |
| Documentação             | README.md e AI.md                                             |
| Versionamento            | Histórico de commits no Git                                   |

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

Esses hooks permitem separar a lógica de negócio dos componentes visuais, facilitando a manutenção e reutilização do código.

---

## Integração com API externa — CRUD

O Bimo utiliza a API pública JSONPlaceholder para demonstrar operações CRUD relacionadas aos desafios.

| Operação | Método HTTP | Funcionalidade      |
| -------- | ----------- | ------------------- |
| Create   | POST        | Criar desafio       |
| Read     | GET         | Consultar desafios  |
| Update   | PATCH       | Atualizar conclusão |
| Delete   | DELETE      | Excluir desafio     |

Endpoint:

```text
https://jsonplaceholder.typicode.com/todos
```

**Observação:** o JSONPlaceholder é uma API de demonstração. As operações simulam a comunicação com um backend, mas não persistem alterações permanentemente no servidor.

A persistência real dos desafios acontece localmente, utilizando LocalStorage. Se a API estiver indisponível, a aplicação continua funcionando com os dados locais.

---

## Persistência e privacidade

O Bimo utiliza o LocalStorage para armazenar informações no próprio navegador.

Entre os dados armazenados estão:

- Perfil e preferências.
- Registros do diário.
- Desafios e progresso.
- Moedas virtuais.
- Memória opcional.
- Avaliações das respostas.
- Histórico de conversas, quando ativado.

Os dados locais não possuem criptografia. A ativação da IA externa altera o fluxo de dados.

Quando o Gemini está ativado:

- As últimas mensagens da conversa podem ser enviadas ao servidor e ao Google Gemini.
- A memória só é enviada quando a funcionalidade está ativada.
- Um registro do diário só é enviado quando o usuário escolhe compartilhá-lo.
- O diário completo e o histórico completo não são enviados.

O usuário deve estar ciente de que a integração com serviços externos não representa garantia de confidencialidade absoluta.

---

## Instalação e execução local

### Pré-requisitos

- Node.js 22 ou superior.
- npm.
- Git.

### 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

### 2. Entre na pasta do projeto

```bash
cd bimo
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute a aplicação

```bash
npm run dev
```

Acesse o endereço informado pelo Vite no terminal, normalmente:

```text
http://localhost:5173
```

### 5. Gerar versão de produção

```bash
npm run build
```

### 6. Executar os testes automatizados

```bash
npm test
```

---

## Testes e validação

O projeto possui testes automatizados organizados em diferentes áreas:

- Testes do motor de conversação.
- Testes de cenários e continuidade.
- Testes do endpoint de IA.
- Testes do provedor Gemini.
- Testes de segurança.
- Testes do cliente de IA e fallback.
- Testes de navegação com Playwright.

Para executar a suíte principal:

```bash
npm test
```

Para gerar o build:

```bash
npm run build
```

**Importante:** os testes automatizados do Gemini utilizam um servidor simulado. Eles não substituem a validação com chamadas reais à API do Google. A integração publicada também deve ser testada no ambiente da Vercel.

---

## Deploy

O projeto está hospedado na Vercel.

**Acessar aplicação:**
[https://teste-gs-mu.vercel.app/](https://teste-gs-mu.vercel.app/)

A integração com Gemini depende da variável `GEMINI_API_KEY` configurada no ambiente da Vercel.

Após alterações no código ou nas variáveis de ambiente, é necessário realizar um novo deploy para aplicar as mudanças.

---

## Documentação de Inteligência Artificial

O arquivo `AI.md` registra o uso de ferramentas de inteligência artificial durante o desenvolvimento.

A documentação deve apresentar:

- Ferramentas utilizadas.
- Finalidade de cada ferramenta.
- Prompts utilizados.
- Funcionalidades desenvolvidas ou modificadas com auxílio de IA.
- Validações e testes realizados.
- Ajustes feitos após identificar problemas.
- Análise crítica da equipe sobre os resultados.

O uso de IA deve ser documentado de forma transparente, distinguindo as contribuições automatizadas das decisões e implementações realizadas pelos integrantes.

---

## Versionamento e colaboração

O projeto utiliza Git e GitHub para controle de versão e acompanhamento da evolução do desenvolvimento.

Os commits devem representar alterações reais e significativas, organizadas por funcionalidade, correção ou melhoria.

**Requisito acadêmico:** manter pelo menos 15 commits significativos, conforme solicitado no trabalho.

---

\<p align="center">
&#x20; \<strong>Bimo — Expressar. Refletir. Conectar.\</strong>
&#x20; \<br />
&#x20; Desenvolvido como projeto acadêmico de Engenharia de Software.
\</p>
