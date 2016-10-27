import mongoose = require('mongoose');

interface IWord {
    word: string;
}

interface IWord16 extends IWord{
    id: number;
}

interface IWordModel extends IWord16, mongoose.Document{};

var wordSchema: mongoose.Schema = new mongoose.Schema({
    word: { type: String, required: true }
});
var word16Schema: mongoose.Schema = new mongoose.Schema({
    word: { type: String, required: true },
    id  :  {type: Number, required: true}
});

var Word = mongoose.model<IWordModel>('Word', wordSchema, "words");
var Word16 = mongoose.model<IWordModel>('GameWord', word16Schema, "words16");

export { IWord, IWord16, Word, Word16 }