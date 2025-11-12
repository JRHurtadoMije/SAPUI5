sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/routing/History",
    "sap/viz/ui5/controls/common/feeds/FeedItem",
    "sap/viz/ui5/format/ChartFormatter",
    "sap/viz/ui5/api/env/Format",
    "sap/ui/Device"
], function (Controller, JSONModel, Filter, FilterOperator, History, FeedItem, ChartFormatter, Format, Device) {
    "use strict";

    return Controller.extend("com.jr.jrhub.controller.Graficos", {

        onInit: function () {

            Format.numericFormatter(ChartFormatter.getInstance());


            // 1) Modelo de datos (desde /model/sales.json)
            var oDataModel = new JSONModel();
            oDataModel.attachRequestCompleted(function (oEvt) {
                if (oEvt.getParameter("success")) {
                    // Aplicar filtros iniciales cuando haya datos
                    this._applyAllFilters();
                    // (Opcional) log
                    // console.log("[sales.json] cargado OK");
                } else {
                    // console.error("[sales.json] carga NO OK");
                }
            }.bind(this));
            oDataModel.attachRequestFailed(function (oEvt) {
                // console.error("Fallo JSONModel:", oEvt.getParameters());
            });
            oDataModel.loadData(sap.ui.require.toUrl("com/jr/jrhub/model/sales.json"));
            this.getView().setModel(oDataModel);

            // 2) Modelo de vista (filtros/UI state)
            var oViewModel = new JSONModel({
                filters: { category: "Todas", metric: "sales", minPrice: 0 }
            });
            this.getView().setModel(oViewModel, "view");

            // 3) Configurar VizFrames (propiedades iniciales)
            this._initViz(this.byId("vizBar"));
            this._initViz(this.byId("vizDonut"));
            this._initViz(this.byId("vizLine"));

            // 4) Feeds iniciales según métrica
            this._applyMetricFeeds();


            Device.media.attachHandler(this._applyResponsiveVizProps, this);
            this._applyResponsiveVizProps();

        },

        /* ---------- NAV ---------- */
        onNavBack: function () {
            var oHist = History.getInstance();
            if (oHist.getPreviousHash() !== undefined) {
                window.history.go(-1);
            } else {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter && oRouter.navTo("Basico", {}, true);
            }
        },

        /* ---------- INIT VIZ ---------- */
        _initViz: function (oViz) {
            if (!oViz) { return; }
            oViz.setVizProperties({
                plotArea: { dataLabel: { visible: true, showTotal: true } },
                legend: { visible: true },
                title: { visible: false },
                valueAxis: { label: { formatString: "shortFloat_MFD2" } },
                categoryAxis: { title: { visible: false } },
                interaction: { selectability: { mode: "EXCLUSIVE" } }
            });
        },

        /* ---------- MÉTRICA ---------- */
        onMetricChange: function () {
            this._applyMetricFeeds();
            this._applyAllFilters();
        },

        _applyMetricFeeds: function () {
            var sMetric = this.getView().getModel("view").getProperty("/filters/metric");
            var sMeasureName = (sMetric === "sales") ? "Ventas" : "Unidades";

            // Barras
            this._setFeeds(this.byId("vizBar"), [
                { uid: "valueAxis", type: "Measure", values: [sMeasureName] },
                { uid: "categoryAxis", type: "Dimension", values: ["Categoría"] }
            ]);

            // Donut
            this._setFeeds(this.byId("vizDonut"), [
                { uid: "size", type: "Measure", values: [sMeasureName] },
                { uid: "color", type: "Dimension", values: ["Categoría"] }
            ]);

            // Línea
            this._setFeeds(this.byId("vizLine"), [
                { uid: "valueAxis", type: "Measure", values: [sMeasureName] },
                { uid: "categoryAxis", type: "Dimension", values: ["Mes"] }
            ]);

            // Formatos según métrica
            var sFmt = (sMetric === "sales") ? "Currency" : "#,##0"; // usamos el formato legible para unidades
            [this.byId("vizBar"), this.byId("vizLine"), this.byId("vizDonut")].forEach(function (o) {
                o && o.setVizProperties({
                    valueAxis: { label: { formatString: sFmt } },
                    plotArea: { dataLabel: { formatString: sFmt } },
                    tooltip: { formatString: sFmt }
                });
            });
        },

        _setFeeds: function (oViz, aFeeds) {
            if (!oViz) { return; }
            oViz.removeAllFeeds();
            aFeeds.forEach(function (def) {
                oViz.addFeed(new FeedItem(def));
            });
        },

        /* ---------- FILTROS ---------- */
        onFilterChange: function () {
            this._applyAllFilters();
        },

        _applyAllFilters: function () {
            var oVM = this.getView().getModel("view");
            var sCat = oVM.getProperty("/filters/category");
            var iMin = Number(oVM.getProperty("/filters/minPrice")) || 0;

            var aFilters = [];
            if (sCat && sCat !== "Todas") {
                aFilters.push(new Filter("category", FilterOperator.EQ, sCat));
            }
            if (iMin > 0) {
                aFilters.push(new Filter("sales", FilterOperator.GE, iMin));
            }

            // Aplica a los tres datasets
            this._filterDataset(this.byId("vizBar"), aFilters);
            this._filterDataset(this.byId("vizDonut"), aFilters);
            this._filterDataset(this.byId("vizLine"), aFilters);
        },

        _filterDataset: function (oViz, aFilters) {
            if (!oViz) { return; }
            var oDs = oViz.getDataset();
            var oBinding = oDs && oDs.getBinding("data");
            if (oBinding) { oBinding.filter(aFilters); }
        },

        _applyResponsiveVizProps: function () {
            var range = sap.ui.Device.media.getCurrentRange("StdExt"); // S, M, L, XL
            var bSmall = (range.name === "Phone" || range.name === "Tablet");
            var aCharts = [this.byId("vizBar"), this.byId("vizDonut"), this.byId("vizLine")];

            aCharts.forEach(function (o) {
                if (!o) { return; }
                o.setVizProperties({
                    legend: { visible: !bSmall },
                    plotArea: { dataLabel: { visible: !bSmall } }
                });
            });
        },

        onExit: function () {
            sap.ui.Device.media.detachHandler(this._applyResponsiveVizProps, this);
        }


    });
});
