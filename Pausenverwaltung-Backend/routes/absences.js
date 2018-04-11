var express = require('express');
var router = new express.Router();
var https = require('https');

var absenceTypes = ['guide', 'otherStand', 'ill' , 'other']; // excluding standart type "break"

router.get('/', function (req, res, next) {
    var db = req.db;
    db.collection("absences").find({}).toArray(function (err, result) {
        if (err) next(err);
        if (result.length > 0) {
            for (var idx in result) {
                result[idx].id = result[idx]._id.toString();
                delete (result[idx]._id);

                result[idx].timefrom += ":00";
                result[idx].timeto += ":00";
            }
            res.send(result);
        }
        else {
            res.status(404);
            res.send({ success: false, info: "No absence found" });
        }
    });
});
router.get('/:id', function (req, res, next) {
    var db = req.db;
    db.collection("absences").find({ "_id": require('mongodb').ObjectID(req.params.id) }).toArray(function (err, result) {
        if (err) next(err);
        if (result.length > 0) {
            result.id = result._id.toString();
            delete (result._id);

            result.timefrom += ":00";
            result.timeto += ":00";

            res.send(result);
        }
        else {
            res.status(404);
            res.send({ success: false, info: "No absence found" });
        }
    });
});
router.get('/stand/:id', function (req, res, next) {
    var db = req.db;
    forStand(req.params.id, req, res, function (stand) {
        db.collection("absences").find({ standId: req.params.id }).toArray(function (err, result) {
            if (err) next(err);
            //if (result.length > 0) {
            result = result.filter(function (r, iR, aR) { return stand.students.some(function (s, iS, aS) { return r.studentId == s.id }); });
            for (var idx in result) {
                result[idx].id = result[idx]._id.toString();
                delete (result[idx]._id);

                result[idx].timefrom += ":00";
                result[idx].timeto += ":00";
            }
            res.send(result);
            //}
            //else {
            //    res.status(404);
            //    res.send({ success: false, info: "No absence found" });
            //}
        });
    });
});
router.get('/stand/:id/:timeF', function (req, res, next) {
    var db = req.db;
    forStand(req.params.id, req, res, function (stand) {
        db.collection("absences").find({ standId: req.params.id, timefrom: req.params.timeF.substring(0, 2).padStart(2, '0') }).toArray(function (err, result) {
            if (err) next(err);
            result = result.filter(function (r, iR, aR) { return stand.students.some(function (s, iS, aS) { return r.studentId == s.id }); });
            for (var idx in result) {
                result[idx].id = result[idx]._id.toString();
                delete (result[idx]._id);

                result[idx].timefrom += ":00";
                result[idx].timeto += ":00";
            }
            res.send(result);
        });
    });
});
router.get('/stand/:id/:timeF/count', function (req, res, next) {
    var db = req.db;
    forStand(req.params.id, req, res, function (stand) {
        db.collection("absences").count({ standId: req.params.id, timefrom: req.params.timeF.substring(0, 2).padStart(2, '0') }, function (err, result) {
            if (err) next(err);
            res.send({ success: true, count: result });
        });
    });
});
router.get('/student/:id', function (req, res, next) {
    var db = req.db;
    db.collection("absences").find({ studentId: req.params.id }).toArray(function (err, result) {
        if (err) next(err);
        if (result.length > 0) {
            for (var idx in result) {
                result[idx].id = result[idx]._id.toString();
                delete (result[idx]._id);

                result[idx].timefrom += ":00";
                result[idx].timeto += ":00";
            }
            res.send(result);
        }
        else {
            res.status(404);
            res.send({ success: false, info: "No absence found" });
        }
    });
});

function forStand(standid, req, res, callback) {

    var r = https.request({
        hostname: req.standVerw,
        port: 3000,
        path: '/stands/' + standid,
        method: 'GET',
        headers: {
            'uuid': req.header('loginToken')
        }
    }, function (resp) {
        if (resp.statusCode == 200) {
            resp.setEncoding('utf8');
            var body = "";
            resp.on('data', (chunk) => {
                body += chunk;
            });
            resp.on('end', () => {
                var stand = JSON.parse(body);
                callback(stand);
            });
        }
    });
    r.on('error', function (err) {
        res.status(404);
        res.send({ success: false, info: "Stand not found" });
    });
    r.end();
}

