var user = JSON.parse(localStorage.getItem('user'));

var sortState=0;
var studentsList=[];

$(function () {

    fetch(ipAdrPupil+'/students', {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (students) {
        studentsList = students;
            printStudents()
    }).catch(function (err) {
        console.log(err);
    });


    $('#studentFilterArea').keyup(function(event) {
        if (event.keyCode === 13) {
            $("#btnFilterStudent").click();
        }
    });


    $('input[name=sortRadioBtn]:radio').change(function() {
        changeSortMode(this.value);
    });



$('#btnFilterStudent').click(function (event) {
    fetch(ipAdrPupil+'/students?filter='+$('#studentFilterArea').val(), {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (students) {
        studentsList = students;
        printStudents()
    }).catch(function (err) {
        console.log(err);
    });
});

});

function changeSortMode(value) {
   switch (value){
       case "firstname":
           sortState=1;
           break;
       case "lastname":
           sortState=2;
           break;
       case "class":
           sortState=3;
           break;
   }
   printStudents();
}

function sortStudents(students) {
    switch (sortState){
        case 1: return students.sort(sortFirstname);
        case 2: return students.sort(sortLastname);
        case 3: return students.sort(sortClass);
        default: return students;
    }
}

function sortFirstname(student1, student2){

    if (student1.firstname < student2.firstname){
        return -1;
    }
    return 1;
}
function sortLastname(student1, student2) {
    if (student1.lastname < student2.lastname){
        return -1;
    }
    return 1;
}
function sortClass(student1, student2) {
    if (student1.class < student2.class){
        return -1;
    }
    return 1;
}

function printStudents(){

    $("#studentList").empty();
    studentsList = sortStudents(studentsList);

    for (var key in studentsList) {
        var obj = studentsList[key];
        $("#studentList").append('<a href="./profile.html?id='+obj.id+'" class="list-group-item list-group-item-action flex-column align-items-start">'+
            '<div class="d-flex w-100 justify-content-between"><h5 class="mb-1">'+obj.firstname+' '+obj.lastname+'</h5><small>'+obj.username+'</small></div><p class="mb-1">'+obj.class+'</p></a>');
    }
}