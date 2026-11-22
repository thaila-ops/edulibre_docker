# Teste de caos: buffer e recuperação com Redis

## Objetivo

Validar que o worker de buffer mantém uma requisição pendente quando o
microsserviço de destino está indisponível e a reenvia depois que o
serviço recupera.

## Cenário executado

O alvo foi o microsserviço de pagamentos na rede Docker.

1. Limpar o buffer:

```powershell
docker compose exec redis redis-cli DEL edulibre:buffer:requests
```

2. Interromper o pagamento:

```powershell
docker compose stop pagamento
```

3. Enfileirar uma requisição válida:

```powershell
docker compose exec -T backend node -e "const { createClient } = require('/app/node_modules/redis'); (async () => { const r = createClient({ url: 'redis://redis:6379' }); await r.connect(); await r.rPush('edulibre:buffer:requests', JSON.stringify({ id: 'chaos-payment-2', target: 'pagamento', method: 'GET', path: '/health', body: null, createdAt: new Date().toISOString(), attempts: 0 })); await r.quit(); })();"
```

4. Confirmar o buffer durante a indisponibilidade:

```powershell
docker compose exec redis redis-cli LLEN edulibre:buffer:requests
docker compose logs --since 30s --tail 30 backend
```

Resultado observado:

- `LLEN` retornou `1`.
- O worker registrou `FLUSH ERROR`.
- O erro de timeout foi registrado como `This operation was aborted`.
- A requisição permaneceu na Redis List.

5. Recuperar o pagamento:

```powershell
docker compose up -d pagamento
```

Aguardar pelo menos 10 segundos e confirmar:

```powershell
docker compose exec redis redis-cli LLEN edulibre:buffer:requests
docker compose logs --since 30s --tail 30 backend
```

Resultado observado:

- `LLEN` voltou para `0`.
- O worker registrou `FLUSH OK` com `status=200`.
- O lote registrou `reenviados=1`.

## Evidência obtida

```text
[Buffer Worker] FLUSH ERROR: id=chaos-payment-2;
target=pagamento; erro=This operation was aborted

[Buffer Worker] FLUSH OK: id=chaos-payment-2;
target=pagamento; status=200

[Buffer Worker] LOTE: tamanho=1; reenviados=1
```

## Comportamento validado

- A falha do microsserviço não apaga o item.
- O item permanece no Redis enquanto o alvo está indisponível.
- O worker reprocessa o lote após a recuperação.
- O item é removido somente após uma resposta HTTP bem-sucedida.
- O teste não confirmou entrega garantida para falhas fora da rede local.

## Limitações conhecidas

- O Redis é necessário para manter o buffer.
- Pub/Sub não é usado neste fluxo.
- O valor `attempts` é registrado, mas não possui política pública de
  descarte automática.
- A requisição não é confirmada integralmente pelo destino além do
  status HTTP.
- Este teste cobre indisponibilidade temporária do microsserviço de
  pagamentos; não cobre reinicialização do Redis nem indisponibilidade do
  banco de dados.

## Cenário adicional: Redis indisponível

O Redis foi interrompido com `docker compose stop redis`.

O teste de enfileiramento direto confirmou a indisponibilidade:

```text
REDIS_INDISPONIVEL
```

Os logs do backend registraram fechamentos de socket, `ECONNREFUSED`
e timeouts durante a interrupção. Depois o Redis foi iniciado novamente
com `docker compose up -d redis`.

O Redis voltou com healthcheck `healthy` e respondeu `PONG`.

Os logs confirmaram a reconexão dos dois clientes:

```text
[Redis] Conexão pronta para uso.
[Redis Subscriber] Conexão pronta para uso.
```

O tamanho do buffer permaneceu em `0`, pois o teste enviou uma tentativa
direta que não chegou a enfileirar enquanto o Redis estava indisponível.
