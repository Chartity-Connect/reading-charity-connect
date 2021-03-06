/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your admin ViewModel code goes here
 */
define(['appController', 'utils', 'ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'restClient', 'ojs/ojknockouttemplateutils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojselectsingle', 'ojs/ojcheckboxset', 'ojs/ojformlayout'],
    function (app, utils, oj, ko, $, accUtils, restClient, KnockoutTemplateUtils, ArrayDataProvider) {

        function AdminViewModel() {
            var self = this;
            utils.getSetLanguage();

            self.postTextColor = ko.observable();
            self.postText = ko.observable();
            self.fileContentPosted = ko.observable(true);

            self.connected = function () {
                accUtils.announce('Admin page loaded.');
                document.title = "Admin";

                self.needTypesValues = ko.observableArray();
                self.needDetailType = ko.observable();
                self.needDetailName = ko.observable();
                self.needDetailCategory = ko.observable();
                self.needDetailDefaultText = ko.observable();
                self.needDetailActive = ko.observableArray(["active"]);
                self.needTypesDataProvider = ko.observable();
                self.needUpdateDate = ko.observable("");
                self.needUpdatedBy = ko.observable("");

                self.needTypesTableColumns = [
                    { headerText: 'Name', field: "name" },
                    { headerText: 'Category', field: "category_name" }
                ];

                self.addneedTypeButtonSelected = ko.observableArray([]);
                self.needTypeRowSelected = ko.observableArray();
                self.needTypeSelected = ko.observable("");


                self.offerTypesCategoriesValues = ko.observableArray();
                self.offerTypesCategoriesArray = ko.observableArray([]);
                self.offerTypesCategoriesDataProvider = ko.observable();

                self.showPanel = ko.computed(function () {
                    if (self.addneedTypeButtonSelected().length) {
                        // big reset!
                        self.needTypeRowSelected([]);
                        self.needTypeSelected("");
                        populateNewNeedData();
                        return true;
                    }
                    if (self.needTypeRowSelected().length) {
                        return true;
                    }
                }, this);

                function populateNeedData(params) {
                    console.log(params);
                    self.needDetailType(params.id);
                    self.needDetailName(params.name);
                    self.needDetailCategory(params.category_id);
                    self.needDetailDefaultText(params.default_text);
                    self.needDetailActive([]);
                    if (params.active === "Y" || !params.hasOwnProperty("active")) {
                        self.needDetailActive(["active"]);
                    }
                    if (params.update_date) {
                        updateDt = new Date(params.update_date.replace(/-/g, '/'));
                        self.needUpdateDate(updateDt.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " " + updateDt.toLocaleDateString("en-GB"));
                    } else {
                        self.needUpdateDate("unknown");
                    }
                    self.needUpdatedBy(params.updated_by);

                }
                function populateNewNeedData() {
                    self.needDetailType("");
                    self.needDetailName("");
                    self.needDetailCategory("");
                    self.needDetailDefaultText("");
                    self.needDetailActive([]);
                    self.needDetailActive(["active"]);

                }
                var primaryHandlerLogic = function () {
                    self.handleneedTypeRowChanged = function (event) {
                        if (event.detail.value[0] !== undefined) {
                            self.addneedTypeButtonSelected([]);

                            //find whether node exists based on selection
                            function searchNodes(nameKey, myArray) {
                                for (var i = 0; i < myArray.length; i++) {
                                    if (myArray[i].id === nameKey) {
                                        return myArray[i];
                                    }
                                }
                            };
                            self.needTypeSelected(searchNodes(event.target.currentRow.rowKey, self.needTypesValues()));
                            populateNeedData(self.needTypeSelected());
                        }
                    };

                    self.handleUserRowChanged = function (event) {
                        if (event.detail.value[0] !== undefined) {
                            self.addneedTypeButtonSelected([]);

                            //find whether node exists based on selection
                            function searchNodes(nameKey, myArray) {
                                for (var i = 0; i < myArray.length; i++) {
                                    if (myArray[i].type === nameKey) {
                                        return myArray[i];
                                    }
                                }
                            };
                            self.needTypeSelected(searchNodes(event.target.currentRow.rowKey, self.needTypesValues()));

                        }
                    };
                }();


                self.saveButton = function () {
                    // GET /rest/offer_type_categories/{code}
                    if (self.needDetailName().length < 1) {
                        var element1 = document.getElementById('inputEditName');
                        console.log(element1.showMessages());
                        self.postTextColor("red");
                        self.postText("Error: Need type not saved.");
                        self.fileContentPosted(true);
                        $(".postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                            self.disableSaveButton(false);
                        });

                        return;
                    }

                    if (self.needDetailCategory().length < 1) {
                        var element1 = document.getElementById('selectEditCategory');
                        console.log(element1.showMessages());
                        self.postTextColor("red");
                        self.postText("Error: Need type not saved.");
                        self.fileContentPosted(true);
                        $(".postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                            self.disableSaveButton(false);
                        });

                        return;
                    }

                    return $.when(restClient.doGet('/rest/offer_type_categories/' + self.needDetailCategory())
                        .then(
                            success = function (response) {
                                console.log(response.name);
                                var needData =
                                {
                                    "name": self.needDetailName(),
                                    "id": self.needDetailType() == "" ? null : self.needDetailType(),
                                    "category_id": self.needDetailCategory(),
                                    "default_text": self.needDetailDefaultText(),
                                    "active": (self.needDetailActive().length > 0) ? "Y" : "N"
                                };
                                return $.when(restClient.doPost('/rest/offer_types', needData)
                                    .then(
                                        success = function (response) {
                                            self.postText("You have successfully saved the Need Type.");
                                            self.postTextColor("green");
                                            self.getneedTypesAjax();
                                            console.log("need type data posted");
                                        },
                                        error = function (response) {
                                            self.postText("Error: Need Type changes not saved.");
                                            self.postTextColor("red");
                                            console.log("need type data not posted");
                                        }).then(function () {
                                            self.fileContentPosted(true);
                                            $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                                //self.disableSaveButton(false);
                                            });
                                        }).then(function () {
                                            //console.log(orgData);
                                        })
                                );
                            },
                            error = function (response) {
                                self.postText("Error: Type Categories data not retrieved.");
                                self.postTextColor("red");
                                console.log("type categroies data not retrieved");
                            })
                    )
                };



                var getData = function () {
                    self.needTypesLoaded = ko.observable();
                    self.needTypesValid = ko.observable();

                    self.getOfferTypesCategoriesAjax = function () {
                        // GET /rest/offer_type_categories/active - REST
                        return $.when(restClient.doGet('/rest/offer_type_categories/active')
                            .then(
                                success = function (response) {

                                    self.offerTypesCategoriesValues(response.offer_type_categorys);
                                },
                                error = function (response) {
                                    console.log("Offer Types Categories not loaded");
                                }).then(function () {
                                    //find all names
                                    for (var i = 0; i < self.offerTypesCategoriesValues().length; i++) {
                                        self.offerTypesCategoriesArray().push({
                                            "value": self.offerTypesCategoriesValues()[i].id,
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

                    self.getneedTypesAjax = function () {
                        //GET /rest/needTypes - REST
                        self.needTypesLoaded(false);
                        return $.when(restClient.doGet('/rest/offer_types')
                            .then(
                                success = function (response) {
                                    self.needTypesValues(response.offer_types);
                                    self.needTypesValid(true);
                                },
                                error = function (response) {
                                    console.log("Need Types not loaded");
                                    self.needTypesValid(false);
                                }).then(function () {
                                    var sortCriteria = { key: 'name', direction: 'ascending' };
                                    var arrayDataSource = new oj.ArrayTableDataSource(self.needTypesValues(), { idAttribute: 'id' });
                                    arrayDataSource.sort(sortCriteria);
                                    self.needTypesDataProvider(new oj.PagingTableDataSource(arrayDataSource));
                                }).then(function () {
                                    self.needTypesLoaded(true);
                                })
                        );
                    };

                    Promise.all([self.getneedTypesAjax()])
                        .then(function () {
                            Promise.all([self.getOfferTypesCategoriesAjax()])
                        })
                        .catch(function () {
                            //even if error remove loading bar
                            self.needTypesLoaded(true);
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
