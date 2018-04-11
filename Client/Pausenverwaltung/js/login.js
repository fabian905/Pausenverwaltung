ipAdrPupil=api.pupilManagement;

console.log(ipAdrPupil);

$(".alert").alert();
$(function() {
    $("[data-hide]").on("click", function(){
        $(this).closest("." + $(this).attr("data-hide")).hide();
    });

    $('#inputEmail').keyup(function(event) {
        if (event.keyCode === 13) {
            $("#signINbtn").click();
        }
    });

    $('#inputPassword').keyup(function(event) {
        if (event.keyCode === 13) {
            $("#signINbtn").click();
        }
    });



    $("#signINbtn").click(function () {
        console.log("sign in...");
        var username = $("#inputEmail").val();
        var password = $("#inputPassword").val();

        if(username.length==0) {
            printError("Benutzername darf nicht leer sein");
            return;
        }

        if(password.length==0) {
            printError("Passwort darf nicht leer sein");
            return;
        }

        if(username.toLowerCase()=="admin"&&password.toLowerCase()=="admin"){
            location.href="admin.html";
        }

        fetch(ipAdrPupil+'/login', {
            method: 'GET',
            headers: {
                'username': username,
                'password': b64EncodeUnicode(password)
            }
        }).then(function (response) {
            console.log(response);
            if (response.ok) {
                return response.json();
            }
            throw('Benutzername oder Passwort ist falsch');
        }).then(function (user) {
            localStorage.setItem('user', JSON.stringify(user));
            location.href = "board.html"
        }).catch(function (err) {
            console.log(err);
            printError(err);
        });

    });
});

function printError(msg) {
    $('#wrongUsernameAlert').text(msg);
    $('#wrongUsernameAlert').addClass("show");
    setTimeout(function() {
        $('#wrongUsernameAlert').removeClass('show');
    },2500);
}

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}