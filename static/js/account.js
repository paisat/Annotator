/**
 * Created by sarvothampai on 24/10/16.
 */

var accountPage = {

    init: function () {

        newDocLangugae = null;
        languages = null;

        this.populate_languages();


        this.validateAdminTranslatorForm();
        this.validateDocumentForm();
        $("#addAdminTranslatorSubmitBtn").click(this.addAdminTranslator);
        $("#updatePassword").click(this.updatePassword);

        $("#addDocumentBtn").click(this.addDocument);

        $("#viewAnnotators").click(this.viewAnnotators);

        $("#viewDocs").click(this.viewDocs);
        $("#showAnnotators").hide();
        $("#addDocFormError").hide();
        $("#documentSaved").hide();

        $('#translatedbtn').click(this.allTranslatedDocs);

        $("#modalNoDelBtn").click(this.modalNoButtonAction);



    },

    allTranslatedDocs: function () {
        console.log("here1");
        $('#translatedbtn').hide();

        $.ajax({
            type: "GET",
            url: "../all_translated_docs/",
            error: function (xhr, statusText) {
                console.log("error");

            },
            success: function (msg) {
                console.log(msg);
                console.log("here2");
                //doc_details = JSON.parse(msg);
                var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(msg));
                $('#allTranslatedDocs').css('visibility', 'visible');
                $('#allTranslatedDocs').attr('href', 'data:' + data);
                $('#allTranslatedDocs').attr('download', 'data.json');
                console.log("here3");
            }
        });

    },

    // modalYesButtonAction: function() {
    //     console.log("YESSSSS");
    //     var action = $(".modal").attr('action');
    //     $(".modal").modal('hide');
    // },

    modalNoButtonAction: function () {
        console.log("NOOOOO");
        $(".modal").modal('hide');
    },

    addDocument: function () {
        var rtls = ["ar"]
        console.log("here");
        $("#addDocFormError").hide();


        if ($("#addDocumentForm").valid()) {

            //var language = $("#language").val().trim();
            var document = $("#document").val().trim();
            var body = {}

            body.language = accountPage.newDocLangugae;
            body.document = document;
            if (accountPage.newDocLangugae == "ar")
                body.rtl = true
            else
                body.rtl = false;
            body = JSON.stringify(body);

            //console.log(body);

            $.post("../add-doc/", body).done(function (token) {

                var message = " Document Added ";

                $("#documentSaved").html(message);
                $("#documentSaved").alert();
                $("#documentSaved").fadeTo(2000, 500).slideUp(500, function () {
                    $("#documentSaved").slideUp(500);
                });

            }).fail(function (xhr, status, error) {

                console.log(xhr.responseText);
                var message = JSON.parse(xhr.responseText).message;
                $("#addDocFormError").html(message);
                $("#addDocFormError").show();

            });


        }
    },

    addAdminTranslator: function () {

        $("#addFormError").hide();

        if ($("#addTranslatorAdminForm").valid()) {

            var name = $("#name").val().trim();
            var email = $("#email").val().trim();
            var role = $("#role").val().trim();
            var body = {}

            body.name = name;
            body.email = email;
            body.role = role;

            body = JSON.stringify(body)

            $.post("../users/", body).done(function (token) {

                var message = name + " Added as " + role;

                $("#adminTranslatorSaved").html(message);
                $("#adminTranslatorSaved").alert();
                $("#adminTranslatorSaved").fadeTo(2000, 500).slideUp(500, function () {
                    $("#adminTranslatorSaved").slideUp(500);
                });

            }).fail(function (xhr, status, error) {

                var message = JSON.parse(xhr.responseText).message;
                $("#addFormError").html(message);
                $("#addFormError").show();

            });


        }

    },

    validateDocumentForm: function () {

        $('#addDocumentForm').validate({
            rules: {
                language: {
                    required: true
                },
                document: {
                    required: true,
                }
            },
            highlight: function (element) {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            },
            success: function (element) {
                element.addClass('valid')
                    .closest('.form-group').removeClass('has-error').addClass('has-success');
            }
        });
    },

    updatePassword: function () {

        if ($("#passwordForm").valid()) {

            var body = {}

            var newPassword = $("#newPassword").val().trim();
            body.newPassword = newPassword;
            body = JSON.stringify(body);

            $.ajax({
                    type: "POST",
                    url: "/account/changepassword/",
                    data: body,
                    beforeSend: function (jqXHR, settings) {
                        $("#updatePassword").button("loading...");
                        $("#passwordChangeError").hide();
                    },
                    error: function (xhr, statusText) {
                        console.log("error");
                        $("#updatePassword").button("reset");
                        $("#passwordChangeError").show();
                    },
                    success: function (response) {
                        $("#updatePassword").button("reset");
                        $.removeCookie('token', {path: '/'});
                        var mapForm = $('<form id="mapform" action="/login/" method="POST"></form>');
                        mapForm.append('<input type="hidden" name="passwordChange" id="passwordChange" value="true" />');
                        $('body').append(mapForm);
                        mapForm.submit();
                    }
                }
            );

        }

    },

    validatePasswordForm: function () {

        console.log("validate password form");

        $("#passwordForm").validate({
            rules: {
                newPassword: {
                    required: true,
                    minlength: 6,
                    maxlength: 15,

                },

                confirmPassword: {
                    equalTo: "#newPassword",
                    minlength: 6,
                    maxlength: 15
                }

            },
            messages: {
                password: {
                    required: "the password is required"
                }
            }


        });

    },

    validateAdminTranslatorForm: function () {

        $('#addTranslatorAdminForm').validate({
            rules: {
                name: {
                    minlength: 3,
                    required: true
                },
                email: {
                    required: true,
                    email: true
                }
            },
            highlight: function (element) {
                $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
            },
            success: function (element) {
                element.addClass('valid')
                    .closest('.form-group').removeClass('has-error').addClass('has-success');
            }
        });


    },


    viewDocs: function () {


        $.ajax({
            type: "GET",
            url: "../alldocs/",
            error: function (xhr, statusText) {
                console.log("error");

            },
            success: function (msg) {

                doc_details = JSON.parse(msg);
                h = ""

                $("#viewDocs").hide();
                //$("#addAnnotators").show();
                var h = "";
                for (var i = 0; i < doc_details.length; i++)
                    if ((doc_details[i].translations.length) > 0) {
                        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doc_details[i]));
                        //h += '<tbody><tr><td>' + doc_details[i]._id + '</td><td>' + doc_details[i].language + '</td><td>' + '</td><td id=\"'+i+'\" class=\'download\'><input class=\"btn btn-warning\" download=\"doc_details[i]\" value=\"Download Translations\" id =\'download\'></td></tr></tbody>tbody>';
                        h += '<tbody><tr><td>' + doc_details[i]._id + '</td><td>' + doc_details[i].language + '</td><td>' + '</td><td>' + '<a href=\"data:' + data + '\" download=\"data.json\">download JSON</a>' + '</td></tr></tbody>';
                    }
                    else
                        h += '<tbody><tr><td>' + doc_details[i]._id + '</td><td>' + doc_details[i].language + '</td><td>' + '</td><td>To be translated</td></tr></tbody>tbody>';
                $('#viewheaddoc').after(h);
                $('#viewtabdoc').css('visibility', 'visible');
                //$('#addAnnotators').css('visibility','visible');

                $(".download").on("click", function () {


                    var $killrow = $(this).parent('tr');
                    console.log($(this).valueOf()[0].id);
                    index = ($(this).valueOf()[0].id);
                    console.log(doc_details[index]._id.$oid);
                    $.ajax({
                        type: "GET",
                        url: "../rem_user/" + doc_details[index]._id.$oid,
                        error: function (xhr, statusText) {
                            console.log("error");

                        },
                        success: function (msg) {


                            $killrow.addClass("danger");
                            $killrow.fadeOut(500, function () {
                                $(this).remove();
                            });
                        }
                    });

                });

            }

        });
    },


    viewAnnotators: function () {

        $.ajax({
            type: "GET",
            url: "../allusers/",
            error: function (xhr, statusText) {
                console.log("error");

            },
            success: function (msg) {

                user_details = JSON.parse(msg);
                h = ""

                $("#viewAnnotators").hide();
                //$("#addAnnotators").show();
                for (var i = 0; i < user_details.length; i++)
                    h += '<tbody><tr><td>' + user_details[i].name + '</td><td>' + user_details[i].role + '</td><td>' + user_details[i].email + '</td><td id=\"' + i + '\" class=\'deleterow\'><input class=\"btn btn-warning\" value=\"delete\" id =\'deleterow\'></td></tr></tbody>tbody>';
                $('#viewhead').after(h);
                $('#viewtab').css('visibility', 'visible');
                //$('#addAnnotators').css('visibility','visible');

                $(".deleterow").on("click", function () {


                    $("#confirmDelModal").modal('show');
                    //

                    $(".modal .modal-title").html("DELETE USER");
                    $(".modal .modal-body").html("Are you sure you want to delete this user?");
                    $(".modal #modalNoDelBtn").text("NO");
                    //$(".modal #modalNoDelBtn").on("click", function () { $("confirmDelModal").modal('hide') });
                    $(".modal #modalYesDelBtn").text("YES");

                    $(".modal").attr('action', this);
                    // //
                    // // $("#modalNoDelBtn").click = function () {
                    // //     $("confirmDelModal").modal('hide');
                    // // };
                    // //
                    // // $("#modalYesDelBtn").click =  function (){
                    // //     $("confirmDelModal").modal('hide');
                    // //     // var $killrow = $(this).parent('tr');
                    // //     // console.log($(this).valueOf()[0].id);
                    // //     // index = ($(this).valueOf()[0].id);
                    // //     // console.log(user_details[index]._id.$oid);
                    // //     // $.ajax({
                    // //     //     type: "GET",
                    // //     //     url: "../rem_user/" + user_details[index]._id.$oid,
                    // //     //     error: function (xhr, statusText) {
                    // //     //         console.log("error");
                    // //     //
                    // //     //     },
                    // //     //     success: function (msg) {
                    // //     //
                    // //     //
                    // //     //         $killrow.addClass("danger");
                    // //     //         $killrow.fadeOut(500, function () {
                    // //     //             $(this).remove();
                    // //     //         });
                    // //     //     }
                    // //     // });
                    // // };


                    //$("#modalYesDelBtn").on("click",(accountPage.modalYesButtonAction));
                    $("#modalYesDelBtn").on("click", function () {
                        var $killrow = $(".deleterow").parent('tr');
                        //console.log($(this).valueOf()[0].id);
                        index = ($(".deleterow").valueOf()[0].id);
                        console.log(user_details[index]._id.$oid);
                        $.ajax({
                            type: "GET",
                            url: "../rem_user/" + user_details[index]._id.$oid,
                            error: function (xhr, statusText) {
                                console.log("error");

                            },
                            success: function (msg) {


                                //$killrow.addClass("danger");
                                row = ($killrow.valueOf()[0]);
                                $(row).fadeOut(500, function () {
                                    $(".modal").modal('hide');
                                    $(row).remove();
                                });
                            }
                        });

                    });
                    //
                    //   $(".deleterow").on("click", function () {
                    //
                    //
                    //
                    //
                    //             var $killrow = $(this).parent('tr');
                    //             console.log($(this).valueOf()[0].id);
                    //             index = ($(this).valueOf()[0].id);
                    //             console.log(user_details[index]._id.$oid);
                    //             $.ajax({
                    //                 type: "GET",
                    //                 url: "../rem_user/"+user_details[index]._id.$oid,
                    //                 error: function (xhr, statusText) {
                    //                     console.log("error");
                    //
                    //                 },
                    //                 success: function (msg) {
                    //
                    //
                    //                     $killrow.addClass("danger");
                    //                     $killrow.fadeOut(500, function () {
                    //                         $(this).remove();
                    //                     });
                    //                 }
                    //             });
                    //
                    // });

                });


            }

        });
    },


     loadSelectLanguageDropDownBoxNewDoc: function () {

         console.log("first");
        //accountPage.populate_languages();
         languages = accountPage.languages;

        $("#language-select-addoc").select2({
            data: accountPage.languages
        });
         console.log("hererer");
         console.log(accountPage.languages);
         $("#language-select-addoc").select2("val", null);
        //$("#language-select").on("select2:select", this.onLanguageSelect)
         $("#language-select-addoc").on("select2:select", function () {
            accountPage.newDocLangugae = $("#language-select-addoc").val();
             console.log("$$$");
            console.log(accountPage.newDocLangugae);
        });
        $("#language-select-addoc").on("select2:selecting", function () {
            accountPage.newDocLangugae = $("#language-select-addoc").val();
            console.log(accountPage.newDocLangugae);
        });
    },
     populate_languages: function () {
        console.log("second");
        //languages = "";
        $.ajax({
                type: "GET",
                url: "../languages/",

                error: function (xhr, statusText) {
                    console.log("error");


                },
                success: function (msg) {
                    console.log("success");
                    accountPage.languages = JSON.parse(msg);
                    console.log(accountPage.languages);
                    accountPage.loadSelectLanguageDropDownBoxNewDoc();
                    //return languages;
                }
            }
        );
        // console.log("ou");
        // console.log(languages);
        // return languages
    },
}
$(document).ready(function () {
    accountPage.init();
});