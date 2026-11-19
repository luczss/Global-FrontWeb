# AI.md — Documentação do Uso de Inteligência Artificial

## 1. Visão Geral

Este documento apresenta a utilização de ferramentas de Inteligência Artificial durante o desenvolvimento do **Bimo — Expressar, Refletir e Conectar**, projeto acadêmico desenvolvido para a disciplina de Front-end Design e Web Development.

A Inteligência Artificial foi considerada uma ferramenta de apoio ao processo de desenvolvimento, contribuindo para pesquisas técnicas, análise de código, identificação de possíveis problemas, organização de funcionalidades e aprimoramento da experiência do usuário.

Seu uso não substituiu o trabalho dos integrantes. As sugestões geradas foram analisadas, adaptadas e validadas pela equipe antes de serem incorporadas ao projeto.

## 2. Objetivo do Uso de IA

A utilização de IA teve como principais objetivos:

- Apoiar a implementação e evolução das funcionalidades do Bimo.
- Auxiliar na identificação e correção de erros de programação.
- Melhorar a organização e a legibilidade do código.
- Sugerir melhorias na experiência de navegação e interface.
- Auxiliar na estruturação da lógica de conversação do mascote.
- Apoiar a integração com serviços externos e APIs.
- Identificar possíveis falhas de segurança e comportamentos inesperados.
- Contribuir para a documentação técnica do projeto.

## 3. Ferramentas de Inteligência Artificial

As ferramentas de IA utilizadas no processo de desenvolvimento devem ser registradas conforme sua participação real no projeto.

| Ferramenta | Finalidade |
|---|---|
| ChatGPT | Apoio à análise de código, resolução de problemas, organização de funcionalidades e sugestões de melhorias. |
| Claude | Apoio à revisão técnica, análise de arquitetura e avaliação de implementações, quando utilizado. |
| Google Gemini | Integração de inteligência artificial generativa ao modo de conversação do Bimo. |

**Observação:** O Google Gemini possui uma função diferente das ferramentas de assistência ao desenvolvimento: ele também integra o próprio funcionamento da aplicação, permitindo gerar respostas durante as conversas com o usuário.

## 4. Aplicações da IA no Desenvolvimento

### 4.1. Arquitetura e organização do código

A IA foi utilizada como apoio na análise da estrutura do projeto, considerando a separação entre componentes, páginas, hooks, serviços, dados e funções auxiliares.

O objetivo foi favorecer a reutilização de código, reduzir o acoplamento entre funcionalidades e facilitar a manutenção da aplicação.

### 4.2. Desenvolvimento do sistema de conversação

Um dos principais pontos de aplicação da inteligência artificial foi o sistema de conversação do Bimo.

Foram trabalhados aspectos como:

- Reconhecimento de intenções do usuário.
- Continuidade do contexto das conversas.
- Adaptação das respostas às preferências selecionadas.
- Diferentes personalidades para o mascote.
- Alternância entre o mecanismo local e o Google Gemini.
- Tratamento de falhas e respostas alternativas.

A aplicação também possui um mecanismo local de respostas, permitindo que o sistema continue funcionando mesmo quando a integração externa está desativada ou indisponível.

### 4.3. Correção e aprimoramento de código

A IA também foi utilizada como ferramenta de apoio durante a identificação de problemas técnicos.

Entre os aspectos trabalhados estão:

- Análise de erros de execução.
- Revisão de hooks e gerenciamento de estados.
- Avaliação de dependências de useEffect.
- Identificação de possíveis renderizações desnecessárias.
- Melhorias na organização de funções.
- Tratamento de situações inesperadas.

As alterações sugeridas foram avaliadas antes da aplicação, evitando incorporar soluções sem compreender seus impactos.

### 4.4. Interface e experiência do usuário

A IA auxiliou na avaliação de aspectos relacionados à experiência de utilização do Bimo, considerando:

- Clareza das informações.
- Organização dos elementos visuais.
- Facilidade de navegação.
- Consistência entre as páginas.
- Responsividade da interface.
- Acessibilidade e compreensão das funcionalidades.

O objetivo foi manter uma experiência intuitiva, acolhedora e coerente com a proposta emocional do projeto.

### 4.5. Segurança e privacidade

Considerando que o Bimo trabalha com registros pessoais e conversas, a segurança e a privacidade foram aspectos importantes durante o desenvolvimento.

A documentação e as implementações contemplam cuidados como:

- Proteção da chave de API do Google Gemini no ambiente backend.
- Validação e sanitização de informações recebidas.
- Tratamento de erros na comunicação com serviços externos.
- Controle sobre o compartilhamento de memória e registros pessoais.
- Mecanismos locais para situações prioritárias de segurança.

A IA foi utilizada como apoio para analisar possíveis vulnerabilidades e sugerir melhorias, sem substituir a validação técnica da equipe.

## 5. Exemplos de Prompts Utilizados

Os prompts abaixo representam modelos de solicitações relacionados às atividades do projeto. Devem ser mantidos como registros de utilização somente quando corresponderem às interações efetivamente realizadas pela equipe.

