/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your admin ViewModel code goes here
 */
define(['utils','ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient','ojs/ojknockouttemplateutils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojselectsingle', 'ojs/ojcheckboxset','ojs/ojformlayout'],
        function (utils,oj, ko, $, accUtils, restClient,KnockoutTemplateUtils,ArrayDataProvider) {

            function AdminViewModel() {
                var self = this;
                utils.getSetLanguage();
                
                self.postTextColor = ko.observable();
                self.postText = ko.observable();
                self.fileContentPosted = ko.observable(true);

                self.connected = function () {
                    accUtils.announce('Admin page loaded.');
                    document.title = "Admin";

                    self.auditValues = ko.observableArray();
                    self.auditDataProvider = ko.observable();

                    self.auditTableColumns = [
                        {headerText: 'Date', field: "audit_date"},
                        {headerText: 'User', field: "display_name"},
                        {headerText: 'Action', field: "action"},
                        {headerText: 'Object', field: "object"},
                        {headerText: 'Name', field: "name"}
                    ];

                    var getData = function () {
                        self.auditLoaded = ko.observable();
                        self.auditValid = ko.observable();

                        

                        self.getauditAjax = function() {
                            //GET /rest/audit - REST
                            self.auditLoaded(false);
                            return $.when(restClient.doGet('/rest/audit')
                                .then(
                                    success = function (response) {
                                        self.auditValues(response.audit_entries);
                                        self.auditValid(true);
                                    },
                                    error = function (response) {
                                        console.log("Audit not loaded");
                                        self.auditValid(false);
                                    }).then(function () {
                                    var sortCriteria = {key: 'audit_date', direction: 'ascending'};
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.auditValues(), {idAttribute: 'id'});
                                    arrayDataSource.sort(sortCriteria);
                                    self.auditDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                    self.auditLoaded(true);
                                })
                            );
                        };

                        Promise.all([self.getauditAjax()])
                                .catch(function () {
                                //even if error remove loading bar
                                self.auditLoaded(true);
                            });
                    }();


                }




                self.disconnected = function () {
                    // Implement if needed
                };

                self.transitionCompleted = function () {
                    // Implement if needed
                };
            }

            return AdminViewModel;
        }
);
