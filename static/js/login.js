/**
 * Created by sarvothampai on 23/10/16.
 */


var loginPage = {

    isForgotPasswordShown: false,

    init: function () {
        console.log("init ");
        this.login();
        $("#forgotPasswordBtn").click(this.forgotPassword);
        this.validateForgotPasswordForm();
        $("#resetPasswdBtn").click(this.resetPassword);


    },

    forgotPassword: function () {

        if (!loginPage.isForgotPasswordShown) {

            loginPage.isForgotPasswordShown = true;
            $("#loginform").hide();
            $("#forgotPasswordForm").show();
            $(".panel-title").html('Forgot Password ?');
            $("#forgotPasswordBtn").text('Sign in')
            $("#forgotPasswordSuccessMsg").hide();
        }
        else {
            loginPage.isForgotPasswordShown = false;
            $("#forgotPasswordForm").hide();
            $("#loginform").show();
            $(".panel-title").html('Sign In ?');
            $("#forgotPasswordBtn").text('Forgot Password ?')
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

    resetPassword: function () {

        if ($("#forgotPasswordForm").valid()) {

            var body = {}
            var reset_email = $("#resetEmail").val().trim();
            body.email = reset_email;
            body = JSON.stringify(body);

            $.ajax({
                    type: "POST",
                    url: "/user/forgotPassword/",
                    data: body,
                    beforeSend: function (jqXHR, settings) {
                        $("#resetPasswdBtn").button("loading...");
                        $("#forgotPasswordError").hide();
                        $("#forgotPasswordSuccessMsg").hide();
                    },
                    error: function (xhr, statusText) {
                        $("#resetPasswdBtn").button("reset");
                        $("#forgotPasswordError").show();
                    },
                    success: function (response) {
                        $("#forgotPasswordSuccessMsg").show();
                    }
                }
            );


        }
    },


    validateChangePasswordForm: function () {

        console.log("validate change password");

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

    displayLogInErrorMessage: function (message, toShow) {

        if (toShow) {
            $("#login-error").html(message)
            $("#login-error").show();
        }
        else {
            $("#login-error").hide()
        }

    },

    validateForgotPasswordForm: function () {

        $('#forgotPasswordForm').validate({
            rules: {
                resetEmail: {
                    required: true,
                    email: true
                }
            }
        });
    },

    login: function () {


        $("#btn-login").addClass('disabled');

        $("#login-username , #login-password").on("change paste keyup", function () {

            if ($("#login-username").val().length <= 0 || $("#login-password").val().length <= 0) {
                $("#btn-login").addClass('disabled');
            }
            else {
                $("#btn-login").removeClass('disabled');
            }
        });


        $("#btn-login").click(function () {

            loginPage.displayLogInErrorMessage("", false);
            var credentials = {}
            credentials.email = $("#login-username").val().trim()
            credentials.password = $("#login-password").val().trim()

            credentials = JSON.stringify(credentials);

            $.post("../auth-token/", credentials).done(function (response) {

                var auth_response = JSON.parse(response)
                if (!auth_response.initial_password_changed) {

                    $(".panel-title").html("Change Default Password");
                    $("#loginform").hide();
                    $("#passwordForm").show();
                    loginPage.validateChangePasswordForm();
                    $("#updatePassword").click(loginPage.updatePassword);

                }
                else {
                    window.location.href = "/index/";
                }

            }).fail(function (xhr, status, error) {

                var message = JSON.parse(xhr.responseText).message;

                loginPage.displayLogInErrorMessage(message, true);
            });

        });


    }


}

$(document).ready(function () {
    loginPage.init();
});
