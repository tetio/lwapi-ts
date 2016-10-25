import { Request, Response, Router } from "express";
import { Game, IGame, IPlayer, IGameModel, gameSchema } from './game.model';
import { ApiHandler } from './api.handler';
import { Dictionary } from './dictionary';

import * as Chance from "chance";


export class GameHandler {

    public get(req: Request, res: Response, next?: Function) {
        GameLogic.find(res, next);
    }

    public post(req: Request, res: Response, next?: Function) {
        GameLogic.createFakeGame(res, next);
    }

    // public put(req: Request, res: Response, next?: Function) {
    //     var user = new User(req.body);
    //     let result = user.save();
    //     res.send(200, result);
    // }



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
                let player: IPlayer = {id: 0, rounds: [], username: username}; 
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




    public static createFakeGame(res: Response, next?: Function) {
        var chance = new Chance();
        var game = new Game();
        const name = chance.first();
        const lastName = chance.last();
        let player: IPlayer = {id: 0, rounds: [], username: name.charAt(0).toLowerCase() + lastName.toLowerCase()}; 
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
}

