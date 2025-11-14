sap.ui.define([], function () {
  "use strict";
  const num = v => isNaN(parseFloat(v)) ? 0 : parseFloat(v);

  return {
    computeTotals: function (rows) {
      const totalSales = rows.reduce((acc, r) => acc + num(r.sales), 0);
      const totalQty   = rows.reduce((acc, r) => acc + num(r.qty), 0);
      const avgTicket  = rows.length ? totalSales / rows.length : 0;
      return { totalSales, totalQty, avgTicket };
    }
  };
});