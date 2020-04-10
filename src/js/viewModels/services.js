/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojbootstrap', 'appController', 'ojs/ojpagingdataproviderview', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'ojs/ojknockout', 'ojs/ojcollapsible', 'ojs/ojbutton', 'ojs/ojchart', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojinputtext', 'ojs/ojcheckboxset', 'ojs/ojformlayout', 'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojtrain', 'ojs/ojpopup', 'ojs/ojvalidationgroup'],
function(oj, ko, Bootstrap, app, PagingDataProviderView, ArrayDataProvider, KnockoutTemplateUtils) {

    function ServicesViewModel() {
      var self = this;
      
      self.servicesList = ko.observableArray();
      self.integrationsList = ko.observableArray();
      self.integrationsDialogDataSource = ko.observable();
      
      $.ajax({
        type: 'GET',
        url: 'https://localhost:7102/enterprise-service-catalogue/resources/services',
        beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
        },
        dataType: 'json',
        success: function(response) {
          self.servicesList.removeAll();
          self.servicesList(response);
        },
        failure: function(response) {
          alert(JSON.stringify(response));
        }
      });
      
      self.servicesDataSource = new PagingDataProviderView(new oj.ArrayDataProvider(self.servicesList, {idAttribute: 'SERVICE_ID'}));

      //Table selection listener
      self.servicesTblSelctionListener = function(event) {
        var serviceId = null;
        event.detail.value.row.values().forEach(key => {
          serviceId = key;
        });
        
        if(serviceId != undefined) {
          $.each(self.servicesList(), function(id, service) {
            if(service.SERVICE_ID == serviceId) {
              app.selectedService(service);
              self.integrationsList(service.Integrations);
            }
          });
        }
      }

      // Integrations List Dialog 
      self.openIntegrationsListDialog = function(event) {
        self.integrationsDialogDataSource(new ArrayDataProvider(self.integrationsList, {idAttribute: 'INTERFACE_ID'}));
        document.getElementById('integrationsListDialog').open();
      }

      self.closeIntegrationsListDialog = function(event) {
        document.getElementById('integrationsListDialog').close();
      }

      //Open Service Details
      self.openServiceDetailsView = function(event) {
        setTimeout(function() {
          self.router = oj.Router.rootInstance.go('serviceDetails');
        });
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
        document.title = 'Services';
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
    return ServicesViewModel;
  }
);
