sap.ui.define([], function () {
  "use strict";
  return {
    // Mapa de claves UI -> campos reales del JSON (dataset)
    fieldMap: {
      date: "month",     // "Fecha" en UI = month en tu JSON
      product: "name",   // "Producto" = name
      price: "sales",    // "Precio/Importe" = sales (importe total de la línea)
      category: "category"
    },
    currencyCode: "EUR"
  };
});