var user = JSON.parse(localStorage.getItem('user'));

$(function () {
    fetch(ipAdrPupil+'/teachers', {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (teachers) {
        printTeacher(teachers)
    }).catch(function (err) {
        console.log(err);
    });


    $('#teacherFilterArea').keyup(function(event) {
        if (event.keyCode === 13) {
            $("#btnFilterTeacher").click();
        }
    });

    $('#btnFilterTeacher').click(function (event) {
        fetch(ipAdrPupil+'/teachers?filter='+$('#teacherFilterArea').val(), {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
                'uuid':user.uuid
            }
        }).then(function (response) {
            return response.json();
        }).then(function (teachers) {
            $("#teacherList").empty();
            printTeacher(teachers)
        }).catch(function (err) {
            console.log(err);
        });
    });
});

function printTeacher(teachers){
    for (var key in teachers) {
        var obj = teachers[key];
        console.log(obj);
        $("#teacherList").append('<a href="./profile.html?id='+obj.id+'" class="list-group-item list-group-item-action flex-column align-items-start">'+
            '<div class="d-flex w-100 justify-content-between"><h5 class="mb-1">'+obj.firstname+' '+obj.lastname+'</h5><small>'+obj.username+'</small></div><p class="mb-1"></p></a>');
    }
}