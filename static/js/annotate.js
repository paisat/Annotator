/**
 * Created by sarvothampai on 04/10/16.
 */


var annotatePage = {

    tags: ['Date', 'Location'],
    annotator: null,
    existingAnnotations: [],

    init: function () {

        var annotations = {
            id: "1",
            text: "India obtuvo su independencia el 15 ago 1947, nos consiguió la independencia el 4 de julio 1776. Celebración del 4 de julio de este año fue genial.",
            rtl: false,
            translations: []
        }

        var annotations1 = {
            id: "1",
            text: "India obtuvo su independencia el 15 ago 1947, nos consiguió la independencia el 4 de julio 1776. Celebración del 4 de julio de este año fue genial.",
            rtl: false,
            translations: [
                {
                    translated: "Aug 15 1947",
                    start_index: 33,
                    end_index: 45,
                    type: "date"
                },
                {
                    translated: "July 4th 1776",
                    start_index: 80,
                    end_index: 96,
                    type: "date"
                },
                {
                    translated: "4th july",
                    start_index: 113,
                    end_index: 124,
                    type: "date"
                }
            ]
        };


        this.loadSelectLanguageDropDownBox();

        this.getAssignedDocForUser();
        var urlLanguageParam = this.getUrlParameter('lang')

        if (urlLanguageParam != null) {
            this.setSelectBoxLanguage(urlLanguageParam);
            this.getAnnotations(urlLanguageParam);
        }

        $("#saveAnnotation").click(this.saveAnnotations);
        $("#nextDocument").click(this.getNextDocument);
        $("#skipDocument").click(this.skipDocument);
        $("#modalYesBtn").click(this.modalYesButtonAction);
        $("#modalNoBtn").click(this.modalNoButtonAction);

        console.log("annotations on page");
        console.log(this.getAnnotationsOnPage());


    },

    modalYesButtonAction: function () {

        var action = $(".modal").attr('action');
        var annotationsOnPage = annotatePage.getAnnotationsOnPage();
        $.ajax({
                type: "POST",
                url: "../user/action/" + action + "/",
                data: JSON.stringify(annotationsOnPage),
                beforeSend: function (jqXHR, settings) {
                    $("#modalYesBtn").button("loading");
                },
                error: function (xhr, statusText) {
                    console.log("error");

                },
                success: function (msg) {
                    $("#modalYesBtn").button("reset");
                    var selectedLanguage = $("#language-select").val();
                    window.location.href = "../index?lang=" + selectedLanguage;

                }
            }
        );


    },

    modalNoButtonAction: function () {

        var action = $(".modal").attr('action');

        if (action == "next") {
            $(".modal").modal('hide');
        }
        else if (action == "skip") {
            $(".modal").modal('hide');
        }

    },

    getNextDocument: function () {

        annotatePage.showModal("Go to Next Document ?", "Go To Next Doc", "Stay on this Doc", "You are about to go to next Document", "next");

    },

    skipDocument: function () {


        annotatePage.showModal("Skip Document", "Yes", "No", "You are about to skip document. All your saved annotations will be lost ", "skip");
        console.log("action")
        console.log($(".modal").attr('action'));

    },

    getAssignedDocForUser: function () {

        var response = $.ajax({
            type: "GET",
            url: "../user/document/",
            beforeSend: function (jqXHR, settings) {

                annotatePage.toggleLoadingForSelectBar(true);

            },
            error: function (xhr, statusText) {
                console.log("error");

            },
            success: function (msg) {
                response = JSON.parse(msg);
                annotatePage.toggleLoadingForSelectBar(false);

                if (response.length != 0) {
                    annotatePage.loadAnnotator(response);
                    annotatePage.setSelectBoxLanguage(response[0].language);
                }

            }
        });
    },

    toggleLoadingForSelectBar: function (show) {

        if (show) {
            $("#loadingSelect").show();
            $("#language-select").prop("disabled", true);
        }
        else {
            $("#loadingSelect").hide();
            $("#language-select").prop("disabled", false);
        }

    },

    loadSelectLanguageDropDownBox: function () {

        var languages = this.getLanguageList();
        $("#language-select").select2({
            data: languages
        });

        $("#language-select").select2("val", null);
        $("#language-select").on("select2:select", this.onLanguageSelect)

    },

    setSelectBoxLanguage: function (language) {
        $("#language-select").select2("val", language);
    },

    getLanguageList: function () {

        var languages = [
            {
                "id": "ru",
                "text": "Russian"
            },
            {
                "id": "es",
                "text": "Spanish"
            },
            {
                "id": "de",
                "text": "German"
            },
            {
                "id": "fr",
                "text": "French"
            },

        ]

        return languages

    },

    onLanguageSelect: function (e) {

        var selectedLanguage = $(this).val();
        console.log(annotatePage.existingAnnotations);
        console.log(annotatePage.getAnnotationsOnPage().length);

        if (!(annotatePage.existingAnnotations.length == 0 && annotatePage.getAnnotationsOnPage().length == 0 )) {
            // annotatePage.showModal("dasa","sasa","sasa","sasa","skip");
            console.log("show modal");
            annotatePage.showModal("sasa", "sas", "sasa", "sasa", "sasa");

        }
        else {
            annotatePage.getAnnotations(selectedLanguage);
        }


    },

    showModal: function (title, yesMessage, noMessage, messageBody, action) {

        $(".modal .modal-title").html(title);
        $(".modal .modal-body").html(messageBody);
        $(".modal #noBtn").text(noMessage);
        $(".modal #yesBtn").text(yesMessage);
        $(".modal").attr('action', action);

        $("#confirmModal").modal('show');


    },

    getAnnotations: function (language) {


        var annotations1 = {
            id: "1",
            text: "India obtuvo su independencia el 15 ago 1947, nos consiguió la independencia el 4 de julio 1776. Celebración del 4 de julio de este año fue genial.",
            rtl: false,
            translations: [
                {
                    translated: "Aug 15 1947",
                    start_index: 33,
                    end_index: 45,
                    type: "date"
                },
                {
                    translated: "July 4th 1776",
                    start_index: 80,
                    end_index: 96,
                    type: "date"
                },
                {
                    translated: "4th july",
                    start_index: 113,
                    end_index: 124,
                    type: "date"
                }
            ]
        };


        $.ajax({
                type: "GET",
                url: "../user/language/" + language + "/",
                beforeSend: function (jqXHR, settings) {
                    annotatePage.toggleLoadingForSelectBar(true);
                },
                error: function (xhr, statusText) {
                    console.log("error");

                },
                success: function (msg) {
                    var response = JSON.parse(msg);
                    console.log(response);
                    annotatePage.toggleLoadingForSelectBar(false);
                    annotatePage.loadAnnotator(response);

                }
            }
        );

    },


    displayErrorMessage: function (errorMsg) {


        $("#error-alert strong").html(errorMsg);
        $("#error-alert").show();

    },

    getUrlParameter: function (sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    },


    loadAnnotator: function (textAnnotations) {

        console.log(textAnnotations);

        if (textAnnotations.length == 0) {
            $("#noResults").show();
            return;
        }

        $("#noResults").hide();

        textAnnotations = textAnnotations[0];

        this.setUpAnnotator(textAnnotations.text);

        if (textAnnotations.rtl) {
            $("#annotatedText").addClass("rtl");
        }

        var annotations = [];
        var indexToTypeDictionary = {};

        $.each(textAnnotations.translations, function (index, val) {

            console.log(val);
            var annotation = {};
            var text = val.translated;
            annotation.text = text;
            annotation.ranges = [];
            var annotationRange = {};
            annotationRange.startOffset = val.start_index;
            annotationRange.start = "";
            annotationRange.end = "";
            annotationRange.endOffset = val.end_index;
            annotation.ranges.push(annotationRange);
            annotations.push(annotation);
            indexToTypeDictionary[val.start_index + "_" + val.end_index] = val.type;
        });

        console.log(this.annotator);

        $("#annotatedText").annotator().annotator('loadAnnotations', annotations);

        var highlights = $(".annotator-hl");

        $.each(highlights, function (index, value) {
            var highlightData = $(value).data().annotation;
            highlightData.tags = [indexToTypeDictionary[highlightData.ranges[0].startOffset + "_" + highlightData.ranges[0].endOffset]];
        });

        console.log(this.annotator);

        // this.annotator.subscribe('annotationCreated', this.annotatorModifiedEvent);
        // this.annotator.subscribe('annotationUpdated', this.annotatorModifiedEvent);
        // this.annotator.subscribe('annotationDeleted', this.annotatorModifiedEvent);


    },

    getAnnotationsOnPage: function () {

        var annotationHighlights = $(".annotator-hl");
        var annotations = [];

        $.each(annotationHighlights, function (index, ann) {

            var annotation = {}
            var annotationData = $(ann).data().annotation;
            annotation.translated = annotationData.text;
            annotation.start_index = annotationData.ranges[0].startOffset;
            annotation.end_index = annotationData.ranges[0].endOffset;
            annotation.type = annotationData.tags[0];
            annotations.push(annotation);

        });

        return annotations

    },

    saveAnnotations: function (existingAnnotation) {


        var annotationsOnPage = annotatePage.getAnnotationsOnPage();
        $.ajax({
                type: "POST",
                url: "../user/action/save/",
                data: JSON.stringify(annotationsOnPage),
                beforeSend: function (jqXHR, settings) {
                    $("#saveAnnotation").button("loading");
                },
                error: function (xhr, statusText) {
                    console.log("error");

                },
                success: function (msg) {
                    $("#saveAnnotation").button("reset");

                    $("#saveAnnotation-alert").alert();
                    $("#saveAnnotation-alert").fadeTo(2000, 500).slideUp(500, function () {
                        $("#saveAnnotation-alert").slideUp(500);
                    });

                    annotationsOnPage.existingAnnotations = annotationsOnPage;

                }
            }
        );

    },

    annotatorModifiedEvent: function () {

        console.log("annotations modified");

        var annotationsCount = $(".annotator-hl").length;

        if (annotationsCount == 0) {
            $("#saveAnnotation").prop('disabled', true);

        }
        else {
            $("#saveAnnotation").prop('disabled', false);

        }

    },

    setUpAnnotator: function (text) {

        var annotationTextElement = $("#annotatedText");
        annotationTextElement.text(text);

        annotationTextElement.annotator();
        this.annotator = $("#annotatedText").data().annotator;
        $("#annotatedText").annotator().annotator("addPlugin", "MyTags");
        this.annotator.plugins.MyTags.availableTags = this.tags;


    }


}

$(document).ready(function () {
    annotatePage.init();
});