sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/message/Message",
  "sap/ui/core/message/MessageManager",
  "sap/ui/core/library",
  "com/jr/jrhub/utils/formatter",
  "com/jr/jrhub/utils/validator",
  "com/jr/jrhub/utils/calculations",
  "com/jr/jrhub/utils/listBinding"
], function (
  Controller, MessageToast, Message, MessageManager, coreLibrary,
  formatter, validator, calculations, listBinding
) {
  "use strict";

  const MessageType = coreLibrary.MessageType;

  return Controller.extend("com.jr.jrhub.controller.Logica", {

    formatter: formatter, // expone formatters a la vista como ".formatter.*"

    onInit: function () {
      this._comp = this.getOwnerComponent();
      this._sales = this._comp.getModel("sales");
      this._view  = this._comp.getModel("view");

      // MessageManager
      this._msg = sap.ui.getCore().getMessageManager();
      this.getView().setModel(this._msg.getMessageModel(), "message");
      this._msg.registerObject(this.getView(), true);

      // Busy hasta tener datos o fallo
      this._view.setProperty("/busy", true);

      const data = this._sales?.getData && this._sales.getData();
      const hasData = data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
      if (hasData) {
        this._onDataLoaded();
      } else {
        this._sales.attachRequestCompleted(this._onDataLoaded, this);
        this._sales.attachRequestFailed(this._onDataFailed, this);
      }
    },

    onExit: function () {
      this._msg.unregisterObject(this.getView());
    },

    _onDataLoaded: function () {
      this._view.setProperty("/busy", false);
      this._rebindTable();
      this._updateKpis();
    },

    _onDataFailed: function () {
      this._view.setProperty("/busy", false);
      MessageToast.show("No se pudo cargar sales.json");
    },

    // === Navegación ===
    onNavBack: function () {
      const History = sap.ui.core.routing.History;
      const sPrev = History.getInstance().getPreviousHash();
      if (sPrev !== undefined) window.history.go(-1);
      else this._comp.getRouter()?.navTo?.("App", {}, true);
    },

    // === Eventos UI ===
    onFilterChanged: function () {
      this._validateMinPrice();
      this._rebindTable();
      this._updateKpis();
    },

    onMinPriceLiveChange: function (oEvent) {
      const sValue = oEvent.getParameter("value");
      this._validateMinPrice(sValue);
    },

    onSortChanged: function () {
      this._rebindTable();
    },

    onSortDirChanged: function (oEvent) {
      const key = oEvent.getParameter("item").getKey(); // 'asc' | 'desc'
      this._view.setProperty("/sort/desc", key === "desc");
      this._rebindTable();
    },

    onToggleGroup: function () {
      const current = this._view.getProperty("/groupBy");
      this._view.setProperty("/groupBy", current ? "" : "category"); // agrupamos por categoría
      this._rebindTable();
    },

    // === Binding de la tabla ===
    _rebindTable: function () {
      const b = this.byId("tblSales").getBinding("items");
      if (!b) return;

      const f = listBinding.buildFilters(this._view.getProperty("/filters"));
      const s = listBinding.buildSorters(this._view.getProperty("/sort"), this._view.getProperty("/groupBy"));

      b.filter(f);
      b.sort(s);
    },

    // === KPIs ===
    _updateKpis: function () {
      const b = this.byId("tblSales").getBinding("items");
      const rows = (b?.getCurrentContexts() || []).map(c => c.getObject());
      const t = calculations.computeTotals(rows);
      this._view.setProperty("/kpis/totalSales", t.totalSales);
      this._view.setProperty("/kpis/totalQty",   t.totalQty);
      this._view.setProperty("/kpis/avgTicket",  t.avgTicket);
    },

    // === Validación & Mensajes ===
    _validateMinPrice: function (val) {
      const path = "/filters/minPrice";
      const v = (val !== undefined) ? val : this._view.getProperty(path);

      // limpia mensajes previos dirigidos a este target
      (this._msg.getMessageModel().getData() || []).forEach(m => {
        if (m.getTarget && m.getTarget() === "view>" + path) {
          this._msg.removeMessages(m);
        }
      });

      const res = validator.minPrice(v);
      if (!res.valid) {
        this._msg.addMessages(new Message({
          message: res.message,
          type: MessageType.Error,
          target: "view>" + path,
          processor: this._view
        }));
      }
      return res.valid;
    },

    // === Guardado simulado ===
    onSave: async function () {
      try {
        this._view.setProperty("/busy", true);
        await new Promise((resolve, reject) => {
          setTimeout(() => this._validateMinPrice() ? resolve() : reject(new Error("Revisa los errores de validación")), 600);
        });
        MessageToast.show("Cambios guardados");
      } catch (e) {
        MessageToast.show(e?.message || "Error guardando");
      } finally {
        this._view.setProperty("/busy", false);
      }
    }
  });
});