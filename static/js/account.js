/**
 * Created by sarvothampai on 24/10/16.
 */

var accountPage = {

    init: function () {

        this.validateAdminTranslatorForm();
        this.validateDocumentForm();
        $("#addAdminTranslatorSubmitBtn").click(this.addAdminTranslator);
        $("#addDocumentBtn").click(this.addDocument);

        $("#viewAnnotators").click(this.viewAnnotators);

        $("#viewDocs").click(this.viewDocs);
        $("#showAnnotators").hide();
        $("#addDocFormError").hide();
        $("#documentSaved").hide();

         $('#translatedbtn').click(this.allTranslatedDocs);

        $("#modalNoDelBtn").click(this.modalNoButtonAction);


    },

    allTranslatedDocs: function() {
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
                $('#allTranslatedDocs').attr('href', 'data:'+data);
                $('#allTranslatedDocs').attr('download','data.json');
                console.log("here3");
            }});

    },

    // modalYesButtonAction: function() {
    //     console.log("YESSSSS");
    //     var action = $(".modal").attr('action');
    //     $(".modal").modal('hide');
    // },

    modalNoButtonAction: function() {
        console.log("NOOOOO");
        $(".modal").modal('hide');
    },

    addDocument: function() {
        console.log("here");
      $("#addDocFormError").hide();


          if ($("#addDocumentForm").valid()) {

            var language = $("#language").val().trim();
            var document = $("#document").val().trim();

            var rtl = ($('#rtl').is(':checked'))
            console.log(rtl);
            //rtl = true;



            var body = {}

            body.language = language;
            body.document = document;
            body.rtl = rtl;

            body = JSON.stringify(body);

              console.log(body);

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
            var password = "hello";


            var body = {}

            body.name = name;
            body.email = email;
            body.role = role;
            body.password = password;

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
                    if ((doc_details[i].translations.length)>0) {
                        var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(doc_details[i]));
                        //h += '<tbody><tr><td>' + doc_details[i]._id + '</td><td>' + doc_details[i].language + '</td><td>' + '</td><td id=\"'+i+'\" class=\'download\'><input class=\"btn btn-warning\" download=\"doc_details[i]\" value=\"Download Translations\" id =\'download\'></td></tr></tbody>tbody>';
                        h += '<tbody><tr><td>' + doc_details[i]._id + '</td><td>' + doc_details[i].language + '</td><td>' + '</td><td>' + '<a href=\"data:' + data + '\" download=\"data.json\">download JSON</a>' + '</td></tr></tbody>';
                    }
                    else
                        h += '<tbody><tr><td>' + doc_details[i]._id+ '</td><td>' + doc_details[i].language + '</td><td>' + '</td><td>To be translated</td></tr></tbody>tbody>';
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
                                url: "../rem_user/"+doc_details[index]._id.$oid,
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
                    h += '<tbody><tr><td>' + user_details[i].name + '</td><td>' + user_details[i].role + '</td><td>'+ user_details[i].email + '</td><td id=\"'+i+'\" class=\'deleterow\'><input class=\"btn btn-warning\" value=\"delete\" id =\'deleterow\'></td></tr></tbody>tbody>';
                $('#viewhead').after(h);
                $('#viewtab').css('visibility', 'visible');
                //$('#addAnnotators').css('visibility','visible');

                $(".deleterow").on("click", function () {


                    $("#confirmDelModal").modal('show');
                    //

                    $(".modal .modal-title").html("lala");
                    $(".modal .modal-body").html("lal");
                    $(".modal #modalNoDelBtn").text("noo");
                    //$(".modal #modalNoDelBtn").on("click", function () { $("confirmDelModal").modal('hide') });
                    $(".modal #modalYesDelBtn").text("YES");

                    $(".modal").attr('action',this);
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
                $("#modalYesDelBtn").on("click", function() {
                    var $killrow =  $(".deleterow").parent('tr');
                             //console.log($(this).valueOf()[0].id);
                             index =  ($(".deleterow").valueOf()[0].id);
                             console.log(user_details[index]._id.$oid);
                            $.ajax({
                                type: "GET",
                                url: "../rem_user/"+user_details[index]._id.$oid,
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

                }) ;
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

}
$(document).ready(function () {
    accountPage.init();
});