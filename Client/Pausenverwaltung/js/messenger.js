var user = JSON.parse(localStorage.getItem('user'));

function Messenger(receivers, text) {
    this.receivers = receivers;
    this.text = text;

}

Messenger.prototype.open = function () {
    appendModalToBody(this);
};

Messenger.prototype.send = function () {
};

Messenger.prototype.close = function () {

};


function appendModalToBody(messenger) {
    var messengerModalID = "messengerModal";

    if ($("#" + messengerModalID).length == 0) {
        $("body").append('<div class="modal fade" id="' + messengerModalID + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content"><div class="modal-header">' +
            getSendLine(messenger.receivers) +
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            '</div>' +
            '<div class="modal-body">' +
            '<textarea id="messengerText" rows="4" class="form-control">' + messenger.text + '</textarea>' +
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
            '<button type="button" class="btn btn-primary" onclick="sendMsg()" data-dismiss="modal">Send</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');
    }
    $('#' + messengerModalID).modal('show');
}

function getSendLine(resivers) {
    var resiversStr = "";
    var dropDownStr = "";

    for (var key in resivers) {
        var user = resivers[key];
        resiversStr += user.username + " ";

        dropDownStr += '<a onclick="onAddResiver(\'' + user.username + '\')" class="dropdown-item" href="#">' + user.username + '</a>';
    }
    return '<div class="col-lg-6">\n' +
        '<div class="input-group">\n' +
        '<div class="input-group-btn">\n' +
        '<button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n' +
        'To' +
        '</button>' +
        '<div class="dropdown-menu">' +
        dropDownStr +
        '</div>' +
        '</div>' +
        '<input id="messengerReciver" type="text" class="form-control" value="' + resiversStr + '" aria-label="Text input with dropdown button">' +
        '</div>' +
        '</div>'
}

function onAddResiver(username) {
    if (getResivers().indexOf(username) == -1) {
        $('#messengerReciver').val($('#messengerReciver').val() + " " + username);
    }
}

function getResivers() {
    return $('#messengerReciver').val().split(" ");
}

function sendMsg() {

    var text = $('#messengerText').val();

    for (var key in getResivers()) {
        var reciver = getResivers()[key];
        if (reciver.length > 1) {


            fetch(ipAdrPupil + '/message', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'uuid': user.uuid
                },
                body: JSON.stringify({
                    "to": reciver,
                    "text": text
                })
            }).then(function (response) {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Nachricht zu ' + reciver + "konnte nicht gesendet werden");
            }).then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
            });


        }
    }
}

