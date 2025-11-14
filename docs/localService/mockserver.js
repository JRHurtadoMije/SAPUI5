sap.ui.define([
    "sap/ui/core/util/MockServer",
    "sap/base/Log"
], function (MockServer, Log) {
    "use strict";

    var oMockServer;

    return {
        init: function () {
            if (oMockServer) {
                Log.info("MockServer ya está iniciado.");
                return;
            }

            oMockServer = new MockServer({
                rootUri: "/localService/"
            });

            oMockServer.simulate("./localService/metadata.xml", {
                sMockdataBaseUrl: "./localService/mockdata",
                bGenerateMissingMockData: true
            });

            MockServer.config({
                autoRespond: true,
                autoRespondAfter: 500
            });

            oMockServer.start();
            Log.info("✅ MockServer iniciado en /localService/");
        },

        stop: function () {
            if (oMockServer) {
                oMockServer.stop();
                oMockServer = null;
                Log.info("⛔ MockServer detenido.");
            }
        }
    };
});