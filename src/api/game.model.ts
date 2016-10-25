
import mongoose = require('mongoose');

class IPlayer {
    username: string;
    id: number;
    rounds: string[];
}

interface IGame {
    createdAt: Date;
    language: string;
    numPlayers: number;
    maxPlayers: number;
    state: string;
    board: string[];
    usedWords: string[];
    players: IPlayer[];
}


interface IGameModel extends IGame, mongoose.Document{};

var playerSchema: mongoose.Schema = new mongoose.Schema({
    username  :  {type: String, required: true},
    id  :  {type: Number, required: true},
    rounds  :  {type: [String], required: false}
}, {_id: false});

var gameSchema: mongoose.Schema = new mongoose.Schema({
    createdAt  :  {type: Date, required: true},
    language  :  {type: String, required: true},
    numPlayers  :  {type: Number, required: true},
    maxPlayers  :  {type: Number, required: true},
    state  :  {type: String, required: true},
    board  :  {type: [String], required: false},
    usedWords  :  {type: [String], required: false},
    players  :  {type: [playerSchema], required: true}
});

var Game = mongoose.model<IGameModel>('Game', gameSchema);

//export default const User = mongoose.model<IUser>('User', UserSchema);

export {Game, IPlayer, IGame, IGameModel, gameSchema};
