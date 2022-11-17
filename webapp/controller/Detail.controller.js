sap.ui.define([
    "com/mhirj/engdrawing/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    'sap/f/library',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, library) {
        "use strict";
        return BaseController.extend("com.mhirj.engdrawing.controller.Detail", {
            onInit: function () {
                var oExitButton = this.getView().byId("exitFullScreenBtn"),
                    oEnterButton = this.getView().byId("enterFullScreenBtn");
                var oRouter = this.getRouter();
                if (oRouter) {
                    oRouter.attachRoutePatternMatched(this.onRouteMatched, this);
                }
                [oExitButton, oEnterButton].forEach(function (oButton) {
                    oButton.addEventDelegate({
                        onAfterRendering: function () {
                            if (this.bFocusFullScreenButton) {
                                this.bFocusFullScreenButton = false;
                                oButton.focus();
                            }
                        }.bind(this)
                    });
                }, this);
            },
            onRouteMatched: function (oEvent) {
                var that = this;
                var docNo = oEvent.getParameter("arguments").docNo;
                var docTitle = oEvent.getParameter("arguments").docTitle;
                if (docNo !== undefined || docTitle !== undefined) {
                    this.setBusyOn();
                    this.sDocumentNo = docNo;
                    this.sDocTitle = docTitle;
                    // with Document no only
                    if (this.sDocumentNo != "" && this.sDocTitle == undefined) {
                        var serviceUrl = this.getCompleteURL() + '/indexes/crjonlinefiltering-index/docs/?$count=true&search="' + this.sDocumentNo + '"&searchFields=DocumentName&$select=DocumentName,DocumentTitle,RevisionNumber,DocVersion,CategoryName,UNID&api-version=2020-06-30';
                    }
                    // with Document title only
                    else if (this.sDocTitle != "" && this.sDocumentNo == undefined) {
                        serviceUrl = this.getCompleteURL() + "/indexes/crjonlinefiltering-index/docs/?$count=true&search=" + this.sDocTitle + "&searchFields=DocumentTitle&$select=DocumentName,DocumentTitle,RevisionNumber,DocVersion,CategoryName,UNID&api-version=2020-06-30";
                    }
                    // with Document no and Document title
                    else {
                        serviceUrl = this.getCompleteURL() + "/indexes/crjonlinefiltering-index/docs/?$count=true&search=" + this.sDocTitle + " " + this.sDocumentNo + "&searchFields=DocumentTitle,DocumentName&$select=DocumentName,DocumentTitle,RevisionNumber,DocVersion,CategoryName,UNID&api-version=2020-06-30";
                    }
                    var DRS_Key = this.getLocalDataModel().getData().DRS_Model.DRS_Key;
                    // Service call to get list of documents
                    var xhr = new XMLHttpRequest();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState === 4 && xhr.status == 200) {
                            that.setBusyOff();
                            var parseData = JSON.parse(xhr.responseText);
                            if (parseData["@odata.count"] === 0) {
                                that.displayInfoMessageWithAction(that.getResourceBundle().getText("records"));
                            }
                            that.getView().byId("idTitle").setText("Documents (" + parseData["@odata.count"] + ")");
                            that.getLocalDataModel().setProperty("/DRS_Model/Documents", parseData);
                        }
                        else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
                            that.setBusyOff();
                            that.displayErrorMessageWithAction("Internal server error!");
                        }
                    }
                    xhr.open('GET', serviceUrl, true);
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.setRequestHeader("api-key", DRS_Key);
                    xhr.send('');
                }
            },
            onListItemPress: function (evt) {
                if(this.Id !== undefined &&this.Id !== evt.getSource().getId()){
                    document.getElementById(this.Id).style.backgroundColor = "#FFFFFF";
                }
                this.Id = evt.getSource().getId();
                document.getElementById(evt.getSource().getId()).style.backgroundColor = "#e7ecf0";
                var listItem = evt.getSource(),
                    path = listItem.getBindingContext("LocalDataModel").getPath(),
                    aData = this.getView().getModel("LocalDataModel").getProperty(path);
                this.getRouter()._oRoutes.DetailDetail._oConfig.layout = "ThreeColumnsMidExpanded";
                this.getRouter().navTo("DetailDetail", { layout: library.LayoutType.ThreeColumnsMidExpanded, UNID: aData.UNID });
            },
            handleFullScreen: function () {
                this.bFocusFullScreenButton = true;
                var sNextLayout = this.getOwnerComponent().getModel().getProperty("/actionButtonsInfo/midColumn/fullScreen");
                this.getRouter()._oRoutes.Detail._oConfig.layout = "MidColumnFullScreen";
                this.getRouter().navTo("Detail", { layout: sNextLayout, docNo: this.sDocumentNo, docTitle: this.sDocTitle });
            },
            handleExitFullScreen: function () {
                this.bFocusFullScreenButton = true;
                var sNextLayout = this.getOwnerComponent().getModel().getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
                this.getRouter()._oRoutes.Detail._oConfig.layout = "TwoColumnsMidExpanded";
                this.getRouter().navTo("Detail", { layout: sNextLayout, docNo: this.sDocumentNo, docTitle: this.sDocTitle });
            },
            handleClose: function () {
                var sNextLayout = this.getOwnerComponent().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
                this.getRouter().navTo("Master", { layout: sNextLayout });
            }
        });
    });
