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
        {value: null, label: ''}, 
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
        $.ajax({
          type: 'GET',
          url: app.apiBaseUrl + 'integrations',
          beforeSend: function(xhr) {
              xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
          },
          dataType: 'json',
          success: function(response) {
            self.resetPrimarySearch();
            self.resetDomainSearch();
            self.resetSystemSearch();
            self.integrationsList.removeAll();
            self.integrationsList(response);
          },
          failure: function(response) {
            alert(JSON.stringify(response));
          }
        });
      }
      self.getAllIntegrations(); //Get all integrations on page load
      self.integrationsDataSource(new PagingDataProviderView(new ArrayDataProvider(self.integrationsList, {idAttribute: 'interfaceId'})));

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
            self.domainList().push({value: null, label: ''});
            for(let [key, value] of Object.entries(response['domain'])) { 
              self.domainList().push({value: key, label: value});
            }
            //System List
            self.systemList.removeAll();
            self.systemList.push({value: null, label: ''});
            for(let [key, value] of Object.entries(response['system'])) {
              self.systemList.push({value: key, label: value});
            }
          },
          failure: function(response) {
            alert(JSON.stringify(response));
          }
        });
      }
      self.getLookupLovs(); //Populate all LOVs on page load
      self.domainTypesLov = new ArrayDataProvider(self.domainList, {idAttribute: 'value'});
      self.systemTypesLov = new ArrayDataProvider(self.systemList, {idAttribute: 'value'});
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
      //Primary Identifier LOV Value Change Listener
      self.primarySearchIdentifierTypeValueChange = function(event) {
        if(event.detail.value) {
          document.getElementById('identifierValue').disabled = false;
          document.getElementById('keywordSearch').disabled = true;
          document.getElementById('identifierTypeLov').messagesCustom = [];
          document.getElementById('keywordSearch').messagesCustom = [];
        } else {
          document.getElementById('identifierValue').disabled = true;
          self.identifierValue(null);
          document.getElementById('keywordSearch').disabled = false;
        }
      }
      
      self.primarySearch = function(event) {
        //Reset all other forms
        self.resetDomainSearch();
        self.resetSystemSearch();

        //Validate inputs
        if(!self.identifierTypeInput() && !self.searchKeyword()) {
          document.getElementById('identifierTypeLov').messagesCustom = [{summary: 'Error', detail: 'Both identifier and keyword fields cannot be empty.'}];
          document.getElementById('keywordSearch').messagesCustom = [{summary: 'Error', detail: 'Both identifier and keyword fields cannot be empty.'}];
        } else if(self.identifierTypeInput() && !self.identifierValue()) {
          document.getElementById('identifierValue').messagesCustom = [{summary: 'Error', detail: 'Enter an interface/service id.'}];
        } else {//Inputs verified, prepare search api call
          var primarySearchUrl = null;
          if(self.identifierTypeInput() == 'integrations') {//Interface id based search
            primarySearchUrl = app.apiBaseUrl + 'integrations/' + self.identifierValue();
            
          } else if(self.identifierTypeInput() == 'services') { //Keyword based search
            primarySearchUrl = app.apiBaseUrl + 'services/' + self.identifierValue() + '/integrations';
          } else {
            primarySearchUrl = app.apiBaseUrl + 'integrations/search/keyword/' + self.searchKeyword();
          }
          $.ajax({
            type: 'GET',
            url: primarySearchUrl,
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
            },
            dataType: 'json',
            success: function(response) {
              self.integrationsList.removeAll();
              if(response) {
                if(!Array.isArray(response)) {
                  self.integrationsList([response]);
                } else {
                  self.integrationsList(response);
                }
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
        document.getElementById('identifierTypeLov').messagesCustom = [];
        document.getElementById('keywordSearch').messagesCustom = [];
      }

      //Integration catalogue search - source and/or target domain
      //Domain search value change listener
      self.domainSearchValueChange = function(event) {
        var srcDomain = self.srcDomain();
        var tgtDomain = self.tgtDomain();
        if(srcDomain || tgtDomain) {
          document.getElementById('srcDomainLov').messagesCustom = [];
          document.getElementById('tgtDomainLov').messagesCustom = [];
        }
      }
      self.domainSearch = function(event) {
        self.resetPrimarySearch();
        self.resetSystemSearch();
        //Validate inputs
        var srcDomain = self.srcDomain();
        var tgtDomain = self.tgtDomain();
        if(!srcDomain && !tgtDomain) {
          document.getElementById('srcDomainLov').messagesCustom = [{summary: 'Error', detail: 'Both source and target domains cannot be empty.'}];
          document.getElementById('tgtDomainLov').messagesCustom = [{summary: 'Error', detail: 'Both source and target domains cannot be empty.'}];
        } else {
          document.getElementById('srcDomainLov').messagesCustom = [];
          document.getElementById('tgtDomainLov').messagesCustom = [];
          //Build search URL
          var domainSearchUrl = app.apiBaseUrl + 'integrations/';
          if(srcDomain && !tgtDomain) {
            domainSearchUrl = domainSearchUrl + 'search/domain/src/' + srcDomain;
          }
          if(!srcDomain && tgtDomain) {
            domainSearchUrl = domainSearchUrl + 'search/domain/tgt/' + tgtDomain;
          }
          if(srcDomain && tgtDomain) {
            domainSearchUrl = domainSearchUrl + 'search/domain/src/' + srcDomain + '/tgt/' + tgtDomain;
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
      }
      //Reset domain search form
      self.resetDomainSearch = function(event) {
        self.srcDomain(null);
        self.tgtDomain(null);
        document.getElementById('srcDomainLov').messagesCustom = [];
        document.getElementById('tgtDomainLov').messagesCustom = [];
      }
      
      //Integration Catalogue search - source and/or target system
      //System search value change listener
      self.systemSearchValueChange = function(event) {
        var srcSystem = self.srcSystem();
        var tgtSystem = self.tgtSystem();
        if(srcSystem || tgtSystem) {
          document.getElementById('srcSystemLov').messagesCustom = [];
          document.getElementById('tgtSystemLov').messagesCustom = [];
        }
      }

      self.systemSearch = function(event) {
        self.resetPrimarySearch();
        self.resetDomainSearch();

        //Validate inputs
        var srcSystem = self.srcSystem();
        var tgtSystem = self.tgtSystem();
        if(!srcSystem && !tgtSystem) {
          document.getElementById('srcSystemLov').messagesCustom = [{summary: 'Error', detail: 'Both source and target systems cannot be empty.'}];
          document.getElementById('tgtSystemLov').messagesCustom = [{summary: 'Error', detail: 'Both source and target systems cannot be empty.'}];
        } else {
          document.getElementById('srcSystemLov').messagesCustom = [];
          document.getElementById('tgtSystemLov').messagesCustom = [];
          //Build search URL
          var systemSearchUrl = app.apiBaseUrl + 'integrations/';
          if(srcSystem && !tgtSystem) {
            systemSearchUrl = systemSearchUrl + 'search/system/src/' + srcSystem;
          }
          if(!srcSystem && tgtSystem) {
            systemSearchUrl = systemSearchUrl + 'search/system/tgt/' + tgtSystem;
          }
          if(srcSystem && tgtSystem) {
            systemSearchUrl = systemSearchUrl + 'search/system/src/' + srcSystem + '/tgt/' + tgtSystem;
          }
          $.ajax({
            type: 'GET',
            url: systemSearchUrl,
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
      }
      //Reset system search form
      self.resetSystemSearch = function(event) {
        self.srcSystem(null);
        self.tgtSystem(null);
        document.getElementById('srcSystemLov').messagesCustom = [];
        document.getElementById('tgtSystemLov').messagesCustom = [];
      }


      //Integrations table selection listener
      self.integrationsTblSelctionListener = function(event) {
        var interfaceId = null;
        event.detail.value.row.values().forEach(key => {
          interfaceId = key;
        });
      
        if(interfaceId != undefined) {
          $.each(self.integrationsList(), function(id, integration) {
            if(integration.interfaceId == interfaceId) {
              app.selectedIntegration(integration);
              self.servicesList(integration.services);
            }
          });
        }
      }

      // Service list dialog
      self.openServicesListDialog = function(event) {
        self.servicesDialogDataSource(new ArrayDataProvider(self.servicesList, {idAttribute: 'serviceId'}));
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
