import * as http from "http";
import * as url from "url";
import * as express from "express";
import * as logger from 'morgan';
import * as bodyParser from "body-parser";
import errorHandler = require("errorhandler");

import mongoose = require('mongoose');

//import { errorhandler } from "@types/errorhandler";
//import methodOverride = require("method-override");

import { Users } from "./api/user.handler";
import { GameHandler } from "./api/game.handler";

var app = express();
const PORT: number = 6061;
const users = new Users();
const gameHandler = new GameHandler();
const router = express.Router();

router.use(bodyParser.json());
router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// User
router.get('/user/', users.get);
router.post('/user/', users.post);
router.get('/user/:id', users.getUser);
router.post('/user/filter', users.filter);
// Game
router.get('/game', gameHandler.get);
router.post('/game', gameHandler.createNewGame);
router.post('/game/fake', gameHandler.createNewFakeGame);
router.post('/game/joinGame', gameHandler.joinGame);
router.post('/game/addWord', gameHandler.addWord);
router.post('/game/findById', gameHandler.findById);
router.post('/game/endGame', gameHandler.endGame);
router.post('/game/result', gameHandler.result);

app.use('/api', router);
//app.use('/', express.static(__dirname + '/public'));
app.use(logger('dev'));

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    app.use(errorHandler());
}

app.listen(PORT, function () {

    var dbURI = require('./env.json')[process.env.NODE_ENV || 'local']["MONGO_URI"];
    var dbOptions = {
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    };
    mongoose.Promise = global.Promise;
    mongoose.connect(dbURI, dbOptions);

    //console.log("Demo Express server listening on port %d in %s mode", 3000, app.settings.env);
    console.log("Letter and Words backend server listening on port %d in %s mode", PORT, process.env.NODE_ENV || 'local');
});

var App = app;
