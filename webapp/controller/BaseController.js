sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/model/odata/ODataModel"
], function (Controller, UIComponent, MessageBox, ODataModel) {
    "use strict";

    return Controller.extend("com.mhirj.engdrawing.controller.BaseController", {
        onInit: function () {
            this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
        },
        displayErrorMessageWithAction: function (errorString, onCloseFunction) {
            MessageBox.show(
                errorString, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
                actions: [sap.m.MessageBox.Action.OK],
                onClose: onCloseFunction,
                styleClass: "sapUiSizeCompact buttonBlack"
            }
            );
        },
        displayInfoMessageWithAction: function (infoString, onCloseFunction) {

            MessageBox.show(
                infoString, {
                icon: sap.m.MessageBox.Icon.INFORMATION,
                title: "Information",
                actions: [sap.m.MessageBox.Action.OK],
                onClose: onCloseFunction,
                styleClass: "sapUiSizeCompact buttonBlack"
            }
            );
        },
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        getResourceBundle: function () {
            var oResourceBundle = this.getOwnerComponent().getModel("i18n")._oResourceBundle;
            return oResourceBundle;
        },

        getModel: function (sName) {
            if (sName) {
                return this.getOwnerComponent().getModel(sName);
            } else {
                return this.getOwnerComponent().getModel();
            }
        },

        getLocalDataModel: function () {
            return this.getOwnerComponent().getModel("LocalDataModel");
        },

        getApplicationID: function () {
            return this.getOwnerComponent().getManifestEntry("/sap.app").id.replaceAll(".", "");
        },

        getApplicationVersion: function () {
            return this.getOwnerComponent().getManifestEntry("/sap.app").applicationVersion.version;
        },

        getApplicationRouter: function () {
            return "/" + this.getOwnerComponent().getManifestEntry("/sap.cloud").service;
        },
        getCompleteURL: function () {
            return this.getApplicationRouter() + "." + this.getApplicationID() + "-" + this.getApplicationVersion();
        },
        setBusyOn: function () {
            window.appView.setBusyIndicatorDelay(0);
            window.appView.setBusy(true);
        },
        setBusyOff: function () {
            window.appView.setBusy(false);
        },

        getDRSConfig: function (dropDownName) {
            $.ajax({
                "url": this.getCompleteURL() + "/drop-down/getDropDownData",
                "method": "POST",
                "data": JSON.stringify({
                    "dropDownName": dropDownName
                }),
                "xhrFields": {
                    "withCredentials": true
                },
                "headers": {
                    "Content-Type": "application/json"
                },
                "success": function (result, xhr, successData) {
                    this.setBusyOff();
                    var data = JSON.parse(result.value);
                    this.getLocalDataModel().setProperty("/DMS_Model/DRS_Key/" + dropDownName, data);
                    this.getLocalDataModel().getData().DRS_Model.DRS_Key = data.DRS_Key;
                    this.getLocalDataModel().refresh();
                }.bind(this),
                "error": function (errorData) {
                    // --- Error handling  ---//
                    this.setBusyOff();
                    debugger;
                    try {
                        var returnValue = errorData.responseText + " error";
                    } catch (err) {
                        returnValue = "Internal server error";
                    }
                    MessageBox.show(
                        returnValue, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        actions: [sap.m.MessageBox.Action.OK],
                        styleClass: "sapUiSizeCompact buttonBlack"
                    }
                    );
                }.bind(this)
            });
        },

        getoAuthToken: function (successCallBack, errorCallBack) {
            $.ajax({
                "url": this.getCompleteURL() + "/getOAuthToken",
                "method": "GET",
                "success": function (result, xhr, successData) {
                    successCallBack(result, xhr, successData)
                }.bind(this),
                "error": function (errorData) {
                    errorCallBack(errorData);
                }.bind(this)
            });
        },

        readDataFromSystem: function (model, entityName, successCallBack, errorCallBack) {
            this.getModel(model).read(entityName, {
                "success": function (successData) {
                    successCallBack(successData);
                }.bind(this),
                "error": function (errorData) {
                    errorCallBack(errorData);
                }.bind(this)
            });
        },

        readDataFromSystemWithUrlParameters: function (model, entityName, urlParameters, successCallBack, errorCallBack) {
            this.getModel(model).read(entityName, {
                "urlParameters": urlParameters,
                "success": function (successData) {
                    successCallBack(successData);
                }.bind(this),
                "error": function (errorData) {
                    errorCallBack(errorData);
                }.bind(this)
            });
        },
        encode64: function (input) {
            var keyStr = "ABCDEFGHIJKLMNOP" +
                "QRSTUVWXYZabcdef" +
                "ghijklmnopqrstuv" +
                "wxyz0123456789+/" +
                "=";
            input = escape(input);
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode64: function (input) {
            var keyStr = "ABCDEFGHIJKLMNOP" +
                "QRSTUVWXYZabcdef" +
                "ghijklmnopqrstuv" +
                "wxyz0123456789+/" +
                "=";
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return unescape(output);
        }

    });
});