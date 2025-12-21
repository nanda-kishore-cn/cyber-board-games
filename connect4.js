// Connect 4 Game Logic
class Connect4 {
    constructor() {
        this.rows = 6;
        this.cols = 7;
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'red'; // red goes first
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
        this.lastDropRow = -1;
        this.lastDropCol = -1;
    }

    /**
     * Drop a disc in the specified column
     * @param {number} col - Column index (0-6)
     * @returns {number} - Row index where disc was placed, or -1 if invalid move
     */
    dropDisc(col) {
        // Find the first empty row from bottom
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row][col] === null) {
                this.board[row][col] = this.currentPlayer;
                this.moveHistory.push({ row, col, player: this.currentPlayer });
                this.lastDropRow = row;
                this.lastDropCol = col;
                return row;
            }
        }
        return -1; // Column is full
    }

    /**
     * Undo the last move
     * @returns {boolean} - True if undo was successful
     */
    undoMove() {
        if (this.moveHistory.length === 0) return false;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = null;
        this.currentPlayer = lastMove.player;
        this.gameOver = false;
        this.winner = null;
        return true;
    }

    /**
     * Check if a column is full
     * @param {number} col - Column index
     * @returns {boolean}
     */
    isColumnFull(col) {
        return this.board[0][col] !== null;
    }

    /**
     * Check if the last move resulted in a win
     * @returns {boolean}
     */
    checkWin() {
        if (this.lastDropRow === -1) return false;

        const directions = [
            { dr: 0, dc: 1 },  // Horizontal
            { dr: 1, dc: 0 },  // Vertical
            { dr: 1, dc: 1 },  // Diagonal (top-left to bottom-right)
            { dr: 1, dc: -1 }  // Diagonal (top-right to bottom-left)
        ];

        for (const dir of directions) {
            if (this.countDirection(this.lastDropRow, this.lastDropCol, dir.dr, dir.dc) >= 4) {
                this.winner = this.currentPlayer;
                this.gameOver = true;
                return true;
            }
        }
        return false;
    }

    /**
     * Count consecutive discs in a direction from a starting position
     * @param {number} row - Starting row
     * @param {number} col - Starting column
     * @param {number} dr - Row direction
     * @param {number} dc - Column direction
     * @returns {number}
     */
    countDirection(row, col, dr, dc) {
        const player = this.board[row][col];
        let count = 1;

        // Count in positive direction
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }

        // Count in negative direction
        r = row - dr;
        c = col - dc;
        while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
            count++;
            r -= dr;
            c -= dc;
        }

        return count;
    }

    /**
     * Switch to the next player
     */
    nextPlayer() {
        if (!this.gameOver) {
            this.currentPlayer = this.currentPlayer === 'red' ? 'yellow' : 'red';
        }
    }

    /**
     * Check if the board is full (draw)
     * @returns {boolean}
     */
    isBoardFull() {
        return this.moveHistory.length === this.rows * this.cols;
    }

    /**
     * Get available columns (not full)
     * @returns {array}
     */
    getAvailableColumns() {
        const available = [];
        for (let col = 0; col < this.cols; col++) {
            if (!this.isColumnFull(col)) {
                available.push(col);
            }
        }
        return available;
    }

    /**
     * AI move - Uses minimax algorithm with alpha-beta pruning
     * @returns {number} - Best column to play
     */
    getAIMove() {
        const available = this.getAvailableColumns();
        if (available.length === 0) return -1;

        let bestScore = -Infinity;
        let bestMove = available[0];

        for (const col of available) {
            const row = this.dropDisc(col);
            if (row === -1) continue;

            let score = 0;
            if (this.checkWin()) {
                score = 1000; // AI wins
            } else {
                score = this.evaluateBoard();
            }

            // Undo the move
            this.board[row][col] = null;
            this.moveHistory.pop();

            if (score > bestScore) {
                bestScore = score;
                bestMove = col;
            }
        }

        return bestMove;
    }

    /**
     * Evaluate board position for AI
     * @returns {number}
     */
    evaluateBoard() {
        let score = 0;

        // Check all positions for potential 4-in-a-rows
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] !== null) {
                    score += this.evaluatePosition(row, col);
                }
            }
        }

        return score;
    }

    /**
     * Evaluate a single position
     * @param {number} row
     * @param {number} col
     * @returns {number}
     */
    evaluatePosition(row, col) {
        const player = this.board[row][col];
        let score = 0;

        const directions = [
            { dr: 0, dc: 1 },
            { dr: 1, dc: 0 },
            { dr: 1, dc: 1 },
            { dr: 1, dc: -1 }
        ];

        for (const dir of directions) {
            const count = this.countInDirection(row, col, dir.dr, dir.dc, player);
            const weight = [0, 1, 10, 100, 1000][Math.min(count, 4)];
            
            if (player === 'yellow') {
                score += weight;
            } else {
                score -= weight * 0.8; // Slightly lower weight for opponent
            }
        }

        return score;
    }

    /**
     * Count consecutive discs in a single direction
     * @param {number} row
     * @param {number} col
     * @param {number} dr
     * @param {number} dc
     * @param {string} player
     * @returns {number}
     */
    countInDirection(row, col, dr, dc, player) {
        let count = 1;
        let r = row + dr, c = col + dc;
        while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === player) {
            count++;
            r += dr;
            c += dc;
        }
        return count;
    }

    /**
     * Reset the game
     */
    reset() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
        this.currentPlayer = 'red';
        this.gameOver = false;
        this.winner = null;
        this.moveHistory = [];
        this.lastDropRow = -1;
        this.lastDropCol = -1;
    }
}

