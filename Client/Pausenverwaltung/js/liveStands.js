var user = JSON.parse(localStorage.getItem('user'));
var stands=[];

$(function() {
    fetch(ipAdrPupil+'/stands', {
        method: 'GET',
        headers: {
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        stands=data;
        for (var key in data) {
            var obj = data[key];
            $("#dragArea").append('<div id="'+obj.id+'" class="draggable"></div>');
        }
    }).then(function () {
        $('.draggable').draggable();
        showInformation();
    });
});


function showInformation() {
    var stand = stands[Math.floor(Math.random()*stands.length)];
    $('.draggable').removeClass("red");
    fetch(ipAdrPupil+'/stands/'+stand.id, {
        method: 'GET',
        headers: {
            'Content-Type':'application/json',
            'uuid':user.uuid
        }
    }).then(function (response) {
        return response.json();
    }).then(function (innerStand) {
        $('#'+stand.id).addClass("red");
        var d = new Date();

        fetch(ipAdrBreak+'/absences/stand/'+stand.id+"/"+d.getHours(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type':'application/json',
                'loginToken':user.uuid
            }
        }).then(function (response) {
            return response.json();
        }).then(function (data) {

		var studentList ="<br>Keine Vortragenden";
		
		if(innerStand.students && innerStand.students.length>0){
            studentList="<br>Vortragende: ";
            for (const student of innerStand.students) {
                var found = true;
                for (const breakObj of data) {
                    if (student.id == breakObj.studentId) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    studentList += student.firstname + ' ' + student.lastname +" - " ;
                }
            }
            studentList = studentList.substring(0, studentList.length - 2)+"</ul>";	
		}
            $('#standInfo').empty();
            $('#standInfo').append("<h1>"+innerStand.name+"</h1>");
            $('#standInfo').append("<p>"+innerStand.description+"</p>");
			if(innerStand.students){
            $('#standInfo').append(innerStand.students.length+" Schüler eingeteilt. Derzeit abwesend: "+data.length);
            }
			
			$('#standInfo').append(studentList);
            setTimeout(showInformation, 5000);
        }).catch(function (err) {
            console.log(err);
        });



    });

}

