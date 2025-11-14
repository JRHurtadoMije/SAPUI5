
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/core/routing/History"
], function (Controller, JSONModel, MessageToast, History) {
  "use strict";

  return Controller.extend("com.jr.jrhub.controller.Intermedio", {
    onInit: function () {
      // carga de datos desde models/products.json
      const oModel = new sap.ui.model.json.JSONModel();
      oModel.loadData(sap.ui.require.toUrl("com/jr/jrhub/model/products.json"));
      this.getView().setModel(oModel);
    },

    onSelectItem: function (oEvent) {
      const oItem = oEvent.getParameter("listItem");
      if (!oItem) { return; }
      const sName = oItem.getTitle();
      const sCategory = oItem.getDescription();
      MessageToast.show("Seleccionaste: " + sName + " (" + sCategory + ")");
    },

    onNavBack: function () {
      const oHistory = History.getInstance();
      const sPreviousHash = oHistory.getPreviousHash();
      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        // Si no hay historial, redirige a una ruta segura (ajústala a tu app)
        const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        if (oRouter) {
          oRouter.navTo("Basico", {}, true);
        }
      }
    }
  });
});
