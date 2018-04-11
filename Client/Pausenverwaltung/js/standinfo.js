var user = JSON.parse(localStorage.getItem('user'));

const newPauseName="Neu";
const setPauseName ="Pause";

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
stand={};

$(".alert").alert();

$(function() {

    if(id == 0) {
        location.href = "stand.html"
    }else{
        loadStand();
    }
});

function loadStand(){
    fetch(ipAdrPupil+'/stands/'+id, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (innerStand) {
        delete stand.backlink;
        stand = innerStand;

        $('#headingStand').text('Stand: '+innerStand.name);


        if(user.category=='teacher'&&isInStand()||user.category=='admin') {

            if(getDeadLineDateObj(innerStand.deadlineDate) < new Date()){
                $('#btnStandSettingTab').remove();
                $('#standSettingTab').remove();
            }else{
                setOptionValues(innerStand);
            }

            restoreFilterStudent();
            restoreFilterTeacher();

            initAutoGenerateBreak();
        }else {
            $('#btnStandSettingTab').remove();
            $('#standSettingTab').remove();
            $('#btnFindNewStudent').remove();
            $('#btnFindNewTeacher').remove();
        }

        filterStudents();
        filterTeacher();


        if(getDeadLineDateObj(innerStand.deadlineDate) < new Date()){
            checkGenerateBreak(innerStand);
        }

        if(innerStand.description.length>0) {
        $("#standDescriptionTab").append('<h6>Titel</h6><h4 id="standname">'+innerStand.name+'</h4>' +
            '<h6>Beschreibung</h6><p id="standdescription">'+innerStand.description+'</p>');
        }else{
            $("#standDescriptionTab").append('<h6>Titel</h6><h4 id="standname">'+innerStand.name+'</h4>');
        }
        $("#standDescriptionTab").append('<div class="clock" id="livetime"></div>');
        $("#standDescriptionTab").append('<div id="livePupilList"></div>');


        console.log(innerStand);

        generateBreakList(innerStand.students);
        loadStudents(innerStand.students);
        loadTeacher(innerStand.teachers);
        loadJoinLeaveStand();
        liveStandData();
    });
    changeStandEvents();
}

function setOptionValues(innerStand){
    $('#tfStandTitle').val(innerStand.name);
    $('#taStandDescription').val(innerStand.description);
    $('#deadlineDate').val(innerStand.deadlineDate);
    $('#time0910').val(innerStand.time0910);
    $('#time1011').val(innerStand.time1011);
    $('#time1112').val(innerStand.time1112);
    $('#time1213').val(innerStand.time1213);
    $('#time1314').val(innerStand.time1314);
    $('#time1415').val(innerStand.time1415);
    $('#time1516').val(innerStand.time1516);
    $('#cbAllowStudentsBreak').prop('checked', innerStand.cbAllowStudentsBreak);
    $('#cbAllowStudentsJoin').prop('checked', innerStand.cbAllowStudentsJoin);
    $('#cbAllowStudentsLeave').prop('checked', innerStand.cbAllowStudentsLeave);
}

function filterStudents(){
    $('#btnModalFilterCancel').click(function (event) {
        restoreFilterStudent();
    });
    $('#btnModalFilter').click(function (event) {
        var filter = $('#newFirstName').val()
            +" "+$('#newLastName').val()
            +" "+$('#newUsername').val()
            +" "+$('#newClassRoom').val();

        fetch(ipAdrPupil+'/students?filter='+filter, {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
                'uuid':user.uuid
            }
        }).then(function (response) {
            return response.json();
        }).then(function (students) {

            $('#filterContainer').html('');

            for (var key in students) {
                var obj = students[key];
                $('#filterContainer').append('<a href="#" onclick="addStudentToStand(\'' + obj.id + '\')" class="list-group-item list-group-item-action flex-column align-items-start">'+
                    '<div class="d-flex w-100 justify-content-between"><h5 class="mb-1">'+obj.firstname+' '+obj.lastname+'</h5><small>'+obj.username+'</small></div><p class="mb-1">'+obj.class+'</p></a>');
            }
        }).catch(function (err) {
            console.log(err);
        });
    });
}

