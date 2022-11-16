jQuery.sap.require("jquery.sap.storage");  // storage
oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.session); //jQuery.sap.storage.Type.local
sap.ui.define([
    "sap/ui/core/UIComponent",
    "com/mhirj/engdrawing/model/models",
    'sap/ui/model/json/JSONModel',
    'sap/f/library',
    "sap/base/util/UriParameters",
    "sap/f/FlexibleColumnLayoutSemanticHelper"
],
function (UIComponent, models, JSONModel, fioriLibrary,UriParameters,FlexibleColumnLayoutSemanticHelper) {
    "use strict";
    var LayoutType = fioriLibrary.LayoutType;
    return UIComponent.extend("com.mhirj.engdrawing.Component", {
        metadata: {
            manifest: "json"
        },

        createContent: function () {
            var view = sap.ui.view({
                id: "idAppView",
                viewName: "com.mhirj.engdrawing.view.App",
                type: sap.ui.core.mvc.ViewType.XML,
                viewData: {
                    component: this
                }
            });

            view.setBusyIndicatorDelay(0);
            view.setBusy(true);
            window.appView = view;
            return view;
        },

        init: function () {
            var oModel,
            oRouter;
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
            
            oModel = new JSONModel();
            this.setModel(oModel);
            // enable routing
            oRouter = this.getRouter();
            oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
            oRouter.initialize();


            this.setModel(models.createLocalModel(), "LocalDataModel");

            sap.ui.getCore().getEventBus().publish("app", "initEvents");
        },
        _onBeforeRouteMatched: function(oEvent) {
            var oModel = this.getModel(),
                sLayout = oEvent.getParameters().arguments.layout;

            // If there is no layout parameter, set a default layout (normally OneColumn)
            if (!sLayout) {
                sLayout = fioriLibrary.LayoutType.OneColumn;
            }

            oModel.setProperty("/layout", sLayout);
        },
        getHelper: function () {
            var oFCL = this.getRootControl().byId('flexibleColumnLayout'),
                oParams = UriParameters.fromQuery(location.search),
                oSettings = {
                    defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
                    defaultThreeColumnLayoutType: LayoutType.ThreeColumnsMidExpanded,
                    mode: oParams.get("mode"),
                    maxColumnsCount: oParams.get("max")
                };

            return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
        }
    });
}
);