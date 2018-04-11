var user = JSON.parse(localStorage.getItem('user'));

$(function () {

    fetch(ipAdrPupil+'/users/'+user.id, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (uinfo) {
        for (var key in uinfo.stand) {
            var obj = uinfo.stand[key];
            $("#standList").append('<a href="standinfo.html?id='+obj.id+'" class="list-group-item list-group-item-action">'+obj.name+'</a>');
        }
    }).catch(function (err) {
        console.log(err);
    });




    fetch(ipAdrPupil + '/message', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'uuid': user.uuid
        }
    }).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Nachrichten konnten nicht empfangen werden');
    }).then(function (data) {
        console.log(data);
        for(var key in data){
            var msg = data[key];

            $("#msgArea").append(' <div class="alert alert-info alert-dismissible fade show" role="alert">' +
                '<p> Nachricht von '+msg.from.firstname+' '+msg.from.lastname+'</p>' +
                '<hr>'+
                '<p>'+msg.text+'</p>' +
                '<button onclick="onDeleteMsg(\'' + msg.id + '\')" type="button" class="delMsg close" data-dismiss="alert" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                '</div>');

        }
    }).catch(function (err) {
        console.log(err)
    });




});



function onDeleteMsg(id) {

    fetch(ipAdrPupil + '/message/'+id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'loginToken': user.loginToken
        }
    }).then(function (response) {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Nachrichten konnten nicht gelöscht werden');
    }).then(function (data) {
        console.log(data);
    }).catch(function (err) {
        console.log(err)
    });
}