sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("com.jr.jrhub.controller.App", {

        onInit() {
            this.getOwnerComponent().getRouter().initialize();
        },

        onToggleSideNav() {
            const oSN = this.byId("sideNav");
            oSN.setExpanded(!oSN.getExpanded());
        },

        onItemSelect(oEvent) {
            const sKey = oEvent.getParameter("item").getKey();
            this.getOwnerComponent().getRouter().navTo(sKey);
        }

    });
});