router.put('/', function (req, res, next) {
    var db = req.db;
    if (req.body && req.body.studentId && req.body.standId && req.body.timefrom && req.body.timeto) {
        if (!req.body.type || !absenceTypes.includes(req.body.type)) req.body.type = "break";
        req.body.timefrom = (req.body.timefrom + '').substring(0, 2).padStart(2, '0');
        req.body.timeto = (req.body.timeto + '').substring(0, 2).padStart(2, '0');

        var r = https.request({
            hostname: req.standVerw,
            port: 3000,
            path: '/stands/' + req.body.standId,
            method: 'GET',
            headers: {
                'uuid': req.header('loginToken')
            }
        }, function (resp) {
            if (resp.statusCode == 200) {
                resp.setEncoding('utf8');
                var body = "";
                resp.on('data', (chunk) => {
                    body += chunk;
                });
                resp.on('end', () => {
                    var stand = JSON.parse(body);
                    var me = req.me;

                    var d = stand.deadlineDate.split('.');
                    if (me.category != "student" || new Date() < new Date(d[2], d[1] - 1, d[0])) {
                        if (me.category != "student" || stand.students.some(function (element, index, array) { return element.id == me.id })) {
                            if (me.category != "student" || me.id == req.body.studentId) {
                                if (me.category != "student" || stand.cbAllowStudentsBreak) {

                                    db.collection("absences").find({ standId: stand.id, timefrom: req.body.timefrom, timeto: req.body.timeto }).toArray(function (err, result) {
                                        if (err) next(err);
                                        result = result.filter(function (r, iR, aR) { return stand.students.some(function (s, iS, aS) { return r.studentId == s.id }); });
                                        var standKey = "time" + req.body.timefrom + req.body.timeto;
                                        if (stand.students.length - result.length > stand[standKey]) {

                                            // add break
                                            var o = {
                                                type: req.body.type,
                                                studentId: req.body.studentId,
                                                standId: req.body.standId,
                                                timefrom: req.body.timefrom,
                                                timeto: req.body.timeto
                                            };

                                            function insertAbsence() {
                                                db.collection("absences").insert(o, function (err, result) {
                                                    if (err && err.code == 11000) {
                                                        res.status(409);
                                                        res.send({ success: false, info: "student already has absence at this time" });
                                                    }
                                                    else {
                                                        if (err) next(err);
                                                        o.id = result.ops[0]._id.toString();
                                                        delete (o._id);
                                                        res.send(o);

                                                        // Send Notification to User if not PUT by him
                                                        if (req.me.id != req.body.studentId)
                                                            sendNotification(req, req.body.studentId, "breakChange", "Pause bei Stand [" + stand.name + "] wurde hinzugefügt");
                                                    }
                                                });

                                            }

                                            if (req.body.type == "break") {
                                                req.db.collection("absences").count({ studentId: req.body.studentId, standId: req.body.standId, type: req.body.type }, function (err, count) {
                                                    if (err) next(err);
                                                    if (count <= 0) {
                                                        insertAbsence();
                                                    } else {
                                                        res.status(409);
                                                        res.send({ success: false, info: "student already has break (in stand)" });
                                                    }
                                                });
                                            } else {
                                                insertAbsence();
                                            }
                                        } else {
                                            res.status(409);
                                            res.send({ success: false, info: "No Break left for this time" });
                                        }
                                    });
                                } else {
                                    res.status(403);
                                    res.send({ success: false, info: "Forbidden to add pause" });
                                }
                            } else {
                                res.status(403);
                                res.send({ success: false, info: "Forbidden to add pause from another student" });
                            }
                        } else {
                            res.status(403);
                            res.send({ success: false, info: "Forbidden: falscher Stand" });
                        }
                    } else {
                        res.status(403);
                        res.send({ success: false, info: "Forbidden: deadline is over" });
                    }
                });
            }
        });
        r.on('error', function (err) {
            res.status(404);
            res.send({ success: false, info: "Stand not found" });
        });
        r.end();
    } else {
        res.status(400);
        res.send({ success: false, info: "studentId, standId, timefrom, timeto have to be set" })
    }
});