function filterTeacher() {
    $('#btnModalFilterCancelTeacher').click(function (event) {
        restoreFilterTeacher();
    });
    $('#btnModalFilterTeacher').click(function (event) {
        var filter = $('#newFirstNameTeacher').val()
            +" "+$('#newLastNameTeacher').val()
            +" "+$('#newUsernameTeacher').val();

        fetch(ipAdrPupil+'/teachers?filter='+filter, {
            method: 'GET',
            headers: {
                'Content-Type':'application/json',
                'uuid':user.uuid
            }
        }).then(function (response) {
            return response.json();
        }).then(function (teacher) {
            $('#filterContainerTeacher').html('');

            for (var key in teacher) {
                var obj = teacher[key];
                $('#filterContainerTeacher').append('<a href="#" onclick="addStudentToStand(\'' + obj.id + '\')" class="list-group-item list-group-item-action flex-column align-items-start">'+
                    '<div class="d-flex w-100 justify-content-between"><h5 class="mb-1">'+obj.firstname+' '+obj.lastname+'</h5><small>'+obj.username+'</small></div></a>');
            }
        }).catch(function (err) {
            console.log(err);
        });
    });
}

function changeStandEvents(){

     $('#tfStandTitle').on('input',function (e) {
        changeStand();
     });

    $('#taStandDescription').on('input',function (e) {
        changeStand();
    });

    $('#deadlineDate').on('input',function(e){
        changeStand();
    });

    $('#time0910').on('input',function(e){
        changeStand();
    });

    $('#time1011').on('input',function(e){
        changeStand();
    });

    $('#time1112').on('input',function(e){
        changeStand();
    });

    $('#time1213').on('input',function(e){
        changeStand();
    });

    $('#time1314').on('input',function(e){
        changeStand();
    });

    $('#time1415').on('input',function(e){
        changeStand();
    });

    $('#time1516').on('input',function(e){
        changeStand();
    });

    $('#cbAllowStudentsBreak').change(function(){
        changeStand();
    });

    $('#cbAllowStudentsJoin').change(function(){
        changeStand();
    });

    $('#cbAllowStudentsLeave').change(function(){
        changeStand();
    });
}

function addStudentToStand(userid){
    console.log("add Student to stand");
    console.log(userid);

    fetch(ipAdrPupil+'/stands/'+stand.id+'/user', {
        method: 'PUT',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        },
        body: JSON.stringify({
            "id":userid})
    }).then(function (response) {
        if(response.ok) {
            return response.json();
        }
    }).then(function (data) {
                //TODO
        console.log(data);
        location.reload();
    }).catch(function (err) {
        console.log(err);
    });
}

function restoreFilterStudent(){
    $('#filterContainer').html('<div class="row"><h5>Filter</h5></div>'+
        '<div class="row"><div class="col-sm-6"><label>Vorname:</label></div><div class="col-sm-6"><input id="newFirstName" class="form-control" type="text" placeholder="Vorname"></div></div>' +
        '<div class="row"><div class="col-sm-6"><label>Nachname:</label></div><div class="col-sm-6"><input id="newLastName" class="form-control" type="text" placeholder="Nachname"></div></div>' +
        '<div class="row"><div class="col-sm-6"><label>Username:</label></div><div class="col-sm-6"><input id="newUsername" class="form-control" type="text" placeholder="Username"></div></div>' +
        '<div class="row"><div class="col-sm-6"><label>Klasse:</label></div><div class="col-sm-6"><input id="newClassRoom" class="form-control" type="text" placeholder="Klasse"></div></div>');
}

function restoreFilterTeacher(){
    $('#filterContainerTeacher').html('<div class="row"><h5>Filter</h5></div>'+
        '<div class="row"><div class="col-sm-6"><label>Vorname:</label></div><div class="col-sm-6"><input id="newFirstNameTeacher" class="form-control" type="text" placeholder="Vorname"></div></div>' +
        '<div class="row"><div class="col-sm-6"><label>Nachname:</label></div><div class="col-sm-6"><input id="newLastNameTeacher" class="form-control" type="text" placeholder="Nachname"></div></div>' +
        '<div class="row"><div class="col-sm-6"><label>Username:</label></div><div class="col-sm-6"><input id="newUsernameTeacher" class="form-control" type="text" placeholder="Username"></div></div>');
}

