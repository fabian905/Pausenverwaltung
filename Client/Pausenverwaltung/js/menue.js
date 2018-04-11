ipAdrPupil=api.pupilManagement;
ipAdrBreak=api.break;

$(function() {
    var user = localStorage.getItem('user');
    console.log(JSON.parse(user));

    if (user === null || user == 'undefined') {
        location.href = "index.html"
    }

    $("#btnLogout").click(function () {
        localStorage.removeItem('user');
        location.href = "index.html"
    });

    var parseUser = JSON.parse(user);

    fetch(ipAdrPupil+'/login/me', {
        method: 'GET',
        headers: {
            'uuid':parseUser.uuid,
            'Content-Type':'application/json'
        }
    }).then(function (response) {
        return response.json();
    }).then(function (uinfo) {
        if(typeof uinfo.username == 'undefined'){
            location.href = "index.html"
        }

    }).catch(function (error) {
        console.log(error);
        location.href = "index.html"
    });


});

