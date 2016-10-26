/**
 * Created by sarvothampai on 04/10/16.
 */


var annotatePage = {

    tags: ['Date', 'Location'],
    annotator: null,
    existingAnnotations: null,

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


        $("#saveAnnotation-alert").hide();

        var urlLanguageParam = this.getUrlParameter('lang');
        this.loadSelectLanguageDropDownBox(urlLanguageParam);
        $("#saveAnnotationBtn").click(this.saveAnnotations);
        console.log("annotations on page");
        console.log(this.getAnnotationsOnPage());

        this.existingAnnotations = annotations;


    },

    loadSelectLanguageDropDownBox: function (language) {

        var languages = this.getLanguageList();
        $("#language-select").select2({
            data: languages
        });

        $("#language-select").select2("val", language);
        $("#language-select").on("select2:select", this.onLanguageSelect)

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

        if (!( annotatePage.existingAnnotations == null ||
            (annotatePage.existingAnnotations.translations.length == 0 && annotatePage.getAnnotationsOnPage().length == 0 )  )) {
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


        $("#yesBtn").click(function () {

            console.log("click no btn");
            console.log(action);

        });


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

        this.loadAnnotator(annotations1);


        // $("#noResults").show();


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

        //$("#annotatedText .annotator-wrapper").append(textAnnotations[0].text);
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

        this.annotator.subscribe('annotationCreated', this.annotatorModifiedEvent);
        this.annotator.subscribe('annotationUpdated', this.annotatorModifiedEvent);
        this.annotator.subscribe('annotationDeleted', this.annotatorModifiedEvent);


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
        console.log(annotationsOnPage);

        $("#saveAnnotation-alert").hide();

        $("#saveAnnotation-alert").alert();
        $("#saveAnnotation-alert").fadeTo(2000, 500).slideUp(500, function () {
            $("#saveAnnotation-alert").slideUp(500);
        });


    },

    annotatorModifiedEvent: function () {

        var annotationsCount = $(".annotator-hl").length;

        if (annotationsCount == 0) {
            $("#saveAnnotationBtn").prop('disabled', true);
            $("#areYouDoneChkBox").attr("disabled", true);
        }
        else {
            $("#saveAnnotationBtn").prop('disabled', false);
            $("#areYouDoneChkBox").attr("disabled", false);
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