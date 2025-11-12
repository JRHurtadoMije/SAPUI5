
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "com/jr/jrhub/model/models",
    "com/jr/jrhub/localService/mockserver"
], (UIComponent, JSONModel, models, mockserver) => {
    "use strict";

    return UIComponent.extend("com.jr.jrhub.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init() {
            // Llamada al constructor base
            UIComponent.prototype.init.apply(this, arguments);

            // Modelos auxiliares
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(models.createViewModel(), "view");

            // Modelo de ventas desde archivo local
            const oSalesModel = new JSONModel();
            oSalesModel.setSizeLimit(10000);
            oSalesModel.loadData(sap.ui.require.toUrl("com/jr/jrhub/model/sales.json"));
            this.setModel(oSalesModel, "sales");

            // Modelo raíz por defecto
            const oRootModel = new JSONModel({});
            this.setModel(oRootModel);

            // Inicialización del router
            const r = this.getRouter();

            // Arranque del mockserver solo si se navega a la ruta "gastos"
            let started = false;
            r.attachRouteMatched((e) => {
                if (!started && e.getParameter("name") === "gastos") {
                    mockserver.init();
                    started = true;
                }
            });

            r.initialize(); // Solo se llama una vez


            sap.ui.getCore().attachInit(function () {
                jQuery.sap.log.setLevel(jQuery.sap.log.Level.DEBUG);
            })

        }
    });
});