router.post('/swapUsers/:bID1/:bID2', function (req, res, next) {   // TODO who is allowed to do that and when
    var db = req.db;
    db.collection("absences").find({ _id: require("mongodb").ObjectID(req.params.bID1) }, function (err, result) {
        if (result.length = 0) {
            res.status(404);
            res.send({ success: false, info: "first break not found" });
        } else {
            var user1 = result[0].user;
            db.collection("absences").find({ _id: require("mongodb").ObjectID(req.params.bID2) }, function (err, result) {
                if (result.length = 0) {
                    res.status(404);
                    res.send({ success: false, info: "second break not found" });
                } else {
                    var user2 = result[0].user;
                    db.collection("absences").updateOne({ _id: require("mongodb").ObjectID(req.params.bID1) }, { $set: { user: user2 } }, function (err, result) {
                        db.collection("absences").updateOne({ _id: require("mongodb").ObjectID(req.params.bID2) }, { $set: { user: user1 } }, function (err, result) {
                            res.send({ success: true, info: "Users of breaks swapped" });
                        });
                    });
                }
            });
        }
    });
});


//// TOO LAZY TO UPDATE - ISN'T USED ANYWAYS
//router.post('/', function (req, res, next) {
//    var db = req.db;
//    if (req.body && req.body.id && (req.body.studentId || req.body.standId || req.body.timefrom || req.body.timeto)) {

//        // überprüfung von stand / mindestbelegung & user is schueler, is on stand, ob berechtigt 
//        var r = https.request({
//            hostname: req.standVerw,
//            port: 3000,
//            path: '/stands/' + req.body.standId,
//            method: 'GET',
//            headers: {
//                'uuid': req.header('loginToken')
//            }
//        }, function (resp) {
//            if (res.statusCode == 200) {
//                resp.setEncoding('utf8');
//                var body = "";
//                resp.on('data', (chunk) => {
//                    body += chunk;
//                });
//                resp.on('end', () => {
//                    var stand = JSON.parse(body);
//                    var d = stand.deadlineDate.split('.');
//                    if (new Date() < new Date(d[2], d[1] - 1, d[0])) {
//                        if (req.me.category != "student" || stand.students.some(function (element, index, array) { return element.id == req.me.id })) {
//                            if (req.me.category != "student" || req.me.id == req.body.studentId) {
//                                if (req.me.category != "student" || stand.cbAllowStudentsBreak) {
//                                    db.collection("absences").find({ standId: stand.id, timefrom: req.body.timefrom, timeto: req.body.timeto }).toArray(function (err, result) {
//                                        if (err) next(err);
//                                        result = result.filter(function (r, iR, aR) { return stand.students.some(function (s, iS, aS) { return r.studentId == s.id }); });
//                                        var standKey = ("time" + (req.body.timefrom).substring(0, 2) + (req.body.timeto).substring(0, 2));
//                                        if (stand.students.length - result.length > stand[standKey]) {

//                                            // update break

//                                            var o = { };
//                                            //if (req.body.studentId) o.studentId = req.body.studentId;
//                                            //if (req.body.standId) o.standId = req.body.standId;
//                                            if (req.body.timefrom) o.timefrom = req.body.timefrom;
//                                            if (req.body.timeto) o.timeto = req.body.timeto;

//                                            db.collection("absences").update({ _id: require('mongodb').ObjectID(req.body.id) }, { $set: o }, function (err, result) {
//                                                if (err && err.code == 11000) res.sendStatus(409);
//                                                else {
//                                                    db.collection("absences").find({ "_id": require('mongodb').ObjectID(req.body.id) }).toArray(function (err, result) {
//                                                        if (err) next(err);
//                                                        res.send(result);


//                                                        // Send Notification to User if not PUT by him
//                                                        if (req.me.id != req.body.studentId)
//                                                            sendNotification(req, req.body.studentId, "breakChange", "Pause bei Stand [" + stand.name + "] wurde geändert");

//                                                    });
//                                                }
//                                            });

//                                            //

