# EduLibre — Frontend

Aplicação web em React e TypeScript, criada com Create React App. Consome a API do EduLibre para cadastro, autenticação, aulas, agendamentos e administração.

## Executar

Na pasta `EduLibre_FrontEnd-main`:

```powershell
npm ci
npm start
```

Consulte `.env.example` para configurar `REACT_APP_API_URL`. Nunca coloque credenciais nos arquivos do frontend: variáveis `REACT_APP_*` são incorporadas ao JavaScript entregue ao navegador.

## Organização

```text
src/
  App.tsx                  Composição do cabeçalho, rotas e rodapé
  main.tsx                 Inicialização do React e dos providers
  routes/AppRoutes.tsx     Rotas públicas e grupos protegidos por papel
  pages/                   Telas que compõem componentes e conectam ações
  components/
    home/                  Seções da página inicial e destaques
    lessons/               Cartão de aula, imagem e avaliações
    bookings/              Status e ações de decisão dos agendamentos
    dashboard/             Cartões da área da conta
    admin/                 Cartão de moderação de aulas
    Table.tsx              Estrutura de tabela e estado vazio
    DataTable.tsx          Tabela com ações de edição e exclusão
    StatsGrid.tsx          Indicadores usados nos painéis
  hooks/                   Carregamento e estado reutilizável das telas
  services/                Requisições HTTP separadas por domínio
  contexts/                Sessão e autenticação
  utils/                   Validações e funções independentes de React
  types.ts                 Contratos compartilhados das respostas da API
```

### Responsabilidades

- **Páginas:** definem a composição da tela. Reutilizam componentes e delegam carregamentos compartilhados aos hooks.
- **Componentes:** recebem dados e callbacks pelas propriedades. Cartões e tabelas não precisam conhecer os endpoints da API.
- **Hooks:** coordenam estado, carregamento e ações. `usePaginatedResource` recebe uma função estabilizada com `useCallback` e ignora resultados de consultas anteriores. O parâmetro `enabled` impede requisições que ainda dependem da sessão.
- **Serviços:** `auth`, `users`, `lessons`, `bookings`, `reviews`, `notifications` e `admin` contêm os contratos HTTP de cada assunto. Todos usam o cliente Axios de `api.ts`. `http.ts` mantém reexports para compatibilidade; novos imports devem apontar para o domínio específico.
- **Rotas:** `AppRoutes` agrupa acesso público, autenticado, professor e administrador. `ProtectedRoute` verifica a sessão antes de renderizar o `Outlet`. A autorização definitiva continua sendo responsabilidade do backend.
- **Estilos:** as classes e folhas de estilo existentes foram preservadas para manter o visual. Esta refatoração não migra a aplicação para outro framework nem reorganiza toda a cascata CSS.

## Validação

```powershell
npm test -- --watchAll=false --runInBand
npx tsc --noEmit
npm run build
```

Os testes cobrem os formulários existentes, destaques da home, proteção de rotas, decisões sobre agendamentos e concorrência no carregamento paginado.

Para executar apenas os testes de navegador contra um ambiente que já esteja funcionando:

```powershell
npx playwright test
```

O script legado `npm run test:e2e` executa `docker compose down -v` e remove volumes. Ele não deve ser usado para validar uma refatoração em um ambiente com dados que precisam ser preservados.

## Como evoluir

1. Adicione chamadas de API ao arquivo de serviço do domínio correspondente.
2. Extraia componentes quando houver uma responsabilidade visual clara ou repetição real.
3. Preserve os textos, URLs, propriedades e classes das telas ao refatorar.
4. Cubra mudanças de comportamento com testes, especialmente permissões e operações assíncronas.
5. Execute os testes, a verificação de tipos e a compilação antes da revisão.

O aplicativo mobile é um projeto separado e permanece inalterado.
