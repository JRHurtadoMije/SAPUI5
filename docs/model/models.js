sap.ui.define([
  "sap/ui/model/json/JSONModel",
  "sap/ui/Device"
], function (JSONModel, Device) {
  "use strict";

  return {
    createDeviceModel: function () {
      var oModel = new JSONModel(Device);
      oModel.setDefaultBindingMode("OneWay");
      return oModel;
    },

    createViewModel: function () {
      return new JSONModel({
        busy: false, // lo pongo a true en onInit de la vista
        filters: {
          category: "Todas",
          minPrice: "",
          dateFrom: null,
          dateTo: null
        },
        sort: { by: "date", desc: true },
        groupBy: "",
        kpis: { totalSales: 0, totalQty: 0, avgTicket: 0 }
      });
    },
    createRootModel: function () {
      return new JSONModel({});
    }
  };
});