//                                        } else {
//                                            res.status(409);
//                                            res.send({ success: false, info: "No Break left for this time" });
//                                        }
//                                    });
//                                } else {
//                                    res.status(403);
//                                    res.send({ success: false, info: "Forbidden to update pause" });
//                                }
//                            } else {
//                                res.status(403);
//                                res.send({ success: false, info: "Forbidden to update pause from another student" });
//                            }
//                        } else {
//                            res.status(403);
//                            res.send({ success: false, info: "Forbidden: falscher Stand" });
//                        }
//                    } else {
//                        res.status(403);
//                        res.send({ success: false, info: "Forbidden: deadline is over" });
//                    }
//                });
//            }
//        });
//        r.on('error', function (err) {
//            res.status(404);
//            res.send({ success: false, info: "Stand not found" });
//        });
//        r.end();
//    } else {
//        res.status(400);
//        res.send({ success: false, info: "ID and one of studentId, standId, timefrom, timeto have to be set" })
//    }
//});

router.delete('/:id', function (req, res, next) {
    var db = req.db;
    var o = { "_id": require('mongodb').ObjectID(req.params.id) };
    if (req.me.category == "student") o.studentId = req.me.id;

    db.collection("absences").find(o).toArray(function (err, breaks) {
        if (err) next(err);
        if (req.me.category != "student" && breaks.length > 0 || breaks.length > 0) {
            var r = https.request({
                hostname: req.standVerw,
                port: 3000,
                path: '/stands/' + breaks[0].standId,
                method: 'GET',
                headers: {
                    'uuid': req.header('loginToken')
                }
            }, function (resp) {
                if (resp.statusCode == 200) {
                    resp.setEncoding('utf8');
                    var body = "";
                    resp.on('data', (chunk) => {
                        body += chunk;
                    });
                    resp.on('end', () => {
                        var stand = JSON.parse(body);
                        var d = stand.deadlineDate.split('.');
                        if (new Date() < new Date(d[2], d[1] - 1, d[0])) {
                            if (req.me.category != "student" || stand.students.some(function (element, index, array) { return element.id == req.me.id })) {
                                if (req.me.category != "student" || stand.cbAllowStudentsBreak) {

                                    db.collection("absences").find({ _id: require('mongodb').ObjectID(req.params.id) }).toArray(function (err, result) {
                                        if (result.length > 0) {
                                            // remove break
                                            db.collection("absences").deleteOne({ _id: require('mongodb').ObjectID(req.params.id) }, function (err, obj) {
                                                if (err) next(err);
                                                if (obj.deletedCount > 0) {
                                                    res.send({ success: true, info: "1 break deleted" });

                                                    // Send Notification to User
                                                    if (req.me.id != result[0].studentId)
                                                        sendNotification(req, result[0].studentId, "breakChange", "Pause bei Stand [" + stand.name + "] wurde entfernt");
                                                }
                                                else {
                                                    res.status(404);
                                                    res.send({ success: false, info: "break to delete not found" })
                                                }
                                            });
                                        }
                                        else {
                                            res.status(404);
                                            res.send({ success: false, info: "break not found" })
                                        }
                                    });

                                } else {
                                    res.status(403);
                                    res.send({ success: false, info: "Forbidden to remove pause" });
                                }
                            } else {
                                res.status(403);
                                res.send({ success: false, info: "Forbidden: falscher Stand" });
                            }
                        } else {
                            res.status(403);
                            res.send({ success: false, info:"Forbidden: deadline is over"});
                        }
                    });
                }
            });
            r.on('error', function (err) {
                res.status(404);
                res.send({ success: false, info: "Stand not found" });
            });
            r.end();
        } else {
            res.status(403);
            res.send({ success: false, info: "Forbidden to remove pause" });
        }
    });

});

function sendNotification(req, userId, setting, text) {
    var r = https.request({
        "host": req.standVerw,
        "port": 3000,
        "path": "/students/" + userId,
        "method": "GET",
        "headers": {
            "uuid": req.header('loginToken')
        }
    }, function (response) {
        var user = '';
        response.on('data', function (chunk) {
            user += chunk;
        });
        response.on('end', function () {
            user = JSON.parse(user);
            if (user && user.settings && user.settings[setting]) {
                var message = {
                    to: userId,
                    text: text
                };

                https.request({
                    "host": req.standVerw,
                    "port": 3000,
                    "path": "/message",
                    "method": "PUT",
                    "headers": {
                        "uuid": req.header('loginToken'),
                        "Content-Type": "application/json",
                    }
                }, function (response) {
                    var str = ''
                    response.on('data', function (chunk) {
                        str += chunk
                    });
                    response.on('end', function () {

                    });
                }).end(JSON.stringify(message));
            }
        });
    });
    r.on('error', function (err) {
        res.status(404);
        res.send({ success: false, info: "User not found" });
    });
    r.end();
}

