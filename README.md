# Jogo de Damas Online

Um jogo de damas online onde você pode jogar contra um adversário remoto em tempo real.

## Funcionalidades

- Tabuleiro interativo de damas 8x8
- Salas de jogo com IDs únicos para jogos privados
- Sistema de matchmaking com compartilhamento de ID da sala
- Suporte a regras oficiais de damas
  - Movimentos diagonais
  - Capturas obrigatórias
  - Múltiplas capturas em um único turno
  - Promoção para dama
  - Detecção automática de fim de jogo

## Tecnologias Utilizadas

- HTML5, CSS3 e JavaScript para o frontend
- Node.js e Express para o backend
- Socket.io para comunicação em tempo real
- UUID para geração de IDs únicos de sala

## Como Executar

### Requisitos

- Node.js (versão 14 ou superior)
- NPM (geralmente vem com o Node.js)

### Passos para Execução

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/jogo-damas-online.git
   cd jogo-damas-online
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Inicie o servidor:
   ```
   npm start
   ```

4. Acesse o jogo:
   - Em desenvolvimento: `http://localhost:3000`
   - Em produção: `https://damas.maroquio.com`

## Como Jogar

1. Ao acessar o jogo, você será automaticamente conectado a uma nova sala.
2. Compartilhe o ID da sala com seu adversário.
3. Seu adversário deve inserir o ID da sala e clicar em "Entrar na Sala".
4. O jogo começa automaticamente quando os dois jogadores estão conectados.
5. As peças brancas sempre começam.
6. Os movimentos são alternados entre os jogadores.
7. Capturas são obrigatórias.
8. O jogo termina quando um jogador não pode mais mover suas peças ou quando todas as peças de um jogador foram capturadas.

## Regras do Jogo

- As peças se movem apenas na diagonal, uma casa por vez
- As peças só podem se mover para frente (exceto as damas)
- Capturas ocorrem pulando por cima da peça adversária para um espaço vazio
- Capturas são obrigatórias
- Múltiplas capturas são permitidas e obrigatórias em um único turno
- Quando uma peça atinge a última fileira do lado oposto, ela é promovida a dama
- As damas podem se mover para trás e para frente nas diagonais
- O jogo termina quando um jogador não pode mais mover ou quando todas as suas peças foram capturadas

## Estrutura do Projeto

- `index.html` - Página principal do jogo
- `styles.css` - Estilização do jogo
- `script.js` - Lógica do cliente do jogo
- `server.js` - Servidor para gerenciar as conexões dos jogadores
- `package.json` - Configuração de dependências e scripts

## Hospedagem

O jogo está hospedado em `damas.maroquio.com`.