**Prompt 01 — Análise de arquitetura**

"Analise a estrutura do projeto React e identifique oportunidades de melhoria na separação entre componentes, hooks, serviços e lógica de negócio. Considere manutenção, reutilização e escalabilidade. Não proponha uma reestruturação desnecessária."

**Prompt 02 — Revisão de código**

"Analise este código React procurando problemas de gerenciamento de estado, dependências de useEffect, renderizações desnecessárias e possíveis conflitos entre hooks. Explique os problemas encontrados e apresente correções que preservem o comportamento atual da aplicação."

**Prompt 03 — Sistema de conversação**

"Analise a lógica de conversação do Bimo considerando reconhecimento de intenções, continuidade de contexto, personalidades e mecanismo de respostas local. Identifique situações em que a conversa pode perder coerência e proponha melhorias sem comprometer o funcionamento independente da API externa."

**Prompt 04 — Segurança da integração com IA**

"Faça uma análise técnica da integração com o Google Gemini. Verifique o tratamento de erros, a proteção da chave de API, a validação das entradas e o comportamento do sistema quando o serviço externo estiver indisponível."

**Prompt 05 — Experiência do usuário**

"Analise a experiência de utilização da plataforma Bimo. Avalie a clareza da navegação, consistência visual, responsividade e acessibilidade. Priorize melhorias que realmente facilitem a utilização, evitando alterações puramente estéticas."

## 6. Validação das Sugestões

As sugestões fornecidas pelas ferramentas de IA não foram consideradas automaticamente corretas.

O processo de validação deve considerar:

1. Análise da sugestão e de sua aplicabilidade ao projeto.
2. Verificação de compatibilidade com a arquitetura existente.
3. Implementação ou adaptação da solução pela equipe.
4. Execução de testes para identificar possíveis regressões.
5. Correção de problemas identificados durante a validação.
6. Aprovação da alteração antes de sua incorporação definitiva.

A validação técnica é especialmente importante nas funcionalidades relacionadas à conversação, persistência de dados, integração com APIs e segurança.

## 7. Testes e Verificações

O projeto possui uma estrutura de testes voltada à validação de diferentes partes da aplicação.

Entre os cenários contemplados estão:

- Funcionamento do mecanismo de conversação.
- Reconhecimento de intenções e continuidade de contexto.
- Funcionamento do endpoint de IA.
- Integração com o provedor Gemini.
- Tratamento de erros e mecanismos de fallback.
- Verificações relacionadas à segurança.
- Testes de navegação utilizando Playwright.

Comandos de validação:

```bash
npm test
```

```bash
npm run build
```

Os testes automatizados auxiliam na identificação de problemas, mas não substituem a validação manual da experiência completa nem os testes reais da integração publicada.

## 8. Limitações Identificadas

Apesar das vantagens, a utilização de inteligência artificial apresenta limitações que precisam ser consideradas.

- Respostas geradas podem apresentar informações incorretas.
- Sugestões de código podem não considerar particularidades da arquitetura existente.
- Soluções aparentemente corretas podem introduzir novos erros.
- Serviços externos podem apresentar indisponibilidade.
- A utilização de APIs externas exige atenção ao tratamento de dados pessoais.

Por esse motivo, a equipe manteve a responsabilidade pelas decisões técnicas, pela implementação e pela validação das funcionalidades.

## 9. Análise Crítica da Equipe

A utilização de IA contribuiu para ampliar as possibilidades de desenvolvimento e facilitar a investigação de problemas técnicos.

Entretanto, um dos principais aprendizados foi compreender que gerar código não significa necessariamente desenvolver uma solução adequada.

Durante o processo, tornou-se importante avaliar as sugestões recebidas, entender o funcionamento das implementações e identificar possíveis impactos em outras funcionalidades.

No Bimo, esse cuidado foi especialmente relevante porque a aplicação reúne diferentes mecanismos que precisam funcionar de maneira integrada, como conversação, diário pessoal, desafios, personalização, persistência local e integração com inteligência artificial generativa.

A experiência demonstrou que a IA pode acelerar etapas do desenvolvimento, mas a qualidade final depende da capacidade da equipe de analisar, adaptar, testar e assumir a responsabilidade pelas decisões tomadas.

## 10. Considerações Finais

A Inteligência Artificial foi utilizada como recurso complementar ao desenvolvimento do Bimo, contribuindo para atividades de análise, pesquisa, revisão e aprimoramento técnico.

Sua utilização permitiu explorar alternativas de implementação, investigar problemas e avaliar melhorias para a aplicação.

O principal aprendizado foi compreender que a IA deve funcionar como uma ferramenta de apoio à engenharia de software, e não como substituta do conhecimento técnico, da colaboração ou do pensamento crítico dos desenvolvedores.

**A responsabilidade pelo código entregue, pelas decisões arquiteturais e pela validação do funcionamento da aplicação permanece com a equipe de desenvolvimento.**