function checkGenerateBreak(stand){
    fetch(ipAdrBreak+'/break/auto/'+stand.id, {
        method: 'PUT',
        headers: {
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.blob();
    }).then(function (data) {
    });
}

function getDeadLineDateObj(datel){
    if(typeof deadlineDate == 'undefined'){
    return new Date('Feb.01.2019');
    }
        var parts = datel.split(".");
    var dt = new Date(parseInt(parts[2], 10),
        parseInt(parts[1], 10) - 1,
        parseInt(parts[0], 10));

    return new Date(dt);
}

function changeStand(){
    var canSave = true;

    var deadlineDate = $('#deadlineDate').val();
    if(typeof deadlineDate == 'undefined') {
        canSave=false;
    }else{
        var now = new Date();
        var deadlineDateObj = getDeadLineDateObj(deadlineDate);
        var lastDay = new Date('Feb 2 2019');

        if (isValidDate(deadlineDate) && deadlineDateObj > now && deadlineDateObj < lastDay) {
            $('#deadlineDate').removeClass("border-danger");
            $('#deadlineDate').attr('style', 'border-width: thin');

        } else {
            $('#deadlineDate').removeClass("border-success");
            $('#deadlineDate').addClass("border-danger");

            canSave=false;
        }
    }

    var name = $('#tfStandTitle').val();
    if(name&&name.length>0){
        $('#tfStandTitle').removeClass("border-danger");
    }else{
        $('#tfStandTitle').removeClass("border-success");
        $('#tfStandTitle').addClass("border-danger");
        canSave=false;
    }

    var description = $('#taStandDescription').val();
    if(description&&description.length>0){
        $('#taStandDescription').removeClass("border-danger");
    }else{
        $('#taStandDescription').removeClass("border-success");
        $('#taStandDescription').addClass("border-danger");
        canSave=false;
    }

    var time0910 = $('#time0910').val();
    if(time0910&&time0910.length>0 && time0910>=0){
        $('#time0910').removeClass("border-danger");
    }else{
        $('#time0910').removeClass("border-success");
        $('#time0910').addClass("border-danger");
        canSave=false;
    }

    var time1011 = $('#time1011').val();
    if(time1011&&time1011.length>0 && time1011>=0){
        $('#time1011').removeClass("border-danger");
    }else{
        $('#time1011').removeClass("border-success");
        $('#time1011').addClass("border-danger");
        canSave=false;
    }
    var time1112 = $('#time1112').val();
    if(time1112&&time1112.length>0 && time1112>=0){
        $('#time1112').removeClass("border-danger");
    }else{
        $('#time1112').removeClass("border-success");
        $('#time1112').addClass("border-danger");
        canSave=false;
    }
    var time1213 = $('#time1213').val();
    if(time1213&&time1213.length>0 && time1213>=0){
        $('#time1213').removeClass("border-danger");
    }else{
        $('#time1213').removeClass("border-success");
        $('#time1213').addClass("border-danger");
        canSave=false;
    }
    var time1314 = $('#time1314').val();
    if(time1314&&time1314.length>0 && time1314>=0){
        $('#time1314').removeClass("border-danger");
    }else{
        $('#time1314').removeClass("border-success");
        $('#time1314').addClass("border-danger");
        canSave=false;
    }
    var time1415 = $('#time1415').val();
    if(time1415&&time1415.length>0 && time1415>=0){
        $('#time1415').removeClass("border-danger");
    }else{
        $('#time1415').removeClass("border-success");
        $('#time1415').addClass("border-danger");
        canSave=false;
    }
    var time1516 = $('#time1516').val();
    if(time1516&&time1516.length>0 && time1516>=0){
        $('#time1516').removeClass("border-danger");
    }else{
        $('#time1516').removeClass("border-success");
        $('#time1516').addClass("border-danger");
        canSave=false;
    }

    if(canSave) {
        $('#btnSaveSettings').removeClass('invisible');
    }else{
        $('#btnSaveSettings').addClass('invisible');
    }
}

function saveStand(){
    var cbAllowStudentsBreak =  ($('#cbAllowStudentsBreak').is(':checked')) ? true:false;
    var cbAllowStudentsJoin =  ($('#cbAllowStudentsJoin').is(':checked')) ? true:false;
    var cbAllowStudentsLeave =  ($('#cbAllowStudentsLeave').is(':checked')) ? true:false;


    var name =  $('#tfStandTitle').val();
    var description = $('#taStandDescription').val();

    var deadlineDate = $('#deadlineDate').val();
    var time0910 = $('#time0910').val();
    var time1011 = $('#time1011').val();
    var time1112 = $('#time1112').val();
    var time1213 = $('#time1213').val();
    var time1314 = $('#time1314').val();
    var time1415 = $('#time1415').val();
    var time1516 = $('#time1516').val();


    stand.id=id;
    stand.cbAllowStudentsBreak = cbAllowStudentsBreak;
    stand.cbAllowStudentsJoin = cbAllowStudentsJoin;
    stand.cbAllowStudentsLeave = cbAllowStudentsLeave;

    var now = new Date();
    var deadlineDateObj =  getDeadLineDateObj(deadlineDate);
    var lastDay = new Date('Feb 2 2019');
    if(isValidDate(deadlineDate) && deadlineDateObj > now && deadlineDateObj < lastDay) {
        stand.deadlineDate = deadlineDate;
    }

    stand.time0910 = time0910;
    stand.time1011 = time1011;
    stand.time1112 = time1112;
    stand.time1213 = time1213;
    stand.time1314 = time1314;
    stand.time1415 = time1415;
    stand.time1516 = time1516;

    stand.name = name;
    stand.description = description;

    $('#btnSaveSettings').addClass('invisible');

    fetch(ipAdrPupil+'/stands', {
        method: 'POST',
        headers: {
            'uuid':user.uuid,
            'Content-Type':'application/json'
        },
        body: JSON.stringify(stand)
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data);
        location.reload();
    });
}

