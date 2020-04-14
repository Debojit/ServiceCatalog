/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojmodule-element-utils', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojrouter', 'ojs/ojarraydataprovider', 'ojs/ojknockouttemplateutils', 'ojs/ojoffcanvas', 'ojs/ojmodule-element', 'ojs/ojknockout'],
  function(ko, moduleUtils, ResponsiveUtils, ResponsiveKnockoutUtils, Router, ArrayDataProvider, KnockoutTemplateUtils, OffcanvasUtils) {
     function ControllerViewModel() {
        var self = this;

        self.KnockoutTemplateUtils = KnockoutTemplateUtils;

        // Handle announcements sent when pages change, for Accessibility.
        self.manner = ko.observable('polite');
        self.message = ko.observable();
        document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

        function announcementHandler(event) {
          setTimeout(function() {
            self.message(event.detail.message);
            self.manner(event.detail.manner);
          }, 200);
        };

      // Media queries for repsonsive layouts
      var smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);

       // Router setup
       self.router = Router.rootInstance;
       self.router.configure({
        'login': {'label': 'Login', isDefault: true},
         'integrations': {label: 'Integrations'},
         'integrationDetails': {label: 'Integration Details'},
         'services': {label: 'Services'},
         'serviceDetails': {label: 'Service Details'}
       });
      Router.defaults['urlAdapter'] = new Router.urlParamAdapter();

      self.loadModule = function () {
        self.moduleConfig = ko.pureComputed(function () {
          var name = self.router.moduleConfig.name();
          var viewPath = 'views/' + name + '.html';
          var modelPath = 'viewModels/' + name;
          return moduleUtils.createConfig({ viewPath: viewPath,
            viewModelPath: modelPath, params: { parentRouter: self.router } });
        });
      };

      // Navigation setup
      var navData = [
      {name: 'Integrations', id: 'integrations',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-catalog-icon-24'},
      {name: 'Services', id: 'services',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-library-icon-24'}
      ];
      self.navDataProvider = new ArrayDataProvider(navData, {keyAttributes: 'id'});
      
      // Called by navigation drawer toggle button and after selection of nav drawer item
      // self.toggleDrawer = function () {
      //     return OffcanvasUtils.toggle(self.drawerParams);
      // }
      // Add a close listener so we can move focus back to the toggle button when the drawer closes
      //document.getElementById('navDrawer').addEventListener("ojclose", document.getElementById('drawerToggleButton').focus());

      // Header
      // Application Name used in Branding Area
      self.appName = ko.observable("Enterprise Catalogue Management");
      // User Info used in Global Navigation area
      self.userLogin = ko.observable("john.hancock@oracle.com");

      //Global variables
      self.selectedIntegration = ko.observable();
      self.selectedService = ko.observable();
      self.navHistory = ko.observableArray();
      self.apiBaseUrl = 'https://localhost:7102/enterprise-service-catalogue/resources/';
      //END global variables

      // Footer
      function footerLink(name, id, linkTarget) {
        this.name = name;
        this.linkId = id;
        this.linkTarget = linkTarget;
      }
      self.footerLinks = ko.observableArray([
        new footerLink('About Oracle', 'aboutOracle', 'http://www.oracle.com/us/corporate/index.html#menu-about'),
        new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
        new footerLink('Legal Notices', 'legalNotices', 'http://www.oracle.com/us/legal/index.html'),
        new footerLink('Terms Of Use', 'termsOfUse', 'http://www.oracle.com/us/legal/terms/index.html'),
        new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'http://www.oracle.com/us/legal/privacy/index.html')
      ]);
     }

     return new ControllerViewModel();
  }
);
