var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var cors = require('cors');

var db;

var port = 3001;
var standVerwaltung = 'localhost';

var MongoClient = require('mongodb').MongoClient;

var app = express();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    next();
});

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());
app.use(cors({ origin: true, credentials: true }));
app.options('*', cors()); // include before other routes

app.use(function (req, res, next) {
    req.standVerw = standVerwaltung;
    req.db = db;
    next();
});

var https = require('https');
app.use(function (req, res, next) { 
    if (req.header('loginToken')) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //allow self wrote certificate
        var r = https.request({
            hostname: standVerwaltung,
            port: 3000,
            path: '/login/me',
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
                    req.me = JSON.parse(body);
                    next();
                });
            } else {
                res.status(401);
                res.send({ success: false, info: "Authentifizierung ist fehlgeschlagen" });
            }
        });
        r.on('error', function (err) { 
            res.status(401);
            res.send({ success: false, info: "Authentifizierung ist fehlgeschlagen" });
        });
        r.end();
    } else {
        res.status(401);
        res.send({ success: false, info: "Authentifizierung ist fehlgeschlagen" });
    }
});

app.use(['/absences', '/break'], require('./routes/absences'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
   // res.render('error');
    res.send({ success: false, error: err.status==404?"Not Found":err });
});

process.on('uncaughtException', function (err) {
    console.log(err);
});

MongoClient.connect('mongodb://127.0.0.1:27017/absences-management', (err, database) => {
    if (err) throw err;
    db = database;

    db.collection("absences").ensureIndex({ studentId: 1, standId: 1, timefrom: 1, timeto: 1 }, { unique: true });

    app.listen(port, () => {
        console.log("Listen to port " + port);
    });
});