
sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/Label",
  "sap/m/Input",
  "sap/m/DatePicker",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/odata/v2/ODataModel"
], function (Controller, Dialog, Button, Label, Input, DatePicker, Select, Item, MessageToast, MessageBox, ODataModel) {
  "use strict";

  return Controller.extend("com.jr.jrhub.controller.Gastos", {

    // --- Utilidades ---
    _getDefaultCategorias: function () {
      return [
        { key: "",           text: "Todas" },
        { key: "Comida",     text: "Comida" },
        { key: "Transporte", text: "Transporte" },
        { key: "Ocio",       text: "Ocio" },
        { key: "Otros",      text: "Otros" }
      ];
    },

    _normalizeGastosData: function (oInput) {
      var oData = {};
      // Gastos
      if (Array.isArray(oInput)) {
        oData.Gastos = oInput;
      } else if (Array.isArray(oInput.Gastos)) {
        oData.Gastos = oInput.Gastos;
      } else {
        oData.Gastos = [];
      }
      // Categorías
      oData.categorias = Array.isArray(oInput.categorias)
        ? oInput.categorias
        : this._getDefaultCategorias();

      return oData;
    },

    // --- Carga desde mockdata JSON ---
    _loadFromJson: function () {
      const sUrl = sap.ui.require.toUrl("com/jr/jrhub") + "/localService/mockdata/Gastos.json";
      const oModel = this.oJSONModel;

      oModel.loadData(sUrl);
      oModel.attachRequestCompleted((oEvt) => {
        if (!oEvt.getParameter("success")) {
          MessageToast.show("Error al cargar Gastos.json");
          return;
        }

        const aOriginal =
          oModel.getProperty("/d/results") ||
          oModel.getProperty("/Gastos") ||
          [];

        const oNormalized = this._normalizeGastosData({ Gastos: aOriginal });

        oModel.setData(oNormalized);
        this.getView().setModel(oModel, "gastosLocal");
        localStorage.setItem("gastosData", JSON.stringify(oNormalized));
        MessageToast.show("Registros cargados: " + oNormalized.Gastos.length);
      });
    },

    // --- Ciclo de vida ---
    onInit: function () {
      sap.ui.require(["com/jr/jrhub/localService/mockserver"], function (mockserver) {
        mockserver.init();

        // Si quisieras usar OData real:
        // this.oModel = new ODataModel("/localService/");
        // this.getView().setModel(this.oModel);

        const sData = localStorage.getItem("gastosData");
        this.oJSONModel = new sap.ui.model.json.JSONModel();

        if (sData) {
          try {
            const oParsed = JSON.parse(sData);
            const oNormalized = this._normalizeGastosData(oParsed);
            this.oJSONModel.setData(oNormalized);
            this.getView().setModel(this.oJSONModel, "gastosLocal");
          } catch (e) {
            console.error("Error parseando gastosData; cargo mockdata:", e);
            this._loadFromJson();
          }
        } else {
          this._loadFromJson();
        }
      }.bind(this));
    },

    onExit: function () {
      sap.ui.require(["com/jr/jrhub/localService/mockserver"], function (mockserver) {
        mockserver.stop();
      });
    },

    // --- Crear gasto ---
    onAddGasto: function () {
      if (!this._oDialog) {
        this._oDialog = new Dialog({
          title: "{i18n>dialogAddTitle}",
          contentWidth: "400px",
          content: [
            new Label({ text: "{i18n>colFecha}" }),
            new DatePicker("dpFecha", { valueFormat: "yyyy-MM-dd", displayFormat: "dd/MM/yyyy" }),

            new Label({ text: "{i18n>colCategoria}" }),
            new Select("selCategoria", {
              items: [
                new Item({ key: "Comida",     text: "Comida" }),
                new Item({ key: "Transporte", text: "Transporte" }),
                new Item({ key: "Ocio",       text: "Ocio" }),
                new Item({ key: "Otros",      text: "Otros" })
              ]
            }),

            new Label({ text: "{i18n>colDescripcion}" }),
            new Input("inpDescripcion"),

            new Label({ text: "{i18n>colImporte}" }),
            new Input("inpImporte", { type: "Number" })
          ],
          beginButton: new Button({
            text: "{i18n>btnGuardar}",
            type: "Accept",
            press: this._onGuardarGasto.bind(this)
          }),
          endButton: new Button({
            text: "{i18n>btnCancelar}",
            type: "Reject",
            press: function () { this._oDialog.close(); }.bind(this)
          })
        });
        this.getView().addDependent(this._oDialog);
      }
      this._oDialog.open();
    },

    _onGuardarGasto: function () {
      const fecha       = sap.ui.getCore().byId("dpFecha").getValue();
      const categoria   = sap.ui.getCore().byId("selCategoria").getSelectedKey();
      const descripcion = sap.ui.getCore().byId("inpDescripcion").getValue();
      const importe     = parseFloat(sap.ui.getCore().byId("inpImporte").getValue());

      if (!fecha || !categoria || !descripcion || isNaN(importe)) {
        MessageToast.show("Por favor, completa todos los campos.");
        return;
      }

      const oData   = this.oJSONModel.getData();
      const aGastos = oData.Gastos || [];
      const nuevoId = aGastos.length ? Math.max(...aGastos.map(g => g.id || 0)) + 1 : 1;

      aGastos.push({ id: nuevoId, fecha, categoria, descripcion, importe });
      oData.Gastos = aGastos;

      this.oJSONModel.setData(oData);
      localStorage.setItem("gastosData", JSON.stringify(oData));
      MessageToast.show("Gasto añadido correctamente.");
      this._oDialog.close();

    },

    // --- Eliminar gasto ---
    onDeleteGasto: function (oEvent) {
      const oCtx = oEvent.getSource().getBindingContext("gastosLocal");
      const sId  = oCtx.getProperty("id");

      MessageBox.confirm("¿Seguro que deseas eliminar este gasto?", {
        onClose: (oAction) => {
          if (oAction === MessageBox.Action.OK) {
            const oData = this.oJSONModel.getData();
            oData.Gastos = (oData.Gastos || []).filter(g => g.id !== parseInt(sId, 10));
            this.oJSONModel.setData(oData);
            localStorage.setItem("gastosData", JSON.stringify(oData));
            MessageToast.show("Gasto eliminado.");
          }
        }
      });
    },

    // --- Filtro ---
    onFiltrarGastos: function () {
      const categoria   = this.byId("selFiltroCategoria").getSelectedKey();
      const importeMin  = parseFloat(this.byId("inpImporteMin").getValue()) || 0;
      const importeMax  = parseFloat(this.byId("inpImporteMax").getValue()) || Infinity;
      const fechaInicio = this.byId("drFiltroFechas").getDateValue();
      const fechaFin    = this.byId("drFiltroFechas").getSecondDateValue();

      let aGastos = (this.oJSONModel.getProperty("/Gastos") || []).slice();

      if (categoria) {
        aGastos = aGastos.filter(g => g.categoria === categoria);
      }
      aGastos = aGastos.filter(g => g.importe >= importeMin && g.importe <= importeMax);

      if (fechaInicio && fechaFin) {
        aGastos = aGastos.filter(g => {
          const f = new Date(g.fecha);
          return f >= fechaInicio && f <= fechaFin;
        });
      }

      this.oJSONModel.setProperty("/GastosFiltrados", aGastos);
      this.byId("tblGastos").bindItems({
        path: "gastosLocal>/GastosFiltrados",
        template: this.byId("cliGasto").clone()
      });
    },
    _renderChart: function (aGastos) {
      const canvas = this.byId("chartContainer").getDomRef().querySelector("canvas");
      const ctx = canvas.getContext('2d');
      const categorias = ["Comida", "Transporte", "Ocio", "Otros"];
      const counts = categorias.map(cat => aGastos.filter(g => g.categoria === cat).length);

      this.byId("graficoGastos").setVizProperties({
        title: { text: "Gastos por Categoría" },
        plotArea: { colorPalette: ["#4caf50", "#2196f3", "#ff9800", "#9c27b0"] }
      });

      if (this._chart) {
        this._chart.destroy(); // Evitar duplicados
      }

      this._chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: categorias,
          datasets: [{
            label: 'Número de Gastos',
            data: counts,
            backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#9c27b0']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Gastos por Categoría' }
          }
        }
      });
    }


  });
});
