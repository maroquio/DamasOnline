document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const board = document.getElementById('board');
    const statusMessage = document.getElementById('status-message');
    const turnInfo = document.getElementById('turn-info');
    const roomInfo = document.getElementById('room-info');
    const roomId = document.getElementById('room-id');
    const copyRoomButton = document.getElementById('copy-room');
    const joinRoomInput = document.getElementById('room-input');
    const joinRoomButton = document.getElementById('join-button');
    const gameOver = document.getElementById('game-over');
    const winnerMessage = document.getElementById('winner-message');
    const newGameButton = document.getElementById('new-game-button');

    // Configuração do socket
    const socket = io('https://damas.maroquio.com'); // Conectar ao servidor Socket.IO
    
    // Variáveis do jogo
    let gameState = {
        board: initializeBoard(),
        currentPlayer: 'white', // Começa com as peças brancas
        selectedPiece: null,
        validMoves: [],
        playerColor: null,
        gameActive: false,
        roomId: null
    };

    // Inicializa o tabuleiro
    function initializeBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Posicionar peças pretas (nas fileiras 0, 1 e 2)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { color: 'black', king: false };
                }
            }
        }
        
        // Posicionar peças brancas (nas fileiras 5, 6 e 7)
        for (let row = 5; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if ((row + col) % 2 === 1) {
                    board[row][col] = { color: 'white', king: false };
                }
            }
        }
        
        return board;
    }

    // Renderizar o tabuleiro
    function renderBoard() {
        board.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light-square' : 'dark-square'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Adicionar peça se existir
                const piece = gameState.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.color} ${piece.king ? 'king' : ''}`;
                    square.appendChild(pieceElement);
                }
                
                // Adicionar classes para seleção e movimentos válidos
                if (gameState.selectedPiece && gameState.selectedPiece.row === row && gameState.selectedPiece.col === col) {
                    square.classList.add('selected');
                }
                
                if (gameState.validMoves.some(move => move.toRow === row && move.toCol === col)) {
                    square.classList.add('valid-move');
                }
                
                // Adicionar event listener
                square.addEventListener('click', () => handleSquareClick(row, col));
                
                board.appendChild(square);
            }
        }
    }

    // Manipular clique em um quadrado
    function handleSquareClick(row, col) {
        // Verificar se é a vez do jogador
        if (!gameState.gameActive || gameState.currentPlayer !== gameState.playerColor) {
            return;
        }
        
        const piece = gameState.board[row][col];
        
        // Se não houver peça selecionada e o quadrado clicado contém uma peça da cor atual
        if (!gameState.selectedPiece && piece && piece.color === gameState.currentPlayer) {
            selectPiece(row, col);
            return;
        }
        
        // Se uma peça já está selecionada
        if (gameState.selectedPiece) {
            // Se clicar na mesma peça, desseleciona
            if (gameState.selectedPiece.row === row && gameState.selectedPiece.col === col) {
                deselectPiece();
                return;
            }
            
            // Se clicar em outra peça da mesma cor, muda a seleção
            if (piece && piece.color === gameState.currentPlayer) {
                selectPiece(row, col);
                return;
            }
            
            // Tenta mover para um quadrado vazio
            const move = gameState.validMoves.find(move => move.toRow === row && move.toCol === col);
            if (move) {
                makeMove(move);
                return;
            }
        }
    }

    // Selecionar uma peça
    function selectPiece(row, col) {
        gameState.selectedPiece = { row, col };
        gameState.validMoves = getValidMoves(row, col);
        renderBoard();
    }

    // Desselecionar peça
    function deselectPiece() {
        gameState.selectedPiece = null;
        gameState.validMoves = [];
        renderBoard();
    }

    // Obter movimentos válidos para uma peça
    function getValidMoves(row, col) {
        const piece = gameState.board[row][col];
        if (!piece) return [];
        
        const moves = [];
        const captures = [];
        const direction = piece.color === 'white' ? -1 : 1; // Direção do movimento (para cima ou para baixo)
        
        // Verificar movimentos diagonais simples
        const checkMove = (toRow, toCol) => {
            // Se estiver fora do tabuleiro
            if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return;
            
            // Se o destino estiver vazio, pode mover
            if (!gameState.board[toRow][toCol]) {
                moves.push({ fromRow: row, fromCol: col, toRow, toCol, isCapture: false });
            }
            // Se o destino tiver uma peça do oponente, verifica se pode capturar
            else if (gameState.board[toRow][toCol].color !== piece.color) {
                const jumpRow = toRow + (toRow - row);
                const jumpCol = toCol + (toCol - col);
                
                // Verificar se o quadrado após o oponente está dentro do tabuleiro e vazio
                if (jumpRow >= 0 && jumpRow <= 7 && jumpCol >= 0 && jumpCol <= 7 && !gameState.board[jumpRow][jumpCol]) {
                    captures.push({
                        fromRow: row, 
                        fromCol: col, 
                        toRow: jumpRow, 
                        toCol: jumpCol, 
                        isCapture: true,
                        captureRow: toRow,
                        captureCol: toCol
                    });
                }
            }
        };
        
        // Verificar movimentos de peça normal (apenas para frente)
        if (!piece.king) {
            checkMove(row + direction, col - 1); // Diagonal esquerda
            checkMove(row + direction, col + 1); // Diagonal direita
        } 
        // Verificar movimentos de dama (para todas as direções)
        else {
            checkMove(row - 1, col - 1); // Diagonal superior esquerda
            checkMove(row - 1, col + 1); // Diagonal superior direita
            checkMove(row + 1, col - 1); // Diagonal inferior esquerda
            checkMove(row + 1, col + 1); // Diagonal inferior direita
        }
        
        // Se houver capturas disponíveis, apenas retorna as capturas (capturas são obrigatórias)
        return captures.length > 0 ? captures : moves;
    }

    // Verificar todas as capturas possíveis no tabuleiro
    function getAllCaptureMoves() {
        const allCaptures = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === gameState.currentPlayer) {
                    const moves = getValidMoves(row, col);
                    const captures = moves.filter(move => move.isCapture);
                    allCaptures.push(...captures);
                }
            }
        }
        
        return allCaptures;
    }

    // Fazer um movimento
    function makeMove(move) {
        const { fromRow, fromCol, toRow, toCol, isCapture, captureRow, captureCol } = move;
        
        // Mover a peça
        gameState.board[toRow][toCol] = gameState.board[fromRow][fromCol];
        gameState.board[fromRow][fromCol] = null;
        
        // Remover a peça capturada, se houver
        if (isCapture) {
            gameState.board[captureRow][captureCol] = null;
        }
        
        // Verificar se a peça virou dama
        if (gameState.board[toRow][toCol].color === 'white' && toRow === 0) {
            gameState.board[toRow][toCol].king = true;
        } else if (gameState.board[toRow][toCol].color === 'black' && toRow === 7) {
            gameState.board[toRow][toCol].king = true;
        }
        
        // Verificar capturas múltiplas
        if (isCapture) {
            const additionalCaptures = getValidMoves(toRow, toCol).filter(move => move.isCapture);
            if (additionalCaptures.length > 0) {
                // Ainda tem capturas disponíveis, mantém o mesmo jogador
                gameState.selectedPiece = { row: toRow, col: toCol };
                gameState.validMoves = additionalCaptures;
                renderBoard();
                
                // Enviar o movimento para o servidor
                if (gameState.roomId) {
                    socket.emit('move', {
                        roomId: gameState.roomId,
                        move: move,
                        gameState: gameState.board,
                        nextTurn: gameState.currentPlayer, // Mantém o mesmo jogador
                        isMultiCapture: true
                    });
                }
                
                return;
            }
        }
        
        // Mudar o jogador
        gameState.currentPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
        deselectPiece();
        
        // Verificar se o jogo acabou
        checkGameOver();
        
        // Atualizar a interface
        updateGameInfo();
        
        // Enviar o movimento para o servidor
        if (gameState.roomId) {
            socket.emit('move', {
                roomId: gameState.roomId,
                move: move,
                gameState: gameState.board,
                nextTurn: gameState.currentPlayer,
                isMultiCapture: false
            });
        }
    }

    // Verificar se o jogo acabou
    function checkGameOver() {
        let hasWhite = false;
        let hasBlack = false;
        let whiteCanMove = false;
        let blackCanMove = false;
        
        // Verificar se ainda existem peças e se podem se mover
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece) {
                    if (piece.color === 'white') {
                        hasWhite = true;
                        if (!whiteCanMove && getValidMoves(row, col).length > 0) {
                            whiteCanMove = true;
                        }
                    } else {
                        hasBlack = true;
                        if (!blackCanMove && getValidMoves(row, col).length > 0) {
                            blackCanMove = true;
                        }
                    }
                }
            }
        }
        
        // Determinar o vencedor
        if (!hasWhite || (gameState.currentPlayer === 'white' && !whiteCanMove)) {
            endGame('black');
        } else if (!hasBlack || (gameState.currentPlayer === 'black' && !blackCanMove)) {
            endGame('white');
        }
    }

    // Finalizar o jogo
    function endGame(winner) {
        gameState.gameActive = false;
        
        if (winner) {
            const isWinner = winner === gameState.playerColor;
            winnerMessage.textContent = isWinner ? 'Você venceu!' : 'Você perdeu!';
        } else {
            winnerMessage.textContent = 'Empate!';
        }
        
        gameOver.classList.remove('hidden');
        
        // Informar o servidor sobre o fim do jogo
        if (gameState.roomId) {
            socket.emit('game-over', {
                roomId: gameState.roomId,
                winner: winner
            });
        }
    }

    // Atualizar informações do jogo na interface
    function updateGameInfo() {
        if (gameState.gameActive) {
            const isPlayerTurn = gameState.currentPlayer === gameState.playerColor;
            turnInfo.textContent = isPlayerTurn ? 'Sua vez' : 'Vez do oponente';
        } else {
            turnInfo.textContent = 'Aguardando jogador...';
        }
    }

    // --- Funções de conexão e sala ---
    
    // Iniciar uma nova sala
    function createRoom() {
        socket.emit('create-room');
    }
    
    // Entrar em uma sala existente
    function joinRoom(id) {
        if (id && id.trim()) {
            socket.emit('join-room', id.trim());
        }
    }
    
    // Iniciar um novo jogo
    function startNewGame() {
        gameState.board = initializeBoard();
        gameState.currentPlayer = 'white';
        gameState.selectedPiece = null;
        gameState.validMoves = [];
        gameState.gameActive = true;
        
        gameOver.classList.add('hidden');
        
        if (gameState.roomId) {
            socket.emit('new-game', {
                roomId: gameState.roomId
            });
        }
        
        renderBoard();
        updateGameInfo();
    }
    
    // --- Event listeners ---
    
    // Entrar em uma sala
    joinRoomButton.addEventListener('click', () => {
        joinRoom(joinRoomInput.value);
    });
    
    // Copiar ID da sala
    copyRoomButton.addEventListener('click', () => {
        navigator.clipboard.writeText(gameState.roomId)
            .then(() => {
                alert('ID da sala copiado para a área de transferência!');
            })
            .catch(err => {
                console.error('Falha ao copiar ID:', err);
            });
    });
    
    // Iniciar novo jogo
    newGameButton.addEventListener('click', startNewGame);
    
    // --- Socket event handlers ---
    
    // Conectado ao servidor
    socket.on('connect', () => {
        statusMessage.textContent = 'Conectado ao servidor. Crie ou entre em uma sala.';
        createRoom(); // Automaticamente criar uma sala
    });
    
    // Desconectado do servidor
    socket.on('disconnect', () => {
        statusMessage.textContent = 'Desconectado do servidor. Tentando reconectar...';
        gameState.gameActive = false;
        roomInfo.classList.add('hidden');
        updateGameInfo();
    });
    
    // Sala criada
    socket.on('room-created', (data) => {
        gameState.roomId = data.roomId;
        gameState.playerColor = 'white'; // O criador da sala joga com as peças brancas
        
        statusMessage.textContent = 'Sala criada. Aguardando oponente...';
        roomId.textContent = data.roomId;
        roomInfo.classList.remove('hidden');
        
        renderBoard();
        updateGameInfo();
    });
    
    // Entrou na sala
    socket.on('room-joined', (data) => {
        gameState.roomId = data.roomId;
        gameState.playerColor = 'black'; // Quem entra na sala joga com as peças pretas
        gameState.gameActive = true;
        
        statusMessage.textContent = 'Conectado à sala. O jogo começou!';
        roomId.textContent = data.roomId;
        roomInfo.classList.remove('hidden');
        
        renderBoard();
        updateGameInfo();
    });
    
    // Oponente entrou na sala
    socket.on('opponent-joined', () => {
        statusMessage.textContent = 'Oponente conectado. O jogo começou!';
        gameState.gameActive = true;
        
        renderBoard();
        updateGameInfo();
    });
    
    // Oponente saiu da sala
    socket.on('opponent-left', () => {
        statusMessage.textContent = 'Oponente desconectado. Aguardando novo oponente...';
        gameState.gameActive = false;
        
        updateGameInfo();
    });
    
    // Receber movimento do oponente
    socket.on('move-made', (data) => {
        // Atualizar o tabuleiro com o estado recebido
        gameState.board = data.gameState;
        gameState.currentPlayer = data.nextTurn;
        
        renderBoard();
        updateGameInfo();
        
        // Se não for captura múltipla, verificar fim de jogo
        if (!data.isMultiCapture) {
            checkGameOver();
        }
    });
    
    // Jogo terminado
    socket.on('game-ended', (data) => {
        endGame(data.winner);
    });
    
    // Erro
    socket.on('error', (data) => {
        alert('Erro: ' + data.message);
    });
    
    // Novo jogo
    socket.on('game-restarted', () => {
        startNewGame();
    });
    
    // Inicializa o tabuleiro
    renderBoard();
});
