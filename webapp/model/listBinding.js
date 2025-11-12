sap.ui.define([
  "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter",
  "com/jr/jrhub/model/constants"
], function (Filter, FilterOperator, Sorter, C) {
  "use strict";

  function mapField(uiKey) { return C.fieldMap[uiKey] || uiKey; }

  // Normaliza fechas: acepta 'YYYY-MM-DD' o 'YYYY-MM' y devuelve 'YYYY-MM'
  function normalizeToMonth(s) {
    if (!s) { return s; }
    return String(s).slice(0, 7);
  }

  return {
    buildFilters: function (f) {
      const a = [];

      if (f.category && f.category !== "Todas") {
        a.push(new Filter("category", FilterOperator.EQ, f.category));
      }
      // Importe mínimo en tu JSON es 'sales'
      if (f.minPrice !== "" && !isNaN(f.minPrice)) {
        a.push(new Filter("sales", FilterOperator.GE, parseFloat(f.minPrice)));
      }

      // Filtrado por mes (cadena 'YYYY-MM'); normalizamos entradas del DatePicker
      if (f.dateFrom) {
        a.push(new Filter("month", FilterOperator.GE, normalizeToMonth(f.dateFrom)));
      }
      if (f.dateTo) {
        a.push(new Filter("month", FilterOperator.LE, normalizeToMonth(f.dateTo)));
      }
      return a;
    },

    buildSorters: function (sort, groupBy) {
      const sorters = [ new Sorter(mapField(sort.by), !!sort.desc) ];
      if (groupBy) {
        sorters.unshift(new Sorter(groupBy, false, function (ctx) {
          const key = ctx.getProperty(groupBy);
          return { key, text: "Categoría: " + key };
        }));
      }
      return sorters;
    }
  };
});