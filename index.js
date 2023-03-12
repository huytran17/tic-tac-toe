class Game {
  constructor(board) {
    this.board = board;
  }

  isMovesLeft() {
    for (let i = 0; i < SIZE; i++)
      for (let j = 0; j < SIZE; j++) if (this.board[i][j] == EMPTY) return true;

    return false;
  }

  evaluate() {
    // Checking for Rows for X or O victory.
    for (let row = 0; row < SIZE; row++) {
      const row_checkmate_value = this.getCheckmateValue(this.board[row]);
      if (row_checkmate_value) {
        return row_checkmate_value;
      }
    }

    // Checking for Columns for X or O victory.
    for (let row = 0; row < SIZE; row++) {
      const col_data = [];
      for (let col = 0; col < SIZE; col++) {
        col_data.push(this.board[row][col]);
      }

      const col_checkmate_value = this.getCheckmateValue(col_data);
      if (col_checkmate_value) {
        return col_checkmate_value;
      }
    }

    // Checking for Diagonals for X or O victory.
    const principal_data = [];
    const secondary_data = [];

    for (let row = 0; row < SIZE; row++) {
      principal_data.push(this.board[row][row]);
      secondary_data.push(this.board[row][SIZE - row - 1]);
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
    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (this.board[i][j] === EMPTY) {
          this.board[i][j] = type;
          callback();
          this.board[i][j] = EMPTY;
        }
      }
    }
  }

  findBestMove() {
    let best_value = Number.NEGATIVE_INFINITY;
    const best_move = { row: -1, col: -1 };

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (this.board[i][j] == EMPTY) {
          this.board[i][j] = PLAYER;

          let move_value = this.minimax(false);

          this.board[i][j] = EMPTY;

          if (move_value > best_value) {
            best_move.row = i;
            best_move.col = j;
            best_value = move_value;
          }
        }
      }
    }

    document.write(
      "The value of the best Move " + "is : ",
      best_value + "<br><br>"
    );

    return best_move;
  }
}

const board = [
  ["x", "o", "x"],
  ["o", "o", "_"],
  ["_", "_", "x"],
];

const game = new Game(board);
const best_move = game.findBestMove();

document.write("The Optimal Move is :<br>");
document.write("ROW: " + best_move.row + " COL: " + best_move.col + "<br>");
