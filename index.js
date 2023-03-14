class Move {
  constructor() {
    this.row = -1;
    this.col = -1;
  }
}

class Game {
  constructor(matrix, move) {
    this.matrix = matrix;
    this.move = move;
  }

  isMovesLeft() {
    for (let i = 0; i < MATRIX_SIZE; i++)
      for (let j = 0; j < MATRIX_SIZE; j++)
        if (this.matrix[i][j] == EMPTY) return true;

    return false;
  }

  evaluate() {
    // Checking for Rows for X or O victory.
    for (let row = 0; row < MATRIX_SIZE; row++) {
      const row_checkmate_value = this.getCheckmateValue(this.matrix[row]);
      if (row_checkmate_value) {
        return row_checkmate_value;
      }
    }

    // Checking for Columns for X or O victory.
    for (let col = 0; col < MATRIX_SIZE; col++) {
      const col_data = [];
      for (let row = 0; row < MATRIX_SIZE; row++) {
        col_data.push(this.matrix[row][col]);
      }

      const col_checkmate_value = this.getCheckmateValue(col_data);
      if (col_checkmate_value) {
        return col_checkmate_value;
      }
    }

    // Checking for Diagonals for X or O victory.
    const principal_data = [];
    const secondary_data = [];

    for (let row = 0; row < MATRIX_SIZE; row++) {
      principal_data.push(this.matrix[row][row]);
      secondary_data.push(this.matrix[row][MATRIX_SIZE - row - 1]);
    }

    const principal_checkmate_value = this.getCheckmateValue(principal_data);
    if (principal_checkmate_value) {
      return principal_checkmate_value;
    }

    const secondary_checkmate_value = this.getCheckmateValue(secondary_data);
    if (secondary_checkmate_value) {
      return secondary_checkmate_value;
    }

    return DRAW_VALUE;
  }

  getCheckmateValue(array) {
    const all_equal = [...new Set(array)].length === UNIQUE_SET_LENGTH;

    const player_checkmate = all_equal && array[FIRST_INDEX] === PLAYER;
    if (player_checkmate) return PLAYER_VALUE;

    const bot_checkmate = all_equal && array[FIRST_INDEX] === BOT;
    if (bot_checkmate) return BOT_VALUE;

    return DRAW_VALUE;
  }

  minimax(is_player_turn) {
    const score = this.evaluate();

    const got_best_value = score === PLAYER_VALUE || score === BOT_VALUE;

    if (got_best_value) return score;

    if (!this.isMovesLeft()) return DRAW_VALUE;

    if (is_player_turn) {
      return this.findBestValueForPlayer(is_player_turn);
    }

    return this.findBestValueForBot(is_player_turn);
  }

  findBestValueForPlayer(is_player_turn) {
    let best_value = Number.NEGATIVE_INFINITY;

    this.findBestValue(
      PLAYER,
      () => (best_value = Math.max(best_value, this.minimax(!is_player_turn)))
    );

    return best_value;
  }

  findBestValueForBot(is_player_turn) {
    let best_value = Number.POSITIVE_INFINITY;

    this.findBestValue(
      BOT,
      () => (best_value = Math.min(best_value, this.minimax(!is_player_turn)))
    );

    return best_value;
  }

  findBestValue(type, callback) {
    for (let i = 0; i < MATRIX_SIZE; i++) {
      for (let j = 0; j < MATRIX_SIZE; j++) {
        if (this.matrix[i][j] === EMPTY) {
          this.matrix[i][j] = type;
          callback();
          this.matrix[i][j] = EMPTY;
        }
      }
    }
  }

  findBestMove() {
    let best_value = Number.POSITIVE_INFINITY;

    for (let i = 0; i < MATRIX_SIZE; i++) {
      for (let j = 0; j < MATRIX_SIZE; j++) {
        if (this.matrix[i][j] === EMPTY) {
          this.matrix[i][j] = BOT;
          const move_value = this.minimax(true);
          this.matrix[i][j] = EMPTY;

          if (move_value < best_value) {
            best_value = move_value;
            this.move.row = i;
            this.move.col = j;
          }
        }
      }
    }
  }
}

class Board {
  constructor(game) {
    this.game = game;
    this.width = BOARD_SIZE;
    this.height = BOARD_SIZE;
    this.background_color = BOARD_BG_COLOR;
    this.canvas = undefined;
    this.ctx = undefined;
    this.cell_size = 10;

    this.init();
  }

  init() {
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.backgroundColor = this.background_color;
    this.canvas.addEventListener("mousedown", (event) => {
      this.playerClick(event);
    });

    this.cell_size = this.width / MATRIX_SIZE;

    this.draw();
  }

  playerClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const col_coord = event.clientX - rect.left;
    const row_coord = event.clientY - rect.top;

    const col = Math.floor(col_coord / this.cell_size);
    const row = Math.floor(row_coord / this.cell_size);

    const is_empty_cell = this.game.matrix[row][col] === EMPTY;
    if (!is_empty_cell) {
      return;
    }

    this.game.matrix[row][col] = PLAYER;
    this.draw();
    const player_score = this.game.evaluate();
    if (player_score === PLAYER_VALUE) {
      return alert("player win");
    }

    setTimeout(() => {
      this.game.findBestMove();
      const invalid_coords = this.game.move.row < 0 || this.game.move.col < 0;
      if (invalid_coords) return;

      this.game.matrix[this.game.move.row][this.game.move.col] = BOT;
      this.draw();
      const bot_score = this.game.evaluate();
      if (bot_score === BOT_VALUE) {
        return alert("bot win");
      }
    }, 1000);
  }

  drawRows() {
    for (let i = 1; i <= MATRIX_SIZE - 1; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cell_size);
      this.ctx.lineTo(this.width, i * this.cell_size);
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.stroke();
    }
  }

  drawColumns() {
    for (let i = 1; i <= MATRIX_SIZE - 1; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cell_size, 0);
      this.ctx.lineTo(i * this.cell_size, this.height);
      this.ctx.strokeStyle = "#ffffff";
      this.ctx.stroke();
    }
  }

  drawText() {
    for (let i = 0; i < MATRIX_SIZE; i++) {
      for (let j = 0; j < MATRIX_SIZE; j++) {
        if (this.game.matrix[i][j] === EMPTY) continue;

        const x = j * this.cell_size + this.cell_size / 2;
        const y = i * this.cell_size + this.cell_size / 2 + 12;

        this.ctx.font = `${BOARD_TEXT_SIZE}px Arial`;
        this.ctx.fillStyle = BOARD_TEXT_COLOR;
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.game.matrix[i][j], x, y);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawRows();
    this.drawColumns();
    this.drawText();
  }
}

// const range = new Array(MATRIX_SIZE).fill();
// const matrix = range.map(() => new Array(MATRIX_SIZE).fill("_"));

const matrix = [
  ["_", "_", "_"],
  ["_", "_", "_"],
  ["_", "_", "_"],
];

const move = new Move();
const game = new Game(matrix, move);

const board = new Board(game);
