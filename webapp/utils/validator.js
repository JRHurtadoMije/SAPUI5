sap.ui.define([], function () {
  "use strict";
  const empty = v => v === "" || v === null || v === undefined;

  return {
    minPrice: function (v) {
      if (empty(v)) return { valid: true };
      const n = Number(v);
      if (isNaN(n)) return { valid: false, message: "El importe mínimo debe ser numérico" };
      if (n < 0)   return { valid: false, message: "El importe mínimo no puede ser negativo" };
      return { valid: true };
    },
    price: function (v) {
      const n = Number(v);
      if (isNaN(n)) return { valid: false, message: "Valor numérico inválido" };
      if (n < 0)   return { valid: false, message: "No puede ser negativo" };
      return { valid: true };
    }
  };
});