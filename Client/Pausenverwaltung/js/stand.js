var user = JSON.parse(localStorage.getItem('user'));

$(function() {
    fetch(ipAdrPupil+'/stands', {
        method: 'GET',
        headers: {
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for (var key in data) {
            var obj = data[key];
            $("#standlist").append('<a href="standinfo.html?id='+obj.id+'" class="list-group-item list-group-item-action">'+obj.name+'</a>');
        }
    });


    if(user.category == 'student'){
        $("#createStandBtn").remove();
    }


    $("#newStandCreateBtn").click(function () {
        var standname = $("#newStandName").val();
        var standdescription = $("#newStandDescription").val();

        var data ={};

        fetch(ipAdrPupil+'/stands', {
            method: 'PUT',
            headers: {
                'uuid':user.uuid,
                'Content-Type':'application/json'
            },
            body: JSON.stringify({"name":standname,"description":standdescription}),
        }).then(function (response) {
            return response.json();
        }).then(function (data) {
            $("#standlist").append('<a href="standinfo.html?id='+data.id+'" class="list-group-item list-group-item-action">'+data.name+'</a>');
        });

    });

});