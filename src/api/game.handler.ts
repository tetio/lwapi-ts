import { Request, Response, Router } from "express";
import { Game, IGame, IPlayer, IGameModel, gameSchema } from './game.model';
import { ApiHandler } from './api.handler';
import { Dictionary } from './dictionary';
import { IGameResult } from './gameResult';
import { IWord16, Word16, Word, IWord } from './word.model';
import * as Chance from "chance";
import * as _ from "lodash";
import { ObjectID } from "mongodb";

const MAX_SPECIAL_WORDS = 874;

export class GameHandler {

    public get(req: Request, res: Response, next?: Function) {
        GameLogic.find(res, next);
    }

    public findById(req: Request, res: Response, next?: Function) {
        let id = req.body.id;
        GameLogic.findById(id, res, next);
    }

    public createNewFakeGame(req: Request, res: Response, next?: Function) {
        GameLogic.createFakeGame(res, next);
    }

    public createNewGame(req: Request, res: Response, next?: Function) {
        let username = req.body.username;
        let maxPlayers = parseInt(req.body.maxPlayers);
        let language = req.body.language;
        GameLogic.createNewGame(username, maxPlayers, language, res, next);
    }


    public joinGame(req: Request, res: Response, next?: Function) {
        let username = req.body.username;
        let language = req.body.language;
        GameLogic.joinGame(username, language, res, next);
    }




    public addWord(req: Request, res: Response, next?: Function) {
        GameLogic.addWord(req.body.username, req.body.gameId, req.body.word, res, next);
    }

    public endGame(req: Request, res: Response, next?: Function) {
        let username = req.body.username;
        let gameId = req.body.gameid;
        GameLogic.endGame(username, gameId, res, next);
    }

    public result(req: Request, res: Response, next?: Function) {
        let gameId = req.body.gameid;
        GameLogic.result(gameId, res, next);
    }

}



class GameLogic extends ApiHandler {

    public static find(res: Response, next?: Function) {
        Game.find({}, (err: any, games: IGame[]) => {
            GameLogic.handleResult(res, err, games)
        });
    }

    public static findById(id: string, res: Response, next?: Function) {
        Game.findById({ _id: id }, (err: any, game: IGame) => {
            GameLogic.handleResult(res, err, game)
        });
    }



    public static joinGame(username: string, language: string, res: Response, next?: Function) {
        GameLogic.findCreatedAndBlock(language, (err: any, existingGame: IGameModel) => {
            if (err) next(err);
            if (existingGame === null) {
                GameLogic.handleResult(res, err, existingGame);
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
        let doc = new Date();
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
        game.seed = 12;
        game.board = [];
        game.maxPlayers = 2;
        game.numPlayers = 1;
        game.state = "CREATED";
        game.save((err: any, gameDb: IGame) => {
            GameLogic.handleResult(res, err, gameDb);
        });
    }

    public static addWord(username: string, gameId: string, word: string, res: Response, next?: Function) {
        let query = { word: word };
        Word.findOne(query, (err: any, foundWord: IWord) => {
            if (err) next(err, null);
            if (!foundWord) {
                // invalid word
                GameLogic.handleResult(res, null, 0);
            } else {
                // valid word, check if it is already used
                GameLogic.isWordAlreadyUsedInGame(gameId, word, (err: any, gameWithoutWord: IGame) => {
                    if (err) next(err, null);
                    if (!gameWithoutWord) {
                        // game already has the word
                        GameLogic.handleResult(res, null, 0);
                    } else {
                        // add word to game and player
                        let player = _.find(gameWithoutWord.players, (player: IPlayer) => {
                            return (player.username === username);
                        });
                        GameLogic.addWordToPlayer(gameId, player.id, word, (err: any, updatedGame: IGame) => {
                            GameLogic.handleResult(res, null, 1);
                        });
                    }
                });
            }
        });
    }

    public static endGame(username: string, gameId: string, res: Response, next?: Function) {
        let objectId = new ObjectID(gameId);
        let query = { _id: objectId };
        let update = { state: "ENDED" };
        Game.findOneAndUpdate(query, update, { 'new': true }, (err: any, game: IGame) => {
            GameLogic.handleResult(res, err, game);
        });
    }
    

    private static isWordAlreadyUsedInGame(gameId: string, word: string, callback?: Function) {
        let objectId = new ObjectID(gameId);
        let query = { _id: objectId, usedWords: { $nin: [word] } };
        let update = { $push: { usedWords: word } };
        Game.findOneAndUpdate(query, update, { 'new': true }, (err: any, gameWithWord: IGame) => {
            if (err) callback(err, null);
            callback(null, gameWithWord);
        });
    }

    private static addWordToPlayer(gameId: string, playerId: number, word: string, callback?: Function) {
        let objectId = new ObjectID(gameId);
        let query = { _id: objectId };
        let selector = {};
        selector['players.' + playerId + '.rounds'] = word;
        Game.update(query, { $push: selector }, (err: any, updated: IGame) => {
            if (err) callback(err, null);
            callback(err, updated);
        });
    }

    public static result(gameId: string, res: Response, next?: Function) {
        var tmpScore = -1;
        var winner = "";
        Game.findById({ _id: gameId }, (err: any, game: IGame) => {
            let result: Dictionary<number> = new Dictionary<number>();
            let scores: number[] = [];
            game.players.map((player: IPlayer) => {
                let partials = player.rounds.map((word: string) => {
                    return word.length;
                });
                let score = partials.reduce((a, b) => a + b);
                scores.push(score);
                if (tmpScore < score) {
                    tmpScore = score;
                    winner = player.username;
                }
                result[player.username] = score;
            });
            let auxScores = scores.filter((a) => a === scores[0]);
            if (scores.length === auxScores.length) {
                winner = "";
            }
            GameLogic.handleResult(res, err, { winner: winner, result: result })
        });
    }

    private static fetchWord16(callback?: Function) {
        let id = Math.floor(Math.random() * MAX_SPECIAL_WORDS);
        Word16.findOne({ id: id }, (err: any, word: IWord16) => {
            if (err) return callback(err, null);
            callback(err, word);
        });
    }


}

