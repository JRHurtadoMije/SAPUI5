
sap.ui.define([], function () {
  "use strict";

  /**
   * Crea el estado inicial del juego.
   * @returns {Object} Estado inicial del tablero.
   */
  function crearEstadoInicial() {
    return {
      tablero: [["", "", ""], ["", "", ""], ["", "", ""]],
      jugadorActual: "X",
      ganador: "",
      juegoTerminado: false,
      lineaVictoria: [],
      marcador: { X: 0, O: 0, Empate: 0}
    };
  }

  /**
   * Clona un objeto para mantener inmutabilidad.
   */
  function clonar(objeto) { 
    return JSON.parse(JSON.stringify(objeto));
   }

  /**
   * Devuelve la línea ganadora (si existe) del tablero.
   * @param {Array} tablero - El tablero actual.
   * @returns {Array} Línea ganadora o vacío[].
   */
  function ObtenerLineaVictoria(tablero) {
    const lineas = [
      // filas
      [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
      // columnas
      [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
      // diagonales
      [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]]
    ];
    for (let i=0;i<lineas.length;i++) {
      const a = lineas[i][0], b = lineas[i][1], c = lineas[i][2];
      const v1 = tablero[a[0]][a[1]], v2 = tablero[b[0]][b[1]], v3 = tablero[c[0]][c[1]];
      if (v1 && v1 === v2 && v1 === v3) return lineas[i];
    }
    return [];
  }

  /**
   * Determina si hay empate en el tablero.
   * @param {Array} tablero - El tablero actual.
   * @returns {boolean} True si hay empate, false si queda algún hueco.
   */
  function esEmpate(tablero) {
    for (let r=0;r<3;r++) 
      for (let c=0;c<3;c++) {
      if (!tablero[r][c]) return false;
    }
    return true;
  }

  /**
   * Devuelve un nuevo estado  tras jugar en (fila, columna).
   * Mantiene inmutabilidad. Calcula ganador, linea ganadora y fin del juego.
   * @param {Object} estado - Estado actual del juego.
   * @param {number}  fila.
   * @param {number} columna.
   * @returns {Object} Nuevo estado del juego.
   */
  function jugarMovimiento(estado, fila, columna) {
    if (estado.juegoTerminado || estado.tablero[fila][columna]) return estado;
    const siguiente = clonar(estado);
    siguiente.tablero[fila][columna] = siguiente.jugadorActual;

    const victoria = ObtenerLineaVictoria(siguiente.tablero);
    if (victoria.length) {
      siguiente.ganador   = "¡Jugador " + siguiente.jugadorActual + " gana!";
      siguiente.juegoTerminado = true;
      siguiente.lineaVictoria  = victoria;
      return siguiente;
    }
    if (esEmpate(siguiente.tablero)) {
      siguiente.ganador   = "¡Empate!";
      siguiente.juegoTerminado = true;
      siguiente.lineaVictoria  = [];
      return siguiente;
    }
    siguiente.jugadorActual = siguiente.jugadorActual === "X" ? "O" : "X";
    return siguiente;
  }

  return {
    crearEstadoInicial: crearEstadoInicial,
    jugarMovimiento: jugarMovimiento,
    ObtenerLineaVictoria: ObtenerLineaVictoria,
    esEmpate: esEmpate
  };
});