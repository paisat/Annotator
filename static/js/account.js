/**
 * Created by sarvothampai on 24/10/16.
 */


var accountPage = {

    init: function () {

        this.validateAdminTranslatorForm();
        $("#addAdminTranslatorSubmitBtn").click(this.addAdminTranslator);

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

}


$(document).ready(function () {
    accountPage.init();
});