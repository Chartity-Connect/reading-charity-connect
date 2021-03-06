/**
 * @license
 * Copyright (c) 2014, 2019, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your offers ViewModel code goes here
 */
define(['appController', 'ojs/ojrouter', 'ojs/ojcore', 'knockout', 'jquery', 'accUtils', 'utils', 'restClient', 'restUtils', 'ojs/ojarraydataprovider',
    'ojs/ojprogress', 'ojs/ojbutton', 'ojs/ojlabel', 'ojs/ojinputtext', 'ojs/ojselectsingle', 'ojs/ojdatetimepicker',
    'ojs/ojarraytabledatasource', 'ojs/ojtable', 'ojs/ojpagingtabledatasource', 'ojs/ojpagingcontrol', 'ojs/ojvalidation-datetime', 'ojs/ojdialog'],
    function (app, Router, oj, ko, $, accUtils, utils, restClient, restUtils, ArrayDataProvider) {

        function OffersViewModel() {
            var self = this;
            utils.getSetLanguage();

            if (app.currentOrg.manage_offers != "Y") {
                return;
            }

            var router = Router.rootInstance;
            var stateParams = router.observableModuleConfig().params.ojRouter.parameters;
            var offerIdIn = stateParams.offerId();
            self.connected = function () {
                accUtils.announce('Offers page loaded.');
                document.title = "Add Offers";

                self.offersValues = ko.observableArray();
                self.offersDataProvider = ko.observable();

                self.offerTypesCategoriesValues = ko.observableArray();
                self.offerTypesCategoriesArray = ko.observableArray([]);
                self.offerTypesCategoriesDataProvider = ko.observable();

                self.offerTypesValues = ko.observableArray();
                self.offerTypesArray = ko.observableArray([]);
                self.offerTypesDataProvider = ko.observable();

                self.disableSelectEditType = ko.observable(true);

                self.addOfferButtonSelected = ko.observableArray([]);
                self.offerTypesCategorySelected = ko.observable("");
                self.cancelButtonName = ko.observable("Cancel");
                self.offerId = ko.observable(offerIdIn);
                self.offerName = ko.observable("");
                self.rawQuantityValue = ko.observable();
                self.quantity = ko.observable();
                self.category_id = ko.observable("");
                self.type_id = ko.observable("");
                self.postcode = ko.observable("");
                self.rawDistanceValue = ko.observable();
                self.distance = ko.observable(null);
                self.startDate = ko.observable("");
                self.endDate = ko.observable("");
                self.notes = ko.observable("");
                self.updateDate = ko.observable("");
                self.updatedBy = ko.observable("");
                self.typeVal = "";

                self.cancelButton = function (event) {
                    router.go('offers');
                }

                self.dateConverter = ko.observable(oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).
                    createConverter(
                        {
                            pattern: "dd/MM/yyyy"
                        }));


                self.getOfferTypesFromCategoryAjax = function (id) {
                    self.offerTypesArray([]);
                    if (id === null) {
                        return;
                    }
                    //GET /rest/offer_type_categories/{id}/offer_types - REST
                    return $.when(restClient.doGet(`${restUtils.constructUrl(restUtils.EntityUrl.OFFER_TYPE_CATEGORIES)}/${id}/offer_types`)
                        .then(
                            success = function (response) {
                                console.log(response.offer_types);
                                self.offerTypesValues(response.offer_types);
                            },
                            error = function (response) {
                                console.log(`Offer Types from Category "${id}" not loaded`);
                            }).then(function () {
                                //find all names
                                for (var i = 0; i < self.offerTypesValues().length; i++) {
                                    self.offerTypesArray().push({
                                        "value": self.offerTypesValues()[i].id,
                                        "label": self.offerTypesValues()[i].name
                                    });
                                };
                                //sort nameValue alphabetically
                                utils.sortAlphabetically(self.offerTypesArray(), "label");
                                self.offerTypesDataProvider(new ArrayDataProvider(self.offerTypesArray(), { keyAttributes: 'value' }));
                            }).then(function () {
                                if (self.typeVal != "") {
                                    self.type_id(self.typeVal);
                                } else {
                                    self.type_id(self.offerTypesArray()[0].value);
                                }
                            })
                    );
                };

                self.openConfirmDeleteDialog = function () {
                    document.getElementById('confirmDeleteDialog').open();
                }
                self.closeConfirmDeleteDialog = function () {
                    document.getElementById('confirmDeleteDialog').close();
                }
                self.closeSucessfulDeleteDialog = function () {
                    document.getElementById('successfulDeleteDialog').close();
                    router.go('offers');
                }

                self.populateResponse = function (response) {
                    self.offerName(response.name);
                    self.quantity(parseInt(response.quantity));
                    if (response.hasOwnProperty('category_id')) {
                        self.category_id(response.category_id);
                    }
                    self.typeVal = response.type_id;
                    self.postcode(response.postcode);
                    if (response.distance != null) {
                        self.distance(parseFloat(response.distance));
                    }
                    self.startDate(response.date_available);
                    self.endDate(response.date_end);
                    self.notes(response.details);
                    if (response.update_date) {
                        updateDt = new Date(response.update_date.replace(/-/g, '/'));
                        self.updateDate(updateDt.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' }) + " " + updateDt.toLocaleDateString("en-GB"));
                    } else {
                        self.updateDate("unknown");
                    }
                    self.updatedBy(response.updated_by);
                    self.offerId(response.id);
                    this.cancelButtonName("Close");
                }

                self.clearResponse = function () {

                    self.offerName("");
                    self.quantity();
                    self.typeVal = "";
                    self.category_id(null);
                    self.type_id("");
                    self.postcode("");
                    self.distance(null);
                    self.startDate("");
                    self.endDate("");
                    self.notes("");
                    self.updateDate("");
                    self.updatedBy("");
                    self.offerId(null);
                    this.cancelButtonName("Cancel");
                }


                self.handleOfferTypesCategoryChanged = function (event) {
                    if (event.target.value !== "") {
                        self.getOfferTypesFromCategoryAjax(event.target.value);
                        self.disableSelectEditType(false);
                    }
                };


                var postData = function () {
                    self.fileContentPosted = ko.observable(true);
                    self.postText = ko.observable();
                    self.postTextColor = ko.observable();
                    self.disableSaveButton = ko.observable(false);
                    self.saveButton = function () {
                        var element1 = document.getElementById('inputEditName');
                        var element2 = document.getElementById('selectEditCategory');
                        var element3 = document.getElementById('selectEditType');
                        var element4 = document.getElementById('inputEditQuantity');
                        var element5 = document.getElementById('datepickerEditDateAvailable');

                        if (self.offerName().length < 1 || self.type_id().length < 1 || self.quantity() == null || self.startDate().length < 1) {
                            element1.showMessages();
                            element2.showMessages();
                            element3.showMessages();
                            element4.showMessages();
                            element5.showMessages();
                            self.postTextColor("red");
                            self.postText("Error: Offer not saved.");
                            self.fileContentPosted(true);
                            $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                self.disableSaveButton(false);
                            });

                            return;

                        }

                        var isNumber = function (str) { return !isNaN(str.toString().replace(/[,.]/g, '')); }

                        if (self.distance() < 0 || self.distance() >= 10000 || !isNumber(String(self.rawDistanceValue()))) {
                            self.postTextColor("red");
                            self.postText("Error: Distance not valid.");
                            self.fileContentPosted(true);
                            $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                self.disableSaveButton(false);
                            });

                            return;

                        }


                        if (self.quantity() == null || self.rawQuantityValue() == null || self.quantity() == "" || self.rawQuantityValue() == "" || self.quantity() < 1 || self.quantity() >= 100000000000 || !isNumber(String(self.rawQuantityValue())) || !isNumber(String(self.quantity()))) {
                            self.postTextColor("red");
                            self.postText("Error: Quantity not valid.");
                            self.fileContentPosted(true);
                            $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                self.disableSaveButton(false);
                            });

                            return;

                        }

                        console.log(self.rawQuantityValue());

                        //locale "en-GB" - change UTC to YYYY-MM-DD
                        _formatDate = function (inputDate) {
                            if (inputDate !== null) {
                                return inputDate.split('T')[0];
                            } else {
                                return null;
                            }
                        };
                        var responseJson = {
                            id: self.offerId(),
                            date_available: self.startDate(),
                            date_end: self.endDate() === "" ? null : self.endDate(),
                            details: self.notes().length < 1 ? " " : self.notes(),
                            distance: self.distance(),
                            name: self.offerName(),
                            postcode: self.postcode() === "" ? null : self.postcode(),
                            quantity: self.quantity(),
                            type_id: self.type_id()
                        };
                        console.log(responseJson);

                        self.fileContentPosted(false);
                        self.disableSaveButton(true);
                        //POST /rest/offers - REST
                        return $.when(restClient.doPostJson(restUtils.constructUrl(restUtils.EntityUrl.OFFERS), responseJson)
                            .then(
                                success = function (response) {
                                    self.postText("You have successfully saved the offer.");
                                    self.postTextColor("green");
                                    console.log("data posted");
                                    self.populateResponse(response);
                                    //update offersTable
                                    // self.getOffersAjax();
                                },
                                error = function (response) {
                                    self.postText("Error: Offer not saved.");
                                    self.postTextColor("red");
                                    console.log("data not posted");
                                }).then(function () {
                                    self.fileContentPosted(true);
                                    $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                        self.disableSaveButton(false);
                                    });
                                }).then(function () {
                                    console.log(responseJson);
                                })
                        );
                    };

                    self.deleteOffer = function () {
                        return $.when(restClient.doDeleteJson('/rest/offers/' + self.offerId())
                            .then(
                                success = function (response) {
                                    document.getElementById('confirmDeleteDialog').close();
                                    document.getElementById('successfulDeleteDialog').open();
                                },
                                error = function (response) {
                                    self.postText("Error: Offer changes not deleted.");
                                    self.postTextColor("red");
                                    console.log("offer data not deleted");
                                }).then(function () {
                                    self.fileContentPosted(true);
                                    $("#postMessage").css('display', 'inline-block').fadeOut(app.messageFadeTimeout, function () {
                                        //self.disableSaveButton(false);
                                    });
                                })
                        );
                    };
                }();

                var getData = function () {
                    self.getOffersAjax = function () {
                        self.offersLoaded = ko.observable();
                        self.offersValid = ko.observable();

                        if (self.offerId() == "new") {
                            self.clearResponse();
                        } else {
                            self.offersValues([]);
                            //GET /rest/offers - REST
                            self.offersLoaded(false);
                            return $.when(restClient.doGet('/rest/offers/' + self.offerId())
                                .then(
                                    success = function (response) {
                                        console.log(response);
                                        self.populateResponse(response);
                                        var dateAvailableCleansed;
                                        var dateAvailableCleansedLocale;
                                        if (response.date_available) {
                                            //no need to split as UTC anyway
                                            dateAvailableCleansed = new Date(response.date_available);
                                            dateAvailableCleansedLocale = dateAvailableCleansed.toLocaleDateString();
                                        } else {
                                            //if new entry and nothing selected
                                            dateAvailableCleansed = "";
                                            dateAvailableCleansedLocale = "";
                                        }
                                        var dateEndCleansed;
                                        var dateEndCleansedLocale;
                                        if (response.date_end) {
                                            //no need to split as UTC anyway
                                            dateEndCleansed = new Date(response.date_end);
                                            dateEndCleansedLocale = dateEndCleansed.toLocaleDateString();
                                        } else {
                                            //if new entry and nothing selected
                                            dateEndCleansed = "";
                                            dateEndCleansedLocale = "";
                                        }

                                        self.offersValid(true);
                                    },
                                    error = function (response) {
                                        console.log("Offers not loaded");
                                        self.offersValid(false);
                                    }).then(function () {
                                        self.offersLoaded(true);
                                    })
                            );
                        }
                    };

                    function getOfferTypesCategoriesAjax() {
                        //GET /rest/offer_type_categories - REST
                        return $.when(restClient.doGet("/rest/offer_type_categories/active")
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

                    Promise.all([getOfferTypesCategoriesAjax()])
                        .then(function () {
                            Promise.all([self.getOffersAjax()])
                        })
                        .catch(function () {
                            //even if error remove loading bar
                            self.offersLoaded(true);
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

        return OffersViewModel;
    }
);
