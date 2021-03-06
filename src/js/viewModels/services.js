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

    function ServicesViewModel() {
      var self = this;
      
      self.servicesList = ko.observableArray();
      self.integrationsList = ko.observableArray();
      self.integrationsDialogDataSource = ko.observable();
      
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

      //Get all services
      self.getAllServices = function() {
        $.ajax({
          type: 'GET',
          url: app.apiBaseUrl + 'services',
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
      }
      self.getAllServices();
      self.servicesDataSource = new PagingDataProviderView(new oj.ArrayDataProvider(self.servicesList, {idAttribute: 'serviceId'}));
      
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
            primarySearchUrl = app.apiBaseUrl + 'integrations/' + self.identifierValue() + '/services';
            
          } else if(self.identifierTypeInput() == 'services') { //Keyword based search
            primarySearchUrl = app.apiBaseUrl + 'services/' + self.identifierValue();
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
                  response = [response];
                } 
                self.servicesList(response);
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
          var domainSearchUrl = app.apiBaseUrl + 'services/';
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
              self.servicesList.removeAll();
              if(response) {
                if(!Array.isArray(response)) {
                  response = [response];
                }
                self.servicesList(response);
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
      
      //Table selection listener
      self.servicesTblSelctionListener = function(event) {
        var serviceId = null;
        event.detail.value.row.values().forEach(key => {
          serviceId = key;
        });
        
        if(serviceId != undefined) {
          $.each(self.servicesList(), function(id, service) {
            if(service.serviceId == serviceId) {
              app.selectedService(service);
              self.integrationsList(service.integrations);
            }
          });
        }
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
          var systemSearchUrl = app.apiBaseUrl + 'services/';
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
              self.servicesList.removeAll();
              if(response) {
                if(!Array.isArray(response)) {
                  response = [response];
                }
                self.servicesList(response);
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

      // Integrations List Dialog 
      self.openIntegrationsListDialog = function(event) {
        self.integrationsDialogDataSource(new ArrayDataProvider(self.integrationsList, {idAttribute: 'interfaceId'}));
        document.getElementById('integrationsListDialog').open();
      }

      self.closeIntegrationsListDialog = function(event) {
        document.getElementById('integrationsListDialog').close();
      }

      //Open Service Details
      self.openServiceDetailsView = function(event) {
        setTimeout(function() {
          app.navHistory.push('services');
          self.router = oj.Router.rootInstance.go('serviceDetails');
        });
      }
      
      //Open integration details view
      self.openIntegrationDetailsView = function(ojEvent, jqEvent) {
        var url =  app.apiBaseUrl + 'integrations/' + jqEvent.currentTarget.text;
        $.ajax({
          type: 'GET',
          url: url,
          beforeSend: function(xhr) {
              xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
          },
          dataType: 'json',
          success: function(response) {
            app.selectedIntegration(response);
            app.navHistory.push('services');
            self.router = oj.Router.rootInstance.go('integrationDetails');
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
