sap.ui.define([
    "com/mhirj/engdrawing/controller/BaseController"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController) {
        "use strict";

        return BaseController.extend("com.mhirj.engdrawing.controller.Master", {
            onInit: function () {
                var oRouter = this.getRouter();
                if (oRouter) {
                    oRouter.attachRoutePatternMatched(this.onRouteMatched, this);
                    this.getDRSConfig("DRS_CONFIG_DETAILS");
                }
            },
            onRouteMatched: function (oEvent) {
                this.setBusyOff();
            },
            onSearch:function(){
                var that = this;
                var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
                var documentNumber = this.getView().byId("idDocNo").getValue(),
                    documentTitle = this.getView().byId("idDocTitle").getValue();
                if(documentNumber == "" && documentTitle ==""){
                    this.displayErrorMessageWithAction(that.getResourceBundle().getText("mandatoryText"));
                }else{
                    if(documentTitle ==""){
                        //documentTitle = "Title";
                    }
                    if(documentNumber ==""){
                       // documentTitle = "Number";
                    }
                    this.getRouter()._oRoutes.Detail._oConfig.layout = "TwoColumnsMidExpanded";
                    this.getRouter().navTo("Detail", { layout: oNextUIState.layout, docNo: documentNumber,docTitle: documentTitle });
                }
            },
            setDialogBusyOff: function () {
                this.notificationDialog.setBusy(false);
            },
            onClear:function(){
                this.getView().byId("idDocNo").setValue("");
                this.getView().byId("idDocTitle").setValue("")
            }
        });
    });
