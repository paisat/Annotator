/**
 * Created by sarvothampai on 04/10/16.
 */


var annotatePage = {

    tags: ['time expression', 'quantity', 'person', 'organisation', 'location', 'untranslatable'],
    annotator: null,
    existingAnnotations: [],
    oldLanguageSelection: null,

    init: function () {

        this.loadSelectLanguageDropDownBox();
        var urlLanguageParam = this.getUrlParameter('lang');
        this.setSelectBoxLanguage(urlLanguageParam);
        this.getAnnotations(urlLanguageParam);
        $("#nextDocument").click(this.getNextDocument);
        $("#skipDocument").click(this.skipDocument);
        $("#modalYesBtn").click(this.modalYesButtonAction);
        $("#modalNoBtn").click(this.modalNoButtonAction);
        $("#closeModalBtn").click(this.modalNoButtonAction);
        $("#annotator-field-0").on('change keyup paste', function () {
            console.log("change");
        });

        console.log("annotator field");
        console.log($(":hidden#annotator-field-0"));


    },

    modalYesButtonAction: function () {

        var action = $(".modal").attr('action');

        if (action == "change") {
            action = "next";
        }

        annotatePage.skipOrNextDocument(action);
    },


    skipOrNextDocument: function (action) {

        var annotationsOnPage = annotatePage.getAnnotationsOnPage();
        $.ajax({
                type: "POST",
                url: "../user/action/" + action + "/",
                data: JSON.stringify(annotationsOnPage),
                beforeSend: function (jqXHR, settings) {
                    $("#modalYesBtn").button("loading");
                    annotatePage.showAnnotatioModalErrorMsg("", false);
                },
                error: function (xhr, statusText) {
                    console.log("error");
                    $("#modalYesBtn").button("reset");
                    annotatePage.showAnnotatioModalErrorMsg("Something Went wrong. Please try again", true);
                    annotatePage.setSelectBoxLanguage(annotatePage.oldLanguageSelection)

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
        $(".modal").modal('hide');
        if (action == "change") {
            annotatePage.setSelectBoxLanguage(annotatePage.oldLanguageSelection);
        }
    },

    getNextDocument: function () {

        if (!(annotatePage.existingAnnotations.length == 0 && annotatePage.getAnnotationsOnPage().length == 0 )) {
            annotatePage.showModal("Going to next document ?", "yes, Go to next doc", "No, Stay on this Doc", "Are you done annotating ? You cannot come back to this document", "next");
        }
        else {
            annotatePage.skipOrNextDocument("next");
        }
    },

    changeLanguage: function () {
        if (!(annotatePage.existingAnnotations.length == 0 && annotatePage.getAnnotationsOnPage().length == 0 )) {
            annotatePage.showModal("Changing Language ?", "Yes, I am done ", "No, Stay on this document", "Are you done annotating this document completely?. You cannot come back to this document if you change language.", "change");
        }
        else {
            annotatePage.skipOrNextDocument("next");
        }
    },

    skipDocument: function () {


        if (!(annotatePage.existingAnnotations.length == 0 && annotatePage.getAnnotationsOnPage().length == 0 )) {
            annotatePage.showModal("Skip Document", "Yes, Skip this document", "No, Stay on this document", "You are about to skip document. All your saved annotations will be lost ", "skip");
        }
        else {
            annotatePage.skipOrNextDocument("skip");
        }

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
        $("#language-select").on("select2:selecting", function () {
            annotatePage.oldLanguageSelection = $("#language-select").val();
        });
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
            {
                "id": "ar",
                "text": "Arabic"
            }

        ]

        return languages

    },

    onLanguageSelect: function (e) {
        annotatePage.changeLanguage();
    },

    showModal: function (title, yesMessage, noMessage, messageBody, action) {

        annotatePage.showAnnotatioModalErrorMsg("", false);
        $(".modal .modal-title").html(title);
        $(".modal .modal-body").html(messageBody);
        $(".modal #modalNoBtn").text(noMessage);
        $(".modal #modalYesBtn").text(yesMessage);
        $(".modal").attr('action', action);

        $("#confirmModal").modal('show');
    },

    getAnnotations: function (language) {

        var requestUrl = (language == null) ? "../user/language/assigned/" : "../user/language/" + language + "/";

        $.ajax({
                type: "GET",
                url: requestUrl,
                beforeSend: function (jqXHR, settings) {
                    annotatePage.toggleLoadingForSelectBar(true);
                },
                error: function (xhr, statusText) {
                    annotatePage.toggleLoadingForSelectBar(false);
                    annotatePage.showAnnotationErrorMsg("Something Went Wrong . Please refresh page", true);

                },
                success: function (msg) {
                    var response = JSON.parse(msg);

                    annotatePage.existingAnnotations = (response.length == 0) ? [] : response[0].translations;

                    language = (language == null) ? annotatePage.getUrlParameter('lang') : language;

                    if (response.length != 0) {
                        annotatePage.setSelectBoxLanguage(response[0].language);
                    }

                    if (!(response.length == 0 && language == null)) {
                        annotatePage.loadAnnotator(response);
                    }

                    annotatePage.toggleLoadingForSelectBar(false);

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
        console.log(textAnnotations);

        $.each(textAnnotations.translations, function (index, val) {

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
            annotation.tags = [val.type]
        });

        $("#annotatedText").annotator().annotator('loadAnnotations', annotations);

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

    showAnnotationErrorMsg: function (msg, toShow) {

        if (toShow) {
            $(".errorMessage").show();
            $(".errorMessage p").text(msg);
        }

        else {
            $(".errorMessage").hide()
        }

    },

    showAnnotatioModalErrorMsg: function (msg, toShow) {

        if (toShow) {
            $(".modal-error").show();
            $(".modal-error").html(msg);
        }

        else {
            $(".modal-error").hide()
        }

    },

    saveAnnotations: function (annotation, action) {


        annotatePage.showAnnotationErrorMsg("", false);
        var annotationsOnPage = annotatePage.getAnnotationsOnPage();
        console.log("save function");
        console.log(annotationsOnPage);
        $.ajax({
                type: "POST",
                url: "/user/action/save/",
                data: JSON.stringify(annotationsOnPage),
                error: function (xhr, statusText) {

                    if (action == "save") {
                        annotatePage.showAnnotationErrorMsg("Couldn't save annotations. Please Try again", true);
                        $(annotation.highlights[0]).replaceWith($(annotation.highlights[0]).text());
                    }
                    else if (action == "delete") {
                        annotatePage.showAnnotationErrorMsg("Couldn't delete annotations. Please Try again", true);
                        $("#annotatedText").annotator().annotator('loadAnnotations', [{
                            text: annotation.text,
                            ranges: annotation.ranges,
                            tags: annotation.tags
                        }]);

                    }
                },
                success: function (msg) {
                    annotatePage.existingAnnotations = annotationsOnPage;
                }
            }
        );

    },


    setUpAnnotator: function (text) {

        var annotationTextElement = $("#annotatedText");
        annotationTextElement.text(text);

        annotationTextElement.annotator();
        annotatePage.annotator = $("#annotatedText").data().annotator;
        $("#annotatedText").annotator().annotator("addPlugin", "MyTags");
        this.annotator.plugins.MyTags.availableTags = this.tags;

        annotatePage.annotator.subscribe("annotationEditorShown", function (editor, annotator) {
            $("#annotator-field-0").attr("placeholder", "Translation in English");
            $("#annotatorError").remove();

            $(".annotator-save").prop("disabled", true);


            $("#annotator-field-0").off('change keyup paste').on('change keyup paste', function () {


                if (($("#annotator-field-0").val().length == 0 && $("#annotator-tags-select").val() == null) ||
                    ($("#annotator-field-0").val().length == 0 || $("#annotator-tags-select").val() == null)) {
                    $(".annotator-save").prop("disabled", true);
                }
                else {
                    $(".annotator-save").prop("disabled", false);
                }

            });

            $("#annotator-tags-select").off("select2:select").on("select2:select", function () {


                if (($("#annotator-field-0").val().length == 0 && $("#annotator-tags-select").val() == null) ||
                    ($("#annotator-field-0").val().length == 0 || $("#annotator-tags-select").val() == null)) {

                    $(".annotator-save").prop("disabled", true);

                }
                else {

                    $(".annotator-save").prop("disabled", false);
                }
            });

        });

        annotatePage.annotator.subscribe("annotationEditorSubmit", function (editor, annotation) {

            console.log("annotator editor submit");

            console.log(annotation);
            annotatePage.saveAnnotations(annotation, "save");

        });

        annotatePage.annotator.subscribe("annotationDeleted", function (annotation) {

            if ($(annotation.highlights[0])[0].className.indexOf("temporary") == -1) {
                console.log("annotations deleted");
                console.log(annotation);

                annotatePage.saveAnnotations(annotation, "delete");

            }

        });


    }


}

$(document).ready(function () {
    annotatePage.init();
});