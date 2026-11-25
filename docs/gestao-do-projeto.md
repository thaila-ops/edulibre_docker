# Gestão do projeto

## Processo de trabalho

O projeto usa **Kanban no Jira** com o fluxo: Backlog → A fazer → Em andamento → Em validação → Concluído. Cada item possui descrição, critérios de aceite, responsável, Pull Request e evidência de teste. As branches seguem o padrão `feat/EDLIBRE-<id>-<resumo>`.

## Cynefin e abordagem de trabalho

| Domínio | Exemplo no EduLivre | Abordagem |
| --- | --- | --- |
| Claro | Ajuste de texto, cor, rota ou validação conhecida | procedimento padronizado e revisão |
| Complicado | Docker, RBAC, Swagger e integração SMTP | analisar, consultar boas práticas, implementar e testar |
| Complexo | UX editorial, notificações em tempo real e cache | experimento pequeno, observar resultado e adaptar |
| Caótico | API indisponível durante demonstração | conter, restaurar serviço, comunicar e registrar incidente |

## Ciclo de vida

O núcleo segue uma abordagem **ágil e incremental**: itens pequenos são priorizados no Kanban, implementados em branch e validados em Pull Request. Aspectos previsíveis — Docker, documentação, pipeline e critérios de entrega — são conduzidos de forma planejada, com checklist de release e rollback.

## Product Backlog priorizado

| Prioridade | História | Critérios de aceite resumidos |
| --- | --- | --- |
| P0 | Como aluno, quero recuperar minha senha por e-mail | OTP de seis dígitos, expiração, limite de tentativas e senha atualizada |
| P0 | Como aluno, quero pagar uma aula aceita | Pix/cartão simulado, aprovação/recusa, auditoria sem dados sensíveis |
| P0 | Como administrador, quero moderar aulas | bloquear/desbloquear com notificação persistente ao professor |
| P1 | Como usuário conectado, quero receber alertas ao vivo | SSE autenticado, evento Redis e sino atualizado sem recarregar |
| P1 | Como administrador, quero comunicar manutenção | painel com modelos de comunicado e broadcast em tempo real |
| P1 | Como professor, quero imagens otimizadas | validação de imagem e conversão WebP pelo serviço de mídia |
| P2 | Como equipe, quero rastrear qualidade continuamente | CI, healthcheck, logs e documentação operacional |

## Evidências para anexar no Jira

- PRs vinculadas a cada ticket e CI verde.
- Captura do `health/ready` com banco, Redis e pagamento `up`.
- Captura de cache Redis em MISS/SET.
- Duas sessões de navegador mostrando comunicado ou nova aula recebida em tempo real.
- Checkout Pix aprovado, cartão de teste recusado e comprovante exibido no agendamento.
- Upload de imagem convertido/servido pelo microsserviço de mídia.