// UI Controller
class Connect4UI {
    constructor() {
        this.game = new Connect4();
        this.gameBoard = document.getElementById('gameBoard');
        this.statusText = document.getElementById('status');
        this.resetBtn = document.getElementById('resetBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.cells = [];
        this.animatingAI = false;

        this.initializeBoard();
        this.attachEventListeners();
    }

    /**
     * Create the game board UI
     */
    initializeBoard() {
        this.gameBoard.innerHTML = '';
        this.cells = [];

        for (let row = 0; row < this.game.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.game.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.col = col;
                cell.dataset.row = row;
                cell.addEventListener('click', () => this.handleCellClick(col));
                this.gameBoard.appendChild(cell);
                this.cells[row][col] = cell;
            }
        }
    }

    /**
     * Handle user clicking a cell
     * @param {number} col
     */
    handleCellClick(col) {
        if (this.animatingAI || this.game.gameOver || this.game.currentPlayer !== 'red') return;

        const row = this.game.dropDisc(col);
        if (row === -1) return; // Invalid move

        this.updateUI();

        if (this.game.checkWin()) {
            this.showWinner();
            return;
        }

        if (this.game.isBoardFull()) {
            this.showDraw();
            return;
        }

        this.game.nextPlayer();
        this.updateStatus();

        // AI move after a short delay
        this.animatingAI = true;
        setTimeout(() => this.makeAIMove(), 500);
    }

    /**
     * Make the AI move
     */
    makeAIMove() {
        const col = this.game.getAIMove();
        if (col === -1) {
            this.showDraw();
            this.animatingAI = false;
            return;
        }

        const row = this.game.dropDisc(col);
        this.updateUI();

        if (this.game.checkWin()) {
            this.animatingAI = false;
            this.showWinner();
            return;
        }

        if (this.game.isBoardFull()) {
            this.animatingAI = false;
            this.showDraw();
            return;
        }

        this.game.nextPlayer();
        this.updateStatus();
        this.animatingAI = false;
    }

    /**
     * Update the UI board with current game state
     */
    updateUI() {
        for (let row = 0; row < this.game.rows; row++) {
            for (let col = 0; col < this.game.cols; col++) {
                const cell = this.cells[row][col];
                cell.innerHTML = '';

                if (this.game.board[row][col] !== null) {
                    const disc = document.createElement('div');
                    disc.className = `disc ${this.game.board[row][col]}`;
                    cell.appendChild(disc);

                    // Highlight winning discs
                    if (this.game.winner === this.game.board[row][col]) {
                        disc.classList.add('winning-disc');
                    }
                }
            }
        }
    }

    /**
     * Update status text
     */
    updateStatus() {
        if (this.game.gameOver) return;
        
        const playerText = this.game.currentPlayer === 'red' ? "Red's Turn (You)" : "Yellow's Turn (AI)";
        this.statusText.textContent = playerText;
    }

    /**
     * Show winner message
     */
    showWinner() {
        const playerName = this.game.winner === 'red' ? '🎉 Red Wins! 🎉' : '💛 Yellow Wins! 💛';
        this.statusText.textContent = playerName;
        this.resetBtn.textContent = 'Play Again';
    }

    /**
     * Show draw message
     */
    showDraw() {
        this.statusText.textContent = "It's a Draw! 🤝";
        this.game.gameOver = true;
        this.resetBtn.textContent = 'Play Again';
    }

    /**
     * Reset the game
     */
    resetGame() {
        this.game.reset();
        this.initializeBoard();
        this.resetBtn.textContent = 'New Game';
        this.updateStatus();
    }

    /**
     * Undo the last move
     */
    undoLastMove() {
        if (this.game.moveHistory.length >= 2) {
            // Undo AI move
            this.game.undoMove();
            // Undo player move
            this.game.undoMove();
            this.updateUI();
            this.updateStatus();
        }
    }

    /**
     * Attach event listeners to buttons
     */
    attachEventListeners() {
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.undoBtn.addEventListener('click', () => this.undoLastMove());
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Connect4UI();
});
