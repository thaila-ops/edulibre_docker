# Redis no EduLibre

O Redis está configurado no Docker Compose como base para o cache e a comunicação por eventos. A integração com o código da aplicação será implementada em tarefas posteriores.

## Configuração

- Imagem: `redis:7.4-alpine`.
- Rede: `internal_network`.
- Endereço para os containers dessa rede: `redis:6379`.
- Sem publicação de porta no computador.
- Healthcheck com `redis-cli ping`.

## Iniciar e verificar

Execute os comandos na raiz do projeto, com o Docker Desktop iniciado.

Validar a configuração:

```powershell
docker compose config --quiet
```

Iniciar o Redis em segundo plano:

```powershell
docker compose up -d redis
```

Consultar o estado:

```powershell
docker compose ps redis
```

O campo STATUS deve apresentar `(healthy)`. O campo PORTS pode mostrar `6379/tcp`, sem mapeamento para uma porta do computador.

Verificar a resposta:

```powershell
docker compose exec redis redis-cli ping
```

Resposta esperada: `PONG`.

## Consultar logs

Se houver falha na inicialização ou na verificação de saúde:

```powershell
docker compose logs --tail 50 redis
```