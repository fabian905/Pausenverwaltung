var user = JSON.parse(localStorage.getItem('user'));

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
        .exec(window.location.href);

    if (results == null || typeof results == 'undefined') {
        return 0;
    }else{
        return results[1] || 0;
    }
};
var id= $.urlParam('id');

$(function () {

    if(id == 0) {
        $('#sendMsgArey').remove();

        $('.cbNotificationSetting').change(function () {
            onChangeNotificationSetting();
        });


        id=user.id;
    }else{
        $('#notificationSetting').remove();
    }

    fetch(ipAdrPupil+'/users/'+id, {
        method: 'GET',
        headers: {
            'uuid':user.uuid,
            'Content-Type':'application/json'
        }
    }).then(function (response) {
        return response.json();
    }).then(function (uinfo) {

        $('#sendMsg').click(function () {
            var reciversTest = [];
            reciversTest.push(uinfo);
            var messenger = new Messenger(reciversTest, "Hallo "+uinfo.firstname +" "+uinfo.lastname + ",\nich wollte Sie bitten, ob Sie uns die Rechte geben können, um Pausen einzutragen.\nDanke");
            messenger.open();
        });

        $('#profileFirstName').append(uinfo.firstname);
        $('#profileLastName').append(uinfo.lastname);
        $('#profileUsername').append(uinfo.username);

        if (uinfo.hasOwnProperty('settings')) {
            $('#cbBreakChange').prop('checked',uinfo.settings.breakChange);
            $('#cbJoinStand').prop('checked',uinfo.settings.joinStand);
            $('#cbLeaveStand').prop('checked',uinfo.settings.leaveStand);
            $('#cbDeleteStand').prop('checked',uinfo.settings.deleteStand);
            $('#cbChangeStandSetting').prop('checked',uinfo.settings.changeStandSetting);

        }

        if(uinfo.category=='student') {
            $('#profileClassroom').append(uinfo.class);
        }
        for (var key in uinfo.stand) {
            var obj = uinfo.stand[key];
            $('#profileStandArea').append('<div class="col-md-3 offset-md-1 border border-primary">' +
                '<h5 class="text-center">'+obj.name+'</h5>' +
                '<a href="standinfo.html?id='+obj.id+'">View Stand</a>'+
                '</div>');
        }
    }).catch(function (err) {
        console.log(err);
    });
});

function onChangeNotificationSetting() {
    var setting={
        breakChange: $('#cbBreakChange:checked').length > 0,
        joinStand: $('#cbJoinStand:checked').length > 0,
        leaveStand:$('#cbLeaveStand:checked').length > 0,
        deleteStand:$('#cbDeleteStand:checked').length > 0,
        changeStandSetting:$('#cbChangeStandSetting:checked').length > 0
    };

    fetch(ipAdrPupil+'/student', {
        method: 'POST',
        headers: {
            'uuid':user.uuid,
            'Content-Type':'application/json'
        },
        body: JSON.stringify(setting)
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
       console.log(data)
    }).catch(function (err) {
        console.log(err);
    });

}