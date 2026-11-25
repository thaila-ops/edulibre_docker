# Qualidade, resiliência e operação

## SLOs e SLIs

| SLO | SLI / medida | Meta |
| --- | --- | --- |
| Disponibilidade da API | sucesso de `GET /health/ready` | 99% no ambiente de demonstração |
| Tempo de resposta do catálogo | latência de `GET /aulas` | p95 abaixo de 1 s com cache aquecido |
| Recuperação de pagamento | tentativas e disponibilidade do serviço | falha tratada em até 5 s por tentativa |
| Entrega de alerta online | conexão SSE ativa + evento entregue | menos de 5 s para usuários conectados |

## Resiliência aplicada

- Healthchecks Docker para MySQL, Redis, mídia e pagamento.
- Endpoint `GET /health/ready` verifica banco, Redis e pagamento com limite de 2 s por dependência.
- Cliente de pagamento usa timeout de 5 s, uma repetição com espera progressiva e circuit breaker após três falhas consecutivas; o circuito abre por 30 s.
- Serviço de mídia tem chave interna, healthcheck e fallback: se a otimização falhar, o backend conserva o fluxo de upload sem derrubar a criação da aula.
- Rate limit global e limites específicos para solicitar/confirmar recuperação de senha.
- Nginx termina TLS, encaminha `/api`, desativa buffering para SSE e serve arquivos estáticos.

## Observabilidade

- Logs estruturados por responsabilidade: cache (`MISS`, `SET`, TTL), Redis, assinante de eventos, circuit breaker e falhas capturadas pelo middleware.
- `/health/ready` é a checagem de prontidão operacional e pode ser usada pelo Docker, CI ou monitor externo.
- Cenário de incidente: registrar horário, dependência afetada, impacto, evidência em logs, mitigação e decisão de rollback.

## Entrega contínua

O workflow [ci.yml](../.github/workflows/ci.yml) executa, em cada push e pull request para `main`:

1. testes e build do backend;
2. checagem de tipos e build do frontend;
3. testes e build do microsserviço de pagamento;
4. validação da configuração Docker Compose.

O deploy local é feito por `docker compose -p proj up -d --build`. Segredos permanecem em `.env`, nunca em commits.

## Estratégia de release e rollback

1. Abrir branch vinculada ao ticket Jira e submeter Pull Request.
2. Exigir CI verde e revisar o diff.
3. Atualizar ambiente com `docker compose -p proj up -d --build`.
4. Verificar `https://edulibre.local/api/health/ready`, login, catálogo e uma ação do fluxo alterado.
5. Se houver regressão, retornar ao commit/tag anterior, reconstruir os serviços e registrar o incidente no Jira.

### Playbook resumido de incidente

- **API indisponível:** consultar `/health/ready` e logs do `backend_service`.
- **Redis indisponível:** cache e alertas ao vivo degradam; dados transacionais permanecem no MySQL.
- **Pagamento indisponível:** circuit breaker interrompe novas tentativas temporariamente; reservas não são marcadas como pagas.
- **Mídia indisponível:** criação/edição continua pelo fallback, registrar o ocorrido.
