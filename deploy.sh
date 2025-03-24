#!/bin/bash

# Script para implantação do jogo de damas online
# Utilizar em ambiente de produção

# Verificar se o Docker está instalado
if ! [ -x "$(command -v docker)" ]; then
  echo 'Erro: Docker não está instalado.' >&2
  exit 1
fi

# Verificar se o Docker Compose está instalado
if ! [ -x "$(command -v docker-compose)" ]; then
  echo 'Erro: Docker Compose não está instalado.' >&2
  exit 1
fi

echo "=== Iniciando implantação do Jogo de Damas Online ==="

# Criar diretório de logs, se não existir
mkdir -p logs

# Parar contêiner anterior, se existir
echo "Parando contêiner existente (se houver)..."
docker-compose down

# Reconstruir a imagem
echo "Reconstruindo imagem Docker..."
docker-compose build --no-cache

# Iniciar a aplicação
echo "Iniciando aplicação..."
docker-compose up -d

# Verificar status
echo "Verificando status da aplicação..."
docker-compose ps

echo "=== Implantação concluída ==="
echo "O jogo deve estar disponível em: http://damas.maroquio.com"
echo "Para verificar os logs, use: docker-compose logs -f"
