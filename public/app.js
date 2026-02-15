/* ── app.js — Socket.IO client for tic-tac-toe ────────────────────── */
(() => {
    'use strict';

    const socket = io();

    // ── DOM refs ──────────────────────────────────────────────────────
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => document.querySelectorAll(s);

    const views = { lobby: $('#lobby'), waiting: $('#waiting'), game: $('#game') };
    const lobbyError = $('#lobbyError');
    const roomCodeDisp = $('#roomCodeDisplay');
    const cells = $$('.cell');
    const turnBadge = $('#turnIndicator');
    const resultOverlay = $('#resultOverlay');
    const resultText = $('#resultText');
    const toast = $('#toast');

    let mySymbol = null;
    let currentTurn = 'X';
    let gameOver = false;
    let roomCode = '';

    // ── View switching ────────────────────────────────────────────────
    function showView(name) {
        Object.values(views).forEach(v => v.classList.remove('active'));
        views[name].classList.add('active');
    }

    // ── Lobby: Create Room ────────────────────────────────────────────
    $('#btnCreate').addEventListener('click', () => {
        const name = $('#playerName').value.trim() || 'Player 1';
        lobbyError.textContent = '';
        socket.emit('createRoom', name, (res) => {
            if (res.success) {
                mySymbol = res.symbol;
                roomCode = res.code;
                roomCodeDisp.textContent = res.code;
                $('#footerRoomCode').textContent = res.code;
                showView('waiting');
            } else {
                lobbyError.textContent = res.message || 'Could not create room.';
            }
        });
    });

    // ── Lobby: Join Room ──────────────────────────────────────────────
    $('#btnJoin').addEventListener('click', () => {
        const code = $('#roomCodeInput').value.trim().toUpperCase();
        const name = $('#playerName').value.trim() || 'Player 2';
        if (code.length < 4) {
            lobbyError.textContent = 'Enter a valid room code.';
            return;
        }
        lobbyError.textContent = '';
        socket.emit('joinRoom', { code, playerName: name }, (res) => {
            if (res.success) {
                mySymbol = res.symbol;
                roomCode = res.code;
                $('#footerRoomCode').textContent = res.code;
            } else {
                lobbyError.textContent = res.message || 'Could not join room.';
            }
        });
    });

    // Allow pressing Enter in room code input
    $('#roomCodeInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') $('#btnJoin').click();
    });

    // ── Waiting: Copy code ────────────────────────────────────────────
    $('#btnCopyCode').addEventListener('click', () => {
        navigator.clipboard.writeText(roomCode).then(() => {
            const btn = $('#btnCopyCode');
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = 'Copy Code', 2000);
        });
    });

    // ── Game Start (received when 2nd player joins) ───────────────────
    socket.on('gameStart', (data) => {
        renderGame(data);
        showView('game');
        resultOverlay.classList.add('hidden');
    });

    // ── Move Made ─────────────────────────────────────────────────────
    socket.on('moveMade', (data) => {
        renderBoard(data.board, data.winLine);
        updateScores(data.scores);
        currentTurn = data.turn;
        updateTurnBadge();

        if (data.gameOver) {
            gameOver = true;
            showResult(data.winner);
        }
    });

    // ── Game Restarted ────────────────────────────────────────────────
    socket.on('gameRestarted', (data) => {
        gameOver = false;
        renderGame(data);
        resultOverlay.classList.add('hidden');
    });

    // ── Opponent Left ─────────────────────────────────────────────────
    socket.on('opponentLeft', () => {
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
            showView('lobby');
            resetLocalState();
        }, 3000);
    });

    // ── Board cell clicks ─────────────────────────────────────────────
    cells.forEach((cell) => {
        cell.addEventListener('click', () => {
            if (gameOver) return;
            if (currentTurn !== mySymbol) return;
            const idx = parseInt(cell.dataset.index, 10);
            if (cell.textContent !== '') return;
            socket.emit('makeMove', idx);
        });
    });

    // ── Rematch ───────────────────────────────────────────────────────
    $('#btnRematch').addEventListener('click', () => {
        socket.emit('restartGame');
    });

    // ── Render helpers ────────────────────────────────────────────────
    function renderGame(data) {
        gameOver = false;
        currentTurn = data.turn;
        renderBoard(data.board, null);
        updateScores(data.scores);
        updateTurnBadge();
        setPlayerNames(data.players);
    }

    function renderBoard(board, winLine) {
        cells.forEach((cell, i) => {
            const prev = cell.textContent;
            const val = board[i];
            cell.textContent = val || '';
            cell.className = 'cell';
            if (val === 'X') cell.classList.add('x-mark', 'taken');
            if (val === 'O') cell.classList.add('o-mark', 'taken');
            if (val && !prev) cell.classList.add('pop');
            if (winLine && winLine.includes(i)) cell.classList.add('win-cell');
        });
    }

    function updateScores(scores) {
        $('#scoreX').textContent = scores.X;
        $('#scoreO').textContent = scores.O;
        $('#scoreDraw').textContent = scores.draws;
    }

    function updateTurnBadge() {
        turnBadge.textContent = `${currentTurn}'s turn`;
        turnBadge.classList.toggle('o-turn', currentTurn === 'O');
    }

    function setPlayerNames(players) {
        const px = players.find(p => p.symbol === 'X');
        const po = players.find(p => p.symbol === 'O');
        if (px) $('#nameX').textContent = px.name;
        if (po) $('#nameO').textContent = po.name;
    }

    function showResult(winner) {
        if (winner === 'draw') {
            resultText.textContent = "It's a Draw!";
            resultText.style.color = 'var(--text-primary)';
        } else if (winner === mySymbol) {
            resultText.textContent = '🎉 You Win!';
            resultText.style.color = 'var(--accent-green)';
        } else {
            resultText.textContent = 'You Lose 😢';
            resultText.style.color = 'var(--accent-o)';
        }
        resultOverlay.classList.remove('hidden');
    }

    function resetLocalState() {
        mySymbol = null;
        currentTurn = 'X';
        gameOver = false;
        roomCode = '';
        cells.forEach(c => { c.textContent = ''; c.className = 'cell'; });
    }
})();