function generateBreakRow(time, students, minCountStudent) {
    var row = '<tr> <th scope="row">'+time+'</th>';

    row+= '<td scope="row" class="d-none d-md-block">'+minCountStudent+'</td>';

    if((stand.cbAllowStudentsBreak||user.category=='teacher')&&isInStand()||user.category=='admin') {
        for (var key in students) {
            var student = students[key];
            var info = time + "#" + student.id;
            row += '<td><button id="' + info + '" onclick="appendDirectionModalBreakOptionToBody(this.id)" class="btn btn-outline-secondary btn-block">'+newPauseName+'</button></td>';
        }
    }else{
        for (var key in students) {
            var student = students[key];
            var info = time + "#" + student.id;
            row += '<td><lable id="' + info + '" class="form-control">'+newPauseName+'</lable></td>';
        }
    }

    row += '</tr>';
return row;
}

function generateBreakHead(students){
    var thead = ' <tr> <th scope="col">Time</th><th scope="col" class="d-none d-md-block">Min</th>';
    for (var key in students) {
        var student = students[key];
        thead+= '<th scope="col">'+student.lastname+' '+student.firstname.charAt(0)+'</th>';
    }
    return thead+'</tr>';
}

function generateBreakList(students) {

    var tableBody = generateBreakRow('09:00-10:00',students,stand.time0910)+
        generateBreakRow('10:00-11:00',students,stand.time1011)+
        generateBreakRow('11:00-12:00',students,stand.time1112)+
        generateBreakRow('12:00-13:00',students,stand.time1213)+
        generateBreakRow('13:00-14:00',students,stand.time1314)+
        generateBreakRow('14:00-15:00',students,stand.time1415)+
        generateBreakRow('15:00-16:00',students,stand.time1516);

    $('#theadBreaks').append(generateBreakHead(students));
    $('#tbodyBreaks').append(tableBody);

    fetch(ipAdrBreak+'/absences/stand/'+stand.id, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type':'application/json',
            'loginToken':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        for(var key in data) {
            var studentBreak = data[key];
            var breakbtnID = studentBreak.timefrom + "-"+studentBreak.timeto +"#"+studentBreak.studentId;
            changeAddBreakBtnToBreakBtn(breakbtnID,studentBreak.type);
            document.getElementById(breakbtnID).setAttribute("breakID",studentBreak.id)
        }

    }).catch(function (err) {
        console.log(err);
    });

}

