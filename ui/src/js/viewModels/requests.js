/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your requests ViewModel code goes here
 */
define(['ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlistview', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker', 'ojs/ojdialog',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol'],
        function (oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider, ResponsiveUtils, ResponsiveKnockoutUtils) {

            function RequestsViewModel() {
                var self = this;

                self.connected = function () {
                    accUtils.announce('Requests page loaded.');
                    document.title = "Requests";

                    // observable for medium screens (above 768px)
                    var mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
                    self.mediumDisplay = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

                    self.selectedDecisionFilterDisplay = ko.observable('decisionFilterAll');
                    self.requestsDataProvider = ko.observable();
                    self.updateRequestsDataProvider = function(requestsValues) {
                        var sortCriteria = {key: 'type_name', direction: 'ascending'};
                        var arrayDataSource = new oj.ArrayTableDataSource(requestsValues, {idAttribute: 'id'});
                        arrayDataSource.sort(sortCriteria);                            
                        self.requestsDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                    };

                    self.requestsValues = ko.observableArray();
                    self.renderer1 = oj.KnockoutTemplateUtils.getRenderer("decisionMade_tmpl", true);
                    self.requestsTableColumns = [
                        {headerText: 'TYPE', field: "type_name"},
                        {headerText: 'NAME', field: "client_name"},
                        {headerText: 'TARGET DATE', field: "requestTargetDate", sortProperty: "requestTargetDateRaw"},
                        {headerText: 'DATE NEEDED', field: "requestDateNeeded", sortProperty: "requestDateNeededRaw"},
                        {headerText: 'ORGANIZATION', field: "source_organization_name"},
                        {headerText: 'DECISION MADE', renderer: self.renderer1, sortProperty: "requestSelectedDecision"}                        
                    ];

                    self.offerTypesCategoriesValues = ko.observableArray();
                    self.offerTypesCategoriesArray = ko.observableArray([]);
                    self.offerTypesCategoriesDataProvider = ko.observable();

                    self.offerTypesValues = ko.observableArray();
                    self.offerTypesArray = ko.observableArray([]);
                    self.offerTypesDataProvider = ko.observable();

                    self.decisionStatus = ko.observable(null);
                    self.disableSaveButton = ko.observable(true);
                    self.requestNotesUpdateVal = ko.observable("");                    
                    
                    self.selectedDecisionDisplay = ko.observableArray([]);
                    self.requestRowSelected = ko.observableArray();
                    self.requestSelected = ko.observable("");
                    self.offerTypesCategorySelected = ko.observable("");
                    self.offerTypeSelected = ko.observable("");
                    self.targetDateConvertor = ko.observable();
                    self.dateNeededConvertor = ko.observable();
                    self.showPanel = ko.computed(function () {
                        if (self.requestRowSelected().length) {
                            return true;
                        }
                    }, this);

                    var primaryHandlerLogic = function() {
                        self.handleSelectedDecisionFilterChanged = function () {
                            var activeFilters = {};
                            //filter decisionFilters search                        
                            activeFilters.decisionFilter = self.selectedDecisionFilterDisplay();
                            console.log(activeFilters);

                            var requestArray = self.requestsValues().filter(function(item) {
//                                    console.log(item);
                                if (activeFilters["decisionFilter"] === "decisionFilterAll") {
                                    return true;
                                } else if (activeFilters["decisionFilter"] === "decisionFilterCompleted") {
                                    if (item["complete"] === "Y") {
                                        return true;
                                    }
                                } else {
                                    var cleanRequestSelectedDecisionItem = "decisionFilter" + item["requestSelectedDecision"];                                    
                                    //pick up detected active filters - 1x array toString (decisionFilters)
                                    if (cleanRequestSelectedDecisionItem.indexOf(activeFilters["decisionFilter"]) >= 0) {
                                        return true;
                                    }
                                }
                            });
                            console.log(requestArray);

                            //update requestsDataProvider                      
                            self.updateRequestsDataProvider(requestArray);
                        };
                        
                        self.handleRequestRowChanged = function (event) {
                            if (event.detail.value[0] !== undefined) {
                                //find whether node exists based on selection
                                function searchNodes(nameKey, myArray){
                                    for (var i=0; i < myArray.length; i++) {
                                        if (myArray[i].id === nameKey) {
                                            return myArray[i];
                                        }
                                    }
                                };
                                if (event.target.id === "requestsListview") {
                                    self.requestSelected(searchNodes(event.target.currentItem, self.requestsValues()));                                    
                                } else if (event.target.id === "requestsTable") {
                                    self.requestSelected(searchNodes(event.target.currentRow.rowKey, self.requestsValues()));                                    
                                }
                                console.log(self.requestSelected());

                                var calculateCategory = utils.calculateCategory(self.requestSelected().type_name, self.offerTypesValues(), self.offerTypesCategoriesValues());
                                self.offerTypesCategorySelected(calculateCategory);

                                if (self.requestSelected().requestSelectedDecision === "Accepted") {
                                    self.selectedDecisionDisplay(['decisionAgree']);
                                } else if (self.requestSelected().requestSelectedDecision === "Rejected") {
                                    self.selectedDecisionDisplay(['decisionUnable']);
                                } else {
                                    self.selectedDecisionDisplay([]);
                                    self.disableSaveButton(true);
                                }

                                if (self.requestSelected().requestTargetDateRaw) {
                                    self.targetDateConvertor(new Date(self.requestSelected().requestTargetDateRaw).toISOString());
                                } else {
                                    self.targetDateConvertor("");
                                }
                                if (self.requestSelected().requestDateNeededRaw) {
                                    self.dateNeededConvertor(new Date(self.requestSelected().requestDateNeededRaw).toISOString());
                                } else {
                                    self.dateNeededConvertor("");
                                }

                                if (self.requestSelected().request_response_notes) {
                                    self.requestNotesUpdateVal(self.requestSelected().request_response_notes);
                                } else {
                                    self.requestNotesUpdateVal("");
                                }
                            }
                        };

                        self.handleOfferTypesCategoryChanged = function(event) {
                            if (event.target.value !== "") {
                                _getOfferTypesFromCategoryAjax(event.target.value);
                            }
                        };
                        _getOfferTypesFromCategoryAjax = function(code) {
                            self.offerTypesArray([]);
                            //GET /rest/offer_type_categories/{code}/offer_types - REST
                            return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPE_CATEGORIES)}/${code}/offer_types`)
                                .then(
                                    success = function (response) {
                                        console.log(response.offer_types);
                                        self.offerTypesValues(response.offer_types);
                                    },
                                    error = function (response) {
                                        console.log(`Offer Types from Category "${code}" not loaded`);
                                }).then(function () {
                                    //find all names
                                    for (var i = 0; i < self.offerTypesValues().length; i++) {
                                        self.offerTypesArray().push({
                                            "value": self.offerTypesValues()[i].type,
                                            "label": self.offerTypesValues()[i].name
                                        });
                                    };
                                    //sort nameValue alphabetically
                                    utils.sortAlphabetically(self.offerTypesArray(), "value");
                                    self.offerTypesDataProvider(new ArrayDataProvider(self.offerTypesArray(), { keyAttributes: 'value' }));
                                }).then(function () {
                                    self.offerTypeSelected(self.offerTypesArray()[0].value);
                                })
                            );
                        };
                    }();

                    var agreeDialogLogic = function() {
                        self.targetDatePlaceholder = ko.observable("Please select a decision");
                        self.handleSelectedDecisionChanged = function (event) {
                            if (event.detail.updatedFrom === "internal") {
                                //button toggle
                                if (event.detail.value.length === 2) {
                                    var decisionArray = event.detail.value;
                                    decisionArray = decisionArray.filter(function(value) {
                                        return value !== event.detail.previousValue[0];
                                    });
                                    self.selectedDecisionDisplay(decisionArray);
                                };
                                //#agreeDialog, targetDate and #saveButton behaviour
                                if (self.selectedDecisionDisplay()[0] === 'decisionAgree') {
                                    document.getElementById('agreeDialog').open();
                                    self.targetDatePlaceholder("Please select target date");
                                    self.decisionStatus("Y");
                                    self.disableSaveButton(false);
                                } else if (self.selectedDecisionDisplay()[0] === 'decisionUnable') {
                                    self.targetDateConvertor("");
                                    self.targetDatePlaceholder("No target date");
                                    self.decisionStatus("N");
                                    self.disableSaveButton(false);
                                } else if (!self.selectedDecisionDisplay()[0]) {
                                    self.targetDateConvertor("");
                                    self.targetDatePlaceholder("Please select a decision");
                                    self.requestNotesUpdateVal(self.requestSelected().request_response_notes);
                                    self.disableSaveButton(true);
                                };
                            };
                        };

                        self.requestNotesUpdateRawVal = ko.observable("");
                        self.handleRequestNotesUpdateChanged = function(event) {
                            //protect initial load
                            if (event.detail.originalEvent) {
                                self.requestNotesUpdateVal(self.requestNotesUpdateRawVal());
                            }
                        };

                        self.disableOKButton = ko.observable(true);
                        self.handleTargetDateChanged = function (event) {
                            if (event.target.value !== null) {
                                self.disableOKButton(false);
                            } else {
                                self.disableOKButton(true);
                            }
                        };
                        self.closeAgreeModalButton = function (event) {
                            if (event.target.id === "cancelButton") {
                                self.selectedDecisionDisplay([]);
                                //same as self.handleSelectedDecisionChanged() (!self.selectedDecisionDisplay()[0]) above
                                self.targetDateConvertor("");
                                self.targetDatePlaceholder("Please select a decision");
                                self.requestNotesUpdateVal(self.requestSelected().request_response_notes);
                                self.disableSaveButton(true);
                            };
                            document.getElementById('agreeDialog').close();
                        };
                    }();

                    var postData = function() {
                        self.fileContentPosted = ko.observable(true);
                        self.postText = ko.observable();
                        self.postTextColor = ko.observable();
                        self.saveButton = function () {
                            //locale "en-GB" - change UTC to YYYY-MM-DD
                            _formatDate = function(inputDate) {
                                if (inputDate !== null) {
                                    return inputDate.split('T')[0];
                                } else {
                                    return null;
                                }
                            };

                            var responseJson = {
                                agreed: self.decisionStatus(),
                                complete: self.requestSelected().complete,
                                id: self.requestSelected().id,
                                request_response_notes: $('#textareaEditRequestNotes')[0].value,
                                target_date: _formatDate($('#datepickerEditTargetDate')[0].value)
                            };

                            self.fileContentPosted(false);
                            self.disableSaveButton(true);
                            //POST /rest/need_requests - REST
                            return $.when(restClient.doPost(restUtils.constructUrl(restUtils.EntityUrl.NEED_REQUESTS), responseJson)
                                .then(
                                    success = function (response) {
                                        self.postText("You have succesfully saved the request.");
                                        self.postTextColor("green");
                                        console.log("data posted");
                                        
                                        //update requestsTable
                                        self.selectedDecisionFilterDisplay('decisionFilterAll');                                        
                                        self.getRequestsAjax();
                                    },
                                    error = function (response) {
                                        self.postText("Error: Request not saved.");
                                        self.postTextColor("red");
                                        console.log("data not posted");
                                }).then(function () {
                                    self.fileContentPosted(true);
                                    $("#postMessage").css('display', 'inline-block').fadeOut(2000, function(){
                                        self.disableSaveButton(false);
                                    });
                                }).then(function () {
                                    console.log(responseJson);
                                })
                            );
                        };
                    }();

                    var getData = function () {
                        self.getRequestsAjax = function() {
                            self.requestsLoaded = ko.observable();
                            self.requestsValid = ko.observable();

                            self.requestsValues([]);
                            //GET /rest/requests - REST
                            self.requestsLoaded(false);
                            return $.when(restClient.doGet(restUtils.constructUrl(restUtils.EntityUrl.NEED_REQUESTS))
                                .then(
                                    success = function (response) {
                                        console.log(response.need_request);
                                        $.each(response.need_request, function(index, item) {
                                            var targetDateCleansed;
                                            var targetDateCleansedLocale;
                                            if (this.target_date) {
                                                //no need to split as UTC anyway
                                                targetDateCleansed = new Date(this.target_date);
                                                targetDateCleansedLocale = targetDateCleansed.toLocaleDateString();
                                            }
                                            var dateNeededCleansed;
                                            var dateNeededCleansedLocale;
                                            if (this.date_needed) {
                                                //no need to split as UTC anyway
                                                dateNeededCleansed = new Date(this.date_needed);
                                                dateNeededCleansedLocale = dateNeededCleansed.toLocaleDateString();
                                            }
                                            
                                            var decisionString = "";
                                            var styleState = "";
                                            if (this.agreed === "Y") {
                                                decisionString = "Accepted";
                                                styleState = "#18BE94"; //green
                                            } else if (this.agreed === "N") {
                                                decisionString = "Rejected";                                                
                                            } else {
                                                decisionString = "Unreviewed";                                                                                                
                                                styleState = "#309fdb"; //blue                                                                          
                                            };
                                            self.requestsValues().push({
                                                requestTargetDateRaw: targetDateCleansed,
                                                requestTargetDate: targetDateCleansedLocale,
                                                requestDateNeededRaw: dateNeededCleansed,
                                                requestDateNeeded: dateNeededCleansedLocale,
                                                requestSelectedDecision: decisionString,
                                                styleState: styleState,
                                                client_name: this.client_name,
                                                client_need_id: this.client_need_id,
                                                client_postcode: this.client_postcode,
                                                complete: this.complete,
                                                id: this.id,
                                                need_notes: this.need_notes,
                                                request_organization_id: this.request_organization_id,
                                                request_response_notes: this.request_response_notes,
                                                source_organization_name: this.source_organization_name,
                                                type_name: this.type_name
                                            });
                                        });

                                        self.requestsValid(true);
                                    },
                                    error = function (response) {
                                        console.log("Requests not loaded");
                                        self.requestsValid(false);
                                }).then(function () {
                                    self.updateRequestsDataProvider(self.requestsValues());
                                }).then(function () {
                                    self.requestsLoaded(true);
                                })
                            );
                        };

                        function getOfferTypesCategoriesAjax() {
                            //GET /rest/offer_type_categories - REST
                            return $.when(restClient.doGet(restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPE_CATEGORIES))
                                .then(
                                    success = function (response) {
                                        console.log(response.offer_type_categorys);
                                        self.offerTypesCategoriesValues(response.offer_type_categorys);
                                    },
                                    error = function (response) {
                                        console.log("Offer Types Categories not loaded");
                                }).then(function () {
                                    //find all names
                                    for (var i = 0; i < self.offerTypesCategoriesValues().length; i++) {
                                        self.offerTypesCategoriesArray().push({
                                            "value": self.offerTypesCategoriesValues()[i].code,
                                            "label": self.offerTypesCategoriesValues()[i].name
                                        });
                                    };
                                    //sort nameValue alphabetically
                                    utils.sortAlphabetically(self.offerTypesCategoriesArray(), "value");
                                    self.offerTypesCategoriesDataProvider(new ArrayDataProvider(self.offerTypesCategoriesArray(), { keyAttributes: 'value' }));
                                }).then(function () {
                                })
                            );
                        };

                        Promise.all([self.getRequestsAjax()])
                        .then(function () {
                            Promise.all([getOfferTypesCategoriesAjax()])
                        })
                        .catch(function () {
                            //even if error remove loading bar
                            self.requestsLoaded(true);
                        });
                    }();
                };

                self.disconnected = function () {
                    // Implement if needed
                };

                self.transitionCompleted = function () {
                    // Implement if needed
                };
            }

            return RequestsViewModel;
        }
);
