/**
 * Created by sarvothampai on 24/10/16.
 */


var accountPage = {

    init: function () {

        this.validateAdminTranslatorForm();
        this.validatePasswordForm();
        $("#addAdminTranslatorSubmitBtn").click(this.addAdminTranslator);
        $("#updatePassword").click(this.updatePassword);
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

}


$(document).ready(function () {
    accountPage.init();
});