function changeAddBreakBtnToBreakBtn(breakbtnID,type="break"){
    document.getElementById(breakbtnID).classList.remove('btn-outline-secondary');


    if(type=="break") {
        document.getElementById(breakbtnID).classList.add('btn-primary');
        document.getElementById(breakbtnID).textContent = setPauseName;
    }

    if(type=="guide") {
        document.getElementById(breakbtnID).classList.add('btn-success');
        document.getElementById(breakbtnID).textContent = "Guide";

    }

    if(type=="otherStand") {
        document.getElementById(breakbtnID).classList.add('btn-secondary');
        document.getElementById(breakbtnID).textContent = "Anderer Stand";

    }

    if(type=="ill") {
        document.getElementById(breakbtnID).classList.add('btn-dark');
        document.getElementById(breakbtnID).textContent = "Krank";

    }

    if(type=="other") {
        document.getElementById(breakbtnID).classList.add('btn-info');
        document.getElementById(breakbtnID).textContent = "Sonstiges";

    }

    if((stand.cbAllowStudentsBreak||user.category=='teacher')&&isInStand()||user.category=='admin') {
        document.getElementById(breakbtnID).setAttribute("onClick", "removeBreak(this.id);");
    }
}

function changeBreakBtnToAddBreakBtn(breakbtnID){
    document.getElementById(breakbtnID).classList.add('btn-outline-secondary');
    document.getElementById(breakbtnID).classList.remove('btn-primary');
    document.getElementById(breakbtnID).classList.remove('btn-success');
    document.getElementById(breakbtnID).classList.remove('btn-light');
    document.getElementById(breakbtnID).classList.remove('btn-dark');
    document.getElementById(breakbtnID).classList.remove('btn-info');


    document.getElementById(breakbtnID).textContent = newPauseName;
    document.getElementById(breakbtnID).setAttribute( "onClick", "appendDirectionModalBreakOptionToBody(this.id);" );
}

function removeBreak(info) {
    var breakID = document.getElementById(info).getAttribute("breakID");
        fetch(ipAdrBreak+'/absences/'+breakID, {
        method: 'DELETE',
        headers: {
            'Content-Type':'application/json',
            'loginToken':user.uuid
        }
    }).then(function (response) {
        if(response.ok) {
            changeBreakBtnToAddBreakBtn(info);
            return response.blob();
        }
        throw new Error('Pause konnte nicht entfernt werden');
    }).catch(function (err) {
        addBreakAlert(err);
    });
}

function initAutoGenerateBreak(){
    $('#btnAutoBreak').click(function () {
        var override = $('#cbBreackOverrride').is(':checked');
        console.log(override);

        fetch(ipAdrBreak+'/break/auto/'+stand.id, {
            method: 'PUT',
            headers: {
                'Content-Type':'application/json',
                'loginToken':user.uuid
            },
            body: JSON.stringify({
                "overwrite": override
                })
        }).then(function (response) {
            if(response.ok) {
                return response.blob();
            }
            throw new Error('Auto generation of pause failed');
        }).then(function (data) {
            location.reload();
        }).catch(function (err) {
            console.log(err)
        });
    });
}

