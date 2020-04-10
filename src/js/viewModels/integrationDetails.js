/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojbootstrap', 'appController', 'ojs/ojpagingdataproviderview', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'ojs/ojknockout', 'ojs/ojcollapsible', 'ojs/ojbutton', 'ojs/ojchart', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojinputtext', 'ojs/ojcheckboxset', 'ojs/ojformlayout', 'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojtrain', 'ojs/ojpopup', 'ojs/ojvalidationgroup'],
function(oj, ko, Bootstrap, app, PagingDataProviderView, ArrayDataProvider, KnockoutTemplateUtils) {

    function IntegrationDetailsViewModel() {
      var self = this;
      
      self.backToIntegrationListView = function(event) {
        setTimeout(function() {
          self.router = oj.Router.rootInstance;
          self.router.go('integrations');
        });
      }

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
      self.connected = function() {
        document.title = 'Integration Details';
        // Implement further logic if needed
      };

      /**
       * Optional ViewModel method invoked after the View is disconnected from the DOM.
       */
      self.disconnected = function() {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after transition to the new View is complete.
       * That includes any possible animation between the old and the new View.
       */
      self.transitionCompleted = function() {
        // Implement if needed
      };
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return IntegrationDetailsViewModel;
  }
);
