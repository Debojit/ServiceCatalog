/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your incidents ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojbootstrap', 'ojs/ojpagingdataproviderview', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'ojs/ojknockout', 'ojs/ojcollapsible', 'ojs/ojbutton', 'ojs/ojchart', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojinputtext', 'ojs/ojcheckboxset', 'ojs/ojformlayout', 'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojtrain', 'ojs/ojpopup', 'ojs/ojvalidationgroup'],
function(oj, ko, Bootstrap, PagingDataProviderView, ArrayDataProvider, KnockoutTemplateUtils) {

    function IncidentsViewModel() {
      var self = this;
      
      self.selectedIntegration = ko.observable();
      self.integrationList = ko.observableArray();
      self.serviceList = ko.observableArray();
      self.servicesDialogDataSource = ko.observable();
      
      $.ajax({
        type: 'GET',
        url: 'https://localhost:7102/enterprise-service-catalogue/resources/integrations',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
        },
        dataType: 'json',
        success: function(response) {
          self.integrationList.removeAll();
          self.integrationList(response);
        },
        failure: function(response) {
          alert(JSON.stringify(response));
        }
    });

    self.integrationsDataSource = new PagingDataProviderView(new oj.ArrayDataProvider(self.integrationList, {idAttribute: 'INTERFACE_ID'}));

    self.integrationsTblSelctionListener = function(event) {
      var interfaceId = null;
      event.detail.value.row.values().forEach(key => {
        interfaceId = key;
      });
      
      if(interfaceId != undefined) {
        $.each(self.integrationList(), function(id, integration) {
          if(integration.INTERFACE_ID == interfaceId) {
            self.selectedIntegration(integration.URL);
            self.serviceList(integration.Services);
          }
        });
      }
    }

    // Service List Dialog
    self.openServiceListDialog = function(event) {
      self.servicesDialogDataSource(new ArrayDataProvider(self.serviceList, {idAttribute: 'SERVICE_ID'}));
      document.getElementById('serviceListDialog').open();
    }

    self.closeServiceListDialog = function(event) {
      document.getElementById('serviceListDialog').close();
    }
    //End Service List Dialog
      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
      self.connected = function() {
        document.title = 'Integrations';
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
    return IncidentsViewModel;
  }
);
