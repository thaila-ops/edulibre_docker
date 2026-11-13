# Eventos com Redis Pub/Sub — EDLIBRE-22

## Objetivo

Publicar o evento aula.criada após salvar uma nova aula e demonstrar
seu recebimento por um consumidor, com logs correlacionados.

## Fluxo implementado

1. O backend valida o professor.
2. Salva a aula no MySQL.
3. Invalida o cache de aulas.
4. Publica o evento no canal edulibre:aulas:criada.
5. O consumidor recebe a mensagem, verifica os campos usados no log
   e registra o recebimento.

O publicador e o consumidor executam no mesmo backend.
O consumidor utiliza uma conexão Redis exclusiva, criada com duplicate().
Nesta etapa, receber o evento não cria notificações nem altera dados.

## Formato da mensagem

- eventId: identificador único da mensagem.
- eventType: aula.criada.
- occurredAt: data e hora da geração, em formato ISO.
- data.aulaId: identificador da aula.
- data.professorId: identificador do professor.

## Arquivos principais

- EduLibre_BackEnd-main/src/config/redis.ts
- EduLibre_BackEnd-main/src/events/aula-criada.event.ts
- EduLibre_BackEnd-main/src/events/aula-criada.subscriber.ts
- EduLibre_BackEnd-main/src/services/aula-events.service.ts
- EduLibre_BackEnd-main/src/services/aula.service.ts
- EduLibre_BackEnd-main/src/server.ts

## Como demonstrar

Com o sistema funcionando no Docker:

1. Conferir o log de assinatura do canal.
2. Entrar no site com uma conta de professor.
3. Criar uma aula de teste.
4. Consultar os logs, na pasta raiz do projeto:

    docker compose logs --since 5m --tail 50 backend |
      Select-String -Pattern "\[Eventos\]"

5. Comparar eventId e aulaId nas mensagens PUBLICADO e RECEBIDO.

## Evidência manual

Foi observado o envio e o recebimento do evento da aula 17:

- eventId: 2867a56a-a32e-4b42-b605-eca3e29429ae
- Publicação com assinantes=1.
- Recebimento com o mesmo eventId e aulaId.

## Testes automatizados

Publicador:
- Publica no canal correto com os dados da aula.
- Retorna false e registra uma falha de publicação.
- Não tenta publicar quando o Redis está indisponível.

Consumidor:
- Assina o canal e registra o evento recebido.
- Ignora mensagem sem os campos necessários ao processamento.
- Trata texto que não é JSON válido.

Validação desta etapa:
- Compilação TypeScript concluída.
- 53 testes aprovados em 10 suítes do backend.

## Limitações

Redis Pub/Sub não persiste mensagens nem entrega novamente eventos
perdidos. Um consumidor desconectado não recebe as mensagens publicadas
durante sua ausência.

O retorno da publicação informa quantos assinantes receberam o envio
pelo Redis; não confirma que concluíram o processamento.

A gravação da aula e a publicação não são uma operação atômica.
Se a publicação falhar, a aula permanece salva e a falha é registrada.
Não existe fila de reenvio implementada.

O consumidor verifica os campos necessários ao log, mas ainda não
valida integralmente o contrato do evento.

Este fluxo não fornece garantia de entrega para operações financeiras.