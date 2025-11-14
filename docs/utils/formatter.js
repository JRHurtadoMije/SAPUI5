sap.ui.define([
  "com/jr/jrhub/utils/constants"
], function (C) {
  "use strict";
  const toNumber = v => isNaN(parseFloat(v)) ? 0 : parseFloat(v);
  const nf = (code) => new Intl.NumberFormat("es-ES", { style: "currency", currency: code || C.currencyCode, maximumFractionDigits: 2 });

  return {
    // Formatea cualquier valor a moneda
    currency: function (value, code) {
      return nf(code).format(toNumber(value));
    },

    // Calcula precio unitario (importe / unidades) y lo devuelve formateado como moneda
    unitPriceCurrency: function (amount, qty, code) {
      const a = toNumber(amount), q = toNumber(qty);
      const unit = q ? (a / q) : 0;
      return nf(code).format(unit);
    }
  };
});