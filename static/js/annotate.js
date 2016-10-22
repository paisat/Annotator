/**
 * Created by sarvothampai on 04/10/16.
 */


var annotatePage = {

    tags: ['Date', 'Location'],
    annotator: null,
    init: function () {

        var annotations = [{
            id: "1",
            text: "India obtuvo su independencia el 15 ago 1947, nos consiguió la independencia el 4 de julio 1776. Celebración del 4 de julio de este año fue genial.",
            rtl: true,
            translations: [
                {
                    original: "15 ago 1947",
                    translated: "Aug 15 1947",
                    start_index: 33,
                    end_index: 45,
                    type: "date"
                },
                {
                    original: "4 de julio 1776",
                    translated: "July 4th 1776",
                    start_index: 80,
                    end_index: 96,
                    type: "date"
                },
                {
                    original: "4 de julio",
                    translated: "4th july",
                    start_index: 113,
                    end_index: 124,
                    type: "date"
                }
            ]
        }]

        $("#saveAnnotation-alert").hide();

        this.loadAnnotator(annotations);
        $("#saveAnnotationBtn").click(this.saveAnnotations);


    },

    loadAnnotator: function (textAnnotations) {

        //$("#annotatedText .annotator-wrapper").append(textAnnotations[0].text);
        this.setUpAnnotator(textAnnotations[0].text);

        if (textAnnotations[0].rtl) {
            $("#annotatedText").addClass("rtl");
        }

        var annotations = [];
        var indexToTypeDictionary = {};

        $.each(textAnnotations[0].translations, function (index, val) {

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

    saveAnnotations: function (existingAnnotation) {


        var annotationHighlights = $(".annotator-hl");

        var translations = [];

        $.each(annotationHighlights, function (index, annotation) {

            var translation = {}
            var annotationData = $(annotation).data().annotation;
            translation.translated = annotationData.text;
            translation.start_index = annotationData.ranges[0].startOffset;
            translation.end_index = annotationData.ranges[0].endOffset;
            translation.type = annotationData.tags[0];
            translations.push(translation);

        });

        console.log(translations)

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