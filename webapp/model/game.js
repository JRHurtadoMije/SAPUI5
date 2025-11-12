// webapp/model/game.js
sap.ui.define([], function () {
  "use strict";

  function createInitialState() {
    return {
      board: [["", "", ""], ["", "", ""], ["", "", ""]],
      currentPlayer: "X",
      winner: "",
      gameOver: false,
      winLine: [] // [[r,c],[r,c],[r,c]] si hay victoria
    };
  }

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function getWinLine(board) {
    var lines = [
      // filas
      [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
      // columnas
      [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
      // diagonales
      [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]]
    ];
    for (var i=0;i<lines.length;i++) {
      var a = lines[i][0], b = lines[i][1], c = lines[i][2];
      var v1 = board[a[0]][a[1]], v2 = board[b[0]][b[1]], v3 = board[c[0]][c[1]];
      if (v1 && v1 === v2 && v1 === v3) return lines[i];
    }
    return [];
  }

  function isTie(board) {
    for (var r=0;r<3;r++) for (var c=0;c<3;c++) {
      if (!board[r][c]) return false;
    }
    return true;
  }

  /**
   * Devuelve un NUEVO estado tras jugar (r,c)
   * - Mantiene inmutabilidad (no muta el argumento)
   * - Calcula winner/winLine/gameOver
   */
  function playMove(state, r, c) {
    if (state.gameOver || state.board[r][c]) return state;
    var next = clone(state);
    next.board[r][c] = next.currentPlayer;

    var win = getWinLine(next.board);
    if (win.length) {
      next.winner   = "¡Jugador " + next.currentPlayer + " gana!";
      next.gameOver = true;
      next.winLine  = win;
      return next;
    }
    if (isTie(next.board)) {
      next.winner   = "¡Empate!";
      next.gameOver = true;
      next.winLine  = [];
      return next;
    }
    next.currentPlayer = next.currentPlayer === "X" ? "O" : "X";
    return next;
  }

  return {
    createInitialState: createInitialState,
    playMove: playMove,
    getWinLine: getWinLine,
    isTie: isTie
  };
});