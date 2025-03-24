# Guia de Implantação do Jogo de Damas Online

Este documento contém instruções detalhadas para implantar o jogo de damas online utilizando Docker.

## Requisitos

- Docker instalado (versão 19.03 ou superior)
- Docker Compose instalado (versão 1.27 ou superior)
- Acesso de administrador ao servidor de hospedagem
- Domínio configurado (damas.maroquio.com) apontando para o servidor

## Passo a Passo para Implantação

### 1. Preparação do Ambiente

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/jogo-damas-online.git
   cd jogo-damas-online
   ```

2. Verifique se as permissões estão corretas no script de implantação:
   ```bash
   chmod +x deploy.sh
   ```

### 2. Configuração

1. Revise as configurações em `.env`:
   ```bash
   # Ajuste as variáveis de ambiente conforme necessário
   # PORT=3000 (padrão)
   # NODE_ENV=production (padrão)
   ```

2. Se necessário, ajuste as configurações no `docker-compose.yml`:
   ```bash
   # Verifique mapeamentos de porta, volumes, etc.
   ```

### 3. Implantação com Docker

#### Opção 1: Utilizando o script de implantação

Execute o script de implantação automatizado:
```bash
./deploy.sh
```

#### Opção 2: Implantação manual

1. Construa a imagem Docker:
   ```bash
   docker-compose build
   ```

2. Inicie os contêineres:
   ```bash
   docker-compose up -d
   ```

3. Verifique se os contêineres estão rodando:
   ```bash
   docker-compose ps
   ```

4. Verifique os logs (se necessário):
   ```bash
   docker-compose logs -f
   ```

### 4. Configuração do Nginx (para produção)

Se estiver executando em um servidor com Nginx:

1. Copie o arquivo nginx.conf para o diretório de configurações:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/damas.maroquio.com
   ```

2. Crie um link simbólico para sites-enabled:
   ```bash
   sudo ln -s /etc/nginx/sites-available/damas.maroquio.com /etc/nginx/sites-enabled/
   ```

3. Teste a configuração do Nginx:
   ```bash
   sudo nginx -t
   ```

4. Reinicie o Nginx:
   ```bash
   sudo systemctl restart nginx
   ```

### 5. Configuração SSL (Opcional, mas recomendado)

Para configurar HTTPS com Let's Encrypt:

1. Instale o Certbot:
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Obtenha o certificado:
   ```bash
   sudo certbot --nginx -d damas.maroquio.com
   ```

3. Siga as instruções na tela para completar a configuração.

4. O Certbot atualizará automaticamente a configuração do Nginx.

### 6. Verificação

Acesse o jogo através do domínio:
- http://damas.maroquio.com (ou https:// se SSL configurado)

## Manutenção

### Atualização da Aplicação

1. Faça pull das atualizações do repositório:
   ```bash
   git pull origin main
   ```

2. Reconstrua e reinicie os contêineres:
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

### Backup

1. Para fazer backup dos dados (logs, etc.):
   ```bash
   tar -czvf damas-backup-$(date +%Y%m%d).tar.gz logs/
   ```

### Monitoramento

1. Verificar logs em tempo real:
   ```bash
   docker-compose logs -f
   ```

2. Verificar uso de recursos:
   ```bash
   docker stats damas-online
   ```

## Solução de Problemas

### Contêiner não inicia

1. Verifique os logs do contêiner:
   ```bash
   docker-compose logs
   ```

2. Verifique se as portas não estão em uso:
   ```bash
   netstat -tulpn | grep 3000
   ```

### Problemas de conexão

1. Verifique se o firewall permite conexões na porta 80/443:
   ```bash
   sudo ufw status
   ```

2. Para liberar as portas no firewall (se necessário):
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Problemas com WebSockets

Se os WebSockets não estiverem funcionando, verifique:

1. Configuração do Nginx está correta (headers de upgrade)
2. Se há algum proxy ou firewall bloqueando conexões WebSocket

## Recursos Adicionais

- [Documentação do Docker](https://docs.docker.com/)
- [Documentação do Docker Compose](https://docs.docker.com/compose/)
- [Documentação do Nginx](https://nginx.org/en/docs/)
- [Documentação do Let's Encrypt](https://letsencrypt.org/docs/)
