sap.ui.define([
    "com/mhirj/engdrawing/controller/BaseController",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel) {
        "use strict";
        return BaseController.extend("com.mhirj.engdrawing.controller.DetailDetail", {
            onInit: function () {
                var oRouter = this.getRouter();
                if (oRouter) {
                    oRouter.attachRoutePatternMatched(this.onRouteMatched, this);
                }
            },
            onRouteMatched: function (oEvent) {
                var that = this;
                this.UNID = oEvent.getParameter("arguments").UNID; //this.decode64()
                if(this.UNID === undefined){
                    return;
                }
                this.setBusyOn();
                var DRS_Key = this.getLocalDataModel().getData().DRS_Model.DRS_Key;
                var serviceUrl = this.getCompleteURL() + "/indexes/crjonlinefiltering-index/docs/?$count=true&search=" + this.UNID + "&searchFields=UNID&$select=DocumentName,DocumentTitle,RevisionNumber,DocVersion,CategoryName,Modsum,FileInfo&api-version=2020-06-30";
                // service call to get attachment list
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status == 200) {
                        var parseData = JSON.parse(xhr.responseText);
                        if (parseData["@odata.count"] === 0) {
                            that.displayInfoMessageWithAction(that.getResourceBundle().getText("records"));
                        }
                       // that.getView().byId("idAttachmentTitle").setText("Attachments (" + parseData["@odata.count"] + ")");
                        that.getLocalDataModel().setProperty("/DRS_Model/attachments", parseData);
                    }
                    else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
                        that.displayErrorMessageWithAction("Internal server error!");
                    }
                    that.setBusyOff();
                }
                xhr.open('GET', serviceUrl, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader("api-key", DRS_Key);
                xhr.send('');
            },
            onPressDownload: function (evt) {
                var that = this;
                this.setBusyOn();
                var sPath = evt.getSource().getParent().getBindingContextPath();
                var oObj = this.getView().getModel("LocalDataModel").getProperty(sPath);
                var DRS_Key = this.getLocalDataModel().getData().DRS_Model.DRS_Key;
                var serviceUrl = this.getCompleteURL() + "/CRJ_API/CRJFile";
                // service call to get attachment list
                var xhr = new XMLHttpRequest();
                xhr.open("POST", serviceUrl, true);
                xhr.responseType = 'blob';
                xhr.onload = function () { //Call a function when the state changes.
                    if (xhr.readyState == 4 && xhr.readyState === XMLHttpRequest.DONE) {
                        var a = document.createElement('a');
                        var url = window.URL.createObjectURL(new Blob([xhr.response], { type: 'application/'+oObj.FileType }));
                        //window.open(url,"_blank");
                        a.href = url;
                        a.download = oObj.FileName;
                        a.click();
                        that.setBusyOff();
                        window.URL.revokeObjectURL(url);
                    } else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 200) {
                        that.displayErrorMessageWithAction("Internal server error!");
                        that.setBusyOff();
                    }
                }
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader("api-key", DRS_Key);
                xhr.send(JSON.stringify({
                    "FileId": oObj.FileId
                }));
            },
            handleBackToMainScreen: function (oEvent) {
                this.getRouter().navTo("Master");
            },
            handleFullScreen: function () {
                var that = this;
                this.bFocusFullScreenButton = true;
                var sNextLayout = this.getOwnerComponent().getModel().getProperty("/actionButtonsInfo/endColumn/fullScreen");
                this.getRouter()._oRoutes.DetailDetail._oConfig.layout = "EndColumnFullScreen";
                this.getRouter().navTo("DetailDetail", { layout: sNextLayout, UNID: that.UNID });
            },
            handleExitFullScreen: function () {
                var that = this;
                this.bFocusFullScreenButton = true;
                this.getRouter()._oRoutes.DetailDetail._oConfig.layout = "ThreeColumnsMidExpanded";
                var sNextLayout = this.getOwnerComponent().getModel().getProperty("/actionButtonsInfo/endColumn/exitFullScreen");
                this.getRouter().navTo("DetailDetail", { layout: sNextLayout, UNID: that.UNID });
            },
            handleClose: function () {
                this.bFocusFullScreenButton = true;
                //var data = this.getView().getModel("LocalDataModel").getData().DRS_Model.attachments.value[0];
                var data = this.getLocalDataModel().getData().DRS_Model;
                var sNextLayout = this.getOwnerComponent().getModel().getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
                this.getRouter()._oRoutes.Detail._oConfig.layout = "TwoColumnsMidExpanded";
                this.getRouter().navTo("Detail", { layout: "TwoColumnsMidExpanded", docNo: data.docNo, docTitle: data.docTitle });
            }
        });
    });