router.put('/auto/:standId', function (req, res, next) {
    var db = req.db;
    var overwrite = req.body.overwrite == true;
    var r = https.request({
        hostname: req.standVerw,
        port: 3000,
        path: '/stands/' + req.params.standId,
        method: 'GET',
        headers: {
            'uuid': req.header('loginToken')
        }
    }, function (resp) {
        if (resp.statusCode == 200) {
            resp.setEncoding('utf8');
            var body = "";
            resp.on('data', (chunk) => {
                body += chunk;
            });
            resp.on('end', () => {
                var stand = JSON.parse(body);
                if (stand && stand.students) {
                    var d = stand.deadlineDate.split('.');
                    var deadlinover = new Date() >= new Date(d[2], d[1] - 1, d[0]);

                    if ((req.me.category != "student" && !deadlinover) || (deadlinover && !overwrite)) {
                        db.collection("absences").find({ type: "break", standId: req.params.standId }).toArray(function (err, results) {
                            if (err) next(err);
                            if (overwrite) {
                                db.collection("absences").deleteMany({ type: "break", standId: req.params.standId }, function (err, r) {
                                    results = [];
                                    insertAgain();
                                });
                            } else {
                                insertAgain();
                            }

                            function insertAgain() {
                                var students = stand.students.filter(function (student, index, array) {
                                    return !results.some(function (absence, resindex, resarray) {
                                        return student.id == absence.studentId;
                                    });
                                });
                                var allStudents = students.length;
                                someRecursiveShit();
                                function someRecursiveShit(iSt = 0, failsave = 0) {
                                    if (iSt < allStudents) {
                                        var time = Math.floor(Math.random() * (16 - 9)) + 9;
                                            db.collection("absences").insertOne({
                                                type: "break",
                                                standId: req.params.standId,
                                                studentId: students[iSt].id,
                                                timefrom: (time < 10 ? "0" : "") + time,
                                                timeto: (time < 9 ? "0" : "") + (time + 1)
                                            }, function (err, result) {
                                                if (err && err.code == 11000) {
                                                    if (failsave <= 18) someRecursiveShit(iSt, failsave + 1);
                                                    else someRecursiveShit(iSt + 1);
                                                }
                                                else if (err) { next(err); }
                                                else {
                                                    someRecursiveShit(iSt + 1);
                                                }
                                            });

                                    } else {
                                        res.send({ success: true, info: "autoassignment done" });
                                    }
                                }
                            //    for (var i = 0; i < allStudents * 2 && students.length > 0; i++) {
                            //        for (var j = 9; j < 16; j++) {
                            //            var time = "time" + (j < 10 ? "0" : "") + j + "" + (j < 9 ? "0" : "") + (j + 1);
                            //            if (students.length > 0 && allStudents - results.filter(function (e, i, a) { return e.timefrom == (j < 10 ? "0" : "") + j; }).length > stand[time]) {
                            //                var student = students.pop();
                            //                results.push({ timefrom: (j < 10 ? "0" : "") + j });


                            //                db.collection("absences").insert({
                            //                    type: "break",
                            //                    standId: req.params.standId,
                            //                    studentId: student.id,
                            //                    timefrom: (j < 10 ? "0" : "") + j,
                            //                    timeto: (j < 9 ? "0" : "") + (j + 1)
                            //                });
                            //            }
                            //        }
                            //    }
                            }
                        });

                    } else {
                        res.status(403);
                        res.send({ success: false, info: "Forbidden to auto-assign breaks" });
                    }
                } else {
                    res.status(404);
                    res.send({ success: false, info: "No Students assigned to stand" });
                }
            });
        }
    });
    r.on('error', function (err) {
        res.status(404);
        res.send({ success: false, info: "Stand not found" });
    });
    r.end();
});

module.exports = router;
