FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar arquivos de definição de pacotes
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código-fonte da aplicação
COPY . .

# Expor a porta em que o servidor vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "server.js"]