function addBreak(info) {
    var infos = info.split('#');
    var time = infos[0];
    var times = time.split("-");
    var timeFrom = times[0];
    var timeto = times[1];
    var userID = infos[1];
    var type = infos[2];

    var btnID=time+"#"+userID;
    var standID = id;

    fetch(ipAdrBreak+'/absences', {
        method: 'PUT',
        headers: {
            'Content-Type':'application/json',
            'loginToken':user.uuid
        },
        body: JSON.stringify({
            "studentId":userID,
            "standId":standID,
            "timefrom":timeFrom,
            "timeto":timeto,
            "type":type})
    }).then(function (response) { 
        if(response.ok) {
            changeAddBreakBtnToBreakBtn(btnID,type);
        }
        return response.json();
}).then(function (data) {
    if(data.id){
        document.getElementById(btnID).setAttribute("breakID",data.id)
    }else {
        addBreakAlert(data.info);
    }

    }).catch(function (err) {
        console.log(err);
        addBreakAlert(err);
    });
}

function addBreakAlert(msg){
    $('#errorBreak').text(msg);
    $('#errorBreak').addClass("show");
    setTimeout(function() {
        $('#errorBreak').removeClass('show');
    },2500);
}

function loadStudents(students){
    for (var key in students) {
        var student = students[key];
        if(user.category=='student'){
            $('#standStudentList').append('' +
                '<a href="profile.html?id='+student.id+'" class="list-group-item list-group-item-action">'+student.firstname+' '+student.lastname+'</a>');
        }else{
            $('#standStudentList').append('' +
                '<a href="#" onclick="appendDirectionModalUserToBody(\'' +student.id+ '\')" class="list-group-item list-group-item-action">'+student.firstname+' '+student.lastname+'</a>');
        }
    }
}

function appendDirectionModalUserToBody(id) {
    var directionModal = "directionStudentModal";

    if ($("#" + directionModal).length == 0) {
        $("body").append('<div class="modal fade" id="' + directionModal + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content"><div class="modal-header">' +
            '<h4>Navigation</h4>'+
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            '</div>' +
            '<div class="modal-body">' +
            '<a href="profile.html?id='+id+'" class="btn btn-primary btn-block">Profil</a>'+
            '<a href="#" onclick="onRemoveUserFromStand(\''+id+'\')" class="btn btn-primary btn-block">Entferne User</a>'+

            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');
    }
    $('#' + directionModal).modal('show');
}

function appendDirectionModalBreakOptionToBody(info) {
    var breakModal = "breakOptionModal";
    if ($("#" + breakModal).length == 0) {
        $("body").append('<div class="modal fade" id="' + breakModal + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog" role="document">' +
            '<div class="modal-content"><div class="modal-header">' +
            '<h4>Abwesenheitsgrund</h4>'+
            '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
            '</button>' +
            '</div>' +
            '<div class="modal-body">' +
            '<a href="#" onclick="addBreak(\''+info+'#break'+'\')" data-dismiss="modal" class="btn btn-primary btn-block">Pause</a>'+
            '<a href="#" onclick="addBreak(\''+info+'#guide'+'\')" data-dismiss="modal" class="btn btn-success btn-block">Guide</a>'+
            '<a href="#" onclick="addBreak(\''+info+'#otherStand'+'\')" data-dismiss="modal" class="btn btn-secondary btn-block">Anderer Stand</a>'+
            '<a href="#" onclick="addBreak(\''+info+'#ill'+'\')" data-dismiss="modal" class="btn btn-dark btn-block">Krank</a>'+
            '<a href="#" onclick="addBreak(\''+info+'#other'+'\')" data-dismiss="modal" class="btn btn-info btn-block">Anderes</a>'+
            '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');
    }else{
        $("#" + breakModal).remove();
        appendDirectionModalBreakOptionToBody(info);
    }
    $('#' + breakModal).modal('show');
}

function loadTeacher(teachers) {
    for (var key in teachers) {
        var teacher = teachers[key];
        if (user.category == 'student') {
            $('#standTeacherList').append('' +
                '<a href="profile.html?id=' + teacher.id + '" class="list-group-item list-group-item-action">' + teacher.firstname + ' ' + teacher.lastname + '</a>');
        } else {
            $('#standTeacherList').append('' +
                '<a href="#" onclick="appendDirectionModalUserToBody(\'' +teacher.id+ '\')"  class="list-group-item list-group-item-action">' + teacher.firstname + ' ' + teacher.lastname + '</a>');
        }
    }
}

function isValidDate(s) {
    var separators = ['\\.', '\\-', '\\/'];
    var bits = s.split(new RegExp(separators.join('|'), 'g'));
    var d = new Date(bits[2], bits[1] - 1, bits[0]);
    return d.getFullYear() == bits[2] && d.getMonth() + 1 == bits[1];
}

function isInStand(){
    var students = stand.students;
    for(var key in students) {
        var student = students[key];
        if(student.id == user.id){
            return true;
        }
    }

    var teachers = stand.teachers;
    for(var key in teachers) {
        var teacher = teachers[key];
        if(teacher.id == user.id){
            return true;
        }
    }

    return false;
}

function onJoinStand(){
    fetch(ipAdrPupil+'/stands/'+stand.id+'/user', {
        method: 'PUT',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        },
        body: JSON.stringify({
            "id":user.id})
    }).then(function (response) {
        if(response.ok) {
            return response.json();
        }
        throw new Error("could not join the stand");
    }).then(function (data) {
        console.log(data);
        location.reload();
    }).catch(function (err) {
        console.log(err);
    });
}

