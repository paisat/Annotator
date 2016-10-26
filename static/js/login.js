/**
 * Created by sarvothampai on 23/10/16.
 */


var loginPage = {

    init: function () {
        console.log("init ");
        this.login()
    },

    login: function () {

        $("#login-error").hide();
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

            $("#login-error").hide();
            var credentials = {}
            credentials.email = $("#login-username").val().trim()
            credentials.password = $("#login-password").val().trim()

            credentials = JSON.stringify(credentials);

            $.post("../auth-token/", credentials).done(function (token) {

                token = JSON.parse(token);
                $.cookie("token", token.token, {path: '/'});
                window.location.href = "../index/";

            }).fail(function (xhr, status, error) {

                console.log("fail");
                var message = JSON.parse(xhr.responseText).message;
                console.log(message);

                $("#login-error").html(message)
                $("#login-error").show();

                console.log(status);
                console.log(error);
            });

        });


    }


}

$(document).ready(function () {
    loginPage.init();
});
