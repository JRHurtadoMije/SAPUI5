sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageToast, JSONModel) => {
    "use strict";
    return Controller.extend("com.jr.jrhub.controller.Basico", {
        onInit() {
            // creamos el modelo para el contador de clics.
            const oModel = new JSONModel({
                clickCount : 0
            })

            this.getView().setModel(oModel, "local");
        },

        onShowHello() {
            const oModel = this.getView().getModel("local");
            const contador = oModel.getProperty("/clickCount") + 1;
            oModel.setProperty("/clickCount", contador);

            MessageToast.show(`¡Hola! Pulsa para aumentar el contador:  ${contador}"`);

        }

    });
});