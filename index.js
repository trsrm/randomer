'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs-extra');
var _ = require('underscore');

// ----------------------------------------------------------------------------

var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));

// ----------------------------------------------------------------------------

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// ----------------------------------------------------------------------------

app.all('/', function (req, res) {
    var result;
    if (req.body && req.body.login && req.body.password) {
        var list = fs.readJsonSync('data/people.json');
        var login = req.body.login.trim();
        var password = req.body.password.trim();
        if (list[login] && list[login].password === password) {
            if (list[login].done === false) {
                var random = _.chain(list).omit(login).pairs().reject(function (item) {
                    return item[1].booked === true;
                }).shuffle().first().value();
                if (random) {
                    list[login].done = true;
                    list[random[0]].booked = true;
                    fs.writeJsonSync('data/people.json', list, {spaces: 2});
                    result = 'Тобі випало: <strong>' + random[1].name + '</strong>';
                }
            } else {
                result = 'Ти вже знаєш, що тобі випало :)';
            }
        }
    }
    res.render('pages/index', {result: result});
});

// ----------------------------------------------------------------------------

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});
