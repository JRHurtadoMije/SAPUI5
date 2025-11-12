// webapp/controller/Tres.controller.js
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "com/jr/jrhub/model/game" // << añadimos el módulo puro
], function(Controller, JSONModel, Game) {
  "use strict";

  return Controller.extend("com.jr.jrhub.controller.Tres", {
    onInit: function() {
      this._initGame();
    },

    _initGame: function() {
      // Estado inicial desde el módulo (añadimos gameOver/winLine de paso)
      var initial = Game.createInitialState();
      var oModel = new JSONModel(initial);
      this.getView().setModel(oModel);

      // Limpieza visual por compatibilidad con tu vista actual
      this._clearButtonsUI();

      // Cerrar diálogo si estuviera abierto
      var oDialog = this.byId("gameOverDialog");
      if (oDialog && oDialog.isOpen()) oDialog.close();
    },

    onCellPress: function(oEvent) {
      var oModel = this.getView().getModel();
      var state  = oModel.getData();
      if (state.gameOver) return;

      var oButton = oEvent.getSource();
      var sIndex  = oButton.getCustomData()[0].getValue(); // "row,col"
      var parts   = sIndex.split(",");
      var row     = parseInt(parts[0], 10);
      var col     = parseInt(parts[1], 10);

      if (state.board[row][col] !== "") return; // movimiento ilegal

      // >>> Delegamos la jugada al módulo (inmutable)
      var next = Game.playMove(state, row, col);
      oModel.setData(next); // binding actualiza los textos de las celdas

      // (Compatibilidad) si aún no bindeas clases X/O en XML, lo marcamos aquí:
      this._applyXOClass(oButton, next.board[row][col]);

      if (next.gameOver) {
        // Resaltado visual de la línea ganadora (si existe)
        if (next.winLine && next.winLine.length) {
          this._highlightWinLine(next.winLine);
        }
        this._showGameOverDialog(next.winner);

        // Vibración sutil en móvil (no bloquea)
        if (navigator && navigator.vibrate) {
          navigator.vibrate(next.winLine && next.winLine.length ? 80 : 40);
        }
      } else {
        // Si no ha terminado, no hacemos nada más: el módulo ya alternó el jugador
      }
    },

    // === Mantengo estos métodos con el mismo nombre ===

    _checkWin: function(board) {
      // Para respetar tu API, devolvemos boolean usando el módulo
      return Game.getWinLine(board).length > 0;
    },

    _checkTie: function(board) {
      return Game.isTie(board);
    },

    _showGameOverDialog: function(message) {
      var oDialog = this.byId("gameOverDialog");
      var oText   = this.byId("modalText");
      if (oText)   { oText.setText(message); }
      if (oDialog) { oDialog.open(); }
    },

    onReset: function() {
      // Reutilizamos _initGame para respetar tu flujo original
      this._initGame();
    },

    // ==== Helpers visuales (compatibles con tu vista actual) ====

    _applyXOClass: function(oBtn, val) {
      // Si estás bindeando el 'text' en la vista, no hace falta setText aquí.
      // Mantengo la clase para animación 'pop' y color X/O si la usas.
      if (!oBtn) return;
      oBtn.removeStyleClass("markedX");
      oBtn.removeStyleClass("markedO");
      if (val === "X") oBtn.addStyleClass("markedX");
      if (val === "O") oBtn.addStyleClass("markedO");
    },

    _idxToButtonId: function(r, c) {
      var names = ["one","two","three","four","five","six","seven","eight","nine"];
      return "square_" + names[r * 3 + c];
    },

    _highlightWinLine: function(winLine) {
      for (var i=0; i<winLine.length; i++) {
        var r = winLine[i][0], c = winLine[i][1];
        var oBtn = this.byId(this._idxToButtonId(r,c));
        if (oBtn) oBtn.addStyleClass("ttt-win");
      }
    },

    _clearButtonsUI: function() {
      // Limpia textos y clases (solo necesario mientras no bindees todo en XML)
      for (var r=0; r<3; r++) {
        for (var c=0; c<3; c++) {
          var oBtn = this.byId(this._idxToButtonId(r, c));
          if (oBtn) {
            
            oBtn.removeStyleClass("markedX");
            oBtn.removeStyleClass("markedO");
            oBtn.removeStyleClass("ttt-win");
          }
        }
      }
    },
    onNavBack: function () {
      const History = sap.ui.core.routing.History;
      const sPrev = History.getInstance().getPreviousHash();
      if (sPrev !== undefined) window.history.go(-1);
      else this._comp.getRouter()?.navTo?.("App", {}, true);
    },
  });
});