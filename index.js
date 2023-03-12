class Game {
  constructor(matrix) {
    this.matrix = matrix;
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
    for (let row = 0; row < MATRIX_SIZE; row++) {
      const col_data = [];
      for (let col = 0; col < MATRIX_SIZE; col++) {
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

    if (this.isMovesLeft() == false) return DRAW_VALUE;

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
      PLAYER,
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
    let best_value = Number.NEGATIVE_INFINITY;
    const best_move = { row: -1, col: -1 };

    for (let i = 0; i < MATRIX_SIZE; i++) {
      for (let j = 0; j < MATRIX_SIZE; j++) {
        if (this.matrix[i][j] == EMPTY) {
          this.matrix[i][j] = PLAYER;

          let move_value = this.minimax(false);

          this.matrix[i][j] = EMPTY;

          if (move_value > best_value) {
            best_move.row = i;
            best_move.col = j;
            best_value = move_value;
          }
        }
      }
    }

    return best_move;
  }
}

class Board {
  constructor() {
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

    this.cell_size = this.width / MATRIX_SIZE;
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

  draw() {
    this.drawRows();
    this.drawColumns();
  }

  update() {
    window.requestAnimationFrame(draw);
  }
}

const board = new Board();
board.draw();

const matrix = [
  ["x", "o", "x"],
  ["o", "o", "_"],
  ["_", "_", "x"],
];

const game = new Game(matrix);
const best_move = game.findBestMove();
