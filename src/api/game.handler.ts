import { Request, Response, Router } from "express";
import { Game, IGame, IPlayer, IGameModel, gameSchema } from './game.model';
import { ApiHandler } from './api.handler';
import { Dictionary } from './dictionary';
import { IWord16, Word16 } from './word.model';
import * as Chance from "chance";
import * as _ from "lodash";

const MAX_SPECIAL_WORDS = 874;

export class GameHandler {

    public get(req: Request, res: Response, next?: Function) {
        GameLogic.find(res, next);
    }

    public createNewFakeGame(req: Request, res: Response, next?: Function) {
        GameLogic.createFakeGame(res, next);
    }

    // public put(req: Request, res: Response, next?: Function) {
    //     var user = new User(req.body);
    //     let result = user.save();
    //     res.send(200, result);
    // }

    public createNewGame(req: Request, res: Response, next?: Function) {
        let username = req.body.username;
        let maxPlayers = parseInt(req.body.maxplayers);
        let language = req.body.language;
        GameLogic.createNewGame(username, maxPlayers, language, res, next);
    }


    public joinNewGame(req: Request, res: Response, next?: Function) {
        let username = req.body.username;
        let numPlayers = parseInt(req.body.numplayers);
        let language = req.body.language;
        GameLogic.joingame(username.numPlayers, language, res, next);
    }

    public joingame(req: Request, res: Response, next?: Function) {
        GameLogic.joingame(req.body.username, req.body.language, res, next);
    }
}



class GameLogic extends ApiHandler {

    public static find(res: Response, next?: Function) {
        Game.find({}, (err: any, games: IGame[]) => {
            GameLogic.handleResult(res, err, games)
        });
    }


    public static joingame(username: string, language: string, res: Response, next?: Function) {
        GameLogic.findCreatedAndBlock(language, (err: any, existingGame: IGameModel) => {
            if (err) next(err);
            if (existingGame === null) {
                next(null, null);
            } else {
                let player: IPlayer = { id: existingGame.numPlayers, rounds: [], username: username };
                existingGame.players.push(player);
                existingGame.numPlayers = existingGame.numPlayers + 1;
                if (existingGame.maxPlayers === existingGame.numPlayers) {
                    existingGame.state = 'READY';
                } else {
                    existingGame.state = 'CREATED';
                }
                existingGame.save((err: any, gameDb2: IGameModel) => {
                    GameLogic.handleResult(res, err, gameDb2);
                });
            }
        });
    }



    private static findCreatedAndBlock(language: string = "CA", callback: Function) {
        var doc = new Date();
        doc.setMinutes(doc.getMinutes() - 5);
        let query = { state: "CREATED", language: language, createdAt: { $gt: doc } };
        let update = { $set: { state: "BLOCKED" } };
        let sort = { doc: -1 };
        Game.findOneAndUpdate(query, update, { 'new': true }, (err: any, game: IGameModel) => {
            if (err) callback(err, null);
            callback(err, game);
        });
    };

    public static createNewGame(username: string, maxPlayers: number = 1, language: string = "CA", res, next) {
        GameLogic.fetchWord16((err: any, word16: IWord16) => {
            let game = new Game({ numPlayers: 1, maxPlayers: maxPlayers, language: language, createdAt: new Date(), state: "CREATED" });
            let player: IPlayer = { id: 0, rounds: [], username: username };
            game.players.push(player);
            game.seed = word16.id;
            game.board = _.shuffle(word16.word);
            game.save((err: any, gameDb: IGame) => {
                GameLogic.handleResult(res, err, gameDb);
            });
        });
    }


    public static createFakeGame(res: Response, next?: Function) {
        var chance = new Chance();
        var game = new Game();
        const name = chance.first();
        const lastName = chance.last();
        let player: IPlayer = { id: 0, rounds: [], username: name.charAt(0).toLowerCase() + lastName.toLowerCase() };
        game.players.push(player);
        game.createdAt = new Date();
        game.language = "CA";
        game.maxPlayers = 2;
        game.numPlayers = 1;
        game.state = "CREATED";
        game.save((err: any, gameDb: IGame) => {
            GameLogic.handleResult(res, err, gameDb);
        });
    }


    private static fetchWord16(callback?: Function) {
        var id = Math.floor(Math.random() * MAX_SPECIAL_WORDS);
        Word16.findOne({ id: id }, (err: any, word: IWord16) => {
            if (err) return callback(err, null);
            callback(err, word);
        });
    }
}

