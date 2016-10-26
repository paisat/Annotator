/**
 * Created by sarvothampai on 24/10/16.
 */


var logout = {

    init: function () {

        $("#logout").click(this.logout);


    },
    logout: function () {
        console.log("cookie");
        $.removeCookie('token', {path: '/'});
        window.location.href = "../login/";
    }

}


$(document).ready(function () {
    logout.init();
});
