/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojbootstrap', 'appController', 'ojs/ojpagingdataproviderview',
        'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'ojs/ojknockout', 'ojs/ojcollapsible',
        'ojs/ojbutton', 'ojs/ojchart', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojinputtext',
        'ojs/ojcheckboxset', 'ojs/ojformlayout', 'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojtrain',
        'ojs/ojpopup', 'ojs/ojvalidationgroup', 'ojs/ojselectsingle'],
function(oj, ko, Bootstrap, app, PagingDataProviderView, ArrayDataProvider, KnockoutTemplateUtils) {

    function IntegrationsViewModel() {
      var self = this;
      
      self.integrationsList = ko.observableArray(null);
      self.servicesList = ko.observableArray(null);
      self.integrationsDataSource = ko.observable(null);
      self.servicesDialogDataSource = ko.observable(null);
      self.selectedServiceId = ko.observable(null);

      //Primary Search LOV and input param
      self.identifierTypeInput = ko.observable(null);
      self.identifierValue = ko.observable(null);
      self.searchKeyword = ko.observable(null);
      var identifierTypes = [
        {value: '', label: ''}, 
        {value: 'integrations', label: 'Integration ID'},
        {value: 'services', label: 'Service ID'}
      ];
      self.identifierTypeLov = new ArrayDataProvider(identifierTypes, {idAttribute: 'value'});

      //Doman Search Lovs and input param
      self.domainList = ko.observableArray(null);
      self.srcDomain = ko.observable(null);
      self.tgtDomain = ko.observable(null);

      //System search LOV and parameters
      self.systemList = ko.observableArray(null);
      self.srcSystem = ko.observable(null);
      self.tgtSystem = ko.observable(null);

      //Get all integrations
      self.getAllIntegrations = function() {
        if(self.integrationsList().length == 0) {
          $.ajax({
            type: 'GET',
            url: app.apiBaseUrl + 'integrations',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
            },
            dataType: 'json',
            success: function(response) {
              self.integrationsList.removeAll();
              self.integrationsList(response);
            },
            failure: function(response) {
              alert(JSON.stringify(response));
            }
          });
        }
      }
      self.getAllIntegrations(); //Get all integrations on page load
      self.integrationsDataSource(new PagingDataProviderView(new ArrayDataProvider(self.integrationsList, {idAttribute: 'INTERFACE_ID'})));

      //Populate lookup LOVs
      self.getLookupLovs = function() {
        $.ajax({
          type: 'GET',
          url: app.apiBaseUrl + 'lookups',
          beforeSend: function(xhr) {
              xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
          },
          dataType: 'json',
          success: function(response) {
            //Domain List
            self.domainList.removeAll();
            self.domainList().push({value: '', label: ''});
            for(let [key, value] of Object.entries(response['domain'])) { 
              self.domainList().push({value: key, label: value});
            }
            //TODO: System List
          },
          failure: function(response) {
            alert(JSON.stringify(response));
          }
        });
      }

      //Populate all LOVs on page load
      self.getLookupLovs();
      self.domainTypesLov = new ArrayDataProvider(self.domainList, {idAttribute: 'value'});

      //Search form layout
      // For small screens: 1 column and labels on top
      // For medium screens: 2 columns and labels on top
      // For large screens or bigger: 2 columns and labels inline
      self.isSmall = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY));
      self.isLargeOrUp = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.LG_UP));
      self.maxCols = ko.computed(function () {
        return self.isSmall() ? 1 : 2;
      }, self);
      self.labelEdge = ko.computed(function () {
          return self.isLargeOrUp() ? 'start' : 'top';
      }, self);
      
      
      
      //Integration catalogue search - primary
      self.validatePrimarySearchForm = function() {
        //TODO: Validate primary search
      }
      self.primarySearch = function(event) {
        //Reset all other forms
        self.resetDomainSearch();
        //TODO: Reset systems based search

        if(!self.identifierTypeInput() && !self.identifierValue() && !self.searchKeyword()) {
          self.getAllIntegrations();
        } else if(self.identifierTypeInput() === 'integrations') {
          $.ajax({
            type: 'GET',
            url: app.apiBaseUrl + self.identifierTypeInput() + '/' + self.identifierValue(),
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
            },
            dataType: 'json',
            success: function(response) {
              self.integrationsList.removeAll();
              if(response) {
                if(!Array.isArray(response)) {
                  response = [response];
                }
                self.integrationsList(response);
              }
            },
            failure: function(response) {
              alert(JSON.stringify(response));
            }
          });
        } else {
          $.ajax({
            type: 'GET',
            url: app.apiBaseUrl + self.identifierTypeInput() + '/' + self.identifierValue() + '/integrations',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
            },
            dataType: 'json',
            success: function(response) {
              if(!Array.isArray(response)) {
                response = [response];
              }
              self.integrationsList.removeAll();
              if(response) {
                self.integrationsList(response);
              }
            },
            failure: function(response) {
              alert(JSON.stringify(response));
            }
          });
        }
      }
      //Reset primary search form
      self.resetPrimarySearch = function(event) {
        self.identifierTypeInput(null);
        self.identifierValue(null);
        self.searchKeyword(null);
      }

      //Integration catalogue search - source and/or target domain
      self.domainSearch = function(event) {
        var domainSearchUrl = app.apiBaseUrl + 'integrations/';
        if(self.srcDomain() && !self.tgtDomain()) {
          domainSearchUrl = domainSearchUrl + 'search/domain/src/' + self.srcDomain();
        }
        if(!self.srcDomain() && self.tgtDomain()) {
          domainSearchUrl = domainSearchUrl + 'search/domain/tgt/' + self.tgtDomain();
        }
        if(self.srcDomain() && self.tgtDomain()) {
          domainSearchUrl = domainSearchUrl + 'search/domain/src/' + self.srcDomain() + '/tgt/' + self.tgtDomain();
        }
        $.ajax({
          type: 'GET',
          url: domainSearchUrl,
          beforeSend: function(xhr) {
              xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
          },
          dataType: 'json',
          success: function(response) {
            self.integrationsList.removeAll();
            if(response) {
              if(!Array.isArray(response)) {
                response = [response];
              }
              self.integrationsList(response);
            }
          },
          failure: function(response) {
            alert(JSON.stringify(response));
          }
        });
      }
      //Reset domain search form
      self.resetDomainSearch = function(event) {
        self.srcDomain(null);
        self.tgtDomain(null);
      }
      
      //Integrations table selection listener
      self.integrationsTblSelctionListener = function(event) {
        var interfaceId = null;
        event.detail.value.row.values().forEach(key => {
          interfaceId = key;
        });
      
        if(interfaceId != undefined) {
          $.each(self.integrationsList(), function(id, integration) {
            if(integration.INTERFACE_ID == interfaceId) {
              app.selectedIntegration(integration);
              self.servicesList(integration.Services);
            }
          });
        }
      }

      // Service list dialog
      self.openServicesListDialog = function(event) {
        self.servicesDialogDataSource(new ArrayDataProvider(self.servicesList, {idAttribute: 'SERVICE_ID'}));
        document.getElementById('servicesListDialog').open();
      }

      self.closeServicesListDialog = function(event) {
        document.getElementById('servicesListDialog').close();
      }

      //Open integratoion details view
      self.openIntegrationDetailsView = function(event) {
        setTimeout(function() {
          self.router = oj.Router.rootInstance.go('integrationDetails');
        });
      }
      
      //Open service details view
      self.openServiceDetailsView = function(ojEvent, jqEvent) {
        var url = app.apiBaseUrl + 'services/' + jqEvent.currentTarget.text;
        $.ajax({
          type: 'GET',
          url: url,
          beforeSend: function(xhr) {
              xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
          },
          dataType: 'json',
          success: function(response) {
            app.selectedService(response);
            app.navHistory.push('integrations');
            self.router = oj.Router.rootInstance.go('serviceDetails');
          },
          failure: function(response) {
            alert(JSON.stringify(response));
          }
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
    return IntegrationsViewModel;
  }
);
