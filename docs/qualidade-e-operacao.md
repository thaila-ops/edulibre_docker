# Qualidade, resiliência e operação

## Quality Scenarios

| Atributo | Estímulo e condição | Resposta esperada | Critério de aceitação |
| --- | --- | --- | --- |
| Desempenho | Aluno pesquisa aulas com cache aquecido durante uso normal | API retorna página paginada sem bloquear o fluxo de navegação | p95 de `GET /aulas` abaixo de 1 s |
| Disponibilidade | Monitor externo solicita prontidão enquanto o ambiente está em operação | API informa prontidão e estado de banco, Redis e pagamento; indisponibilidade de dependência retorna não-pronto | pelo menos 99% de respostas prontas por mês no ambiente de demonstração |
| Resiliência de pagamento | Serviço de pagamento fica lento ou indisponível durante checkout | cliente limita cada tentativa a 5 s, repete uma vez e abre o circuit breaker após falhas consecutivas; reserva não é marcada como paga sem aprovação | resposta de falha em até 11 s por operação; circuito aberto por 30 s após três operações com falha |
| Entrega de evento | Nova aula é criada enquanto um usuário está conectado ao SSE | evento é publicado pelo Redis e entregue ao cliente conectado; notificações críticas continuam persistidas | entrega em menos de 5 s para clientes conectados |

Os critérios são metas do ambiente de demonstração, não resultados de benchmark já medidos. A seção de observabilidade define como coletar evidência para avaliá-los.

## SLOs e SLIs

| SLO | SLI / medida | Meta |
| --- | --- | --- |
| Disponibilidade da API | proporção de verificações bem-sucedidas de `GET /health/ready` | 99% por mês no ambiente de demonstração |
| Tempo de resposta do catálogo | latência p95 de `GET /aulas` com cache aquecido | abaixo de 1 s |
| Falha de pagamento | duração entre início e resposta de uma operação que falha | até 11 s, incluindo timeout e uma repetição |
| Entrega de alerta online | tempo entre publicação do evento e recebimento via SSE | menos de 5 s para usuários conectados |
| Comunicado operacional | resultado de envio SMTP informado ao administrador | sucesso/falha por destinatário apresentado ao solicitante |

## Resiliência aplicada

- Healthchecks Docker para MySQL, Redis, mídia e pagamento.
- Endpoint `GET /health/ready` verifica banco, Redis e pagamento com limite de 2 s por dependência.
- Cliente de pagamento usa timeout de 5 s por chamada, uma repetição após espera progressiva e circuit breaker após três operações consecutivas com falha; o circuito abre por 30 s.
- Serviço de mídia usa chave interna, healthcheck e fallback: se a otimização falhar, o backend conserva o arquivo original sem derrubar a criação da aula.
- Rate limit global e limites específicos para solicitar/confirmar recuperação de senha.
- Nginx termina TLS, encaminha `/api`, desativa buffering para SSE e serve arquivos estáticos.

## Plano de observabilidade

### Métricas e alertas

1. Um monitor externo deve consultar `/api/health/ready` a cada minuto e registrar sucesso, latência e estado de cada dependência. Alertar após duas verificações consecutivas sem prontidão; calcular o SLO mensal pela proporção de verificações bem-sucedidas.
2. Agregar os logs de acesso do Nginx para medir requisições, códigos HTTP e p50/p95/p99 por rota; alertar se o p95 de `/aulas` exceder 1 s por cinco minutos ou se a taxa de erro 5xx subir acima do limite operacional acordado.
3. Exportar contadores e duração para tentativas de pagamento, timeouts, recusas e abertura/fechamento do circuit breaker. Hoje o cliente registra alguns eventos no log, mas não exporta métricas; a instrumentação/collector deve ser habilitada antes de tratar estes SLI como monitorados automaticamente.
4. Medir envio SMTP por campanha e destinatário, separando sucesso e falha, sem registrar conteúdo de mensagem ou credenciais.

### Logs

Hoje os serviços emitem logs no console com etiquetas de responsabilidade; isso não equivale a agregação centralizada nem a logs JSON. Ao centralizar, padronizar campos `timestamp`, `service`, `level`, `event`, `requestId`, `dependency`, `durationMs` e `result`. Nunca registrar JWT, senhas, chaves, PAN/CVV ou conteúdo sensível de mensagens. Correlacionar incidentes por horário, serviço e `requestId`.

## Entrega contínua

O workflow [ci.yml](../.github/workflows/ci.yml) executa em push e pull request para `main`:

1. testes e build do backend;
2. checagem de tipos e build do frontend;
3. testes e build do microsserviço de pagamento;
4. validação da configuração Docker Compose.

O workflow também oferece deploy manual por `workflow_dispatch`, somente a partir de `main`, depois de todos os jobs de CI passarem. O job conecta por SSH e atualiza o checkout existente no servidor com `docker compose -p proj up -d --build`.

Para habilitar o deploy, configure o Environment `production` no GitHub:

| Tipo | Nome | Conteúdo |
| --- | --- | --- |
| Variable | `DEPLOY_HOST` | Host DNS ou IPv4 do servidor |
| Variable | `DEPLOY_USER` | Usuário SSH com permissão para executar Docker Compose |
| Variable | `DEPLOY_PATH` | Caminho absoluto, sem espaços, do clone do repositório no servidor |
| Secret | `DEPLOY_SSH_KEY` | Chave privada SSH dedicada ao deploy |
| Secret | `DEPLOY_KNOWN_HOSTS` | Chave de host previamente verificada do servidor SSH |

O checkout em `DEPLOY_PATH` deve ter `origin` apontando para este repositório, branch `main`, Docker Compose instalado e `.env` configurado fora do Git. Restrinja a chave ao host necessário e habilite aprovação de ambiente se o processo exigir aprovação humana. Sem essas configurações, o job de deploy falha explicitamente; os jobs de CI continuam independentes.

## Estratégia de release, rollback e incidentes

O deploy usa estratégia simples de atualização do Compose; não é blue/green e pode haver indisponibilidade durante a reconstrução. Antes de liberar, exigir CI verde e revisar o diff. Após o deploy, validar `/api/health/ready`, login, catálogo e uma ação do fluxo alterado.

Para rollback, no servidor selecionar o commit/tag estável anterior e reconstruir os serviços: `git -C "$DEPLOY_PATH" switch --detach COMMIT_OU_TAG` e `docker compose -f "$DEPLOY_PATH/docker-compose.yml" -p proj up -d --build`. Substitua `COMMIT_OU_TAG` pela referência estável. Para retornar ao fluxo normal de release, voltar à branch `main` e atualizar o clone. Registrar a versão, horário, impacto e resultado da validação.

### Playbook resumido de incidente

- **API indisponível:** consultar `/health/ready` e logs do `backend_service`; se a regressão veio do último release, aplicar rollback.
- **Redis indisponível:** cache e alertas ao vivo degradam; dados transacionais permanecem no MySQL. Verificar container e restabelecer o Redis.
- **Pagamento indisponível:** circuit breaker interrompe novas tentativas temporariamente; reservas não são marcadas como pagas. Verificar serviço NestJS e aguardar o cooldown antes de nova tentativa.
- **Mídia indisponível:** criação/edição continua pelo fallback com o arquivo original; verificar serviço e registrar as imagens não otimizadas.
- **Após mitigação:** registrar horário, dependência afetada, impacto, logs relevantes sem dados sensíveis, ação tomada e decisão de rollback.
