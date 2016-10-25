import * as mongoose from 'mongoose';

interface IUser extends mongoose.Document {
    email: string;
    name: string;
    lastName: string;
    username: string;
    password: string;
    displayName: string;
};

export { IUser }