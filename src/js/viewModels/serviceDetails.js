/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
define(['ojs/ojcore', 'knockout', 'ojs/ojbootstrap', 'appController', 'ojs/ojpagingdataproviderview', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'ojs/ojknockout', 'ojs/ojcollapsible', 'ojs/ojbutton', 'ojs/ojchart', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojinputtext', 'ojs/ojcheckboxset', 'ojs/ojformlayout', 'ojs/ojdialog', 'ojs/ojlistview', 'ojs/ojtrain', 'ojs/ojpopup', 'ojs/ojvalidationgroup'],
    function (oj, ko, Bootstrap, app, PagingDataProviderView, ArrayDataProvider, KnockoutTemplateUtils) {

        function IntegrationDetailsViewModel() {
            var self = this;

            self.errorCodePageSize = 10;
            
            self.serviceData = app.selectedService(); //Load service details object
            //Create table data sources
            self.integrationsDataSource = new oj.ArrayDataProvider(ko.observableArray(self.serviceData.integrations), { idAttribute: 'interfaceId' });
            self.touchpointsDataSource = new oj.ArrayDataProvider(ko.observableArray(self.serviceData.touchpoints), { idAttribute: 'touchpointId' });
            
            self.paginateErrorCodes = (self.serviceData.errors.length > self.errorCodePageSize);
            if(self.paginateErrorCodes) {
                self.errorCodesDataSource = new PagingDataProviderView(new oj.ArrayDataProvider(ko.observableArray(self.serviceData.errors), { idAttribute: 'errorCode'}));
            } else {
                self.errorCodesDataSource = new oj.ArrayDataProvider(ko.observableArray(self.serviceData.errors), { idAttribute: 'errorCode'})
            }
            
            //Navigate back to previous view
            self.backToPreviousView = function (event) {
                setTimeout(function () {
                    oj.Router.rootInstance.go(app.navHistory().pop());
                });
            }

            //Open integration details view
            self.openIntegrationDetailsView = function(ojEvent, jqEvent) {
                var url = app.apiBaseUrl + 'integrations/' + jqEvent.currentTarget.text;
                $.ajax({
                type: 'GET',
                url: url,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Basic d2VibG9naWM6d2VsY29tZTE=');
                },
                dataType: 'json',
                success: function(response) {
                    app.selectedIntegration(response);
                    app.navHistory.push('serviceDetails');
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
            self.connected = function () {
                document.title = 'Service Details';
                // Implement further logic if needed
            };

            /**
             * Optional ViewModel method invoked after the View is disconnected from the DOM.
             */
            self.disconnected = function () {
                // Implement if needed
            };

            /**
             * Optional ViewModel method invoked after transition to the new View is complete.
             * That includes any possible animation between the old and the new View.
             */
            self.transitionCompleted = function () {
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
