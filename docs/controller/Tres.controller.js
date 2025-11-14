sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/routing/History",
  "com/jr/jrhub/utils/juego"
], function(Controller, JSONModel, History, Juego) {
  "use strict";

  return Controller.extend("com.jr.jrhub.controller.Tres", {

    /* ──────────────────────────────────────────────────────────────────────
     * LIFECYCLE
     * ────────────────────────────────────────────────────────────────────── */

    onInit: function() {
      this.marcador = { X: 0, O: 0, Empate: 0};
      this._iniciarJuego();
    },

    onExit: function() {
      if (this._oDialog) {
        this._oDialog.destroy();
        this._oDialog = null;
      }
    },

    
    _iniciarJuego: function() {
      // Estado inicial desde el módulo
      const estadoInicial = Juego.crearEstadoInicial();
      const oModel = new JSONModel(estadoInicial);
      this.getView().setModel(oModel);

      // Limpieza visual
      this._limpiarEstilosBotones();

      // Cerrar diálogo si estuviera abierto
      const oDialog = this.byId("gameOverDialog");
      if (oDialog && oDialog.isOpen()) {
        oDialog.close();
      }
    },

    alPulsarCelda: function(oEvent) {
      const oModel = this.getView().getModel();
      const estado = oModel.getData();
      
      // Guard: juego terminado
      if (estado.juegoTerminado) return;
      
      const oButton = oEvent.getSource();
      const [fila, columna] = this._obtenerCoordenadasCeldas(oButton);
      
      // Guard: celda ocupada
      if (estado.tablero[fila][columna] !== "") return;
      
      // Ejecutar jugada
      const nuevoEstado = Juego.jugarMovimiento(estado, fila, columna);
      oModel.setData(nuevoEstado);
      
      // UI feedback
      this._applicarClaseXO(oButton, nuevoEstado.tablero[fila][columna]);
      
      // Game over
      if (nuevoEstado.juegoTerminado) {
        this._gestionarFinDeJuego(nuevoEstado);
      }
    },

    onReset: function() {
      this._iniciarJuego();
    },

    /* ──────────────────────────────────────────────────────────────────────
     * NAVIGATION
     * ────────────────────────────────────────────────────────────────────── */

    onNavBack: function() {
      const oPrevHash = History.getInstance().getPreviousHash();
      if (oPrevHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getOwnerComponent().getRouter().navTo("App", {}, true);
      }
    },

    /* ──────────────────────────────────────────────────────────────────────
     * GAME OVER HANDLING
     * ────────────────────────────────────────────────────────────────────── */

    _gestionarFinDeJuego: function(estado) {
      // Highlight ganador
      if (estado.lineaVictoria && estado.lineaVictoria.length) {
        this._resaltarLineaVictoria(estado.lineaVictoria);
      }
      
      // Mostrar resultado
      this._mostrarDialogoFinJuego(estado.ganador);
      // Actualizar marcador
      if (estado.ganador.indexOf("X") !== -1) {
        this.marcador.X ++;
      } else if (estado.ganador.indexOf("O") !== -1) {
        this.marcador.O ++;
      } else if (estado.ganador.indexOf("Empate") !== -1) {
        this.marcador.Empate ++;
      }

      const oModel = this.getView().getModel();
      oModel.setProperty("/marcador", this.marcador);

      // Vibración en móvil
      if (navigator && navigator.vibrate) {
        const duration = estado.lineaVictoria && estado.lineaVictoria.length ? 80 : 40;
        navigator.vibrate(duration);
      }
    },

    _mostrarDialogoFinJuego: function(mensaje) {
      const oDialog = this.byId("gameOverDialog");
      const oText = this.byId("modalText");
      
      if (oText) {
        oText.setText(mensaje);
      }
      
      if (oDialog) {
        oDialog.open();
      }
    },

    /* ──────────────────────────────────────────────────────────────────────
     * UI HELPERS
     * ────────────────────────────────────────────────────────────────────── */

    _obtenerCoordenadasCeldas: function(oButton) {
      const sIndex = oButton.getCustomData()[0].getValue(); 
      return sIndex.split(",").map(n => parseInt(n, 10));
    },

    _applicarClaseXO: function(oButton, valor) {
      if (!oButton || !valor) return;
      
      oButton.removeStyleClass("markedX markedO");
      
      const clases = { "X": "markedX", "O": "markedO" };
      if (clases[valor]) {
        oButton.addStyleClass(clases[valor]);
      }
    },

    _resaltarLineaVictoria: function(lineaVictoria) {
      if (!lineaVictoria || !lineaVictoria.length) return;
      
      lineaVictoria.forEach(([fila, columna]) => {
        const oBtn = this.byId(this._convertirIdxABotonId(fila, columna));
        if (oBtn) {
          oBtn.addStyleClass("ttt-win");
        }
      });
    },

    _limpiarEstilosBotones: function() {
      const nombres = ["one","two","three","four","five","six","seven","eight","nine"];
      
      nombres.forEach(nombre => {
        const oBtn = this.byId("square_" + nombre);
        if (oBtn) {
          oBtn.removeStyleClass("markedX markedO ttt-win");
        }
      });
    },

    _convertirIdxABotonId: function(fila, columna) {
      const nombres = ["one","two","three","four","five","six","seven","eight","nine"];
      const idx = fila * 3 + columna;
      
      if (idx < 0 || idx >= nombres.length) {
        alert("Invalid cell index:", fila, columna);
        return null;
      }
      
      return "square_" + nombres[idx];
    }

  });
});