function onRemoveUserFromStand(userid) {
    console.log("remove user from Stand");
    fetch(ipAdrPupil+'/stands/'+stand.id+'/user', {
        method: 'DELETE',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        },
        body: JSON.stringify({
            "id":userid})
    }).then(function (response) {
        console.log(response);
        return response.json();
    }).then(function (data) {
        console.log(data);
        location.reload();
    }).catch(function (err) {
        console.log(err);
    });
}

function onLeaveStand(){
    fetch(ipAdrPupil+'/stands/'+stand.id+'/user', {
        method: 'DELETE',
        headers: {
            'Content-Type':'application/json',
            uuid:user.uuid
        },
        body: JSON.stringify({
            "id":user.id})
    }).then(function (response) {
        console.log(response);
        return response.json();
    }).then(function (data) {
        console.log(data);
        location.reload();
    }).catch(function (err) {
        console.log(err);
    });
}

function loadJoinLeaveStand(){
    if((user.category == 'student' && stand.cbAllowStudentsJoin)&&!isInStand() || user.category=='teacher' && !isInStand()){
        $('#standOptionList').append('<a ' +
            'class="list-group-item list-group-item-danger" ' +
            'data-toggle="list" ' +
            'href="#" onclick="onJoinStand()" >Stand beitreten </a>\n');
    }

    if((user.category == 'student' && stand.cbAllowStudentsLeave)&&isInStand()|| user.category=='teacher'&& isInStand()){
        $('#standOptionList').append('<a ' +
            'class="list-group-item list-group-item-danger" ' +
            'data-toggle="list" ' +
            'href="#" onclick="onLeaveStand()" >Stand verlassen </a>\n');
    }
}


function liveStandData(){
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();

    h=checkTime(h);
    m=checkTime(m);
    var students = stand.students;
    fetch(ipAdrBreak+'/absences/stand/'+stand.id+"/"+h, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type':'application/json',
            'loginToken':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        document.getElementById("livetime").innerHTML = h + ":" + m;
        var studentList="<h5>Vortragende</h5><ul class='list-group'>";
            for (const student of students) {
                var found = true;
                for (const breakObj of data) {
                    if (student.id == breakObj.studentId) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    studentList += '<a href="profile.html?id='+student.id+'" class="list-group-item list-group-item-action">' + student.firstname + ' ' + student.lastname + '</a>';
                }
            }

        studentList+"</ul>";
        document.getElementById("livePupilList").innerHTML = studentList;
        setTimeout(liveStandData, 30000);
    }).catch(function (err) {
        console.log(err);
    });

}
function checkTime(i) {
    if (i < 10) {
        i = "0" + i
    }  // add zero in front of numbers < 10
    return i;
}